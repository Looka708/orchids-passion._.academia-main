
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, BookOpen, Brain, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const tips = [
    "Read each question carefully before answering.",
    "Trust your first instinct - it's often correct!",
    "Manage your time effectively during the test.",
    "Persistence is the key to mastering any subject.",
    "Mistakes are proof that you are trying and learning.",
];

interface QuizLoadingProps {
    className?: string;
    isModal?: boolean;
    onComplete?: () => void;
}

export default function QuizLoading({ className, isModal = false, onComplete }: QuizLoadingProps) {
    const [tipIndex, setTipIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % tips.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Logical progress animation that takes exactly 3 seconds to hit 100%
    useEffect(() => {
        const duration = 3000; // 3 seconds
        const interval = 30; // 30ms for smooth updates
        const steps = duration / interval;
        const increment = 100 / steps;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer);
                    // Call onComplete only after a slight delay to allow the user to see the 100% state
                    setTimeout(() => {
                        if (onComplete) onComplete();
                    }, 500);
                    return 100;
                }
                return Math.min(prev + increment, 100);
            });
        }, interval);

        return () => clearInterval(timer);
    }, [onComplete]);

    return (
        <div className={cn(
            "flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4",
            isModal ? "py-8" : "min-h-[70vh]",
            className
        )}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-24 h-24 mb-8"
            >
                {/* Animated Background Rings */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute inset-0 rounded-full border-4 border-dashed border-primary/30"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [360, 180, 0],
                        opacity: [0.1, 0.4, 0.1],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="absolute -inset-4 rounded-full border-2 border-primary/20"
                />

                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center bg-background rounded-full shadow-xl border-2 border-primary/10">
                    <Brain className="h-10 w-10 text-primary animate-pulse" />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-4 w-full"
            >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    {progress < 100 ? "Preparing Your Test" : "Test Ready!"}
                </h2>

                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    {progress < 100 ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <p className="text-lg font-medium">Fetching the best questions for you...</p>
                        </>
                    ) : (
                        <p className="text-lg font-medium text-primary flex items-center gap-2">
                            <Sparkles className="h-4 w-4" /> Finalizing setup...
                        </p>
                    )}
                </div>

                {/* Progress Bar Container - Controlled logically */}
                <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mt-8 shadow-inner border border-primary/10">
                    <motion.div
                        className="h-full bg-primary relative"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "linear" }}
                    >
                        {/* Shimmer effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/2 h-full"
                            animate={{ x: ['-200%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                    </motion.div>
                </div>

                <p className="text-sm font-bold text-primary/80 tabular-nums">
                    {Math.floor(progress)}% Complete
                </p>

                {/* Fun Tip Section */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tipIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="mt-12 p-6 rounded-2xl bg-primary/5 border border-primary/10 backdrop-blur-sm relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="h-12 w-12 text-primary" />
                        </div>

                        <div className="flex items-start gap-4 text-left">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Study Tip</p>
                                <p className="text-foreground/80 font-medium italic">
                                    "{tips[tipIndex]}"
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="grid grid-cols-3 gap-4 pt-8">
                    <div className="flex flex-col items-center gap-1 opacity-40">
                        <Trophy className="h-5 w-5" />
                        <span className="text-[10px] font-bold uppercase">Mastery</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-40">
                        <Brain className="h-5 w-5" />
                        <span className="text-[10px] font-bold uppercase">Focus</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-40">
                        <Sparkles className="h-5 w-5" />
                        <span className="text-[10px] font-bold uppercase">Xp</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
