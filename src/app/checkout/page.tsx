"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Shield, Check, Tag, X } from "lucide-react";

const plans = {
    student: {
        name: "Student",
        price: 899,
        description: "Your gateway to academic excellence",
        features: [
            "Unlimited access to Grades 6-12 across all subjects",
            "Specialized prep for AFNS, PAF, MCJ & MCM entrance exams",
            "5,000+ interactive MCQs with instant feedback",
            "Real-time progress tracking & performance analytics",
            "Downloadable study materials & practice papers",
            "Email support within 24 hours",
            "🎮 Gamified Learning: Earn 10 XP per correct answer, 20 XP for quiz completion",
            "🏆 Level Up System: Perfect quiz = 50 XP bonus, Chapter completion = 100 XP",
            "🔥 Daily Streaks: Earn 5 XP per day streak, Study sessions = 25 XP/30min",
            "✨ Unlock Rewards: Avatar Frames at Level 4, Profile Themes at Level 8"
        ]
    },
    teacher: {
        name: "Teacher",
        price: 2999,
        description: "Empower your classroom with advanced tools",
        features: [
            "Everything in Student plan plus educator features",
            "Create & customize courses across multiple subjects",
            "Comprehensive student analytics & performance reports",
            "Automated grading & assignment management system",
            "Manage up to 100 students simultaneously",
            "Priority email & chat support",
            "🎮 Full XP System: Track student progress with 10 XP/answer, 100 XP/chapter",
            "📊 Student Leveling: Monitor student levels, streaks, and achievement unlocks",
            "🏅 Achievement Tracking: View all student badges, frames, and theme unlocks",
            "⚡ Boost Students: Award bonus XP to motivate and reward top performers"
        ]
    },
    admin: {
        name: "Admin",
        price: 14999,
        description: "Complete institutional control with AI exam generator",
        features: [
            "Everything in Teacher plan plus admin privileges",
            "Full user management: Create, edit & manage unlimited accounts",
            "AI-Powered Exam Generator: Create custom exams instantly with AI",
            "Advanced exam generator with multi-chapter selection",
            "Professional PDF export & print-ready exam papers",
            "Institution-wide analytics & detailed reporting dashboard",
            "24/7 dedicated support with priority response",
            "🎮 Complete XP Control: Award custom XP amounts to any user or group",
            "🚀 Admin Boost: Multiply XP earnings (2x, 3x, 5x) for events or competitions",
            "🏆 Custom Achievements: Create institution-specific badges and rewards",
            "👑 Full Cosmetics Access: Unlock all frames & themes for any user instantly"
        ]
    }
};

