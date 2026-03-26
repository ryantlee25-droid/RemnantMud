'use client'

// ============================================================
// ThemeLoader.tsx — Reads saved theme and applies CSS filter to body.
// Also listens for 'remnant-theme-change' events so in-game
// theme switching works without a page reload.
// ============================================================

import { useEffect } from 'react'
import { loadTheme, getTheme } from '@/lib/theme'

function applyFilter(filter: string) {
  if (typeof document !== 'undefined') {
    document.body.style.filter = filter === 'none' ? '' : filter
  }
}

export default function ThemeLoader() {
  useEffect(() => {
    // Apply on mount
    applyFilter(getTheme(loadTheme()).filter)

    // Listen for in-game theme changes
    function onThemeChange(e: Event) {
      const id = (e as CustomEvent<string>).detail
      applyFilter(getTheme(id as Parameters<typeof getTheme>[0]).filter)
    }
    window.addEventListener('remnant-theme-change', onThemeChange)
    return () => window.removeEventListener('remnant-theme-change', onThemeChange)
  }, [])

  return null
}
