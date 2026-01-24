"use client";

import { useState, useEffect } from 'react';
import { VideoSuggestion } from '@/lib/youtube/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayCircle, X, ChevronDown, ChevronUp, Youtube, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoSuggestionProps {
    videos: VideoSuggestion[];
    subject: string;
    chapterName: string;
    className?: string;
}

export default function VideoSuggestionComponent({
    videos,
    subject,
    chapterName,
    className
}: VideoSuggestionProps) {
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading time for video embed
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, [activeVideoIndex]);

    if (!videos || videos.length === 0) {
        return (
            <Card className={cn("border-dashed", className)}>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-lg">Video Tutorials</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                            No video tutorials available for this chapter yet.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const activeVideo = videos[activeVideoIndex];

    return (
        <Card className={cn("sticky top-24", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Youtube className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-lg">Video Tutorials</CardTitle>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="lg:hidden"
                    >
                        {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                </div>
                <CardDescription className="text-xs">
                    {subject} - {chapterName}
                </CardDescription>
            </CardHeader>

            {!isCollapsed && (
                <CardContent className="space-y-4">
                    {/* Video Player */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                        {isLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : (
                            <iframe
                                src={`https://www.youtube.com/embed/${activeVideo.videoId}?rel=0`}
                                title={activeVideo.title || 'Educational Video'}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="h-full w-full"
                            />
                        )}
                    </div>

                    {/* Video Info */}
                    {activeVideo.title && (
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold line-clamp-2">
                                {activeVideo.title}
                            </h4>
                            {activeVideo.channelTitle && (
                                <p className="text-xs text-muted-foreground">
                                    {activeVideo.channelTitle}
                                </p>
                            )}
                            {activeVideo.duration && (
                                <p className="text-xs text-muted-foreground">
                                    Duration: {activeVideo.duration}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Video List */}
                    {videos.length > 1 && (
                        <div className="space-y-2">
                            <h5 className="text-sm font-medium">More Videos ({videos.length})</h5>
                            <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                                <div className="space-y-2">
                                    {videos.map((video, index) => (
                                        <button
                                            key={video.videoId}
                                            onClick={() => {
                                                setActiveVideoIndex(index);
                                                setIsLoading(true);
                                            }}
                                            className={cn(
                                                "flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted",
                                                activeVideoIndex === index && "bg-primary/10 border border-primary"
                                            )}
                                        >
                                            {/* Thumbnail */}
                                            <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded bg-muted">
                                                {video.thumbnailUrl ? (
                                                    <img
                                                        src={video.thumbnailUrl}
                                                        alt={video.title || 'Video thumbnail'}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <PlayCircle className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                )}
                                                {video.duration && (
                                                    <div className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] text-white">
                                                        {video.duration}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Video Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium line-clamp-2">
                                                    {video.title || `Video ${index + 1}`}
                                                </p>
                                                {video.channelTitle && (
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        {video.channelTitle}
                                                    </p>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {/* Open in YouTube */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                    >
                        <a
                            href={`https://www.youtube.com/watch?v=${activeVideo.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Youtube className="mr-2 h-4 w-4" />
                            Watch on YouTube
                        </a>
                    </Button>
                </CardContent>
            )}
        </Card>
    );
}
