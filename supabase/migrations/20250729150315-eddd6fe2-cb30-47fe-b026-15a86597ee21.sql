-- Fix RLS policies for student_profiles to work with Clerk authentication
DROP POLICY IF EXISTS "Users can view their own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.student_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.student_profiles;

-- Create new policies that work with Clerk JWT structure
CREATE POLICY "Users can view their own profile" 
ON public.student_profiles 
FOR SELECT 
USING (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can create their own profile" 
ON public.student_profiles 
FOR INSERT 
WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can update their own profile" 
ON public.student_profiles 
FOR UPDATE 
USING (user_id = (auth.jwt() ->> 'sub'))
WITH CHECK (user_id = (auth.jwt() ->> 'sub'));

CREATE POLICY "Users can delete their own profile" 
ON public.student_profiles 
FOR DELETE 
USING (user_id = (auth.jwt() ->> 'sub'));