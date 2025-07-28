import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  FileText,
  Star
} from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  dueDate: string;
  status: "not-started" | "in-progress" | "submitted" | "graded";
  grade?: number;
  totalPoints: number;
  timeLimit: number;
  priority: "high" | "medium" | "low";
}

interface Grade {
  id: string;
  subject: string;
  assignment: string;
  score: number;
  totalPoints: number;
  grade: string;
  date: string;
}

export function StudentDashboard() {
  const [currentView, setCurrentView] = useState("/student");

  // Mock data
  const stats = {
    assignmentsCompleted: 24,
    averageGrade: 88,
    currentStreak: 7,
    totalPoints: 1247
  };

  const upcomingAssignments: Assignment[] = [
    {
      id: "1",
      title: "Algebra Quiz 3",
      subject: "Mathematics",
      teacher: "Dr. Rodriguez",
      dueDate: "2024-01-20T23:59:59",
      status: "not-started",
      totalPoints: 50,
      timeLimit: 45,
      priority: "high"
    },
    {
      id: "2",
      title: "Physics Chapter 5 Test",
      subject: "Physics",
      teacher: "Prof. Chen",
      dueDate: "2024-01-22T23:59:59",
      status: "not-started",
      totalPoints: 100,
      timeLimit: 90,
      priority: "medium"
    },
    {
      id: "3",
      title: "History Essay Draft",
      subject: "History",
      teacher: "Ms. Johnson",
      dueDate: "2024-01-25T23:59:59",
      status: "in-progress",
      totalPoints: 75,
      timeLimit: 120,
      priority: "medium"
    }
  ];

  const recentGrades: Grade[] = [
    {
      id: "1",
      subject: "Mathematics",
      assignment: "Calculus Problem Set 4",
      score: 87,
      totalPoints: 100,
      grade: "B+",
      date: "2024-01-15"
    },
    {
      id: "2",
      subject: "Physics",
      assignment: "Mechanics Lab Report",
      score: 94,
      totalPoints: 100,
      grade: "A",
      date: "2024-01-12"
    },
    {
      id: "3",
      subject: "Chemistry",
      assignment: "Organic Chemistry Quiz 2",
      score: 82,
      totalPoints: 100,
      grade: "B",
      date: "2024-01-10"
    }
  ];

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: Assignment['priority'], daysUntilDue: number) => {
    if (daysUntilDue <= 1) return "destructive";
    if (priority === "high") return "destructive";
    if (priority === "medium") return "default";
    return "secondary";
  };

  const getStatusIcon = (status: Assignment['status']) => {
    switch (status) {
      case "not-started":
        return <PlayCircle className="w-4 h-4" />;
      case "in-progress":
        return <Clock className="w-4 h-4" />;
      case "submitted":
        return <CheckCircle className="w-4 h-4" />;
      case "graded":
        return <Star className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header notifications={3} />
      
      <div className="flex">
        <Navigation 
          userRole="student" 
          currentPath={currentView}
          onNavigate={setCurrentView}
        />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Good morning, Alex!</h1>
                <p className="text-muted-foreground mt-1">
                  You have 3 upcoming assignments. Keep up the great work!
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Current GPA</div>
                <div className="text-2xl font-bold text-accent">3.52</div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Assignments Completed"
                value={stats.assignmentsCompleted}
                icon={BookOpen}
                trend={{ value: 8, label: "this month", type: "up" }}
              />
              <StatsCard
                title="Average Grade"
                value={`${stats.averageGrade}%`}
                icon={Trophy}
                trend={{ value: 5, label: "from last month", type: "up" }}
                badge={{ text: "B+", variant: "default" }}
              />
              <StatsCard
                title="Study Streak"
                value={`${stats.currentStreak} days`}
                icon={TrendingUp}
                badge={{ text: "New Record!", variant: "outline" }}
              />
              <StatsCard
                title="Total Points"
                value={stats.totalPoints}
                icon={Star}
                progress={{ value: 75, label: "To next milestone" }}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Upcoming Assignments</span>
                  </CardTitle>
                  <CardDescription>
                    Assignments due soon and in progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingAssignments.map((assignment) => {
                      const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                      
                      return (
                        <div key={assignment.id} className="p-4 border border-border rounded-lg hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium">{assignment.title}</h4>
                                {getStatusIcon(assignment.status)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {assignment.subject} • {assignment.teacher}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {assignment.totalPoints} points • {assignment.timeLimit} minutes
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={getPriorityColor(assignment.priority, daysUntilDue)}>
                                {daysUntilDue <= 0 
                                  ? "Overdue" 
                                  : daysUntilDue === 1 
                                    ? "Due Tomorrow" 
                                    : `${daysUntilDue} days`
                                }
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                              Due {new Date(assignment.dueDate).toLocaleDateString()} at{" "}
                              {new Date(assignment.dueDate).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            <Button 
                              size="sm" 
                              variant={assignment.status === "not-started" ? "default" : "outline"}
                            >
                              {assignment.status === "not-started" && "Start"}
                              {assignment.status === "in-progress" && "Continue"}
                              {assignment.status === "submitted" && "View"}
                              {assignment.status === "graded" && "Review"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Button variant="ghost" className="w-full mt-4">
                    View All Assignments
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Grades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="w-5 h-5" />
                    <span>Recent Grades</span>
                  </CardTitle>
                  <CardDescription>
                    Your latest assignment results and feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentGrades.map((grade) => (
                      <div key={grade.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-lg font-bold text-accent">{grade.grade}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{grade.assignment}</div>
                          <div className="text-sm text-muted-foreground">{grade.subject}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(grade.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{grade.score}</div>
                          <div className="text-xs text-muted-foreground">/{grade.totalPoints}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round((grade.score / grade.totalPoints) * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full mt-4">
                    View All Grades
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Study Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Study Progress</CardTitle>
                <CardDescription>
                  Track your learning journey across subjects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mathematics</span>
                      <span className="text-sm text-muted-foreground">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                    <div className="text-xs text-muted-foreground">8 assignments completed</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Physics</span>
                      <span className="text-sm text-muted-foreground">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <div className="text-xs text-muted-foreground">6 assignments completed</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Chemistry</span>
                      <span className="text-sm text-muted-foreground">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                    <div className="text-xs text-muted-foreground">5 assignments completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}