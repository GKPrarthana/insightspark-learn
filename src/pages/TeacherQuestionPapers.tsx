import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Search, Download, Edit, Trash2 } from "lucide-react";

export function TeacherQuestionPapers() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for question papers
  const questionPapers = [
    {
      id: 1,
      title: "Mathematics Final Exam",
      subject: "Mathematics",
      grade: "Grade 10",
      questions: 25,
      duration: "2 hours",
      createdAt: "2024-01-15",
      status: "published"
    },
    {
      id: 2,
      title: "Physics Mid-term Assessment",
      subject: "Physics",
      grade: "Grade 11",
      questions: 20,
      duration: "1.5 hours",
      createdAt: "2024-01-10",
      status: "draft"
    },
    {
      id: 3,
      title: "Chemistry Quiz - Organic Compounds",
      subject: "Chemistry",
      grade: "Grade 12",
      questions: 15,
      duration: "45 minutes",
      createdAt: "2024-01-08",
      status: "published"
    }
  ];

  const filteredPapers = questionPapers.filter(paper =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paper.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation userRole="teacher" currentPath="/teacher/question-papers" onNavigate={() => {}} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Question Papers</h1>
                <p className="text-muted-foreground">Create and manage your question papers</p>
              </div>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create New Paper
              </Button>
            </div>

            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search question papers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">Filter</Button>
                </div>
              </CardContent>
            </Card>

            {/* Question Papers Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPapers.map((paper) => (
                <Card key={paper.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{paper.title}</CardTitle>
                        <CardDescription>
                          {paper.subject} • {paper.grade}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(paper.status)}>
                        {paper.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{paper.questions} questions</span>
                        <span>{paper.duration}</span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Created: {new Date(paper.createdAt).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1 gap-1">
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 gap-1">
                          <Download className="h-3 w-3" />
                          Export
                        </Button>
                        <Button size="sm" variant="outline" className="px-2">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPapers.length === 0 && (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No question papers found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Create your first question paper to get started"}
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Question Paper
                </Button>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}