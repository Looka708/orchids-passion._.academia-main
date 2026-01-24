
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, FlaskConical, Languages, Atom, Dna, Brain, Laptop, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";

// Icon mapping helper
const getSubjectIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('math')) return Brain;
    if (n.includes('physics')) return Atom;
    if (n.includes('chemistry')) return FlaskConical;
    if (n.includes('biology')) return Dna;
    if (n.includes('english')) return BookOpen;
    if (n.includes('personality')) return ShieldCheck;
    if (n.includes('intelligence')) return Brain;
    if (n.includes('verbal')) return Languages;
    if (n.includes('science')) return FlaskConical;
    if (n.includes('knowledge')) return BookOpen;
    return HelpCircle;
};

const getSubjectDescription = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('biology')) return "Core biological concepts including botany and zoology.";
    if (n.includes('physics')) return "Fundamental physics principles from mechanics to modern physics.";
    if (n.includes('chemistry')) return "Organic, inorganic, and physical chemistry essentials.";
    if (n.includes('english')) return "Grammar, vocabulary, and verbal reasoning skills.";
    if (n.includes('math')) return "Mathematical reasoning and problem-solving techniques.";
    if (n.includes('intelligence')) return "Verbal and non-verbal reasoning to assess cognitive abilities.";
    if (n.includes('knowledge')) return "Current affairs and general knowledge and awareness.";
    return "Specialized test preparation for the entrance exam.";
};

export default function DynamicCoursePage() {
    const params = useParams();
    const courseSlug = params.courseSlug as string;

    const [subjects, setSubjects] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [courseName, setCourseName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch subjects
                const subResponse = await fetch(`/api/courses/${courseSlug}/subjects`);
                const subData = await subResponse.json();
                if (subData.success) {
                    setSubjects(subData.subjects);
                }

                // Fetch course name
                const classResponse = await fetch("/api/classes");
                const classData = await classResponse.json();
                if (classData.success) {
                    const currentClass = classData.data.find((c: any) => c.slug === courseSlug);
                    if (currentClass) {
                        setCourseName(currentClass.name);
                    } else {
                        setCourseName(courseSlug.toUpperCase());
                    }
                }
            } catch (err) {
                console.error(`Failed to fetch ${courseSlug} data`);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseSlug]);

    return (
        <ProtectedRoute>
            <div className="bg-background text-foreground">
                <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-primary uppercase">
                            {courseName} Preparation
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                            Expert-led preparation and comprehensive mock tests for {courseName} students.
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    ) : subjects.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground text-lg">No subjects found for this course yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
                                                <Link href={`/${courseSlug}/${subject.toLowerCase().replace(/ /g, '-')}`}>
                                                    Start Prep <ArrowRight className="ml-2 h-4 w-4" />
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
