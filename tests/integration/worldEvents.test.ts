// ============================================================
// worldEvents.test.ts — Integration tests for combat world events
// Convoy 1 — H8 (combat world events, E5 narrative must-launch)
// ============================================================

import { describe, it, expect } from 'vitest'
import {
  getScheduledCombatEvents,
  ALL_COMBAT_EVENTS,
} from '@/lib/worldEvents'
import type { CombatWorldEvent } from '@/lib/worldEvents'
import type { Player, GameState, CombatState } from '@/types/game'

// ============================================================
// Fixtures
// ============================================================

const basePlayer: Pick<Player, 'factionReputation' | 'questFlags' | 'hollowPressure'> = {
  factionReputation: {},
  questFlags: { act1_complete: true },
  hollowPressure: 0,
}

const noActiveState: Pick<GameState, 'combatState' | 'activeDialogue' | 'currentRoom'> = {
  combatState: null,
  activeDialogue: undefined,
  currentRoom: null,
}

function makeState(
  overrides: Partial<Pick<GameState, 'combatState' | 'activeDialogue' | 'currentRoom'>>
): Pick<GameState, 'combatState' | 'activeDialogue' | 'currentRoom'> {
  return { ...noActiveState, ...overrides }
}

function roomInZone(zone: string): Pick<GameState, 'combatState' | 'activeDialogue' | 'currentRoom'> {
  return makeState({
    currentRoom: {
      // Minimal Room shape — only zone is checked by getScheduledCombatEvents.
      zone: zone as import('@/types/game').ZoneType,
    } as import('@/types/game').Room,
  })
}

function withPressure(
  pressure: number
): Pick<Player, 'factionReputation' | 'questFlags' | 'hollowPressure'> {
  return { ...basePlayer, hollowPressure: pressure }
}

// ============================================================
// Test 1: hollow_tide_river_road fires when pressure ≥ 3
//         and player is in River Road; enemies injected
// ============================================================

describe('ce_a1_01_hollow_tide_river_road', () => {
  const EVENT_ID = 'ce_a1_01_hollow_tide_river_road'
  // triggerActionCount is 30

  it('fires at action 30 when pressure ≥ 3 and zone is river_road', () => {
    const result = getScheduledCombatEvents(
      30,
      1,
      withPressure(3),
      roomInZone('river_road')
    )
    const fired = result.find(e => e.id === EVENT_ID)
    expect(fired).toBeDefined()
  })

  it('injects shuffler and remnant enemies when it fires', () => {
    const result = getScheduledCombatEvents(
      30,
      1,
      withPressure(3),
      roomInZone('river_road')
    )
    const fired = result.find(e => e.id === EVENT_ID) as CombatWorldEvent | undefined
    expect(fired).toBeDefined()
    expect(fired?.combatParticipation?.enemyIds).toContain('shuffler')
    expect(fired?.combatParticipation?.enemyIds).toContain('remnant')
  })

  it('does NOT fire when pressure < 3', () => {
    const result = getScheduledCombatEvents(
      30,
      1,
      withPressure(2),
      roomInZone('river_road')
    )
    const fired = result.find(e => e.id === EVENT_ID)
    expect(fired).toBeUndefined()
  })

  it('does NOT fire when zone is not river_road', () => {
    const result = getScheduledCombatEvents(
      30,
      1,
      withPressure(5),
      roomInZone('crossroads')
    )
    const fired = result.find(e => e.id === EVENT_ID)
    expect(fired).toBeUndefined()
  })
})

// ============================================================
// Test 2: covenant_picket_clash does NOT fire when pressure < 4
// ============================================================

