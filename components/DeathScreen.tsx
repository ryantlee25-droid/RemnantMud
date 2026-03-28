'use client'

// ============================================================
// DeathScreen.tsx — Shown when the player's HP reaches 0
// ============================================================

import { useState, useEffect } from 'react'
import RemnantLogo from '@/components/RemnantLogo'

interface DeathScreenProps {
  cycle: number           // current cycle number (1 = first death)
  xpGained: number        // total XP earned this cycle
  roomsExplored: number   // count of visited rooms this cycle
  causeOfDeath: string    // e.g. "combat", "infection", "environmental"
  onContinue: () => void  // called when player clicks RETURN
}

const CAUSE_LABELS: Record<string, string> = {
  combat:        'Killed in combat',
  infection:     'Consumed by infection',
  environmental: 'Claimed by the environment',
}

function causeLabel(cause: string): string {
  return CAUSE_LABELS[cause] ?? cause
}

export default function DeathScreen({
  cycle,
  xpGained,
  roomsExplored,
  causeOfDeath,
  onContinue,
}: DeathScreenProps) {
  const [visible, setVisible] = useState(false)
  const [buttonVisible, setButtonVisible] = useState(false)

  // Fade in the content shortly after mount
  useEffect(() => {
    const fadeIn = setTimeout(() => setVisible(true), 100)
    const showButton = setTimeout(() => setButtonVisible(true), 2100)
    return () => {
      clearTimeout(fadeIn)
      clearTimeout(showButton)
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center flex-1 overflow-y-auto font-mono text-amber-400 p-6">
      <div
        className="max-w-xl w-full space-y-8 text-center"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 1.4s ease-in',
        }}
      >
        {/* Cycle label */}
        <div className="text-amber-600 text-xs uppercase tracking-widest">
          Cycle {cycle}
        </div>

        {/* Header */}
        <div>
          <div className="mb-4 opacity-60">
            <RemnantLogo size="compact" />
          </div>
          <h1 className="text-3xl tracking-[0.3em] uppercase text-amber-300 mb-3">
            YOU ARE DEAD
          </h1>
          <p className="text-amber-600 text-sm italic">
            It is still watching. It always finds you.
          </p>
        </div>

        {/* Cause of death */}
        <div className="text-amber-600 text-xs uppercase tracking-widest border-t border-amber-900 pt-6">
          {causeLabel(causeOfDeath)}
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-10 text-sm border border-amber-900 py-4 px-6">
          <div>
            <div className="text-amber-600 text-xs uppercase tracking-widest mb-1">XP Earned</div>
            <div className="text-amber-300 text-xl">{xpGained}</div>
          </div>
          <div>
            <div className="text-amber-600 text-xs uppercase tracking-widest mb-1">Rooms Explored</div>
            <div className="text-amber-300 text-xl">{roomsExplored}</div>
          </div>
        </div>

        {/* Narrative */}
        <div className="space-y-4 text-sm text-amber-400 leading-relaxed text-left">
          <p>
            The Revenant effect is not resurrection. That word implies something sacred.
            What happens to you is more like a document being restored from an older backup —
            some edits lost, some corruptions introduced, the file a little smaller each time.
            CHARON-7 does not bring you back. It reconstructs something that can pass for you.
          </p>
          <p>
            Each cycle you are a little less certain which memories are yours.
            Each cycle the violence comes a little more naturally.
            The virus is not keeping you alive out of mercy.
            It is keeping you alive because you are useful to it,
            and it has not finished deciding what for.
          </p>
        </div>

        {/* Closing line */}
        <div className="text-amber-500 text-sm italic">
          The world is not finished with you.
        </div>

        {/* Button */}
        <div
          style={{
            opacity: buttonVisible ? 1 : 0,
            transition: 'opacity 0.8s ease-in',
          }}
        >
          <button
            onClick={onContinue}
            disabled={!buttonVisible}
            className="border border-amber-600 text-amber-400 px-8 py-2 text-sm hover:bg-amber-900 transition-colors disabled:cursor-not-allowed"
            autoFocus={buttonVisible}
          >
            RETURN
          </button>
        </div>
      </div>
    </div>
  )
}
