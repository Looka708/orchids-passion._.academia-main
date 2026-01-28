"use client";

import { useState } from "react";
import { User, updateUserProfile } from "@/lib/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EquipSelector } from "./EquipSelector";
import { Badge } from "@/lib/types/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProfileEditorProps {
    user: User;
    badges?: Badge[];
    userLevel?: number;
    onUpdate: () => void;
}

export function ProfileEditor({ user, badges = [], userLevel = 1, onUpdate }: ProfileEditorProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: user.name || "",
        photoURL: user.photoURL || "",
        bio: user.bio || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateUserProfile(user.email, formData);
            toast({
                title: "Profile updated",
                description: "Your profile has been successfully updated.",
            });
            onUpdate();
            setOpen(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Customize your profile appearance and details.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="info">Personal Info</TabsTrigger>
                        <TabsTrigger value="customize">Customize</TabsTrigger>
                    </TabsList>

                    <TabsContent value="info">
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="flex flex-col items-center gap-4">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={formData.photoURL} alt={formData.name} />
                                        <AvatarFallback className="text-2xl">
                                            {(formData.name || user.email || "U").charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="w-full">
                                        <Label htmlFor="photoURL" className="text-right">
                                            Profile Picture URL
                                        </Label>
                                        <Input
                                            id="photoURL"
                                            name="photoURL"
                                            value={formData.photoURL}
                                            onChange={handleChange}
                                            placeholder="https://example.com/avatar.png"
                                            className="col-span-3 mt-1"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Enter a URL for your profile picture.
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        placeholder="Tell us a little about yourself..."
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>

                    <TabsContent value="customize">
                        <EquipSelector
                            user={user}
                            badges={badges}
                            userLevel={userLevel}
                            onUpdate={onUpdate}
                        />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
