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
        id: 'nature',
        name: 'Nature Whisperer',
        description: 'One with the roots of knowledge',
        preview: 'ring-4 ring-green-600 border-2 border-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.6)]',
        type: 'frame',
        rarity: 'rare',
        requiredLevel: 12
    },
    {
        id: 'fire',
        name: 'Burning Passion',
        description: 'An unquenchable thirst for learning',
        preview: 'ring-4 ring-orange-600 border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse',
        type: 'frame',
        rarity: 'epic',
        requiredLevel: 18
    },
    {
        id: 'ice',
        name: 'Crystal Clear',
        description: 'Cool intellect and sharp focus',
        preview: 'ring-4 ring-cyan-400 border-2 border-white shadow-[0_0_20px_rgba(165,243,252,0.8)]',
        type: 'frame',
        rarity: 'epic',
        requiredLevel: 22
    },
    {
        id: 'matrix',
        name: 'Digital Construct',
        description: 'Seeing the code behind the world',
        preview: 'ring-4 ring-green-500 border-dashed border-2 border-black shadow-[0_0_15px_rgba(0,255,0,0.6)] font-mono',
        type: 'frame',
        rarity: 'legendary',
        requiredLevel: 30
    },
    {
        id: 'rainbow',
        name: 'Prismatic Scholar',
        description: 'Mastery of all spectrums',
        preview: 'ring-4 ring-transparent bg-gradient-to-r from-red-500 via-green-500 to-blue-500 p-[2px] animate-spin-slow',
        type: 'frame',
        rarity: 'legendary',
        requiredLevel: 35
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
        id: 'galaxy',
        name: 'Nebula Dreams',
        description: 'Study among the stars',
        preview: 'bg-[#0f0c29] bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white border-purple-500/30',
        type: 'theme',
        rarity: 'legendary',
        requiredLevel: 30
    },
    {
        id: 'cyberpunk',
        name: 'Neon City',
        description: 'High tech, high knowledge',
        preview: 'bg-black border-2 border-neon-pink shadow-[0_0_10px_#ff00ff] text-neon-green',
        type: 'theme',
        rarity: 'epic',
        requiredLevel: 28
    },
    {
        id: 'blossom',
        name: 'Cherry Blossom',
        description: 'Peaceful spring study',
        preview: 'bg-gradient-to-r from-pink-100 to-white border-pink-200 text-pink-900',
        type: 'theme',
        rarity: 'rare',
        requiredLevel: 14
    },
    {
        id: 'vintage',
        name: 'Old Library',
        description: 'Timeless wisdom',
        preview: 'bg-[#fdfbf7] border-[#e2d9cd] text-[#5c4b37]',
        type: 'theme',
        rarity: 'common',
        requiredLevel: 5
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
