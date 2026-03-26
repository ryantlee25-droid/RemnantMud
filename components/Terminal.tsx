'use client'

// ============================================================
// Terminal.tsx — Scrolling message log
// ============================================================

import { useEffect, useRef } from 'react'
import type { GameMessage } from '@/types/game'

interface TerminalProps {
  messages: GameMessage[]
}

function messageColor(type: GameMessage['type']): string {
  switch (type) {
    case 'narrative': return 'text-amber-400'
    case 'combat':    return 'text-red-500'
    case 'system':    return 'text-blue-400'
    case 'error':     return 'text-red-400'
    default:          return 'text-amber-400'
  }
}

export default function Terminal({ messages }: TerminalProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto bg-black font-mono text-sm leading-relaxed px-4 py-3 select-text">
      {messages.map((m, i) => (
        <div key={i} className={`${messageColor(m.type)} mb-0.5`}>
          {m.text}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
