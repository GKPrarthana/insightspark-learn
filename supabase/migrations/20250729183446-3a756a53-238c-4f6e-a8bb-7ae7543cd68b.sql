-- First, let's see all current policies on assignments table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'assignments';

-- Also check the helper functions
SELECT proname, prosrc FROM pg_proc WHERE proname IN ('get_current_teacher_id', 'get_current_student_id');