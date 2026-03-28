'use client'

// ============================================================
// CommandInput.tsx — Terminal-style command line
// ============================================================

import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { parseCommand, parseDialogueInput } from '@/lib/parser'
import { useGame } from '@/lib/gameContext'

export default function CommandInput() {
  const { dispatch, engine } = useGame()
  const [value, setValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState<number>(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  // Autofocus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function submit() {
    const trimmed = value.trim()
    if (!trimmed) return

    // Add to history (max 20)
    setHistory((prev) => {
      const next = [trimmed, ...prev.filter((h) => h !== trimmed)]
      return next.slice(0, 20)
    })
    setHistoryIndex(-1)
    setValue('')

    // Echo the typed command in the terminal log before processing
    engine._appendMessages([{
      id: crypto.randomUUID(),
      text: `> ${trimmed}`,
      type: 'echo' as const,
    }])

    const state = engine.getState()
    const action = state.activeDialogue
      ? parseDialogueInput(trimmed)
      : parseCommand(trimmed)
    await dispatch(action)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
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

  return (
    <div className="flex items-center bg-black border-t border-amber-900 px-4 py-2 font-mono">
      <span className="text-amber-400 mr-2 select-none">&gt;</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent text-amber-300 outline-none caret-amber-400 text-sm placeholder-amber-800"
        placeholder="type a command..."
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
    </div>
  )
}
