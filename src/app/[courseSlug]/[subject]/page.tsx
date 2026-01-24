
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { useParams } from "next/navigation";

const createSlug = (title: string) => {
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export default function DynamicSubjectChaptersPage() {
    const params = useParams();
    const courseSlug = params.courseSlug as string;
    const subjectSlug = params.subject as string;

    const [chapters, setChapters] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const subjectName = subjectSlug.charAt(0).toUpperCase() + subjectSlug.slice(1).replace(/-/g, ' ');

    useEffect(() => {
        const fetchChapters = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/courses/${courseSlug}/${subjectSlug}/chapters`);
                const data = await response.json();

                if (data.success) {
                    setChapters(data.chapters);
                } else {
                    setError(data.error || "Failed to load chapters");
                }
            } catch (err) {
                setError("An error occurred while fetching chapters");
            } finally {
                setLoading(false);
            }
        };

        fetchChapters();
    }, [courseSlug, subjectSlug]);

    return (
        <ProtectedRoute>
            <div className="bg-background text-foreground">
                <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-primary capitalize">
                            {courseSlug.toUpperCase()} {subjectName}
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                            {loading ? "Loading chapters..." : "Select a chapter to begin your test preparation."}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground font-medium">Fetching chapters from database...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                            <h3 className="text-xl font-bold mb-2">Oops! Something went wrong</h3>
                            <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
                            <Button onClick={() => window.location.reload()}>Try Again</Button>
                        </div>
                    ) : chapters.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground text-lg">No chapters found for this subject yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {chapters.map((chapter) => (
                                <Card key={chapter} className="flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <CardTitle className="text-xl font-semibold">{chapter}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-muted-foreground">Practice MCQs and review key concepts for {chapter}.</p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild className="w-full transition-transform duration-300 hover:scale-105">
                                            <Link href={`/${courseSlug}/${subjectSlug}/${createSlug(chapter)}`}>
                                                Start Test <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </ProtectedRoute>
    );
}
