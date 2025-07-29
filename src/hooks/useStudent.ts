import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

interface StudentProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  grade_level?: number;
  gpa: number;
  created_at: string;
  updated_at: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  description?: string;
  due_date: string;
  time_limit: number;
  total_points: number;
  questions: any[];
  status: string;
  teacher: {
    first_name: string;
    last_name: string;
  };
  submission?: {
    id: string;
    status: 'not-started' | 'in-progress' | 'submitted' | 'graded';
    grade?: number;
    feedback?: string;
    answers: Record<string, string>;
    submitted_at?: string;
  };
}

interface StudentProgress {
  subject: string;
  assignments_completed: number;
  total_points_earned: number;
  total_points_possible: number;
  average_grade: number;
}

export function useStudent() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create authenticated Supabase client with enhanced error handling
  const getAuthenticatedClient = async () => {
    console.log('🔐 Getting Clerk token for Supabase...');
    
    try {
      // Try Supabase template first, then fallback to default
      let token = await getToken({ template: 'supabase' });
      
      if (!token) {
        console.log('⚠️  No Supabase template token, trying default token...');
        token = await getToken();
      }
      
      if (!token) {
        console.error('❌ No Clerk token available');
        throw new Error('No authentication token available. Please sign in again.');
      }
      
      console.log('✅ Got Clerk token, creating Supabase client');
      console.log('Token preview:', token.substring(0, 50) + '...');
      
      // Enhanced token validation
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error(`Invalid JWT format: expected 3 parts, got ${tokenParts.length}`);
        }
        
        // Decode and validate payload
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Token payload:', {
          iss: payload.iss,
          sub: payload.sub,
          aud: payload.aud,
          exp: payload.exp,
          iat: payload.iat,
          email: payload.email
        });
        
        // Check if token is expired
        if (payload.exp && payload.exp < Date.now() / 1000) {
          throw new Error('Token has expired');
        }
        
      } catch (decodeError) {
        console.error('❌ Token validation failed:', decodeError);
        throw new Error('Invalid token format');
      }
      
      return createClient<Database>(
        "https://orrojshkpfiwhzayxzgn.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycm9qc2hrcGZpd2h6YXl4emduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjE0OTcsImV4cCI6MjA2OTAzNzQ5N30.umBweRVL03pD2CySyQTTdPwJcxR1KacYtnXnXEbiVPA",
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          }
        }
      );
    } catch (error) {
      console.error('💥 Error creating authenticated client:', error);
      throw error;
    }
  };

  // Create or sync student profile
  const syncProfile = async () => {
    if (!user) {
      console.log('⚠️  No user found, skipping profile sync');
      return;
    }

    console.log('👤 Starting profile sync for user:', user.id);
    console.log('User data:', { 
      id: user.id, 
      firstName: user.firstName, 
      lastName: user.lastName,
      email: user.emailAddresses[0]?.emailAddress 
    });

    try {
      console.log('🔌 Creating authenticated client...');
      const client = await getAuthenticatedClient();
      console.log('✅ Client created successfully');

      console.log('🔍 Checking for existing profile...');
      const { data: existingProfile, error: selectError } = await client
        .from('student_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectError) {
        console.error('❌ Error checking for existing profile:', selectError);
        console.error('Error details:', {
          message: selectError.message,
          details: selectError.details,
          hint: selectError.hint,
          code: selectError.code
        });
        
        // Check if it's an authentication error
        if (selectError.message?.includes('JWT') || selectError.message?.includes('auth')) {
          throw new Error('Authentication failed. Please check your Clerk JWT template configuration.');
        }
        
        throw selectError;
      }

      if (existingProfile) {
        console.log('✅ Found existing profile:', existingProfile);
        setProfile(existingProfile);
        setError(null);
      } else {
        console.log('➕ No existing profile found, creating new one...');
        
        // Create new profile
        const newProfile = {
          user_id: user.id,
          first_name: user.firstName || 'Student',
          last_name: user.lastName || 'User',
          email: user.emailAddresses[0]?.emailAddress || '',
          grade_level: 12,
          gpa: 0.0
        };

        console.log('📝 Inserting new profile:', newProfile);

        const { data, error } = await client
          .from('student_profiles')
          .insert(newProfile)
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating profile:', error);
          throw error;
        }

        console.log('✅ Profile created successfully:', data);
        setProfile(data);
        setError(null);

        toast({
          title: "Welcome!",
          description: "Your student profile has been created.",
        });
      }
    } catch (error) {
      console.error('💥 Error syncing profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to sync profile: ${errorMessage}`);
      
      toast({
        title: "Profile Error",
        description: "Failed to sync your profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fetch student assignments
  const fetchAssignments = async () => {
    if (!profile) return;

    try {
      const client = await getAuthenticatedClient();
      
      // First get enrollment IDs
      const { data: enrollments, error: enrollmentError } = await client
        .from('assignment_enrollments')
        .select('assignment_id')
        .eq('student_id', profile.id);

      if (enrollmentError) throw enrollmentError;

      const assignmentIds = enrollments?.map(e => e.assignment_id) || [];
      
      if (assignmentIds.length === 0) {
        setAssignments([]);
        return;
      }

      const { data, error } = await client
        .from('assignments')
        .select(`
          *,
          teachers:teacher_id (
            first_name,
            last_name
          ),
          student_submissions!inner (
            id,
            status,
            grade,
            feedback,
            answers,
            submitted_at
          )
        `)
        .eq('status', 'active')
        .in('id', assignmentIds);

      if (error) throw error;

      const formattedAssignments: Assignment[] = data.map(assignment => ({
        ...assignment,
        questions: Array.isArray(assignment.questions) ? assignment.questions : [],
        teacher: assignment.teachers,
        submission: assignment.student_submissions?.[0] ? {
          id: assignment.student_submissions[0].id,
          status: assignment.student_submissions[0].status as 'not-started' | 'in-progress' | 'submitted' | 'graded',
          grade: assignment.student_submissions[0].grade,
          feedback: assignment.student_submissions[0].feedback,
          answers: assignment.student_submissions[0].answers as Record<string, string>,
          submitted_at: assignment.student_submissions[0].submitted_at
        } : {
          id: '',
          status: 'not-started' as const,
          answers: {}
        }
      }));

      setAssignments(formattedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Loading Error",
        description: "Failed to load assignments.",
        variant: "destructive"
      });
    }
  };

  // Fetch student progress
  const fetchProgress = async () => {
    if (!profile) return;

    try {
      const client = await getAuthenticatedClient();
      const { data, error } = await client
        .from('student_progress')
        .select('*')
        .eq('student_id', profile.id);

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  // Submit assignment
  const submitAssignment = async (assignmentId: string, answers: Record<string, string>) => {
    if (!profile) return;

    try {
      const client = await getAuthenticatedClient();
      const { error } = await client
        .from('student_submissions')
        .upsert({
          assignment_id: assignmentId,
          student_id: profile.id,
          answers,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Assignment Submitted",
        description: "Your assignment has been submitted successfully.",
      });

      // Refresh assignments
      await fetchAssignments();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Save draft
  const saveDraft = async (assignmentId: string, answers: Record<string, string>) => {
    if (!profile) return;

    try {
      const client = await getAuthenticatedClient();
      const { error } = await client
        .from('student_submissions')
        .upsert({
          assignment_id: assignmentId,
          student_id: profile.id,
          answers,
          status: 'in-progress'
        });

      if (error) throw error;

      toast({
        title: "Draft Saved",
        description: "Your progress has been saved.",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('🚀 User detected, starting profile sync...');
      syncProfile().finally(() => {
        // Always set loading to false after profile sync attempt
        if (!profile) {
          console.log('⚠️  Profile sync completed but no profile found, stopping loading');
          setLoading(false);
        }
      });
    } else {
      console.log('⚠️  No user found, stopping loading');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      console.log('📊 Profile found, fetching assignments and progress...');
      Promise.all([fetchAssignments(), fetchProgress()]).finally(() => {
        console.log('✅ All data loaded, stopping loading');
        setLoading(false);
      });
    }
  }, [profile]);

  return {
    profile,
    assignments,
    progress,
    loading,
    error,
    submitAssignment,
    saveDraft,
    refreshData: () => Promise.all([fetchAssignments(), fetchProgress()])
  };
}