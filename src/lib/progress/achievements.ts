import { Badge, Achievement } from '@/lib/types/progress';

// Badge Definitions
export const BADGES: Record<string, Badge> = {
    // Beginner Badges (Common)
    first_steps: {
        id: 'first_steps',
        name: '🎯 First Steps',
        description: 'Answered your first question',
        icon: '🎯',
        rarity: 'common'
    },
    bookworm: {
        id: 'bookworm',
        name: '📚 Bookworm',
        description: 'Completed 10 questions',
        icon: '📚',
        rarity: 'common'
    },
    perfect_start: {
        id: 'perfect_start',
        name: '⭐ Perfect Start',
        description: 'Got 100% on your first quiz',
        icon: '⭐',
        rarity: 'common'
    },

    // Progress Badges (Rare)
    on_fire: {
        id: 'on_fire',
        name: '🔥 On Fire',
        description: 'Maintained a 7-day login streak',
        icon: '🔥',
        rarity: 'rare'
    },
    perfectionist: {
        id: 'perfectionist',
        name: '💯 Perfectionist',
        description: 'Achieved 10 perfect scores',
        icon: '💯',
        rarity: 'rare'
    },
    chapter_master: {
        id: 'chapter_master',
        name: '🏆 Chapter Master',
        description: 'Completed all chapters in a subject',
        icon: '🏆',
        rarity: 'rare'
    },
    speed_demon: {
        id: 'speed_demon',
        name: '⚡ Speed Demon',
        description: 'Completed 50 questions in one day',
        icon: '⚡',
        rarity: 'rare'
    },

    // Advanced Badges (Epic)
    scholar: {
        id: 'scholar',
        name: '👑 Scholar',
        description: 'Reached level 10',
        icon: '👑',
        rarity: 'epic'
    },
    elite_student: {
        id: 'elite_student',
        name: '🌟 Elite Student',
        description: 'Answered 1000 questions correctly',
        icon: '🌟',
        rarity: 'epic'
    },
    unstoppable: {
        id: 'unstoppable',
        name: '💪 Unstoppable',
        description: 'Maintained a 30-day streak',
        icon: '💪',
        rarity: 'epic'
    },

    // Legendary Badges
    legend: {
        id: 'legend',
        name: '💎 Legend',
        description: 'Unlocked all achievements',
        icon: '💎',
        rarity: 'legendary'
    },
    grand_master: {
        id: 'grand_master',
        name: '🎓 Grand Master',
        description: 'Reached level 25',
        icon: '🎓',
        rarity: 'legendary'
    },
    genius: {
        id: 'genius',
        name: '🧠 Genius',
        description: 'Answered 5000 questions correctly',
        icon: '🧠',
        rarity: 'legendary'
    }
};

// Achievement Definitions
export const ACHIEVEMENTS: Achievement[] = [
    // Beginner Achievements
    {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Answer your first question',
        xpReward: 10,
        badge: BADGES.first_steps,
        criteria: { type: 'questionsAnswered', value: 1 }
    },
    {
        id: 'bookworm',
        name: 'Bookworm',
        description: 'Complete 10 questions',
        xpReward: 50,
        badge: BADGES.bookworm,
        criteria: { type: 'questionsAnswered', value: 10 }
    },
    {
        id: 'perfect_start',
        name: 'Perfect Start',
        description: 'Get 100% on your first quiz',
        xpReward: 100,
        badge: BADGES.perfect_start,
        criteria: { type: 'perfectScores', value: 1 }
    },

    // Progress Achievements
    {
        id: 'on_fire',
        name: 'On Fire',
        description: 'Maintain a 7-day login streak',
        xpReward: 150,
        badge: BADGES.on_fire,
        criteria: { type: 'streak', value: 7 }
    },
    {
        id: 'perfectionist',
        name: 'Perfectionist',
        description: 'Achieve 10 perfect scores',
        xpReward: 300,
        badge: BADGES.perfectionist,
        criteria: { type: 'perfectScores', value: 10 }
    },
    {
        id: 'chapter_master',
        name: 'Chapter Master',
        description: 'Complete all chapters in a subject',
        xpReward: 500,
        badge: BADGES.chapter_master,
        criteria: { type: 'chaptersCompleted', value: 10 }
    },
    {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete 50 questions in one day',
        xpReward: 200,
        badge: BADGES.speed_demon,
        criteria: { type: 'questionsAnswered', value: 50 }
    },

    // Advanced Achievements
    {
        id: 'scholar',
        name: 'Scholar',
        description: 'Reach level 10',
        xpReward: 1000,
        badge: BADGES.scholar,
        criteria: { type: 'level', value: 10 }
    },
    {
        id: 'elite_student',
        name: 'Elite Student',
        description: 'Answer 1000 questions correctly',
        xpReward: 2000,
        badge: BADGES.elite_student,
        criteria: { type: 'correctAnswers', value: 1000 }
    },
    {
        id: 'unstoppable',
        name: 'Unstoppable',
        description: 'Maintain a 30-day streak',
        xpReward: 1500,
        badge: BADGES.unstoppable,
        criteria: { type: 'streak', value: 30 }
    },

    // Legendary Achievements
    {
        id: 'legend',
        name: 'Legend',
        description: 'Unlock all achievements',
        xpReward: 5000,
        badge: BADGES.legend,
        criteria: { type: 'achievements', value: 13 }
    },
    {
        id: 'grand_master',
        name: 'Grand Master',
        description: 'Reach level 25',
        xpReward: 3000,
        badge: BADGES.grand_master,
        criteria: { type: 'level', value: 25 }
    },
    {
        id: 'genius',
        name: 'Genius',
        description: 'Answer 5000 questions correctly',
        xpReward: 10000,
        badge: BADGES.genius,
        criteria: { type: 'correctAnswers', value: 5000 }
    }
];

// Get badge by rarity color
export function getBadgeColor(rarity: string): string {
    switch (rarity) {
        case 'common': return 'text-gray-500';
        case 'rare': return 'text-blue-500';
        case 'epic': return 'text-purple-500';
        case 'legendary': return 'text-yellow-500';
        default: return 'text-gray-500';
    }
}

// Get badge border color
export function getBadgeBorderColor(rarity: string): string {
    switch (rarity) {
        case 'common': return 'border-gray-300';
        case 'rare': return 'border-blue-400';
        case 'epic': return 'border-purple-400';
        case 'legendary': return 'border-yellow-400';
        default: return 'border-gray-300';
    }
}
