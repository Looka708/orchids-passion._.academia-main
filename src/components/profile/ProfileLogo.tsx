"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProfileLogoProps {
    className?: string;
    size?: number;
}

export function ProfileLogo({ className, size = 120 }: ProfileLogoProps) {
    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative z-10 p-2 bg-gradient-to-b from-white/10 to-transparent rounded-2xl border border-white/20 backdrop-blur-sm shadow-xl">
                <Image
                    src="/profile_logo.png"
                    alt="Profile Logo"
                    width={size}
                    height={size}
                    className="object-contain drop-shadow-lg"
                    priority
                />
            </div>
        </div>
    );
}
