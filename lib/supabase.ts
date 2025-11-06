import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we're in the browser and if env vars are missing
const isMissingEnvVars = typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co');

// Create client with placeholder values during build if needed
// In production, we'll use actual values or handle errors gracefully
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Export a function to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !isMissingEnvVars;
}

// Export error message for UI
export function getSupabaseError(): string | null {
  if (isMissingEnvVars) {
    return 'Supabase environment variables are not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings.';
  }
  return null;
}

