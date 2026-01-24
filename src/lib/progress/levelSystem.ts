// Level System with exponential progression
export const LEVEL_THRESHOLDS = [
    0,      // Level 1
    100,    // Level 2
    250,    // Level 3
    500,    // Level 4
    1000,   // Level 5
    1750,   // Level 6
    2750,   // Level 7
    4000,   // Level 8
    5500,   // Level 9
    7500,   // Level 10
    10000,  // Level 11
    13000,  // Level 12
    16500,  // Level 13
    20500,  // Level 14
    25000,  // Level 15
    30000,  // Level 16
    36000,  // Level 17
    43000,  // Level 18
    51000,  // Level 19
    60000,  // Level 20
    70000,  // Level 21
    82000,  // Level 22
    96000,  // Level 23
    112000, // Level 24
    130000  // Level 25
];

// Get level from total XP
export function getLevelFromXP(totalXP: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalXP >= LEVEL_THRESHOLDS[i]) {
            return i + 1;
        }
    }
    return 1;
}

// Get XP required for next level
export function getXPForNextLevel(currentLevel: number): number {
    if (currentLevel >= LEVEL_THRESHOLDS.length) {
        return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    }
    return LEVEL_THRESHOLDS[currentLevel];
}

// Get XP required for current level
export function getXPForCurrentLevel(currentLevel: number): number {
    if (currentLevel <= 1) return 0;
    return LEVEL_THRESHOLDS[currentLevel - 2];
}

// Get progress to next level (0-100%)
export function getLevelProgress(totalXP: number, currentLevel: number): number {
    const currentLevelXP = getXPForCurrentLevel(currentLevel);
    const nextLevelXP = getXPForNextLevel(currentLevel);
    const xpInCurrentLevel = totalXP - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;

    return Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100);
}

// Check if leveled up
export function checkLevelUp(oldXP: number, newXP: number): {
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
} {
    const oldLevel = getLevelFromXP(oldXP);
    const newLevel = getLevelFromXP(newXP);

    return {
        leveledUp: newLevel > oldLevel,
        oldLevel,
        newLevel
    };
}

// Get level title
export function getLevelTitle(level: number): string {
    if (level >= 25) return '🎓 Grand Master';
    if (level >= 20) return '👑 Master';
    if (level >= 15) return '💎 Expert';
    if (level >= 10) return '⭐ Advanced';
    if (level >= 5) return '📚 Intermediate';
    return '🌱 Beginner';
}

// Get level color
export function getLevelColor(level: number): string {
    if (level >= 25) return 'text-yellow-500';
    if (level >= 20) return 'text-purple-500';
    if (level >= 15) return 'text-blue-500';
    if (level >= 10) return 'text-green-500';
    if (level >= 5) return 'text-cyan-500';
    return 'text-gray-500';
}
