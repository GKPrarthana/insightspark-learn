import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AssignmentViewer } from "@/components/student/AssignmentViewer";
import { AIStudyAssistant } from "@/components/student/AIStudyAssistant";
import { useStudent } from "@/hooks/useStudent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Star,
  Bot,
  BarChart3
} from "lucide-react";

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
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const { profile, assignments, progress, loading, submitAssignment, saveDraft } = useStudent();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load profile. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  // Calculate stats from real data
  const stats = {
    assignmentsCompleted: assignments.filter(a => a.submission?.status === 'graded').length,
    averageGrade: progress.length > 0 
      ? Math.round(progress.reduce((sum, p) => sum + p.average_grade, 0) / progress.length)
      : 0,
    currentStreak: 7, // Could implement streak calculation
    totalPoints: progress.reduce((sum, p) => sum + p.total_points_earned, 0)
  };

  // Get upcoming assignments (not submitted and due soon)
  const upcomingAssignments = assignments
    .filter(a => a.submission?.status !== 'submitted' && a.submission?.status !== 'graded')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  // Get recent grades
  const recentGrades: Grade[] = assignments
    .filter(a => a.submission?.status === 'graded' && a.submission?.grade !== undefined)
    .sort((a, b) => new Date(b.submission?.submitted_at || '').getTime() - new Date(a.submission?.submitted_at || '').getTime())
    .slice(0, 5)
    .map(a => ({
      id: a.id,
      subject: a.subject,
      assignment: a.title,
      score: a.submission?.grade || 0,
      totalPoints: a.total_points,
      grade: a.submission?.grade ? `${Math.round((a.submission.grade / a.total_points) * 100)}%` : 'N/A',
      date: a.submission?.submitted_at || ''
    }));

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "not-started":
        return <PlayCircle className="w-4 h-4" />;
      case "in-progress":
        return <Clock className="w-4 h-4" />;
      case "submitted":
        return <CheckCircle className="w-4 h-4" />;
      case "graded":
        return <Star className="w-4 h-4" />;
      default:
        return <PlayCircle className="w-4 h-4" />;
    }
  };

  // If viewing a specific assignment
  if (selectedAssignment) {
    const assignment = assignments.find(a => a.id === selectedAssignment);
    if (assignment) {
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
              <div className="max-w-4xl mx-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedAssignment(null)}
                  className="mb-4"
                >
                  ← Back to Dashboard
                </Button>
                
                <AssignmentViewer
                  assignment={{
                    id: assignment.id,
                    title: assignment.title,
                    subject: assignment.subject,
                    teacher: `${assignment.teacher.first_name} ${assignment.teacher.last_name}`,
                    dueDate: assignment.due_date,
                    timeLimit: assignment.time_limit,
                    totalPoints: assignment.total_points,
                    questions: assignment.questions,
                    status: assignment.submission?.status || 'not-started',
                    grade: assignment.submission?.grade,
                    feedback: assignment.submission?.feedback
                  }}
                  onSubmit={(answers) => submitAssignment(assignment.id, answers)}
                  onSaveDraft={(answers) => saveDraft(assignment.id, answers)}
                />
              </div>
            </main>
          </div>
        </div>
      );
    }
  }

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
                <h1 className="text-3xl font-bold text-foreground">
                  Good morning, {profile.first_name}!
                </h1>
                <p className="text-muted-foreground mt-1">
                  You have {upcomingAssignments.length} upcoming assignments. Keep up the great work!
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Current GPA</div>
                <div className="text-2xl font-bold text-accent">
                  {profile.gpa ? profile.gpa.toFixed(2) : 'N/A'}
                </div>
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

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="ai-assistant">
                  <Bot className="w-4 h-4 mr-2" />
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
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
                        {upcomingAssignments.length > 0 ? upcomingAssignments.map((assignment) => {
                          const daysUntilDue = getDaysUntilDue(assignment.due_date);
                          
                          return (
                            <div key={assignment.id} className="p-4 border border-border rounded-lg hover:shadow-sm transition-shadow">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium">{assignment.title}</h4>
                                    {getStatusIcon(assignment.submission?.status || 'not-started')}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {assignment.subject} • {assignment.teacher.first_name} {assignment.teacher.last_name}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {assignment.total_points} points • {assignment.time_limit} minutes
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant={daysUntilDue <= 1 ? "destructive" : "default"}>
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
                                  Due {new Date(assignment.due_date).toLocaleDateString()} at{" "}
                                  {new Date(assignment.due_date).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </div>
                                <Button 
                                  size="sm" 
                                  variant={assignment.submission?.status === "not-started" ? "default" : "outline"}
                                  onClick={() => setSelectedAssignment(assignment.id)}
                                >
                                  {assignment.submission?.status === "not-started" && "Start"}
                                  {assignment.submission?.status === "in-progress" && "Continue"}
                                  {assignment.submission?.status === "submitted" && "View"}
                                  {assignment.submission?.status === "graded" && "Review"}
                                </Button>
                              </div>
                            </div>
                          );
                        }) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No upcoming assignments</p>
                          </div>
                        )}
                      </div>
                      {upcomingAssignments.length > 0 && (
                        <Button variant="ghost" className="w-full mt-4">
                          View All Assignments
                        </Button>
                      )}
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
                        {recentGrades.length > 0 ? recentGrades.map((grade) => (
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
                        )) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No grades available yet</p>
                          </div>
                        )}
                      </div>
                      {recentGrades.length > 0 && (
                        <Button variant="ghost" className="w-full mt-4">
                          View All Grades
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="ai-assistant">
                <AIStudyAssistant 
                  context={{
                    subject: upcomingAssignments[0]?.subject,
                    assignment: upcomingAssignments[0]?.title
                  }}
                />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
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
                      {progress.length > 0 ? progress.map((subjectProgress) => (
                        <div key={subjectProgress.subject} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{subjectProgress.subject}</span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(subjectProgress.average_grade)}%
                            </span>
                          </div>
                          <Progress value={subjectProgress.average_grade} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {subjectProgress.assignments_completed} assignments completed
                          </div>
                        </div>
                      )) : (
                        <div className="col-span-3 text-center py-8 text-muted-foreground">
                          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No progress data available yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}