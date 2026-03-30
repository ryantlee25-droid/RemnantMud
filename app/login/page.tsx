'use client'

// ============================================================
// /login — Magic-link auth via Supabase
// Terminal boot-sequence aesthetic
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
      setError('INVALID INPUT. ENTER IDENT CODE.')
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
    <div className="min-h-screen bg-black font-mono text-amber-400 p-4 flex flex-col justify-center">
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-4 text-amber-600 text-xs uppercase tracking-widest">
          THE REMNANT -- POST-COLLAPSE SURVIVAL TERMINAL
        </div>
        <div className="text-amber-400 text-xs mb-1">ACCESS TERMINAL</div>
        <div className="text-amber-600 text-xs mb-6">
          ENTER IDENT CODE:
        </div>

        {sent ? (
          <div className="border border-amber-700 p-4">
            <div className="text-amber-300 text-xs mb-2">LINK TRANSMITTED.</div>
            <div className="text-amber-700 text-xs">
              CHECK <span className="text-amber-500">{email}</span> FOR ACCESS LINK.
              ACTIVATE TO ENTER THE WASTELAND.
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs text-amber-600 uppercase tracking-widest mb-1">
                IDENT CODE
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-amber-800 text-amber-300 px-3 py-2 outline-none focus:border-amber-500 text-xs placeholder-amber-900"
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
              className="w-full border border-amber-600 text-amber-400 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'TRANSMITTING...' : '[ ACCESS ]'}
            </button>
          </form>
        )}

        <div className="mt-6 text-amber-700 text-xs">
          NO CLEARANCE REQUIRED. ANONYMOUS ACCESS PERMITTED.
        </div>
      </div>
    </div>
  )
}
