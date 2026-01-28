"use client";

import { useState } from "react";
import { User, updateUserProfile } from "@/lib/users";
import { Badge } from "@/lib/types/progress";
import { AVATAR_FRAMES, PROFILE_THEMES, CosmeticItem } from "@/lib/progress/cosmetics";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EquipSelectorProps {
    user: User;
    badges: Badge[];
    userLevel: number;
    onUpdate: () => void;
}

export function EquipSelector({ user, badges, userLevel, onUpdate }: EquipSelectorProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Check unlock status
    const framesUnlocked = userLevel >= 4 || user.role === 'owner' || user.role === 'admin';
    const themesUnlocked = userLevel >= 8 || user.role === 'owner' || user.role === 'admin';

    const handleEquip = async (type: 'frame' | 'theme' | 'badge', id: string) => {
        setLoading(true);
        try {
            const updates: Partial<User> = {};
            if (type === 'frame') updates.equippedFrame = id;
            if (type === 'theme') updates.equippedTheme = id;
            if (type === 'badge') updates.equippedBadge = id;

            await updateUserProfile(user.email, updates);
            toast({
                title: "Equipped!",
                description: `Successfully equipped ${type}.`,
            });
            onUpdate();
        } catch (error) {
            console.error("Error equipping item:", error);
            toast({
                title: "Error",
                description: "Failed to equip item.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <Tabs defaultValue="frames" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="frames">Frames</TabsTrigger>
                    <TabsTrigger value="themes">Themes</TabsTrigger>
                    <TabsTrigger value="badges">Badges</TabsTrigger>
                </TabsList>

                <TabsContent value="frames" className="mt-4">
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="grid grid-cols-2 gap-4">
                            {AVATAR_FRAMES.map((item) => {
                                const isLocked = item.requiredLevel > userLevel && user.role !== 'owner' && user.role !== 'admin';
                                const isOwnerOnly = item.ownerOnly && user.role !== 'owner';
                                const isDisabled = isLocked || isOwnerOnly;

                                return (
                                    <button
                                        key={item.id}
                                        disabled={loading || isDisabled}
                                        onClick={() => handleEquip('frame', item.id)}
                                        className={cn(
                                            "relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all text-left group",
                                            user.equippedFrame === item.id ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50",
                                            isDisabled && "opacity-50 grayscale cursor-not-allowed"
                                        )}
                                    >
                                        <div className="relative">
                                            <Avatar className={cn("h-16 w-16 transition-all", item.preview)}>
                                                <AvatarImage src={user.photoURL} />
                                                <AvatarFallback>{(user.name || user.email || "S").charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            {isDisabled && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full">
                                                    <Lock className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <span className="text-sm font-bold">{item.name}</span>
                                            <span className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</span>
                                            {isLocked && (
                                                <span className="text-[10px] font-medium text-primary mt-1">Lvl {item.requiredLevel} Required</span>
                                            )}
                                        </div>
                                        {user.equippedFrame === item.id && (
                                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                                                <Check className="h-3 w-3" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="themes" className="mt-4">
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="grid grid-cols-2 gap-4">
                            {PROFILE_THEMES.map((item) => {
                                const isLocked = item.requiredLevel > userLevel && user.role !== 'owner' && user.role !== 'admin';
                                const isOwnerOnly = item.ownerOnly && user.role !== 'owner';
                                const isDisabled = isLocked || isOwnerOnly;

                                return (
                                    <button
                                        key={item.id}
                                        disabled={loading || isDisabled}
                                        onClick={() => handleEquip('theme', item.id)}
                                        className={cn(
                                            "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all p-4",
                                            user.equippedTheme === item.id ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50",
                                            isDisabled && "opacity-50 grayscale cursor-not-allowed"
                                        )}
                                    >
                                        <div className={cn("w-full h-12 rounded-lg border shadow-inner", item.preview)} />
                                        <div className="flex flex-col items-center text-center">
                                            <span className="text-sm font-bold">{item.name}</span>
                                            <span className="text-[10px] text-muted-foreground">{item.description}</span>
                                            {isLocked && (
                                                <span className="text-[10px] font-medium text-primary mt-1">Lvl {item.requiredLevel} Required</span>
                                            )}
                                        </div>
                                        {user.equippedTheme === item.id && (
                                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
                                                <Check className="h-3 w-3" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="badges" className="mt-4">
                    {badges.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Lock className="mx-auto h-8 w-8 mb-2 opacity-50" />
                            <p>Earn achievements to unlock badges!</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[300px]">
                            <div className="grid grid-cols-3 gap-4">
                                {badges.map((badge) => (
                                    <button
                                        key={badge.id}
                                        disabled={loading}
                                        onClick={() => handleEquip('badge', badge.id)}
                                        className={cn(
                                            "relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:bg-accent",
                                            user.equippedBadge === badge.id ? "border-primary bg-accent" : "border-transparent"
                                        )}
                                    >
                                        <div className="text-2xl">{badge.icon}</div>
                                        <span className="text-xs font-medium text-center line-clamp-1">{badge.name}</span>
                                        {user.equippedBadge === badge.id && (
                                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                                                <Check className="h-3 w-3" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
