'use client'

// ============================================================
// DeathScreen.tsx — Shown when the player's HP reaches 0
// Terminal aesthetic: instant display, typewriter reveal, no fades
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'

interface DeathScreenProps {
  cycle: number
  xpGained: number
  roomsExplored: number
  causeOfDeath: string
  onContinue: () => void
  echoStats?: { vigor: number; grit: number; reflex: number; wits: number; presence: number; shadow: number }
  stashCount?: number
  questMilestones?: string[]
}

const CAUSE_LABELS: Record<string, string> = {
  combat:        'KILLED IN COMBAT',
  infection:     'CONSUMED BY INFECTION',
  environmental: 'CLAIMED BY THE ENVIRONMENT',
}

function causeLabel(cause: string): string {
  return CAUSE_LABELS[cause] ?? cause.toUpperCase()
}

function useTypewriter(text: string, active: boolean, speed: number = 30) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active) {
      setDisplayed('')
      setDone(false)
      indexRef.current = 0
      return
    }
    indexRef.current = 0
    setDisplayed('')
    setDone(false)
    intervalRef.current = setInterval(() => {
      indexRef.current += 1
      if (indexRef.current >= text.length) {
        setDisplayed(text)
        setDone(true)
        if (intervalRef.current) clearInterval(intervalRef.current)
      } else {
        setDisplayed(text.slice(0, indexRef.current))
      }
    }, speed)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [text, active, speed])

  const skip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setDisplayed(text)
    setDone(true)
  }, [text])

  return { displayed, done, skip }
}

const DEATH_NARRATIVE = `The Revenant effect is not resurrection. That word implies something sacred. What happens to you is more like a document being restored from an older backup -- some edits lost, some corruptions introduced, the file a little smaller each time. CHARON-7 does not bring you back. It reconstructs something that can pass for you.

Each cycle you are a little less certain which memories are yours. Each cycle the violence comes a little more naturally. The virus is not keeping you alive out of mercy. It is keeping you alive because you are useful to it, and it has not finished deciding what for.`

export default function DeathScreen({
  cycle,
  xpGained,
  roomsExplored,
  causeOfDeath,
  onContinue,
  echoStats,
  stashCount,
  questMilestones,
}: DeathScreenProps) {
  const [showNarrative, setShowNarrative] = useState(false)
  const narrative = useTypewriter(DEATH_NARRATIVE, showNarrative, 20)

  useEffect(() => {
    const timer = setTimeout(() => setShowNarrative(true), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center flex-1 overflow-y-auto font-mono text-amber-400 p-4 pt-8" role="alert" aria-live="assertive">
      <div className="max-w-xl w-full space-y-4">

        {/* Cycle label */}
        <div className="text-amber-600 text-xs uppercase tracking-widest">
          CYCLE {cycle}
        </div>

        {/* Header */}
        <div>
          <div className="text-amber-300 text-sm uppercase tracking-widest mb-1">
            YOU ARE DEAD
          </div>
          <div className="text-amber-600 text-xs">
            It is still watching. It always finds you.
          </div>
        </div>

        {/* Cause of death */}
        <div className="text-amber-600 text-xs uppercase tracking-widest border-t border-amber-900 pt-4">
          {causeLabel(causeOfDeath)}
        </div>

        {/* Stats */}
        <div className="border border-amber-900 py-3 px-4 text-xs">
          <div>XP EARNED: <span className="text-amber-300">{xpGained}</span></div>
          <div>ROOMS EXPLORED: <span className="text-amber-300">{roomsExplored}</span></div>
        </div>

        {/* What persists across death */}
        {(echoStats || (stashCount && stashCount > 0) || (questMilestones && questMilestones.length > 0)) && (
          <div className="border border-amber-900 py-3 px-4 text-xs space-y-1">
            <div className="text-amber-600 uppercase tracking-widest mb-1">
              WHAT YOU CARRY FORWARD
            </div>
            {echoStats && (
              <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
                <div>VIG: <span className="text-amber-300">{echoStats.vigor}</span></div>
                <div>GRT: <span className="text-amber-300">{echoStats.grit}</span></div>
                <div>REF: <span className="text-amber-300">{echoStats.reflex}</span></div>
                <div>WIT: <span className="text-amber-300">{echoStats.wits}</span></div>
                <div>PRS: <span className="text-amber-300">{echoStats.presence}</span></div>
                <div>SHD: <span className="text-amber-300">{echoStats.shadow}</span></div>
              </div>
            )}
            {stashCount != null && stashCount > 0 && (
              <div className="text-amber-300">
                Stash: {stashCount} item{stashCount !== 1 ? 's' : ''} preserved
              </div>
            )}
            {questMilestones && questMilestones.length > 0 && (
              <div className="text-amber-300">
                {questMilestones.length} milestone{questMilestones.length !== 1 ? 's' : ''} remembered
              </div>
            )}
          </div>
        )}

        {/* Narrative — typewriter reveal */}
        <div className="text-xs text-amber-400 leading-relaxed text-left whitespace-pre-wrap">
          {narrative.displayed}
          {!narrative.done && (
            <span className="inline-block w-1.5 h-3 bg-amber-400 animate-pulse ml-0.5 align-middle" />
          )}
        </div>
        {!narrative.done && (
          <button
            onClick={narrative.skip}
            className="text-amber-900 text-xs uppercase tracking-widest"
          >
            Skip
          </button>
        )}

        {/* Closing line */}
        {narrative.done && (
          <div className="text-amber-500 text-xs">
            The world is not finished with you.
          </div>
        )}

        {/* Button */}
        {narrative.done && (
          <div>
            <button
              onClick={onContinue}
              className="border border-amber-600 text-amber-400 px-8 py-2 text-xs disabled:cursor-not-allowed"
              autoFocus
            >
              RETURN
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
