-- Fix RLS policy for resources table to properly handle teacher authentication
-- The issue is that teacher_id should reference the teacher's UUID from the teachers table,
-- not the auth.uid() directly

-- Drop the existing incorrect policy
DROP POLICY IF EXISTS "Teachers can manage their own resources" ON public.resources;

-- Create the correct policy that uses the get_current_teacher_id() function
CREATE POLICY "Teachers can manage their own resources" 
ON public.resources 
FOR ALL 
USING (teacher_id = get_current_teacher_id())
WITH CHECK (teacher_id = get_current_teacher_id());

-- Also create storage policies for the resources bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resources', 'resources', false)
ON CONFLICT (id) DO NOTHING;

-- Allow teachers to upload their own files
CREATE POLICY "Teachers can upload their own resources" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'resources' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow teachers to view their own files
CREATE POLICY "Teachers can view their own resources" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'resources' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow teachers to update their own files
CREATE POLICY "Teachers can update their own resources" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'resources' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow teachers to delete their own files
CREATE POLICY "Teachers can delete their own resources" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'resources' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);