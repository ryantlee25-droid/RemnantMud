'use client'

// ============================================================
// TheBetween.tsx — Narrative interstitial between death and new cycle
// ============================================================

import { useState, useEffect, useRef } from 'react'

interface TheBetweenProps {
  cycle: number           // the NEW cycle number (e.g. 2 if this is the first death)
  onContinue: () => void  // called when player clicks BEGIN AGAIN
}

const MEMORY_POOL: string[] = [
  'The smell of rust and rain through a cracked ventilation shaft.',
  'A voice saying your name, from someone whose face you can\'t keep.',
  'The weight of the pack on your shoulders. The specific ache of it.',
  'A door you meant to open. You never went back.',
  'Something small and three-eyed watching you from a wall.',
  'The sound of a child\'s shoe scraping concrete somewhere ahead.',
  'Your own handwriting on a wall, in a language you no longer speak.',
  'A moment of warmth that had no source.',
  'The exact shade of sky the morning before everything changed.',
  'Someone calling out a name that might be yours.',
  'The weight of a promise you made and the specific way you broke it.',
  'Blood that wasn\'t yours on your hands and the memory of how it got there.',
  'A radio still playing in an empty house. The song almost familiar.',
  'The last time you laughed. You can\'t recover what was funny.',
  'A staircase you descended in the dark, counting steps that weren\'t all there.',
  'Someone\'s handprint in dust on a window. Smaller than yours.',
  'The feeling of running toward something rather than away from it. Brief.',
  'A map you drew that was wrong in exactly one place. That was the place.',
]

function pickFragments(count: number): string[] {
  const shuffled = [...MEMORY_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

const FRAGMENT_BASE_DELAY_MS = 800
const FRAGMENT_STAGGER_MS = 900
const WAKE_DELAY_MS = FRAGMENT_BASE_DELAY_MS + 3 * FRAGMENT_STAGGER_MS + 600
const BUTTON_DELAY_MS = WAKE_DELAY_MS + 900

export default function TheBetween({ cycle, onContinue }: TheBetweenProps) {
  // Fragments are fixed for this render instance
  const fragments = useRef<string[]>(pickFragments(3)).current

  const [introVisible, setIntroVisible] = useState(false)
  const [fragmentVisible, setFragmentVisible] = useState<boolean[]>([false, false, false])
  const [wakeVisible, setWakeVisible] = useState(false)
  const [buttonVisible, setButtonVisible] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    timers.push(setTimeout(() => setIntroVisible(true), 150))

    fragments.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setFragmentVisible((prev) => {
            const next = [...prev]
            next[i] = true
            return next
          })
        }, FRAGMENT_BASE_DELAY_MS + i * FRAGMENT_STAGGER_MS)
      )
    })

    timers.push(setTimeout(() => setWakeVisible(true), WAKE_DELAY_MS))
    timers.push(setTimeout(() => setButtonVisible(true), BUTTON_DELAY_MS))

    return () => timers.forEach(clearTimeout)
  }, [fragments])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black font-mono text-amber-400 p-6">
      <div className="max-w-xl w-full space-y-8">

        {/* Header */}
        <div
          style={{
            opacity: introVisible ? 1 : 0,
            transition: 'opacity 1.0s ease-in',
          }}
        >
          <div className="text-amber-600 text-xs uppercase tracking-widest mb-1">
            Cycle {cycle}
          </div>
          <h1
            className="text-xl tracking-[0.4em] uppercase text-amber-600 mb-6"
            style={{ fontVariant: 'small-caps' }}
          >
            The Between
          </h1>
          <p className="text-sm text-amber-400 leading-relaxed">
            You are not dead. You are not alive. CHARON-7 is rebuilding the scaffolding
            it calls you — threading proteins back through collapsed tissue, rerouting signals
            around the damage, reconstructing the shape of your face from whatever record
            it keeps. It takes time. While it works, you drift.
            Some things surface. Most don&#39;t stay.
          </p>
        </div>

        {/* Memory fragments */}
        <div className="space-y-4 border-l border-amber-900 pl-5">
          {fragments.map((fragment, i) => (
            <p
              key={i}
              className="text-sm text-amber-300 italic leading-relaxed"
              style={{
                opacity: fragmentVisible[i] ? 1 : 0,
                transition: 'opacity 0.9s ease-in',
              }}
            >
              {fragment}
            </p>
          ))}
        </div>

        {/* Wake line */}
        <div
          className="text-amber-500 text-sm tracking-widest"
          style={{
            opacity: wakeVisible ? 1 : 0,
            transition: 'opacity 1.0s ease-in',
          }}
        >
          You wake.
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
            BEGIN AGAIN
          </button>
        </div>
      </div>
    </div>
  )
}
