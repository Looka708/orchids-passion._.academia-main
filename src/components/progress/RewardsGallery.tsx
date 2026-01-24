"use client";

import { Reward } from "@/lib/types/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRewardIcon, getRewardColor, checkRewardUnlock } from "@/lib/progress/rewards";
import { Lock, Check } from "lucide-react";

interface RewardCardProps {
    reward: Reward;
    currentLevel: number;
}

export function RewardCard({ reward, currentLevel }: RewardCardProps) {
    const unlocked = checkRewardUnlock(currentLevel, reward);
    const icon = getRewardIcon(reward.type);
    const color = getRewardColor(reward.type);

    return (
        <Card className={`${unlocked ? 'border-green-500' : 'opacity-60'} transition-all hover:scale-105`}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">{icon}</span>
                        <div>
                            <CardTitle className="text-lg">{reward.name}</CardTitle>
                            <CardDescription className="text-xs">
                                Level {reward.requiredLevel} required
                            </CardDescription>
                        </div>
                    </div>
                    {unlocked ? (
                        <Check className="h-5 w-5 text-green-500" />
                    ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                    {reward.description}
                </p>

                {reward.type === 'discount' && (
                    <Badge className={`${color} bg-green-100 dark:bg-green-950`}>
                        {reward.value}% OFF
                    </Badge>
                )}

                {!unlocked && (
                    <p className="text-xs text-muted-foreground mt-2">
                        {reward.requiredLevel - currentLevel} levels to unlock
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

interface RewardsGalleryProps {
    rewards: Reward[];
    currentLevel: number;
}

export default function RewardsGallery({ rewards, currentLevel }: RewardsGalleryProps) {
    const unlocked = rewards.filter(r => checkRewardUnlock(currentLevel, r));
    const locked = rewards.filter(r => !checkRewardUnlock(currentLevel, r));

    return (
        <div className="space-y-6">
            {/* Unlocked Rewards */}
            {unlocked.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        Unlocked Rewards ({unlocked.length})
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {unlocked.map((reward) => (
                            <RewardCard
                                key={reward.id}
                                reward={reward}
                                currentLevel={currentLevel}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Rewards */}
            {locked.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        Locked Rewards ({locked.length})
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {locked.map((reward) => (
                            <RewardCard
                                key={reward.id}
                                reward={reward}
                                currentLevel={currentLevel}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
