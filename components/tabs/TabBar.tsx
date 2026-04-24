'use client'

// ============================================================
// TabBar.tsx — Roving-tabindex tab bar for the Sidebar
// ============================================================

import { useRef, useCallback } from 'react'
import type { JSX } from 'react'

export interface TabBarProps {
  tabs: { id: string; label: string }[]
  active: string
  onChange: (id: string) => void
}

export default function TabBar({ tabs, active, onChange }: TabBarProps): JSX.Element {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = tabs.findIndex(t => t.id === active)
      let nextIndex = currentIndex

      switch (e.key) {
        case 'ArrowRight':
          nextIndex = (currentIndex + 1) % tabs.length
          break
        case 'ArrowLeft':
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length
          break
        case 'Home':
          nextIndex = 0
          break
        case 'End':
          nextIndex = tabs.length - 1
          break
        default:
          return
      }

      e.preventDefault()
      const nextTab = tabs[nextIndex]
      onChange(nextTab.id)
      buttonRefs.current[nextIndex]?.focus()
    },
    [tabs, active, onChange]
  )

  return (
    <div
      role="tablist"
      aria-label="Sidebar sections"
      className="flex w-full border-b border-amber-900"
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab, i) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            ref={el => { buttonRefs.current[i] = el }}
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={[
              'flex-1 font-mono text-xs uppercase tracking-widest py-1',
              isActive
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-amber-700 hover:text-amber-500',
            ].join(' ')}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
