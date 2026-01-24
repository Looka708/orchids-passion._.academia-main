
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowRight, Loader2, AlertCircle, Sigma, Book, Languages, Atom, FlaskConical, Dna, Laptop, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { useParams } from "next/navigation";

// Subject to Icon mapping
const getSubjectIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('math')) return Sigma;
    if (n.includes('english')) return Book;
    if (n.includes('urdu')) return Languages;
    if (n.includes('physics')) return Atom;
    if (n.includes('chemistry')) return FlaskConical;
    if (n.includes('biology')) return Dna;
    if (n.includes('computer')) return Laptop;
    return Brain;
};

const getSubjectDescription = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('math')) return "Master formulas and equations with our comprehensive problem sets.";
    if (n.includes('english')) return "Enhance your grammar, vocabulary, and literary skills.";
    if (n.includes('urdu')) return "Strengthen your Urdu literature and grammar fundamentals.";
    if (n.includes('physics')) return "Explore the laws of nature, from mechanics to electromagnetism.";
    if (n.includes('chemistry')) return "Understand matter, reactions, and the building blocks of life.";
    if (n.includes('biology')) return "Study the science of life, from cells to ecosystems.";
    if (n.includes('computer')) return "Build foundational programming and digital technology skills.";
    return "Comprehensive test preparation for your upcoming exams.";
};

export default function DynamicGradePage() {
    const params = useParams();
    const grade = params.grade as string;

    const [subjects, setSubjects] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setLoading(true);
                // If grade is just a number, prefix it with 'class-'. If it already has it or is a custom slug, use it directly.
                const courseKey = /^\d+$/.test(grade) ? `class-${grade}` : grade;
                const response = await fetch(`/api/courses/${courseKey}/subjects`);
                const data = await response.json();

                if (data.success) {
                    setSubjects(data.subjects);
                } else {
                    setError(data.error || "Failed to load subjects");
                }
            } catch (err) {
                setError("Failed to load subjects from database.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubjects();
    }, [grade]);

    return (
        <ProtectedRoute>
            <div className="bg-background text-foreground">
                <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-primary capitalize">
                            {grade.includes('class') ? grade.replace('-', ' ') : `Class ${grade}`} Subjects
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                            {loading ? "Discovering subjects..." : "Comprehensive preparation for your board exams."}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                            <p className="text-muted-foreground">Fetching subjects...</p>
                        </div>
                    ) : subjects.length === 0 ? (
                        <div className="text-center py-20">
                            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground text-lg">No subjects found for Class {grade}.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {subjects.map((subject) => {
                                const Icon = getSubjectIcon(subject);
                                return (
                                    <Card key={subject} className="flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                                        <CardHeader className="flex flex-row items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <CardTitle className="text-xl font-semibold capitalize">{subject}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-muted-foreground">{getSubjectDescription(subject)}</p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button asChild className="w-full transition-transform duration-300 hover:scale-105">
                                                <Link href={`/classes/${grade}/${subject.toLowerCase()}`}>
                                                    View Chapters <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </ProtectedRoute>
    );
}
