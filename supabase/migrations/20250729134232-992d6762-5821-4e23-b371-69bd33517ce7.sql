-- Fix RLS policies for student_profiles to allow profile creation
DROP POLICY IF EXISTS "Students can view their own profile" ON student_profiles;
DROP POLICY IF EXISTS "Students can create their own profile" ON student_profiles;
DROP POLICY IF EXISTS "Students can update their own profile" ON student_profiles;

-- Create new policies with proper Clerk JWT support
CREATE POLICY "Students can view their own profile" 
ON student_profiles 
FOR SELECT 
USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Students can create their own profile" 
ON student_profiles 
FOR INSERT 
WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Students can update their own profile" 
ON student_profiles 
FOR UPDATE 
USING (user_id = auth.jwt() ->> 'sub');