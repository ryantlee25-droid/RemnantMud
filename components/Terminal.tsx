'use client'

// ============================================================
// Terminal.tsx — Scrolling message log
// ============================================================

import React, { memo, useEffect, useMemo, useRef } from 'react'
import type { GameMessage } from '@/types/game'
import { TAG_COLOR, MESSAGE_COLOR } from '@/lib/ansiColors'

// ------------------------------------------------------------
// Rich-text tag parser — turns <item>...</item> etc. into
// colored <span> elements while leaving plain text untouched.
// ------------------------------------------------------------

const TAG_NAMES = ['item', 'npc', 'enemy', 'exit', 'keyword', 'currency', 'condition', 'trait'] as const

const TAG_PATTERN = new RegExp(
  `<(${TAG_NAMES.join('|')})>(.*?)<\\/\\1>`,
  'g',
)

function parseRichText(text: string): React.ReactNode {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let key = 0

  TAG_PATTERN.lastIndex = 0            // reset stateful regex
  let match = TAG_PATTERN.exec(text)

  while (match !== null) {
    // Push any plain text before this match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const tag = match[1] as string
    const inner = match[2]
    nodes.push(
      <span key={key++} className={TAG_COLOR[tag]}>{inner}</span>,
    )

    lastIndex = match.index + match[0].length
    match = TAG_PATTERN.exec(text)
  }

  // Trailing plain text (or the entire string if no tags matched)
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  // Fast path: no tags found — return the original string to avoid
  // wrapping it in an unnecessary fragment / array.
  if (nodes.length === 1 && typeof nodes[0] === 'string') {
    return nodes[0]
  }

  return nodes
}

interface TerminalProps {
  messages: GameMessage[]
}

function messageColor(type: GameMessage['type']): string {
  return MESSAGE_COLOR[type] ?? 'text-gray-300'
}

const MAX_VISIBLE_MESSAGES = 500

const MessageLine = memo(function MessageLine({ message }: { message: GameMessage }) {
  return (
    <div className={`${messageColor(message.type)} mb-0.5`} aria-label={message.type}>
      {parseRichText(message.text)}
    </div>
  )
})

export default function Terminal({ messages }: TerminalProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Only render the most recent messages to prevent DOM bloat in long sessions
  const visible = useMemo(
    () => messages.length > MAX_VISIBLE_MESSAGES
      ? messages.slice(-MAX_VISIBLE_MESSAGES)
      : messages,
    [messages]
  )

  return (
    <div className="flex-1 overflow-y-auto bg-black font-mono text-sm leading-snug px-2 sm:px-3 py-1 select-text" role="log" aria-live="polite" aria-label="Game messages">
      {visible.map((m) => (
        <MessageLine key={m.id} message={m} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
