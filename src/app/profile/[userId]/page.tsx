import { notFound } from 'next/navigation';
import { getUserByEmail } from '@/lib/users';
import { getUserProgress } from '@/lib/progress/progressService';
import ProfileCard from '@/components/profile/ProfileCard';

interface ProfilePageProps {
    params: Promise<{
        userId: string;
    }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const { userId } = await params;

    // Decode userId (email) from URL
    const decodedUserId = decodeURIComponent(userId);

    // Fetch user data
    const user = await getUserByEmail(decodedUserId);

    if (!user) {
        notFound();
    }

    // Fetch user progress
    const progress = await getUserProgress(decodedUserId);

    if (!progress) {
        notFound();
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <ProfileCard
                user={user}
                userLevel={progress.level}
                totalXP={progress.totalXP}
                currentStreak={progress.streak}
                badges={progress.badges}
            />
        </div>
    );
}
