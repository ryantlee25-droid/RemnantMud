// ============================================================
// Integration tests for the death/rebirth cycle (echoes system)
// Tests pure functions directly — no mocking needed.
// ============================================================

import { describe, it, expect } from 'vitest'
import type { Player, CycleSnapshot, FactionType } from '@/types/game'
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
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    questFlags: {},
    factionReputation: {},
    ...overrides,
  }
}

// ------------------------------------------------------------
// Tests — createCycleSnapshot
// ------------------------------------------------------------

describe('createCycleSnapshot — faction alignment', () => {
  it('captures faction with rep >= 2 in factionsAligned', () => {
    const player = makePlayer({
      factionReputation: { accord: 3, salters: 1, drifters: 2 },
    })

    const snapshot = createCycleSnapshot(player)

    expect(snapshot.factionsAligned).toContain('accord')
    expect(snapshot.factionsAligned).toContain('drifters')
    // salters has rep 1, should not be aligned
    expect(snapshot.factionsAligned).not.toContain('salters')
  })
})

describe('createCycleSnapshot — faction antagonization', () => {
  it('captures faction with rep <= -2 in factionsAntagonized', () => {
    const player = makePlayer({
      factionReputation: { accord: -2, salters: -3, drifters: -1 },
    })

    const snapshot = createCycleSnapshot(player)

    expect(snapshot.factionsAntagonized).toContain('accord')
    expect(snapshot.factionsAntagonized).toContain('salters')
    // drifters has rep -1, should not be antagonized
    expect(snapshot.factionsAntagonized).not.toContain('drifters')
  })
})

describe('createCycleSnapshot — death room recording', () => {
  it('when no ending choice, deathRoom should be set to current room', () => {
    const player = makePlayer({ currentRoomId: 'the_scar_entrance' })

    const snapshot = createCycleSnapshot(player)

    expect(snapshot.deathRoom).toBe('the_scar_entrance')
    expect(snapshot.endingChoice).toBeUndefined()
  })
})

describe('createCycleSnapshot — ending choice recording', () => {
  it('when ending choice provided, endingChoice should be set', () => {
    const player = makePlayer({ cycle: 3 })

    const snapshot = createCycleSnapshot(player, 'weapon')

    expect(snapshot.endingChoice).toBe('weapon')
    expect(snapshot.deathRoom).toBeUndefined()
  })
})

// ------------------------------------------------------------
// Tests — computeInheritedReputation
// ------------------------------------------------------------

describe('computeInheritedReputation — aligned factions', () => {
  it('gives +1 for aligned factions', () => {
    const snapshot: CycleSnapshot = {
      cycle: 1,
      factionsAligned: ['accord', 'drifters'] as FactionType[],
      factionsAntagonized: [],
      npcRelationships: {},
      questsCompleted: [],
    }

    const inherited = computeInheritedReputation(snapshot)

    expect(inherited.accord).toBe(1)
    expect(inherited.drifters).toBe(1)
  })
})

describe('computeInheritedReputation — antagonized factions', () => {
  it('gives -1 for antagonized factions', () => {
    const snapshot: CycleSnapshot = {
      cycle: 1,
      factionsAligned: [],
      factionsAntagonized: ['salters', 'red_court'] as FactionType[],
      npcRelationships: {},
      questsCompleted: [],
    }

    const inherited = computeInheritedReputation(snapshot)

    expect(inherited.salters).toBe(-1)
    expect(inherited.red_court).toBe(-1)
  })
})

// ------------------------------------------------------------
// Tests — echoRetentionFactor
// ------------------------------------------------------------

describe('echoRetentionFactor — scales with grit', () => {
  it('grit 5 gives base factor 0.7', () => {
    const factor = echoRetentionFactor(5)
    expect(factor).toBeCloseTo(0.7, 2)
  })

  it('grit 8 gives factor ~0.8', () => {
    const factor = echoRetentionFactor(8)
    // grit 8: base 0.7 + (8-5)*0.033 = 0.7 + 0.099 = 0.799
    expect(factor).toBeCloseTo(0.799, 2)
  })

  it('high grit caps at 0.85', () => {
    const factor = echoRetentionFactor(20)
    expect(factor).toBe(0.85)
  })
})
