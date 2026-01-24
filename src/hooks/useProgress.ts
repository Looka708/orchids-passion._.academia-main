"use client";

import { useState, useEffect } from 'react';
import { StudentProgress } from '@/lib/types/progress';
import {
    getUserProgress,
    awardXP,
    updateUserStats,
    checkAchievements,
    updateStreak
} from '@/lib/progress/progressService';
import { useAuth } from '@/hooks/useAuth';
import { useXPNotification } from '@/components/progress/XPNotification';
import { calculateQuizXP, calculateQuestionXP } from '@/lib/progress/xpCalculator';

export function useProgress() {
    const { user } = useAuth();
    const [progress, setProgress] = useState<StudentProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const { showXPGain } = useXPNotification();

    // Load progress on mount
    useEffect(() => {
        async function loadProgress() {
            if (!user?.email) {
                setLoading(false);
                return;
            }

            try {
                const userProgress = await getUserProgress(user.email);
                setProgress(userProgress);
            } catch (error) {
                console.error('Error loading progress:', error);
            } finally {
                setLoading(false);
            }
        }

        loadProgress();
    }, [user]);

    // Award XP for answering a question
    const awardQuestionXP = async (isCorrect: boolean) => {
        if (!user?.email) return;

        const xp = calculateQuestionXP(isCorrect);
        if (xp === 0) return;

        try {
            const result = await awardXP(user.email, xp, 'question', { isCorrect });
            setProgress(result.newProgress);

            showXPGain(xp, isCorrect ? 'Correct answer!' : 'Keep trying!');

            // Update stats
            await updateUserStats(user.email, {
                questionsAnswered: 1,
                correctAnswers: isCorrect ? 1 : 0
            });

            // Check for new achievements
            const newAchievements = await checkAchievements(user.email);
            if (newAchievements.length > 0) {
                // Reload progress to get updated achievements
                const updatedProgress = await getUserProgress(user.email);
                setProgress(updatedProgress);
            }

            if (result.leveledUp) {
                showXPGain(0, `🎉 Level Up! You're now level ${result.newLevel}!`);
            }
        } catch (error) {
            console.error('Error awarding question XP:', error);
        }
    };

    // Award XP for completing a quiz
    const awardQuizXP = async (score: number, totalQuestions: number, isFirstPerfect: boolean = false) => {
        if (!user?.email) return;

        const xp = calculateQuizXP(score, totalQuestions, isFirstPerfect);

        try {
            const result = await awardXP(user.email, xp, 'quiz', {
                score,
                totalQuestions,
                percentage: Math.round((score / totalQuestions) * 100)
            });

            setProgress(result.newProgress);

            const isPerfect = score === totalQuestions;
            showXPGain(
                xp,
                isPerfect ? '🎯 Perfect Score!' : `Quiz completed: ${score}/${totalQuestions}`
            );

            // Update stats
            await updateUserStats(user.email, {
                quizzesCompleted: 1,
                perfectScores: isPerfect ? 1 : 0
            });

            // Check for new achievements
            const newAchievements = await checkAchievements(user.email);
            if (newAchievements.length > 0) {
                const updatedProgress = await getUserProgress(user.email);
                setProgress(updatedProgress);
            }

            if (result.leveledUp) {
                showXPGain(0, `🎉 Level Up! You're now level ${result.newLevel}!`);
            }
        } catch (error) {
            console.error('Error awarding quiz XP:', error);
        }
    };

    // Award XP for completing a chapter
    const awardChapterXP = async (chapterName: string) => {
        if (!user?.email) return;

        try {
            const result = await awardXP(user.email, 100, 'chapter', { chapterName });
            setProgress(result.newProgress);

            showXPGain(100, `Chapter completed: ${chapterName}`);

            await updateUserStats(user.email, {
                chaptersCompleted: 1
            });

            const newAchievements = await checkAchievements(user.email);
            if (newAchievements.length > 0) {
                const updatedProgress = await getUserProgress(user.email);
                setProgress(updatedProgress);
            }

            if (result.leveledUp) {
                showXPGain(0, `🎉 Level Up! You're now level ${result.newLevel}!`);
            }
        } catch (error) {
            console.error('Error awarding chapter XP:', error);
        }
    };

    // Update daily streak
    const checkStreak = async () => {
        if (!user?.email) return;

        try {
            await updateStreak(user.email);
            const updatedProgress = await getUserProgress(user.email);
            setProgress(updatedProgress);
        } catch (error) {
            console.error('Error updating streak:', error);
        }
    };

    // Refresh progress
    const refreshProgress = async () => {
        if (!user?.email) return;

        try {
            const updatedProgress = await getUserProgress(user.email);
            setProgress(updatedProgress);
        } catch (error) {
            console.error('Error refreshing progress:', error);
        }
    };

    return {
        progress,
        loading,
        awardQuestionXP,
        awardQuizXP,
        awardChapterXP,
        checkStreak,
        refreshProgress
    };
}
