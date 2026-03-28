'use client'

// ============================================================
// Sidebar.tsx — Inventory + stats panel, toggled with Tab key
// ============================================================

import { useState, useEffect } from 'react'
import { useGame } from '@/lib/gameContext'
import { statModifier } from '@/lib/dice'
import { parseCommand } from '@/lib/parser'
import { THEMES, THEME_KEY, loadTheme, saveTheme, type ThemeId } from '@/lib/theme'

const INV_HINT_KEY = 'remnant_seen_inv_hint'

function modStr(n: number): string {
  if (n > 0) return `+${n}`
  return String(n)
}

export default function Sidebar() {
  const { state, engine } = useGame()
  const { player, inventory } = state
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [shouldPulse, setShouldPulse] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('amber')

  // Check if INV button should pulse (hint not yet seen)
  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(INV_HINT_KEY)) {
      setShouldPulse(true)
    }
  }, [])

  // Load current theme
  useEffect(() => {
    setCurrentTheme(loadTheme())

    function handleThemeChange(e: Event) {
      const ce = e as CustomEvent<ThemeId>
      setCurrentTheme(ce.detail)
    }
    window.addEventListener('remnant-theme-change', handleThemeChange)
    return () => window.removeEventListener('remnant-theme-change', handleThemeChange)
  }, [])

  function handleThemeSelect(id: ThemeId) {
    saveTheme(id)
    setCurrentTheme(id)
    window.dispatchEvent(new CustomEvent('remnant-theme-change', { detail: id }))
  }

  async function handleSave() {
    setSaving(true)
    await engine.executeAction(parseCommand('save'))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  if (!player) return null

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => {
          setOpen((prev) => !prev)
          setShouldPulse(false)
        }}
        className={`absolute top-2 right-2 z-20 bg-black border border-amber-700 text-amber-400 font-mono text-xs px-2 py-1 hover:bg-amber-900 transition-colors${shouldPulse ? ' inv-pulse' : ''}`}
        aria-label="Toggle inventory and stats"
      >
        [INV]
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute top-0 right-0 z-10 h-full w-72 bg-black border-l border-amber-900 overflow-y-auto font-mono text-sm text-amber-300 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-amber-500 font-bold">INVENTORY &amp; STATS</span>
            <button
              onClick={() => setOpen(false)}
              className="text-amber-700 hover:text-amber-400 text-xs"
            >
              [CLOSE]
            </button>
          </div>

          {/* Stats */}
          <div className="mb-4">
            <div className="text-amber-600 text-xs mb-2 uppercase tracking-widest">Stats</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>HP</span>
                <span className="text-amber-400">{player.hp}/{player.maxHp}</span>
              </div>
              {(['vigor', 'grit', 'reflex', 'wits', 'presence', 'shadow'] as const).map((stat) => (
                <div key={stat} className="flex justify-between">
                  <span className="capitalize">{stat}</span>
                  <span className="text-amber-400">
                    {player[stat]} ({modStr(statModifier(player[stat]))})
                  </span>
                </div>
              ))}
              <div className="flex justify-between">
                <span>Level</span>
                <span className="text-amber-400">{player.level}</span>
              </div>
              <div className="flex justify-between">
                <span>XP</span>
                <span className="text-amber-400">{player.xp}</span>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div>
            <div className="text-amber-600 text-xs mb-2 uppercase tracking-widest">Inventory</div>
            {inventory.length === 0 ? (
              <div className="text-amber-600 text-xs italic">Nothing.</div>
            ) : (
              <div className="space-y-1">
                {inventory.map((ii) => (
                  <div key={ii.id} className="flex justify-between items-center">
                    <span className={ii.equipped ? 'text-amber-200' : 'text-amber-400'}>
                      {ii.item.name}
                      {ii.quantity > 1 && <span className="text-amber-700"> x{ii.quantity}</span>}
                    </span>
                    {ii.equipped && (
                      <span className="text-xs text-amber-600">[eq]</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stash */}
          <div className="mt-4 border-t border-amber-900 pt-3">
            <div className="text-amber-600 text-xs mb-2 uppercase tracking-widest">
              Stash ({state.stash.length}/20)
            </div>
            {state.stash.length === 0 ? (
              <div className="text-amber-600 text-xs italic">Empty. Use "stash [item]" to store items.</div>
            ) : (
              <div className="space-y-1">
                {state.stash.map((si) => (
                  <div key={si.id} className="flex justify-between items-center">
                    <span className="text-amber-500 text-xs">{si.item.name}</span>
                    {si.quantity > 1 && <span className="text-amber-600 text-xs">x{si.quantity}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Display / Theme */}
          <div className="mt-4 border-t border-amber-900 pt-3">
            <div className="text-amber-600 text-xs mb-2 uppercase tracking-widest">Display</div>
            <div className="flex items-center gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`w-4 h-4 rounded-full border-2 transition-colors ${
                    currentTheme === theme.id
                      ? 'border-amber-400 brightness-125'
                      : 'border-amber-900 hover:border-amber-700'
                  }`}
                  style={{ backgroundColor: theme.sampleColor }}
                  aria-label={`Switch to ${theme.name} theme`}
                  title={theme.name}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-amber-900 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs border border-amber-800 text-amber-500 px-2 py-1 hover:bg-amber-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              {saved && (
                <span className="text-amber-500 text-xs animate-pulse">Saved.</span>
              )}
            </div>
            <span className="text-amber-600 text-xs">Tab to close</span>
          </div>
        </div>
      )}
    </>
  )
}
