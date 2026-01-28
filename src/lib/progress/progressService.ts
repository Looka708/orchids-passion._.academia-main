import {
    collection,
    collectionGroup,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { StudentProgress, XPActivity, StudentStats } from '@/lib/types/progress';
import { getLevelFromXP, getXPForCurrentLevel, getXPForNextLevel } from './levelSystem';
import { ACHIEVEMENTS } from './achievements';

// Initialize progress for new user
export async function initializeUserProgress(userId: string): Promise<StudentProgress> {
    const progressRef = doc(db, 'users', userId, 'progress', 'current');

    const initialProgress: StudentProgress = {
        userId,
        totalXP: 0,
        level: 1,
        currentLevelXP: 0,
        nextLevelXP: 100,
        streak: 0,
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
        rewards: []
    };

    await setDoc(progressRef, {
        ...initialProgress,
        lastActive: serverTimestamp()
    });

    return initialProgress;
}

// Get user progress
export async function getUserProgress(userId: string): Promise<StudentProgress | null> {
    const progressRef = doc(db, 'users', userId, 'progress', 'current');
    const progressSnap = await getDoc(progressRef);

    if (!progressSnap.exists()) {
        return await initializeUserProgress(userId);
    }

    const data = progressSnap.data();
    return {
        ...data,
        lastActive: data.lastActive?.toDate() || new Date()
    } as StudentProgress;
}

// Award XP to user
export async function awardXP(
    userId: string,
    xpAmount: number,
    activityType: string,
    details: any = {}
): Promise<{ newProgress: StudentProgress; leveledUp: boolean; newLevel?: number }> {
    const progressRef = doc(db, 'users', userId, 'progress', 'current');
    const currentProgress = await getUserProgress(userId);

    if (!currentProgress) {
        throw new Error('User progress not found');
    }

    const newTotalXP = currentProgress.totalXP + xpAmount;
    const newLevel = getLevelFromXP(newTotalXP);
    const leveledUp = newLevel > currentProgress.level;

    const updatedProgress: Partial<StudentProgress> = {
        totalXP: newTotalXP,
        level: newLevel,
        currentLevelXP: getXPForCurrentLevel(newLevel),
        nextLevelXP: getXPForNextLevel(newLevel),
        lastActive: new Date()
    };

    await updateDoc(progressRef, {
        ...updatedProgress,
        lastActive: serverTimestamp()
    });

    // Log activity
    await logActivity(userId, {
        type: activityType as any,
        xpGained: xpAmount,
        timestamp: new Date(),
        details
    });

    return {
        newProgress: { ...currentProgress, ...updatedProgress } as StudentProgress,
        leveledUp,
        newLevel: leveledUp ? newLevel : undefined
    };
}

// Update user stats
export async function updateUserStats(
    userId: string,
    stats: Partial<StudentStats>
): Promise<void> {
    const progressRef = doc(db, 'users', userId, 'progress', 'current');

    const updates: any = {};
    Object.keys(stats).forEach(key => {
        updates[`stats.${key}`] = increment(stats[key as keyof StudentStats] || 0);
    });

    await updateDoc(progressRef, updates);
}

// Check and unlock achievements
export async function checkAchievements(userId: string): Promise<string[]> {
    const progress = await getUserProgress(userId);
    if (!progress) return [];

    const newAchievements: string[] = [];

    for (const achievement of ACHIEVEMENTS) {
        // Skip if already unlocked
        if (progress.achievements.includes(achievement.id)) continue;

        let unlocked = false;
        const { type, value } = achievement.criteria;

        switch (type) {
            case 'questionsAnswered':
                unlocked = progress.stats.questionsAnswered >= value;
                break;
            case 'correctAnswers':
                unlocked = progress.stats.correctAnswers >= value;
                break;
            case 'perfectScores':
                unlocked = progress.stats.perfectScores >= value;
                break;
            case 'streak':
                unlocked = progress.streak >= value;
                break;
            case 'level':
                unlocked = progress.level >= value;
                break;
            case 'chaptersCompleted':
                unlocked = progress.stats.chaptersCompleted >= value;
                break;
            case 'achievements':
                unlocked = progress.achievements.length >= value;
                break;
        }

        if (unlocked) {
            newAchievements.push(achievement.id);

            // Award achievement XP
            await awardXP(userId, achievement.xpReward, 'achievement', {
                achievementId: achievement.id,
                achievementName: achievement.name
            });
        }
    }

    if (newAchievements.length > 0) {
        const progressRef = doc(db, 'users', userId, 'progress', 'current');
        await updateDoc(progressRef, {
            achievements: [...progress.achievements, ...newAchievements]
        });
    }

    return newAchievements;
}

// Update streak
export async function updateStreak(userId: string): Promise<number> {
    const progress = await getUserProgress(userId);
    if (!progress) return 0;

    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if streak was already updated today
    if (progress.lastStreakDate === today) {
        // Already counted streak for today, just update lastActive
        const progressRef = doc(db, 'users', userId, 'progress', 'current');
        await updateDoc(progressRef, {
            lastActive: serverTimestamp()
        });
        return progress.streak;
    }

    let newStreak = progress.streak;

    // If no previous streak date (first time), start streak at 1
    if (!progress.lastStreakDate) {
        newStreak = 1;
    } else {
        // Calculate days since last streak update
        const lastStreakDate = new Date(progress.lastStreakDate);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastStreakDate.getTime()) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
            // Consecutive day - increment streak
            newStreak += 1;
            // Bonus XP for streaks
            const bonusXP = 5 + (newStreak >= 7 ? 10 : 0) + (newStreak >= 30 ? 25 : 0);
            await awardXP(userId, bonusXP, 'streak', { streakDays: newStreak });
        } else if (daysDiff > 1) {
            // Streak broken - reset to 1
            newStreak = 1;
        }
        // daysDiff === 0 shouldn't happen due to the check above, but just in case
    }

    const progressRef = doc(db, 'users', userId, 'progress', 'current');
    await updateDoc(progressRef, {
        streak: newStreak,
        lastStreakDate: today,
        lastActive: serverTimestamp()
    });

    return newStreak;
}