describe('ce_a1_02_covenant_picket_clash', () => {
  const EVENT_ID = 'ce_a1_02_covenant_picket_clash'
  // triggerActionCount is 40, minPressure is 4

  it('fires at action 40 when pressure ≥ 4 and zone is covenant', () => {
    const result = getScheduledCombatEvents(
      40,
      1,
      withPressure(4),
      roomInZone('covenant')
    )
    const fired = result.find(e => e.id === EVENT_ID)
    expect(fired).toBeDefined()
  })

  it('does NOT fire when pressure < 4', () => {
    const result = getScheduledCombatEvents(
      40,
      1,
      withPressure(3),
      roomInZone('covenant')
    )
    const fired = result.find(e => e.id === EVENT_ID)
    expect(fired).toBeUndefined()
  })

  it('does NOT fire when pressure is 0', () => {
    const result = getScheduledCombatEvents(
      40,
      1,
      withPressure(0),
      roomInZone('covenant')
    )
    const fired = result.find(e => e.id === EVENT_ID)
    expect(fired).toBeUndefined()
  })
})

// ============================================================
// Test 3: Combat event does NOT fire if player is already in combat
// ============================================================

describe('combat events — blocked during active combat', () => {
  it('returns empty array when combatState.active is true', () => {
    const activeCombat: Pick<GameState, 'combatState' | 'activeDialogue' | 'currentRoom'> = {
      combatState: {
        active: true,
        // Minimal CombatState — only `active` is checked
      } as CombatState,
      activeDialogue: undefined,
      currentRoom: {
        zone: 'river_road',
      } as import('@/types/game').Room,
    }

    // Action count 30 with pressure 5 would normally fire hollow_tide
    const result = getScheduledCombatEvents(30, 1, withPressure(5), activeCombat)
    expect(result).toHaveLength(0)
  })

  it('fires the same event when combat is NOT active (control)', () => {
    const result = getScheduledCombatEvents(
      30,
      1,
      withPressure(5),
      roomInZone('river_road')
    )
    // Should have at least the hollow_tide event
    expect(result.length).toBeGreaterThan(0)
  })
})

// ============================================================
// Test 4: Combat event does NOT fire if player is in dialogue
// ============================================================

describe('combat events — blocked during dialogue', () => {
  it('returns empty array when activeDialogue is set', () => {
    const inDialogue: Pick<GameState, 'combatState' | 'activeDialogue' | 'currentRoom'> = {
      combatState: null,
      activeDialogue: {
        npcId: 'marshal_cross',
        treeId: 'marshal_cross_main',
        currentNodeId: 'mc_01',
      },
      currentRoom: {
        zone: 'river_road',
      } as import('@/types/game').Room,
    }

    const result = getScheduledCombatEvents(30, 1, withPressure(5), inDialogue)
    expect(result).toHaveLength(0)
  })

  it('fires correctly when dialogue is undefined (control)', () => {
    const noDialogue = roomInZone('river_road')
    const result = getScheduledCombatEvents(30, 1, withPressure(5), noDialogue)
    expect(result.length).toBeGreaterThan(0)
  })
})

// ============================================================
// Registry integrity checks for combat events
// ============================================================

describe('ALL_COMBAT_EVENTS registry', () => {
  it('contains 8 combat events', () => {
    expect(ALL_COMBAT_EVENTS.length).toBeGreaterThanOrEqual(8)
  })

  it('has no duplicate event IDs', () => {
    const ids = ALL_COMBAT_EVENTS.map(e => e.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('all combat events have combatParticipation with at least one enemyId', () => {
    ALL_COMBAT_EVENTS.forEach(event => {
      expect(event.combatParticipation).toBeDefined()
      expect(event.combatParticipation?.enemyIds.length).toBeGreaterThan(0)
    })
  })

  it('all combat events have at least 2 message variants', () => {
    ALL_COMBAT_EVENTS.forEach(event => {
      expect(event.messagePool.length).toBeGreaterThanOrEqual(2)
    })
  })

  it('act 1 combat events cover river_road and covenant zones', () => {
    const act1 = ALL_COMBAT_EVENTS.filter(e => e.act === 1)
    const zones = act1.map(e => e.zoneGate)
    expect(zones).toContain('river_road')
    expect(zones).toContain('covenant')
  })

  it('act 2 combat events cover the_pens and the_pine_sea zones', () => {
    const act2 = ALL_COMBAT_EVENTS.filter(e => e.act === 2)
    const zones = act2.map(e => e.zoneGate)
    expect(zones).toContain('the_pens')
    expect(zones).toContain('the_pine_sea')
  })
})
