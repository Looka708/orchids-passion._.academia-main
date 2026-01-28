
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "./logo";
import { Menu, Search, ChevronDown, LogOut, LayoutDashboard, Shield, Zap, BookOpen } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle
} from "@/components/ui/sheet";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { getUserProgress } from "@/lib/progress/progressService";
import DailyQuizModal from "@/components/quiz/DailyQuizModal";

interface ClassLink {
  href: string;
  label: string;
  category: string;
}

const defaultNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ's" },
];

export default function Header() {
  const { isAuthenticated, logout, user, firebaseUser } = useAuth();
  const [streak, setStreak] = useState<number>(0);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [specialLinks, setSpecialLinks] = useState<ClassLink[]>([
    { href: "/afns", label: "AFNS", category: "special" },
    { href: "/paf", label: "PAF", category: "special" },
    { href: "/mcj", label: "MCJ", category: "special" },
    { href: "/mcm", label: "MCM", category: "special" },
  ]);
  const [academicLinks, setAcademicLinks] = useState<ClassLink[]>([
    { href: "/classes/class-6", label: "Class 6", category: "academic" },
    { href: "/classes/class-7", label: "Class 7", category: "academic" },
    { href: "/classes/class-8", label: "Class 8", category: "academic" },
    { href: "/classes/class-9", label: "Class 9", category: "academic" },
    { href: "/classes/class-10", label: "Class 10", category: "academic" },
    { href: "/classes/class-11", label: "Class 11", category: "academic" },
    { href: "/classes/class-12", label: "Class 12", category: "academic" },
  ]);

  // Fetch classes from API
  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await fetch("/api/classes");
        const data = await response.json();
        if (data.success && data.data) {
          const fetchedLinks = data.data.map((cls: any) => ({
            href: cls.category === 'special' ? `/${cls.slug}` : `/classes/${cls.slug}`,
            label: cls.name,
            category: cls.category
          }));

          // Merge fetched links with defaults, avoiding duplicates by href
          setSpecialLinks(prev => {
            const combined = [...prev];
            fetchedLinks.filter((l: any) => l.category === 'special').forEach((link: any) => {
              if (!combined.some(c => c.href === link.href)) {
                combined.push(link);
              }
            });
            return combined;
          });

          setAcademicLinks(prev => {
            const combined = [...prev];
            fetchedLinks.filter((l: any) => l.category === 'academic').forEach((link: any) => {
              if (!combined.some(c => c.href === link.href)) {
                combined.push(link);
              }
            });
            return combined;
          });
        }
      } catch (error) {
        console.error("Error fetching classes for header:", error);
      }
    }
    fetchClasses();
  }, []);

  // Fetch user streak when authenticated
  useEffect(() => {
    async function fetchStreak() {
      if (firebaseUser?.uid) {
        try {
          const progress = await getUserProgress(firebaseUser.uid);
          if (progress) {
            setStreak(progress.streak);
          }
        } catch (error) {
          console.error('Error fetching streak:', error);
        }
      }
    }

    if (isAuthenticated) {
      fetchStreak();
    }
  }, [isAuthenticated, firebaseUser]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        <div className="mr-4 hidden items-center md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
            <span className="hidden font-bold sm:inline-block">
              Passion Academia
            </span>
          </Link>
          <div className="relative mr-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input type="search" placeholder="Want to learn?" className="pl-10 w-64" />
            <Button variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2">
              Explore <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {defaultNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            {specialLinks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-0 text-sm font-medium transition-colors hover:bg-transparent hover:text-primary focus-visible:ring-0 focus-visible:ring-offset-0">
                    Special <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {specialLinks.map((link) => (
                    <DropdownMenuItem key={link.label} asChild>
                      <Link href={link.href}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {academicLinks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="px-0 text-sm font-medium transition-colors hover:bg-transparent hover:text-primary focus-visible:ring-0 focus-visible:ring-offset-0">
                    Classes <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {academicLinks.map((link) => (
                    <DropdownMenuItem key={link.label} asChild>
                      <Link href={link.href}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Logo />
              <span className="font-bold">Passion Academia</span>
            </Link>
            <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
              <div className="flex flex-col space-y-3">
                {defaultNavLinks.map((link) => (
                  <SheetClose asChild key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                {specialLinks.length > 0 && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="special" className="border-b-0">
                      <AccordionTrigger className="py-2 text-muted-foreground transition-colors hover:text-primary hover:no-underline">Special</AccordionTrigger>
                      <AccordionContent className="pl-4">
                        <div className="flex flex-col space-y-3">
                          {specialLinks.map((link) => (
                            <SheetClose asChild key={link.label}>
                              <Link
                                href={link.href}
                                className="text-muted-foreground transition-colors hover:text-primary"
                              >
                                {link.label}
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
                {academicLinks.length > 0 && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="classes" className="border-b-0">
                      <AccordionTrigger className="py-2 text-muted-foreground transition-colors hover:text-primary hover:no-underline">Classes</AccordionTrigger>
                      <AccordionContent className="pl-4">
                        <div className="flex flex-col space-y-3">
                          {academicLinks.map((link) => (
                            <SheetClose asChild key={link.label}>
                              <Link
                                href={link.href}
                                className="text-muted-foreground transition-colors hover:text-primary"
                              >
                                {link.label}
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Streak Fire Icon */}
              <button
                onClick={() => setQuizModalOpen(true)}
                className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40 rounded-full border border-orange-300 dark:border-orange-700 hover:shadow-md transition-all cursor-pointer mr-2"
                title={streak > 0
                  ? `🔥 ${streak} day streak! Click to take daily quiz.`
                  : `🔥 Start your streak! Click to take daily quiz.`
                }
              >
                <span className="text-base animate-pulse">🔥</span>
                <span className="font-bold text-sm text-orange-600 dark:text-orange-400">
                  {streak}
                </span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/20 hover:border-primary transition-colors">
                      <AvatarImage src={user?.photoURL} alt={user?.name || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setQuizModalOpen(true)} className="cursor-pointer">
                    <Zap className="mr-2 h-4 w-4" />
                    Daily Quiz
                  </DropdownMenuItem>

                  {(user?.role === 'owner' || user?.role === 'admin') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Admin</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Console
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/exam-generator" className="cursor-pointer">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Exam Generator
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/20">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button asChild>
              <Link href="/signin">Login</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Daily Quiz Modal */}
      <DailyQuizModal
        open={quizModalOpen}
        onOpenChange={setQuizModalOpen}
        onComplete={async () => {
          // Refresh streak after quiz completion
          if (firebaseUser?.uid) {
            try {
              const progress = await getUserProgress(firebaseUser.uid);
              if (progress) {
                setStreak(progress.streak);
              }
            } catch (error) {
              console.error('Error refreshing streak:', error);
            }
          }
        }}
      />
    </header>
  );
}
