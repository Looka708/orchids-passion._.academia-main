// Progress Types
export interface StudentProgress {
    userId: string;
    totalXP: number;
    level: number;
    currentLevelXP: number;
    nextLevelXP: number;
    streak: number;
    lastActive: Date;
    lastDailyQuizDate?: string; // YYYY-MM-DD format - tracks last daily quiz completion
    lastStreakDate?: string; // YYYY-MM-DD format - prevents multiple streak updates per day
    achievements: string[];
    badges: Badge[];
    stats: StudentStats;
    rewards: Reward[];
    name?: string; // Display name for leaderboard
    photoURL?: string; // Avatar URL for leaderboard
    role?: string; // User role for filtering (admin, teacher, owner, user)
}

export interface StudentStats {
    questionsAnswered: number;
    correctAnswers: number;
    studyTimeMinutes: number;
    chaptersCompleted: number;
    perfectScores: number;
    quizzesCompleted: number;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockedAt?: Date;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    xpReward: number;
    badge?: Badge;
    criteria: {
        type: string;
        value: number;
    };
}

export interface Reward {
    id: string;
    name: string;
    description: string;
    type: 'discount' | 'feature' | 'cosmetic';
    value: any;
    requiredLevel: number;
    unlocked: boolean;
}

export interface XPActivity {
    id: string;
    userId: string;
    type: 'quiz' | 'study' | 'achievement' | 'streak' | 'chapter' | 'daily_quiz';
    xpGained: number;
    timestamp: Date;
    details: {
        subject?: string;
        chapter?: string;
        score?: number;
        questionsAnswered?: number;
    };
}

// Daily Quiz Types
export interface DailyQuizQuestion {
    id: number;
    questionText: string;
    options: string[];
    correctAnswer: string;
    userAnswer?: string;
    isCorrect?: boolean;
}

export interface DailyQuizSession {
    userId: string;
    date: string; // YYYY-MM-DD format
    questions: DailyQuizQuestion[];
    currentQuestionIndex: number;
    completed: boolean;
    score: number;
    correctAnswers: number;
    startedAt: Date;
    completedAt?: Date;
}
