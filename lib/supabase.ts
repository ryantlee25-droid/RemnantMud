import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import { createMockSupabaseClient, isDevMode } from '@/lib/supabaseMock'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client — used in React components and client-side lib
// In dev mode, returns an in-memory mock (no Supabase account needed)
export function createSupabaseBrowserClient() {
  if (isDevMode()) return createMockSupabaseClient() as any
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server-side admin client — uses service role key, never exposed to browser
export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
