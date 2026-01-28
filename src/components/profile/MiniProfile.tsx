"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Calendar, Trophy, Flame, BookOpen, Star } from "lucide-react";
import { User, getUserById } from "@/lib/users";
import { StudentProgress } from "@/lib/types/progress";
import { getUserProgress } from "@/lib/progress/progressService";
import { AVATAR_FRAMES, PROFILE_THEMES } from "@/lib/progress/cosmetics";
import { cn } from "@/lib/utils";

interface MiniProfileProps {
    userId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MiniProfile({ userId, open, onOpenChange }: MiniProfileProps) {
    const [user, setUser] = useState<User | null>(null);
    const [progress, setProgress] = useState<StudentProgress | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId || !open) return;

            setLoading(true);
            try {
                const [userData, progressData] = await Promise.all([
                    getUserById(userId),
                    getUserProgress(userId)
                ]);
                setUser(userData);
                setProgress(progressData);
            } catch (error) {
                console.error("Error fetching mini profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, open]);

    if (!open) return null;

    const equippedFrame = AVATAR_FRAMES.find(f => f.id === user?.equippedFrame) || AVATAR_FRAMES[0];
    const equippedTheme = PROFILE_THEMES.find(t => t.id === user?.equippedTheme) || PROFILE_THEMES[0];

    // Construct the preview class for the theme - simplified for modal bg
    // If theme has a gradient, we use it. If it has a bg color, we use it.
    // We append some padding and rounded corners.

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn("sm:max-w-md overflow-hidden p-0 border-2", equippedTheme.preview.replace('bg-card', 'bg-background'))}>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-sm text-muted-foreground">Loading Profile...</p>
                    </div>
                ) : (
                    <>
                        {/* Header / Banner Area */}
                        <div className="relative h-24 bg-gradient-to-r from-primary/10 to-primary/5">
                            <div className="absolute -bottom-12 left-6">
                                <div className="relative">
                                    <div className={cn("absolute inset-0 rounded-full", equippedFrame.preview)}></div>
                                    <Avatar className={cn("h-24 w-24 border-4 border-background", equippedFrame.preview.includes('animate-spin') && 'animate-[spin_3s_linear_infinite]')}>
                                        <AvatarImage src={user?.photoURL} />
                                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                                            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {progress?.level && progress.level >= 10 && (
                                        <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-background">
                                            Lvl {progress.level}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-14 px-6 pb-6 space-y-4">
                            {/* User Identity */}
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    {user?.name || "Student"}
                                    {user?.role === 'owner' && <span title="Owner">👑</span>}
                                    {user?.role === 'admin' && <span title="Admin">🛡️</span>}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    {user?.bio || "No bio yet."}
                                </p>
                            </div>

                            {/* Main Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3">
                                    <Trophy className="h-5 w-5 text-yellow-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total XP</p>
                                        <p className="font-bold text-sm">
                                            {progress?.totalXP.toLocaleString() || 0}
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-muted/50 p-3 rounded-lg flex items-center gap-3">
                                    <Flame className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Streak</p>
                                        <p className="font-bold text-sm">
                                            {progress?.streak || 0} Days
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Stats */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" /> Academia Stats
                                </h3>
                                <div className="text-sm grid grid-cols-2 gap-y-1 text-muted-foreground">
                                    <span>Questions Answered:</span>
                                    <span className="font-medium text-foreground text-right">{progress?.stats.questionsAnswered || 0}</span>
                                    <span>Correct Answers:</span>
                                    <span className="font-medium text-foreground text-right">{progress?.stats.correctAnswers || 0}</span>
                                    <span>Perfect Scores:</span>
                                    <span className="font-medium text-foreground text-right">{progress?.stats.perfectScores || 0}</span>
                                </div>
                            </div>

                            {/* Badges/Achievements */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Star className="h-4 w-4" />
                                    Badges ({progress?.badges?.length || 0})
                                </h3>
                                {(!progress?.badges || progress.badges.length === 0) ? (
                                    <p className="text-xs text-muted-foreground italic">No badges earned yet.</p>
                                ) : (
                                    <ScrollArea className="w-full whitespace-nowrap pb-2">
                                        <div className="flex space-x-2">
                                            {progress.badges.map((badge, i) => (
                                                <div
                                                    key={i}
                                                    className="flex flex-col items-center justify-center bg-muted/40 p-2 rounded-lg w-16 h-16 flex-shrink-0 border border-transparent hover:border-primary/20 transition-colors"
                                                    title={badge.name}
                                                >
                                                    <span className="text-2xl">{badge.icon}</span>
                                                    <span className="text-[9px] truncate w-full text-center mt-1 text-muted-foreground">{badge.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
