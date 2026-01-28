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
    <div className="bg-home-gradient min-h-screen">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative w-full overflow-hidden pt-24 pb-20 md:pt-32 md:pb-32"
      >
        <div className="absolute inset-0 z-0 opacity-40">
          <motion.div
            animate={{
              translateY: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-20 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]"
          ></motion.div>
          <motion.div
            animate={{
              translateY: [0, 20, 0],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -right-20 top-1/2 h-[450px] w-[450px] rounded-full bg-primary/15 blur-[100px]"
          ></motion.div>
        </div>

        <div className="container relative z-20 mx-auto px-4 md:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl space-y-8"
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white uppercase">New</span>
                Next-Gen Online Learning Platform
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-8xl leading-[1.1]">
                Master Your <br />
                <span className="text-gradient">Future</span> with <br />
                Passion
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl/relaxed max-w-[550px]">
                Empowering students with expert tutoring for Grades 6-12 and specialized entry test prep for elite military careers.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row pt-4">
                <Button asChild size="lg" className="h-14 px-10 text-lg font-semibold button-glow rounded-2xl">
                  <Link href="/signup">
                    Enroll Now <ChevronRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-10 text-lg font-semibold rounded-2xl backdrop-blur-sm border-primary/20 hover:bg-primary/5 transition-colors">
                  <Link href="#courses">
                    Explore Programs
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-8 border-t border-primary/10">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Avatar key={i} className="h-10 w-10 border-2 border-background ring-2 ring-primary/10">
                      <AvatarImage src={`https://api.dicebear.com/9.x/avataaars/svg?seed=user${i}&backgroundColor=transparent`} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold">Join 5,000+ students</p>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />)}
                    <span className="ml-2 text-xs text-muted-foreground">(4.9/5 overall rating)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative z-10 overflow-hidden rounded-[2.5rem] border-8 border-white/10 shadow-2xl backdrop-blur-sm">
                <Image
                  src="/Main.png"
                  alt="Elite Learning"
                  width={600}
                  height={750}
                  className="rounded-[1.5rem] object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              </div>

              {/* Floating Dashboard Elements */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="glass-card absolute -bottom-8 -left-12 z-20 flex items-center gap-4 rounded-3xl p-6"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
                  <Users2 className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-black">98%</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Success Rate</p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="glass-card absolute -right-8 top-12 z-20 flex items-center gap-4 rounded-3xl p-6"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20">
                  <PlayCircle className="h-7 w-7 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-black">24/7</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Support Access</p>
                </div>
              </motion.div>

              <div className="absolute -z-10 h-[100%] w-[100%] rounded-full bg-primary/10 blur-[100px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Trust Quote Section */}
      <section className="py-10 border-y border-primary/5 bg-primary/[0.02]">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">Trusted by leading educational institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Replace with actual partner logos or icons if available */}
            <div className="flex items-center gap-2 font-bold text-xl"><BookOpen className="h-6 w-6" /> EDUCORE</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Plane className="h-6 w-6" /> PAF PREP</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Users2 className="h-6 w-6" /> MCM-CADETS</div>
            <div className="flex items-center gap-2 font-bold text-xl"><Star className="h-6 w-6" /> ACADEMIX</div>
          </div>
        </div>
      </section>

      <section id="courses" className="w-full py-24 md:py-32">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Our <span className="text-gradient">Premium</span> Programs
            </h2>
            <p className="mx-auto max-w-[800px] text-lg text-muted-foreground md:text-xl">
              Meticulously crafted courses designed by industry experts to ensure your success in academic and competitive examinations.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course, idx) => (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group h-full"
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-24 bg-muted/50 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl leading-tight">
                Empowering Your Educational <span className="text-gradient">Journey</span>
              </h2>
              <div className="grid gap-6">
                {[
                  { title: "Expert Instruction", desc: "Learn from top-tier educators with years of specialized experience.", icon: Users2, color: "bg-blue-500" },
                  { title: "Smart Progress Tracking", desc: "Advanced analytics to monitor your growth and focus on key areas.", icon: Star, color: "bg-amber-500" },
                  { title: "Quality Study Materials", desc: "Comprehensive notes, interactive mock tests, and curated video lessons.", icon: BookOpen, color: "bg-primary" },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 10 }}
                    className="flex gap-4 p-4 rounded-2xl border border-transparent hover:border-primary/10 hover:bg-background/80 transition-all"
                  >
                    <div className={cn("flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white", feature.color)}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">{feature.title}</h4>
                      <p className="text-muted-foreground">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-full bg-primary/20 absolute -z-10 blur-[100px] scale-150 animate-pulse"></div>
              <div className="glass-card rounded-[3rem] p-4 p-2 shadow-2xl">
                <div className="rounded-[2.5rem] overflow-hidden">
                  {/* In a real app, use a dynamic UI preview or another quality image */}
                  <Image src="/program-academics.png" alt="Feature preview" width={600} height={600} className="object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="w-full py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:60px_60px]"></div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center"
          >
            <h2 className="text-4xl font-bold tracking-tighter sm:text-6xl mb-6">
              Simple, <span className="text-gradient">Transparent</span> Pricing
            </h2>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Investment in your choice of excellence. Choose the plan that fits your ambition.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 max-w-7xl mx-auto">
            {/* Student Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="relative flex flex-col rounded-[2.5rem] border bg-background/50 p-10 shadow-xl backdrop-blur-md transition-all border-primary/10"
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
              <Button className="w-full h-14 text-lg font-bold rounded-2xl button-glow" asChild>
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
              className="relative flex flex-col rounded-[2.5rem] border-2 border-primary bg-primary/[0.03] p-10 shadow-2xl backdrop-blur-xl transition-all scale-105 z-10"
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-8 py-2 text-sm font-bold text-white shadow-xl shadow-primary/25">
                MOST POPULAR
              </div>
              <div className="mb-8">
                <div className="inline-flex items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 p-4 mb-6 text-white">
                  <Users2 className="h-8 w-8" />
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
                    <span className="text-sm font-medium font-semibold">{feature}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/30 button-glow" asChild>
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
              className="relative flex flex-col rounded-[2.5rem] border bg-background/50 p-10 shadow-xl backdrop-blur-md transition-all border-primary/10"
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
              <Button variant="outline" className="w-full h-14 text-lg font-bold border-2 rounded-2xl" asChild>
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

      <section id="testimonials" className="w-full py-24 md:py-32 relative overflow-hidden bg-primary/5">
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20 text-center"
          >
            <h2 className="text-4xl font-bold tracking-tighter sm:text-6xl mb-6">
              Hear from our <span className="text-gradient">Community</span>
            </h2>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl">
              Join thousands of successful students who have transformed their academic journey with our platform.
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex h-full flex-col justify-between rounded-[2rem] border bg-background p-10 shadow-xl border-primary/5 hover:border-primary/20 transition-all group scale-[0.98] hover:scale-100"
                  >
                    <div>
                      <div className="flex gap-1 mb-8 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-current" />
                        ))}
                      </div>
                      <p className="mb-10 text-xl leading-relaxed text-muted-foreground/90 italic font-medium">
                        &ldquo;{testimonial.quote}&rdquo;
                      </p>
                    </div>
                    <div className="flex items-center gap-5 pt-8 border-t border-primary/10">
                      <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-lg">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                          {testimonial.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-xl tracking-tight">{testimonial.name}</p>
                        <p className="text-sm font-bold text-primary/80 uppercase tracking-widest">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-6 mt-16">
              <CarouselPrevious className="static translate-y-0 h-14 w-14 rounded-2xl border-2 hover:bg-primary hover:text-white transition-all" />
              <CarouselNext className="static translate-y-0 h-14 w-14 rounded-2xl border-2 hover:bg-primary hover:text-white transition-all" />
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
