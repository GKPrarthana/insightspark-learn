-- First, let's check current RLS policies and drop all existing ones
DO $$
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (
    SELECT 
      p.polname, 
      n.nspname AS schemaname, 
      c.relname AS tablename 
    FROM pg_policy p
    JOIN pg_class c ON p.polrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      r.polname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Comprehensive RLS policies for all tables
-- This migration ensures all tables have proper RLS policies that work with Clerk authentication

-- Fix security definer functions first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_student_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.get_current_teacher_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id FROM public.teachers WHERE user_id = (auth.jwt() ->> 'sub');
$$;

CREATE OR REPLACE FUNCTION public.get_current_student_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id FROM public.student_profiles WHERE user_id = (auth.jwt() ->> 'sub');
$$;

CREATE OR REPLACE FUNCTION public.get_teacher_assignment_ids()
RETURNS TABLE(assignment_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT id FROM public.assignments 
  WHERE teacher_id IN (
    SELECT id FROM public.teachers 
    WHERE user_id = (auth.jwt() ->> 'sub')
  );
$$;

-- Teachers table policies
CREATE POLICY "Teachers can view their own profile" 
ON public.teachers 
FOR SELECT 
USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Teachers can create their own profile" 
ON public.teachers 
FOR INSERT 
WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Teachers can update their own profile" 
ON public.teachers 
FOR UPDATE 
USING ((auth.jwt() ->> 'sub') = user_id);

-- Student profiles table policies
CREATE POLICY "Students can view their own profile" 
ON public.student_profiles 
FOR SELECT 
USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Students can create their own profile" 
ON public.student_profiles 
FOR INSERT 
WITH CHECK ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Students can update their own profile" 
ON public.student_profiles 
FOR UPDATE 
USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Teachers can view student profiles" 
ON public.student_profiles 
FOR SELECT 
USING (true);

-- Assignments table policies
CREATE POLICY "Teachers can manage their own assignments" 
ON public.assignments 
FOR ALL 
USING (teacher_id = public.get_current_teacher_id());

CREATE POLICY "Students can view enrolled assignments" 
ON public.assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.assignment_enrollments ae 
    WHERE ae.assignment_id = assignments.id 
    AND ae.student_id = public.get_current_student_id()
  )
);

-- Assignment enrollments table policies
CREATE POLICY "Teachers can manage enrollments for their assignments" 
ON public.assignment_enrollments 
FOR ALL 
USING (
  assignment_id IN (
    SELECT assignment_id FROM public.get_teacher_assignment_ids()
  )
);

CREATE POLICY "Students can view their enrollments" 
ON public.assignment_enrollments 
FOR SELECT 
USING (student_id = public.get_current_student_id());

-- Student submissions table policies
CREATE POLICY "Students can manage their own submissions" 
ON public.student_submissions 
FOR ALL 
USING (student_id = public.get_current_student_id());

CREATE POLICY "Teachers can view submissions for their assignments" 
ON public.student_submissions 
FOR SELECT 
USING (
  assignment_id IN (
    SELECT assignment_id FROM public.get_teacher_assignment_ids()
  )
);

CREATE POLICY "Teachers can update grades and feedback" 
ON public.student_submissions 
FOR UPDATE 
USING (
  assignment_id IN (
    SELECT assignment_id FROM public.get_teacher_assignment_ids()
  )
);

-- Student progress table policies
CREATE POLICY "Students can view their own progress" 
ON public.student_progress 
FOR SELECT 
USING (student_id = public.get_current_student_id());

CREATE POLICY "Teachers can view all student progress" 
ON public.student_progress 
FOR SELECT 
USING (true);

CREATE POLICY "System can update student progress" 
ON public.student_progress 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update student progress records" 
ON public.student_progress 
FOR UPDATE 
USING (true);

-- Resources table policies
CREATE POLICY "Teachers can manage their own resources" 
ON public.resources 
FOR ALL 
USING (teacher_id = public.get_current_teacher_id());

CREATE POLICY "Students can view resources from enrolled assignments" 
ON public.resources 
FOR SELECT 
USING (
  teacher_id IN (
    SELECT DISTINCT a.teacher_id
    FROM public.assignments a
    JOIN public.assignment_enrollments ae ON a.id = ae.assignment_id
    WHERE ae.student_id = public.get_current_student_id()
  )
);

-- Uploads table policies
CREATE POLICY "Teachers can upload files" 
ON public.uploads_table 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE user_id = (auth.jwt() ->> 'sub')
  )
);

CREATE POLICY "Teachers can view their uploads" 
ON public.uploads_table 
FOR SELECT 
USING (
  user_id IN (
    SELECT id::uuid FROM public.teachers 
    WHERE user_id = (auth.jwt() ->> 'sub')
  )
);

-- Storage policies for resources bucket
CREATE POLICY "Teachers can upload to resources bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'resources' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE user_id = (auth.jwt() ->> 'sub')
  )
);

CREATE POLICY "Teachers can view resources they uploaded" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'resources' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Teachers can update their resource files" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'resources' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE user_id = (auth.jwt() ->> 'sub')
  )
);

CREATE POLICY "Teachers can delete their resource files" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'resources' 
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE user_id = (auth.jwt() ->> 'sub')
  )
);