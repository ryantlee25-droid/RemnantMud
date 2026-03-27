'use client'

// ============================================================
// Prologue.tsx — Opening narrative, shown once before character creation
// ============================================================

import { useState, useEffect, useRef } from 'react'

const PROLOGUE_LINES = [
  "You don't remember the exact day the world ended. Nobody does.",
  "",
  "It wasn't a bomb. It wasn't a war. It wasn't the kind of catastrophe that announces itself with fire and thunder and gives you the dignity of knowing, in the moment, that everything has changed.",
  "",
  "It was a cough.",
  "",
  "Someone coughed in a hallway in a building that didn't officially exist, in a mountain range in southwestern Colorado, and within six weeks, sixty percent of the human race had stopped being human in any way that mattered.",
  "",
  "They called the pathogen CHARON-7. The ferryman. The thing that carries you across.",
  "",
  "Most of the infected became the Hollow — stripped down to hunger and reflex, walking through the ruins of their own lives with just enough memory to make them terrible. Your neighbor fumbling with his car keys forever. A teacher still standing at a chalkboard in an empty school, writing the same word over and over. The worst part isn't the violence. The worst part is the recognition. You can still see who they were.",
  "",
  "But CHARON-7 had a second act. One in ten thousand didn't become Hollow. They became something else. Something faster, stronger, more aware than they'd ever been — and dependent on human blood to stay that way. People started calling them vampires. They call themselves the Sanguine. They're not wrong about what they are. Neither are we.",
  "",
  "That was seven years ago.",
  "",
  "The old world is gone. The highways are rivers of weeds. The cities are tombs. The government, the military, the internet, the electrical grid, the supply chains, the systems that made modern life possible — all of it, gone. What's left is us. The Unturned. The ones who didn't get sick, didn't change, didn't become something else's food supply. We built walls. We found guns. We remembered how to grow things and fix things and make do. We built new communities on the bones of the old ones, here in the Four Corners, where the mountains and the desert and the canyons gave us something to put our backs against.",
  "",
  "It's not a good life. But it's a life.",
  "",
  "You are here because you survived. That's it. That's your credential. You walked, or drove, or crawled, or were carried to this place — the last stretch of the American Southwest where people are still trying to be people. Where settlements trade and fight and worship and argue about what kind of world to build on top of the one that died.",
  "",
  "You have nothing. A pack. A knife. Whatever you were wearing when everything fell apart. You have no faction, no reputation, no allegiance. You are no one. In the old world, that was the worst thing you could be. In this one, it might be the best. No one owns you. No one is hunting you.",
  "",
  "Not yet.",
  "",
  "The road ahead forks in more ways than you can see from here. There are people who want to rebuild. People who want to conquer. People who want to be left alone. People who aren't people anymore but remember being one. And somewhere in the mountains to the north, buried under rock and silence and seven years of secrets, there is a place called the Scar — the place where CHARON-7 was born — and someone, somewhere, believes that what was made there can be unmade.",
  "",
  "You don't know if that's true. Nobody does.",
  "",
  "But you're going to find out. Because that's what survivors do. They move forward. Even when forward is dark. Even when forward is teeth.",
  "",
  "Welcome to The Remnant.",
  "",
  "What's left is what matters.",
]

interface PrologueProps {
  onComplete: () => void
}

export default function Prologue({ onComplete }: PrologueProps) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [done, setDone] = useState(false)
  const [skipped, setSkipped] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= PROLOGUE_LINES.length) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          setDone(true)
          return prev
        }
        return prev + 1
      })
    }, 80)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Auto-scroll to bottom as lines appear
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [visibleLines])

  function skipToEnd() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setVisibleLines(PROLOGUE_LINES.length)
    setDone(true)
    setSkipped(true)
  }

  return (
    <div className="flex flex-col min-h-screen bg-black font-mono text-amber-400 p-6 md:p-12">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
        <div className="text-amber-700 text-xs uppercase tracking-widest mb-8">
          THE REMNANT — Transmission Log
        </div>

        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto space-y-2 mb-8 max-h-[70vh] scrollbar-hide"
        >
          {PROLOGUE_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i}>
              {line === '' ? (
                <div className="h-3" />
              ) : line.startsWith('>') ? (
                <div className="border-l-2 border-amber-700 pl-4 text-amber-300 text-sm italic">
                  {line.slice(2)}
                </div>
              ) : (
                <div className="text-amber-400 text-sm leading-relaxed">{line}</div>
              )}
            </div>
          ))}
          {visibleLines > 0 && visibleLines < PROLOGUE_LINES.length && (
            <span className="inline-block w-2 h-4 bg-amber-400 animate-pulse" />
          )}
        </div>

        <div className="flex gap-4 border-t border-amber-900 pt-6">
          {!done ? (
            <button
              onClick={skipToEnd}
              className="text-amber-700 text-xs uppercase tracking-widest hover:text-amber-500 transition-colors"
            >
              Skip →
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="border border-amber-600 text-amber-400 px-6 py-2 text-sm hover:bg-amber-900 transition-colors"
              autoFocus
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
