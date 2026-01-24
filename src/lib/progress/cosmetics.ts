export interface CosmeticItem {
    id: string;
    name: string;
    description: string;
    preview: string; // CSS class or gradient
    type: 'frame' | 'theme';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    requiredLevel: number;
    ownerOnly?: boolean;
}

export const AVATAR_FRAMES: CosmeticItem[] = [
    {
        id: 'none',
        name: 'None',
        description: 'No frame',
        preview: 'border-transparent',
        type: 'frame',
        rarity: 'common',
        requiredLevel: 0
    },
    {
        id: 'bronze',
        name: 'Bronze Scholar',
        description: 'For dedicated beginners',
        preview: 'ring-4 ring-[#CD7F32] shadow-[0_0_10px_rgba(205,127,50,0.5)]',
        type: 'frame',
        rarity: 'common',
        requiredLevel: 5
    },
    {
        id: 'silver',
        name: 'Silver Sage',
        description: 'A mark of steady progress',
        preview: 'ring-4 ring-[#C0C0C0] shadow-[0_0_10px_rgba(192,192,192,0.5)]',
        type: 'frame',
        rarity: 'rare',
        requiredLevel: 10
    },
    {
        id: 'gold',
        name: 'Golden Elite',
        description: 'Excellence in every lesson',
        preview: 'ring-4 ring-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.6)]',
        type: 'frame',
        rarity: 'rare',
        requiredLevel: 15
    },
    {
        id: 'diamond',
        name: 'Diamond Master',
        description: 'Refined knowledge and skill',
        preview: 'ring-4 ring-[#B9F2FF] shadow-[0_0_20px_rgba(185,242,255,0.7)] animate-pulse',
        type: 'frame',
        rarity: 'epic',
        requiredLevel: 20
    },
    {
        id: 'neon',
        name: 'Cyber Prodigy',
        description: 'The future of learning',
        preview: 'ring-4 ring-[#00F3FF] shadow-[0_0_20px_rgba(0,243,255,0.8)] border-2 border-white',
        type: 'frame',
        rarity: 'epic',
        requiredLevel: 25
    },
    {
        id: 'owner',
        name: 'Founders Halo',
        description: 'The ultimate mark of authority',
        preview: 'ring-4 ring-primary shadow-[0_0_25px_rgba(var(--primary),0.8)] border-2 border-yellow-400 animate-bounce-slow',
        type: 'frame',
        rarity: 'legendary',
        requiredLevel: 0,
        ownerOnly: true
    }
];

export const PROFILE_THEMES: CosmeticItem[] = [
    {
        id: 'default',
        name: 'Academic Clean',
        description: 'Classic professional look',
        preview: 'bg-card border-border',
        type: 'theme',
        rarity: 'common',
        requiredLevel: 0
    },
    {
        id: 'midnight',
        name: 'Midnight Study',
        description: 'Focus in the dark of night',
        preview: 'bg-[#0F172A] border-[#1E293B] text-slate-100',
        type: 'theme',
        rarity: 'rare',
        requiredLevel: 8
    },
    {
        id: 'sunset',
        name: 'Sunset Glow',
        description: 'Warm colors for evening review',
        preview: 'bg-gradient-to-br from-orange-500/10 to-pink-500/10 border-orange-200/50',
        type: 'theme',
        rarity: 'rare',
        requiredLevel: 12
    },
    {
        id: 'ocean',
        name: 'Ocean Depths',
        description: 'Calm and deep learning',
        preview: 'bg-gradient-to-br from-blue-600/10 to-cyan-500/10 border-blue-200/50',
        type: 'theme',
        rarity: 'epic',
        requiredLevel: 18
    },
    {
        id: 'emerald',
        name: 'Emerald Forest',
        description: 'Growth and prosperity',
        preview: 'bg-gradient-to-br from-emerald-600/10 to-teal-500/10 border-emerald-200/50',
        type: 'theme',
        rarity: 'epic',
        requiredLevel: 22
    },
    {
        id: 'owner',
        name: 'Royal Archive',
        description: 'Exclusive to the institution founders',
        preview: 'bg-gradient-to-br from-yellow-500/20 via-primary/10 to-yellow-500/20 border-yellow-400/50',
        type: 'theme',
        rarity: 'legendary',
        requiredLevel: 0,
        ownerOnly: true
    }
];
