// YouTube video suggestion types

export interface VideoSuggestion {
  videoId: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: string;
  channelTitle?: string;
  searchKeywords?: string[]; // For AI search fallback
}

export interface ChapterVideoMapping {
  chapterName: string;
  videos: VideoSuggestion[];
  searchKeywords?: string[]; // Fallback for AI search
}

export interface YouTubeVideoDetails {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
  };
  contentDetails: {
    duration: string; // ISO 8601 format (e.g., "PT4M13S")
  };
}

export interface YouTubeSearchResult {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    channelTitle: string;
  };
}
