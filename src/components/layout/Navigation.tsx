import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Upload,
  ClipboardList,
  User,
  Bell,
  CreditCard,
  CheckCircle
} from "lucide-react";

interface NavigationItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string | number;
  active?: boolean;
}

interface NavigationProps {
  userRole: "teacher" | "student" | "guardian";
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

export function Navigation({ userRole, currentPath = "/", onNavigate }: NavigationProps) {
  const getNavigationItems = (): NavigationItem[] => {
    switch (userRole) {
      case "teacher":
        return [
          { name: "Dashboard", icon: BarChart3, href: "/teacher" },
          { name: "Upload Resources", icon: Upload, href: "/teacher/upload" },
          { name: "Question Papers", icon: FileText, href: "/teacher/questions" },
          { name: "Students", icon: Users, href: "/teacher/students" },
          { name: "Assignments", icon: ClipboardList, href: "/teacher/assignments" },
          { name: "Billing", icon: CreditCard, href: "/teacher/billing" },
          { name: "Settings", icon: Settings, href: "/teacher/settings" },
        ];
      case "student":
        return [
          { name: "Dashboard", icon: BarChart3, href: "/student" },
          { name: "Assignments", icon: BookOpen, href: "/student/assignments", badge: "3" },
          { name: "Submitted", icon: CheckCircle, href: "/student/submitted" },
          { name: "Grades", icon: FileText, href: "/student/grades" },
          { name: "Notifications", icon: Bell, href: "/student/notifications", badge: "2" },
          { name: "Settings", icon: Settings, href: "/student/settings" },
        ];
      case "guardian":
        return [
          { name: "Dashboard", icon: BarChart3, href: "/guardian" },
          { name: "My Students", icon: Users, href: "/guardian/students" },
          { name: "Progress Reports", icon: FileText, href: "/guardian/reports" },
          { name: "Notifications", icon: Bell, href: "/guardian/notifications", badge: "1" },
          { name: "Account", icon: User, href: "/guardian/account" },
          { name: "Settings", icon: Settings, href: "/guardian/settings" },
        ];
      default:
        return [];
    }
  };

  const navigationItems = getNavigationItems();

  const handleNavigate = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    }
  };

  return (
    <nav className="w-64 bg-card border-r border-border h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {userRole === "teacher" && "Teacher Portal"}
          {userRole === "student" && "Student Portal"}
          {userRole === "guardian" && "Guardian Portal"}
        </h2>
        
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-10 px-3",
                  isActive && "bg-primary text-primary-foreground shadow-sm"
                )}
                onClick={() => handleNavigate(item.href)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge && (
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-accent text-accent-foreground">
                    {item.badge}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}