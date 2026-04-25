// ============================================================
// Real combat math tests — no mocks on @/lib/combat
// ============================================================

import { describe, it, expect, vi } from 'vitest'
import type { Player, Enemy, CombatState, Item } from '@/types/game'
import { startCombat, playerAttack, enemyAttack, computeArmorReduction, checkEnemyFlee, compressLog } from '@/lib/combat'
import { statModifier, DC } from '@/lib/dice'
import { ENEMIES } from '@/data/enemies'

// ------------------------------------------------------------
// Fixtures
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 7, grit: 5, reflex: 5, wits: 5, presence: 4, shadow: 3,
    hp: 20, maxHp: 20, currentRoomId: 'room_1', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    ...overrides,
  }
}

function makeCombatState(enemy: Enemy, overrides: Partial<CombatState> = {}): CombatState {
  return {
    enemy, enemyHp: enemy.hp, playerGoesFirst: true, turn: 1, active: true,
    playerConditions: [], enemyConditions: [], abilityUsed: false,
    defendingThisTurn: false, waitingBonus: 0,
    ...overrides,
  }
}

const shuffler = ENEMIES['shuffler']!
const remnant  = ENEMIES['remnant']!

// ------------------------------------------------------------

describe('combat math (real, not mocked)', () => {

  describe('damage calculation', () => {
    it('base damage scales with weapon stat (vigor modifier adds to roll)', () => {
      // vigor 7 → modifier +2; vigor 5 → modifier 0
      expect(statModifier(7)).toBe(2)
      expect(statModifier(5)).toBe(0)
      expect(statModifier(3)).toBe(-2)
    })

    it('defense reduces hit chance (higher defense = harder to hit)', () => {
      const player = makePlayer({ vigor: 10 })  // modifier +5, always near-guaranteed hit
      const lowDefState  = makeCombatState({ ...shuffler, defense: 3  })  // DC 3
      const highDefState = makeCombatState({ ...shuffler, defense: 18 })  // DC 18

      let lowHits = 0, highHits = 0
      for (let i = 0; i < 200; i++) {
        const { result: low  } = playerAttack(player, lowDefState,  [2, 4])
        const { result: high } = playerAttack(player, highDefState, [2, 4])
        if (low.hit)  lowHits++
        if (high.hit) highHits++
      }
      expect(lowHits).toBeGreaterThan(highHits)
    })

    it('critical hits apply 1.5x multiplier (ceiling)', () => {
      // Force a critical by mocking Math.random to roll a 10 (roll1d10 = floor(rand*10)+1 = 10 when rand >= 0.9)
      vi.spyOn(Math, 'random').mockReturnValue(0.95) // d10 = 10 → crit; damage roll also pinned
      const player = makePlayer({ vigor: 10 })
      const state = makeCombatState(shuffler)
      const { result } = playerAttack(player, state, [4, 4])  // fixed damage = 4 + vigor bonus
      expect(result.critical).toBe(true)
      expect(result.hit).toBe(true)
      // damage = rollDamage([4,4]) + max(0, statModifier(10)) = 4 + 5 = 9; crit = ceil(9*1.5) = 14
      expect(result.damage).toBe(14)
      vi.restoreAllMocks()
    })

    it('minimum damage on a hit is 1 (never 0 or negative)', () => {
      // Give a player so weak they'd calculate negative raw damage, but hit should still deal ≥1
      vi.spyOn(Math, 'random').mockReturnValue(0.95) // force natural 10 = crit + hit
      const player = makePlayer({ vigor: 1 }) // modifier = -4
      const state = makeCombatState(shuffler)
      const { result } = playerAttack(player, state, [1, 1])
      if (result.hit) {
        expect(result.damage).toBeGreaterThanOrEqual(1)
      }
      vi.restoreAllMocks()
    })
  })

  describe('hit chance', () => {
    it('hit chance is bounded — fumble (roll 1) always misses, crit (roll 10) always hits', () => {
      // Fumble: roll = 1, always miss
      vi.spyOn(Math, 'random').mockReturnValue(0.0) // d10 = 1
      const player = makePlayer({ vigor: 10 })
      const state = makeCombatState(shuffler)
      const { result: fumbled } = playerAttack(player, state, [2, 4])
      expect(fumbled.fumble).toBe(true)
      expect(fumbled.hit).toBe(false)

      // Critical: roll = 10, always hits
      vi.spyOn(Math, 'random').mockReturnValue(0.95)
      const { result: crit } = playerAttack(player, makeCombatState(shuffler), [2, 4])
      expect(crit.critical).toBe(true)
      expect(crit.hit).toBe(true)
      vi.restoreAllMocks()
    })
  })

  describe('combat resolution', () => {
    it('startCombat initializes enemyHp from enemy.hp', () => {
      const player = makePlayer()
      const state = startCombat(player, shuffler)
      expect(state.enemyHp).toBe(shuffler.hp)
      expect(state.active).toBe(true)
    })

    it('player turn reduces enemy HP', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.95) // guaranteed hit/crit
      const player = makePlayer({ vigor: 10 })
      const state = makeCombatState(shuffler)
      const { newState } = playerAttack(player, state, [2, 4])
      expect(newState.enemyHp).toBeLessThan(shuffler.hp)
      vi.restoreAllMocks()
    })

    it('enemy turn deals positive damage on a hit', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.75) // d10 = 8; 8 + attack(1) = 9 >= DC.MODERATE(8) → hit
      const player = makePlayer()
      const state = makeCombatState(remnant) // remnant attack=2 for higher hit certainty
      const { damage } = enemyAttack(player, state)
      expect(damage).toBeGreaterThan(0)
      vi.restoreAllMocks()
    })

    it('combat ends when enemy HP reaches 0', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.95) // guaranteed crit hit
      const player = makePlayer({ vigor: 10 })
      // Enemy with 1 HP so one hit is enough
      const weakEnemy: Enemy = { ...shuffler, hp: 1, maxHp: 1 }
      const state = makeCombatState(weakEnemy)
      const { result, newState } = playerAttack(player, state, [4, 4])
      expect(result.enemyDefeated).toBe(true)
      expect(newState.enemyHp).toBe(0)
      expect(newState.active).toBe(false)
      vi.restoreAllMocks()
    })

    it('XP awarded matches enemy definition', () => {
      expect(shuffler.xp).toBe(12)
      expect(remnant.xp).toBe(25)
      // XP scales with level: remnant (harder) awards more than shuffler
      expect(remnant.xp).toBeGreaterThan(shuffler.xp)
    })

  })

  // ------------------------------------------------------------------
  // Miss-reason buckets (H2: miss messaging)
  // ------------------------------------------------------------------
  describe('miss-reason buckets', () => {
    // Helper weapon for miss tests — gives a named weapon in messages
    const makeTestWeapon = (overrides: Partial<Item> = {}): Item => ({
      id: 'test-blade',
      name: 'rusty blade',
      description: 'A test weapon.',
      type: 'weapon',
      weight: 2,
      damage: 3,
      value: 5,
      ...overrides,
    })

    it('glanced — fumble (natural 1) emits overextend message', () => {
      // Math.random() = 0.0 → roll1d10 = 1 → fumble
      vi.spyOn(Math, 'random').mockReturnValue(0.0)
      const player = makePlayer({ vigor: 5 })
      const state = makeCombatState(shuffler)
      const { result } = playerAttack(player, state, [2, 4], makeTestWeapon())
      expect(result.fumble).toBe(true)
      expect(result.hit).toBe(false)
      const text = result.messages.map(m => m.text).join(' ')
      expect(text).toContain('overextend')
      vi.restoreAllMocks()
    })

    it('glanced — barely misses (gap 1) emits overextend message', () => {
      // vigor 5 → modifier 0; defense 8 → dc 8; roll 7 → total 7; gap = 1 → glanced
      // Math.random() = 0.65 → floor(6.5) + 1 = 7
      vi.spyOn(Math, 'random').mockReturnValue(0.65)
      const player = makePlayer({ vigor: 5 })
      const enemy: Enemy = { ...shuffler, defense: 8 }
      const state = makeCombatState(enemy)
      const { result } = playerAttack(player, state, [2, 4], makeTestWeapon())
      expect(result.hit).toBe(false)
      expect(result.fumble).toBe(false)
      const text = result.messages.map(m => m.text).join(' ')
      expect(text).toContain('overextend')
      vi.restoreAllMocks()
    })

    it('dodged — small gap (gap 2) emits "twists aside" message with weapon name', () => {
      // vigor 5 → modifier 0; defense 8 → dc 8; roll 6 → total 6; gap = 2 → dodged
      // Math.random() = 0.55 → floor(5.5) + 1 = 6
      vi.spyOn(Math, 'random').mockReturnValue(0.55)
      const player = makePlayer({ vigor: 5 })
      const enemy: Enemy = { ...shuffler, defense: 8 }
      const state = makeCombatState(enemy)
      const weapon = makeTestWeapon({ name: 'iron pipe' })
      const { result } = playerAttack(player, state, [2, 4], weapon)
      expect(result.hit).toBe(false)
      expect(result.fumble).toBe(false)
      const text = result.messages.map(m => m.text).join(' ')
      expect(text).toContain('twists aside')
      expect(text).toContain('iron pipe')
      vi.restoreAllMocks()
    })

    it('armored — large gap (gap > 2) emits "rings off armor" message', () => {
      // vigor 5 → modifier 0; defense 8 → dc 8; roll 3 → total 3; gap = 5 → armored
      // Math.random() = 0.25 → floor(2.5) + 1 = 3
      vi.spyOn(Math, 'random').mockReturnValue(0.25)
      const player = makePlayer({ vigor: 5 })
      const enemy: Enemy = { ...shuffler, defense: 8 }
      const state = makeCombatState(enemy)
      const weapon = makeTestWeapon({ name: 'iron pipe' })
      const { result } = playerAttack(player, state, [2, 4], weapon)
      expect(result.hit).toBe(false)
      expect(result.fumble).toBe(false)
      const text = result.messages.map(m => m.text).join(' ')
      expect(text).toContain("rings off")
      expect(text).toContain("armor")
      vi.restoreAllMocks()
    })
  })

  // ------------------------------------------------------------------
  // Weapon-trait strike text (H2: trait flavor on hit)
  // ------------------------------------------------------------------
  describe('weapon-trait strike text', () => {
    const makeTraitWeapon = (traits: Item['weaponTraits']): Item => ({
      id: 'trait-weapon',
      name: 'serrated blade',
      description: 'A trait weapon.',
      type: 'weapon',
      weight: 2,
      damage: 3,
      value: 10,
      weaponTraits: traits,
    })

    it('vicious — bleeding applied emits red-flowers line', () => {
      // Use remnant (not shuffler — shuffler is bleeding-immune per
      // data/enemies.ts:41). Force crit hit so vicious trait fires reliably.
      vi.spyOn(Math, 'random').mockReturnValue(0.95)
      const player = makePlayer({ vigor: 10 })
      const state = makeCombatState(remnant)
      const weapon = makeTraitWeapon(['vicious'])
      const { result } = playerAttack(player, state, [2, 4], weapon)
      expect(result.hit).toBe(true)
      const text = result.messages.map(m => m.text).join(' ')
      expect(text).toContain('bleeds')
      expect(text).toContain('Red flowers')
      vi.restoreAllMocks()
    })

    it('scorching — burning applied emits heat-licks line', () => {
      // First call: Math.random() = 0.95 → roll 10 = crit hit
      // Second call (rollDamage): also 0.95 → deterministic damage
      // Third call (scorching 30% check): Math.random() = 0.1 < 0.30 → burns
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.95)   // roll1d10 → 10 (crit hit)
        .mockReturnValueOnce(0.95)   // rollDamage
        .mockReturnValueOnce(0.1)    // scorching check → fires
      const player = makePlayer({ vigor: 10 })
      const state = makeCombatState(shuffler)
      const weapon = makeTraitWeapon(['scorching'])
      const { result } = playerAttack(player, state, [2, 4], weapon)
      expect(result.hit).toBe(true)
      const text = result.messages.map(m => m.text).join(' ')
      expect(text).toContain('Heat licks')
      expect(text).toContain('flesh blackens')
      vi.restoreAllMocks()
    })

    it('draining — heal emits warmth-thread line', () => {
      // Force crit hit so draining heals 2 HP
      vi.spyOn(Math, 'random').mockReturnValue(0.95)
      const player = makePlayer({ vigor: 10 })
      const state = makeCombatState(shuffler)
      const weapon = makeTraitWeapon(['draining'])
      const { result } = playerAttack(player, state, [2, 4], weapon)
      expect(result.hit).toBe(true)
      const text = result.messages.map(m => m.text).join(' ')
      expect(text).toContain('thread of warmth')
      expect(text).toContain("vigor lessens")
      vi.restoreAllMocks()
    })

    // blessed vs Sanguine: harder to fixture (requires elder_sanguine / sanguine_feral enemy)
    // Included: force crit hit with blessed weapon vs sanguine_feral
    it('blessed — vs Sanguine enemy emits sanctified-steel line', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.95)
      const player = makePlayer({ vigor: 10 })
      const sanguineEnemy = ENEMIES['sanguine_feral']!
      const state = makeCombatState(sanguineEnemy)
      const weapon = makeTraitWeapon(['blessed'])
      const { result } = playerAttack(player, state, [2, 4], weapon)
      expect(result.hit).toBe(true)
      const text = result.messages.map(m => m.text).join(' ')
      expect(text).toContain('blessing flares')
      expect(text).toContain('sanctified steel')
      vi.restoreAllMocks()
    })
  })

  describe('computeArmorReduction', () => {
    it('flee path: defense=3, raw 10 damage → 6 (45% reduction)', () => {
      // 15% × 3 = 45% reduction; 10 × 0.55 = 5.5 → ceil = 6
      expect(computeArmorReduction(10, 3)).toBe(6)
    })

    it('flee path: defense=5, raw 10 damage → 4 (cap at 60%, 10 × 0.4 = 4)', () => {
      // 15% × 5 = 75%, capped at 60%; 10 × 0.4 = 4 → Math.max(1, ceil(4)) = 4
      expect(computeArmorReduction(10, 5)).toBe(4)
    })

    it('zero raw damage returns 0 regardless of defense (no-op for misses)', () => {
      expect(computeArmorReduction(0, 5)).toBe(0)
    })

    it('1-damage hit always deals at least 1 (Math.max floor; ceil already guards too)', () => {
      // raw=1 with cap-defense: 1 * 0.4 = 0.4, ceil → 1. Pins the minimum-1
      // contract regardless of whether ceil or floor is used internally.
      expect(computeArmorReduction(1, 5)).toBe(1)
      expect(computeArmorReduction(1, 10)).toBe(1)
    })
  })

  // ------------------------------------------------------------------
  // H4: Enemy crit, flee, and log compression
  // ------------------------------------------------------------------
  describe('enemy critChance', () => {
    it('crit does NOT fire when random is above critChance threshold', () => {
      // enemy critChance=0.05; Math.random returns 0.75 for d10 hit-check (roll 8, hits remnant)
      // then 0.5 for rollDamage, then 0.99 for critChance check (> 0.05 → no crit)
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.75)   // roll1d10 → 8 (hit)
        .mockReturnValueOnce(0.5)    // rollDamage
        .mockReturnValueOnce(0.99)   // critChance check → no crit (0.99 > 0.05)
      const player = makePlayer()
      const enemy: Enemy = { ...shuffler, critChance: 0.05 }
      const state = makeCombatState(enemy)
      const { messages } = enemyAttack(player, state)
      const text = messages.map(m => m.text).join(' ')
      expect(text).not.toContain('vital spot')
      vi.restoreAllMocks()
    })

    it('crit fires when random is below critChance threshold', () => {
      // enemy critChance=0.5; Math.random returns 0.75 for d10 hit-check (roll 8, non-nat-10),
      // then 0.5 for rollDamage, then 0.01 for critChance check (< 0.5 → crit fires)
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.75)   // roll1d10 → 8 (hit, not nat-10)
        .mockReturnValueOnce(0.5)    // rollDamage
        .mockReturnValueOnce(0.01)   // critChance check → crit fires (0.01 < 0.5)
      const player = makePlayer()
      const enemy: Enemy = { ...shuffler, critChance: 0.5 }
      const state = makeCombatState(enemy)
      const { messages } = enemyAttack(player, state)
      const text = messages.map(m => m.text).join(' ')
      expect(text).toContain('vital spot')
      vi.restoreAllMocks()
    })
  })

  describe('enemy flee (checkEnemyFlee)', () => {
    it('flee fires when HP is below fleeThreshold and random < 0.5', () => {
      // Screamer: fleeThreshold=0.5. Set enemyHp to 40% of max (below threshold).
      // Mock random < 0.5 so the flee attempt succeeds.
      vi.spyOn(Math, 'random').mockReturnValue(0.3)  // < 0.5 → flee succeeds
      const screamer = ENEMIES['screamer']!
      // 4/10 = 40% — below the 50% threshold
      const state = makeCombatState(screamer, { enemyHp: 4 })
      const { messages, newState } = checkEnemyFlee(state)
      const text = messages.map(m => m.text).join(' ')
      expect(text).toContain('breaks off')
      expect(newState.enemyFled).toBe(true)
      expect(newState.active).toBe(false)
      vi.restoreAllMocks()
    })

    it('flee does NOT fire when HP is above fleeThreshold', () => {
      // Screamer at 60% HP — above the 50% flee threshold
      const screamer = ENEMIES['screamer']!
      const state = makeCombatState(screamer, { enemyHp: 6 })  // 6/10 = 60%
      const { messages, newState } = checkEnemyFlee(state)
      expect(messages).toHaveLength(0)
      expect(newState.enemyFled).toBeFalsy()
      expect(newState.active).toBe(true)
    })

    it('flee attempt only fires once per fight (enemyFleeAttempted flag)', () => {
      // First call with HP below threshold and random that suppresses escape (>= 0.5)
      // then second call — should produce no flee messages even with HP still low
      vi.spyOn(Math, 'random').mockReturnValue(0.7)  // >= 0.5 → flee fails, flag set
      const screamer = ENEMIES['screamer']!
      const state = makeCombatState(screamer, { enemyHp: 2 })  // very low
      const { messages: msgs1, newState: state1 } = checkEnemyFlee(state)
      expect(msgs1.map(m => m.text).join(' ')).toContain('hesitates')
      expect(state1.enemyFleeAttempted).toBe(true)

      // Second call — already attempted, should be silent
      vi.spyOn(Math, 'random').mockReturnValue(0.1)  // would flee if check ran
      const { messages: msgs2, newState: state2 } = checkEnemyFlee(state1)
      expect(msgs2).toHaveLength(0)
      expect(state2.enemyFled).toBeFalsy()
      vi.restoreAllMocks()
    })
  })

  describe('compressLog', () => {
    it('compresses 3 consecutive identical combat messages into (×3) format', () => {
      const msgs = [
        { id: 'a', text: 'Shuffler hits you for 2.', type: 'combat' as const },
        { id: 'b', text: 'Shuffler hits you for 2.', type: 'combat' as const },
        { id: 'c', text: 'Shuffler hits you for 2.', type: 'combat' as const },
      ]
      const result = compressLog(msgs)
      expect(result).toHaveLength(1)
      expect(result[0]!.text).toBe('Shuffler hits you for 2. (×3)')
    })

    it('does not compress messages with different text', () => {
      const msgs = [
        { id: 'a', text: 'Shuffler hits you for 2.', type: 'combat' as const },
        { id: 'b', text: 'Shuffler hits you for 3.', type: 'combat' as const },
        { id: 'c', text: 'Shuffler hits you for 2.', type: 'combat' as const },
      ]
      const result = compressLog(msgs)
      expect(result).toHaveLength(3)
    })

    it('does not compress non-combat messages even if text is identical', () => {
      const msgs = [
        { id: 'a', text: 'Something shifts.', type: 'narrative' as const },
        { id: 'b', text: 'Something shifts.', type: 'narrative' as const },
      ]
      const result = compressLog(msgs)
      expect(result).toHaveLength(2)
    })

    it('handles mixed types: compresses combat runs but leaves others intact', () => {
      const msgs = [
        { id: 'a', text: 'Hit for 2.', type: 'combat' as const },
        { id: 'b', text: 'Hit for 2.', type: 'combat' as const },
        { id: 'c', text: 'Watch yourself.', type: 'system' as const },
        { id: 'd', text: 'Hit for 2.', type: 'combat' as const },
      ]
      const result = compressLog(msgs)
      expect(result).toHaveLength(3)
      expect(result[0]!.text).toBe('Hit for 2. (×2)')
      expect(result[1]!.text).toBe('Watch yourself.')
      expect(result[2]!.text).toBe('Hit for 2.')
    })
  })
})