// Valid coupons (in production, this would be fetched from backend)
const validCoupons: Record<string, number> = {
    "WELCOME10": 10,
    "SAVE20": 20,
    "STUDENT15": 15,
    "TEACHER25": 25,
};

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const planParam = searchParams.get("plan") || "student";
    const selectedPlan = plans[planParam as keyof typeof plans] || plans.student;

    const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("monthly");
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [processing, setProcessing] = useState(false);

    // Coupon state
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discount: number } | null>(null);
    const [couponError, setCouponError] = useState("");

    // Form state
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        billingAddress: "",
        city: "",
        zipCode: "",
        country: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const applyCoupon = () => {
        const upperCode = couponCode.toUpperCase();
        if (validCoupons[upperCode]) {
            setAppliedCoupon({ code: upperCode, discount: validCoupons[upperCode] });
            setCouponError("");
            toast({
                title: "Coupon Applied! 🎉",
                description: `You saved ${validCoupons[upperCode]}% with code ${upperCode}`,
            });
        } else {
            setCouponError("Invalid coupon code");
            setAppliedCoupon(null);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
    };

    const calculateSubtotal = () => {
        const basePrice = selectedPlan.price;
        if (billingCycle === "quarterly") {
            return basePrice * 3 * 0.9; // 10% discount for quarterly
        }
        if (billingCycle === "yearly") {
            return basePrice * 12 * 0.8; // 20% discount for yearly
        }
        return basePrice;
    };

    const calculateTotal = () => {
        let subtotal = calculateSubtotal();
        if (appliedCoupon) {
            subtotal = subtotal * (1 - appliedCoupon.discount / 100);
        }
        return subtotal.toFixed(2);
    };

    const getBillingText = () => {
        if (billingCycle === "monthly") return "monthly";
        if (billingCycle === "quarterly") return "quarterly";
        return "annually";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            setProcessing(false);
            toast({
                title: "Payment Successful! 🎉",
                description: `You've successfully subscribed to the ${selectedPlan.name} plan.`,
            });
            router.push("/checkout/success?plan=" + planParam);
        }, 2000);
    };

    return (
        <div className="min-h-[calc(100vh-5rem)] bg-muted/40 py-12">
            <div className="container max-w-6xl px-4">
                {/* Back Button */}
                <Button variant="ghost" asChild className="mb-6">
                    <Link href="/#pricing">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Pricing
                    </Link>
                </Button>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                                <CardDescription>Review your subscription</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{selectedPlan.name} Plan</h3>
                                    <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                                </div>

                                <Separator />

                                {/* Billing Cycle */}
                                <div className="space-y-3">
                                    <Label>Billing Cycle</Label>
                                    <RadioGroup value={billingCycle} onValueChange={(value: any) => setBillingCycle(value)}>
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="monthly" id="monthly" />
                                                <Label htmlFor="monthly" className="cursor-pointer">Monthly</Label>
                                            </div>
                                            <span className="font-semibold">Rs. {selectedPlan.price}/mo</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="quarterly" id="quarterly" />
                                                <Label htmlFor="quarterly" className="cursor-pointer">
                                                    Quarterly <span className="text-xs text-primary">(Save 10%)</span>
                                                </Label>
                                            </div>
                                            <span className="font-semibold">Rs. {(selectedPlan.price * 3 * 0.9 / 3).toFixed(0)}/mo</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3 bg-primary/5">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="yearly" id="yearly" />
                                                <Label htmlFor="yearly" className="cursor-pointer">
                                                    Yearly <span className="text-xs text-primary">(Save 20%)</span>
                                                </Label>
                                            </div>
                                            <span className="font-semibold">Rs. {(selectedPlan.price * 12 * 0.8 / 12).toFixed(0)}/mo</span>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Separator />

                                {/* Coupon Code */}
                                <div className="space-y-3">
                                    <Label>Promo Code</Label>
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between rounded-lg border border-green-500 bg-green-50 dark:bg-green-950 p-3">
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                <span className="font-semibold text-sm text-green-700 dark:text-green-300">
                                                    {appliedCoupon.code} (-{appliedCoupon.discount}%)
                                                </span>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={removeCoupon}
                                                className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Enter code"
                                                value={couponCode}
                                                onChange={(e) => {
                                                    setCouponCode(e.target.value);
                                                    setCouponError("");
                                                }}
                                                className={couponError ? "border-red-500" : ""}
                                            />
                                            <Button onClick={applyCoupon} variant="outline" disabled={!couponCode}>
                                                Apply
                                            </Button>
                                        </div>
                                    )}
                                    {couponError && (
                                        <p className="text-xs text-red-500">{couponError}</p>
                                    )}
                                </div>

                                <Separator />

                                {/* Price Breakdown */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>Rs. {calculateSubtotal().toFixed(2)}</span>
                                    </div>
                                    {billingCycle === "quarterly" && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Quarterly Discount (10%)</span>
                                            <span>-Rs. {(selectedPlan.price * 3 * 0.1).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {billingCycle === "yearly" && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Yearly Discount (20%)</span>
                                            <span>-Rs. {(selectedPlan.price * 12 * 0.2).toFixed(2)}</span>
                                        </div>
                                    )}
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Coupon ({appliedCoupon.code} -{appliedCoupon.discount}%)</span>
                                            <span>-Rs. {(calculateSubtotal() * appliedCoupon.discount / 100).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>Rs. {calculateTotal()}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Billed {getBillingText()}
                                    </p>
                                </div>

                                <Separator />

                                {/* Features */}
                                <div>
                                    <h4 className="font-semibold mb-3">What's included:</h4>
                                    <ul className="space-y-2">
                                        {selectedPlan.features.slice(0, 4).map((feature, index) => (
                                            <li key={index} className="flex items-start text-sm">
                                                <Check className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Details</CardTitle>
                                <CardDescription>Complete your subscription to get started</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Personal Information */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Personal Information</h3>
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="fullName">Full Name *</Label>
                                                <Input
                                                    id="fullName"
                                                    name="fullName"
                                                    placeholder="John Doe"
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address *</Label>
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Payment Method */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Payment Method</h3>
                                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                            <div className="flex items-center space-x-2 rounded-lg border p-4">
                                                <RadioGroupItem value="card" id="card" />
                                                <Label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Credit / Debit Card
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {/* Card Details */}
                                    {paymentMethod === "card" && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cardNumber">Card Number *</Label>
                                                <Input
                                                    id="cardNumber"
                                                    name="cardNumber"
                                                    placeholder="1234 5678 9012 3456"
                                                    value={formData.cardNumber}
                                                    onChange={handleInputChange}
                                                    maxLength={19}
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                                                    <Input
                                                        id="expiryDate"
                                                        name="expiryDate"
                                                        placeholder="MM/YY"
                                                        value={formData.expiryDate}
                                                        onChange={handleInputChange}
                                                        maxLength={5}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="cvv">CVV *</Label>
                                                    <Input
                                                        id="cvv"
                                                        name="cvv"
                                                        placeholder="123"
                                                        value={formData.cvv}
                                                        onChange={handleInputChange}
                                                        maxLength={4}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <Separator />

                                    {/* Billing Address */}
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Billing Address</h3>
                                        <div className="space-y-2">
                                            <Label htmlFor="billingAddress">Street Address *</Label>
                                            <Input
                                                id="billingAddress"
                                                name="billingAddress"
                                                placeholder="123 Main St"
                                                value={formData.billingAddress}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-4 md:grid-cols-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City *</Label>
                                                <Input
                                                    id="city"
                                                    name="city"
                                                    placeholder="New York"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="zipCode">ZIP Code *</Label>
                                                <Input
                                                    id="zipCode"
                                                    name="zipCode"
                                                    placeholder="10001"
                                                    value={formData.zipCode}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="country">Country *</Label>
                                                <Input
                                                    id="country"
                                                    name="country"
                                                    placeholder="USA"
                                                    value={formData.country}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Security Notice */}
                                    <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
                                        <Shield className="h-5 w-5 text-primary mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-semibold">Secure Payment</p>
                                            <p className="text-muted-foreground">
                                                Your payment information is encrypted and secure. We never store your card details.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <Button type="submit" className="w-full" size="lg" disabled={processing}>
                                        {processing ? "Processing..." : `Subscribe for Rs. ${calculateTotal()}`}
                                    </Button>

                                    <p className="text-xs text-center text-muted-foreground">
                                        By subscribing, you agree to our Terms of Service and Privacy Policy.
                                        You can cancel anytime.
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-5rem)] bg-muted/40 py-12 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading checkout...</p>
                </div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
