"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import {
  BookOpen,
  PlayCircle,
  Users2,
  Plane,
  ChevronRight,
  Star,
  CheckCircle2,
} from "lucide-react";
import type { Course, Testimonial } from "@/lib/types";
import CourseCard from "@/components/course-card";
import { getLeaderboard } from "@/lib/progress/progressService";

const courses: Course[] = [
  {
    title: 'Grades 6-12 Tutoring',
    category: 'Academics',
    description: 'Comprehensive tutoring for students in grades 6 through 12 across all major subjects.',
    image: '/program-academics.png',
    duration: 'Ongoing',
    students: 350,
    rating: 4.9,
    dataAiHint: "classroom students",
  },
  {
    title: 'AFNS Test Preparation',
    category: 'Test Prep',
    description: 'Specialized coaching to excel in the Armed Forces Nursing Service (AFNS) entrance exam.',
    image: '/program-afns.png',
    duration: '8 weeks',
    students: 120,
    rating: 4.8,
    dataAiHint: "medical exam",
  },
  {
    title: 'PAF Cadet Test Prep',
    category: 'Test Prep',
    description: 'Rigorous training program for aspiring Pakistan Air Force (PAF) cadets.',
    image: '/program-paf.png',
    duration: '10 weeks',
    students: 95,
    rating: 4.9,
    dataAiHint: "air force",
  },
  {
    title: 'MCJ/MCM Entrance Prep',
    category: 'Test Prep',
    description: 'Expert guidance for Military College Jhelum (MCJ) and Murree (MCM) entrance tests.',
    image: '/program-mcj-mcm.png',
    duration: '12 weeks',
    students: 150,
    rating: 4.8,
    dataAiHint: "military school",
  },
];


const testimonials: Testimonial[] = [
  {
    name: "Aisha K.",
    role: "AFNS Aspirant",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Aisha&backgroundColor=b6e3f4",
    quote: "The AFNS prep course was fantastic. The instructors were knowledgeable and the mock tests were extremely helpful. I feel confident for my exam!",
    dataAiHint: "woman student"
  },
  {
    name: "Bilal Ahmed",
    role: "PAF Cadet",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Bilal&backgroundColor=c0aede",
    quote: "Passion Academia made my dream of joining the PAF possible. The physical and academic training was top-notch. Highly recommended!",
    dataAiHint: "man student"
  },
  {
    name: "Fatima R.",
    role: "Parent",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Fatima&backgroundColor=ffdfbf",
    quote: "My son's grades improved significantly with their grade 10 tutoring. The teachers are patient and create a very positive learning environment.",
    dataAiHint: "woman parent"
  },
];

