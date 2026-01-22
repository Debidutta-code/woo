import { ReactNode } from "react";
import { Plane, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import authBackground from "../../../public/login.jpg";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  variant?: "signin" | "signup" | "forgot";
}

const AuthLayout = ({ children, title, subtitle, variant = "signin" }: AuthLayoutProps) => {
  const benefits = [
    "Access to exclusive member-only rates and offers",
    "Free cancellation on most bookings with flexible options",
    "Priority customer service and travel support"
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Background Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${authBackground})` }}
        />
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 text-white">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Plane className="w-8 h-8 text-primary rotate-[-30deg] group-hover:rotate-0 transition-transform duration-300" />
            <span className="text-2xl font-bold">
              <span className="text-primary">Woohoo</span>
              <span className="text-white">Trip</span>
            </span>
          </Link>
          
          {/* Main Content - Centered */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight animate-fade-in">
              <span className="text-white">{title.split(' ')[0]} </span>
              <span className="text-primary">{title.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-lg lg:text-xl text-white/90 mt-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {subtitle}
            </p>
          </div>
          
          {/* Member Benefits Card */}
          <div className="backdrop-blur-md bg-black/40 rounded-xl p-6 border border-white/10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-lg font-semibold text-primary mb-4">Member Benefits</h3>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-white/90 text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-primary to-accent" />
        
        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <Link to="/" className="flex items-center gap-2">
                <Plane className="w-8 h-8 text-primary rotate-[-30deg]" />
                <span className="text-2xl font-bold">
                  <span className="text-primary">Woohoo</span>
                  <span className="text-foreground">Trip</span>
                </span>
              </Link>
            </div>
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
