import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { TeacherResourceManagement } from "./pages/TeacherResourceManagement";
import { TeacherQuestionPapers } from "./pages/TeacherQuestionPapers";
import { TeacherStudents } from "./pages/TeacherStudents";
import { TeacherAssignments } from "./pages/TeacherAssignments";
import { TeacherBilling } from "./pages/TeacherBilling";
import { TeacherSettings } from "./pages/TeacherSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/upload" element={<TeacherResourceManagement />} />
          <Route path="/teacher/question-papers" element={<TeacherQuestionPapers />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route path="/teacher/billing" element={<TeacherBilling />} />
          <Route path="/teacher/settings" element={<TeacherSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
