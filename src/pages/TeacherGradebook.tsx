import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Download, BarChart2, FileText, User, Award } from "lucide-react";

interface Student {
  id: number;
  name: string;
  assignments: number;
  average: number;
  trend: 'up' | 'down' | 'stable';
  submissions: {
    assignment: string;
    score: number;
    maxScore: number;
    status: 'submitted' | 'late' | 'missing';
  }[];
}

export function TeacherGradebook() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for classes
  const classes = [
    { id: "math101", name: "Mathematics 101" },
    { id: "physics201", name: "Physics 201" },
    { id: "chemistry101", name: "Chemistry 101" },
  ];

  // Mock data for students and their grades
  const students: Student[] = [
    {
      id: 1,
      name: "Alice Johnson",
      assignments: 12,
      average: 88,
      trend: 'up',
      submissions: [
        { assignment: "Algebra Basics", score: 45, maxScore: 50, status: 'submitted' },
        { assignment: "Geometry Quiz", score: 38, maxScore: 40, status: 'submitted' },
        { assignment: "Calculus Test", score: 42, maxScore: 50, status: 'late' },
      ]
    },
    {
      id: 2,
      name: "Bob Smith",
      assignments: 12,
      average: 76,
      trend: 'stable',
      submissions: [
        { assignment: "Algebra Basics", score: 38, maxScore: 50, status: 'submitted' },
        { assignment: "Geometry Quiz", score: 32, maxScore: 40, status: 'submitted' },
        { assignment: "Calculus Test", score: 35, maxScore: 50, status: 'submitted' },
      ]
    },
    {
      id: 3,
      name: "Carol Davis",
      assignments: 10,
      average: 92,
      trend: 'up',
      submissions: [
        { assignment: "Algebra Basics", score: 49, maxScore: 50, status: 'submitted' },
        { assignment: "Geometry Quiz", score: 40, maxScore: 40, status: 'submitted' },
        { assignment: "Calculus Test", score: 47, maxScore: 50, status: 'submitted' },
      ]
    },
  ];

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted': return <Badge variant="outline" className="border-green-200 text-green-800 bg-green-50">Submitted</Badge>;
      case 'late': return <Badge variant="outline" className="border-yellow-200 text-yellow-800 bg-yellow-50">Late</Badge>;
      case 'missing': return <Badge variant="outline" className="border-red-200 text-red-800 bg-red-50">Missing</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation 
          userRole="teacher" 
          currentPath={location.pathname} 
          onNavigate={navigate} 
        />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Gradebook</h1>
                <p className="text-muted-foreground">
                  Track and manage student grades and progress
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button>
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>

            <Card className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search students..."
                      className="w-full pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-[180px]">
                        <Filter className="h-4 w-4 mr-2 opacity-50" />
                        <SelectValue placeholder="Filter by class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Student</TableHead>
                        <TableHead className="text-center">Average</TableHead>
                        <TableHead className="text-center">Trend</TableHead>
                        <TableHead className="text-center">Assignments</TableHead>
                        <TableHead className="text-center">Recent Submissions</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {student.assignments} assignments
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-lg">{student.average}%</span>
                              <span className="text-xs text-muted-foreground">
                                {student.average >= 90 ? 'A' : 
                                 student.average >= 80 ? 'B' : 
                                 student.average >= 70 ? 'C' : 
                                 student.average >= 60 ? 'D' : 'F'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className={`flex items-center justify-center ${getTrendColor(student.trend)}`}>
                              {student.trend === 'up' ? '↑' : student.trend === 'down' ? '↓' : '→'}
                              <span className="ml-1">
                                {student.trend === 'up' ? 'Improving' : 
                                 student.trend === 'down' ? 'Declining' : 'Stable'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(student.submissions.length / student.assignments) * 100} 
                                className="h-2" 
                              />
                              <span className="text-sm text-muted-foreground">
                                {student.submissions.length}/{student.assignments}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {student.submissions.map((sub, idx) => (
                                <div key={idx} className="flex items-center gap-1">
                                  <FileText className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs">
                                    {sub.score}/{sub.maxScore}
                                  </span>
                                  {getStatusBadge(sub.status)}
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="h-8">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Class Average</CardTitle>
                  <p className="text-2xl font-bold">
                    {Math.round(students.reduce((sum, s) => sum + s.average, 0) / students.length)}%
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Based on {students.length} students
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Assignments Graded
                  </CardTitle>
                  <p className="text-2xl font-bold">
                    {students.reduce((sum, s) => sum + s.submissions.length, 0)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    Across all students
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Top Performer
                  </CardTitle>
                  <p className="text-2xl font-bold">
                    {students.reduce((top, s) => s.average > (top?.average || 0) ? s : top, students[0])?.name}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Award className="h-3 w-3 text-yellow-500" />
                    {Math.max(...students.map(s => s.average))}% average
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
