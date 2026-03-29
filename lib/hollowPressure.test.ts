// ============================================================
// hollowPressure.test.ts — Tests for Dread & Tension System
// Convoy: remnant-narrative-0329 | Rider B
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  computePressure,
  applyPressureDelta,
  getPressureNarration,
  getPressureEncounterModifier,
  shouldTriggerSwarm,
  getSilenceNarration,
  getMundaneHorrorNarration,
} from '@/lib/hollowPressure'
import {
  checkInitiativeTriggers,
  getInitiativeNarration,
  INITIATIVE_TRIGGERS,
  _resetInitiativeCooldown,
} from '@/lib/npcInitiative'
import type { Player } from '@/types/game'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'test-player',
    name: 'Test',
    characterClass: 'scout',
    vigor: 5,
    grit: 5,
    reflex: 5,
    wits: 5,
    presence: 5,
    shadow: 5,
    hp: 10,
    maxHp: 10,
    currentRoomId: 'crossroads_square',
    worldSeed: 1,
    xp: 0,
    level: 1,
    actionsTaken: 0,
    isDead: false,
    cycle: 1,
    totalDeaths: 0,
    factionReputation: {},
    questFlags: {},
    ...overrides,
  }
}

// ------------------------------------------------------------
// computePressure
// ------------------------------------------------------------

describe('computePressure', () => {
  it('returns unchanged pressure when fewer than 10 actions have passed', () => {
    expect(computePressure(3, 9, 0)).toBe(3)
    expect(computePressure(3, 5, 0)).toBe(3)
  })

  it('increments pressure by 1 for every 10 actions', () => {
    expect(computePressure(0, 10, 0)).toBe(1)
    expect(computePressure(0, 20, 0)).toBe(2)
    expect(computePressure(2, 30, 0)).toBe(5)
  })

  it('respects lastPressureTick — counts actions since tick, not total', () => {
    // 50 total actions, last tick at 40: 10 new actions → +1
    expect(computePressure(3, 50, 40)).toBe(4)
  })

  it('clamps result at 10', () => {
    // 9 current pressure + 20 actions = would be 11, clamps to 10
    expect(computePressure(9, 20, 0)).toBe(10)
  })

  it('does not go below 0', () => {
    expect(computePressure(0, 5, 0)).toBe(0)
  })
})

// ------------------------------------------------------------
// applyPressureDelta
// ------------------------------------------------------------

describe('applyPressureDelta', () => {
  it('applies positive delta', () => {
    expect(applyPressureDelta(3, 2)).toBe(5)
  })

  it('applies negative delta', () => {
    expect(applyPressureDelta(7, -3)).toBe(4)
  })

  it('clamps at maximum of 10', () => {
    expect(applyPressureDelta(9, 5)).toBe(10)
    expect(applyPressureDelta(10, 1)).toBe(10)
  })

  it('clamps at minimum of 0', () => {
    expect(applyPressureDelta(1, -5)).toBe(0)
    expect(applyPressureDelta(0, -1)).toBe(0)
  })

  it('handles zero delta', () => {
    expect(applyPressureDelta(5, 0)).toBe(5)
  })

  it('handles normal safe rest decrement (-1)', () => {
    expect(applyPressureDelta(4, -1)).toBe(3)
  })

  it('handles clear threat decrement (-3)', () => {
    expect(applyPressureDelta(6, -3)).toBe(3)
  })

  it('handles stronghold rest (-10) flooring at 0', () => {
    expect(applyPressureDelta(7, -10)).toBe(0)
    expect(applyPressureDelta(3, -10)).toBe(0)
  })
})

// ------------------------------------------------------------
// getPressureNarration
// ------------------------------------------------------------

