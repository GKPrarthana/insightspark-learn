import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ClipboardList, Plus, Search, Calendar, Users, Clock, MoreHorizontal } from "lucide-react";

export function TeacherAssignments() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for assignments
  const assignments = [
    {
      id: 1,
      title: "Mathematics Final Exam",
      subject: "Mathematics",
      dueDate: "2024-02-15",
      totalStudents: 25,
      submitted: 18,
      graded: 12,
      status: "active",
      points: 100,
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      title: "Physics Lab Report",
      subject: "Physics", 
      dueDate: "2024-02-10",
      totalStudents: 20,
      submitted: 20,
      graded: 20,
      status: "completed",
      points: 50,
      createdAt: "2024-01-10"
    },
    {
      id: 3,
      title: "Chemistry Quiz - Organic Compounds",
      subject: "Chemistry",
      dueDate: "2024-02-20",
      totalStudents: 22,
      submitted: 5,
      graded: 0,
      status: "active",
      points: 25,
      createdAt: "2024-01-20"
    },
    {
      id: 4,
      title: "Biology Research Project",
      subject: "Biology",
      dueDate: "2024-02-25",
      totalStudents: 18,
      submitted: 0,
      graded: 0,
      status: "draft",
      points: 75,
      createdAt: "2024-01-22"
    }
  ];

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSubmissionProgress = (submitted: number, total: number) => {
    return Math.round((submitted / total) * 100);
  };

  const getGradingProgress = (graded: number, submitted: number) => {
    if (submitted === 0) return 0;
    return Math.round((graded / submitted) * 100);
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status === "active";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation userRole="teacher" currentPath="/teacher/assignments" onNavigate={() => {}} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
                <p className="text-muted-foreground">Create and manage your assignments</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Assignment
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignments.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {assignments.filter(a => a.status === 'active').length} active
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {assignments.reduce((acc, a) => acc + (a.submitted - a.graded), 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submissions to grade
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.max(...assignments.map(a => a.totalStudents))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enrolled students
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(
                      assignments
                        .filter(a => a.status !== 'draft')
                        .reduce((acc, a) => acc + getSubmissionProgress(a.submitted, a.totalStudents), 0) / 
                      assignments.filter(a => a.status !== 'draft').length
                    )}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submission rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Table */}
            <Card>
              <CardHeader>
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search assignments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">Filter</Button>
                  <Button variant="outline">Export</Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Grading Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map((assignment) => {
                      const submissionProgress = getSubmissionProgress(assignment.submitted, assignment.totalStudents);
                      const gradingProgress = getGradingProgress(assignment.graded, assignment.submitted);
                      const overdue = isOverdue(assignment.dueDate, assignment.status);
                      
                      return (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{assignment.title}</div>
                              <div className="text-sm text-muted-foreground">{assignment.subject}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className={overdue ? "text-red-600" : ""}>
                                {new Date(assignment.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="text-sm">
                                {assignment.submitted}/{assignment.totalStudents} submitted
                              </div>
                              <Progress value={submissionProgress} className="h-2" />
                              <div className="text-xs text-muted-foreground">
                                {submissionProgress}% completion
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              <div className="text-sm">
                                {assignment.graded}/{assignment.submitted} graded
                              </div>
                              <Progress value={gradingProgress} className="h-2" />
                              <div className="text-xs text-muted-foreground">
                                {gradingProgress}% graded
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(overdue ? 'overdue' : assignment.status)}>
                              {overdue ? 'overdue' : assignment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{assignment.points} pts</div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {filteredAssignments.length === 0 && (
                  <div className="text-center py-8">
                    <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "Try adjusting your search terms" : "Create your first assignment to get started"}
                    </p>
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