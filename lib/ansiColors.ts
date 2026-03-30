// ============================================================
// ansiColors.ts — ANSI 16-color palette for MUD terminal text
// Single source of truth for all game text coloring.
// ============================================================

// --- Semantic tag colors (used by Terminal.tsx parseRichText) ---
export const TAG_COLOR: Record<string, string> = {
  item:      'text-yellow-400',
  npc:       'text-cyan-400',
  enemy:     'text-red-500',
  exit:      'text-green-400',
  keyword:   'text-white',
  currency:  'text-yellow-300',
  condition: 'text-purple-400',
  trait:     'text-blue-400',
}

// --- Message type colors (used by Terminal.tsx messageColor) ---
export const MESSAGE_COLOR: Record<string, string> = {
  narrative: 'text-gray-300',
  combat:    'text-red-400',
  system:    'text-cyan-300',
  error:     'text-red-500',
  echo:      'text-gray-500',
  death:     'text-red-400',
  ending:    'text-purple-300',
  creation:  'text-cyan-300',
}

// --- Color utility for HP bar rendering ---
export function hpColor(current: number, max: number): string {
  if (max <= 0) return 'text-gray-500'
  const ratio = current / max
  if (ratio > 0.5) return 'text-green-400'
  if (ratio > 0.25) return 'text-yellow-400'
  return 'text-red-500'
}
