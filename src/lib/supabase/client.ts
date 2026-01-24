import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({}, {
    get: () => () => ({
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            then: (cb: any) => cb({ data: [], error: null })
          }),
          then: (cb: any) => cb({ data: [], error: null })
        })
      })
    })
  }) as any;

export function createServerClient() {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    // During build or if credentials are missing, return a proxy that prevents crashes
    console.warn('Supabase credentials missing. Returning a dummy client.');

    // This proxy will catch any property access and return a dummy function or object
    const dummyClient = new Proxy({}, {
      get: (target, prop) => {
        if (prop === 'from') {
          return () => ({
            select: () => ({
              order: () => ({
                eq: () => ({
                  then: (cb: any) => cb({ data: [], error: null }),
                  limit: () => ({
                    then: (cb: any) => cb({ data: [], error: null })
                  })
                }),
                limit: () => ({
                  then: (cb: any) => cb({ data: [], error: null })
                })
              }),
              then: (cb: any) => cb({ data: [], error: null })
            }),
            insert: () => ({
              select: () => ({
                single: () => Promise.resolve({ data: null, error: null })
              })
            }),
            delete: () => ({
              eq: () => Promise.resolve({ error: null })
            }),
            update: () => ({
              match: () => ({
                select: () => Promise.resolve({ data: [], error: null })
              })
            })
          });
        }
        return () => Promise.resolve({ data: null, error: null });
      }
    });

    return dummyClient as any;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}
