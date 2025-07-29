-- Create resources table for storing uploaded learning materials
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  grade_level TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  ai_processed BOOLEAN DEFAULT FALSE,
  questions_generated JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies for resources
CREATE POLICY "Teachers can manage their own resources" 
ON public.resources 
FOR ALL 
USING (teacher_id = get_current_teacher_id());

-- Students can view resources from teachers they're enrolled with
CREATE POLICY "Students can view enrolled teacher resources" 
ON public.resources 
FOR SELECT 
USING (teacher_id IN (
  SELECT DISTINCT a.teacher_id 
  FROM assignments a 
  JOIN assignment_enrollments ae ON a.id = ae.assignment_id 
  WHERE ae.student_id = get_current_student_id()
));

-- Create storage bucket for educational resources
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resources', 'resources', false);

-- Create storage policies for resources bucket
CREATE POLICY "Teachers can upload their own resources" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'resources' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Teachers can view their own resources" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'resources' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Teachers can update their own resources" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'resources' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Teachers can delete their own resources" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'resources' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Students can view resources from enrolled teachers
CREATE POLICY "Students can view enrolled teacher resources storage" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'resources' AND 
  (storage.foldername(name))[1] IN (
    SELECT t.user_id::text 
    FROM teachers t 
    JOIN assignments a ON t.id = a.teacher_id 
    JOIN assignment_enrollments ae ON a.id = ae.assignment_id 
    WHERE ae.student_id = get_current_student_id()
  )
);

-- Create trigger for updating updated_at
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();