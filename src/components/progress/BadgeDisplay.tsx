"use client";

import { Badge } from "@/lib/types/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getBadgeColor, getBadgeBorderColor } from "@/lib/progress/achievements";
import { Lock } from "lucide-react";

interface BadgeDisplayProps {
    badge: Badge;
    unlocked?: boolean;
    size?: "sm" | "md" | "lg";
    showDescription?: boolean;
}

export default function BadgeDisplay({
    badge,
    unlocked = true,
    size = "md",
    showDescription = false
}: BadgeDisplayProps) {
    const sizeClasses = {
        sm: "w-16 h-16 text-2xl",
        md: "w-24 h-24 text-4xl",
        lg: "w-32 h-32 text-5xl"
    };

    const borderColor = getBadgeBorderColor(badge.rarity);
    const textColor = getBadgeColor(badge.rarity);

    return (
        <div className="flex flex-col items-center gap-2">
            <div
                className={`
          ${sizeClasses[size]}
          rounded-full
          border-4
          ${borderColor}
          ${unlocked ? 'bg-background' : 'bg-muted opacity-50'}
          flex items-center justify-center
          relative
          transition-all
          hover:scale-110
          ${unlocked ? 'shadow-lg' : ''}
        `}
            >
                {unlocked ? (
                    <span className="select-none">{badge.icon}</span>
                ) : (
                    <Lock className="h-8 w-8 text-muted-foreground" />
                )}
            </div>

            {showDescription && (
                <div className="text-center max-w-[200px]">
                    <p className={`font-semibold text-sm ${textColor}`}>
                        {badge.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {badge.description}
                    </p>
                    <p className="text-xs font-medium mt-1 capitalize">
                        {badge.rarity}
                    </p>
                </div>
            )}
        </div>
    );
}

// Badge Collection Component
interface BadgeCollectionProps {
    badges: Badge[];
    unlockedBadges: string[];
}

export function BadgeCollection({ badges, unlockedBadges }: BadgeCollectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Badge Collection</CardTitle>
                <CardDescription>
                    {unlockedBadges.length} / {badges.length} badges unlocked
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {badges.map((badge) => (
                        <BadgeDisplay
                            key={badge.id}
                            badge={badge}
                            unlocked={unlockedBadges.includes(badge.id)}
                            size="sm"
                            showDescription={false}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
