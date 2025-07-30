-- Fix storage policies to match the folder structure used in the code
-- The code uses profile.id (teacher UUID) for folder names, not auth.uid()

-- Drop existing storage policies
DROP POLICY IF EXISTS "Teachers can upload their own resources" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can view their own resources" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update their own resources" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete their own resources" ON storage.objects;

-- Create corrected storage policies that check against teacher.id instead of auth.uid()
CREATE POLICY "Teachers can upload their own resources" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'resources' 
  AND (storage.foldername(name))[1] = get_current_teacher_id()::text
);

CREATE POLICY "Teachers can view their own resources" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'resources' 
  AND (storage.foldername(name))[1] = get_current_teacher_id()::text
);

CREATE POLICY "Teachers can update their own resources" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'resources' 
  AND (storage.foldername(name))[1] = get_current_teacher_id()::text
);

CREATE POLICY "Teachers can delete their own resources" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'resources' 
  AND (storage.foldername(name))[1] = get_current_teacher_id()::text
);