import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, BookOpen, Users, Shield } from "lucide-react";
import heroImage from "@/assets/education-hero.jpg";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  showRoleSelector?: boolean;
  selectedRole?: "teacher" | "student" | "guardian";
  onRoleSelect?: (role: "teacher" | "student" | "guardian") => void;
}

export function AuthLayout({ 
  children, 
  title, 
  description, 
  showRoleSelector = false, 
  selectedRole,
  onRoleSelect 
}: AuthLayoutProps) {
  const roles = [
    {
      id: "teacher" as const,
      name: "Teacher",
      description: "Create assignments, generate questions, track student progress",
      icon: GraduationCap,
      color: "bg-primary text-primary-foreground"
    },
    {
      id: "student" as const,
      name: "Student",
      description: "Complete assignments, view grades, track your learning journey",
      icon: BookOpen,
      color: "bg-accent text-accent-foreground"
    },
    {
      id: "guardian" as const,
      name: "Guardian",
      description: "Monitor your child's progress, receive updates, manage accounts",
      icon: Users,
      color: "bg-secondary text-secondary-foreground"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/20 flex">
      {/* Left side - Hero Image and Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="w-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-glow/60" />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
            <div className="max-w-md">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">EduSpark AI</h1>
              <p className="text-xl text-white/90 mb-6">
                Transform education with AI-powered learning, assessment, and analytics
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  AI-Generated Questions
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Auto-Grading
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Progress Analytics
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">EduSpark AI</h1>
          </div>

          {/* Role Selector */}
          {showRoleSelector && (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Choose Your Role</CardTitle>
                <CardDescription className="text-center">
                  Select how you'll be using EduSpark AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {roles.map((role) => (
                  <Button
                    key={role.id}
                    variant={selectedRole === role.id ? "default" : "outline"}
                    className="w-full h-auto p-4 flex items-start space-x-3"
                    onClick={() => onRoleSelect?.(role.id)}
                  >
                    <role.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="text-left flex-1">
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {role.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Auth Form */}
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Your data is secure and protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}