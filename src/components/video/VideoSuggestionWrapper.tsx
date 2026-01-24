"use client";

import { useEffect, useState } from 'react';
import { VideoSuggestion } from '@/lib/youtube/types';
import { fetchMultipleVideoDetails, searchYouTubeVideos } from '@/lib/youtube/videoService';
import { getChapterVideos, getSearchKeywords } from '@/lib/youtube/videoMappings';
import VideoSuggestionComponent from './VideoSuggestion';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface VideoSuggestionWrapperProps {
    subject: string;
    grade: string | number;
    chapterName: string;
    className?: string;
}

export default function VideoSuggestionWrapper({
    subject,
    grade,
    chapterName,
    className
}: VideoSuggestionWrapperProps) {
    const [videos, setVideos] = useState<VideoSuggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadVideos() {
            setLoading(true);
            setError(null);

            try {
                // First, try to get manually curated videos
                const curatedVideos = getChapterVideos(subject, grade, chapterName);

                if (curatedVideos.length > 0) {
                    // Fetch full details for curated videos
                    const videoIds = curatedVideos.map(v => v.videoId);
                    const detailedVideos = await fetchMultipleVideoDetails(videoIds);
                    setVideos(detailedVideos);
                } else {
                    // Fallback to AI search
                    const keywords = getSearchKeywords(subject, grade, chapterName);
                    const searchQuery = keywords[0]; // Use first keyword
                    const searchResults = await searchYouTubeVideos(searchQuery, 3);
                    setVideos(searchResults);
                }
            } catch (err) {
                console.error('Error loading videos:', err);
                setError('Failed to load video suggestions');
            } finally {
                setLoading(false);
            }
        }

        loadVideos();
    }, [subject, grade, chapterName]);

    if (loading) {
        return (
            <Card className={className}>
                <CardHeader>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-48 mt-2" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="aspect-video w-full rounded-lg" />
                    <div className="mt-4 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={className}>
                <CardContent className="pt-6">
                    <p className="text-sm text-destructive">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <VideoSuggestionComponent
            videos={videos}
            subject={subject}
            chapterName={chapterName}
            className={className}
        />
    );
}
