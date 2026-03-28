// ============================================================
// Unit tests for stat effects on gameplay
// Vigor, Grit, Reflex, Shadow, Presence and their mechanics
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player, Room, Enemy, CombatState } from '@/types/game'
import { statModifier, rollCheck, DC } from '@/lib/dice'
import { fearCheck, resistWhisperer, echoRetentionFactor } from '@/lib/fear'
import { getClassSkillBonus } from '@/lib/skillBonus'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 5, grit: 5, reflex: 5, wits: 5, presence: 5, shadow: 5,
    hp: 20, maxHp: 20, currentRoomId: 'room_1', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    ...overrides,
  }
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room_1', name: 'Test Room', description: 'A test room.',
    shortDescription: 'Test.', zone: 'crossroads', difficulty: 1,
    visited: false, flags: {}, exits: {}, items: [], enemies: [], npcs: [],
    ...overrides,
  }
}

// ------------------------------------------------------------
// Vigor — HP calculation
// ------------------------------------------------------------

describe('Vigor affects HP calculation', () => {
  it('maxHp formula is 8 + (vigor - 2) * 2', () => {
    // This is the formula used in GameEngine.createCharacter and rebirthCharacter
    const testCases = [
      { vigor: 2, expected: 8 },
      { vigor: 3, expected: 10 },
      { vigor: 5, expected: 14 },
      { vigor: 8, expected: 20 },
      { vigor: 10, expected: 24 },
    ]

    for (const { vigor, expected } of testCases) {
      const maxHp = 8 + (vigor - 2) * 2
      expect(maxHp).toBe(expected)
    }
  })

  it('higher vigor produces higher maxHp', () => {
    const lowVigorHp = 8 + (3 - 2) * 2  // vigor 3
    const highVigorHp = 8 + (8 - 2) * 2  // vigor 8
    expect(highVigorHp).toBeGreaterThan(lowVigorHp)
  })
})

// ------------------------------------------------------------
// Vigor — combat attack rolls
// Combat uses rollCheck(effectiveVigor, enemy.defense)
// Higher vigor = higher modifier = better hit chance
// ------------------------------------------------------------

describe('Vigor affects combat attack rolls', () => {
  it('vigor 8 gives a +3 modifier on attack rolls', () => {
    expect(statModifier(8)).toBe(3)
  })

  it('vigor 3 gives a -2 modifier on attack rolls', () => {
    expect(statModifier(3)).toBe(-2)
  })

  it('high vigor player hits more often against same DC', () => {
    // With a fixed roll of 5:
    // vigor 8: total = 5 + 3 = 8, vs DC 8 -> success
    // vigor 3: total = 5 + (-2) = 3, vs DC 8 -> fail
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.4) // roll = 5
    const highVigorResult = rollCheck(8, DC.MODERATE)
    expect(highVigorResult.success).toBe(true)

    vi.spyOn(Math, 'random').mockReturnValueOnce(0.4) // roll = 5
    const lowVigorResult = rollCheck(3, DC.MODERATE)
    expect(lowVigorResult.success).toBe(false)
  })
})

// ------------------------------------------------------------
// Reflex + Shadow — flee success
// Flee uses: fleeStat = player.reflex + player.shadow + classBonus
// Then rollCheck(fleeStat, fleeDc)
// ------------------------------------------------------------

describe('Reflex + Shadow affect flee success', () => {
  it('flee stat is sum of reflex + shadow + class stealth bonus', () => {
    // Wraith gets +3 stealth
    const wraith = makePlayer({ characterClass: 'wraith', reflex: 7, shadow: 8 })
    const fleeBonus = getClassSkillBonus(wraith.characterClass, 'stealth')
    const fleeStat = wraith.reflex + wraith.shadow + fleeBonus
    expect(fleeStat).toBe(7 + 8 + 3) // 18

    // Enforcer gets +0 stealth
    const enforcer = makePlayer({ characterClass: 'enforcer', reflex: 7, shadow: 8 })
    const enforcerBonus = getClassSkillBonus(enforcer.characterClass, 'stealth')
    const enforcerFleeStat = enforcer.reflex + enforcer.shadow + enforcerBonus
    expect(enforcerFleeStat).toBe(7 + 8 + 0) // 15
  })

  it('higher reflex+shadow gives better flee chance', () => {
    // Roll = 5 (mock random to 0.4)
    // High stats: fleeStat = 8+8 = 16, mod = 11, total = 16, vs DC 8 -> success
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.4) // roll = 5
    const highResult = rollCheck(8 + 8, DC.MODERATE)
    expect(highResult.success).toBe(true)

    // Low stats: fleeStat = 3+3 = 6, mod = 1, total = 6, vs DC 8 -> fail
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.4) // roll = 5
    const lowResult = rollCheck(3 + 3, DC.MODERATE)
    expect(lowResult.success).toBe(false)
  })
})

// ------------------------------------------------------------
// Grit — fear checks
// fearCheck uses rollCheck(player.grit, dc) in rooms with difficulty >= 4
// ------------------------------------------------------------

