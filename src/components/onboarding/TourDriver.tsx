"use client";

import { useEffect } from 'react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface TourDriverProps {
    startTour: boolean;
    onTourEnd: () => void;
}

export default function TourDriver({ startTour, onTourEnd }: TourDriverProps) {
    useEffect(() => {
        if (startTour) {
            const driverObj = driver({
                showProgress: true,
                animate: true,
                doneBtnText: 'Done',
                nextBtnText: 'Next',
                prevBtnText: 'Previous',
                onDestroyed: onTourEnd,
                steps: [
                    {
                        element: '#dashboard-header',
                        popover: {
                            title: 'Dashboard',
                            description: 'This is your command center. See your progress, recent activity, and quick stats here.'
                        }
                    },
                    {
                        element: '#quick-start-card',
                        popover: {
                            title: 'Quick Start',
                            description: 'Jump right into learning with these shortcuts.'
                        }
                    },
                    {
                        element: '#subjects-grid',
                        popover: {
                            title: 'Your Subjects',
                            description: 'Access all your courses, videos, and quizzes from here.'
                        }
                    },
                    {
                        element: '#leaderboard-section',
                        popover: {
                            title: 'Leaderboard',
                            description: 'Compete with other students and see where you stand!'
                        }
                    },
                    {
                        element: '#user-menu',
                        popover: {
                            title: 'Profile & Settings',
                            description: 'Manage your account, change your avatar, and sign out here.'
                        }
                    }
                ]
            });

            driverObj.drive();
        }
    }, [startTour, onTourEnd]);

    return null;
}
