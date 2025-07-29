-- Fix infinite recursion in assignments table RLS policies
-- Drop the problematic policies and recreate them properly

DROP POLICY IF EXISTS "Teachers can manage their own assignments" ON assignments;
DROP POLICY IF EXISTS "Students can view assignments they're enrolled in" ON assignments;

-- Create new policies without circular references
CREATE POLICY "Teachers can manage their own assignments" 
ON assignments 
FOR ALL 
USING (teacher_id IN (
  SELECT id FROM teachers WHERE user_id = (auth.jwt() ->> 'sub')
));

CREATE POLICY "Students can view assignments they're enrolled in" 
ON assignments 
FOR SELECT 
USING (id IN (
  SELECT assignment_id FROM assignment_enrollments 
  WHERE student_id IN (
    SELECT id FROM student_profiles WHERE user_id = (auth.jwt() ->> 'sub')
  )
));