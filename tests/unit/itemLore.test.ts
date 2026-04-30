import { describe, it, expect } from 'vitest'
import { ITEMS } from '@/data/items'

const BANNED_WORDS = ['magical', 'enchanted', 'mystical', 'ancient power', 'imbued']
const RARE_RARITIES = new Set(['rare', 'epic', 'legendary'])

describe('Gear Lore — H11 invariants', () => {
  const rareItems = Object.values(ITEMS).filter(
    (item) => item.rarity !== undefined && RARE_RARITIES.has(item.rarity as string)
  )

  it('every rare/epic/legendary item has a non-empty loreText', () => {
    const missing = rareItems.filter(
      (item) => !item.loreText || item.loreText.trim().length === 0
    )
    if (missing.length > 0) {
      const ids = missing.map((i) => i.id).join(', ')
      throw new Error(
        `${missing.length} rare+ item(s) missing loreText: ${ids}`
      )
    }
    expect(missing).toHaveLength(0)
  })

  it('no loreText contains banned words', () => {
    const violations: string[] = []
    for (const item of rareItems) {
      if (!item.loreText) continue
      for (const word of BANNED_WORDS) {
        if (item.loreText.toLowerCase().includes(word.toLowerCase())) {
          violations.push(`item '${item.id}' contains banned word '${word}'`)
        }
      }
    }
    if (violations.length > 0) {
      throw new Error(`Banned word violations:\n${violations.join('\n')}`)
    }
    expect(violations).toHaveLength(0)
  })

  it('loreText length is at least 50 characters on all rare+ items', () => {
    const tooShort = rareItems.filter(
      (item) => item.loreText !== undefined && item.loreText.length < 50
    )
    if (tooShort.length > 0) {
      const ids = tooShort.map((i) => `${i.id} (${i.loreText?.length})`).join(', ')
      throw new Error(`loreText too short on: ${ids}`)
    }
    expect(tooShort).toHaveLength(0)
  })
})
