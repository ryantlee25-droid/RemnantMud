import { createBrowserClient } from '@supabase/ssr'

let _cachedBrowserClient: ReturnType<typeof createBrowserClient> | null = null

export function createSupabaseBrowserClient() {
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
