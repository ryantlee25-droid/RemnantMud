'use client'

// ============================================================
// / — Main game page
// Handles auth gating, character creation, death/ending, and
// prologue — all routed through the terminal. No tabs. No
// screen takeovers. GameLayout provides split-pane display.
// ============================================================

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { isDevMode, DEV_USER, resetDevDb } from '@/lib/supabaseMock'
import { useGame } from '@/lib/gameContext'
import GameLayout from '@/components/GameLayout'
import Terminal from '@/components/Terminal'
import CommandInput from '@/components/CommandInput'
import Sidebar from '@/components/Sidebar'
import {
  initialCreationState,
  creationPrompt,
  handleCreationInput,
  type CreationState,
} from '@/lib/terminalCreation'
import {
  deathMessages,
  theBetweenMessages,
  endingMessages,
  prologueMessages,
} from '@/lib/terminalDeath'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// ── Auth phases ──────────────────────────────────────────────

type AuthPhase = 'checking' | 'unauthenticated' | 'loading-player' | 'load-error' | 'creating' | 'ready'

// ── Game flow phases (all rendered in the terminal) ──────────

type GameFlow = 'prologue' | 'playing' | 'dead' | 'between' | 'rebirth' | 'ending'

const PROLOGUE_KEY = 'remnant_saw_prologue'

