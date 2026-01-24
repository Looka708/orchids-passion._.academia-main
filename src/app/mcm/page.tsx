
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, FlaskConical, Languages, Atom, Dna, Brain, Laptop, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  if (n.includes('general science')) return FlaskConical;
  if (n.includes('general knowledge')) return BookOpen;
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

export default function GenericCoursePage() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const courseType = pathname.split('/')[1].toLowerCase();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${courseType}/subjects`);
        const data = await response.json();

        if (data.success) {
          setSubjects(data.subjects);
        }
      } catch (err) {
        console.error(`Failed to fetch ${courseType} subjects`);
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [courseType]);

  return (
    <ProtectedRoute>
      <div className="bg-background text-foreground">
        <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-primary uppercase">
              {courseType} Test Preparation
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Expert-led preparation and comprehensive mock tests for {courseType.toUpperCase()} entrance exams.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
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
                        <Link href={`/${courseType}/${subject.toLowerCase().replace(/ /g, '-')}`}>
                          Start Test <ArrowRight className="ml-2 h-4 w-4" />
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
