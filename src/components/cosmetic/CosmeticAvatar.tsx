
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ALL_EFFECTS } from "@/lib/progress/effects";

interface CosmeticAvatarProps {
    src?: string;
    fallback: string;
    effectId?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

export default function CosmeticAvatar({
    src,
    fallback,
    effectId = 'none',
    size = "md",
    className
}: CosmeticAvatarProps) {
    const effect = ALL_EFFECTS.find(e => e.id === effectId);
    const effectClass = effect?.className || '';

    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-12 w-12",
        lg: "h-20 w-20",
        xl: "h-32 w-32"
    };

    return (
        <div className={cn("relative flex items-center justify-center", effectClass, className)}>
            <Avatar className={cn(sizeClasses[size], "border-2 border-background shadow-md")}>
                <AvatarImage src={src} alt={fallback} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {fallback.charAt(0).toUpperCase()}
                </AvatarFallback>
            </Avatar>
        </div>
    );
}
