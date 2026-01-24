"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProgressBar from "./ProgressBar";
import { BadgeCollection } from "./BadgeDisplay";
import RewardsGallery from "./RewardsGallery";
import { StudentProgress } from "@/lib/types/progress";
import { BADGES } from "@/lib/progress/achievements";
import { REWARDS } from "@/lib/progress/rewards";
import { Trophy, Target, Flame, Award, TrendingUp } from "lucide-react";

interface StudentDashboardProps {
    progress: StudentProgress;
}

export default function StudentDashboard({ progress }: StudentDashboardProps) {
    const badges = Object.values(BADGES);
    const accuracy = progress.stats.questionsAnswered > 0
        ? Math.round((progress.stats.correctAnswers / progress.stats.questionsAnswered) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header with Progress */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Your Progress</CardTitle>
                    <CardDescription>Track your learning journey and unlock rewards</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProgressBar
                        totalXP={progress.totalXP}
                        level={progress.level}
                        currentLevelXP={progress.currentLevelXP}
                        nextLevelXP={progress.nextLevelXP}
                        showDetails={true}
                    />
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total XP</CardTitle>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progress.totalXP.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Experience points earned</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                        <Target className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{accuracy}%</div>
                        <p className="text-xs text-muted-foreground">
                            {progress.stats.correctAnswers} / {progress.stats.questionsAnswered} correct
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Streak</CardTitle>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progress.streak} days</div>
                        <p className="text-xs text-muted-foreground">Keep it going!</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                        <Award className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{progress.achievements.length}</div>
                        <p className="text-xs text-muted-foreground">Badges unlocked</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Learning Statistics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Questions Answered</p>
                            <p className="text-2xl font-bold">{progress.stats.questionsAnswered}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Perfect Scores</p>
                            <p className="text-2xl font-bold">{progress.stats.perfectScores}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Chapters Completed</p>
                            <p className="text-2xl font-bold">{progress.stats.chaptersCompleted}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for Badges and Rewards */}
            <Tabs defaultValue="badges" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="badges">Badges</TabsTrigger>
                    <TabsTrigger value="rewards">Rewards</TabsTrigger>
                </TabsList>

                <TabsContent value="badges" className="mt-6">
                    <BadgeCollection
                        badges={badges}
                        unlockedBadges={progress.achievements}
                    />
                </TabsContent>

                <TabsContent value="rewards" className="mt-6">
                    <RewardsGallery
                        rewards={REWARDS}
                        currentLevel={progress.level}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
