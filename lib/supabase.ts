import { createBrowserClient } from '@supabase/ssr'
import { createMockSupabaseClient, isDevMode } from '@/lib/supabaseMock'

// Module-level cache for the real browser client.
// The mock is intentionally NOT cached — it has mutable in-memory state
// and tests may need fresh instances each time.
let _cachedBrowserClient: ReturnType<typeof createBrowserClient> | null = null

// Browser client — used in React components and client-side lib
// In dev mode, returns an in-memory mock (no Supabase account needed)
export function createSupabaseBrowserClient() {
  if (isDevMode()) {
    console.warn('[The Remnant] Running in DEV MODE — using in-memory mock database. Data will not persist across reloads.')
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
      console.error('DEV_MODE is enabled on a non-localhost domain. This is likely a misconfiguration.')
    }
    return createMockSupabaseClient() as any
  }

  // Env validation — only checked when NOT in dev mode (real Supabase needed)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('[The Remnant] Missing required env var: NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!supabaseAnonKey) {
    throw new Error('[The Remnant] Missing required env var: NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  if (!_cachedBrowserClient) {
    _cachedBrowserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  return _cachedBrowserClient
}
