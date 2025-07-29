import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  BookOpen,
  Brain
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTeacher } from "@/hooks/useTeacher";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
}

export function UploadResource() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const { toast } = useToast();
  const { profile } = useTeacher();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (fileList: File[]) => {
    const newFiles: UploadedFile[] = fileList.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      status: "uploading",
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    // Start real upload for each file
    newFiles.forEach(uploadedFile => {
      uploadToSupabase(uploadedFile.file, uploadedFile.id);
    });
  };

  const uploadToSupabase = useCallback(async (file: File, fileId: string) => {
    if (!profile) {
      toast({
        title: "Error",
        description: "Please ensure you're logged in as a teacher",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}-${file.name}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resources')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save resource metadata to database
      const { data: resourceData, error: dbError } = await supabase
        .from('resources')
        .insert({
          teacher_id: profile.id,
          title: title || file.name,
          description: description,
          subject: subject,
          grade_level: gradeLevel,
          file_url: uploadData.path,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          status: 'processing'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Mark as uploaded and processing
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: "processing", progress: 100 } : f
      ));

      // Simulate AI processing for now (replace with real AI function later)
      setTimeout(async () => {
        try {
          // Update status to completed
          await supabase
            .from('resources')
            .update({ status: 'completed', ai_processed: true })
            .eq('id', resourceData.id);

          // Mark as completed
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: "completed" } : f
          ));

          toast({
            title: "Resource processed successfully",
            description: "File uploaded and ready for question generation.",
          });
        } catch (error: any) {
          console.error('Processing error:', error);
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: "error" } : f
          ));
        }
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: "error", progress: 100 } : f
      ));
      
      toast({
        title: "Error",
        description: error.message || "Failed to upload resource",
        variant: "destructive",
      });
    }
  }, [title, description, subject, gradeLevel, profile, toast]);

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case "processing":
        return <Brain className="w-4 h-4 text-warning animate-pulse" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const handleGenerateQuestions = () => {
    const completedFiles = files.filter(f => f.status === "completed");
    if (completedFiles.length === 0) {
      toast({
        title: "No files ready",
        description: "Please wait for files to finish processing.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Generating questions...",
      description: `AI is creating questions from ${completedFiles.length} resource(s).`,
    });

    // Simulate navigation to questions page
    setTimeout(() => {
      toast({
        title: "Questions generated!",
        description: "Review and customize your AI-generated question paper.",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Resource Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Resource Information</span>
          </CardTitle>
          <CardDescription>
            Provide details about the educational content you're uploading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Resource Title</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Algebra"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade Level</Label>
              <Input
                id="grade"
                placeholder="e.g., Grade 9-10"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the content and learning objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Upload Learning Materials</span>
          </CardTitle>
          <CardDescription>
            Upload PDFs, documents, or text files for AI question generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Drag and drop files here, or{" "}
              <label className="text-primary cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.rtf"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </label>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF, DOC, DOCX, TXT files up to 10MB each
            </p>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Choose Files
            </Button>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Uploaded Files</h4>
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg"
                >
                  <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{file.name}</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(file.status)}
                        <Badge variant="outline" className="text-xs">
                          {file.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(file.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.status === "uploading" && (
                        <span>{Math.round(file.progress)}%</span>
                      )}
                    </div>
                    {file.status === "uploading" && (
                      <Progress value={file.progress} className="mt-2 h-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between">
            <Button variant="outline">
              Save as Draft
            </Button>
            <Button 
              variant="hero" 
              onClick={handleGenerateQuestions}
              disabled={files.filter(f => f.status === "completed").length === 0}
            >
              <Brain className="w-4 h-4 mr-2" />
              Generate AI Questions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}