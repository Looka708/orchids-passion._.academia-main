"use client";

import { useEffect } from "react";
import StudentDashboard from "@/components/progress/StudentDashboard";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { grantAdminMaxProgress } from "@/lib/progress/adminBoost";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProgress } from "@/hooks/useProgress";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import TourDriver from "@/components/onboarding/TourDriver";
import QuickStart from "@/components/dashboard/QuickStart";
import { useState } from "react";
import QuizLoading from "@/components/quiz/QuizLoading";

export default function DashboardPage() {
    const { isAuthenticated, user, firebaseUser, isLoading: authLoading, refreshUser, emailVerified } = useAuth();
    const { progress, loading: progressLoading, refreshProgress } = useProgress();

    // Onboarding State - must be declared before any conditional returns
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [startTour, setStartTour] = useState(false);

    // Onboarding effect - must be declared before any conditional returns
    useEffect(() => {
        if (user && !user.hasCompletedOnboarding) {
            setShowOnboarding(true);
        }
    }, [user]);

    const handleOnboardingComplete = async () => {
        setShowOnboarding(false);
        // Refresh user data to get the updated hasCompletedOnboarding flag
        await refreshUser();
        setStartTour(true);
    };

    // Admin Boost Logic
    useEffect(() => {
        if (progress && (user?.role === 'owner' || user?.role === 'admin')) {
            if (progress.totalXP < 150000 && firebaseUser?.uid) {
                grantAdminMaxProgress(firebaseUser.uid)
                    .then(() => refreshProgress())
                    .catch(err => console.error("Admin boost error:", err));
            }
        }
    }, [progress, user, firebaseUser, refreshProgress]);

    // Wait for auth to finish loading before making any decisions
    if (authLoading) {
        return <QuizLoading className="min-h-screen" />;
    }

    // After auth loads, check if user is authenticated
    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold mb-4">Please Sign In</h1>
                <p className="text-muted-foreground mb-6">
                    You need to be signed in to view your progress dashboard
                </p>
                <Button asChild>
                    <Link href="/signin">Sign In</Link>
                </Button>
            </div>
        );
    }    // Check if email is verified
    if (!emailVerified) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold mb-4">Verification Required</h1>
                <p className="text-muted-foreground mb-6">
                    You must verify your account with the 9-digit code sent to your Gmail before accessing the dashboard.
                </p>
                <Button asChild>
                    <Link href="/">Go to Home to Verify</Link>
                </Button>
            </div>
        );
    }

    // Show loading while progress is being fetched
    if (progressLoading && !progress) {
        return <QuizLoading className="min-h-screen" />;
    }

    // Default progress for custom users if not found (fallback)
    const displayProgress = progress || (user ? {
        userId: user.email || (user as any).uid || 'custom-user',
        totalXP: (user.role === 'owner' || user.role === 'admin') ? 150000 : 0,
        level: (user.role === 'owner' || user.role === 'admin') ? 25 : 1,
        currentLevelXP: (user.role === 'owner' || user.role === 'admin') ? 130000 : 0,
        nextLevelXP: (user.role === 'owner' || user.role === 'admin') ? 130000 : 100,
        streak: (user.role === 'owner' || user.role === 'admin') ? 365 : 0,
        lastActive: new Date(),
        achievements: [],
        badges: [],
        stats: {
            questionsAnswered: 0,
            correctAnswers: 0,
            studyTimeMinutes: 0,
            chaptersCompleted: 0,
            perfectScores: 0,
            quizzesCompleted: 0
        },
        rewards: [],
        name: user.name || user.email || 'User',
        photoURL: user.photoURL || undefined
    } : null);

    // Only show error if we're authenticated but still can't load progress
    if (!displayProgress && !progressLoading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold mb-4">Error Loading Progress</h1>
                <p className="text-muted-foreground mb-6">
                    Unable to load your progress data. User: {user?.email || 'Unknown'}
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                    Debug: isAuth={isAuthenticated ? 'yes' : 'no'}, hasUser={user ? 'yes' : 'no'}, hasFirebaseUser={firebaseUser ? 'yes' : 'no'}
                </p>
                <Button asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        );
    }


    const equippedBadge = displayProgress!.badges.find(b => b.id === user?.equippedBadge);


    return (
        <div className="min-h-screen bg-muted/40 py-8">
            {showOnboarding && <OnboardingWizard onComplete={handleOnboardingComplete} />}
            <TourDriver startTour={startTour} onTourEnd={() => setStartTour(false)} />

            <div className="container mx-auto px-4">
                <div className="mb-6 flex justify-between items-center" id="dashboard-header">
                    <Button variant="ghost" asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                    <div id="user-menu">
                        {/* Placeholder for user menu target */}
                    </div>
                </div>

                <div className="mb-8 flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-lg shadow-sm border bg-card">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={user?.photoURL} />
                        <AvatarFallback className="text-2xl">{(user?.name || user?.email || "S").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl font-bold">
                                {user?.name || 'Student'}
                            </h1>
                            {equippedBadge && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-xs font-medium text-primary" title={equippedBadge.name}>
                                    <span>{equippedBadge.icon}</span>
                                    <span>{equippedBadge.name}</span>
                                </div>
                            )}
                            {user?.role === 'owner' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    👑 Owner
                                </span>
                            )}
                            {user?.role === 'admin' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    🛡️ Admin
                                </span>
                            )}
                        </div>

                        {user?.bio && (
                            <p className="text-muted-foreground max-w-2xl">
                                {user.bio}
                            </p>
                        )}

                        <div className="flex items-center gap-4 pt-2">
                            <div className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{displayProgress!.level}</span> Level
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{displayProgress!.totalXP.toLocaleString()}</span> XP
                            </div>
                        </div>
                    </div>

                    <div className="flex-shrink-0">
                        {user && (
                            <ProfileEditor
                                user={user}
                                badges={displayProgress!.badges}
                                userLevel={displayProgress!.level}
                                onUpdate={refreshProgress}
                            />
                        )}
                    </div>
                </div>

                <QuickStart />

                <div className="space-y-6">
                    <StudentDashboard progress={displayProgress!} />
                </div>
            </div>
        </div>
    );
}
