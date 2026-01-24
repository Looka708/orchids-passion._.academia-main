"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

interface XPNotificationProps {
    xpGained: number;
    reason: string;
    show: boolean;
}

export default function XPNotification({ xpGained, reason, show }: XPNotificationProps) {
    const { toast } = useToast();

    useEffect(() => {
        if (show && xpGained > 0) {
            toast({
                title: (
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        <span>+{xpGained} XP Earned!</span>
                    </div>
                ) as any,
                description: reason,
                duration: 3000,
            });
        }
    }, [show, xpGained, reason, toast]);

    return null;
}

// Hook for showing XP notifications
export function useXPNotification() {
    const { toast } = useToast();

    const showXPGain = (xpGained: number, reason: string) => {
        toast({
            title: (
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                    <span className="font-bold">+{xpGained} XP</span>
                </div>
            ) as any,
            description: reason,
            duration: 3000,
        });
    };

    return { showXPGain };
}
