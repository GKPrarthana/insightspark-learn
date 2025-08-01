import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStudent } from "@/hooks/useStudent";
import { BarChart, TrendingUp, Award, Calendar } from "lucide-react";

export function StudentGrades() {
  const { assignments, progress, loading } = useStudent();

  const gradedAssignments = assignments.filter(
    assignment => assignment.submission?.status === 'graded' && assignment.submission.grade !== null
  );

  const calculateGPA = () => {
    if (gradedAssignments.length === 0) return 0;
    const totalPoints = gradedAssignments.reduce((sum, assignment) => 
      sum + (assignment.submission?.grade || 0), 0);
    const maxPoints = gradedAssignments.reduce((sum, assignment) => 
      sum + assignment.total_points, 0);
    return maxPoints > 0 ? (totalPoints / maxPoints) * 4.0 : 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const gpa = calculateGPA();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <Navigation userRole="student" currentPath="/student/grades" />
        
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Grades & Progress</h1>
              <p className="text-muted-foreground">Track your academic performance</p>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall GPA</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{gpa.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Based on {gradedAssignments.length} graded assignments
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Assignments Graded</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{gradedAssignments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Out of {assignments.length} total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {gradedAssignments.length > 0 ? 
                      Math.round((gradedAssignments.reduce((sum, a) => sum + ((a.submission?.grade || 0) / a.total_points * 100), 0) / gradedAssignments.length)) : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all subjects
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Subjects</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{progress.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently enrolled
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Subject Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Subject Progress</CardTitle>
                <CardDescription>Your performance in each subject</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                        <div className="h-2 bg-muted rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : progress.length === 0 ? (
                  <p className="text-muted-foreground">No progress data available yet.</p>
                ) : (
                  progress.map((subjectProgress) => {
                    const percentage = subjectProgress.total_points_possible > 0 ? 
                      (subjectProgress.total_points_earned / subjectProgress.total_points_possible) * 100 : 0;
                    
                    return (
                      <div key={subjectProgress.subject} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{subjectProgress.subject}</h4>
                            <p className="text-sm text-muted-foreground">
                              {subjectProgress.assignments_completed} assignments completed
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${getGradeColor(percentage)}`}>
                              {percentage.toFixed(1)}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {subjectProgress.total_points_earned}/{subjectProgress.total_points_possible} points
                            </p>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Recent Grades */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Grades</CardTitle>
                <CardDescription>Your latest graded assignments</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4 animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-4 bg-muted rounded w-1/6"></div>
                      </div>
                    ))}
                  </div>
                ) : gradedAssignments.length === 0 ? (
                  <p className="text-muted-foreground">No graded assignments yet.</p>
                ) : (
                  <div className="space-y-4">
                    {gradedAssignments
                      .sort((a, b) => new Date(b.submission?.submitted_at || 0).getTime() - new Date(a.submission?.submitted_at || 0).getTime())
                      .slice(0, 10)
                      .map((assignment) => {
                        const percentage = (assignment.submission?.grade || 0) / assignment.total_points * 100;
                        
                        return (
                          <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="space-y-1">
                              <h4 className="font-medium">{assignment.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{assignment.subject}</span>
                                <span>{formatDate(assignment.submission?.submitted_at || '')}</span>
                              </div>
                            </div>
                            
                            <div className="text-right space-y-1">
                              <div className={`text-lg font-bold ${getGradeColor(percentage)}`}>
                                {assignment.submission?.grade}/{assignment.total_points}
                              </div>
                              <Badge variant={percentage >= 80 ? "default" : percentage >= 60 ? "secondary" : "destructive"}>
                                {percentage.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}