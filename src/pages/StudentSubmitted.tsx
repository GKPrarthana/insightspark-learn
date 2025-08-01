import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStudent } from "@/hooks/useStudent";
import { CheckCircle, Clock, Calendar, FileText } from "lucide-react";

export function StudentSubmitted() {
  const { assignments, loading } = useStudent();

  const submittedAssignments = assignments.filter(
    assignment => assignment.submission && 
    ['submitted', 'graded'].includes(assignment.submission.status)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'default';
      case 'graded': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Navigation userRole="student" currentPath="/student/submitted" />
        
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Submitted Assignments</h1>
              <p className="text-muted-foreground">Track your submitted assignments and their status</p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
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
            ) : submittedAssignments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No submitted assignments</h3>
                  <p className="text-muted-foreground text-center">
                    Your submitted assignments will appear here once you complete them.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {submittedAssignments.map((assignment) => (
                  <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {assignment.description}
                          </CardDescription>
                        </div>
                        <Badge variant={getStatusColor(assignment.submission?.status || 'submitted')}>
                          {assignment.submission?.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Subject</p>
                            <p className="text-muted-foreground">{assignment.subject}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Due Date</p>
                            <p className="text-muted-foreground">
                              {formatDate(assignment.due_date)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Submitted</p>
                            <p className="text-muted-foreground">
                              {assignment.submission?.submitted_at ? 
                                formatDate(assignment.submission.submitted_at) : 
                                'Not available'
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Points</p>
                            <p className="text-muted-foreground">
                              {assignment.total_points} points
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {assignment.submission?.status === 'graded' && (
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Grade</span>
                            <span className="text-lg font-bold">
                              {assignment.submission.grade || 0}/{assignment.total_points}
                            </span>
                          </div>
                          {assignment.submission.feedback && (
                            <div>
                              <p className="text-sm font-medium mb-1">Feedback:</p>
                              <p className="text-sm text-muted-foreground">
                                {assignment.submission.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}