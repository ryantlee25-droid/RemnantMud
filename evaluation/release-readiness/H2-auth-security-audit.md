# H2 — Auth + Security Audit
**Date**: 2026-03-31
**Howler**: H2 (Sonnet)
**Scope**: Auth middleware, auth callback, login flow, Supabase client init, dev-mode safety, RLS completeness, secret exposure, security headers

---

## BLOCKERS

### B1 — `NEXT_PUBLIC_DEV_START_ROOM` is a hidden public env var that affects production routing

**Location**: `lib/gameEngine.ts:568`
**Code**:
```ts
const devOverrideRoom = process.env.NEXT_PUBLIC_DEV_START_ROOM
const startRoomId = (devOverrideRoom && rooms.some(r => r.id === devOverrideRoom))
  ? devOverrideRoom
  : rooms[0]!.id
```
**Issue**: `NEXT_PUBLIC_DEV_START_ROOM` is a `NEXT_PUBLIC_` prefixed variable — it is compiled into the client bundle and exposed to every user's browser. The code has no `isDevMode()` guard. If this variable is set in Vercel's production environment for any reason (e.g. during a future debug session), it silently overrides the start room for **all players** on that deployment without any warning. The var is absent from `.env.local`, meaning its existence in Vercel production can't be confirmed from local inspection.

**Risk**: Silent production behavior change via an exposed public env var with no dev-mode guard.

**Fix**: Wrap in `if (isDevMode())` before reading `NEXT_PUBLIC_DEV_START_ROOM`, or rename it to a server-only `DEV_START_ROOM` (non-`NEXT_PUBLIC_`) so it cannot be used in a client bundle.

---

### B2 — `world_state` table has RLS enabled but no policy — data is inaccessible to authenticated users and has no documented service_role access pattern

**Location**: `supabase/migrations/20260329000001_rls_world_state.sql`
**Issue**: The migration enables RLS on `world_state` but adds no policy. The migration comment states "the table should only be accessed via service_role (which bypasses RLS by default)." However:
1. No code in `lib/` or `app/` uses a service_role client — `SUPABASE_SERVICE_ROLE_KEY` exists in `.env.local` but is never imported or used anywhere in application code.
2. The table is described as "reserved for future multiplayer" — but with RLS enabled and no policy, any future developer who tries to access it from the browser client will get silent empty results (not an error), which could be mistaken for "no data exists."

**Risk**: If any code path ever reaches `world_state` from the anon client, it will silently fail. The architectural intent (service_role only) is undocumented at the code level and the key is dangling unused.

**Severity**: BLOCKER for documentation/architecture clarity before release. The immediate functional impact is low (table is unused), but the `SUPABASE_SERVICE_ROLE_KEY` dangling in `.env.local` with no code usage is a credential hygiene concern.

**Fix**: Either (a) add a comment in the codebase explaining `world_state` is intentionally inaccessible to anon clients, and remove `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` since it is unused, or (b) drop the table if multiplayer is not planned for release.

---

## WARNINGS

### W1 — Middleware allows all requests through when Supabase env vars are missing

**Location**: `middleware.ts:32-35`
**Code**:
```ts
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[proxy] Missing Supabase env vars — skipping auth check')
  return NextResponse.next()
}
```
**Issue**: If `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are absent from the deployment environment, the middleware silently passes all requests through — including requests to the game page (`/`). An unauthenticated user would reach `app/page.tsx`, where `createSupabaseBrowserClient()` would throw (it does validate env vars). The page would crash into the ErrorBoundary rather than showing the login form.

**Risk**: This is a misconfiguration escape hatch, not a policy bypass in normal operation. On a correctly deployed Vercel project with env vars set, this branch is never reached. However: if the Vercel env vars are accidentally deleted or a new deployment preview is created without them, the error surface changes from "redirected to login" to "app crashes" rather than "auth bypassed." The risk is UX degradation, not actual auth bypass.

**Fix**: Change the fallback to `return NextResponse.redirect(new URL('/login', request.url))` instead of `NextResponse.next()`. This converts a silent passthrough into a safe redirect on misconfiguration.

---

### W2 — `SUPABASE_SERVICE_ROLE_KEY` is present in `.env.local` but unused in application code

**Location**: `.env.local:6`
**Issue**: The service role key is defined in `.env.local` but a search of all files under `lib/` and `app/` finds zero references to it. The key grants full Postgres access bypassing RLS. It should not exist in `.env.local` unless there is a server-side use case.

`.gitignore` correctly excludes `.env*`, so this is not a git exposure risk. However:
- The key appears in plaintext in `.env.local` on the developer's machine.
- If the Vercel project has it set in production env vars (for a use case that no longer exists), it is an unnecessary elevated credential being kept warm.

**Risk**: Credential sprawl. No immediate functional risk if `.gitignore` is respected.

**Fix**: Remove `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` and from Vercel production env vars if no server-side service_role client exists or is planned.

---

### W3 — Missing `Content-Security-Policy` header

**Location**: `vercel.json`
**Issue**: `vercel.json` sets three headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) but omits `Content-Security-Policy`. For a Next.js app with no third-party script embeds, a strict CSP would be feasible and materially reduces XSS impact surface.

**Present headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` — all correct.
**Missing**: `Content-Security-Policy`, `Strict-Transport-Security`, `Permissions-Policy`.