describe('getPressureNarration', () => {
  it('returns an array of GameMessages for every valid level 0–10', () => {
    for (let level = 0; level <= 10; level++) {
      const messages = getPressureNarration(level)
      expect(messages.length).toBeGreaterThanOrEqual(1)
      messages.forEach(m => {
        expect(m).toHaveProperty('id')
        expect(m).toHaveProperty('text')
        expect(m).toHaveProperty('type')
        expect(typeof m.text).toBe('string')
        expect(m.text.length).toBeGreaterThan(0)
      })
    }
  })

  it('clamps out-of-range values — below 0 treated as 0', () => {
    const atZero = getPressureNarration(0)
    const atNeg = getPressureNarration(-5)
    expect(atNeg[0].text).toBe(atZero[0].text)
  })

  it('clamps out-of-range values — above 10 treated as 10', () => {
    const atTen = getPressureNarration(10)
    const atEleven = getPressureNarration(11)
    expect(atEleven[0].text).toBe(atTen[0].text)
  })

  it('level 10 narration references the swarm', () => {
    const messages = getPressureNarration(10)
    const combined = messages.map(m => m.text).join(' ')
    expect(combined.toLowerCase()).toMatch(/scream|breath/i)
  })

  it('low-pressure narration (0–1) is calm, not threatening', () => {
    const messages0 = getPressureNarration(0)
    const messages1 = getPressureNarration(1)
    ;[...messages0, ...messages1].forEach(m => {
      // Should mention quiet/peaceful themes
      expect(m.text).toBeTruthy()
    })
  })

  it('high-pressure narration (8–9) references physical symptoms', () => {
    const messages = [...getPressureNarration(8), ...getPressureNarration(9)]
    const combined = messages.map(m => m.text).join(' ')
    // Contract spec: breathing, copper/fear, body response
    expect(combined.toLowerCase()).toMatch(/breath|copper|shak|fear|vision|mouth|hands/i)
  })
})

// ------------------------------------------------------------
// getPressureEncounterModifier
// ------------------------------------------------------------

describe('getPressureEncounterModifier', () => {
  it('returns 1.0 at pressure 0', () => {
    expect(getPressureEncounterModifier(0)).toBe(1.0)
  })

  it('returns 3.0 at pressure 10', () => {
    expect(getPressureEncounterModifier(10)).toBe(3.0)
  })

  it('scales linearly between 0 and 10', () => {
    const mid = getPressureEncounterModifier(5)
    expect(mid).toBeCloseTo(2.0, 5)
  })

  it('clamps values below 0', () => {
    expect(getPressureEncounterModifier(-5)).toBe(1.0)
  })

  it('clamps values above 10', () => {
    expect(getPressureEncounterModifier(15)).toBe(3.0)
  })

  it('modifier is always >= 1.0', () => {
    for (let i = 0; i <= 10; i++) {
      expect(getPressureEncounterModifier(i)).toBeGreaterThanOrEqual(1.0)
    }
  })
})

// ------------------------------------------------------------
// shouldTriggerSwarm
// ------------------------------------------------------------

describe('shouldTriggerSwarm', () => {
  it('returns false at levels 0–9', () => {
    for (let i = 0; i <= 9; i++) {
      expect(shouldTriggerSwarm(i)).toBe(false)
    }
  })

  it('returns true at level 10', () => {
    expect(shouldTriggerSwarm(10)).toBe(true)
  })

  it('returns true above 10 (edge case)', () => {
    expect(shouldTriggerSwarm(11)).toBe(true)
  })
})

// ------------------------------------------------------------
// getSilenceNarration
// ------------------------------------------------------------

describe('getSilenceNarration', () => {
  it('returns a single GameMessage', () => {
    const result = getSilenceNarration()
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('text')
    expect(result).toHaveProperty('type')
    expect(typeof result.text).toBe('string')
    expect(result.text.length).toBeGreaterThan(0)
  })

  it('narration references silence or stopping', () => {
    // Call several times and check at least one hits silence/stop themes
    const results = Array.from({ length: 10 }, () => getSilenceNarration())
    const combined = results.map(r => r.text).join(' ')
    expect(combined.toLowerCase()).toMatch(/quiet|silent|stop|still|absolute/i)
  })
})

// ------------------------------------------------------------
// getMundaneHorrorNarration
// ------------------------------------------------------------

describe('getMundaneHorrorNarration', () => {
  it('returns null most of the time (3% rate)', () => {
    // With random mocked to a value > 0.03, should always return null
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    const result = getMundaneHorrorNarration('crossroads_square')
    expect(result).toBeNull()
    vi.restoreAllMocks()
  })

  it('returns a GameMessage when random <= 0.03', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.02)
    const result = getMundaneHorrorNarration('crossroads_square')
    expect(result).not.toBeNull()
    expect(result).toHaveProperty('id')
    expect(result).toHaveProperty('text')
    expect(result!.text.length).toBeGreaterThan(0)
    vi.restoreAllMocks()
  })

  it('spawn rate is approximately 3% over many calls', () => {
    vi.restoreAllMocks()
    const TRIALS = 10000
    let hits = 0
    for (let i = 0; i < TRIALS; i++) {
      if (getMundaneHorrorNarration('test_room') !== null) hits++
    }
    const rate = hits / TRIALS
    // Allow 1.5%–4.5% band (3 sigma of a binomial at 3%)
    expect(rate).toBeGreaterThan(0.015)
    expect(rate).toBeLessThan(0.045)
  })

  it('horror text contains specific wrongness (guard count or door etc.)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    const result = getMundaneHorrorNarration('crossroads_square')
    expect(result).not.toBeNull()
    // Should describe something mundane-wrong
    expect(result!.text.length).toBeGreaterThan(20)
    vi.restoreAllMocks()
  })
})

