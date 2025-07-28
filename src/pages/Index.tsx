import { useState } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { TeacherDashboard } from "./TeacherDashboard";
import { StudentDashboard } from "./StudentDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Chrome, Mail, Loader2 } from "lucide-react";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"teacher" | "student" | "guardian">("student");
  const [authStep, setAuthStep] = useState<"role" | "signin" | "signup">("role");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });

  // Demo mode - simulate authentication
  const handleDemoAuth = (role: "teacher" | "student" | "guardian") => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleRoleSelect = (role: "teacher" | "student" | "guardian") => {
    setUserRole(role);
    setAuthStep("signin");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 1500);
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    
    // Simulate Google OAuth
    setTimeout(() => {
      setIsAuthenticated(true);
      setIsLoading(false);
    }, 2000);
  };

  if (isAuthenticated) {
    if (userRole === "teacher") {
      return <TeacherDashboard />;
    }
    if (userRole === "student") {
      return <StudentDashboard />;
    }
    // Guardian dashboard would go here
    return <div>Guardian Dashboard (Coming Soon)</div>;
  }

  if (authStep === "role") {
    return (
      <AuthLayout
        title="Welcome to EduSpark AI"
        description="Choose your role to get started with AI-powered education"
        showRoleSelector
        selectedRole={userRole}
        onRoleSelect={handleRoleSelect}
      >
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Quick Demo Access</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Try the platform instantly with sample data
            </p>
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" onClick={() => handleDemoAuth("teacher")}>
                Demo as Teacher
              </Button>
              <Button variant="outline" onClick={() => handleDemoAuth("student")}>
                Demo as Student
              </Button>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (authStep === "signin") {
    return (
      <AuthLayout
        title={`Sign in as ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`}
        description="Welcome back! Please sign in to your account"
      >
        <form onSubmit={handleSignIn} className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Chrome className="w-4 h-4 mr-2" />
            )}
            Continue with Google
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto"
              onClick={() => setAuthStep("signup")}
            >
              Sign up
            </Button>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              className="text-sm"
              onClick={() => setAuthStep("role")}
            >
              ← Back to role selection
            </Button>
          </div>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={`Create ${userRole.charAt(0).toUpperCase() + userRole.slice(1)} Account`}
      description="Join thousands of educators and students using AI-powered learning"
    >
      <form onSubmit={handleSignUp} className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleAuth}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Chrome className="w-4 h-4 mr-2" />
          )}
          Continue with Google
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Create Account
            </>
          )}
        </Button>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto"
            onClick={() => setAuthStep("signin")}
          >
            Sign in
          </Button>
        </div>

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            className="text-sm"
            onClick={() => setAuthStep("role")}
          >
            ← Back to role selection
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}