**Risk for release**: Moderate. The game has no user-generated HTML rendered via `dangerouslySetInnerHTML` (confirmed: no usages found in `app/` or `components/`). All terminal output goes through typed message objects. The XSS surface is low. Missing HSTS is mitigated by Vercel automatically provisioning HTTPS, though browser-enforced HSTS would prevent downgrade attacks on the `.vercel.app` domain.

**Fix (recommended before release)**:
```json
{ "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" },
{ "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
```
CSP can be deferred post-release given the low XSS surface, but HSTS and Permissions-Policy are low-friction to add.

---

### W4 — `NEXT_PUBLIC_DEV_MODE` is absent from Vercel production environment (not verified)

**Location**: `.env.local:1` — `NEXT_PUBLIC_DEV_MODE=false`
**Issue**: `.env.local` is gitignored (confirmed: `.gitignore` includes `.env*`). This means Vercel production does not inherit this value from source control. `isDevMode()` evaluates `process.env.NEXT_PUBLIC_DEV_MODE === 'true'` — any value other than the string `"true"` (including `undefined`) returns `false`. So if the var is absent from Vercel's production environment, the behavior is safe (dev mode is off).

However, the var is **not verified as explicitly set in Vercel's production env vars**. The risk is low (safe by default), but an explicit `false` set in Vercel dashboards is better hygiene than relying on the absence of a variable.

**Fix**: Confirm `NEXT_PUBLIC_DEV_MODE=false` is explicitly set in Vercel project → Settings → Environment Variables for the Production environment. This makes the intent declarative rather than implicit.

---

### W5 — Login page passes `next` param to middleware without server-side validation of the param's source

**Location**: `middleware.ts:63-65`, `app/auth/callback/route.ts:12-15`
**Issue**: The middleware appends the current pathname as `?next=<pathname>` when redirecting to login. The callback route validates the `next` param with:
```ts
const next = rawNext.startsWith('/') && !rawNext.includes('://')
  ? rawNext
  : '/'
```
This guard correctly blocks absolute URLs (`https://evil.com`) and protocol-relative URLs (`//evil.com`). However, it does **not** block path-relative redirects with potential for path traversal like `/../` sequences, nor does it restrict to only known valid routes within the app. If an attacker crafts a URL like `/login?next=/auth/callback?code=FORGED`, the `next` param would pass validation (starts with `/`, no `://`) and redirect to a path that happens to be within the app but may trigger unintended behavior.

**Actual risk**: Low for this specific app. The `/auth/callback` path requires a valid Supabase PKCE `code` parameter and will fail gracefully (redirects to `/login?error=auth_failed`) if the code is invalid. No financial or privilege-escalation impact.

**Fix**: The current guard is acceptable for release. For defense in depth, add a strict allowlist: `const ALLOWED_NEXT = ['/', '/landing']` and validate against it, or at minimum add a `decodeURIComponent` before the validation to prevent encoded bypass attempts.

---

## INFO

### I1 — `supabaseMock.ts` includes `game_log` table in `freshTables()` but production dropped the table

**Location**: `lib/supabaseMock.ts:18` — `game_log: []` is still listed in the in-memory tables.
**Issue**: `game_log` was dropped in production by `20260329000001_rls_world_state.sql`. In dev mode, any code that calls `from('game_log')` silently succeeds (returns empty data). In production, the table does not exist and such a call would return an error from Supabase.

A search of `lib/` and `app/` finds no production code paths that reference `from('game_log')`, so the practical risk is zero. But the mock divergence is a maintenance hazard.

**Fix**: Remove the `game_log` entry from `freshTables()` in `supabaseMock.ts`.

---

### I2 — Open redirect guard uses `startsWith('/')` but not `decodeURIComponent`

**Location**: `app/auth/callback/route.ts:13`
**Note**: An encoded `%2F%2Fevil.com` would be decoded by the URL parser before `rawNext` is set, so the risk is already mitigated by `new URL(request.url)` parsing. The guard is functionally sound. Noted for completeness.

---

### I3 — `supabase.ts` caches the browser client module-level but not the mock

**Location**: `lib/supabase.ts:7` — `let _cachedBrowserClient`
**Note**: The comment correctly explains the mock is not cached because tests need fresh instances. This is intentional and correct. No issue.

---

### I4 — Login page uses `window.location.origin` for OTP redirect URL (client-side only)

**Location**: `app/login/page.tsx:32`
**Note**: `emailRedirectTo: \`${window.location.origin}/auth/callback\`` — this means the redirect URL in the magic link is whatever origin the user's browser reports. On the Vercel production domain (`https://y-kappa-green-78.vercel.app`), this will be correct. Supabase validates that the redirect URL is in its allowlist. As long as the Vercel domain is added to Supabase Auth → URL Configuration → Redirect URLs, this is safe.

