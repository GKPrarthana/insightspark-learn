import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Brain, 
  FileText, 
  Plus, 
  Minus, 
  Download,
  Eye,
  Settings,
  Sparkles
} from "lucide-react";
import { useTeacher } from "@/hooks/useTeacher";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Resource = Database['public']['Tables']['resources']['Row'];

interface QuestionType {
  id: string;
  label: string;
  description: string;
}

const questionTypes: QuestionType[] = [
  { id: 'multiple-choice', label: 'Multiple Choice', description: 'Questions with 4 answer options' },
  { id: 'true-false', label: 'True/False', description: 'Binary choice questions' },
  { id: 'short-answer', label: 'Short Answer', description: 'Brief written responses' },
  { id: 'essay', label: 'Essay', description: 'Long-form written responses' },
  { id: 'fill-blank', label: 'Fill in the Blank', description: 'Complete the sentence questions' }
];

export function QuestionGenerator() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(['multiple-choice']);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingResources, setLoadingResources] = useState(true);
  
  const { toast } = useToast();
  const { profile } = useTeacher();

  const fetchResources = async () => {
    if (!profile) return;
    
    setLoadingResources(true);
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('teacher_id', profile.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch resources",
        variant: "destructive",
      });
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [profile]);

  const handleResourceSelection = (resourceId: string, checked: boolean) => {
    if (checked) {
      setSelectedResources([...selectedResources, resourceId]);
    } else {
      setSelectedResources(selectedResources.filter(id => id !== resourceId));
    }
  };

  const handleQuestionTypeSelection = (typeId: string, checked: boolean) => {
    if (checked) {
      setSelectedQuestionTypes([...selectedQuestionTypes, typeId]);
    } else {
      setSelectedQuestionTypes(selectedQuestionTypes.filter(id => id !== typeId));
    }
  };

  const generateQuestions = async () => {
    if (selectedResources.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one resource",
        variant: "destructive",
      });
      return;
    }

    if (selectedQuestionTypes.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one question type",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Call AI edge function to generate questions
      const { data, error } = await supabase.functions.invoke('ai-study-assistant', {
        body: {
          action: 'generate-questions',
          resourceIds: selectedResources,
          questionTypes: selectedQuestionTypes,
          questionCount,
          difficulty,
          customPrompt
        }
      });

      if (error) throw error;
      
      setGeneratedQuestions(data.questions || []);
      toast({
        title: "Success",
        description: `Generated ${data.questions?.length || 0} questions successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportQuestions = async (format: 'pdf' | 'docx' | 'json') => {
    if (generatedQuestions.length === 0) {
      toast({
        title: "Error",
        description: "No questions to export",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-study-assistant', {
        body: {
          action: 'export-questions',
          questions: generatedQuestions,
          format
        }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data.content], { type: data.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Questions exported as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to export questions",
        variant: "destructive",
      });
    }
  };

  if (loadingResources) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resource Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Select Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          {resources.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No completed resources found. Upload and process resources first.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((resource) => (
                <div key={resource.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={resource.id}
                    checked={selectedResources.includes(resource.id)}
                    onCheckedChange={(checked) => 
                      handleResourceSelection(resource.id, checked as boolean)
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={resource.id} className="font-medium cursor-pointer">
                      {resource.title}
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {resource.subject}
                      </Badge>
                      {resource.grade_level && (
                        <Badge variant="outline" className="text-xs">
                          Grade {resource.grade_level}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Question Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Types */}
          <div>
            <Label className="text-base font-medium">Question Types</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {questionTypes.map((type) => (
                <div key={type.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={type.id}
                    checked={selectedQuestionTypes.includes(type.id)}
                    onCheckedChange={(checked) => 
                      handleQuestionTypeSelection(type.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor={type.id} className="font-medium cursor-pointer">
                      {type.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question Count and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="questionCount">Number of Questions</Label>
              <Input
                id="questionCount"
                type="number"
                min={1}
                max={50}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="mt-2 w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          {/* Custom Prompt */}
          <div>
            <Label htmlFor="customPrompt">Custom Instructions (Optional)</Label>
            <Textarea
              id="customPrompt"
              placeholder="Add any specific instructions for question generation..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button 
          onClick={generateQuestions}
          disabled={loading || selectedResources.length === 0}
          size="lg"
          className="px-8"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Questions
            </>
          )}
        </Button>
      </div>

      {/* Generated Questions */}
      {generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Generated Questions ({generatedQuestions.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => exportQuestions('pdf')}>
                  <Download className="w-4 h-4 mr-1" />
                  PDF
                </Button>
                <Button variant="outline" onClick={() => exportQuestions('docx')}>
                  <Download className="w-4 h-4 mr-1" />
                  DOCX
                </Button>
                <Button variant="outline" onClick={() => exportQuestions('json')}>
                  <Download className="w-4 h-4 mr-1" />
                  JSON
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {generatedQuestions.map((question, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {question.type?.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {question.difficulty}
                    </Badge>
                  </div>
                  <p className="font-medium mb-2">{question.question}</p>
                  {question.options && (
                    <div className="ml-4 space-y-1">
                      {question.options.map((option: string, optIndex: number) => (
                        <p key={optIndex} className="text-sm text-muted-foreground">
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </p>
                      ))}
                    </div>
                  )}
                  {question.answer && (
                    <p className="text-sm font-medium text-green-600 mt-2">
                      Answer: {question.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}