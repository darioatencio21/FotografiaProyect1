/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[Miriam Tellez] Supabase not configured — running in offline/demo mode. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vercel environment variables.'
  );
}

/**
 * When Supabase env vars are missing, export a no-op proxy so every
 * `.from().select()` etc. resolves to `{ data: null, error: null }`
 * and the app falls back to its built-in mock data.
 */
function createNoOpClient(): SupabaseClient {
  const noopPromise = Promise.resolve({ data: null, error: null, count: null, status: 200, statusText: 'OK' });

  const noopQuery: any = {
    select: () => noopQuery,
    insert: () => noopQuery,
    update: () => noopQuery,
    delete: () => noopQuery,
    eq: () => noopQuery,
    single: () => Promise.resolve({ data: null, error: null }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: null, error: null, count: null }),
  };

  const noopChannel: any = {
    on: () => noopChannel,
    subscribe: () => noopChannel,
  };

  return {
    from: () => noopQuery,
    channel: () => noopChannel,
    removeChannel: () => Promise.resolve({ error: null }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      refreshSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { session: null, user: null }, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    storage: { from: () => ({ download: () => noopPromise, upload: () => noopPromise, getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
  } as unknown as SupabaseClient;
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createNoOpClient();

// Clear stale auth session if refresh token is invalid (only when configured)
if (isSupabaseConfigured) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error || !data.session) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('-auth-token'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }
  });
}

// Returns true when a Supabase session exists. Deliberately does NOT call
// refreshSession(): with no stored session that call would fire a pointless
// network request to /auth/v1/token that fails (logged-out visits must stay
// network-silent). Token refresh only happens in saveDocument after a real 401.
// In offline/demo mode writes are no-ops, so the session is always "active".
export async function ensureActiveSession(): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch {
    return false;
  }
}
