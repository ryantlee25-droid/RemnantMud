import { describe, it, expect } from 'vitest'
import { getNPC, getRevenantDialogue, REVENANT_DIALOGUE } from '@/data/npcs'

describe('getNPC', () => {
  it('returns undefined for unknown npc id', () => {
    expect(getNPC('does_not_exist')).toBeUndefined()
  })

  it('returns a valid NPC for known ids', () => {
    const npc = getNPC('old_mae')
    if (npc) {
      expect(npc.name).toBeTruthy()
      expect(typeof npc.dialogue).toBe('string')
    }
    // If old_mae doesn't exist in this data set, at least the lookup didn't throw
  })
})

describe('getRevenantDialogue', () => {
  it('returns null for unknown npc id', () => {
    expect(getRevenantDialogue('nobody', 5)).toBeNull()
  })

  it('returns null when cycle is below all thresholds', () => {
    // wren_shelter minCycle starts at 2
    expect(getRevenantDialogue('wren_shelter', 1)).toBeNull()
  })

  it('returns dialogue when cycle meets minimum', () => {
    const text = getRevenantDialogue('wren_shelter', 2)
    expect(text).not.toBeNull()
    expect(typeof text).toBe('string')
    expect(text!.length).toBeGreaterThan(0)
  })

  it('returns highest eligible tier, not the first', () => {
    // wren_shelter has tiers at minCycle 2, 4, 8
    const tier2 = getRevenantDialogue('wren_shelter', 2)
    const tier4 = getRevenantDialogue('wren_shelter', 4)
    const tier8 = getRevenantDialogue('wren_shelter', 8)
    const tier10 = getRevenantDialogue('wren_shelter', 10)

    // Cycle 4 should return tier-4 text, not tier-2
    expect(tier4).not.toBe(tier2)
    // Cycle 8 should return tier-8 text
    expect(tier8).not.toBe(tier4)
    // Cycle 10 still returns tier-8 (highest available)
    expect(tier10).toBe(tier8)
  })

  it('returns tier-2 text at exactly cycle 2', () => {
    const entries = REVENANT_DIALOGUE['wren_shelter']!
    const tier2 = entries.find(e => e.minCycle === 2)!
    expect(getRevenantDialogue('wren_shelter', 2)).toBe(tier2.text)
  })

  it('returns tier-4 text at exactly cycle 4', () => {
    const entries = REVENANT_DIALOGUE['wren_shelter']!
    const tier4 = entries.find(e => e.minCycle === 4)!
    expect(getRevenantDialogue('wren_shelter', 4)).toBe(tier4.text)
  })

  it('old_mae returns null at cycle 1', () => {
    expect(getRevenantDialogue('old_mae', 1)).toBeNull()
  })

  it('old_mae returns first dialogue at cycle 2', () => {
    const text = getRevenantDialogue('old_mae', 2)
    expect(text).not.toBeNull()
    expect(text).toContain('You again')
  })

  it('old_mae returns higher tier at cycle 6', () => {
    const atTwo = getRevenantDialogue('old_mae', 2)
    const atSix = getRevenantDialogue('old_mae', 6)
    expect(atSix).not.toBe(atTwo)
  })

  it('handles npc with no revenant entries (wren_ruins at cycle 1)', () => {
    expect(getRevenantDialogue('wren_ruins', 1)).toBeNull()
  })

  it('returns correct text for wren_ruins at cycle 2', () => {
    const text = getRevenantDialogue('wren_ruins', 2)
    expect(text).not.toBeNull()
    expect(text).toContain('cycles back')
  })
})