export default function GamePage() {
  const router = useRouter()
  const { state, dispatch, engine } = useGame()
  const [authPhase, setAuthPhase] = useState<AuthPhase>('checking')
  const [gameFlow, setGameFlow] = useState<GameFlow>('playing')

  // Character creation state machine (terminal-based)
  const [creationState, setCreationState] = useState<CreationState | null>(null)

  // Retry callback for load-error phase — populated inside the init useEffect
  const retryLoadRef = useRef<(() => void) | null>(null)

  // Guard flag for CONFIRM RESTART — must be true before the wipe executes.
  // Set to true when handleRestart() warning is shown. Reset on any other input.
  // Does not need to persist across reloads: if the save is wiped, the guard
  // is irrelevant; if the page refreshes without a wipe, the player needs
  // to type `restart` again to confirm intent.
  const restartWarningShownRef = useRef(false)

  // ── Auth init ──────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false

    async function attemptLoad(userId: string) {
      if (!cancelled) setAuthPhase('loading-player')

      try {
        const found = await engine.loadPlayer(userId)
        if (!cancelled) {
          if (found) {
            // Player exists — check if prologue should be shown.
            // Returning players (cycle > 1) always skip the prologue, even on a new
            // browser where localStorage has been cleared. Cycle-1 players still see
            // it on first login unless they previously dismissed it.
            const loadedCycle = engine.getState().player?.cycle ?? 1
            const sawPrologue =
              isDevMode() ||
              loadedCycle > 1 ||
              (typeof window !== 'undefined' && localStorage.getItem(PROLOGUE_KEY))
            if (!sawPrologue) {
              setGameFlow('prologue')
              engine._appendMessages(prologueMessages())
            }
            setAuthPhase('ready')
          } else {
            // No player row — this is a legitimate new player, start creation
            const sawPrologue =
              isDevMode() ||
              (typeof window !== 'undefined' && localStorage.getItem(PROLOGUE_KEY))
            if (!sawPrologue) {
              setGameFlow('prologue')
              engine._appendMessages(prologueMessages())
              setAuthPhase('ready')
            } else {
              // Start creation directly
              const cs = initialCreationState()
              setCreationState(cs)
              engine._appendMessages(creationPrompt(cs))
              setAuthPhase('creating')
            }
          }
        }
      } catch (err) {
        // DB or network error — do NOT start character creation; save data may exist.
        // Show an error and let the player retry rather than silently overwriting their save.
        if (!cancelled) {
          engine._appendMessages([{
            id: crypto.randomUUID(),
            text: `Connection error — could not load your save. (${err instanceof Error ? err.message : 'Unknown error'})`,
            type: 'error' as const,
          }, {
            id: crypto.randomUUID(),
            text: 'Type RETRY to try again, or reload the page.',
            type: 'system' as const,
          }])
          setAuthPhase('load-error')
        }
      }
    }

    async function init() {
      let user: { id: string } | null = null

      if (isDevMode()) {
        resetDevDb()
        localStorage.removeItem(PROLOGUE_KEY)
        user = DEV_USER
      } else {
        const supabase = createSupabaseBrowserClient()
        const { data, error: authError } = await supabase.auth.getUser()
        if (authError && !data.user) {
          await supabase.auth.signOut()
        }
        user = data.user
      }

      if (!user) {
        if (!cancelled) setAuthPhase('unauthenticated')
        return
      }

      // Expose a retry function that re-attempts load for the same authenticated user
      retryLoadRef.current = () => { void attemptLoad(user!.id) }

      await attemptLoad(user.id)
    }

    void init()
    return () => { cancelled = true }
  }, [engine])

  // ── Once creation finishes via the engine, flip to ready ───

  useEffect(() => {
    if (authPhase === 'creating' && state.initialized) {
      setAuthPhase('ready')
      setGameFlow('playing')
    }
  }, [state.initialized, authPhase])

  // ── Redirect unauthenticated users ─────────────────────────

  useEffect(() => {
    if (authPhase === 'unauthenticated') {
      router.replace('/login')
    }
  }, [authPhase, router])

  // ── Watch for player death ─────────────────────────────────

  const deathPendingRef = useRef(false)
  useEffect(() => {
    if (state.playerDead && gameFlow === 'playing' && !deathPendingRef.current) {
      deathPendingRef.current = true
      const t = setTimeout(() => {
        setGameFlow('dead')
        // Push death messages to terminal
        engine._appendMessages(
          deathMessages({
            cycle: state.player?.cycle ?? 1,
            xpGained: state.player?.xp ?? 0,
            roomsExplored: state.roomsExplored,
            causeOfDeath: 'combat',
            echoStats: (engine.getEchoStats() as Record<string, unknown> | null) ?? undefined,
            stashCount: state.stash.length,
            questMilestones: state.player?.questFlags
              ? Object.keys(state.player.questFlags).filter((f) =>
                  /_trusts_|_betrayed|_offered_deal|_recognized_truth|_shared_origin|_aligned_|_enabled_/.test(f)
                )
              : undefined,
          })
        )
        deathPendingRef.current = false
      }, 1500)
      return () => {
        clearTimeout(t)
        deathPendingRef.current = false
      }
    }
  }, [state.playerDead, gameFlow, state.player, state.roomsExplored, state.stash, engine])

  // ── Watch for ending trigger ───────────────────────────────

  useEffect(() => {
    if (state.endingTriggered && state.endingChoice && gameFlow === 'playing' && !state.playerDead) {
      const t = setTimeout(() => {
        setGameFlow('ending')
        engine._appendMessages(
          endingMessages({
            choice: state.endingChoice!,
            cycle: state.player?.cycle ?? 1,
            totalDeaths: state.player?.totalDeaths ?? 0,
            roomsExplored: state.roomsExplored,
            xpEarned: state.player?.xp ?? 0,
          })
        )
      }, 2000)
      return () => clearTimeout(t)
    }
  }, [state.endingTriggered, state.endingChoice, gameFlow, state.playerDead, state.player, state.roomsExplored, engine])

  // ── Command interception ───────────────────────────────────
  //
  // CommandInput calls dispatch(action) by default. We need to
  // intercept during special phases. We do this by wrapping
  // the onSubmit behavior. CommandInput already uses the context
  // dispatch, so we override via a ref-based callback.

  const handleCommand = useCallback(async (input: string) => {
    const trimmed = input.trim()
    if (!trimmed) return

    // Echo the command
    engine._appendMessages([{
      id: crypto.randomUUID(),
      text: `> ${trimmed}`,
      type: 'echo' as const,
    }])

    // ── Confirm restart — full save wipe (works in any phase) ──
    //
    // Bug #2 guard: CONFIRM RESTART requires that the player first saw the
    // handleRestart() warning in this session (restartWarningShownRef.current).
    // Without this guard a single keystroke could nuke a save.
    if (trimmed.toUpperCase() === 'CONFIRM RESTART') {
      if (!restartWarningShownRef.current) {
        engine._appendMessages([{
          id: crypto.randomUUID(),
          text: "You haven't been warned. Type `restart` first to see what will be deleted.",
          type: 'system' as const,
        }])
        return
      }
      // Guard satisfied — execute the wipe
      restartWarningShownRef.current = false
      const supabase = (await import('@/lib/supabase')).createSupabaseBrowserClient()
      const userId = state.player?.id
      if (userId) {
        try {
          const r1 = await supabase.from('player_inventory').delete().eq('player_id', userId)
          if (r1.error) throw r1.error
          const r2 = await supabase.from('player_ledger').delete().eq('player_id', userId)
          if (r2.error) throw r2.error
          const r3 = await supabase.from('player_stash').delete().eq('player_id', userId)
          if (r3.error) throw r3.error
          const r4 = await supabase.from('generated_rooms').delete().eq('player_id', userId)
          if (r4.error) throw r4.error
          const r5 = await supabase.from('players').delete().eq('id', userId)
          if (r5.error) throw r5.error
        } catch {
          engine._appendMessages([{
            id: crypto.randomUUID(),
            text: 'Reset failed — please try again.',
            type: 'error' as const,
          }])
          return
        }
      }
      window.location.reload()
      return
    }

    // Reset the restart warning flag for any input that isn't CONFIRM RESTART.
    // This ensures the guard doesn't persist across unrelated commands.
    restartWarningShownRef.current = false

    // ── Load-error phase — waiting for RETRY ───────────────
    if (authPhase === 'load-error') {
      const upper = trimmed.toUpperCase()
      if (upper === 'RETRY') {
        retryLoadRef.current?.()
      } else if (upper === 'RESTART' || upper === 'NEWGAME' || upper === 'RESET') {
        // Bug #1: restart recognized in load-error phase
        const { handleRestart } = await import('@/lib/actions/system')
        engine._appendMessages(handleRestart())
        restartWarningShownRef.current = true
      } else {
        engine._appendMessages([{
          id: crypto.randomUUID(),
          text: 'Type RETRY to attempt reconnection, or reload the page.',
          type: 'system' as const,
        }])
      }
      return
    }

    // ── Prologue phase ─────────────────────────────────────
    if (gameFlow === 'prologue') {
      const upper = trimmed.toUpperCase()
      if (upper === 'SKIP' || upper === 'ENTER' || upper === '') {
        if (typeof window !== 'undefined') localStorage.setItem(PROLOGUE_KEY, '1')
        setGameFlow('playing')

        // If no player exists, start character creation
        if (!state.initialized && !state.player) {
          const cs = initialCreationState()
          setCreationState(cs)
          engine._appendMessages(creationPrompt(cs))
          setAuthPhase('creating')
        }
      } else if (upper === 'RESTART' || upper === 'NEWGAME' || upper === 'RESET') {
        // Bug #1: restart recognized in prologue phase
        const { handleRestart } = await import('@/lib/actions/system')
        engine._appendMessages(handleRestart())
        restartWarningShownRef.current = true
      } else {
        // UX #15: detect real game verbs and give a helpful phase-specific error
        const { parseCommand } = await import('@/lib/parser')
        const parsed = parseCommand(trimmed)
        if (parsed.verb !== 'unknown') {
          engine._appendMessages([{
            id: crypto.randomUUID(),
            text: `You can't ${parsed.verb} right now — you're in the prologue. Type SKIP to continue.`,
            type: 'system' as const,
          }])
        } else {
          engine._appendMessages([{
            id: crypto.randomUUID(),
            text: 'Type SKIP to bypass, or ENTER to continue.',
            type: 'system' as const,
          }])
        }
      }
      return
    }

    // ── Character creation phase ───────────────────────────
    if (authPhase === 'creating' && creationState) {
      // Bug #1: restart recognized during character creation
      const upperCreating = trimmed.toUpperCase()
      if (upperCreating === 'RESTART' || upperCreating === 'NEWGAME' || upperCreating === 'RESET') {
        const { handleRestart } = await import('@/lib/actions/system')
        engine._appendMessages(handleRestart())
        restartWarningShownRef.current = true
        return
      }

      // UX #15: detect real game verbs during creation and give a helpful error
      const { parseCommand: parseCmd } = await import('@/lib/parser')
      const parsedCreating = parseCmd(trimmed)
      if (parsedCreating.verb !== 'unknown') {
        engine._appendMessages([{
          id: crypto.randomUUID(),
          text: `You can't ${parsedCreating.verb} right now — you're creating a character. Finish character creation first.`,
          type: 'system' as const,
        }])
        return
      }

      const result = handleCreationInput(creationState, trimmed)
      setCreationState(result.nextState)
      engine._appendMessages(result.messages)

      if (result.done && result.result) {
        try {
          if (gameFlow === 'rebirth') {
            await engine.rebirthWithStats(
              result.result.name,
              result.result.stats,
              result.result.characterClass,
              result.result.personalLoss,
            )
          } else {
            await engine.createCharacter(
              result.result.name,
              result.result.stats,
              result.result.characterClass,
              result.result.personalLoss,
            )
          }
        } catch (err) {
          engine._appendMessages([{
            id: crypto.randomUUID(),
            text: `Character creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
            type: 'error' as const,
          }])
        }
      }
      return
    }

    // ── Death phase — waiting for BEGIN ─────────────────────
    if (gameFlow === 'dead') {
      const upper = trimmed.toUpperCase()
      if (upper === 'BEGIN') {
        // Push "The Between" messages
        const player = state.player
        engine._appendMessages(
          theBetweenMessages({
            cycle: (player?.cycle ?? 1) + 1,
            inheritedFactions: player?.factionReputation
              ? Object.fromEntries(
                  Object.entries(player.factionReputation)
                    .filter(([, rep]) => rep != null && (rep >= 2 || rep <= -2))
                )
              : undefined,
            discoveredRooms: state.ledger?.discoveredRoomIds,
            stashItems: state.stash,
          })
        )
        setGameFlow('between')
      } else if (upper === 'RESTART' || upper === 'NEWGAME' || upper === 'RESET') {
        const { handleRestart } = await import('@/lib/actions/system')
        engine._appendMessages(handleRestart())
        restartWarningShownRef.current = true
      } else {
        engine._appendMessages([{
          id: crypto.randomUUID(),
          text: 'Type BEGIN to start a new cycle, or RESTART to wipe your save entirely.',
          type: 'system' as const,
        }])
      }
      return
    }

    // ── Between phase — waiting for BEGIN to rebirth ────────
    if (gameFlow === 'between') {
      const upper = trimmed.toUpperCase()
      if (upper === 'BEGIN') {
        setGameFlow('rebirth')
        // Start rebirth character creation with echo stats
        const cs = initialCreationState()
        setCreationState(cs)
        engine._appendMessages(creationPrompt(cs))
        setAuthPhase('creating')
      } else if (upper === 'RESTART' || upper === 'NEWGAME' || upper === 'RESET') {
        const { handleRestart } = await import('@/lib/actions/system')
        engine._appendMessages(handleRestart())
        restartWarningShownRef.current = true
      } else {
        engine._appendMessages([{
          id: crypto.randomUUID(),
          text: 'Type BEGIN to continue, or RESTART to wipe your save entirely.',
          type: 'system' as const,
        }])
      }
      return
    }

    // ── Rebirth creation — handled by the 'creating' branch above
    // (authPhase === 'creating' catches this)

    // ── Ending phase — waiting for BEGIN ────────────────────
    //
    // Bug #4: BEGIN now shows the same wipe-warning ceremony as RESTART.
    //         Actual wipe only fires on CONFIRM RESTART (handled above).
    // Bug #3: SKIP / QUIT / EXIT reload the page without wiping (escape hatch).
    // Bug #1: RESTART / NEWGAME / RESET recognized here too.
    if (gameFlow === 'ending') {
      const upper = trimmed.toUpperCase()
      if (upper === 'BEGIN' || upper === 'RESTART' || upper === 'NEWGAME' || upper === 'RESET') {
        // Show warning ceremony — same as the main RESTART flow
        const { handleRestart } = await import('@/lib/actions/system')
        engine._appendMessages(handleRestart())
        restartWarningShownRef.current = true
      } else if (upper === 'SKIP' || upper === 'QUIT' || upper === 'EXIT') {
        // Bug #3: escape hatches — reload without wiping
        window.location.reload()
      } else {
        // UX #15: detect real game verbs and give a helpful error
        const { parseCommand } = await import('@/lib/parser')
        const parsed = parseCommand(trimmed)
        if (parsed.verb !== 'unknown') {
          engine._appendMessages([{
            id: crypto.randomUUID(),
            text: `You can't ${parsed.verb} right now — you're at the ending screen. Type BEGIN to wipe and start a new session, or QUIT to exit.`,
            type: 'system' as const,
          }])
        } else {
          engine._appendMessages([{
            id: crypto.randomUUID(),
            text: 'Type BEGIN to wipe and start a new session, or QUIT to exit.',
            type: 'system' as const,
          }])
        }
      }
      return
    }

    // ── Normal gameplay — route to engine ───────────────────
    const { parseCommand, parseDialogueInput } = await import('@/lib/parser')
    const currentState = engine.getState()
    const action = currentState.activeDialogue
      ? parseDialogueInput(trimmed)
      : parseCommand(trimmed)
    try {
      await dispatch(action)
    } catch {
      engine._appendMessages([{
        id: crypto.randomUUID(),
        text: 'Something went wrong processing that command.',
        type: 'error' as const,
      }])
    }
  }, [authPhase, gameFlow, creationState, state, engine, dispatch])

  // ── Redirect in progress — render nothing ──────────────────

  if (authPhase === 'unauthenticated') {
    return null
  }

  // Terminal is ALWAYS visible. Sidebar shows during gameplay.
  const isGameReady = authPhase === 'ready' && gameFlow === 'playing'

  return (
    <ErrorBoundary>
      <GameLayout
        sidebar={isGameReady ? <Sidebar /> : null}
        showSidebar={isGameReady}
        input={
          <CommandInputWrapper
            onSubmit={handleCommand}
            showHpPrompt={isGameReady}
          />
        }
      >
        <Terminal messages={state.log} />
      </GameLayout>
    </ErrorBoundary>
  )
}

// ── CommandInput wrapper ─────────────────────────────────────
// Wraps CommandInput to intercept submit and route through our
// phase-aware handleCommand instead of the default dispatch.

function CommandInputWrapper({
  onSubmit,
  showHpPrompt,
}: {
  onSubmit: (input: string) => Promise<void>
  showHpPrompt: boolean
}) {
  const { state } = useGame()
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function submit() {
    const trimmed = value.trim()
    if (!trimmed) return

    setHistory((prev) => {
      const next = [trimmed, ...prev.filter((h) => h !== trimmed)]
      return next.slice(0, 20)
    })
    setHistoryIndex(-1)
    setValue('')

    await onSubmit(trimmed)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      void submit()
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHistoryIndex((prev) => {
        const next = Math.min(prev + 1, history.length - 1)
        if (next >= 0 && history[next] !== undefined) {
          setValue(history[next]!)
        }
        return next
      })
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHistoryIndex((prev) => {
        const next = Math.max(prev - 1, -1)
        if (next === -1) {
          setValue('')
        } else if (history[next] !== undefined) {
          setValue(history[next]!)
        }
        return next
      })
      return
    }
  }

  const player = state.player
  const prompt = showHpPrompt && player
    ? `<HP:${player.hp}/${player.maxHp}> `
    : '> '

  return (
    <div className="flex items-center bg-black border-t border-gray-700 px-4 py-2 font-mono">
      <span className="text-cyan-400 mr-2 select-none whitespace-nowrap">{prompt}</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent text-gray-200 outline-none caret-gray-400 text-sm"
        aria-label="Game command input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={200}
      />
    </div>
  )
}
