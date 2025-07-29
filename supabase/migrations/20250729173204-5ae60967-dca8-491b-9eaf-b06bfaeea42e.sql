-- Check current policies on assignments table and fix the infinite recursion completely
-- First, let's drop ALL policies on assignments table to start fresh
DROP POLICY IF EXISTS "Teachers can manage their own assignments" ON assignments;
DROP POLICY IF EXISTS "Students can view assignments they're enrolled in" ON assignments;

-- Create a security definer function to get teacher ID for current user
CREATE OR REPLACE FUNCTION public.get_current_teacher_id()
RETURNS UUID AS $$
  SELECT id FROM public.teachers WHERE user_id = (auth.jwt() ->> 'sub');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create a security definer function to get student ID for current user  
CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS UUID AS $$
  SELECT id FROM public.student_profiles WHERE user_id = (auth.jwt() ->> 'sub');
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Now create proper policies using the functions
CREATE POLICY "Teachers can manage their own assignments" 
ON assignments 
FOR ALL 
USING (teacher_id = public.get_current_teacher_id());

CREATE POLICY "Students can view assignments they're enrolled in" 
ON assignments 
FOR SELECT 
USING (id IN (
  SELECT assignment_id FROM assignment_enrollments 
  WHERE student_id = public.get_current_student_id()
));