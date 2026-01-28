
export type EffectType = 'avatar' | 'profile';

export interface CosmeticEffect {
    id: string;
    name: string;
    description: string;
    type: EffectType;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockCriteria: string; // Human readable description
    previewImage?: string;
    className: string; // CSS class that applies the effect
}

export const AVATAR_EFFECTS: CosmeticEffect[] = [
    {
        id: 'none',
        name: 'None',
        description: 'Standard avatar look',
        type: 'avatar',
        rarity: 'common',
        unlockCriteria: 'Default',
        className: ''
    },
    {
        id: 'glow_green',
        name: 'Emerald Glow',
        description: 'A soft green pulse around your avatar',
        type: 'avatar',
        rarity: 'common',
        unlockCriteria: 'Reach Level 5',
        className: 'effect-glow-green'
    },
    {
        id: 'neon_ring',
        name: 'Neon Horizon',
        description: 'A vibrant cycling neon ring',
        type: 'avatar',
        rarity: 'rare',
        unlockCriteria: 'Complete 100 questions',
        className: 'effect-neon-ring'
    },
    {
        id: 'sparkle_gold',
        name: 'Golden Stardust',
        description: 'Elegant golden sparkles',
        type: 'avatar',
        rarity: 'epic',
        unlockCriteria: 'Achieve 5 perfect scores',
        className: 'effect-sparkle-gold'
    },
    {
        id: 'legendary_aura',
        name: 'Divine Aura',
        description: 'The ultimate radiating energy',
        type: 'avatar',
        rarity: 'legendary',
        unlockCriteria: 'Reach Level 25',
        className: 'effect-legendary-aura'
    }
];

export const PROFILE_EFFECTS: CosmeticEffect[] = [
    {
        id: 'none',
        name: 'Standard',
        description: 'Clean profile background',
        type: 'profile',
        rarity: 'common',
        unlockCriteria: 'Default',
        className: ''
    },
    {
        id: 'glass_frost',
        name: 'Frosted Glass',
        description: 'Enhanced frosting effect for your cards',
        type: 'profile',
        rarity: 'common',
        unlockCriteria: 'Reach Level 10',
        className: 'effect-glass-frost'
    },
    {
        id: 'animated_grid',
        name: 'Cyber Grid',
        description: 'A moving digital grid background',
        type: 'profile',
        rarity: 'rare',
        unlockCriteria: '7-day login streak',
        className: 'effect-cyber-grid'
    },
    {
        id: 'cosmic_drift',
        name: 'Cosmic Drift',
        description: 'Floating stars and nebulae',
        type: 'profile',
        rarity: 'epic',
        unlockCriteria: 'Complete 500 questions',
        className: 'effect-cosmic-drift'
    }
];

export const ALL_EFFECTS = [...AVATAR_EFFECTS, ...PROFILE_EFFECTS];
