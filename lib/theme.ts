// ============================================================
// theme.ts — Color scheme definitions
// Themes work via CSS filter on the game root wrapper.
// No component changes needed — all amber classes shift together.
// ============================================================

export type ThemeId = 'amber' | 'green' | 'blue'

export interface Theme {
  id: ThemeId
  name: string
  tagline: string
  filter: string       // CSS filter applied to game root
  sampleColor: string  // hex for preview swatch
}

export const THEMES: Theme[] = [
  {
    id: 'amber',
    name: 'Amber',
    tagline: 'Warm phosphor. The color of kept promises.',
    filter: 'none',
    sampleColor: '#fbbf24',
  },
  {
    id: 'green',
    name: 'Green',
    tagline: 'Cold phosphor. The color of 3am decisions.',
    filter: 'hue-rotate(88deg) saturate(130%) brightness(105%)',
    sampleColor: '#4ade80',
  },
  {
    id: 'blue',
    name: 'Blue',
    tagline: 'Signal noise. The color of transmission.',
    filter: 'hue-rotate(182deg) saturate(85%) brightness(98%)',
    sampleColor: '#60a5fa',
  },
]

export const THEME_KEY = 'remnant_theme'

export function loadTheme(): ThemeId {
  if (typeof window === 'undefined') return 'amber'
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'amber' || stored === 'green' || stored === 'blue') return stored
  return 'amber'
}

export function saveTheme(id: ThemeId): void {
  if (typeof window !== 'undefined') localStorage.setItem(THEME_KEY, id)
}

export function getTheme(id: ThemeId): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]!
}
