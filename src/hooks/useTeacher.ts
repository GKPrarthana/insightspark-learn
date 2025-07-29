import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createAuthenticatedClient } from '@/integrations/supabase/client';

export interface TeacherProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  subject?: string;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description?: string;
  due_date: string;
  status: string;
  total_points: number;
  time_limit: number;
  questions: any[];
  created_at: string;
  updated_at: string;
}

export interface StudentSubmission {
  id: string;
  student_id: string;
  assignment_id: string;
  status: string;
  grade?: number;
  submitted_at?: string;
  created_at: string;
  student_profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function useTeacher() {
  const { userId, getToken } = useAuth();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthenticatedClient = async () => {
    if (!getToken) {
      throw new Error('No authentication available');
    }
    return createAuthenticatedClient(getToken);
  };

  const syncProfile = async () => {
    if (!userId) return null;

    try {
      const supabase = await getAuthenticatedClient();
      
      // Check if teacher profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching teacher profile:', fetchError);
        throw fetchError;
      }

      if (existingProfile) {
        return existingProfile;
      }

      // Create new teacher profile if it doesn't exist
      const newProfile = {
        user_id: userId,
        first_name: 'Teacher',
        last_name: 'User',
        email: `${userId}@example.com`,
        subject: null
      };

      const { data: createdProfile, error: createError } = await supabase
        .from('teachers')
        .insert([newProfile])
        .select()
        .single();

      if (createError) {
        console.error('Error creating teacher profile:', createError);
        throw createError;
      }

      return createdProfile;
    } catch (err) {
      console.error('Error syncing teacher profile:', err);
      throw err;
    }
  };

  const fetchAssignments = async () => {
    if (!profile) return;

    try {
      const supabase = await getAuthenticatedClient();
      
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('teacher_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assignments:', error);
        throw error;
      }

      setAssignments((data || []).map(assignment => ({
        ...assignment,
        questions: Array.isArray(assignment.questions) ? assignment.questions : []
      })));
    } catch (err) {
      console.error('Error in fetchAssignments:', err);
      setError('Failed to load assignments');
    }
  };

  const fetchSubmissions = async () => {
    if (!profile) return;

    try {
      const supabase = await getAuthenticatedClient();
      
      // Get submissions for teacher's assignments
      const { data, error } = await supabase
        .from('student_submissions')
        .select(`
          *,
          student_profiles:student_id (
            first_name,
            last_name,
            email
          )
        `)
        .in('assignment_id', assignments.map(a => a.id))
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        throw error;
      }

      setSubmissions(data || []);
    } catch (err) {
      console.error('Error in fetchSubmissions:', err);
      setError('Failed to load submissions');
    }
  };

  const createAssignment = async (assignmentData: {
    title: string;
    subject: string;
    description?: string;
    due_date: string;
    total_points?: number;
    time_limit: number;
    questions?: any[];
  }) => {
    if (!profile) {
      throw new Error('No teacher profile available');
    }

    try {
      const supabase = await getAuthenticatedClient();
      
      const newAssignment = {
        title: assignmentData.title,
        subject: assignmentData.subject,
        description: assignmentData.description,
        due_date: assignmentData.due_date,
        total_points: assignmentData.total_points || 100,
        time_limit: assignmentData.time_limit,
        questions: assignmentData.questions || [],
        teacher_id: profile.id,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('assignments')
        .insert([newAssignment])
        .select()
        .single();

      if (error) {
        console.error('Error creating assignment:', error);
        throw error;
      }

      // Refresh assignments list
      await fetchAssignments();
      return data;
    } catch (err) {
      console.error('Error in createAssignment:', err);
      throw err;
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (profile) {
        await Promise.all([
          fetchAssignments(),
          fetchSubmissions()
        ]);
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Sync profile when user is available
  useEffect(() => {
    if (userId) {
      syncProfile()
        .then(profile => {
          if (profile) {
            setProfile(profile);
          }
        })
        .catch(err => {
          console.error('Error syncing profile:', err);
          setError('Failed to load teacher profile');
        })
        .finally(() => {
          if (!profile) {
            setLoading(false);
          }
        });
    }
  }, [userId]);

  // Fetch data when profile is loaded
  useEffect(() => {
    if (profile) {
      refreshData();
    }
  }, [profile]);

  // Fetch submissions when assignments change
  useEffect(() => {
    if (profile && assignments.length > 0) {
      fetchSubmissions();
    }
  }, [assignments]);

  return {
    profile,
    assignments,
    submissions,
    loading,
    error,
    createAssignment,
    refreshData
  };
}