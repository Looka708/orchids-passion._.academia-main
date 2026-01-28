"use client";

import { useState } from "react";
import Link from "next/link";
import { MiniProfile } from "@/components/profile/MiniProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { getLevelColor } from "@/lib/progress/levelSystem";

interface LeaderboardEntry {
    userId: string;
    userName: string;
    totalXP: number;
    level: number;
    rank: number;
}

interface LeaderboardProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
}

export default function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [miniProfileOpen, setMiniProfileOpen] = useState(false);

    const handleUserClick = (userId: string) => {
        setSelectedUserId(userId);
        setMiniProfileOpen(true);
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy className="h-6 w-6 text-yellow-500" />;
            case 2:
                return <Medal className="h-6 w-6 text-gray-400" />;
            case 3:
                return <Award className="h-6 w-6 text-amber-600" />;
            default:
                return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
        }
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return "bg-yellow-500 text-white";
        if (rank === 2) return "bg-gray-400 text-white";
        if (rank === 3) return "bg-amber-600 text-white";
        return "bg-muted";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Leaderboard
                </CardTitle>
                <CardDescription>Top students by total XP</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {entries.map((entry) => {
                        const isCurrentUser = entry.userId === currentUserId;
                        const levelColor = getLevelColor(entry.level);

                        return (
                            <div
                                key={entry.userId}
                                onClick={() => handleUserClick(entry.userId)}
                                className={`
                  flex items-center gap-4 p-3 rounded-lg border cursor-pointer
                  ${isCurrentUser ? 'bg-primary/5 border-primary' : 'bg-background'}
                  transition-all hover:shadow-md hover:border-primary/50
                `}
                            >
                                {/* Rank */}
                                <div className="flex items-center justify-center w-12">
                                    {getRankIcon(entry.rank)}
                                </div>

                                {/* Avatar */}
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className={getRankBadge(entry.rank)}>
                                        {entry.userName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>


                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold truncate hover:text-primary transition-colors">
                                            {entry.userName}
                                        </span>
                                        {isCurrentUser && (
                                            <span className="ml-2 text-xs text-primary">(You)</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className={levelColor}>Level {entry.level}</span>
                                        <span>•</span>
                                        <span>{entry.totalXP.toLocaleString()} XP</span>
                                    </div>
                                </div>

                                {/* Rank Badge */}
                                {entry.rank <= 3 && (
                                    <Badge className={getRankBadge(entry.rank)}>
                                        Top {entry.rank}
                                    </Badge>
                                )}
                            </div>
                        );
                    })}

                    {entries.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No leaderboard data yet</p>
                            <p className="text-sm">Start earning XP to appear here!</p>
                        </div>
                    )}
                </div>
            </CardContent>

            <MiniProfile
                userId={selectedUserId}
                open={miniProfileOpen}
                onOpenChange={setMiniProfileOpen}
            />
        </Card>
    );
}
