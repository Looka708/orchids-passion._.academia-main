
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Logo from "./logo";
import { Menu, Search, ChevronDown, LogOut } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";
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
    <header className="glass-header">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="transition-transform group-hover:scale-110 duration-300">
              <Logo />
            </div>
            <span className="hidden font-black text-xl tracking-tighter sm:inline-block">
              PASSION<span className="text-primary italic">ACADEMIA</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-8 text-sm font-bold uppercase tracking-widest">
            {defaultNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-primary relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            ))}

            {specialLinks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto p-0 text-sm font-bold uppercase tracking-widest transition-colors hover:bg-transparent hover:text-primary focus-visible:ring-0">
                    Special <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl border-primary/10 shadow-xl">
                  {specialLinks.map((link) => (
                    <DropdownMenuItem key={link.label} asChild className="rounded-lg">
                      <Link href={link.href}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {academicLinks.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-auto p-0 text-sm font-bold uppercase tracking-widest transition-colors hover:bg-transparent hover:text-primary focus-visible:ring-0">
                    Classes <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl border-primary/10 shadow-xl">
                  {academicLinks.map((link) => (
                    <DropdownMenuItem key={link.label} asChild className="rounded-lg">
                      <Link href={link.href}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-sm mx-12">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type="search"
              placeholder="Search courses..."
              className="pl-10 h-10 w-full bg-muted/50 border-transparent focus:bg-background focus:ring-primary/20 transition-all rounded-xl"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="py-6 flex flex-col h-full">
                <Link href="/" className="flex items-center gap-3 mb-10 px-2">
                  <Logo />
                  <span className="font-black text-xl tracking-tighter">PASSION<span className="text-primary italic">ACADEMIA</span></span>
                </Link>

                <div className="flex flex-col space-y-4 px-2">
                  {defaultNavLinks.map((link) => (
                    <SheetClose asChild key={link.label}>
                      <Link href={link.href} className="text-lg font-bold hover:text-primary transition-colors">{link.label}</Link>
                    </SheetClose>
                  ))}

                  <div className="h-px bg-border my-4" />

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="special" className="border-none">
                      <AccordionTrigger className="text-lg font-bold hover:no-underline py-2">Special</AccordionTrigger>
                      <AccordionContent className="flex flex-col space-y-3 pl-4 pt-2">
                        {specialLinks.map((link) => (
                          <SheetClose asChild key={link.label}>
                            <Link href={link.href} className="text-base font-medium text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                          </SheetClose>
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="academic" className="border-none">
                      <AccordionTrigger className="text-lg font-bold hover:no-underline py-2">Classes</AccordionTrigger>
                      <AccordionContent className="flex flex-col space-y-3 pl-4 pt-2">
                        {academicLinks.map((link) => (
                          <SheetClose asChild key={link.label}>
                            <Link href={link.href} className="text-base font-medium text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                          </SheetClose>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 bg-muted/50 p-1.5 rounded-full pr-4">
                  <button
                    onClick={() => setQuizModalOpen(true)}
                    className="flex h-8 w-8 items-center justify-center bg-background rounded-full shadow-sm hover:shadow-md transition-all"
                  >
                    <span className="text-base">🔥</span>
                  </button>
                  <span className="font-bold text-sm">{streak}</span>
                </div>

                <Button asChild variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>

                {(user?.role === 'owner' || user?.role === 'admin') && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="rounded-xl bg-primary/5 border-primary/20">Admin</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Control Panel</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/exam-generator">Exam Generator</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Button onClick={logout} variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button asChild className="rounded-xl px-8 font-bold button-glow">
                <Link href="/signin">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <DailyQuizModal
        open={quizModalOpen}
        onOpenChange={setQuizModalOpen}
        onComplete={async () => {
          if (firebaseUser?.uid) {
            try {
              const progress = await getUserProgress(firebaseUser.uid);
              if (progress) setStreak(progress.streak);
            } catch (error) {
              console.error('Error refreshing streak:', error);
            }
          }
        }}
      />
    </header>
  );
}
