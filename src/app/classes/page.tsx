
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, ArrowRight, Plane, FlaskConical, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { useState, useEffect } from "react";
import type { ClassRecord } from "@/lib/types";

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case 'GraduationCap': return GraduationCap;
    case 'Plane': return Plane;
    case 'FlaskConical': return FlaskConical;
    case 'ShieldCheck': return ShieldCheck;
    default: return HelpCircle;
  }
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch('/api/classes?category=academic');
        const data = await res.json();
        if (data.success) {
          setClasses(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch classes", err);
      } finally {
        setLoading(false);
      }
    }
    fetchClasses();
  }, []);

  return (
    <ProtectedRoute>
      <div className="bg-background text-foreground">
        <section className="container mx-auto px-4 py-12 sm:py-16 md:py-24">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-primary">
              Grades 6-12 Tutoring
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Comprehensive academic support for students across all major subjects to help them excel in their studies.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {classes.map((item) => {
                const Icon = getIcon(item.icon);
                return (
                  <Card key={item.id} className="flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl font-semibold">{item.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground">{item.description}</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full transition-transform duration-300 hover:scale-105">
                        <Link href={`/classes/${item.slug}`}>
                          View Subjects <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section className="bg-muted py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Unlock Your Child's Potential
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Our experienced tutors provide personalized attention and a supportive learning environment to help students build confidence and achieve academic excellence.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="transition-transform duration-300 hover:scale-105">
                <Link href="/contact">
                  Enroll Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
