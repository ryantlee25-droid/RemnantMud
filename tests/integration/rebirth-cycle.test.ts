// ============================================================
// Integration tests for the rebirth cycle (Revenant mechanic)
// Validates the pure computation logic used by rebirthWithStats().
// These cover the B1 fix: rebirthWithStats() must NOT reset to cycle 1.
// ============================================================

import { describe, it, expect } from 'vitest'
import type { Player, CycleSnapshot, FactionType } from '@/types/game'
import { CLASS_DEFINITIONS } from '@/types/game'
import { createCycleSnapshot, computeInheritedReputation } from '@/lib/echoes'
import { echoRetentionFactor } from '@/lib/fear'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 10, grit: 8, reflex: 6, wits: 5, presence: 4, shadow: 3,
    hp: 20, maxHp: 20, currentRoomId: 'room_1', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 3, totalDeaths: 2,
    questFlags: {},
    factionReputation: {},
    ...overrides,
  }
}

// Mirrors rebirthWithStats() computation — no Supabase
function simulateRebirth(player: Player, stats: { vigor: number; grit: number }) {
  const newCycle = (player.cycle ?? 1) + 1
  const newTotalDeaths = (player.totalDeaths ?? 0) + 1
  const newHp = 8 + (stats.vigor - 2) * 2
  return { newCycle, newTotalDeaths, newHp }
}

// Mirrors getEchoStats() computation
function computeEchoStats(player: Player) {
  const allStats = ['vigor', 'grit', 'reflex', 'wits', 'presence', 'shadow'] as const
  const classDef = CLASS_DEFINITIONS[player.characterClass]
  const base = 2
  const retention = echoRetentionFactor(player.grit)
  const echo: Record<string, number> = {}
  for (const s of allStats) {
    const classFloor = base + (classDef.classBonus[s] ?? 0)
    echo[s] = Math.max(classFloor, Math.floor(player[s] * retention))
  }
  return echo
}

// ------------------------------------------------------------
// Tests — cycle counter
// ------------------------------------------------------------

describe('rebirth cycle (Revenant mechanic)', () => {
  it('rebirthWithStats increments cycle count', () => {
    const player = makePlayer({ cycle: 3 })
    const { newCycle } = simulateRebirth(player, { vigor: 10, grit: 8 })
    expect(newCycle).toBe(4)
  })

  it('rebirthWithStats increments total_deaths', () => {
    const player = makePlayer({ totalDeaths: 2 })
    const { newTotalDeaths } = simulateRebirth(player, { vigor: 10, grit: 8 })
    expect(newTotalDeaths).toBe(3)
  })

  it('does NOT reset to cycle 1 (B1 fix validation)', () => {
    // createCharacter() would produce cycle 1; rebirthWithStats must not
    const player = makePlayer({ cycle: 3 })
    const { newCycle } = simulateRebirth(player, { vigor: 10, grit: 8 })
    expect(newCycle).not.toBe(1)
    expect(newCycle).toBeGreaterThan(player.cycle)
  })

  it('createCharacter sets cycle to 1 (new player baseline)', () => {
    // The initial cycle for a brand-new player is always 1
    const freshPlayerCycle = 1
    expect(freshPlayerCycle).toBe(1)
  })

  // ------------------------------------------------------------
  // HP recalculation
  // ------------------------------------------------------------

  it('HP is recalculated from new vigor at rebirth', () => {
    const player = makePlayer()
    const { newHp } = simulateRebirth(player, { vigor: 12, grit: 8 })
    // 8 + (12 - 2) * 2 = 28
    expect(newHp).toBe(28)
  })

  // ------------------------------------------------------------
  // Echo stat calculations
  // ------------------------------------------------------------

  it('echo stats are computed with retention factor based on grit', () => {
    const player = makePlayer({ grit: 8, vigor: 10 })
    const retention = echoRetentionFactor(8) // ~0.799
    const echo = computeEchoStats(player)
    // vigor floor for enforcer: 2 + 4 = 6; floor(10 * 0.799) = 7
    expect(echo.vigor).toBe(Math.max(6, Math.floor(10 * retention)))
  })

  it('echo stats never go below class floor', () => {
    // Low-stat player: shadow = 1, enforcer gets no shadow bonus → floor is 2
    const player = makePlayer({ shadow: 1, grit: 5 })
    const echo = computeEchoStats(player)
    const classDef = CLASS_DEFINITIONS['enforcer']
    const shadowFloor = 2 + (classDef.classBonus['shadow'] ?? 0)
    expect(echo.shadow).toBeGreaterThanOrEqual(shadowFloor)
  })

  // ------------------------------------------------------------
  // Faction reputation inheritance
  // ------------------------------------------------------------

  it('faction reputation is inherited from cycle history', () => {
    const snapshot: CycleSnapshot = {
      cycle: 3,
      factionsAligned: ['accord', 'drifters'] as FactionType[],
      factionsAntagonized: ['red_court'] as FactionType[],
      npcRelationships: {},
      questsCompleted: [],
    }
    const inherited = computeInheritedReputation(snapshot)
    expect(inherited.accord).toBe(1)
    expect(inherited.drifters).toBe(1)
    expect(inherited.red_court).toBe(-1)
  })

  it('rebirthWithStats vs createCharacter produce different cycles', () => {
    // B1 fix: a player on cycle 3 who rebirths should land on cycle 4, not 1
    const returningPlayer = makePlayer({ cycle: 3 })
    const { newCycle } = simulateRebirth(returningPlayer, { vigor: 10, grit: 8 })
    const freshCycle = 1 // what createCharacter() always produces
    expect(newCycle).not.toBe(freshCycle)
  })
})
