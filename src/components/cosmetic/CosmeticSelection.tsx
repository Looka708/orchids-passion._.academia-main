
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AVATAR_EFFECTS, PROFILE_EFFECTS, ALL_EFFECTS, CosmeticEffect } from "@/lib/progress/effects";
import { StudentProgress } from "@/lib/types/progress";
import { getUserProgress } from "@/lib/progress/progressService";
import { db } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { Check, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import CosmeticAvatar from "./CosmeticAvatar";
import { toast } from "@/hooks/use-toast";

interface CosmeticSelectionProps {
    userId: string;
}

export default function CosmeticSelection({ userId }: CosmeticSelectionProps) {
    const [progress, setProgress] = useState<StudentProgress | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProgress() {
            const p = await getUserProgress(userId);
            setProgress(p);
            setLoading(false);
        }
        fetchProgress();
    }, [userId]);

    const handleSelectEffect = async (effectId: string, type: 'avatar' | 'profile') => {
        if (!progress) return;

        // Check if unlocked
        if (!progress.unlockedEffects?.includes(effectId) && effectId !== 'none') {
            toast({
                title: "Locked",
                description: "You haven't unlocked this effect yet!",
                variant: "destructive"
            });
            return;
        }

        try {
            const progressRef = doc(db, 'users', userId, 'progress', 'current');
            const updateData = type === 'avatar'
                ? { activeAvatarEffect: effectId }
                : { activeProfileEffect: effectId };

            await updateDoc(progressRef, updateData);

            setProgress(prev => prev ? { ...prev, ...updateData } : null);

            toast({
                title: "Effect Applied",
                description: `Your ${type} effect has been updated.`
            });
        } catch (error) {
            console.error("Error updating effect:", error);
        }
    };

    if (loading) return <div className="animate-pulse space-y-4 pt-10">
        <div className="h-40 bg-muted rounded-3xl" />
        <div className="h-40 bg-muted rounded-3xl" />
    </div>;

    return (
        <div className="space-y-12 py-10">
            <section>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Avatar Effects</h2>
                        <p className="text-muted-foreground">Personalize your presence on leaderboards</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {AVATAR_EFFECTS.map((effect) => {
                        const isUnlocked = progress?.unlockedEffects?.includes(effect.id) || effect.id === 'none';
                        const isActive = progress?.activeAvatarEffect === effect.id;

                        return (
                            <Card key={effect.id} className={cn(
                                "relative overflow-hidden transition-all duration-300 rounded-[2rem]",
                                isActive ? "ring-2 ring-primary border-primary/50" : "hover:border-primary/20",
                                !isUnlocked && "opacity-75 grayscale-[0.5]"
                            )}>
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <CosmeticAvatar
                                        fallback="User"
                                        effectId={isUnlocked ? effect.id : 'none'}
                                        size="md"
                                    />
                                    <div>
                                        <CardTitle className="text-lg">{effect.name}</CardTitle>
                                        <CardDescription className="text-xs uppercase font-bold tracking-widest text-primary/70">{effect.rarity}</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">{effect.description}</p>
                                    {!isUnlocked && (
                                        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-xl mb-4">
                                            <Lock className="h-3 w-3" />
                                            {effect.unlockCriteria}
                                        </div>
                                    )}
                                    <Button
                                        className="w-full rounded-xl font-bold"
                                        variant={isActive ? "default" : "outline"}
                                        disabled={!isUnlocked}
                                        onClick={() => handleSelectEffect(effect.id, 'avatar')}
                                    >
                                        {isActive ? <><Check className="mr-2 h-4 w-4" /> Active</> : isUnlocked ? "Apply Effect" : "Locked"}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>

            <section>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-500/10 rounded-2xl">
                        <Sparkles className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Profile Effects</h2>
                        <p className="text-muted-foreground">Transform your dashboard theme</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PROFILE_EFFECTS.map((effect) => {
                        const isUnlocked = progress?.unlockedEffects?.includes(effect.id) || effect.id === 'none';
                        const isActive = progress?.activeProfileEffect === effect.id;

                        return (
                            <Card key={effect.id} className={cn(
                                "relative overflow-hidden transition-all duration-300 rounded-[2rem]",
                                isActive ? "ring-2 ring-blue-500 border-blue-500/50" : "hover:border-blue-500/20",
                                !isUnlocked && "opacity-75 grayscale-[0.5]"
                            )}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{effect.name}</CardTitle>
                                    <CardDescription className="text-xs uppercase font-bold tracking-widest text-blue-500/70">{effect.rarity}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">{effect.description}</p>
                                    {!isUnlocked && (
                                        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-xl mb-4">
                                            <Lock className="h-3 w-3" />
                                            {effect.unlockCriteria}
                                        </div>
                                    )}
                                    <Button
                                        className="w-full rounded-xl font-bold"
                                        variant={isActive ? "secondary" : "outline"}
                                        disabled={!isUnlocked}
                                        onClick={() => handleSelectEffect(effect.id, 'profile')}
                                    >
                                        {isActive ? <><Check className="mr-2 h-4 w-4" /> Active</> : isUnlocked ? "Apply Theme" : "Locked"}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
