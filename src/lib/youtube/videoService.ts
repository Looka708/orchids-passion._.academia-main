import { VideoSuggestion, YouTubeVideoDetails, YouTubeSearchResult } from './types';

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Cache for video data to minimize API calls
const videoCache = new Map<string, VideoSuggestion>();

/**
 * Parse ISO 8601 duration to human-readable format
 * Example: "PT4M13S" -> "4:13"
 */
function parseDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Fetch video details from YouTube Data API
 */
export async function fetchVideoDetails(videoId: string): Promise<VideoSuggestion | null> {
    // Check cache first
    if (videoCache.has(videoId)) {
        return videoCache.get(videoId)!;
    }

    if (!YOUTUBE_API_KEY) {
        console.error('YouTube API key is not configured');
        return null;
    }

    try {
        const url = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            console.warn(`No video found for ID: ${videoId}`);
            return null;
        }

        const video: YouTubeVideoDetails = data.items[0];
        const videoSuggestion: VideoSuggestion = {
            videoId: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnailUrl: video.snippet.thumbnails.medium.url,
            duration: parseDuration(video.contentDetails.duration),
            channelTitle: video.snippet.channelTitle,
        };

        // Cache the result
        videoCache.set(videoId, videoSuggestion);

        return videoSuggestion;
    } catch (error) {
        console.error('Error fetching video details:', error);
        return null;
    }
}

/**
 * Fetch multiple video details in batch
 */
export async function fetchMultipleVideoDetails(videoIds: string[]): Promise<VideoSuggestion[]> {
    if (!YOUTUBE_API_KEY) {
        console.error('YouTube API key is not configured');
        return [];
    }

    // Filter out cached videos
    const uncachedIds = videoIds.filter(id => !videoCache.has(id));
    const cachedVideos = videoIds
        .filter(id => videoCache.has(id))
        .map(id => videoCache.get(id)!);

    if (uncachedIds.length === 0) {
        return cachedVideos;
    }

    try {
        // YouTube API allows up to 50 video IDs per request
        const url = `${YOUTUBE_API_BASE}/videos?part=snippet,contentDetails&id=${uncachedIds.join(',')}&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`YouTube API error: ${response.status}`, errorText);
            return cachedVideos;
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return cachedVideos;
        }

        const newVideos: VideoSuggestion[] = data.items
            .filter((video: any) => video?.id && video?.snippet && video?.contentDetails) // Filter out invalid items
            .map((video: YouTubeVideoDetails) => {
                const videoSuggestion: VideoSuggestion = {
                    videoId: video.id,
                    title: video.snippet.title,
                    description: video.snippet.description,
                    thumbnailUrl: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url || '',
                    duration: parseDuration(video.contentDetails.duration),
                    channelTitle: video.snippet.channelTitle,
                };

                // Cache each video
                videoCache.set(video.id, videoSuggestion);

                return videoSuggestion;
            })
            .filter((video: VideoSuggestion) => {
                // Filter out Shorts (less than 1 minute or has #shorts in title)
                const duration = video.duration || '';
                const title = video.title?.toLowerCase() || '';

                const isShort = duration.startsWith('0:') ||
                    title.includes('#shorts') ||
                    title.includes('shorts');
                return !isShort;
            });

        return [...cachedVideos, ...newVideos];
    } catch (error) {
        console.error('Error fetching multiple video details:', error);
        return cachedVideos; // Return cached videos even if fetch fails
    }
}

/**
 * Search YouTube for videos based on keywords
 * This is used as a fallback when no manual video mapping exists
 */
export async function searchYouTubeVideos(
    query: string,
    maxResults: number = 3
): Promise<VideoSuggestion[]> {
    if (!YOUTUBE_API_KEY) {
        console.error('YouTube API key is not configured');
        return [];
    }

    try {
        const url = `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(query + ' -shorts')}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}&relevanceLanguage=en&videoEmbeddable=true`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return [];
        }

        // Extract video IDs and fetch full details
        const videoIds = data.items.map((item: YouTubeSearchResult) => item.id.videoId);
        return await fetchMultipleVideoDetails(videoIds);
    } catch (error) {
        console.error('Error searching YouTube videos:', error);
        return [];
    }
}

/**
 * Clear the video cache (useful for testing or memory management)
 */
export function clearVideoCache(): void {
    videoCache.clear();
}
