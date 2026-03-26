import { vi } from 'vitest'

// Chainable Supabase mock builder
function makeChain(resolveWith: unknown = { data: null, error: null }) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'in',
    'is', 'order', 'limit', 'single', 'maybeSingle', 'match', 'filter']
  for (const m of methods) {
    chain[m] = vi.fn(() => chain)
  }
  // Terminal calls that return a promise
  ;(chain as Record<string, unknown>).then = undefined // not a real thenable
  Object.defineProperty(chain, Symbol.asyncIterator, { value: undefined })
  // Make it awaitable via a custom thenable
  const awaitable = new Proxy(chain, {
    get(target, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve(resolveWith)
      }
      return target[prop as string]
    },
  })
  return awaitable
}

export function createSupabaseMock(overrides: Partial<{
  data: unknown
  error: unknown
  user: unknown
}> = {}) {
  const { data = null, error = null, user = null } = overrides

  const from = vi.fn(() => makeChain({ data, error }))
  const getUser = vi.fn().mockResolvedValue({ data: { user }, error: null })
  const auth = { getUser }

  return {
    from,
    auth,
    // Allow tests to override return values per-call
    _setFromResult(d: unknown, e: unknown = null) {
      from.mockImplementation(() => makeChain({ data: d, error: e }))
    },
  }
}

export const mockSupabase = createSupabaseMock()

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: () => mockSupabase,
}))
