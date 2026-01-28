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
import { Star, Users, ArrowRight, Clock } from "lucide-react";
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
    <Card className="group flex h-full flex-col overflow-hidden border-primary/5 bg-background transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:-translate-y-2 rounded-[2rem]">
      <CardHeader className="p-0 relative overflow-hidden">
        <Link href={link} className="block relative aspect-[16/10] overflow-hidden">
          <Image
            src={course.image}
            alt={course.title}
            width={600}
            height={400}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            data-ai-hint={course.dataAiHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
            <span className="text-white font-bold flex items-center gap-2">Explore Program <ArrowRight className="h-4 w-4" /></span>
          </div>
        </Link>
        <Badge className="absolute top-4 right-4 bg-primary/90 text-white backdrop-blur-md border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {course.category}
        </Badge>
      </CardHeader>

      <CardContent className="flex-grow p-8 pt-6">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
          <Clock className="h-3 w-3 text-primary" />
          {course.duration}
        </div>
        <CardTitle className="text-2xl font-black mb-3 tracking-tight group-hover:text-primary transition-colors">
          <Link href={link}>
            {course.title}
          </Link>
        </CardTitle>
        <CardDescription className="text-base leading-relaxed line-clamp-2">
          {course.description}
        </CardDescription>
      </CardContent>

      <CardFooter className="flex-col items-start gap-6 p-8 pt-0">
        <div className="flex w-full justify-between items-center text-sm">
          <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full font-bold">
            <Users className="h-4 w-4 text-primary" />
            <span>{course.students.toLocaleString()} Students</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full">
            <Star className="h-4 w-4 fill-current" />
            <span>{course.rating}</span>
          </div>
        </div>
        <Button asChild className="w-full h-12 rounded-xl font-bold group/btn button-glow" variant="outline">
          <Link href={link} className="flex items-center justify-center">
            Get Enrollment <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

