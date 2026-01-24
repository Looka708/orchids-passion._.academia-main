"use client";

import ProgressBar from "@/components/progress/ProgressBar";
import { useProgress } from "@/hooks/useProgress";
import { useAuth } from "@/hooks/useAuth";

export default function ProgressHeader() {
    const { isAuthenticated } = useAuth();
    const { progress, loading } = useProgress();

    if (!isAuthenticated || loading || !progress) {
        return null;
    }

    return (
        <div className="w-full max-w-xs">
            <ProgressBar
                totalXP={progress.totalXP}
                level={progress.level}
                currentLevelXP={progress.currentLevelXP}
                nextLevelXP={progress.nextLevelXP}
                showDetails={false}
            />
        </div>
    );
}