---

## RLS Policy Completeness Matrix

| Table | RLS Enabled | Policy | WITH CHECK | Assessment |
|---|---|---|---|---|
| `players` | Yes (init migration) | `auth.uid() = id` FOR ALL | Yes | OK |
| `player_inventory` | Yes (init migration) | `auth.uid() = player_id` FOR ALL | Yes | OK |
| `game_log` | Dropped (`20260329000001`) | N/A | N/A | OK (table gone) |
| `generated_rooms` | Yes (init migration) | `auth.uid() = player_id` FOR ALL | Yes | OK |
| `world_state` | Yes (`20260329000001`) | **None** | N/A | See B2 |
| `player_ledger` | Yes (`20260327000001`) | `auth.uid() = player_id` FOR ALL | Yes | OK |
| `room_state` | Yes (`20260326000004`) | `auth.uid() = player_id` FOR ALL | **Fixed in `20260327000009`** (WITH CHECK added) | OK |
| `player_stash` | Yes (`20260327000002`) | `auth.uid() = player_id` FOR ALL | Yes | OK |

**All user-facing tables have correct bi-directional RLS policies (USING + WITH CHECK). The only policy gap is `world_state`, which is intentional (no anon access) but undocumented at the code level — see B2.**

---

## Middleware Route Coverage

| Route | Public? | Middleware behavior | Assessment |
|---|---|---|---|
| `/login` | Yes | `isPublicRoute()` returns true — passes through | OK |
| `/landing` | Yes | `isPublicRoute()` returns true — passes through | OK |
| `/auth/callback` | Yes | `isPublicRoute()` returns true — passes through | OK |
| `/_next/static/...` | Yes | Both `isPublicRoute()` AND matcher exclusion | OK (double-guarded) |
| `/favicon.ico` | Yes | `isPublicRoute()` returns true | OK |
| Static assets (`.png`, `.css`, `.js`, etc.) | Yes | Regex in `isPublicRoute()` | OK |
| `/` (game) | No | Auth enforced — redirects to `/login?next=/` | OK |
| Any other route | No | Auth enforced | OK |

**The matcher pattern `/((?!_next/static|_next/image|favicon.ico).*)` correctly excludes Next.js internals. All game routes are protected.**

---

## Dev-Mode Guard Assessment

`isDevMode()` returns `process.env.NEXT_PUBLIC_DEV_MODE === 'true'` — strict string equality. Any other value (including `undefined`, `"false"`, `""`) is safe.

**`resetDevDb()` in `app/page.tsx`**: Called only inside `if (isDevMode())` — correct. Will not run in production.

**`createSupabaseBrowserClient()` non-localhost warning**: The guard at `lib/supabase.ts:14` fires a `console.error` if dev mode is active on a non-localhost domain. This is a warning-only safeguard — it does not block the mock from loading. If dev mode were accidentally enabled in production, the mock client would be used but the error would surface in browser devtools. This is acceptable (warning is better than silent failure).

**`NEXT_PUBLIC_DEV_MODE` in Vercel production**: Safe by default (undefined evaluates as false). Explicit `false` value in Vercel env vars is recommended hygiene but not a blocker.

---

## Secret Exposure Assessment

| Secret | Present in `.env.local` | `NEXT_PUBLIC_`? | Used in client code? | Git risk | Assessment |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Yes (intentional — anon client) | `.gitignore` covers `.env*` | OK — anon URL is safe to expose |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Yes (intentional — anon client) | `.gitignore` covers `.env*` | OK — RLS is the guard, anon key is safe |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | No | **Zero references in app/lib code** | `.gitignore` covers `.env*` | WARNING — see W2 |

**No `service_role` key usage found in any client-side or server-side application code.** The key is dangling in `.env.local`.

---

## Summary verdict: GO WITH CAVEATS

**Blockers requiring resolution before release**:
- **B1**: `NEXT_PUBLIC_DEV_START_ROOM` in `gameEngine.ts` must be guarded with `isDevMode()` or moved to a non-public env var. Risk is silent production behavior change.
- **B2**: `world_state` RLS architecture (no policy, unused service_role key) must be documented or resolved. Immediate risk is low but the architectural ambiguity is a release-readiness concern.

**Caveats acceptable with sign-off**:
- W1: Middleware fallback passes through rather than redirecting to login on env misconfiguration. Low actual risk; easy fix.
- W3: Missing HSTS and Permissions-Policy headers. XSS surface is low (no `dangerouslySetInnerHTML` found). Recommend adding HSTS before release; CSP can be post-release.
- W4: `NEXT_PUBLIC_DEV_MODE` not explicitly set to `false` in Vercel production env vars (safe by default, but unverified).

**Core auth architecture is sound**: middleware enforces auth on all non-public routes, the magic-link OTP flow is correctly implemented, the callback open-redirect guard is adequate, RLS covers all user-facing tables with both USING and WITH CHECK clauses, and no service_role key or elevated credentials are exposed in client-side code.
