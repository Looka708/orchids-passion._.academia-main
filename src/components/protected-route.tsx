
"use client";

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  examGeneratorOnly?: boolean; // Only owners can access, not teachers
}

export function ProtectedRoute({ children, adminOnly = false, examGeneratorOnly = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/signin');
      } else if (adminOnly && user?.role !== 'owner' && user?.role !== 'teacher') {
        router.push('/'); // Redirect non-owners/non-teachers from admin routes
      } else if (examGeneratorOnly && user?.role !== 'owner') {
        router.push('/'); // Redirect non-owners (including teachers) from exam generator
      }
    }
  }, [isLoading, isAuthenticated, user, adminOnly, examGeneratorOnly, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (adminOnly && user?.role !== 'owner' && user?.role !== 'teacher') {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Access Denied</p>
      </div>
    );
  }

  if (examGeneratorOnly && user?.role !== 'owner') {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Access Denied - Exam Generator is Owner Only</p>
      </div>
    );
  }

  return <>{children}</>;
}