export default function Home() {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      try {
        const data = await getLeaderboard(10);
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboards();
  }, []);

  // Top 10 by XP
  const topXP = leaderboardData.slice(0, 10);

  // Sort by streak for streak legends
  const topStreaks = [...leaderboardData]
    .sort((a, b) => (b.streak || 0) - (a.streak || 0))
    .slice(0, 10);

  return (
    <div className="bg-home-gradient">
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full overflow-hidden py-20 md:py-32"
      >
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-20 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.4, 0.3] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-20 top-1/2 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
          ></motion.div>
        </div>

        <div className="container relative z-20 grid items-center gap-12 px-4 md:grid-cols-2 md:px-6">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-7xl">
              Up Your <span className="text-primary relative inline-block">
                Skills
                <motion.svg 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 1 }}
                  viewBox="0 0 100 20" 
                  className="absolute -bottom-2 left-0 w-full h-3 text-primary/30"
                >
                  <path d="M0 10 Q 50 20 100 10" fill="transparent" stroke="currentColor" strokeWidth="4" />
                </motion.svg>
              </span> <br />
              To Advance Your <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Career Path</span>
            </h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
              Expert tutoring for Grades 6-12 and specialized preparation for AFNS, PAF, MCJ & MCM entrance exams. The latest online learning system and material that help your knowledge growing.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 px-8 text-base transition-all hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:scale-105">
                <Link href="/contact">
                  Get Started Today <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative flex h-full min-h-[400px] w-full items-center justify-center"
          >
            <div className="absolute inset-0 m-auto h-[380px] w-[380px] rounded-full bg-primary/20 blur-3xl opacity-50"></div>
            <div className="relative z-10 rounded-2xl bg-background/50 p-4 shadow-2xl ring-1 ring-border backdrop-blur-md">
              <Image src="/Main.png" alt="Instructor" width={400} height={500} className="rounded-xl object-cover" priority />
            </div>
            
            {/* Stats Cards with Float Animation */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 left-0 z-20 flex items-center gap-3 rounded-xl border bg-background/90 p-4 shadow-xl backdrop-blur-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">5K+</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Online Courses</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-8 right-0 z-20 flex items-center gap-3 rounded-xl border bg-background/90 p-4 shadow-xl backdrop-blur-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <PlayCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">2K+</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Video Lessons</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <section id="courses" className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Our Programs
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
              Find the perfect program to achieve your academic and career goals.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.title} course={course} />
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="w-full py-16 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]"></div>
        <div className="container relative z-10 px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl lg:text-6xl mb-4">
              Simple, <span className="text-primary">Transparent</span> Pricing
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Everything you need to excel in your academics and career tests. No hidden fees.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
            {/* Student Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="relative flex flex-col rounded-3xl border bg-card/50 p-8 shadow-2xl backdrop-blur-sm transition-all border-primary/10"
            >
              <div className="mb-8">
                <div className="inline-flex items-center justify-center rounded-2xl bg-blue-500/10 p-4 mb-6">
                  <BookOpen className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-3xl font-bold">Student</h3>
                <p className="text-muted-foreground mt-2">Perfect for individual learners</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">Rs. 899</span>
                  <span className="text-muted-foreground font-medium">/mo</span>
                </div>
              </div>
              <div className="space-y-4 mb-10 flex-1">
                {[
                  "Unlimited Grades 6-12 Access",
                  "AFNS, PAF, MCJ & MCM Prep",
                  "5,000+ Interactive MCQs",
                  "Performance Analytics",
                  "Downloadable Materials"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20" asChild>
                <Link href="/checkout?plan=student">Get Started</Link>
              </Button>
            </motion.div>

            {/* Teacher Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              transition={{ delay: 0.1 }}
              className="relative flex flex-col rounded-3xl border-2 border-primary bg-primary/[0.02] p-8 shadow-2xl backdrop-blur-md transition-all ring-4 ring-primary/5"
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground shadow-xl">
                MOST POPULAR
              </div>
              <div className="mb-8">
                <div className="inline-flex items-center justify-center rounded-2xl bg-primary/20 p-4 mb-6">
                  <Users2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl font-bold">Teacher</h3>
                <p className="text-muted-foreground mt-2">Empower your entire classroom</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">Rs. 2999</span>
                  <span className="text-muted-foreground font-medium">/mo</span>
                </div>
              </div>
              <div className="space-y-4 mb-10 flex-1">
                {[
                  "Everything in Student Plan",
                  "Course Customization Tools",
                  "Student Progress Reports",
                  "Automated Grading System",
                  "Up to 100 Students",
                  "Priority Chat Support"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full h-12 text-base font-bold shadow-xl shadow-primary/30" asChild>
                <Link href="/checkout?plan=teacher">Start Teaching</Link>
              </Button>
            </motion.div>

            {/* Admin Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              transition={{ delay: 0.2 }}
              className="relative flex flex-col rounded-3xl border bg-card/50 p-8 shadow-2xl backdrop-blur-sm transition-all border-primary/10"
            >
              <div className="mb-8">
                <div className="inline-flex items-center justify-center rounded-2xl bg-purple-500/10 p-4 mb-6">
                  <Star className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-3xl font-bold">Admin</h3>
                <p className="text-muted-foreground mt-2">Total institutional control</p>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">Rs. 14999</span>
                  <span className="text-muted-foreground font-medium">/mo</span>
                </div>
              </div>
              <div className="space-y-4 mb-10 flex-1">
                {[
                  "AI Exam Generator Access",
                  "Unlimited Student Accounts",
                  "Multi-Chapter Selection",
                  "PDF & Print Ready Exams",
                  "Institutional Dashboard",
                  "24/7 Dedicated Support"
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full h-12 text-base font-bold border-2" asChild>
                <Link href="/contact">Contact Institution</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leaderboards Section */}
      <section id="leaderboards" className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Student Leaderboards
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
              Celebrate excellence and track your progress against fellow students
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
            {/* 1. Classic Leaderboard - Coming Soon */}
            <div className="flex flex-col rounded-2xl border-2 border-yellow-500/20 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 p-6 shadow-xl">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 p-3 mb-4 shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent">Classic Leaderboard</h3>
                <p className="text-sm text-muted-foreground">Top 10 Highest XP</p>
              </div>

              <div className="flex-1 flex items-center justify-center py-12">
                <div className="text-center text-muted-foreground">
                  <svg className="h-16 w-16 mx-auto mb-4 text-yellow-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-lg font-semibold mb-2">Coming Soon</p>
                  <p className="text-sm">XP leaderboard will be available soon!</p>
                </div>
              </div>
            </div>

            {/* 2. Most Improved - Coming Soon */}
            <div className="flex flex-col rounded-2xl border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-6 shadow-xl">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 p-3 mb-4 shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">Most Improved</h3>
                <p className="text-sm text-muted-foreground">Last 7 Days Growth</p>
              </div>

              <div className="flex-1 flex items-center justify-center py-12">
                <div className="text-center text-muted-foreground">
                  <svg className="h-16 w-16 mx-auto mb-4 text-green-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-lg font-semibold mb-2">Coming Soon</p>
                  <p className="text-sm">Progress tracking will be available soon!</p>
                </div>
              </div>
            </div>

            {/* 3. Streak Legends */}
            <div className="flex flex-col rounded-2xl border-2 border-orange-500/20 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-6 shadow-xl">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 p-3 mb-4 shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">Streak Legends</h3>
                <p className="text-sm text-muted-foreground">Elite Consistency Club</p>
              </div>

              <div className="space-y-2 flex-1">
                {loading ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    <p className="text-sm">Loading streaks...</p>
                  </div>
                ) : topStreaks.length > 0 ? (
                  topStreaks.map((entry, index) => (
                    <div key={entry.userId} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-950/50 dark:hover:to-red-950/50 transition-all hover:scale-105 border border-orange-200/50 dark:border-orange-800/50 shadow-sm">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center font-bold text-white shadow-md">
                        {index + 1}
                      </div>
                      <Avatar className="w-12 h-12 border-2 border-white shadow-md">
                        <AvatarImage src={entry.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${entry.name || entry.userId}`} alt={entry.name} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white font-bold text-lg">
                          {entry.name?.charAt(0).toUpperCase() || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate text-foreground">{entry.name || 'Student'}</p>
                        <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                          <span className="text-base">🔥</span>
                          {entry.streak || 0} day streak
                        </p>
                      </div>
                      {(entry.streak || 0) >= 30 && (
                        <div className="flex-shrink-0">
                          <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full px-2 py-1">
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">ELITE</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <svg className="h-16 w-16 mx-auto mb-4 text-orange-500/30" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">No streaks yet</p>
                    <p className="text-xs mt-1">Learn daily to build your streak!</p>
                  </div>
                )}
              </div>

              <Button className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-lg" asChild>
                <Link href="/dashboard">Start Your Streak</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="w-full py-20 md:py-32 relative overflow-hidden">
        <div className="container relative z-10 px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl lg:text-6xl mb-4">
              Loved by <span className="text-primary">Thousands</span> of Students
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Real stories from real students who transformed their careers with Passion Academia.
            </p>
          </motion.div>

          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full max-w-7xl mx-auto"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex h-full flex-col justify-between rounded-3xl border bg-card/50 p-8 shadow-xl backdrop-blur-sm border-primary/5 hover:border-primary/20 transition-colors"
                  >
                    <div>
                      <div className="flex gap-1 mb-6 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-current" />
                        ))}
                      </div>
                      <p className="mb-8 text-lg leading-relaxed text-muted-foreground italic">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center gap-4 border-t pt-6 border-primary/5">
                      <Avatar className="h-14 w-14 border-2 border-primary/10">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {testimonial.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-lg">{testimonial.name}</p>
                        <p className="text-sm font-medium text-primary">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-12">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        </div>
      </section>

      <section id="faq" className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="mx-auto max-w-3xl">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg">
                What are the class timings?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We offer flexible timings with morning and evening batches to accommodate student schedules. Please contact us for the detailed schedule for your specific course.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg">
                Do you provide study materials?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, all students receive comprehensive study materials, including notes, practice questions, and mock test series, all tailored to the specific curriculum.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg">
                What is the student-to-teacher ratio?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We maintain a low student-to-teacher ratio to ensure personalized attention for every student, fostering a more effective learning environment.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg">
                How can I get help if I'm stuck?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We offer dedicated doubt-clearing sessions and one-on-one interactions with instructors. Our goal is to ensure every student understands the concepts thoroughly.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
    </div>
  );
}
