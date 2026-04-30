import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ---------------------------------------------------------------------------
// Minimal mocks for next/server — we don't want the full Next.js edge runtime
// ---------------------------------------------------------------------------

const mockRedirectResponse = { type: 'redirect', url: '' }
const mockNextResponse = { type: 'next' }

vi.mock('next/server', () => {
  return {
    NextResponse: {
      next: vi.fn(() => mockNextResponse),
      redirect: vi.fn((url: URL) => ({ type: 'redirect', url: url.toString() })),
    },
  }
})

// createServerClient is not exercised in the env-missing path, but we mock it
// so the import doesn't throw even if the module tries to call it.
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  })),
}))

// ---------------------------------------------------------------------------
// Helper — build a minimal NextRequest-like object
// ---------------------------------------------------------------------------
function makeRequest(pathname: string): import('next/server').NextRequest {
  const url = `http://localhost${pathname}`
  return {
    nextUrl: new URL(url),
    url,
    headers: new Headers(),
    cookies: {
      getAll: vi.fn(() => []),
      set: vi.fn(),
    },
  } as unknown as import('next/server').NextRequest
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('middleware — missing Supabase env vars', () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
    vi.resetModules()
  })

  it('redirects to /login when both env vars are missing', async () => {
    const { default: middleware } = await import('@/middleware')
    const request = makeRequest('/game')
    const response = await middleware(request)
    expect(response).toMatchObject({ type: 'redirect' })
    expect((response as { type: string; url: string }).url).toContain('/login')
  })

  it('redirects to /login when only SUPABASE_URL is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    const { default: middleware } = await import('@/middleware')
    const request = makeRequest('/game')
    const response = await middleware(request)
    expect(response).toMatchObject({ type: 'redirect' })
    expect((response as { type: string; url: string }).url).toContain('/login')
  })

  it('redirects to /login when only SUPABASE_ANON_KEY is missing', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    const { default: middleware } = await import('@/middleware')
    const request = makeRequest('/game')
    const response = await middleware(request)
    expect(response).toMatchObject({ type: 'redirect' })
    expect((response as { type: string; url: string }).url).toContain('/login')
  })

  it('does NOT redirect public routes even with missing env vars', async () => {
    const { default: middleware } = await import('@/middleware')
    const request = makeRequest('/login')
    const response = await middleware(request)
    // /login is a public route — should pass through, not redirect
    expect(response).toBe(mockNextResponse)
  })

  it('redirect URL does not include a ?next= query param', async () => {
    const { default: middleware } = await import('@/middleware')
    const request = makeRequest('/game')
    const response = await middleware(request) as { type: string; url: string }
    const redirectUrl = new URL(response.url)
    expect(redirectUrl.searchParams.has('next')).toBe(false)
  })
})
