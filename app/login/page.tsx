'use client'

// ============================================================
// /login — Magic-link auth via Supabase
// Clean, minimal login form
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
      setError('Please enter your email address.')
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
    <div className="min-h-screen bg-gray-950 font-mono text-gray-200 flex flex-col justify-center px-4">
      <div className="w-full max-w-sm mx-auto">

        {/* Title */}
        <h1 className="text-2xl font-bold text-white text-center mb-8">
          THE REMNANT
        </h1>

        {sent ? (
          <div className="border border-gray-700 rounded p-6 text-center">
            <p className="text-gray-300 mb-2">Check your email.</p>
            <p className="text-sm text-gray-500">
              A sign-in link has been sent to{' '}
              <span className="text-gray-300">{email}</span>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="block text-sm text-gray-400 mb-2">
              Enter your email to sign in
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-700 text-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-gray-500 placeholder-gray-600 mb-4"
              placeholder="you@example.com"
              autoFocus
              autoComplete="email"
              disabled={loading}
            />

            {error && (
              <div className="mb-4 text-red-400 text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-gray-950 font-bold py-2 rounded text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
            >
              {loading ? 'Sending...' : 'SIGN IN'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          No account needed. A magic link will be sent to your email.
        </p>

      </div>
    </div>
  )
}
