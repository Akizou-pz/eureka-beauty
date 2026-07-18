import { createClient } from '@supabase/supabase-js';

export const HAS_SUPABASE_CREDS = 
  !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY));

// Fallback to placeholder strings during build compilation if credentials are not yet set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
