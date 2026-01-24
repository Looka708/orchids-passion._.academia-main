import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { ACHIEVEMENTS } from './achievements';

// Give admin users maximum progress
export async function grantAdminMaxProgress(userId: string): Promise<void> {
    const progressRef = doc(db, 'users', userId, 'progress', 'current');

    // Maximum values
    const maxProgress = {
        totalXP: 150000, // More than level 25 requirement
        level: 25,
        currentLevelXP: 130000,
        nextLevelXP: 130000,
        streak: 365, // 1 year streak
        lastActive: serverTimestamp(),
        achievements: ACHIEVEMENTS.map(a => a.id), // All achievements
        stats: {
            questionsAnswered: 10000,
            correctAnswers: 9500,
            studyTimeMinutes: 10000,
            chaptersCompleted: 100,
            perfectScores: 500,
            quizzesCompleted: 1000
        }
    };

    await updateDoc(progressRef, maxProgress);
}

// Check if user is admin
export function isAdmin(userRole?: string): boolean {
    return userRole === 'admin';
}
