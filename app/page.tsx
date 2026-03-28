'use client'

// ============================================================
// / — Main game page
// Handles auth gating, character creation, and game layout.
// Everything renders inside the PipBoy frame.
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react'
import type { StatBlock } from '@/types/game'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { isDevMode, DEV_USER, resetDevDb } from '@/lib/supabaseMock'
import { useGame } from '@/lib/gameContext'
import PipBoyFrame, { TAB_IDS, type TabId } from '@/components/PipBoyFrame'
import Terminal from '@/components/Terminal'
import CharacterCreation from '@/components/CharacterCreation'
import Prologue from '@/components/Prologue'
import DeathScreen from '@/components/DeathScreen'
import TheBetween from '@/components/TheBetween'
import EndingScreen from '@/components/EndingScreen'
import type { EndingChoice } from '@/types/game'
import ThemePicker from '@/components/ThemePicker'
import { THEME_KEY, saveTheme, type ThemeId } from '@/lib/theme'
import StatTab from '@/components/tabs/StatTab'
import InventoryTab from '@/components/tabs/InventoryTab'
import MapTab from '@/components/tabs/MapTab'
import DataTab from '@/components/tabs/DataTab'

type AuthPhase = 'checking' | 'unauthenticated' | 'loading-player' | 'prologue' | 'no-player' | 'ready'
type GamePhase = 'alive' | 'dead' | 'between' | 'rebirth' | 'rebirthing' | 'ending'

const PROLOGUE_KEY = 'remnant_saw_prologue'
const INV_HINT_KEY = 'remnant_seen_inv_hint'

