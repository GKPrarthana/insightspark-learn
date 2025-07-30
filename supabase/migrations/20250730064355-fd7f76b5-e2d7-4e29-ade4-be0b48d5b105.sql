-- Fix infinite recursion between assignments and assignment_enrollments tables
-- Create security definer function to break circular dependency

-- Create function to get assignment IDs for current teacher
CREATE OR REPLACE FUNCTION public.get_teacher_assignment_ids()
RETURNS TABLE(assignment_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM public.assignments 
  WHERE teacher_id IN (
    SELECT id FROM public.teachers 
    WHERE user_id = (auth.jwt() ->> 'sub')
  );
$$;

-- Drop existing problematic policy on assignment_enrollments
DROP POLICY IF EXISTS "Teachers can manage enrollments for their assignments" ON public.assignment_enrollments;

-- Create new policy using security definer function to avoid recursion
CREATE POLICY "Teachers can manage enrollments for their assignments" 
ON public.assignment_enrollments 
FOR ALL 
USING (assignment_id IN (SELECT assignment_id FROM public.get_teacher_assignment_ids()));