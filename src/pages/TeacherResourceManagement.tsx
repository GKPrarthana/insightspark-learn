import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadResource } from "@/components/teacher/UploadResource";
import { ResourceList } from "@/components/teacher/ResourceList";
import { QuestionGenerator } from "@/components/teacher/QuestionGenerator";
import { Upload, FolderOpen, Brain } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function TeacherResourceManagement() {
  const [activeTab, setActiveTab] = useState("upload");
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Navigation userRole="teacher" />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Resource Management
              </h1>
              <p className="text-muted-foreground">
                Upload learning materials, manage your resources, and generate AI-powered questions
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload New
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  My Resources
                </TabsTrigger>
                <TabsTrigger value="questions" className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  Question Generator
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-6">
                <UploadResource />
              </TabsContent>

              <TabsContent value="resources" className="space-y-6">
                <ResourceList />
              </TabsContent>

              <TabsContent value="questions" className="space-y-6">
                <QuestionGenerator />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}