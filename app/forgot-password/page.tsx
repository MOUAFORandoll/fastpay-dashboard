"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ArrowRight, Shield, Mail, Lock } from "lucide-react";
import Link from "next/link";

type WizardStep = "email" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { sendPasswordResetOtp, resetPassword, isLoading } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<WizardStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSendingOtp(true);
    try {
      const id = await sendPasswordResetOtp(email);
      setUserId(id);
      setCurrentStep("password");
      toast.success("OTP sent to your email address");
    } catch (error) {
      toast.error("Failed to send OTP. Please check your email and try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      toast.error("Please enter a new password");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!userId) {
      toast.error("User ID is missing. Please start over.");
      return;
    }

    if (!otp || otp.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP code");
      return;
    }

    setIsResettingPassword(true);
    try {
      await resetPassword(userId, password, otp);
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      toast.error("Failed to reset password. Please check your OTP and try again.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleBack = () => {
    if (currentStep === "password") {
      setCurrentStep("email");
      setPassword("");
      setConfirmPassword("");
      setOtp("");
      setUserId(null);
    }
  };

  const handleStartOver = () => {
    setCurrentStep("email");
    setEmail("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setUserId(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-primary">
            <span className="text-xl font-bold text-primary-foreground">FP</span>
          </div>
          <span className="text-xl font-bold text-primary">FastPay</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === "email" && "Reset Password"}
              {currentStep === "password" && "Set New Password"}
            </CardTitle>
            <CardDescription>
              {currentStep === "email" && "Enter your email address to receive an OTP code"}
              {currentStep === "password" && "Enter the OTP code sent to your email and your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isSendingOtp || isLoading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSendingOtp || isLoading || !email}
                >
                  {isSendingOtp || isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <div className="text-center">
                  <Link
                    href="/login"
                    className="text-sm text-primary hover:underline"
                  >
                    <ArrowLeft className="mr-1 inline h-3 w-3" />
                    Back to login
                  </Link>
                </div>
              </form>
            )}

            {currentStep === "password" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>OTP sent to: {email}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP Code *</Label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={4}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                        disabled={isResettingPassword || isLoading}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p className="text-center text-xs text-muted-foreground">
                      Enter the 4-digit OTP code sent to your email
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={8}
                      disabled={isResettingPassword || isLoading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={8}
                      disabled={isResettingPassword || isLoading}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isResettingPassword || isLoading}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={isResettingPassword || isLoading || !password || !confirmPassword || password !== confirmPassword || otp.length !== 4}
                    className="flex-1"
                  >
                    {isResettingPassword || isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset Password
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleStartOver}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                    disabled={isResettingPassword || isLoading}
                  >
                    Use a different email
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">
            Remember your password?{" "}
          </span>
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