function TerminalLoader({ text }: { text: string }) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    const id = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center justify-center flex-1 font-mono text-amber-600 text-sm">
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
  const [activeTab, setActiveTab] = useState<TabId>('TERM')

  // Determine what to show based on phase
  const isGamePhase = authPhase === 'ready' && gamePhase === 'alive'
  const showTabs = isGamePhase
  const showStatus = isGamePhase
  const showInput = isGamePhase

  // Tab cycling and number key shortcuts
  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Only handle tab/number keys during game phase
      if (!(authPhase === 'ready' && gamePhase === 'alive')) return

      if (e.key === 'Tab') {
        e.preventDefault()
        setActiveTab((prev) => {
          const idx = TAB_IDS.indexOf(prev)
          return TAB_IDS[(idx + 1) % TAB_IDS.length]
        })
        return
      }

      // Number key shortcuts: 1=TERM, 2=STAT, 3=INV, 4=MAP, 5=DATA
      const num = parseInt(e.key, 10)
      if (num >= 1 && num <= 5) {
        setActiveTab(TAB_IDS[num - 1])
        return
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [authPhase, gamePhase])

  // Show theme picker once — before prologue — if no theme is saved
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(THEME_KEY)) {
      setShowThemePicker(true)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      let user: { id: string } | null = null

      if (isDevMode()) {
        resetDevDb()
        // Clear localStorage flags so prologue/theme/hints re-show on reload
        localStorage.removeItem('remnant_saw_prologue')
        localStorage.removeItem('remnant_seen_inv_hint')
        user = DEV_USER
      } else {
        const supabase = createSupabaseBrowserClient()
        const { data } = await supabase.auth.getUser()
        user = data.user
      }

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
            // In dev mode, skip prologue entirely to save ~4s per reload
            const sawPrologue = isDevMode() || (typeof window !== 'undefined' && localStorage.getItem(PROLOGUE_KEY))
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
        text: '[Press Tab to cycle tabs, or press 1-5 to switch directly.]',
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

  // Watch for ending trigger
  useEffect(() => {
    if (state.endingTriggered && state.endingChoice && gamePhase === 'alive') {
      // Delay so the terminal choice narrative renders first
      const t = setTimeout(() => setGamePhase('ending'), 2000)
      return () => clearTimeout(t)
    }
  }, [state.endingTriggered, state.endingChoice, gamePhase])

  // Redirect in progress — render nothing
  if (authPhase === 'unauthenticated') {
    return null
  }

  return (
    <PipBoyFrame
      showTabs={showTabs}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      showStatus={showStatus}
      showInput={showInput}
    >
      {/* Theme picker — shown once before anything else */}
      {showThemePicker && (
        <ThemePicker
          onSelect={(themeId: ThemeId) => {
            saveTheme(themeId)
            window.dispatchEvent(new CustomEvent('remnant-theme-change', { detail: themeId }))
            setShowThemePicker(false)
          }}
        />
      )}

      {/* Loading / checking states */}
      {!showThemePicker && (authPhase === 'checking' || authPhase === 'loading-player') && (
        <TerminalLoader text="ESTABLISHING CONNECTION" />
      )}

      {/* Prologue — shown once before character creation */}
      {!showThemePicker && authPhase === 'prologue' && (
        <Prologue
          onComplete={() => {
            if (typeof window !== 'undefined') localStorage.setItem(PROLOGUE_KEY, '1')
            setAuthPhase('no-player')
          }}
        />
      )}

      {/* Character creation */}
      {!showThemePicker && authPhase === 'no-player' && (
        <CharacterCreation />
      )}

      {/* Ending screen */}
      {!showThemePicker && gamePhase === 'ending' && state.endingChoice && authPhase === 'ready' && (
        <EndingScreen
          choice={state.endingChoice}
          cycle={state.player?.cycle ?? 1}
          totalDeaths={state.player?.totalDeaths ?? 0}
          roomsExplored={0}
          xpEarned={state.player?.xp ?? 0}
          onNewGame={async () => {
            // Delete player data and restart
            const supabase = (await import('@/lib/supabase')).createSupabaseBrowserClient()
            const userId = state.player?.id
            if (userId) {
              await supabase.from('player_inventory').delete().eq('player_id', userId)
              await supabase.from('player_ledger').delete().eq('player_id', userId)
              await supabase.from('players').delete().eq('id', userId)
            }
            // Full page reload to reset all state
            window.location.reload()
          }}
        />
      )}

      {/* Death screen */}
      {!showThemePicker && gamePhase === 'dead' && authPhase === 'ready' && (
        <DeathScreen
          cycle={state.player?.cycle ?? 1}
          xpGained={state.player?.xp ?? 0}
          roomsExplored={0}
          causeOfDeath="combat"
          onContinue={() => setGamePhase('between')}
        />
      )}

      {/* The Between */}
      {!showThemePicker && gamePhase === 'between' && authPhase === 'ready' && (
        <TheBetween
          cycle={(state.player?.cycle ?? 1) + 1}
          onContinue={() => {
            setPendingEchoStats(engine.getEchoStats())
            setGamePhase('rebirth')
          }}
        />
      )}

      {/* Rebirth — CharacterCreation pre-filled with echo stats */}
      {!showThemePicker && gamePhase === 'rebirth' && authPhase === 'ready' && (
        <CharacterCreation
          isRebirth
          echoStats={pendingEchoStats ?? undefined}
          onRebirthComplete={() => {
            setPendingEchoStats(null)
            setGamePhase('alive')
          }}
        />
      )}

      {/* Rebirthing loading screen */}
      {!showThemePicker && gamePhase === 'rebirthing' && authPhase === 'ready' && (
        <TerminalLoader text="RECONSTRUCTING" />
      )}

      {/* Game content — tab-based */}
      {isGamePhase && !showThemePicker && activeTab === 'TERM' && <Terminal messages={state.log} />}
      {isGamePhase && !showThemePicker && activeTab === 'STAT' && <StatTab />}
      {isGamePhase && !showThemePicker && activeTab === 'INV' && <InventoryTab />}
      {isGamePhase && !showThemePicker && activeTab === 'MAP' && <MapTab />}
      {isGamePhase && !showThemePicker && activeTab === 'DATA' && <DataTab />}
    </PipBoyFrame>
  )
}
