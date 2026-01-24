"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, BookOpen, Trophy, ArrowRight } from 'lucide-react';

export default function QuickStart() {
    return (
        <Card id="quick-start-card" className="mb-8 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold flex items-center">
                    🚀 Quick Start
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link href="/classes/9/mathematics" className="group">
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100">
                            <div className="p-2 bg-blue-500 rounded-full text-white group-hover:scale-110 transition-transform">
                                <PlayCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-blue-900">Watch a Video</h4>
                                <p className="text-xs text-blue-700">Continue where you left off</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/exam-generator" className="group">
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-100">
                            <div className="p-2 bg-purple-500 rounded-full text-white group-hover:scale-110 transition-transform">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-purple-900">Take a Quiz</h4>
                                <p className="text-xs text-purple-700">Test your knowledge</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="#leaderboard-section" className="group">
                        <div className="flex items-center space-x-3 p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-100">
                            <div className="p-2 bg-amber-500 rounded-full text-white group-hover:scale-110 transition-transform">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-amber-900">View Leaderboard</h4>
                                <p className="text-xs text-amber-700">See your ranking</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
