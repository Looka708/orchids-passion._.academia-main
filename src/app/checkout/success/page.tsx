"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Download, Mail, ArrowRight } from "lucide-react";

const plans = {
    student: { name: "Student", price: 29 },
    teacher: { name: "Teacher", price: 79 },
    admin: { name: "Admin", price: 149 }
};

function CheckoutSuccessContent() {
    const searchParams = useSearchParams();
    const planParam = searchParams.get("plan") || "student";
    const selectedPlan = plans[planParam as keyof typeof plans] || plans.student;

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-muted/40 py-12 flex items-center justify-center">
            <div className="container max-w-2xl px-4">
                <Card className="border-2">
                    <CardHeader className="text-center pb-8">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-300" />
                        </div>
                        <CardTitle className="text-3xl">Payment Successful!</CardTitle>
                        <CardDescription className="text-base">
                            Welcome to Passion Academia {selectedPlan.name} Plan
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Order Details */}
                        <div className="rounded-lg bg-muted p-6 space-y-3">
                            <h3 className="font-semibold text-lg">Order Details</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Plan</span>
                                <span className="font-semibold">{selectedPlan.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Amount Paid</span>
                                <span className="font-semibold">${selectedPlan.price}.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Billing Cycle</span>
                                <span className="font-semibold">Monthly</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Order ID</span>
                                <span className="font-mono text-xs">#ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">What's Next?</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium">Check your email</p>
                                        <p className="text-sm text-muted-foreground">
                                            We've sent a confirmation email with your subscription details and receipt.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Download className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium">Access your account</p>
                                        <p className="text-sm text-muted-foreground">
                                            Your subscription is now active. Start exploring all the features available in your plan.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button asChild className="flex-1">
                                <Link href="/">
                                    Go to Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="flex-1">
                                <Link href="/contact">Contact Support</Link>
                            </Button>
                        </div>

                        {/* Footer Note */}
                        <p className="text-xs text-center text-muted-foreground pt-4 border-t">
                            Need help? Contact us at support@passion-academia.com or visit our FAQ section.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-5rem)] bg-muted/40 py-12 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <CheckoutSuccessContent />
        </Suspense>
    );
}
