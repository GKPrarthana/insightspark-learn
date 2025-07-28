import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  FileText, 
  ClipboardCheck, 
  TrendingUp,
  Upload,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Eye,
  Edit
} from "lucide-react";

interface RecentActivity {
  id: string;
  type: "submission" | "generation" | "grading";
  student?: string;
  assignment?: string;
  timestamp: string;
  status: "completed" | "pending" | "in-progress";
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  submitted: number;
  total: number;
  status: "active" | "draft" | "closed";
}

export function TeacherDashboard() {
  const [currentView, setCurrentView] = useState("/teacher");

  // Mock data
  const stats = {
    totalStudents: 156,
    activeAssignments: 8,
    pendingGrading: 23,
    completionRate: 87
  };

  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      type: "submission",
      student: "Sarah Johnson",
      assignment: "Algebra Quiz 3",
      timestamp: "2 minutes ago",
      status: "completed"
    },
    {
      id: "2",
      type: "generation",
      assignment: "Physics Chapter 5 Test",
      timestamp: "15 minutes ago",
      status: "completed"
    },
    {
      id: "3",
      type: "grading",
      assignment: "History Essay Assignment",
      timestamp: "1 hour ago",
      status: "in-progress"
    },
    {
      id: "4",
      type: "submission",
      student: "Michael Chen",
      assignment: "Chemistry Lab Report",
      timestamp: "2 hours ago",
      status: "pending"
    }
  ];

  const assignments: Assignment[] = [
    {
      id: "1",
      title: "Algebra Quiz 3",
      subject: "Mathematics",
      dueDate: "2024-01-20",
      submitted: 28,
      total: 32,
      status: "active"
    },
    {
      id: "2",
      title: "Physics Chapter 5 Test",
      subject: "Physics",
      dueDate: "2024-01-22",
      submitted: 15,
      total: 30,
      status: "active"
    },
    {
      id: "3",
      title: "History Essay Assignment",
      subject: "History",
      dueDate: "2024-01-25",
      submitted: 12,
      total: 28,
      status: "active"
    }
  ];

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case "submission":
        return <FileText className="w-4 h-4" />;
      case "generation":
        return <Brain className="w-4 h-4" />;
      case "grading":
        return <ClipboardCheck className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-accent";
      case "pending":
        return "text-warning";
      case "in-progress":
        return "text-primary";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole="teacher" 
        userName="Dr. Emily Rodriguez" 
        notifications={5}
        onLogout={() => console.log("Logout")}
      />
      
      <div className="flex">
        <Navigation 
          userRole="teacher" 
          currentPath={currentView}
          onNavigate={setCurrentView}
        />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Welcome back, Dr. Rodriguez</h1>
                <p className="text-muted-foreground mt-1">
                  Here's what's happening with your classes today
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resource
                </Button>
                <Button variant="hero">
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Questions
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Students"
                value={stats.totalStudents}
                icon={Users}
                trend={{ value: 12, label: "from last month", type: "up" }}
              />
              <StatsCard
                title="Active Assignments"
                value={stats.activeAssignments}
                icon={FileText}
                badge={{ text: "Due Soon", variant: "destructive" }}
              />
              <StatsCard
                title="Pending Grading"
                value={stats.pendingGrading}
                icon={ClipboardCheck}
                trend={{ value: -15, label: "from yesterday", type: "down" }}
              />
              <StatsCard
                title="Completion Rate"
                value={`${stats.completionRate}%`}
                icon={TrendingUp}
                progress={{ value: stats.completionRate, label: "Overall" }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest submissions, generations, and grading activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`p-2 rounded-full bg-muted ${getStatusColor(activity.status)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium truncate">
                              {activity.student && `${activity.student} submitted`}
                              {activity.type === "generation" && "AI generated questions for"}
                              {activity.type === "grading" && "Grading in progress for"}
                            </span>
                            <Badge variant="outline" className={`text-xs ${getStatusColor(activity.status)}`}>
                              {activity.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {activity.assignment}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {activity.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4">
                    View All Activity
                  </Button>
                </CardContent>
              </Card>

              {/* Active Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Assignments</CardTitle>
                  <CardDescription>
                    Monitor submission progress and manage assignments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium">{assignment.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <span>{assignment.subject}</span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                Due {new Date(assignment.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Submissions</span>
                            <span className="font-medium">
                              {assignment.submitted}/{assignment.total}
                            </span>
                          </div>
                          <Progress 
                            value={(assignment.submitted / assignment.total) * 100} 
                            className="h-2"
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{Math.round((assignment.submitted / assignment.total) * 100)}% completed</span>
                            <span>{assignment.total - assignment.submitted} pending</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4">
                    View All Assignments
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Commonly used tools and features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Upload className="w-6 h-6" />
                    <span>Upload New Resource</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Brain className="w-6 h-6" />
                    <span>AI Question Generator</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Users className="w-6 h-6" />
                    <span>Manage Students</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}