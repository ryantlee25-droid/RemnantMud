'use client'

// ============================================================
// / — Main game page
// Handles auth gating, character creation, and game layout.
// ============================================================

import { useEffect, useRef, useState } from 'react'
import type { StatBlock } from '@/types/game'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useGame } from '@/lib/gameContext'
import Terminal from '@/components/Terminal'
import CommandInput from '@/components/CommandInput'
import StatusBar from '@/components/StatusBar'
import Sidebar from '@/components/Sidebar'
import CharacterCreation from '@/components/CharacterCreation'
import Prologue from '@/components/Prologue'
import DeathScreen from '@/components/DeathScreen'
import TheBetween from '@/components/TheBetween'
import ThemePicker from '@/components/ThemePicker'
import { THEME_KEY, saveTheme, type ThemeId } from '@/lib/theme'

type AuthPhase = 'checking' | 'unauthenticated' | 'loading-player' | 'prologue' | 'no-player' | 'ready'
const INV_HINT_KEY = 'remnant_seen_inv_hint'
type GamePhase = 'alive' | 'dead' | 'between' | 'rebirth' | 'rebirthing'

const PROLOGUE_KEY = 'remnant_saw_prologue'

function TerminalLoader({ text }: { text: string }) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const id = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-black font-mono text-amber-600 text-sm">
      <span>{text}<span className="inline-block w-6 text-left">{dots}</span></span>
    </div>
  )
}

export default function GamePage() {
  const router = useRouter()
  const { state, engine } = useGame()
  const [authPhase, setAuthPhase] = useState<AuthPhase>('checking')
  const [gamePhase, setGamePhase] = useState<GamePhase>('alive')
  const [pendingEchoStats, setPendingEchoStats] = useState<StatBlock | null>(null)
  const [showThemePicker, setShowThemePicker] = useState(false)

  // Show theme picker once — before prologue — if no theme is saved
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(THEME_KEY)) {
      setShowThemePicker(true)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        if (!cancelled) setAuthPhase('unauthenticated')
        return
      }

      if (!cancelled) setAuthPhase('loading-player')

      try {
        const found = await engine.loadPlayer(user.id)
        if (!cancelled) {
          if (found) {
            setAuthPhase('ready')
          } else {
            // Show prologue once before character creation
            const sawPrologue = typeof window !== 'undefined' && localStorage.getItem(PROLOGUE_KEY)
            setAuthPhase(sawPrologue ? 'no-player' : 'prologue')
          }
        }
      } catch {
        if (!cancelled) setAuthPhase('no-player')
      }
    }

    void init()
    return () => { cancelled = true }
  }, [engine])

  // Once the engine finishes character creation, flip to ready
  useEffect(() => {
    if (authPhase === 'no-player' && state.initialized) {
      setAuthPhase('ready')
      setGamePhase('alive')
    }
  }, [state.initialized, authPhase])

  // Redirect unauthenticated users
  useEffect(() => {
    if (authPhase === 'unauthenticated') {
      router.replace('/login')
    }
  }, [authPhase, router])

  // One-time inventory hint after first move
  const hintFiredRef = useRef(false)
  useEffect(() => {
    if (hintFiredRef.current) return
    if (authPhase !== 'ready') return
    if (!state.player || (state.player.actionsTaken ?? 0) < 1) return
    if (typeof window !== 'undefined' && localStorage.getItem(INV_HINT_KEY)) return

    hintFiredRef.current = true
    localStorage.setItem(INV_HINT_KEY, '1')

    // Slight delay so the room description renders first
    const t = setTimeout(() => {
      engine._appendMessages([{
        id: crypto.randomUUID(),
        text: '[Press Tab or tap [INV] to view your inventory and stats.]',
        type: 'system',
      }])
    }, 400)
    return () => clearTimeout(t)
  }, [authPhase, state.player, engine])

  // Watch for player death
  useEffect(() => {
    if (state.playerDead && gamePhase === 'alive') {
      // Small delay so the death messages render first
      const t = setTimeout(() => setGamePhase('dead'), 1500)
      return () => clearTimeout(t)
    }
  }, [state.playerDead, gamePhase])

  // Theme picker — shown once before anything else
  if (showThemePicker) {
    return (
      <ThemePicker
        onSelect={(themeId: ThemeId) => {
          saveTheme(themeId)
          window.dispatchEvent(new CustomEvent('remnant-theme-change', { detail: themeId }))
          setShowThemePicker(false)
        }}
      />
    )
  }

  // Loading / checking states
  if (authPhase === 'checking' || authPhase === 'loading-player') {
    return <TerminalLoader text="ESTABLISHING CONNECTION" />
  }

  if (authPhase === 'unauthenticated') {
    return null // redirect in progress
  }

  // Prologue — shown once before character creation
  if (authPhase === 'prologue') {
    return (
      <Prologue
        onComplete={() => {
          if (typeof window !== 'undefined') localStorage.setItem(PROLOGUE_KEY, '1')
          setAuthPhase('no-player')
        }}
      />
    )
  }

  // Character creation
  if (authPhase === 'no-player') {
    return <CharacterCreation />
  }

  // Death screen
  if (gamePhase === 'dead') {
    return (
      <DeathScreen
        cycle={state.player?.cycle ?? 1}
        xpGained={state.player?.xp ?? 0}
        roomsExplored={0}
        causeOfDeath="combat"
        onContinue={() => setGamePhase('between')}
      />
    )
  }

  // The Between
  if (gamePhase === 'between') {
    return (
      <TheBetween
        cycle={(state.player?.cycle ?? 1) + 1}
        onContinue={() => {
          setPendingEchoStats(engine.getEchoStats())
          setGamePhase('rebirth')
        }}
      />
    )
  }

  // Rebirth — CharacterCreation pre-filled with echo stats
  if (gamePhase === 'rebirth') {
    return (
      <CharacterCreation
        isRebirth
        echoStats={pendingEchoStats ?? undefined}
        onRebirthComplete={() => {
          setPendingEchoStats(null)
          setGamePhase('alive')
        }}
      />
    )
  }

  // Rebirthing loading screen (interstitial while rebirthWithStats runs)
  if (gamePhase === 'rebirthing') {
    return <TerminalLoader text="RECONSTRUCTING" />
  }

  // Game
  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden relative">
      {/* Status bar */}
      <StatusBar />

      {/* Terminal — takes remaining height */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <Terminal messages={state.log} />
        <Sidebar />
      </div>

      {/* Command input */}
      <CommandInput />
    </div>
  )
}
