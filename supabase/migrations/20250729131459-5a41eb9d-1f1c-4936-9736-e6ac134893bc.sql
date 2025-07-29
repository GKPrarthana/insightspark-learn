-- Create student profiles table
CREATE TABLE public.student_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  grade_level INTEGER,
  gpa DECIMAL(3,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create teachers table
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- Clerk user ID
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.teachers(id) NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  time_limit INTEGER NOT NULL, -- in minutes
  total_points INTEGER NOT NULL DEFAULT 100,
  questions JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student submissions table
CREATE TABLE public.student_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) NOT NULL,
  student_id UUID REFERENCES public.student_profiles(id) NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'not-started' CHECK (status IN ('not-started', 'in-progress', 'submitted', 'graded')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  grade DECIMAL(5,2),
  feedback TEXT,
  time_spent INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Create assignment enrollments table (which students can access which assignments)
CREATE TABLE public.assignment_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) NOT NULL,
  student_id UUID REFERENCES public.student_profiles(id) NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

-- Create student progress tracking table
CREATE TABLE public.student_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.student_profiles(id) NOT NULL,
  subject TEXT NOT NULL,
  assignments_completed INTEGER DEFAULT 0,
  total_points_earned DECIMAL(8,2) DEFAULT 0,
  total_points_possible DECIMAL(8,2) DEFAULT 0,
  average_grade DECIMAL(5,2) DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id, subject)
);

-- Enable Row Level Security
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_profiles
CREATE POLICY "Students can view and update their own profile" 
ON public.student_profiles 
FOR ALL 
USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Teachers can view student profiles" 
ON public.student_profiles 
FOR SELECT 
USING (true); -- Teachers need to see student info for assignments

-- Create RLS policies for teachers
CREATE POLICY "Teachers can view and update their own profile" 
ON public.teachers 
FOR ALL 
USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Anyone can view teacher basic info" 
ON public.teachers 
FOR SELECT 
USING (true);

-- Create RLS policies for assignments
CREATE POLICY "Teachers can manage their own assignments" 
ON public.assignments 
FOR ALL 
USING (teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Students can view assignments they're enrolled in" 
ON public.assignments 
FOR SELECT 
USING (id IN (
  SELECT assignment_id FROM public.assignment_enrollments 
  WHERE student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.jwt() ->> 'sub')
));

-- Create RLS policies for student_submissions
CREATE POLICY "Students can manage their own submissions" 
ON public.student_submissions 
FOR ALL 
USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Teachers can view submissions for their assignments" 
ON public.student_submissions 
FOR SELECT 
USING (assignment_id IN (SELECT id FROM public.assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.jwt() ->> 'sub')));

CREATE POLICY "Teachers can update grades and feedback" 
ON public.student_submissions 
FOR UPDATE 
USING (assignment_id IN (SELECT id FROM public.assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.jwt() ->> 'sub')));

-- Create RLS policies for assignment_enrollments
CREATE POLICY "Teachers can manage enrollments for their assignments" 
ON public.assignment_enrollments 
FOR ALL 
USING (assignment_id IN (SELECT id FROM public.assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE user_id = auth.jwt() ->> 'sub')));

CREATE POLICY "Students can view their own enrollments" 
ON public.assignment_enrollments 
FOR SELECT 
USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.jwt() ->> 'sub'));

-- Create RLS policies for student_progress
CREATE POLICY "Students can view their own progress" 
ON public.student_progress 
FOR SELECT 
USING (student_id IN (SELECT id FROM public.student_profiles WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Teachers can view student progress" 
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

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_submissions_updated_at
  BEFORE UPDATE ON public.student_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update student progress when submissions are graded
CREATE OR REPLACE FUNCTION public.update_student_progress()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to update progress when submissions are graded
CREATE TRIGGER update_progress_on_grade
  AFTER UPDATE OF grade ON public.student_submissions
  FOR EACH ROW
  WHEN (NEW.grade IS NOT NULL AND OLD.grade IS DISTINCT FROM NEW.grade)
  EXECUTE FUNCTION public.update_student_progress();