'use client'

// ============================================================
// InventoryTab.tsx — Inventory + stash + theme picker + save
// Migrated from Sidebar.tsx content
// ============================================================

import { useState, useEffect } from 'react'
import { useGame } from '@/lib/gameContext'
import { parseCommand } from '@/lib/parser'
import { THEMES, loadTheme, saveTheme, type ThemeId } from '@/lib/theme'

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export default function InventoryTab() {
  const { state, engine } = useGame()
  const { player, inventory } = state
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('amber')

  // Load current theme on mount and listen for changes
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
    setSaveError(false)
    try {
      await engine.executeAction(parseCommand('save'))
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch {
      setSaveError(true)
      setTimeout(() => setSaveError(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (!player) return null

  return (
    <div className="overflow-y-auto flex-1 font-mono text-sm text-amber-400 p-2 space-y-2">
      {/* INVENTORY */}
      <section>
        <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-1">Inventory</h2>
        {inventory.length === 0 ? (
          <div className="text-amber-600 text-xs italic">Nothing.</div>
        ) : (
          <div className="space-y-1">
            {inventory.map((ii) => (
              <div key={ii.id} className="flex justify-between items-center">
                <span className={ii.equipped ? 'text-amber-200' : 'text-amber-400'}>
                  {ii.quantity > 1 ? `${ii.item.name} x${ii.quantity}` : ii.item.name}
                </span>
                {ii.equipped && (
                  <span className="text-xs text-amber-600">[eq]</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* STASH */}
      <section className="border-t border-amber-900 pt-1">
        <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-1">
          Stash ({state.stash.length}/20)
        </h2>
        {state.stash.length === 0 ? (
          <div className="text-amber-600 text-xs italic">
            Empty. Use &quot;stash [item]&quot; to store items.
          </div>
        ) : (
          <div className="space-y-1">
            {state.stash.map((si) => (
              <div key={si.id} className="flex justify-between items-center">
                <span className="text-amber-500 text-xs">
                  {si.quantity > 1 ? `${si.item.name} x${si.quantity}` : si.item.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* DISPLAY / THEME */}
      <section className="border-t border-amber-900 pt-1">
        <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-1">Display</h2>
        <div className="flex items-center gap-2">
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
      </section>

      {/* SAVE */}
      <section className="border-t border-amber-900 pt-1">
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
          {saveError && (
            <span className="text-red-500 text-xs animate-pulse">Save failed.</span>
          )}
        </div>
      </section>
    </div>
  )
}
