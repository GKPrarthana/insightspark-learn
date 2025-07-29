-- Fix infinite recursion in RLS policies by creating proper helper functions

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Students can view assignments they're enrolled in" ON assignments;
DROP POLICY IF EXISTS "Teachers can view submissions for their assignments" ON student_submissions;
DROP POLICY IF EXISTS "Teachers can update grades and feedback" ON student_submissions;

-- Create safer policies for assignments
CREATE POLICY "Students can view assignments they're enrolled in" 
ON assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM assignment_enrollments ae 
    WHERE ae.assignment_id = assignments.id 
    AND ae.student_id IN (
      SELECT sp.id FROM student_profiles sp 
      WHERE sp.user_id = (auth.jwt() ->> 'sub'::text)
    )
  )
);

-- Create safer policies for student submissions  
CREATE POLICY "Teachers can view submissions for their assignments" 
ON student_submissions 
FOR SELECT 
USING (
  assignment_id IN (
    SELECT a.id FROM assignments a 
    WHERE a.teacher_id IN (
      SELECT t.id FROM teachers t 
      WHERE t.user_id = (auth.jwt() ->> 'sub'::text)
    )
  )
);

CREATE POLICY "Teachers can update grades and feedback" 
ON student_submissions 
FOR UPDATE 
USING (
  assignment_id IN (
    SELECT a.id FROM assignments a 
    WHERE a.teacher_id IN (
      SELECT t.id FROM teachers t 
      WHERE t.user_id = (auth.jwt() ->> 'sub'::text)
    )
  )
);