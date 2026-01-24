"use client";

import { User } from '@/lib/users';
import { Badge } from '@/lib/types/progress';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { Trophy, Flame, Star } from 'lucide-react';
import { getLevelColor } from '@/lib/progress/levelSystem';

interface ProfileCardProps {
    user: User;
    userLevel: number;
    totalXP: number;
    currentStreak: number;
    badges: Badge[];
}

export default function ProfileCard({ user, userLevel, totalXP, currentStreak, badges }: ProfileCardProps) {
    const levelColor = getLevelColor(userLevel);

    return (
        <Card className="relative overflow-hidden">
            {/* Content */}
            <div className="relative z-10">
                <CardHeader className="text-center pb-4">
                    {/* Avatar without Frame */}
                    <div className="flex justify-center mb-4">
                        <Avatar className="h-32 w-32">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback className="text-4xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </div>

                    {/* User Info */}
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    {user.bio && (
                        <p className="text-muted-foreground mt-2 max-w-md mx-auto">{user.bio}</p>
                    )}

                    {/* Stats */}
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${levelColor}`}>
                                {userLevel}
                            </div>
                            <div className="text-xs text-muted-foreground">Level</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                                {totalXP.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">Total XP</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-500">
                                {currentStreak}
                            </div>
                            <div className="text-xs text-muted-foreground">Day Streak</div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Badges Section */}
                    {badges.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                Badges ({badges.length})
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {badges.map((badge) => (
                                    <div
                                        key={badge.id}
                                        className="flex flex-col items-center p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                                    >
                                        <div className="text-3xl mb-2">{badge.icon}</div>
                                        <div className="text-xs font-medium text-center">{badge.name}</div>
                                        <div className="text-xs text-muted-foreground text-center mt-1">
                                            {badge.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {badges.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No badges earned yet</p>
                            <p className="text-sm">Keep learning to earn badges!</p>
                        </div>
                    )}
                </CardContent>
            </div>
        </Card>
    );
}
