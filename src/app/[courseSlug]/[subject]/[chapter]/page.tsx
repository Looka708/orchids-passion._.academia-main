
"use client";

import { useEffect, useState } from "react";
import TestPageClient from '@/components/test-client-wrapper';
import { MCQ } from '@/lib/types';
import { notFound, useParams } from 'next/navigation';
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import QuizLoading from "@/components/quiz/QuizLoading";

const createSlug = (title: string) => {
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export default function DynamicChapterTestPage() {
    const params = useParams();
    const courseSlug = params.courseSlug as string;
    const subjectSlug = params.subject as string;
    const chapterSlug = params.chapter as string;

    const [chapterTitle, setChapterTitle] = useState<string | null>(null);
    const [mcqs, setMcqs] = useState<MCQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const subjectDisplay = subjectSlug.charAt(0).toUpperCase() + subjectSlug.slice(1).replace(/-/g, ' ');

    useEffect(() => {
        const fetchChapterData = async () => {
            try {
                setLoading(true);

                // 1. Fetch chapters to find the real title matching the slug
                const chaptersRes = await fetch(`/api/courses/${courseSlug}/${subjectSlug}/chapters`);
                const chaptersData = await chaptersRes.json();

                if (!chaptersData.success) {
                    setError(chaptersData.error || "Failed to load chapters");
                    return;
                }

                const foundTitle = chaptersData.chapters.find((ch: string) => createSlug(ch) === chapterSlug);

                if (!foundTitle) {
                    setError("not-found");
                    return;
                }

                setChapterTitle(foundTitle);

                // 2. Fetch MCQs for this specific chapter
                const mcqsRes = await fetch(`/api/mcqs?course_type=${courseSlug}&subject=${subjectSlug}&chapter=${encodeURIComponent(foundTitle)}`);
                const mcqsData = await mcqsRes.json();

                if (mcqsData.success) {
                    // Deduplicate MCQs to clean up existing "old" duplicates
                    const uniqueMcqs = mcqsData.mcqs.filter((mcq: any, index: number, self: any[]) =>
                        index === self.findIndex((m) => (
                            m.question_text === mcq.question_text &&
                            JSON.stringify(m.options) === JSON.stringify(mcq.options)
                        ))
                    );

                    const mappedMcqs: MCQ[] = uniqueMcqs.map((m: any) => ({
                        id: m.question_number,
                        questionText: m.question_text,
                        questionImage: m.question_image,
                        options: Array.from(new Set(m.options)), // Deduplicate options for old MCQs
                        correctAnswer: m.correct_answer,
                        language: m.language
                    }));

                    setMcqs(mappedMcqs);
                } else {
                    setError(mcqsData.error || "Failed to load MCQs");
                }

            } catch (err) {
                setError("An error occurred while connecting to the database");
            } finally {
                setLoading(false);
            }
        };

        fetchChapterData();
    }, [courseSlug, subjectSlug, chapterSlug]);

    if (error === "not-found") {
        return notFound();
    }

    if (loading || !animationComplete) {
        return <QuizLoading onComplete={() => setAnimationComplete(true)} />;
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
                <AlertCircle className="h-16 w-16 text-destructive mb-4" />
                <h2 className="text-2xl font-bold mb-2">Error Loading Test</h2>
                <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
        );
    }

    const basePath = `/${courseSlug}/${subjectSlug}`;

    return (
        <TestPageClient
            grade={courseSlug.toUpperCase()}
            subject={subjectDisplay}
            chapterTitle={chapterTitle || ""}
            chapterMcqs={mcqs}
            basePath={basePath}
        />
    );
}
