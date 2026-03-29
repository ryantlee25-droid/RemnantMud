'use client'

// ============================================================
// PipBoyFrame.tsx — Outer device frame wrapping all game content
// Provides bezel, inner screen, CRT overlay, tab bar,
// optional StatusBar, and optional CommandInput.
// ============================================================

import React from 'react'
import StatusBar from '@/components/StatusBar'
import CommandInput from '@/components/CommandInput'

export const TAB_IDS = ['TERM', 'STAT', 'INV', 'MAP', 'DATA'] as const
export type TabId = (typeof TAB_IDS)[number]

interface PipBoyFrameProps {
  children: React.ReactNode
  showTabs?: boolean
  activeTab?: TabId
  onTabChange?: (tab: TabId) => void
  showStatus?: boolean
  showInput?: boolean
}

export default function PipBoyFrame({
  children,
  showTabs = false,
  activeTab = 'TERM',
  onTabChange,
  showStatus = false,
  showInput = false,
}: PipBoyFrameProps) {
  return (
    <div className="max-w-6xl mx-auto h-screen flex items-center justify-center p-1 sm:p-2">
      {/* Bezel */}
      <div className="pipboy-scratches bg-zinc-800 rounded-2xl p-1 shadow-2xl relative overflow-hidden h-full max-h-[95vh] w-full flex flex-col">
        {/* Inner screen */}
        <div className="crt-scanlines bg-black rounded-xl overflow-hidden flex flex-col h-full relative">
          {/* Tab bar */}
          {showTabs && (
            <div className="bg-black border-b border-amber-900 flex items-center px-2 shrink-0" role="tablist" aria-label="Game tabs">
              {TAB_IDS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  aria-controls={`tabpanel-${tab}`}
                  onClick={() => onTabChange?.(tab)}
                  className={`px-2 py-1 text-xs uppercase tracking-widest font-mono transition-colors ${
                    activeTab === tab
                      ? 'text-amber-400 border-b-2 border-amber-500'
                      : 'text-amber-800 hover:text-amber-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Status bar — rendered inside the screen, above content */}
          {showStatus && <StatusBar />}

          {/* Content area */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {children}
          </div>

          {/* Command input — rendered inside the screen, below content */}
          {showInput && <CommandInput />}
        </div>
      </div>
    </div>
  )
}
