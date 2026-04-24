// ============================================================
// Real combat math tests — no mocks on @/lib/combat
// ============================================================

import { describe, it, expect, vi } from 'vitest'
import type { Player, Enemy, CombatState } from '@/types/game'
import { startCombat, playerAttack, enemyAttack } from '@/lib/combat'
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
})
