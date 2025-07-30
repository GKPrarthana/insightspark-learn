-- Fix storage RLS policies for file uploads
-- First, ensure the buckets exist with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('resources', 'resources', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png', 'image/gif'];

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Teachers can upload resources" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can view their resources" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can update their resources" ON storage.objects;
DROP POLICY IF EXISTS "Teachers can delete their resources" ON storage.objects;

-- Create comprehensive storage policies for the resources bucket
CREATE POLICY "Teachers can upload to resources bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'resources' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Teachers can view their own files in resources bucket"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'resources' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Teachers can update their own files in resources bucket"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'resources' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Teachers can delete their own files in resources bucket"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'resources' AND
  auth.uid()::text = (storage.foldername(name))[1]
);