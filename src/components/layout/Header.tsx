import { useState } from "react";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  GraduationCap
} from "lucide-react";

interface HeaderProps {
  notifications?: number;
}

export function Header({ notifications = 0 }: HeaderProps) {
  const { user } = useUser();
  
  const userRole = user?.unsafeMetadata?.role as "teacher" | "student" | "guardian" || "student";
  const userName = user?.fullName || user?.firstName || "User";
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "teacher": return "bg-primary text-primary-foreground";
      case "student": return "bg-accent text-accent-foreground";
      case "guardian": return "bg-secondary text-secondary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "teacher": return "👨‍🏫";
      case "student": return "👨‍🎓";
      case "guardian": return "👥";
      default: return "👤";
    }
  };

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">EduSpark AI</h1>
            </div>
            <Badge variant="outline" className={getRoleColor(userRole)}>
              <span className="mr-1">{getRoleIcon(userRole)}</span>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </Badge>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
                  {notifications > 9 ? "9+" : notifications}
                </Badge>
              )}
            </Button>

            {/* User Button */}
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                  userButtonTrigger: "focus:shadow-none"
                }
              }}
              afterSignOutUrl="/"
            />
          </div>
        </div>
      </div>
    </header>
  );
}