"use client";

import TestClient from '@/components/test-client';
import { MCQ } from '@/lib/types';
import { ProtectedRoute } from '@/components/protected-route';

interface TestClientWrapperProps {
  grade: string;
  subject: string;
  chapterTitle: string;
  chapterMcqs: MCQ[];
  basePath: string;
}

export default function TestPageClient({
  grade,
  subject,
  chapterTitle,
  chapterMcqs,
  basePath,
}: TestClientWrapperProps) {
  return (
    <ProtectedRoute>
      <TestClient 
        grade={grade}
        subject={subject}
        chapterTitle={chapterTitle} 
        chapterMcqs={chapterMcqs} 
        basePath={basePath}
      />
    </ProtectedRoute>
  );
}
