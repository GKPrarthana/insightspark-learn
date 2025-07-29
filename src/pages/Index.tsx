import { useState, useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, SignUpButton, useUser } from "@clerk/clerk-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { TeacherDashboard } from "./TeacherDashboard";
import { StudentDashboard } from "./StudentDashboard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Chrome, UserCheck } from "lucide-react";

function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState<"teacher" | "student" | "guardian">("student");

  const handleRoleSelect = async (role: "teacher" | "student" | "guardian") => {
    setSelectedRole(role);
    // Store role in user metadata when they sign up
    localStorage.setItem('pendingRole', role);
  };

  return (
    <AuthLayout
      title="Welcome to EduSpark AI"
      description="Choose your role to get started with AI-powered education"
      showRoleSelector
      selectedRole={selectedRole}
      onRoleSelect={handleRoleSelect}
    >
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-4">Sign in to continue</h3>
          <div className="space-y-3">
            <SignInButton mode="modal" fallbackRedirectUrl="/">
              <Button className="w-full">
                <UserCheck className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </SignInButton>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <SignUpButton mode="modal" fallbackRedirectUrl="/">
              <Button variant="outline" className="w-full">
                <Chrome className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </SignUpButton>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

function AuthenticatedApp() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<"teacher" | "student" | "guardian">("student");
  
  useEffect(() => {
    const setUserRoleAndMetadata = async () => {
      if (!user) return;
      
      try {
        const pendingRole = localStorage.getItem('pendingRole') as "teacher" | "student" | "guardian";
        const currentRole = user.unsafeMetadata?.role as "teacher" | "student" | "guardian";
        
        // If we have a pending role and it's different from the current role, update it
        if (pendingRole && pendingRole !== currentRole) {
          await user.update({
            unsafeMetadata: {
              ...user.unsafeMetadata,
              role: pendingRole
            }
          });
          localStorage.removeItem('pendingRole');
          setUserRole(pendingRole);
        } else if (currentRole) {
          setUserRole(currentRole);
        } else if (pendingRole) {
          // If no role in metadata but we have a pending role
          await user.update({
            unsafeMetadata: {
              ...user.unsafeMetadata,
              role: pendingRole
            }
          });
          localStorage.removeItem('pendingRole');
          setUserRole(pendingRole);
        } else {
          // Default role if none set
          setUserRole("student");
        }
      } catch (error) {
        console.error("Error updating user role:", error);
        // Fallback to student role if there's an error
        setUserRole("student");
      } finally {
        setIsLoading(false);
      }
    };

    setUserRoleAndMetadata();
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>; // Or a nice loading spinner
  }

  if (userRole === "teacher") {
    return <TeacherDashboard />;
  }
  if (userRole === "student") {
    return <StudentDashboard />;
  }
  // Guardian dashboard would go here
  return <div>Guardian Dashboard (Coming Soon)</div>;
}

export default function Index() {
  return (
    <>
      <SignedOut>
        <RoleSelector />
      </SignedOut>
      <SignedIn>
        <AuthenticatedApp />
      </SignedIn>
    </>
  );
}