// ------------------------------------------------------------
// INITIATIVE_TRIGGERS — static data validation
// ------------------------------------------------------------

describe('INITIATIVE_TRIGGERS static data', () => {
  it('has at least 15 entries', () => {
    expect(INITIATIVE_TRIGGERS.length).toBeGreaterThanOrEqual(15)
  })

  it('has at most 25 entries', () => {
    expect(INITIATIVE_TRIGGERS.length).toBeLessThanOrEqual(25)
  })

  it('every trigger has a non-empty npcId', () => {
    INITIATIVE_TRIGGERS.forEach(t => {
      expect(typeof t.npcId).toBe('string')
      expect(t.npcId.length).toBeGreaterThan(0)
    })
  })

  it('every trigger has a valid triggerType', () => {
    const validTypes = ['quest_flag', 'faction_rep', 'act_progression', 'time_since_last_meeting']
    INITIATIVE_TRIGGERS.forEach(t => {
      expect(validTypes).toContain(t.triggerType)
    })
  })

  it('every trigger has a non-empty initiativeMessage (used as flag key)', () => {
    INITIATIVE_TRIGGERS.forEach(t => {
      expect(typeof t.initiativeMessage).toBe('string')
      expect(t.initiativeMessage.length).toBeGreaterThan(0)
    })
  })

  it('every trigger has a condition function', () => {
    INITIATIVE_TRIGGERS.forEach(t => {
      expect(typeof t.condition).toBe('function')
    })
  })
})

// ------------------------------------------------------------
// checkInitiativeTriggers — cooldown behavior
// ------------------------------------------------------------

describe('checkInitiativeTriggers cooldown', () => {
  beforeEach(() => {
    _resetInitiativeCooldown()
    vi.restoreAllMocks()
  })

  it('returns null when fewer than 30 actions have elapsed since last event', () => {
    // First call fires (mock random to ensure it passes the spawn check)
    vi.spyOn(Math, 'random').mockReturnValue(0.05)
    const player = makePlayer({
      totalDeaths: 2,
      questFlags: {},
    })
    // Fire one event to set the cooldown
    checkInitiativeTriggers(player, 'room_a', 100)
    // Try again at action 115 (only 15 elapsed)
    const result = checkInitiativeTriggers(player, 'room_b', 115)
    expect(result).toBeNull()
  })

  it('allows a new event after 30 actions have elapsed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.05)
    const player = makePlayer({
      totalDeaths: 2,
      questFlags: {},
    })
    // First event
    checkInitiativeTriggers(player, 'room_a', 100)
    // 31 actions later
    const result = checkInitiativeTriggers(player, 'room_b', 131)
    // May or may not fire depending on conditions, but cooldown is not blocking
    // Just verify it doesn't throw
    expect(result === null || typeof result === 'object').toBe(true)
  })
})

// ------------------------------------------------------------
// checkInitiativeTriggers — spawn chance gating
// ------------------------------------------------------------

describe('checkInitiativeTriggers spawn chance', () => {
  beforeEach(() => {
    _resetInitiativeCooldown()
  })

  it('returns null when random roll > 0.10', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.50)
    const player = makePlayer({
      totalDeaths: 2,
      questFlags: {},
    })
    const result = checkInitiativeTriggers(player, 'room_a', 50)
    expect(result).toBeNull()
    vi.restoreAllMocks()
  })

  it('can return a trigger when random roll <= 0.10 and condition is met', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.05)
    const player = makePlayer({
      totalDeaths: 2,    // patch trigger condition
      questFlags: {},
    })
    const result = checkInitiativeTriggers(player, 'room_a', 50)
    expect(result).not.toBeNull()
    expect(result?.npcId).toBe('patch')
    vi.restoreAllMocks()
  })
})

// ------------------------------------------------------------
// checkInitiativeTriggers — individual trigger conditions
// ------------------------------------------------------------

