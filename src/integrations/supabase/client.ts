// Enhanced Supabase client with Clerk integration
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://orrojshkpfiwhzayxzgn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ycm9qc2hrcGZpd2h6YXl4emduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjE0OTcsImV4cCI6MjA2OTAzNzQ5N30.umBweRVL03pD2CySyQTTdPwJcxR1KacYtnXnXEbiVPA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Helper function to create authenticated Supabase client with Clerk token
export const createAuthenticatedClient = async (getToken: (options?: { template?: string }) => Promise<string | null>) => {
  console.log('🔐 Creating authenticated Supabase client with Clerk token...');
  
  try {
    // Try to get the Supabase-specific token first
    let token = await getToken({ template: 'supabase' });
    
    if (!token) {
      console.log('⚠️  No Supabase template token, trying default token...');
      token = await getToken();
    }
    
    if (!token) {
      console.error('❌ No Clerk token available');
      throw new Error('No authentication token available');
    }
    
    console.log('✅ Got Clerk token, creating authenticated client');
    console.log('Token preview:', token.substring(0, 50) + '...');
    
    // Validate token structure
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.warn('⚠️  Token doesn\'t appear to be a valid JWT (expected 3 parts, got ' + tokenParts.length + ')');
      }
      
      // Try to decode the payload to check structure
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log('Token payload preview:', {
        iss: payload.iss,
        sub: payload.sub,
        aud: payload.aud,
        exp: payload.exp,
        iat: payload.iat
      });
    } catch (decodeError) {
      console.warn('⚠️  Could not decode token payload:', decodeError);
    }
    
    return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
  } catch (error) {
    console.error('💥 Error creating authenticated client:', error);
    throw error;
  }
};