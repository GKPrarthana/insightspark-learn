-- Create storage bucket for resource files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resources', 'resources', true);

-- Create storage policies for resource files
CREATE POLICY "Teachers can upload their own resources" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'resources' AND 
  auth.jwt() ->> 'sub' IN (
    SELECT user_id FROM teachers WHERE user_id = auth.jwt() ->> 'sub'
  )
);

CREATE POLICY "Teachers can view their own resources" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'resources' AND 
  auth.jwt() ->> 'sub' IN (
    SELECT user_id FROM teachers WHERE user_id = auth.jwt() ->> 'sub'
  )
);

CREATE POLICY "Teachers can update their own resources" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'resources' AND 
  auth.jwt() ->> 'sub' IN (
    SELECT user_id FROM teachers WHERE user_id = auth.jwt() ->> 'sub'
  )
);

CREATE POLICY "Teachers can delete their own resources" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'resources' AND 
  auth.jwt() ->> 'sub' IN (
    SELECT user_id FROM teachers WHERE user_id = auth.jwt() ->> 'sub'
  )
);