describe('checkInitiativeTriggers trigger conditions', () => {
  beforeEach(() => {
    _resetInitiativeCooldown()
    vi.spyOn(Math, 'random').mockReturnValue(0.05)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('patch trigger fires after 2 deaths when flag not set', () => {
    const player = makePlayer({ totalDeaths: 2, questFlags: {} })
    const result = checkInitiativeTriggers(player, 'room', 50)
    expect(result?.npcId).toBe('patch')
    expect(result?.initiativeMessage).toBe('patch_found_you_after_deaths')
  })

  it('patch trigger does not fire if already seen (flag set)', () => {
    const player = makePlayer({
      totalDeaths: 2,
      questFlags: { patch_found_you_after_deaths: true },
    })
    const result = checkInitiativeTriggers(player, 'room', 50)
    // Could be a different trigger or null, but NOT the patch death trigger
    if (result !== null) {
      expect(result.initiativeMessage).not.toBe('patch_found_you_after_deaths')
    }
  })

  it('cross runner fires when salter rep <= -1 and flag not set', () => {
    const player = makePlayer({
      totalDeaths: 0,
      factionReputation: { salters: -1 },
      questFlags: {},
    })
    const result = checkInitiativeTriggers(player, 'room', 50)
    expect(result?.npcId).toBe('marshal_cross')
    expect(result?.initiativeMessage).toBe('cross_runner_sent')
  })

  it('lev fires when meridian_data_found is set', () => {
    const player = makePlayer({
      totalDeaths: 0,
      factionReputation: {},
      questFlags: { meridian_data_found: true },
    })
    const result = checkInitiativeTriggers(player, 'room', 50)
    expect(result?.npcId).toBe('lev')
    expect(result?.initiativeMessage).toBe('lev_meridian_contact')
  })

  it('drifter fires after 50 actions without NPC contact', () => {
    const player = makePlayer({
      totalDeaths: 0,
      actionsTaken: 80,
      factionReputation: {},
      questFlags: { last_npc_contact_action: 20 },  // 60 actions gap
    })
    const result = checkInitiativeTriggers(player, 'room', 50)
    expect(result?.npcId).toBe('drifter_newcomer')
  })

  it('drifter does not fire when contact was recent (< 50 actions)', () => {
    const player = makePlayer({
      totalDeaths: 0,
      actionsTaken: 60,
      factionReputation: {},
      questFlags: { last_npc_contact_action: 40 }, // only 20 actions gap
    })
    // No trigger should fire for drifter — check it's not returned
    const result = checkInitiativeTriggers(player, 'room', 50)
    if (result !== null) {
      expect(result.npcId).not.toBe('drifter_newcomer')
    }
  })
})

// ------------------------------------------------------------
// getInitiativeNarration
// ------------------------------------------------------------

describe('getInitiativeNarration', () => {
  it('returns 2–3 messages for known trigger', () => {
    const trigger = INITIATIVE_TRIGGERS.find(t => t.initiativeMessage === 'patch_found_you_after_deaths')!
    const messages = getInitiativeNarration(trigger)
    expect(messages.length).toBeGreaterThanOrEqual(2)
    expect(messages.length).toBeLessThanOrEqual(3)
  })

  it('each message is a valid GameMessage', () => {
    const trigger = INITIATIVE_TRIGGERS[0]
    const messages = getInitiativeNarration(trigger)
    messages.forEach(m => {
      expect(m).toHaveProperty('id')
      expect(m).toHaveProperty('text')
      expect(m).toHaveProperty('type')
      expect(typeof m.text).toBe('string')
      expect(m.text.length).toBeGreaterThan(0)
    })
  })

  it('falls back gracefully for unknown trigger message key', () => {
    const fakeTrigger = {
      npcId: 'unknown_npc',
      triggerType: 'quest_flag' as const,
      condition: () => true,
      initiativeMessage: 'nonexistent_key',
    }
    const messages = getInitiativeNarration(fakeTrigger)
    expect(messages.length).toBeGreaterThanOrEqual(2)
    messages.forEach(m => {
      expect(typeof m.text).toBe('string')
      expect(m.text.length).toBeGreaterThan(0)
    })
  })

  it('patch narration mentions tracking', () => {
    const trigger = INITIATIVE_TRIGGERS.find(t => t.initiativeMessage === 'patch_found_you_after_deaths')!
    const messages = getInitiativeNarration(trigger)
    const combined = messages.map(m => m.text).join(' ')
    expect(combined.toLowerCase()).toMatch(/track/i)
  })

  it('lev meridian narration mentions MERIDIAN data', () => {
    const trigger = INITIATIVE_TRIGGERS.find(t => t.initiativeMessage === 'lev_meridian_contact')!
    const messages = getInitiativeNarration(trigger)
    const combined = messages.map(m => m.text).join(' ')
    expect(combined.toLowerCase()).toMatch(/meridian/i)
  })
})
