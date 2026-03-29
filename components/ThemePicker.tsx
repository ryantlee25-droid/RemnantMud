'use client'

// ============================================================
// ThemePicker.tsx — Color scheme selection (shown once at start)
// ============================================================

import { useState } from 'react'
import { THEMES, type ThemeId, type Theme } from '@/lib/theme'

interface ThemePickerProps {
  onSelect: (themeId: ThemeId) => void
}

export default function ThemePicker({ onSelect }: ThemePickerProps) {
  const [hovered, setHovered] = useState<ThemeId | null>(null)
  const [selected, setSelected] = useState<ThemeId>('amber')

  const preview = hovered ?? selected

  function handleConfirm() {
    onSelect(selected)
  }

  return (
    <div
      className="flex flex-col items-start flex-1 overflow-y-auto font-mono p-4"
      style={{ filter: THEMES.find((t) => t.id === preview)?.filter ?? 'none' }}
    >
      <div className="w-full max-w-lg text-amber-400">
        <div className="mb-8">
          <div className="text-amber-600 text-xs uppercase tracking-widest mb-1">
            The Remnant — Display
          </div>
          <div className="text-2xl text-amber-300">Choose your signal.</div>
          <div className="text-amber-600 text-xs mt-1">
            This can be changed later in the inventory panel.
          </div>
        </div>

        {/* Preview text */}
        <div className="mb-8 border border-amber-900 p-4 text-sm space-y-1">
          <div className="text-amber-300">Leaking Utility Corridor</div>
          <div className="text-amber-600 text-xs">A narrow concrete passage, water-stained and silent.</div>
          <div className="text-amber-500 text-xs">Exits: east, west.</div>
          <div className="text-red-400 text-xs">A shuffler is here.</div>
        </div>

        {/* Theme options */}
        <div className="space-y-3 mb-8">
          {THEMES.map((theme: Theme) => (
            <button
              key={theme.id}
              onClick={() => setSelected(theme.id)}
              onMouseEnter={() => setHovered(theme.id)}
              onMouseLeave={() => setHovered(null)}
              className={`w-full text-left border px-4 py-3 transition-colors ${
                selected === theme.id
                  ? 'border-amber-500 bg-amber-950'
                  : 'border-amber-900 hover:border-amber-700 hover:bg-amber-950'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Color swatch */}
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 border border-amber-800"
                  style={{ backgroundColor: theme.sampleColor,
                           filter: THEMES.find((t) => t.id === theme.id)?.filter ?? 'none' }}
                />
                <div>
                  <div className="text-amber-300 text-sm">{theme.name}</div>
                  <div className="text-amber-700 text-xs">{theme.tagline}</div>
                </div>
                {selected === theme.id && (
                  <span className="ml-auto text-amber-500 text-xs">selected</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleConfirm}
          className="w-full border border-amber-600 text-amber-400 py-2 text-sm hover:bg-amber-900 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
