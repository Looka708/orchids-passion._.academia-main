"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { updateUserProfile } from '@/lib/users';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { CheckCircle2, Target, User as UserIcon, ArrowRight } from 'lucide-react';

interface OnboardingWizardProps {
    onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [targetGrade, setTargetGrade] = useState('A+');
    const [dailyStudyTime, setDailyStudyTime] = useState(60);
    const [nickname, setNickname] = useState(user?.name || '');

    const totalSteps = 3;

    const handleNext = async () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            await handleFinish();
        }
    };

    const handleFinish = async () => {
        if (!user?.email) return;
        setLoading(true);
        try {
            await updateUserProfile(user.email, {
                name: nickname,
                hasCompletedOnboarding: true,
                goals: {
                    targetGrade,
                    dailyStudyTime
                }
            });
            onComplete();
        } catch (error) {
            console.error("Failed to save onboarding data", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-[500px] [&>button]:hidden">
                <DialogHeader>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex space-x-1">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`h-2 w-16 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
                    </div>
                    <DialogTitle className="text-2xl font-bold">
                        {step === 1 && "Welcome to Passion Academia! 🎓"}
                        {step === 2 && "Set Your Goals 🎯"}
                        {step === 3 && "Complete Your Profile 👤"}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1 && "Let's get you set up for success. We'll help you track your progress and achieve your academic goals."}
                        {step === 2 && "Tell us what you want to achieve so we can personalize your experience."}
                        {step === 3 && "How should we address you? Pick a name that represents you."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                                <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold">Track Your Progress</h4>
                                    <p className="text-sm text-muted-foreground">Earn XP and badges as you learn.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
                                <Target className="w-6 h-6 text-blue-500 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold">Master Your Subjects</h4>
                                    <p className="text-sm text-muted-foreground">Access thousands of videos and quizzes.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label>Target Grade</Label>
                                <Select value={targetGrade} onValueChange={setTargetGrade}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A+">A+ (Outstanding)</SelectItem>
                                        <SelectItem value="A">A (Excellent)</SelectItem>
                                        <SelectItem value="B">B (Good)</SelectItem>
                                        <SelectItem value="C">C (Satisfactory)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Label>Daily Study Goal</Label>
                                    <span className="text-sm font-medium text-primary">{dailyStudyTime} mins</span>
                                </div>
                                <Slider
                                    value={[dailyStudyTime]}
                                    onValueChange={(vals) => setDailyStudyTime(vals[0])}
                                    max={180}
                                    step={15}
                                    min={15}
                                />
                                <p className="text-xs text-muted-foreground text-center">
                                    Consistency is key! Start with a manageable goal.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary">
                                    <UserIcon className="w-12 h-12 text-primary" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Your Nickname</Label>
                                <Input
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={handleNext} disabled={loading} className="w-full sm:w-auto">
                        {loading ? "Saving..." : step === totalSteps ? "Get Started" : (
                            <>
                                Next Step <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
