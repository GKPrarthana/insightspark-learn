import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Clock, FileText, Award, AlertTriangle } from "lucide-react";

// Mock data for notifications
const mockNotifications = [
  {
    id: "1",
    type: "assignment_graded",
    title: "Mathematics Assignment Graded",
    message: "Your 'Algebra Basics' assignment has been graded. Score: 85/100",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    priority: "normal" as const
  },
  {
    id: "2",
    type: "assignment_due",
    title: "Assignment Due Tomorrow",
    message: "Your 'Physics Lab Report' is due tomorrow at 11:59 PM",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: false,
    priority: "high" as const
  },
  {
    id: "3",
    type: "new_assignment",
    title: "New Assignment Posted",
    message: "Your teacher has posted a new Chemistry assignment: 'Chemical Reactions'",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    priority: "normal" as const
  },
  {
    id: "4",
    type: "achievement",
    title: "Achievement Unlocked!",
    message: "Congratulations! You've completed 10 assignments. Keep up the great work!",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
    priority: "low" as const
  },
  {
    id: "5",
    type: "reminder",
    title: "Study Reminder",
    message: "Don't forget to review your notes for the upcoming Biology quiz next week",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
    priority: "normal" as const
  }
];

export function StudentNotifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "assignment_graded": return Award;
      case "assignment_due": return AlertTriangle;
      case "new_assignment": return FileText;
      case "achievement": return Award;
      case "reminder": return Clock;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === "high") return "text-red-500";
    if (type === "achievement") return "text-green-500";
    if (type === "assignment_graded") return "text-blue-500";
    return "text-muted-foreground";
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return <Badge variant="destructive">High</Badge>;
      case "normal": return <Badge variant="secondary">Normal</Badge>;
      case "low": return <Badge variant="outline">Low</Badge>;
      default: return null;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return timestamp.toLocaleDateString();
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const filteredNotifications = filter === "unread" 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Navigation userRole="student" />
        
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                <p className="text-muted-foreground">
                  Stay updated with your academic progress
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount} unread
                    </Badge>
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={filter === "unread" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("unread")}
                >
                  Unread ({unreadCount})
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
            </div>

            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {filter === "unread" ? "No unread notifications" : "No notifications"}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {filter === "unread" 
                      ? "All caught up! You have no unread notifications."
                      : "You'll see notifications here when there are updates about your assignments and progress."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  
                  return (
                    <Card 
                      key={notification.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        !notification.read ? "border-primary/50 bg-primary/5" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Icon className={`h-5 w-5 mt-1 ${getNotificationColor(notification.type, notification.priority)}`} />
                            <div className="space-y-1">
                              <CardTitle className="text-base">
                                {notification.title}
                                {!notification.read && (
                                  <span className="ml-2 h-2 w-2 bg-primary rounded-full inline-block"></span>
                                )}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {notification.message}
                              </CardDescription>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {getPriorityBadge(notification.priority)}
                            {notification.read && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{formatTimestamp(notification.timestamp)}</span>
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}