-- Fix RLS policies for teachers table to work properly with Clerk authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Teachers can view their own profile" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can update their own profile" ON public.teachers;
DROP POLICY IF EXISTS "Teachers can create their own profile" ON public.teachers;
DROP POLICY IF EXISTS "Anyone can view teacher basic info" ON public.teachers;

-- Create consistent policies that properly handle Clerk user IDs (text format)
CREATE POLICY "Teachers can view their own profile" 
ON public.teachers 
FOR SELECT 
USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Teachers can update their own profile" 
ON public.teachers 
FOR UPDATE 
USING ((auth.jwt() ->> 'sub') = user_id);

CREATE POLICY "Teachers can create their own profile" 
ON public.teachers 
FOR INSERT 
WITH CHECK ((auth.jwt() ->> 'sub') = user_id);