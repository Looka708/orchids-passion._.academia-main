import { Reward } from '@/lib/types/progress';

// Reward Definitions
export const REWARDS: Reward[] = [
    // Discount Rewards
    {
        id: 'discount_10',
        name: '10% Discount',
        description: 'Get 10% off on any subscription plan',
        type: 'discount',
        value: 10,
        requiredLevel: 3,
        unlocked: false
    },
    {
        id: 'discount_25',
        name: '25% Discount',
        description: 'Get 25% off on any subscription plan',
        type: 'discount',
        value: 25,
        requiredLevel: 7,
        unlocked: false
    },
    {
        id: 'discount_50',
        name: '50% Discount',
        description: 'Get 50% off on any subscription plan',
        type: 'discount',
        value: 50,
        requiredLevel: 15,
        unlocked: false
    },

    // Feature Unlocks
    {
        id: 'hints_feature',
        name: 'Hints Unlocked',
        description: 'Get hints on difficult questions',
        type: 'feature',
        value: 'hints',
        requiredLevel: 2,
        unlocked: false
    },
    {
        id: 'practice_mode',
        name: 'Practice Mode',
        description: 'Access unlimited practice questions',
        type: 'feature',
        value: 'practice',
        requiredLevel: 5,
        unlocked: false
    },
    {
        id: 'timed_challenges',
        name: 'Timed Challenges',
        description: 'Compete in timed quiz challenges',
        type: 'feature',
        value: 'timed',
        requiredLevel: 10,
        unlocked: false
    },
    {
        id: 'advanced_analytics',
        name: 'Advanced Analytics',
        description: 'Detailed performance insights and predictions',
        type: 'feature',
        value: 'analytics',
        requiredLevel: 12,
        unlocked: false
    },

    // Cosmetic Rewards
    {
        id: 'avatar_frames',
        name: 'Avatar Frames',
        description: 'Customize your profile with special frames',
        type: 'cosmetic',
        value: 'frames',
        requiredLevel: 4,
        unlocked: false
    },
    {
        id: 'profile_themes',
        name: 'Profile Themes',
        description: 'Unlock exclusive profile color themes',
        type: 'cosmetic',
        value: 'themes',
        requiredLevel: 8,
        unlocked: false
    },
    {
        id: 'animated_badges',
        name: 'Animated Badges',
        description: 'Your badges come to life with animations',
        type: 'cosmetic',
        value: 'animated',
        requiredLevel: 20,
        unlocked: false
    }
];

// Get reward icon
export function getRewardIcon(type: string): string {
    switch (type) {
        case 'discount': return '💰';
        case 'feature': return '🔓';
        case 'cosmetic': return '🎨';
        default: return '🎁';
    }
}

// Get reward color
export function getRewardColor(type: string): string {
    switch (type) {
        case 'discount': return 'text-green-600';
        case 'feature': return 'text-blue-600';
        case 'cosmetic': return 'text-purple-600';
        default: return 'text-gray-600';
    }
}

// Check if reward is unlocked
export function checkRewardUnlock(level: number, reward: Reward): boolean {
    return level >= reward.requiredLevel;
}

// Get all unlocked rewards for a level
export function getUnlockedRewards(level: number): Reward[] {
    return REWARDS.filter(reward => checkRewardUnlock(level, reward));
}

// Get next reward to unlock
export function getNextReward(level: number): Reward | null {
    const locked = REWARDS.filter(reward => !checkRewardUnlock(level, reward));
    return locked.sort((a, b) => a.requiredLevel - b.requiredLevel)[0] || null;
}
