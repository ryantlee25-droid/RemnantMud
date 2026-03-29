// ============================================================
// proxy.ts — Auth middleware (Next.js 16)
// Refreshes the Supabase session on every request and redirects
// unauthenticated users to /login.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PUBLIC_ROUTES = ['/login', '/landing', '/auth/callback']

function isPublicRoute(pathname: string): boolean {
  if (
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico' ||
    /\.(?:ico|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|otf|css|js|map)$/.test(pathname)
  ) {
    return true
  }
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[proxy] Missing Supabase env vars — skipping auth check')
    return NextResponse.next()
  }

  let response = NextResponse.next({ request: { headers: request.headers } })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request: { headers: request.headers } })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
