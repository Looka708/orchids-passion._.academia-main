// XP Calculation Rules
export const XP_RULES = {
    CORRECT_ANSWER: 1,      // From 10
    WRONG_ANSWER: 0,
    PERFECT_QUIZ: 2,       // From 50
    DAILY_STREAK: 1,       // From 5
    COMPLETE_CHAPTER: 5,   // From 100
    STUDY_SESSION_30MIN: 2, // From 25
    FIRST_PERFECT_SCORE: 10, // From 200
    QUIZ_COMPLETION: 2      // From 20
};

// Calculate XP for answering a question
export function calculateQuestionXP(isCorrect: boolean): number {
    return isCorrect ? XP_RULES.CORRECT_ANSWER : XP_RULES.WRONG_ANSWER;
}

// Calculate XP for completing a quiz
export function calculateQuizXP(
    score: number,
    totalQuestions: number,
    isFirstPerfect: boolean = false
): number {
    const baseXP = XP_RULES.QUIZ_COMPLETION;
    const questionXP = score * XP_RULES.CORRECT_ANSWER;
    const perfectBonus = (score === totalQuestions) ? XP_RULES.PERFECT_QUIZ : 0;
    const firstPerfectBonus = isFirstPerfect ? XP_RULES.FIRST_PERFECT_SCORE : 0;

    return baseXP + questionXP + perfectBonus + firstPerfectBonus;
}

// Calculate XP for daily streak
export function calculateStreakXP(streakDays: number): number {
    return streakDays * XP_RULES.DAILY_STREAK;
}

// Calculate XP for chapter completion
export function calculateChapterXP(): number {
    return XP_RULES.COMPLETE_CHAPTER;
}

// Calculate XP for study session
export function calculateStudySessionXP(minutes: number): number {
    const sessions = Math.floor(minutes / 30);
    return sessions * XP_RULES.STUDY_SESSION_30MIN;
}

// Get total XP from activity
export function getTotalXP(activities: { type: string, value: number }[]): number {
    return activities.reduce((total, activity) => {
        switch (activity.type) {
            case 'question':
                return total + (activity.value ? XP_RULES.CORRECT_ANSWER : 0);
            case 'quiz':
                return total + activity.value;
            case 'streak':
                return total + calculateStreakXP(activity.value);
            case 'chapter':
                return total + XP_RULES.COMPLETE_CHAPTER;
            case 'study':
                return total + calculateStudySessionXP(activity.value);
            default:
                return total;
        }
    }, 0);
}
