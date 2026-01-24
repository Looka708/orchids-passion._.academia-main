import useSWR from 'swr';
import { getLeaderboard } from '@/lib/progress/progressService';

export function useLeaderboard(limitCount: number = 10) {
    const { data, error, isLoading, mutate } = useSWR(
        `leaderboard-v2-${limitCount}`, // v2 to bust cache after filtering changes
        () => getLeaderboard(limitCount),
        {
            revalidateOnFocus: false,
            dedupingInterval: 300000, // Cache for 5 minutes
            refreshInterval: 300000, // Refresh every 5 minutes
            fallbackData: []
        }
    );

    return {
        leaderboard: data || [],
        isLoading,
        isError: error,
        mutate,
    };
}
