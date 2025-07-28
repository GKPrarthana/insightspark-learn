import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  FileText, 
  Upload, 
  Save, 
  Send, 
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  type: "short-answer" | "essay" | "multiple-choice";
  question: string;
  points: number;
  options?: string[];
  answer?: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  dueDate: string;
  timeLimit: number; // in minutes
  totalPoints: number;
  questions: Question[];
  status: "not-started" | "in-progress" | "submitted" | "graded";
  grade?: number;
  feedback?: string;
}

interface AssignmentViewerProps {
  assignment: Assignment;
  onSubmit?: (answers: Record<string, string>) => void;
  onSaveDraft?: (answers: Record<string, string>) => void;
}

export function AssignmentViewer({ assignment, onSubmit, onSaveDraft }: AssignmentViewerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(assignment.timeLimit * 60); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const getAnsweredCount = () => {
    return Object.values(answers).filter(answer => answer.trim()).length;
  };

  const getProgressPercentage = () => {
    return (getAnsweredCount() / assignment.questions.length) * 100;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSaveDraft = () => {
    onSaveDraft?.(answers);
    toast({
      title: "Draft saved",
      description: "Your progress has been saved automatically.",
    });
  };

  const handleSubmit = async () => {
    const unansweredQuestions = assignment.questions.length - getAnsweredCount();
    
    if (unansweredQuestions > 0) {
      const confirmed = window.confirm(
        `You have ${unansweredQuestions} unanswered question(s). Are you sure you want to submit?`
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit?.(answers);
      toast({
        title: "Assignment submitted",
        description: "Your assignment has been submitted for grading.",
      });
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again or contact your teacher.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: Question, index: number) => {
    const answer = answers[question.id] || "";

    return (
      <Card key={question.id} className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">
                Question {index + 1}
                <Badge variant="outline" className="ml-2">
                  {question.points} {question.points === 1 ? 'point' : 'points'}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-2">
                {question.question}
              </CardDescription>
            </div>
            <Badge variant={answer.trim() ? "default" : "outline"}>
              {answer.trim() ? "Answered" : "Pending"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {question.type === "multiple-choice" && question.options ? (
            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={answer === option}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="flex-1">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <Textarea
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              rows={question.type === "essay" ? 8 : 4}
              className="resize-none"
            />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Assignment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{assignment.title}</CardTitle>
              <CardDescription className="mt-2 flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{assignment.teacher}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{assignment.subject}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                </span>
              </CardDescription>
            </div>
            <Badge 
              variant={assignment.status === "submitted" ? "default" : "outline"}
              className="capitalize"
            >
              {assignment.status.replace("-", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Time Remaining</div>
                <div className="text-sm text-muted-foreground">
                  {formatTime(timeRemaining)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Progress</div>
                <div className="text-sm text-muted-foreground">
                  {getAnsweredCount()} of {assignment.questions.length} answered
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Total Points</div>
                <div className="text-sm text-muted-foreground">
                  {assignment.totalPoints} points
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Completion Progress</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Time Warning */}
      {timeRemaining < 600 && ( // Less than 10 minutes
        <Card className="border-warning">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-warning">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">
                Time is running out! You have {formatTime(timeRemaining)} remaining.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {assignment.questions.map((question, index) => renderQuestion(question, index))}
      </div>

      {/* Action Buttons */}
      {assignment.status !== "submitted" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Save className="w-4 h-4" />
                <span>Auto-saving every 30 seconds</span>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button 
                  variant="hero" 
                  onClick={handleSubmit}
                  disabled={isSubmitting || getAnsweredCount() === 0}
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Assignment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grade and Feedback (if submitted and graded) */}
      {assignment.status === "graded" && assignment.grade !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-accent" />
              <span>Grade and Feedback</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-3xl font-bold text-accent">
                {assignment.grade}/{assignment.totalPoints}
              </div>
              <div className="text-muted-foreground">
                {Math.round((assignment.grade / assignment.totalPoints) * 100)}%
              </div>
            </div>
            {assignment.feedback && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-medium mb-2">Teacher Feedback</h4>
                  <p className="text-muted-foreground">{assignment.feedback}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}