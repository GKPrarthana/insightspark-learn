import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStudent } from "@/hooks/useStudent";
import { BookOpen, Clock, Calendar } from "lucide-react";
import { AssignmentViewer } from "@/components/student/AssignmentViewer";

export function StudentAssignments() {
  const { assignments, loading } = useStudent();
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  if (selectedAssignment) {
    const assignment = assignments.find(a => a.id === selectedAssignment);
    if (!assignment) return null;
    
    // Transform assignment data to match AssignmentViewer interface
    const viewerAssignment = {
      id: assignment.id,
      title: assignment.title,
      subject: assignment.subject,
      teacher: "Teacher", // You might want to add teacher info to your data
      dueDate: assignment.due_date,
      timeLimit: assignment.time_limit,
      totalPoints: assignment.total_points,
      questions: assignment.questions as any[],
      status: assignment.submission?.status || "not-started" as const,
      grade: assignment.submission?.grade,
      feedback: assignment.submission?.feedback
    };
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Navigation userRole="student" currentPath="/student/assignments" />
          <main className="flex-1 p-6">
            <Button 
              variant="outline" 
              onClick={() => setSelectedAssignment(null)}
              className="mb-4"
            >
              ← Back to Assignments
            </Button>
            <AssignmentViewer assignment={viewerAssignment} />
          </main>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started': return 'secondary';
      case 'in-progress': return 'default';
      case 'submitted': return 'outline';
      case 'graded': return 'destructive';
      default: return 'secondary';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Navigation userRole="student" currentPath="/student/assignments" />
        
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
              <p className="text-muted-foreground">View and complete your assignments</p>
            </div>

            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : assignments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No assignments yet</h3>
                  <p className="text-muted-foreground text-center">
                    Your assignments will appear here once your teacher creates them.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {assignments.map((assignment) => {
                  const daysUntilDue = getDaysUntilDue(assignment.due_date);
                  const isOverdue = daysUntilDue < 0;
                  
                  return (
                    <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {assignment.description}
                            </CardDescription>
                          </div>
                          <Badge variant={getStatusColor(assignment.submission?.status || 'not-started')}>
                            {assignment.submission?.status || 'not-started'}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {isOverdue ? 'Overdue' : `${daysUntilDue} days left`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{assignment.time_limit} min</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{assignment.subject}</span>
                          <span className="text-sm text-muted-foreground">
                            {assignment.total_points} points
                          </span>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={() => setSelectedAssignment(assignment.id)}
                          disabled={isOverdue && !assignment.submission}
                        >
                          {assignment.submission?.status === 'submitted' ? 'View Submission' : 
                           assignment.submission?.status === 'graded' ? 'View Results' :
                           'Start Assignment'}
                        </Button>
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