// Log activity
export async function logActivity(userId: string, activity: Omit<XPActivity, 'id' | 'userId'>): Promise<void> {
    const activitiesRef = collection(db, 'users', userId, 'activities');
    await addDoc(activitiesRef, {
        ...activity,
        userId,
        timestamp: serverTimestamp()
    });
}

// Get user activities
export async function getUserActivities(userId: string, limitCount: number = 10): Promise<XPActivity[]> {
    const activitiesRef = collection(db, 'users', userId, 'activities');
    const q = query(activitiesRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
    })) as XPActivity[];
}

// Get leaderboard - OPTIMIZED VERSION using collectionGroup
export async function getLeaderboard(limitCount: number = 10): Promise<Array<{
    userId: string;
    userName: string;
    photoURL?: string;
    totalXP: number;
    level: number;
    rank: number;
}>> {
    try {
        // Fetch more results to account for filtered out admin/teacher accounts
        const fetchLimit = limitCount * 3; // Fetch 3x to ensure we have enough after filtering

        // Use collectionGroup to query ALL progress documents across all users in ONE query
        const progressCollectionGroup = collectionGroup(db, 'progress');
        const progressQuery = query(
            progressCollectionGroup,
            where('totalXP', '>', 0),
            orderBy('totalXP', 'desc'),
            limit(fetchLimit)
        );

        const progressSnapshot = await getDocs(progressQuery);

        if (progressSnapshot.empty) {
            return [];
        }

        // Extract user IDs from the progress documents
        const userIds = progressSnapshot.docs.map(doc => {
            // Progress doc path is: users/{userId}/progress/current
            const pathParts = doc.ref.path.split('/');
            return pathParts[1]; // userId is at index 1
        });

        // Batch fetch user data for all users at once
        const userDataPromises = userIds.map(userId =>
            getDoc(doc(db, 'users', userId))
        );

        const userDocs = await Promise.all(userDataPromises);

        // Build leaderboard data and filter out teachers/admins/owners
        const leaderboardData = progressSnapshot.docs
            .map((progressDoc, index) => {
                const progress = progressDoc.data() as { totalXP: number; level: number };
                const userDoc = userDocs[index];
                const userData = userDoc.exists() ? userDoc.data() as { name?: string; email?: string; role?: string; photoURL?: string } : {};

                return {
                    userId: userIds[index],
                    userName: userData.name || userData.email || 'Anonymous',
                    photoURL: userData.photoURL,
                    totalXP: progress.totalXP || 0,
                    level: progress.level || 1,
                    role: userData.role || 'user', // Default to 'user' if no role specified
                    rank: 0 // Will be set after filtering
                };
            })
            // Filter out teachers, admins, and owners - only show regular students
            .filter(entry => {
                const isStudent = entry.role === 'user';
                return isStudent;
            })
            // Limit to requested count
            .slice(0, limitCount)
            // Assign ranks after filtering
            .map((entry, index) => ({
                userId: entry.userId,
                userName: entry.userName,
                photoURL: entry.photoURL,
                totalXP: entry.totalXP,
                level: entry.level,
                rank: index + 1
            }));

        return leaderboardData;
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        // Fallback to empty array on error
        return [];
    }
}

// Get user rank - OPTIMIZED VERSION
export async function getUserRank(userId: string): Promise<number> {
    try {
        const leaderboard = await getLeaderboard(100); // Reasonable limit
        const userEntry = leaderboard.find(entry => entry.userId === userId);
        return userEntry?.rank || 0;
    } catch (error) {
        console.error('Error getting user rank:', error);
        return 0;
    }
}
