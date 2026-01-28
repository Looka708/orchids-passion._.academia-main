"use client";

import { Progress } from "@/components/ui/progress";
import { getLevelProgress, getLevelTitle, getLevelColor } from "@/lib/progress/levelSystem";

interface ProgressBarProps {
    totalXP: number;
    level: number;
    currentLevelXP: number;
    nextLevelXP: number;
    showDetails?: boolean;
}

export default function ProgressBar({
    totalXP,
    level,
    currentLevelXP,
    nextLevelXP,
    showDetails = true
}: ProgressBarProps) {
    const progress = getLevelProgress(totalXP, level);
    const xpInLevel = totalXP - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    const levelTitle = getLevelTitle(level);
    const levelColor = getLevelColor(level);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${levelColor}`}>
                        Level {level}
                    </span>
                    {showDetails && (
                        <span className="text-sm text-muted-foreground">
                            {levelTitle}
                        </span>
                    )}
                </div>
                {showDetails && (
                    <span className="text-sm font-medium">
                        {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP
                    </span>
                )}
            </div>

            <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                <div
                    className={`absolute top-0 left-0 h-full bg-gradient-to-r ${levelColor.replace('text-', 'from-')} to-primary transition-all duration-1000 ease-out`}
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
            </div>

            {showDetails && (
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round(progress)}% to next level</span>
                    <span>{totalXP.toLocaleString()} Total XP</span>
                </div>
            )}
        </div>
    );
}
