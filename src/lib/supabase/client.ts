import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

export function createServerClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      throw new Error('Supabase URL and Service Role Key are required');
    }
    // Return a dummy client or null during build if variables are missing
    console.warn('Supabase credentials missing. Supabase client will not be initialized.');
    return null as any;
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}
