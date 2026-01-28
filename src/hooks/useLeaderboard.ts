import useSWR from 'swr';
import { getLeaderboard } from '@/lib/progress/progressService';

export function useLeaderboard(limitCount: number = 10) {
    const { data, error, isLoading, mutate } = useSWR(
        `leaderboard-v3-${limitCount}`, // v3 to bust cache after adding photoURL
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
