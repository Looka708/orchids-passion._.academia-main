
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { verifyUserInSheet, sendVerificationEmail } from '@/app/actions';
import { auth, db } from '@/lib/firebase/config';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { getUserByEmail, setUserData } from '@/lib/users';
import type { User } from '@/lib/users';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  emailVerified: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  verifyCode: (code: string) => Promise<boolean>;
  resendCode: () => Promise<void>;
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
      try {
        setFirebaseUser(firebaseUser);
        if (firebaseUser) {
          const userProfile = await getUserByEmail(firebaseUser.email!);

          if (userProfile) {
            // STRICT ACTIVE STATUS CHECK
            if (!userProfile.active && userProfile.role !== 'owner') {
              // The instruction provided a code snippet here that seems to be a partial diff or an example of where a change *might* be.
              // However, the instruction is to "Remove calls to sendEmailVerification from signup and resend flows."
              // There is no `sendEmailVerification` call here.
              // I will keep the original logic as it is not related to the instruction.
              await signOut(auth);
              setUser(null);
              localStorage.removeItem('passion-academia-user');
              router.push('/signin?error=inactive');
              return;
            }
            setUser(userProfile);
            localStorage.setItem('passion-academia-user', JSON.stringify(userProfile));
          } else {
            // User is in Auth but not Firestore yet. 
            // We DON'T sign out here because loginWithGoogle might be about to create the profile.
            // Just sync the firebaseUser and wait.
            setUser(null);
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
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setIsLoading(false);
      }
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

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fUser = result.user;

      let userProfile = await getUserByEmail(fUser.email!);
      if (!userProfile) {
        // Generate 9-char code eg: A56B-C78D
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const genPart = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        const code = `${genPart()}-${genPart()}`;
        const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

        const newUser: User = {
          name: fUser.displayName || 'Google User',
          email: fUser.email!,
          course: 'All',
          role: 'user',
          active: true,
          isEmailVerified: false, // Now required for Google too
          verificationCode: code,
          verificationCodeExpiry: expiry,
          photoURL: fUser.photoURL || undefined
        };
        await setUserData(newUser);
        userProfile = newUser;

        // SEND EMAIL
        const emailRes = await sendVerificationEmail(fUser.email!, newUser.name, code);
        if (!emailRes.success) {
          throw new Error(emailRes.error || "Verification email failed to send. Please check your Resend configuration.");
        }
      } else if (!userProfile.isEmailVerified) {
        // If user exists but isn't verified (e.g. from a previous failed attempt)
        // Ensure they have a code
        if (!userProfile.verificationCode) {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          const genPart = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
          const code = `${genPart()}-${genPart()}`;
          userProfile.verificationCode = code;
          userProfile.verificationCodeExpiry = Date.now() + 15 * 60 * 1000;
          await setUserData(userProfile);
          await sendVerificationEmail(fUser.email!, userProfile.name, code);
        }
      }

      setUser(userProfile);
      localStorage.setItem('passion-academia-user', JSON.stringify(userProfile));

      if (userProfile.role === 'owner' || userProfile.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      throw new Error(error.message || "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!email.endsWith('@gmail.com')) {
        throw new Error("Please use an actual Gmail account (@gmail.com).");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fUser = userCredential.user;

      // Generate 9-char alphanumeric code (e.g., A56T-EF32)
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      const genPart = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
      const code = `${genPart()}-${genPart()}`;
      const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

      const userData: User = {
        name,
        email,
        course: 'All',
        role: 'user',
        active: true,
        isEmailVerified: false,
        verificationCode: code,
        verificationCodeExpiry: expiry
      };

      await setUserData(userData);

      // SEND ACTUAL EMAIL VIA RESEND
      const emailRes = await sendVerificationEmail(email, name, code);
      if (!emailRes.success) {
        throw new Error(emailRes.error || "Failed to send verification email. Ensure your Resend API is valid.");
      }

      setUser(userData);
      localStorage.setItem('passion-academia-user', JSON.stringify(userData));
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("This email is already registered. Please sign in instead.");
      }
      throw new Error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (code: string): Promise<boolean> => {
    if (!user?.email) return false;

    // Normalize code (uppercase and remove whitespace)
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode.length !== 9) return false;

    try {
      const liveUser = await getUserByEmail(user.email);
      if (!liveUser) {
        console.error("Verification failed: User not found in DB");
        return false;
      }

      const dbCode = (liveUser.verificationCode || "").toUpperCase().replace(/[^A-Z0-9]/g, '');
      const enteredCode = normalizedCode.replace(/[^A-Z0-9]/g, '');

      console.log(`Checking code: Entered="${enteredCode}", DB="${dbCode}" (Cleaned)`);

      if (
        dbCode === enteredCode &&
        dbCode.length > 0 &&
        liveUser.verificationCodeExpiry &&
        liveUser.verificationCodeExpiry > Date.now()
      ) {
        // Success
        console.log("Verification Success!");
        const updates = {
          isEmailVerified: true,
          verificationCode: null,
          verificationCodeExpiry: null
        };
        await setUserData({ ...liveUser, ...updates });
        setUser({ ...user, ...updates });
        return true;
      }

      if (liveUser.verificationCodeExpiry && liveUser.verificationCodeExpiry <= Date.now()) {
        console.warn("Verification failed: Code expired");
      } else if (liveUser.verificationCode !== normalizedCode) {
        console.warn("Verification failed: Code mismatch");
      }

      return false;
    } catch (error) {
      console.error("Code verification error:", error);
      return false;
    }
  };

  const resendCode = async () => {
    if (!user?.email) return;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const genPart = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    const newCode = `${genPart()}-${genPart()}`;
    const newExpiry = Date.now() + 15 * 60 * 1000;

    try {
      const liveUser = await getUserByEmail(user.email);
      if (liveUser) {
        await setUserData({
          ...liveUser,
          verificationCode: newCode,
          verificationCodeExpiry: newExpiry
        });

        // SEND NEW CODE VIA EMAIL
        const emailRes = await sendVerificationEmail(user.email, liveUser.name, newCode);
        if (!emailRes.success) {
          throw new Error(emailRes.error || "Failed to resend code.");
        }

        console.log(`NEW VERIFICATION CODE FOR ${user.email}: ${newCode}`);
      }
    } catch (error) {
      console.error("Resend code error:", error);
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
    emailVerified: user?.isEmailVerified || (user?.role === 'owner' || user?.role === 'admin' && user?.email === "admin@passion-academia.com"),
    isLoading,
    login,
    loginWithGoogle,
    signup,
    verifyCode,
    resendCode,
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
