'use client'

// ============================================================
// /login — Magic-link auth via Supabase
// ============================================================

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Enter your email address.')
      return
    }

    setError('')
    setLoading(true)

    const supabase = createSupabaseBrowserClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black font-mono p-4">
      <div className="w-full max-w-sm text-amber-400">
        <div className="mb-8">
          <div className="text-amber-600 text-xs uppercase tracking-widest mb-1">
            MUD — Post-Apocalyptic Text Adventure
          </div>
          <div className="text-2xl text-amber-300">ACCESS TERMINAL</div>
          <div className="text-amber-800 text-xs mt-1">
            Enter your email to receive a sign-in link.
          </div>
        </div>

        {sent ? (
          <div className="border border-amber-700 p-4">
            <div className="text-amber-300 text-sm mb-2">Link sent.</div>
            <div className="text-amber-700 text-xs">
              Check <span className="text-amber-500">{email}</span> for a magic link.
              Click it to enter the wasteland.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs text-amber-600 uppercase tracking-widest mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-amber-800 text-amber-300 px-3 py-2 outline-none focus:border-amber-500 text-sm placeholder-amber-900"
                placeholder="survivor@example.com"
                autoFocus
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="mb-4 text-red-400 text-xs">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-amber-600 text-amber-400 py-2 text-sm hover:bg-amber-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Link'}
            </button>
          </form>
        )}

        <div className="mt-6 text-amber-900 text-xs">
          No password required. No account setup.
          The wasteland doesn&apos;t have time for that.
        </div>
      </div>
    </div>
  )
}
