"use client"

import { useAuth } from "@/hooks/useAuth"
import { AlertCircle, ArrowRight, Loader2, CheckCircle2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { auth } from "@/lib/firebase/config"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import confetti from "canvas-confetti"
import { motion, AnimatePresence } from "framer-motion"

export function VerificationBanner() {
    const { firebaseUser, emailVerified, isAuthenticated, verifyCode, resendCode } = useAuth()
    const [isSending, setIsSending] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [code, setCode] = useState("")
    const { toast } = useToast()

    // Handle cleanup of Success state after visual confirmation
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                // The banner will naturally disappear because emailVerified becomes true
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    if (!isAuthenticated || (emailVerified && !isSuccess) || !firebaseUser) return null

    const handleResend = async () => {
        setIsSending(true)
        try {
            await resendCode()
            toast({
                title: "Verification sent",
                description: "A new 9-char code has been sent to your Gmail.",
            })
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to send verification email.",
            })
        } finally {
            setIsSending(false)
        }
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (code.length !== 9) return

        setIsVerifying(true)
        const success = await verifyCode(code)
        if (success) {
            setIsSuccess(true)

            // Trigger Confetti!
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4f46e5', '#10b981', '#f59e0b']
            });

            toast({
                title: "Account Verified!",
                description: "Welcome to Passion Academia.",
            })
        } else {
            toast({
                variant: "destructive",
                title: "Invalid Code",
                description: "The code you entered is incorrect or expired.",
            })
        }
        setIsVerifying(false)
    }

    // Auto-format helper for A56T-EF32
    const handleCodeChange = (val: string) => {
        let clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (clean.length > 8) clean = clean.substring(0, 8);

        if (clean.length > 4) {
            setCode(`${clean.substring(0, 4)}-${clean.substring(4)}`);
        } else {
            setCode(clean);
        }
    }

    return (
        <AnimatePresence mode="wait">
            {!isSuccess ? (
                <motion.div
                    key="verify-banner"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 py-3 px-4 relative overflow-hidden"
                >
                    <div className="container mx-auto">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3 text-amber-800 dark:text-amber-200">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <div className="text-sm">
                                    <p className="font-bold">Verify your account</p>
                                    <p className="opacity-90">Enter the 9-char code sent to <strong>{firebaseUser.email}</strong></p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <form onSubmit={handleVerify} className="flex items-center gap-2">
                                    <Input
                                        value={code}
                                        onChange={(e) => handleCodeChange(e.target.value)}
                                        placeholder="XXXX-XXXX"
                                        className="w-40 text-center font-mono text-lg tracking-widest h-9 border-amber-300 dark:border-amber-700 focus-visible:ring-amber-500 uppercase bg-white/50"
                                        required
                                    />
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={code.length !== 9 || isVerifying}
                                        className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                                    >
                                        {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code"}
                                    </Button>
                                </form>

                                <div className="h-6 w-px bg-amber-200 dark:bg-amber-800 hidden sm:block" />

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-amber-800 hover:bg-amber-100 dark:text-amber-200 whitespace-nowrap"
                                        onClick={handleResend}
                                        disabled={isSending}
                                    >
                                        {isSending ? "Sending..." : "Resend Code"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-amber-800 hover:bg-amber-100 dark:text-amber-200"
                                        onClick={() => window.location.reload()}
                                    >
                                        Verified? <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="success-banner"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-500 py-3 px-4 border-b border-emerald-600 shadow-lg relative overflow-hidden"
                >
                    <motion.div
                        animate={{ opacity: [0, 1, 0], scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute inset-0 bg-white/10"
                    />
                    <div className="container mx-auto flex items-center justify-center gap-3 text-white">
                        <CheckCircle2 className="h-6 w-6" />
                        <span className="font-bold text-lg flex items-center gap-2">
                            Successfully Verified! Welcome to Passion Academia <Sparkles className="h-5 w-5" />
                        </span>
                        <motion.div
                            animate={{ x: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <ArrowRight className="h-5 w-5" />
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

