import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import AuthLayout from "@/components/layout/LeftPannel";

type Step = "email" | "otp" | "password";

const ForgotPassword = () => {
  const [currentStep, setCurrentStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send OTP to email
    console.log("Sending OTP to:", email);
    setCurrentStep("otp");
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Verify OTP
    console.log("Verifying OTP:", otp);
    setCurrentStep("password");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Update password
    console.log("Updating password");
  };

  const passwordsMatch = password === confirmPassword;
  const isPasswordValid = password.length >= 8 && passwordsMatch;

  const steps = [
    { id: "email", label: "Email" },
    { id: "otp", label: "Verify" },
    { id: "password", label: "Reset" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="We'll help you get back into your account securely."
    >
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Link
            to="/signin"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Forgot Password</h2>
            <p className="text-muted-foreground">
              {currentStep === "email" && "Enter your email to receive a code"}
              {currentStep === "otp" && "Enter the verification code"}
              {currentStep === "password" && "Create your new password"}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    index < currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : index === currentStepIndex
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-xs mt-2 ${
                    index <= currentStepIndex
                      ? "text-foreground font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 sm:w-24 h-1 mx-2 rounded-full transition-all ${
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Email */}
        {currentStep === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                We'll send a 6-digit verification code to this email.
              </p>
            </div>

            <Button
              type="submit"
              variant="cta"
              className="w-full h-12 text-base"
              disabled={!email}
            >
              Send Verification Code
            </Button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {currentStep === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  We sent a code to <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>
              
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => console.log("Resending code...")}
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12"
                onClick={() => setCurrentStep("email")}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="cta"
                className="flex-1 h-12"
                disabled={otp.length !== 6}
              >
                Verify Code
              </Button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {currentStep === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Password must be at least 8 characters long.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 h-12 ${
                    confirmPassword && !passwordsMatch
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-sm text-destructive">Passwords do not match</p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12"
                onClick={() => setCurrentStep("otp")}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="cta"
                className="flex-1 h-12"
                disabled={!isPasswordValid}
              >
                Reset Password
              </Button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link to="/sign-in" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
