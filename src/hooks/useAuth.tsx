
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { verifyUserInSheet } from '@/app/actions';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { getUserByEmail } from '@/lib/users';
import type { User } from '@/lib/users';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Attempt to load user from localStorage synchronously to avoid flicker
    try {
      const storedUser = localStorage.getItem('passion-academia-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('passion-academia-user');
    }
    // Set loading to false after initial check, onAuthStateChanged will update if needed
    setIsLoading(false);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        // If user is logged in with Firebase, fetch their profile from Firestore
        const userProfile = await getUserByEmail(firebaseUser.email!);
        setUser(userProfile);
        if (userProfile) {
          localStorage.setItem('passion-academia-user', JSON.stringify(userProfile));
        } else {
          // This case can happen if user is in Auth but not Firestore, log them out.
          await signOut(auth);
          setUser(null);
          localStorage.removeItem('passion-academia-user');
        }
      } else {
        // If not logged in with Firebase, check for the default admin user in localStorage
        const storedUser = localStorage.getItem('passion-academia-user');
        if (storedUser) {
          const parsedUser: User | null = JSON.parse(storedUser);
          if (!(parsedUser && (parsedUser.role === 'owner' || parsedUser.role === 'admin') && parsedUser.email === "admin@passion-academia.com")) {
            setUser(null);
            localStorage.removeItem('passion-academia-user');
          } else {
            setUser(parsedUser);
          }
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    // First, try to sign in with Firebase Auth
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await getUserByEmail(userCredential.user.email!);

      // Owners and admins can always log in, regular users must be active
      if (userProfile?.role !== 'owner' && userProfile?.role !== 'admin' && !userProfile?.active) {
        await signOut(auth);
        throw new Error("Your account is inactive. Please contact an administrator.");
      }

      setUser(userProfile);
      if (userProfile) {
        localStorage.setItem('passion-academia-user', JSON.stringify(userProfile));
      }
      if (userProfile?.role === 'owner' || userProfile?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      return;
    } catch (error: any) {
      // If Firebase Auth fails, check against the custom admin user in Firestore
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        const result = await verifyUserInSheet(email, password);
        if (result.success && result.name && result.email && result.course && result.role) {
          // Owner and admin role check allows login regardless of active status
          if (result.role !== 'owner' && result.role !== 'admin' && !result.active) {
            throw new Error("Your account is inactive. Please contact an administrator.");
          }

          const userData: User = {
            name: result.name,
            email: result.email,
            password: '', // Don't store password in context
            course: result.course,
            role: result.role as 'owner' | 'admin' | 'teacher' | 'user',
            active: result.active ?? true, // Default to active
          };
          setUser(userData);
          localStorage.setItem('passion-academia-user', JSON.stringify(userData));
          if (userData.role === 'owner' || userData.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/');
          }
          return;
        }
        // If firebase auth fails and custom auth also fails
        if (error.code === 'auth/user-not-found' || result.success === false) {
          throw new Error("Account not found. Please contact an administrator to get an account.");
        }
        throw new Error("Invalid email or password.");
      }
      console.error("Login error:", error);
      throw new Error(error.message || "An unexpected error occurred during login.");
    }
  };

  const refreshUser = async () => {
    if (firebaseUser?.email) {
      const userProfile = await getUserByEmail(firebaseUser.email);
      setUser(userProfile);
      if (userProfile) {
        localStorage.setItem('passion-academia-user', JSON.stringify(userProfile));
      }
    } else if (user?.email) {
      // For non-Firebase users (like the admin), refresh from Firestore
      const userProfile = await getUserByEmail(user.email);
      setUser(userProfile);
      if (userProfile) {
        localStorage.setItem('passion-academia-user', JSON.stringify(userProfile));
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem('passion-academia-user');
    router.push('/signin');
  };

  const value = {
    user,
    firebaseUser,
    isAuthenticated: !!user || !!firebaseUser,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
