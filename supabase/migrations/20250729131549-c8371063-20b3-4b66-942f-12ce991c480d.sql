-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Fix the second function search path
CREATE OR REPLACE FUNCTION public.update_student_progress()
RETURNS TRIGGER AS $$
DECLARE
  assignment_record public.assignments%ROWTYPE;
  student_stats RECORD;
BEGIN
  -- Get assignment details
  SELECT * INTO assignment_record FROM public.assignments WHERE id = NEW.assignment_id;
  
  -- Calculate student's stats for this subject
  SELECT 
    COUNT(*) as completed_assignments,
    COALESCE(SUM(grade), 0) as total_points_earned,
    COALESCE(SUM(a.total_points), 0) as total_points_possible,
    COALESCE(AVG(grade), 0) as average_grade
  INTO student_stats
  FROM public.student_submissions s
  JOIN public.assignments a ON s.assignment_id = a.id
  WHERE s.student_id = NEW.student_id 
    AND a.subject = assignment_record.subject 
    AND s.status = 'graded';
  
  -- Upsert student progress
  INSERT INTO public.student_progress (
    student_id, 
    subject, 
    assignments_completed, 
    total_points_earned, 
    total_points_possible, 
    average_grade
  ) VALUES (
    NEW.student_id,
    assignment_record.subject,
    student_stats.completed_assignments,
    student_stats.total_points_earned,
    student_stats.total_points_possible,
    student_stats.average_grade
  )
  ON CONFLICT (student_id, subject) 
  DO UPDATE SET
    assignments_completed = student_stats.completed_assignments,
    total_points_earned = student_stats.total_points_earned,
    total_points_possible = student_stats.total_points_possible,
    average_grade = student_stats.average_grade,
    last_updated = now();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';