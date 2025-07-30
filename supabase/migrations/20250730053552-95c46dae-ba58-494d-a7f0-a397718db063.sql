-- Fix infinite recursion in assignments table RLS policy
-- The issue is the policy is calling get_current_teacher_id() which references the assignments table itself

-- Drop the problematic policy
DROP POLICY IF EXISTS "Teachers can manage their own assignments" ON public.assignments;

-- Create a corrected policy that doesn't cause recursion
CREATE POLICY "Teachers can manage their own assignments" 
ON public.assignments 
FOR ALL 
USING (teacher_id IN (
  SELECT id FROM public.teachers WHERE user_id = (auth.jwt() ->> 'sub')
));