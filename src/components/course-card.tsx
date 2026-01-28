
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, ArrowRight } from "lucide-react";
import type { Course } from "@/lib/types";
import { Button } from "./ui/button";

interface CourseCardProps {
  course: Course;
}

const courseLinks: Record<string, string> = {
  'Grades 6-12 Tutoring': '/classes',
  'AFNS Test Preparation': '/afns',
  'PAF Cadet Test Prep': '/paf',
  'MCJ/MCM Entrance Prep': '/mcj',
}

export default function CourseCard({ course }: CourseCardProps) {
  const link = courseLinks[course.title] || '#';
  return (
    <Card className="flex h-full transform flex-col overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <CardHeader className="p-0">
        <Link href={link} className="block">
          <Image
            src={course.image}
            alt={course.title}
            width={600}
            height={400}
            className="h-48 w-full object-cover"
            data-ai-hint={course.dataAiHint}
          />
        </Link>
      </CardHeader>
      <CardContent className="flex-grow p-6">
        <Badge variant="secondary" className="mb-2 bg-accent/20 text-accent">
          {course.category}
        </Badge>
        <CardTitle className="text-xl mb-2">
          <Link href={link} className="hover:text-primary transition-colors">
            {course.title}
          </Link>
        </CardTitle>
        <CardDescription>{course.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex-col items-start gap-4 p-6 pt-0">
        <div className="flex w-full justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{course.students.toLocaleString()} Students</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span>{course.rating}</span>
          </div>
        </div>
        <Button asChild className="w-full">
          <Link href={link}>
            View Program <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

