import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield } from "lucide-react";
import AuthLayout from "@/components/layout/LeftPannel";

const SignUp = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement registration
    console.log("Sign up:", formData);
  };

  const handleGoogleSignUp = () => {
    // TODO: Implement Google OAuth
    console.log("Google sign up");
  };

  const passwordsMatch = formData.password === formData.confirmPassword;
  const isFormValid = 
    formData.fullName && 
    formData.email && 
    formData.password && 
    formData.confirmPassword && 
    passwordsMatch && 
    agreeTerms;

  return (
    <AuthLayout
      title="Start Your Journey"
      subtitle="Join thousands of travelers finding their perfect accommodations worldwide."
      variant="signup"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
          <p className="text-muted-foreground mt-2">Join us to start booking your perfect stay.</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                className="pl-11 h-12 border-border bg-background"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-11 h-12 border-border bg-background"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="pl-11 pr-11 h-12 border-border bg-background"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`pl-11 pr-11 h-12 border-border bg-background ${
                  formData.confirmPassword && !passwordsMatch 
                    ? "border-destructive focus-visible:ring-destructive" 
                    : ""
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {formData.confirmPassword && !passwordsMatch && (
              <p className="text-sm text-destructive">Passwords do not match</p>
            )}
          </div>

          <div className="flex items-start space-x-3 pt-2">
            <Checkbox 
              id="terms" 
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
              className="mt-0.5"
            />
            <label 
              htmlFor="terms" 
              className="text-sm text-muted-foreground leading-tight cursor-pointer"
            >
              I agree to the{" "}
              <Link to="/terms" className="text-primary hover:underline font-medium">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!isFormValid}
          >
            Create Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>

        {/* Google Sign Up */}
        <Button 
          variant="outline" 
          className="w-full h-12 text-base border-border hover:bg-muted text-black"
          onClick={handleGoogleSignUp}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>

        {/* Privacy Notice */}
        <div className="bg-muted/50 rounded-lg p-4 flex gap-3">
          <Shield className="w-6 h-6 text-primary flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm text-foreground">Your Privacy & Security</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Your personal information is encrypted and protected using industry-standard security protocols. We never share your data without your explicit permission.
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default SignUp;
