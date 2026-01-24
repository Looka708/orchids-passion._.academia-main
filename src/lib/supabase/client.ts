import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const createDummyClient = () => new Proxy({}, {
  get: function getRecursive(target, prop): any {
    if (prop === 'then') {
      return (resolve: any) => resolve({ data: [], error: null, count: 0 });
    }
    const dummyFunc = () => new Proxy({}, { get: getRecursive });
    (dummyFunc as any).data = [];
    (dummyFunc as any).error = null;
    return dummyFunc;
  }
});

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDummyClient() as any;

export function createServerClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    // During build or if credentials are missing, return a proxy that prevents crashes
    console.warn('Supabase credentials missing. Returning a dummy client.');
    return createDummyClient() as any;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}