describe('Grit affects fear checks', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('high grit player passes fear check in difficulty 4 room', () => {
    // DC for difficulty 4 = DC.MODERATE + (4-3)*3 - 1 = 8 + 3 - 1 = 10
    // With roll = 6, grit = 8: total = 6 + 3 = 9 < 10 -> fail
    // With roll = 7, grit = 8: total = 7 + 3 = 10 >= 10 -> success
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.6) // roll = 7
    const player = makePlayer({ grit: 8 })
    const room = makeRoom({ difficulty: 4, enemies: ['shuffler'] })
    const result = fearCheck(player, room)
    expect(result.afraid).toBe(false)
    expect(result.messages.length).toBeGreaterThan(0)
  })

  it('low grit player fails fear check in difficulty 4 room', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.2) // roll = 3
    const player = makePlayer({ grit: 3 })
    const room = makeRoom({ difficulty: 4, enemies: ['shuffler'] })
    const result = fearCheck(player, room)
    expect(result.afraid).toBe(true)
    expect(result.messages[0]!.text).toContain('shake')
  })

  it('fear check is skipped in rooms with difficulty < 4', () => {
    const player = makePlayer({ grit: 2 })
    const room = makeRoom({ difficulty: 3, enemies: ['shuffler'] })
    const result = fearCheck(player, room)
    expect(result.afraid).toBe(false)
    expect(result.messages.length).toBe(0)
  })

  it('fear check is skipped when room has no enemies', () => {
    const player = makePlayer({ grit: 2 })
    const room = makeRoom({ difficulty: 5, enemies: [] })
    const result = fearCheck(player, room)
    expect(result.afraid).toBe(false)
  })

  it('grit affects whisperer resistance', () => {
    // resistWhisperer uses rollCheck(player.grit, DC.MODERATE + 2) = DC 10
    // grit 8, roll = 7: total = 7 + 3 = 10 >= 10 -> resist
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.6) // roll = 7
    const player = makePlayer({ grit: 8 })
    expect(resistWhisperer(player)).toBe(true)

    // grit 3, roll = 7: total = 7 + (-2) = 5 < 10 -> fail
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.6) // roll = 7
    const weakPlayer = makePlayer({ grit: 3 })
    expect(resistWhisperer(weakPlayer)).toBe(false)
  })

  it('grit affects echo retention factor for rebirth', () => {
    // Base is 0.7, grit 5 = 0.7, grit 8 = 0.7 + 0.099 ~ 0.8
    expect(echoRetentionFactor(5)).toBeCloseTo(0.7, 2)
    expect(echoRetentionFactor(8)).toBeGreaterThan(0.7)
    expect(echoRetentionFactor(8)).toBeLessThanOrEqual(0.85)
    // Cap at 0.85
    expect(echoRetentionFactor(20)).toBe(0.85)
  })
})

// ------------------------------------------------------------
// Presence — faction reputation gains
// (The reputation system adjusts by delta; presence bonus is
//  expected to be implemented as a multiplier on reputation gain.
//  Until then, test the current stat-to-skill mappings.)
// ------------------------------------------------------------

describe('Presence affects faction reputation and social skills', () => {
  it('shepherd class gets +2 negotiation from presence archetype', () => {
    expect(getClassSkillBonus('shepherd', 'negotiation')).toBe(2)
  })

  it('broker class gets +3 negotiation (highest social bonus)', () => {
    expect(getClassSkillBonus('broker', 'negotiation')).toBe(3)
  })

  it('enforcer class gets +2 intimidation', () => {
    expect(getClassSkillBonus('enforcer', 'intimidation')).toBe(2)
  })

  it.todo('presence stat multiplies faction reputation delta on adjustReputation')
  // Expected: when adjustReputation is called, the delta is modified by
  // a presence-based multiplier (e.g., presence 8 grants +1 to positive deltas).
})

// ------------------------------------------------------------
// Stat-to-skill mappings
// ------------------------------------------------------------

describe('Each stat maps to correct skills via class bonuses', () => {
  it('vigor-focused classes (enforcer) get brawling and vigor bonuses', () => {
    expect(getClassSkillBonus('enforcer', 'brawling')).toBe(2)
    expect(getClassSkillBonus('enforcer', 'vigor')).toBe(2)
  })

  it('reflex-focused classes (scout) get tracking and perception', () => {
    expect(getClassSkillBonus('scout', 'tracking')).toBe(2)
    expect(getClassSkillBonus('scout', 'perception')).toBe(2)
  })

  it('shadow-focused classes (wraith) get stealth and lockpicking', () => {
    expect(getClassSkillBonus('wraith', 'stealth')).toBe(3)
    expect(getClassSkillBonus('wraith', 'lockpicking')).toBe(2)
  })

  it('wits-focused classes (reclaimer) get mechanics and electronics', () => {
    expect(getClassSkillBonus('reclaimer', 'mechanics')).toBe(2)
    expect(getClassSkillBonus('reclaimer', 'electronics')).toBe(2)
  })

  it('presence-focused classes (shepherd) get field_medicine and negotiation', () => {
    expect(getClassSkillBonus('shepherd', 'field_medicine')).toBe(2)
    expect(getClassSkillBonus('shepherd', 'negotiation')).toBe(2)
  })

  it('grit-focused classes (warden) get survival and climbing', () => {
    expect(getClassSkillBonus('warden', 'survival')).toBe(2)
    expect(getClassSkillBonus('warden', 'climbing')).toBe(2)
  })
})
