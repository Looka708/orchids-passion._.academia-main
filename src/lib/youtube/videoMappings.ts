import { VideoSuggestion } from './types';
import * as ilmkidunya from './ilmkidunyaMappings';

/**
 * Comprehensive YouTube video suggestions for all classes and subjects
 * 
 * Strategy:
 * 1. Search ilmkidunya videos (fetched from API)
 * 2. AI search fallback for all other chapters (automatic)
 */

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get video suggestions for a specific chapter
 * Returns ilmkidunya mappings if available, otherwise returns empty array for AI search fallback
 */
export function getChapterVideos(
    subject: string,
    grade: string | number,
    chapterName: string
): VideoSuggestion[] {
    const gradeStr = String(grade).toLowerCase();
    const subjectLower = subject.toLowerCase();

    // Check ilmkidunya videos
    const ilmkidunyaResults = searchIlmkidunyaVideos(gradeStr, subjectLower, chapterName);
    if (ilmkidunyaResults.length > 0) {
        return ilmkidunyaResults;
    }

    // Return empty array - caller should use AI search fallback
    return [];
}

/**
 * Search ilmkidunya videos for matching content
 */
function searchIlmkidunyaVideos(grade: string, subject: string, chapterName: string): VideoSuggestion[] {
    // Construct variable name (e.g., Class9BiologyVideos)
    let className = '';
    if (['5', '6', '7', '8', '9', '10', '11', '12'].includes(grade)) {
        className = `Class${grade}`;
    } else {
        return [];
    }

    const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
    const varName = `${className}${subjectName}Videos`;

    // Access the array dynamically from the imported module
    // @ts-ignore - Dynamic access to imported module
    const videos = (ilmkidunya as any)[varName];

    if (!videos || !Array.isArray(videos)) return [];

    // Filter videos based on chapter name
    // 1. Exact match (case insensitive)
    // 2. Contains all significant words
    const chapterLower = chapterName.toLowerCase();
    const keywords = chapterLower.split(/[\s-]+/).filter(w => w.length > 3 && !['unit', 'chapter', 'class', 'part'].includes(w));

    const matches = videos.filter((v: any) => {
        const titleLower = v.title.toLowerCase();

        // Filter out Shorts
        if (titleLower.includes('#shorts') || titleLower.includes('shorts')) return false;

        // High priority: Title contains full chapter name
        if (titleLower.includes(chapterLower)) return true;

        // Medium priority: Title contains most keywords
        if (keywords.length > 0) {
            const matchCount = keywords.filter(k => titleLower.includes(k)).length;
            return matchCount >= Math.ceil(keywords.length * 0.75); // 75% match
        }

        return false;
    });

    // Map to VideoSuggestion format
    return matches.slice(0, 6).map((v: any) => ({
        videoId: v.videoId,
        title: v.title,
        description: '', // Not available in mapping
        thumbnailUrl: `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`,
        duration: '', // Not available in mapping
        channelTitle: 'ilmkidunya'
    }));
}

/**
 * Get search keywords for AI fallback
 */
export function getSearchKeywords(
    subject: string,
    grade: string | number,
    chapterName: string
): string[] {
    const videos = getChapterVideos(subject, grade, chapterName);

    if (videos.length > 0 && videos[0].searchKeywords) {
        return videos[0].searchKeywords;
    }

    // Default search query
    const gradeStr = String(grade);
    return [
        `${chapterName} ${subject} class ${gradeStr}`,
        `${chapterName} ${subject} tutorial`,
        `${chapterName} explained`
    ];
}
