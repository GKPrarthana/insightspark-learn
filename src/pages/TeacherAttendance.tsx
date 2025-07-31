import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Search, Check, X, Clock } from "lucide-react";

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface StudentAttendance {
  id: number;
  name: string;
  rollNumber: string;
  attendance: Record<string, AttendanceStatus>;
  attendancePercentage: number;
}

export function TeacherAttendance() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const today = new Date().toISOString().split('T')[0];

  // Mock data for student attendance
  const studentAttendance: StudentAttendance[] = [
    {
      id: 1,
      name: "Alice Johnson",
      rollNumber: "S001",
      attendance: { [today]: 'present' },
      attendancePercentage: 92,
    },
    {
      id: 2,
      name: "Bob Smith",
      rollNumber: "S002",
      attendance: { [today]: 'late' },
      attendancePercentage: 85,
    },
    {
      id: 3,
      name: "Carol Davis",
      rollNumber: "S003",
      attendance: { [today]: 'absent' },
      attendancePercentage: 76,
    },
  ];

  const filteredStudents = studentAttendance.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status?: AttendanceStatus) => {
    if (!status) return null;
    
    switch (status) {
      case 'present':
        return <Badge variant="outline" className="border-green-200 text-green-800 bg-green-50">
          <Check className="h-3 w-3 mr-1" /> Present
        </Badge>;
      case 'absent':
        return <Badge variant="outline" className="border-red-200 text-red-800 bg-red-50">
          <X className="h-3 w-3 mr-1" /> Absent
        </Badge>;
      case 'late':
        return <Badge variant="outline" className="border-yellow-200 text-yellow-800 bg-yellow-50">
          <Clock className="h-3 w-3 mr-1" /> Late
        </Badge>;
      default:
        return <Badge variant="outline">Excused</Badge>;
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
                <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
                <p className="text-muted-foreground">
                  Track and manage student attendance
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex gap-2">
                <Button variant="outline">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {new Date().toLocaleDateString()}
                </Button>
                <Button>
                  <Check className="w-4 h-4 mr-2" />
                  Mark All Present
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-3">
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
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Attendance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-sm font-medium">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p>{student.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {student.rollNumber}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(student.attendance[today])}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  student.attendancePercentage >= 90 ? 'bg-green-500' :
                                  student.attendancePercentage >= 75 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${student.attendancePercentage}%` }}
                              />
                            </div>
                            <span className="text-sm">{student.attendancePercentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
