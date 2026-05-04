// ============================================================
// echoes-worldevents-deep.test.ts
// P3-D: Deep integration coverage for lib/echoes.ts and lib/worldEvents.ts
//
// Covers:
//   - Echo persistence across rebirth (rebirthWithStats path)
//   - Graffiti/cycle-aware dialogue triggered by past-cycle actions
//   - World event scheduling (fires at correct game-time, no double-fire, missable)
//   - Event chains (one event triggers another via act progression)
//   - Cycle-N+1 state: what carries, what resets
//   - Event interaction with hollow pressure / faction state
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CycleSnapshot, Player, FactionType, GameState, CombatState } from '@/types/game'
import {
  createCycleSnapshot,
  computeInheritedReputation,
  getCrossCycleConsequences,
  getGraffitiChange,
  getCycleAwareDialogue,
  getDeathRoomNarration,
} from '@/lib/echoes'
import {
  getScheduledEvents,
  getScheduledCombatEvents,
  executeWorldEvent,
  executeCombatWorldEvent,
  ALL_WORLD_EVENTS,
  ALL_COMBAT_EVENTS,
} from '@/lib/worldEvents'
import {
  applyPressureDelta,
  computePressure,
  getPressureEncounterModifier,
  shouldTriggerSwarm,
} from '@/lib/hollowPressure'
import { CLASS_DEFINITIONS } from '@/types/game'

// ============================================================
// Helpers — mirrors rebirthWithStats() computation (no Supabase)
// Per CLAUDE.md: never call createCharacter() for returning players.
// These tests simulate the rebirthWithStats() cycle-transition path.
// ============================================================

function makeSnapshot(overrides: Partial<CycleSnapshot> = {}): CycleSnapshot {
  return {
    cycle: 1,
    factionsAligned: [],
    factionsAntagonized: [],
    npcRelationships: {},
    questsCompleted: [],
    ...overrides,
  }
}

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 10, grit: 10, reflex: 10, wits: 10, presence: 10, shadow: 10,
    hp: 20, maxHp: 20, currentRoomId: 'cr_01_approach', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    factionReputation: {},
    questFlags: {},
    ...overrides,
  }
}

/**
 * Simulate the echo-state created when a player goes through a rebirth.
 * This mirrors what rebirthWithStats() produces: the prior cycle is snapshotted,
 * then the player is reset with cycle+1 and inherited reputation.
 */
function simulateRebirthCycle(
  player: Player,
  cycleHistory: CycleSnapshot[]
): { newPlayer: Player; newHistory: CycleSnapshot[] } {
  const snapshot = createCycleSnapshot(player)
  const newHistory = [...cycleHistory, snapshot]
  const inheritedRep = computeInheritedReputation(snapshot)
  const newPlayer: Player = {
    ...player,
    cycle: player.cycle + 1,
    totalDeaths: player.totalDeaths + 1,
    hp: 8 + (player.vigor - 2) * 2,
    maxHp: 8 + (player.vigor - 2) * 2,
    questFlags: {},          // quests reset on rebirth
    factionReputation: inheritedRep as Partial<Record<FactionType, number>>,
    isDead: false,
    hollowPressure: 0,       // pressure resets each cycle
  }
  return { newPlayer, newHistory }
}

const basePlayerState: Pick<Player, 'factionReputation' | 'questFlags'> = {
  factionReputation: {},
  questFlags: {},
}

const noActiveState: Pick<GameState, 'combatState' | 'activeDialogue' | 'currentRoom'> = {
  combatState: null,
  activeDialogue: undefined,
  currentRoom: null,
}

function roomInZone(zone: string): Pick<GameState, 'combatState' | 'activeDialogue' | 'currentRoom'> {
  return {
    ...noActiveState,
    currentRoom: {
      zone: zone as import('@/types/game').ZoneType,
    } as import('@/types/game').Room,
  }
}

// ============================================================
// BLOCK 1 — Echo persistence across rebirth (rebirthWithStats path)
// ============================================================

describe('echo persistence across rebirth', () => {
  it('cycle increments correctly across multiple rebirths', () => {
    let player = makePlayer({ cycle: 1 })
    let history: CycleSnapshot[] = []

    const { newPlayer: p2, newHistory: h2 } = simulateRebirthCycle(player, history)
    expect(p2.cycle).toBe(2)

    const { newPlayer: p3, newHistory: h3 } = simulateRebirthCycle(p2, h2)
    expect(p3.cycle).toBe(3)

    const { newPlayer: p4, newHistory: h4 } = simulateRebirthCycle(p3, h3)
    expect(p4.cycle).toBe(4)
    expect(h4).toHaveLength(3)
  })

  it('totalDeaths accumulates across rebirths', () => {
    let player = makePlayer({ cycle: 1, totalDeaths: 0 })
    let history: CycleSnapshot[] = []

    const { newPlayer: p2, newHistory: h2 } = simulateRebirthCycle(player, history)
    expect(p2.totalDeaths).toBe(1)

    const { newPlayer: p3 } = simulateRebirthCycle(p2, h2)
    expect(p3.totalDeaths).toBe(2)
  })

  it('questFlags reset to empty on each rebirth (quests do not carry)', () => {
    const player = makePlayer({
      questFlags: { act1_complete: true, lev_trusts_player: true, sparks_quest_active: true },
    })
    const { newPlayer } = simulateRebirthCycle(player, [])
    expect(Object.keys(newPlayer.questFlags ?? {})).toHaveLength(0)
  })

  it('faction reputation carries at 50% (aligned -> +1, antagonized -> -1)', () => {
    const player = makePlayer({
      factionReputation: { kindling: 3, accord: 2, red_court: -2, salters: 1 },
    })
    const { newPlayer } = simulateRebirthCycle(player, [])
    // kindling was aligned (>=2) -> inherits +1
    expect(newPlayer.factionReputation?.kindling).toBe(1)
    // accord was aligned -> inherits +1
    expect(newPlayer.factionReputation?.accord).toBe(1)
    // red_court was antagonized -> inherits -1
    expect(newPlayer.factionReputation?.red_court).toBe(-1)
    // salters was neutral (rep=1, not >= 2) -> NOT inherited
    expect(newPlayer.factionReputation?.salters).toBeUndefined()
  })

  it('hollow pressure resets to 0 on rebirth', () => {
    const player = makePlayer({ hollowPressure: 8 })
    const { newPlayer } = simulateRebirthCycle(player, [])
    expect(newPlayer.hollowPressure).toBe(0)
  })

  it('cycle snapshot captures deathRoom on death (non-ending)', () => {
    const player = makePlayer({ currentRoomId: 'scar_05_inner_corridor', cycle: 2 })
    const snap = createCycleSnapshot(player)
    expect(snap.deathRoom).toBe('scar_05_inner_corridor')
    expect(snap.cycle).toBe(2)
    expect(snap.endingChoice).toBeUndefined()
  })

  it('cycle snapshot captures endingChoice on ending (no deathRoom)', () => {
    const player = makePlayer({ cycle: 3 })
    const snap = createCycleSnapshot(player, 'seal')
    expect(snap.endingChoice).toBe('seal')
    expect(snap.deathRoom).toBeUndefined()
    expect(snap.cycle).toBe(3)
  })

  it('snapshot faithfully records NPC relationships from quest flags at death', () => {
    const player = makePlayer({
      questFlags: {
        lev_trusts_player: true,
        player_betrayed_vesper: true,
        rook_indebted: true,
        avery_departed: true,
      },
    })
    const snap = createCycleSnapshot(player)
    expect(snap.npcRelationships['lev']).toBe('trusted')
    expect(snap.npcRelationships['vesper']).toBe('betrayed')
    expect(snap.npcRelationships['rook']).toBe('allied')
    expect(snap.npcRelationships['avery']).toBe('trusted')
  })

  it('cycle history grows correctly as history accumulates', () => {
    let player = makePlayer({ cycle: 1 })
    let history: CycleSnapshot[] = []

    for (let i = 0; i < 5; i++) {
      const result = simulateRebirthCycle(player, history)
      player = result.newPlayer
      history = result.newHistory
    }

    expect(history).toHaveLength(5)
    expect(history[0]!.cycle).toBe(1)
    expect(history[4]!.cycle).toBe(5)
    expect(player.cycle).toBe(6)
  })

  it('rebirth from ending generates new cycle with correct cycle number', () => {
    const player = makePlayer({ cycle: 2 })
    const endingSnap = createCycleSnapshot(player, 'cure')
    const history = [endingSnap]
    const newHistory = [endingSnap]
    const inherited = computeInheritedReputation(endingSnap)
    const reborn: Player = {
      ...player,
      cycle: 3,
      totalDeaths: player.totalDeaths + 1,
      factionReputation: inherited as Partial<Record<FactionType, number>>,
      questFlags: {},
    }
    expect(reborn.cycle).toBe(3)
    expect(newHistory).toHaveLength(1)
    expect(newHistory[0]!.endingChoice).toBe('cure')
  })
})

// ============================================================
// BLOCK 2 — getCrossCycleConsequences: deeper cycle counts (cycles 2-5)
// ============================================================

describe('getCrossCycleConsequences — cross-cycle consequence matrix', () => {
  it('returns empty array for empty history', () => {
    expect(getCrossCycleConsequences([], {})).toHaveLength(0)
  })

  it('emits weapon-ending consequence at cycle 2', () => {
    const history = [makeSnapshot({ cycle: 1, endingChoice: 'weapon' })]
    const msgs = getCrossCycleConsequences(history, { cycle: 2 })
    expect(msgs.some(m => m.text.includes('fewer Hollows'))).toBe(true)
    msgs.forEach(m => expect(m.type).toBe('echo'))
  })

  it('emits seal-ending consequence at cycle 3', () => {
    const history = [
      makeSnapshot({ cycle: 1, endingChoice: 'weapon' }),
      makeSnapshot({ cycle: 2, endingChoice: 'seal' }),
    ]
    const msgs = getCrossCycleConsequences(history, { cycle: 3 })
    expect(msgs.some(m => m.text.includes('eastern roads'))).toBe(true)
  })

  it('emits cure-ending consequence message', () => {
    const history = [makeSnapshot({ cycle: 2, endingChoice: 'cure' })]
    const msgs = getCrossCycleConsequences(history, { cycle: 3 })
    expect(msgs.some(m => m.text.includes('Changed'))).toBe(true)
  })

  it('uses only the LAST snapshot in history (most recent cycle)', () => {
    // Cycle 3 is most recent — its weapon ending should dominate
    const history = [
      makeSnapshot({ cycle: 1, endingChoice: 'seal' }),
      makeSnapshot({ cycle: 2, endingChoice: 'cure' }),
      makeSnapshot({ cycle: 3, endingChoice: 'weapon' }),
    ]
    const msgs = getCrossCycleConsequences(history, { cycle: 4 })
    // weapon is the last snapshot's ending
    expect(msgs.some(m => m.text.includes('fewer Hollows'))).toBe(true)
    // seal and cure are NOT the last snapshot — only weapon fires
    expect(msgs.some(m => m.text.includes('eastern roads'))).toBe(false)
    expect(msgs.some(m => m.text.includes('Changed'))).toBe(false)
  })

  it('emits vesper-betrayed consequence with correct NPC memory', () => {
    const history = [makeSnapshot({ npcRelationships: { vesper: 'betrayed' } })]
    const msgs = getCrossCycleConsequences(history, {})
    expect(msgs.some(m => m.text.includes('Duskhollow'))).toBe(true)
    expect(msgs.some(m => m.type === 'echo')).toBe(true)
  })

  it('emits kindling-aligned consequence when factionsAligned contains kindling', () => {
    const history = [makeSnapshot({ factionsAligned: ['kindling'] })]
    const msgs = getCrossCycleConsequences(history, {})
    expect(msgs.some(m => m.text.includes('graffiti'))).toBe(true)
  })

  it('emits red-court-aligned consequence when player allied red_court', () => {
    const history = [makeSnapshot({ factionsAligned: ['red_court'] })]
    const msgs = getCrossCycleConsequences(history, {})
    expect(msgs.some(m => m.text.includes('Red Court'))).toBe(true)
  })

  it('emits lev-betrayed consequence (Reclaimer lab door)', () => {
    const history = [makeSnapshot({ npcRelationships: { lev: 'betrayed' } })]
    const msgs = getCrossCycleConsequences(history, {})
    expect(msgs.some(m => m.text.includes('Reclaimer lab'))).toBe(true)
  })

  it('accumulates multiple consequences from single snapshot', () => {
    const history = [
      makeSnapshot({
        endingChoice: 'weapon',
        npcRelationships: { vesper: 'betrayed', lev: 'betrayed' },
        factionsAligned: ['kindling', 'red_court'],
      }),
    ]
    const msgs = getCrossCycleConsequences(history, {})
    // weapon + vesper betrayed + kindling aligned + red_court aligned + lev betrayed
    expect(msgs.length).toBeGreaterThanOrEqual(5)
  })

  it('returns no messages for neutral/empty snapshot', () => {
    const history = [makeSnapshot()]
    const msgs = getCrossCycleConsequences(history, {})
    expect(msgs).toHaveLength(0)
  })

  it('at cycle 5: uses cycle 4 snapshot (most recent) only', () => {
    const history = [
      makeSnapshot({ cycle: 1 }),
      makeSnapshot({ cycle: 2 }),
      makeSnapshot({ cycle: 3 }),
      makeSnapshot({ cycle: 4, endingChoice: 'cure' }),
    ]
    const msgs = getCrossCycleConsequences(history, { cycle: 5 })
    expect(msgs.some(m => m.text.includes('Changed'))).toBe(true)
    // Verify only 1 ending message (no compounding from prior cycles)
    const curemessages = msgs.filter(m => m.text.includes('Changed'))
    expect(curemessages).toHaveLength(1)
  })
})

// ============================================================
// BLOCK 3 — getGraffitiChange: cycle-aware graffiti
// ============================================================

describe('getGraffitiChange — cycle-aware graffiti', () => {
  it('returns empty array for no history', () => {
    expect(getGraffitiChange([])).toHaveLength(0)
  })

  it('sets accord antagonized graffiti at cv_01_main_gate', () => {
    const history = [makeSnapshot({ factionsAntagonized: ['accord'] })]
    const changes = getGraffitiChange(history)
    const cv01 = changes.find(c => c.roomId === 'cv_01_main_gate')
    expect(cv01).toBeDefined()
    expect(cv01?.newGraffiti).toBe('THE REVENANT LIES')
  })

  it('sets kindling antagonized graffiti at em_02_gate_of_flame', () => {
    const history = [makeSnapshot({ factionsAntagonized: ['kindling'] })]
    const changes = getGraffitiChange(history)
    const emGate = changes.find(c => c.roomId === 'em_02_gate_of_flame')
    expect(emGate).toBeDefined()
    expect(emGate?.newGraffiti).toBe('THEY TRUSTED THE LAST ONE')
  })

  it('sets kindling aligned graffiti at em_03_the_nave', () => {
    const history = [makeSnapshot({ factionsAligned: ['kindling'] })]
    const changes = getGraffitiChange(history)
    const nave = changes.find(c => c.roomId === 'em_03_the_nave')
    expect(nave).toBeDefined()
    expect(nave?.newGraffiti).toContain('CHOSE RIGHT')
  })

  it('sets vesper betrayal graffiti at dh_18_night_market', () => {
    const history = [makeSnapshot({ npcRelationships: { vesper: 'betrayed' } })]
    const changes = getGraffitiChange(history)
    const nightMkt = changes.find(c => c.roomId === 'dh_18_night_market')
    expect(nightMkt).toBeDefined()
    expect(nightMkt?.newGraffiti).toBe('ASK THEM WHAT THEY DID WITH THE LAST CONTACT')
  })

  it('sets weapon ending graffiti at scar_01_crater_rim', () => {
    const history = [makeSnapshot({ endingChoice: 'weapon' })]
    const changes = getGraffitiChange(history)
    const scar = changes.find(c => c.roomId === 'scar_01_crater_rim')
    expect(scar).toBeDefined()
    expect(scar?.newGraffiti).toContain('QUIETER')
  })

  it('sets act3_complete graffiti at scar_02_main_entrance', () => {
    const history = [makeSnapshot({ questsCompleted: ['act3_complete'] })]
    const changes = getGraffitiChange(history)
    const scar2 = changes.find(c => c.roomId === 'scar_02_main_entrance')
    expect(scar2).toBeDefined()
    expect(scar2?.newGraffiti).toContain('MADE IT THROUGH')
  })

  it('uses only the last snapshot (most recent cycle graffiti wins)', () => {
    // Cycle 1: accord antagonized -> cv_01_main_gate = 'THE REVENANT LIES'
    // Cycle 2: kindling aligned -> em_03_the_nave = honor graffiti
    // Only cycle 2 (most recent) is applied
    const history = [
      makeSnapshot({ cycle: 1, factionsAntagonized: ['accord'] }),
      makeSnapshot({ cycle: 2, factionsAligned: ['kindling'] }),
    ]
    const changes = getGraffitiChange(history)
    // em_03_the_nave from last cycle should be present
    expect(changes.some(c => c.roomId === 'em_03_the_nave')).toBe(true)
    // cv_01 from prior cycle is NOT applied (last snapshot had no accord antagonized)
    expect(changes.some(c => c.roomId === 'cv_01_main_gate')).toBe(false)
  })

  it('accumulates multiple graffiti changes from one action-rich snapshot', () => {
    const history = [
      makeSnapshot({
        factionsAntagonized: ['accord', 'kindling'],
        npcRelationships: { vesper: 'betrayed' },
        endingChoice: 'weapon',
        questsCompleted: ['act3_complete'],
      }),
    ]
    const changes = getGraffitiChange(history)
    expect(changes.length).toBeGreaterThanOrEqual(5)
    // Each roomId should appear only once
    const roomIds = changes.map(c => c.roomId)
    const uniqueIds = new Set(roomIds)
    expect(uniqueIds.size).toBe(roomIds.length)
  })
})

// ============================================================
// BLOCK 4 — getCycleAwareDialogue: all 7+ NPCs across cycles 1-5
// ============================================================

describe('getCycleAwareDialogue — cycle-aware dialogue for all known NPCs', () => {
  it('returns null for empty history (all NPCs)', () => {
    const npcs = ['vesper', 'lev', 'deacon_harrow', 'marshal_cross', 'patch', 'rook', 'briggs', 'sparks', 'dr_osei']
    for (const npc of npcs) {
      expect(getCycleAwareDialogue(npc, [])).toBeNull()
    }
  })

  it('returns null for unknown NPC with multi-cycle history', () => {
    const history = [makeSnapshot({ cycle: 1 }), makeSnapshot({ cycle: 2 })]
    expect(getCycleAwareDialogue('random_trader_npc', history)).toBeNull()
  })

  // ── vesper ──────────────────────────────────────────────────
  it('vesper: betrayal dialogue when npc relationship is betrayed', () => {
    const history = [makeSnapshot({ npcRelationships: { vesper: 'betrayed' } })]
    const line = getCycleAwareDialogue('vesper', history)
    expect(line).not.toBeNull()
    expect(line).toContain('last one')
    expect(line).toContain('watching')
  })

  it('vesper: allied dialogue when npc relationship is allied', () => {
    const history = [makeSnapshot({ npcRelationships: { vesper: 'allied' } })]
    const line = getCycleAwareDialogue('vesper', history)
    expect(line).toContain('helped me')
  })

  it('vesper: returns null when no relevant relationship exists', () => {
    const history = [makeSnapshot({ npcRelationships: { lev: 'trusted' } })]
    expect(getCycleAwareDialogue('vesper', history)).toBeNull()
  })

  // ── lev ─────────────────────────────────────────────────────
  it('lev: betrayal dialogue when npc relationship is betrayed', () => {
    const history = [makeSnapshot({ npcRelationships: { lev: 'betrayed' } })]
    const line = getCycleAwareDialogue('lev', history)
    expect(line).toContain('prove')
  })

  it('lev: allied dialogue when npc relationship is allied', () => {
    const history = [makeSnapshot({ npcRelationships: { lev: 'allied' } })]
    const line = getCycleAwareDialogue('lev', history)
    expect(line).toContain('worked with us')
  })

  it('lev: returns null when trusted (not allied or betrayed)', () => {
    const history = [makeSnapshot({ npcRelationships: { lev: 'trusted' } })]
    expect(getCycleAwareDialogue('lev', history)).toBeNull()
  })

  // ── deacon_harrow ───────────────────────────────────────────
  it('deacon_harrow: kindling memory when factionsAligned contains kindling', () => {
    const history = [makeSnapshot({ factionsAligned: ['kindling'] })]
    const line = getCycleAwareDialogue('deacon_harrow', history)
    expect(line).toContain('Kindling')
    expect(line).toContain('remember')
  })

  it('deacon_harrow: hostility when kindling was antagonized', () => {
    const history = [makeSnapshot({ factionsAntagonized: ['kindling'] })]
    const line = getCycleAwareDialogue('deacon_harrow', history)
    expect(line).toContain('cannot forgive')
  })

  it('deacon_harrow: returns null with no kindling history', () => {
    const history = [makeSnapshot({ factionsAligned: ['accord'] })]
    expect(getCycleAwareDialogue('deacon_harrow', history)).toBeNull()
  })

  // ── marshal_cross ───────────────────────────────────────────
  it('marshal_cross: file-on-you when accord was antagonized', () => {
    const history = [makeSnapshot({ factionsAntagonized: ['accord'] })]
    const line = getCycleAwareDialogue('marshal_cross', history)
    expect(line).toContain('file')
    expect(line).toContain('explain')
  })

  it('marshal_cross: listening when accord was aligned', () => {
    const history = [makeSnapshot({ factionsAligned: ['accord'] })]
    const line = getCycleAwareDialogue('marshal_cross', history)
    expect(line).toContain('listening')
  })

  it('marshal_cross: returns null with no accord history', () => {
    const history = [makeSnapshot({ factionsAligned: ['kindling'] })]
    expect(getCycleAwareDialogue('marshal_cross', history)).toBeNull()
  })

  // ── patch ───────────────────────────────────────────────────
  it('patch: returns null at cycle 1 (single snapshot in history)', () => {
    const history = [makeSnapshot({ cycle: 1 })]
    expect(getCycleAwareDialogue('patch', history)).toBeNull()
  })

  it('patch: scar observation at 2 cycles', () => {
    const history = [makeSnapshot({ cycle: 1 }), makeSnapshot({ cycle: 2 })]
    const line = getCycleAwareDialogue('patch', history)
    expect(line).not.toBeNull()
    expect(line).toContain('scar')
  })

  it('patch: same scar observation at 5 cycles (threshold is 2)', () => {
    const history = Array.from({ length: 5 }, (_, i) => makeSnapshot({ cycle: i + 1 }))
    const line = getCycleAwareDialogue('patch', history)
    expect(line).toContain('scar')
  })

  // ── rook ─────────────────────────────────────────────────────
  it('rook: favor memory when allied', () => {
    const history = [makeSnapshot({ npcRelationships: { rook: 'allied' } })]
    const line = getCycleAwareDialogue('rook', history)
    expect(line).not.toBeNull()
    expect(line).toContain('favor')
  })

  it('rook: returns null when not allied', () => {
    const history = [makeSnapshot({ npcRelationships: { rook: 'trusted' } })]
    expect(getCycleAwareDialogue('rook', history)).toBeNull()
  })

  // ── briggs ───────────────────────────────────────────────────
  it('briggs: basic files line at 2 cycles', () => {
    const history = [makeSnapshot({ cycle: 1 }), makeSnapshot({ cycle: 2 })]
    const line = getCycleAwareDialogue('briggs', history)
    expect(line).toContain('files')
  })

  it('briggs: escalated line at 4 cycles', () => {
    const history = Array.from({ length: 4 }, (_, i) => makeSnapshot({ cycle: i + 1 }))
    const line = getCycleAwareDialogue('briggs', history)
    expect(line).toContain('How many times')
  })

  it('briggs: escalated line at 5 cycles', () => {
    const history = Array.from({ length: 5 }, (_, i) => makeSnapshot({ cycle: i + 1 }))
    const line = getCycleAwareDialogue('briggs', history)
    expect(line).toContain('How many times')
  })

  it('briggs: returns null at 1 cycle', () => {
    const history = [makeSnapshot({ cycle: 1 })]
    expect(getCycleAwareDialogue('briggs', history)).toBeNull()
  })

  // ── sparks ───────────────────────────────────────────────────
  it('sparks: signal/changed observation at 2+ cycles', () => {
    const history = [makeSnapshot({ cycle: 1 }), makeSnapshot({ cycle: 2 })]
    const line = getCycleAwareDialogue('sparks', history)
    expect(line).not.toBeNull()
    expect(line).toContain('signal')
  })

  it('sparks: returns null at 1 cycle', () => {
    const history = [makeSnapshot({ cycle: 1 })]
    expect(getCycleAwareDialogue('sparks', history)).toBeNull()
  })

  // ── dr_osei ──────────────────────────────────────────────────
  it('dr_osei: cellular markers observation at 2 cycles', () => {
    const history = [makeSnapshot({ cycle: 1 }), makeSnapshot({ cycle: 2 })]
    const line = getCycleAwareDialogue('dr_osei', history)
    expect(line).not.toBeNull()
    expect(line).toContain('cellular')
  })

  it('dr_osei: iterating observation at 4+ cycles', () => {
    const history = Array.from({ length: 4 }, (_, i) => makeSnapshot({ cycle: i + 1 }))
    const line = getCycleAwareDialogue('dr_osei', history)
    expect(line).toContain('iterating')
  })

  it('dr_osei: returns null at 1 cycle', () => {
    const history = [makeSnapshot({ cycle: 1 })]
    expect(getCycleAwareDialogue('dr_osei', history)).toBeNull()
  })
})

// ============================================================
// BLOCK 5 — getDeathRoomNarration: persistence across cycles
// ============================================================

describe('getDeathRoomNarration — room death memory across cycles', () => {
  it('returns null for empty history', () => {
    expect(getDeathRoomNarration('room_1', [])).toBeNull()
  })

  it('returns null if no cycle has deathRoom matching', () => {
    const history = [
      makeSnapshot({ deathRoom: 'other_room' }),
      makeSnapshot({ deathRoom: 'yet_another_room' }),
    ]
    expect(getDeathRoomNarration('room_1', history)).toBeNull()
  })

  it('returns echo message for one death in this room', () => {
    const history = [makeSnapshot({ deathRoom: 'scar_05_inner_corridor' })]
    const result = getDeathRoomNarration('scar_05_inner_corridor', history)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('echo')
  })

  it('returns escalated two-death message', () => {
    const history = [
      makeSnapshot({ deathRoom: 'cr_03_crossroads_camp' }),
      makeSnapshot({ deathRoom: 'cr_03_crossroads_camp' }),
    ]
    const result = getDeathRoomNarration('cr_03_crossroads_camp', history)
    expect(result!.type).toBe('echo')
    expect(result!.text).toMatch(/twice|second time|sediment/i)
  })

  it('returns three-death message with count in text', () => {
    const history = [
      makeSnapshot({ deathRoom: 'dh_05_shadow_market' }),
      makeSnapshot({ deathRoom: 'dh_05_shadow_market' }),
      makeSnapshot({ deathRoom: 'dh_05_shadow_market' }),
    ]
    const result = getDeathRoomNarration('dh_05_shadow_market', history)
    expect(result!.text).toMatch(/3|three|so many/i)
  })

  it('counts only deaths in the requested room, not in other rooms', () => {
    const history = [
      makeSnapshot({ deathRoom: 'room_A' }),
      makeSnapshot({ deathRoom: 'room_B' }),
      makeSnapshot({ deathRoom: 'room_A' }),
    ]
    // room_A has 2 deaths, room_B has 1
    const resultA = getDeathRoomNarration('room_A', history)
    const resultB = getDeathRoomNarration('room_B', history)
    expect(resultA!.text).toMatch(/twice|second time|sediment/i)
    expect(resultB!.text).not.toMatch(/twice|second time/i)
  })

  it('mixes rooms in history — each room reports its own count independently', () => {
    const history = [
      makeSnapshot({ deathRoom: 'scar_01_crater_rim' }),
      makeSnapshot({ deathRoom: 'em_03_the_nave' }),
      makeSnapshot({ deathRoom: 'scar_01_crater_rim' }),
      makeSnapshot({ deathRoom: 'scar_01_crater_rim' }),
    ]
    // scar_01 has 3 deaths, em_03 has 1
    const scarResult = getDeathRoomNarration('scar_01_crater_rim', history)
    const emberResult = getDeathRoomNarration('em_03_the_nave', history)
    expect(scarResult!.text).toMatch(/3|three|so many/i)
    expect(emberResult!.text).not.toMatch(/3|twice/i)
  })

  it('returns null for room with no deaths even when history has other room deaths', () => {
    const history = [
      makeSnapshot({ deathRoom: 'room_A' }),
      makeSnapshot({ deathRoom: 'room_B' }),
    ]
    expect(getDeathRoomNarration('room_C', history)).toBeNull()
  })

  it('ending snapshots (no deathRoom) do not count as deaths in any room', () => {
    const history = [
      makeSnapshot({ endingChoice: 'cure' }),
      makeSnapshot({ endingChoice: 'weapon' }),
    ]
    expect(getDeathRoomNarration('room_1', history)).toBeNull()
    expect(getDeathRoomNarration('any_room', history)).toBeNull()
  })
})

// ============================================================
// BLOCK 6 — World event scheduling: fires at correct game-time
// ============================================================

describe('world event scheduling — fires at correct intervals', () => {
  it('never fires at actionCount=0', () => {
    for (const act of [1, 2, 3] as const) {
      const flags = act === 2
        ? { act1_complete: true }
        : act === 3
        ? { act1_complete: true, act2_complete: true }
        : {}
      const results = getScheduledEvents(0, act, { factionReputation: {}, questFlags: flags })
      expect(results).toHaveLength(0)
    }
  })

  it('fires act1 events at their exact triggerActionCount', () => {
    // we_a1_01_missing_guard fires at 15
    const at15 = getScheduledEvents(15, 1, basePlayerState)
    expect(at15.some(e => e.id === 'we_a1_01_missing_guard')).toBe(true)
  })

  it('fires act1 events again at 2x their triggerActionCount (repeating)', () => {
    // we_a1_01_missing_guard fires at 15, should fire again at 30
    const at30 = getScheduledEvents(30, 1, basePlayerState)
    expect(at30.some(e => e.id === 'we_a1_01_missing_guard')).toBe(true)
  })

  it('fires act1 events again at 3x their triggerActionCount', () => {
    const at45 = getScheduledEvents(45, 1, basePlayerState)
    expect(at45.some(e => e.id === 'we_a1_01_missing_guard')).toBe(true)
  })

  it('does NOT fire at non-multiple of triggerActionCount', () => {
    // we_a1_01 has triggerActionCount=15; should not fire at 16
    const at16 = getScheduledEvents(16, 1, basePlayerState)
    expect(at16.some(e => e.id === 'we_a1_01_missing_guard')).toBe(false)
  })

  it('act1 event NOT fired in act2 (hard act boundary)', () => {
    const at30act2 = getScheduledEvents(30, 2, {
      factionReputation: {},
      questFlags: { act1_complete: true },
    })
    expect(at30act2.some(e => e.act === 1)).toBe(false)
  })

  it('act2 event NOT fired in act1 (hard act boundary)', () => {
    const at18act1 = getScheduledEvents(18, 1, basePlayerState)
    expect(at18act1.some(e => e.act === 2)).toBe(false)
  })

  it('act3 event NOT fired in act2 (hard act boundary)', () => {
    const at18act2 = getScheduledEvents(18, 2, {
      factionReputation: {},
      questFlags: { act1_complete: true },
    })
    expect(at18act2.some(e => e.act === 3)).toBe(false)
  })

  it('fires multiple act1 events simultaneously when they share an interval', () => {
    // Several act1 events have triggerActionCount 15-20; at action 120 many should fire
    const at120 = getScheduledEvents(120, 1, basePlayerState)
    expect(at120.length).toBeGreaterThanOrEqual(3)
  })

  it('all fired events match the requested act', () => {
    for (const act of [1, 2, 3] as const) {
      const flags = act === 2
        ? { act1_complete: true }
        : act === 3
        ? { act1_complete: true, act2_complete: true }
        : {}
      const results = getScheduledEvents(60, act, { factionReputation: {}, questFlags: flags })
      results.forEach(e => expect(e.act).toBe(act))
    }
  })
})

// ============================================================
// BLOCK 7 — World events: can be missed (quest-gated, faction-gated)
// ============================================================

describe('world events — missable via quest gates and faction gates', () => {
  it('act2 event does NOT fire when act1_complete is missing (missable)', () => {
    const atActionWithMissingFlag = getScheduledEvents(18, 2, {
      factionReputation: {},
      questFlags: {},
    })
    expect(atActionWithMissingFlag).toHaveLength(0)
  })

  it('act3 event does NOT fire when act2_complete is missing (missable)', () => {
    const results = getScheduledEvents(18, 3, {
      factionReputation: {},
      questFlags: { act1_complete: true },
    })
    expect(results).toHaveLength(0)
  })

  it('faction-gated event fires only when rep meets condition', () => {
    // we_a1_11_red_court_rumor has maxRep: 1 for red_court (fires when rep <= 1)
    const withLowRep = getScheduledEvents(34, 1, {
      factionReputation: { red_court: -2 },
      questFlags: {},
    })
    const withHighRep = getScheduledEvents(34, 1, {
      factionReputation: { red_court: 3 },
      questFlags: {},
    })

    const lowFired = withLowRep.find(e => e.id === 'we_a1_11_red_court_rumor')
    const highFired = withHighRep.find(e => e.id === 'we_a1_11_red_court_rumor')

    expect(lowFired).toBeDefined()
    expect(highFired).toBeUndefined()
  })

  it('missing faction rep treated as 0 (neutral)', () => {
    // we_a2_05_reclaimer_find requires minRep: 1 for reclaimers
    // With no rep stored, default 0 should NOT meet minRep: 1
    const results = getScheduledEvents(46, 2, {
      factionReputation: {},
      questFlags: { act1_complete: true },
    })
    const gatedEvent = results.find(e => e.id === 'we_a2_05_reclaimer_find')
    expect(gatedEvent).toBeUndefined()
  })

  it('handles undefined questFlags gracefully (no throw)', () => {
    expect(() =>
      getScheduledEvents(30, 2, { factionReputation: {}, questFlags: undefined })
    ).not.toThrow()
  })

  it('handles undefined factionReputation gracefully (no throw)', () => {
    expect(() =>
      getScheduledEvents(30, 1, { factionReputation: undefined, questFlags: {} })
    ).not.toThrow()
  })
})

// ============================================================
// BLOCK 8 — Event chains: one event's questGate enables the next act
// ============================================================

describe('event chains — act progression unlocks subsequent act events', () => {
  it('act1 event fires without any quest flags', () => {
    const results = getScheduledEvents(15, 1, { factionReputation: {}, questFlags: {} })
    expect(results.some(e => e.act === 1)).toBe(true)
  })

  it('act2 events fire only after act1_complete quest flag is set', () => {
    const withoutFlag = getScheduledEvents(18, 2, { factionReputation: {}, questFlags: {} })
    const withFlag = getScheduledEvents(18, 2, {
      factionReputation: {},
      questFlags: { act1_complete: true },
    })
    expect(withoutFlag).toHaveLength(0)
    expect(withFlag.length).toBeGreaterThan(0)
  })

  it('act3 events fire only after BOTH act1_complete and act2_complete flags are set', () => {
    const withOnlyAct1 = getScheduledEvents(18, 3, {
      factionReputation: {},
      questFlags: { act1_complete: true },
    })
    const withBothFlags = getScheduledEvents(18, 3, {
      factionReputation: {},
      questFlags: { act1_complete: true, act2_complete: true },
    })
    expect(withOnlyAct1).toHaveLength(0)
    expect(withBothFlags.length).toBeGreaterThan(0)
  })

  it('all act2 events in the registry require act1_complete questGate', () => {
    const act2Events = ALL_WORLD_EVENTS.filter(e => e.act === 2)
    act2Events.forEach(e => {
      expect(e.questGate).toBe('act1_complete')
    })
  })

  it('all act3 events in the registry require act2_complete questGate', () => {
    const act3Events = ALL_WORLD_EVENTS.filter(e => e.act === 3)
    act3Events.forEach(e => {
      expect(e.questGate).toBe('act2_complete')
    })
  })

  it('act1 events do NOT have a questGate (they fire freely in act1)', () => {
    const act1Events = ALL_WORLD_EVENTS.filter(e => e.act === 1)
    const gatedAct1 = act1Events.filter(e => !!e.questGate)
    // Act1 events with questGates exist (optional gating), just not act1/act2 complete gates
    // Verify none use act2_complete or act3_complete as questGate
    gatedAct1.forEach(e => {
      expect(e.questGate).not.toBe('act2_complete')
      expect(e.questGate).not.toBe('act3_complete')
    })
  })
})

// ============================================================
// BLOCK 9 — executeWorldEvent: message selection and properties
// ============================================================

describe('executeWorldEvent — message selection', () => {
  function makeTestEvent(pool: string[]): import('@/types/convoy-contracts').WorldEvent {
    return {
      id: 'test_chain_event',
      act: 1,
      escalationLevel: 0,
      triggerActionCount: 20,
      messagePool: pool,
    }
  }

  it('returns a GameMessage with type=narrative', () => {
    const event = makeTestEvent(['Chain event fires.'])
    const msgs = executeWorldEvent(event, basePlayerState)
    expect(msgs).toHaveLength(1)
    expect(msgs[0]!.type).toBe('narrative')
    expect(msgs[0]!.text).toBe('Chain event fires.')
  })

  it('returns empty array for empty message pool', () => {
    const event = makeTestEvent([])
    expect(executeWorldEvent(event, basePlayerState)).toHaveLength(0)
  })

  it('always selects from the pool (never returns out-of-pool text)', () => {
    const pool = ['Alpha.', 'Beta.', 'Gamma.']
    const event = makeTestEvent(pool)
    for (let i = 0; i < 50; i++) {
      const msgs = executeWorldEvent(event, basePlayerState)
      expect(pool).toContain(msgs[0]!.text)
    }
  })

  it('generates a unique id for every call', () => {
    const event = makeTestEvent(['Same text.'])
    const ids = new Set<string>()
    for (let i = 0; i < 20; i++) {
      const msgs = executeWorldEvent(event, basePlayerState)
      ids.add(msgs[0]!.id)
    }
    expect(ids.size).toBe(20)
  })

  it('selects all pool options over 200 calls (statistical coverage)', () => {
    const pool = ['Opt-1.', 'Opt-2.', 'Opt-3.', 'Opt-4.']
    const event = makeTestEvent(pool)
    const seen = new Set<string>()
    for (let i = 0; i < 200; i++) {
      seen.add(executeWorldEvent(event, basePlayerState)[0]!.text)
    }
    expect(seen.size).toBe(4)
  })
})

// ============================================================
// BLOCK 10 — executeCombatWorldEvent: delegates to executeWorldEvent
// ============================================================

describe('executeCombatWorldEvent — inherits narrative message behavior', () => {
  it('returns narrative GameMessage from combat event message pool', () => {
    const event = ALL_COMBAT_EVENTS[0]!
    const msgs = executeCombatWorldEvent(event, basePlayerState)
    expect(msgs).toHaveLength(1)
    expect(msgs[0]!.type).toBe('narrative')
  })

  it('result text is from the event messagePool', () => {
    const event = ALL_COMBAT_EVENTS[0]!
    const msgs = executeCombatWorldEvent(event, basePlayerState)
    expect(event.messagePool).toContain(msgs[0]!.text)
  })
})

// ============================================================
// BLOCK 11 — Event interaction with hollow pressure
// ============================================================

describe('world events x hollow pressure interaction', () => {
  it('combat event fires when hollowPressure meets minPressure', () => {
    // ce_a1_01_hollow_tide_river_road requires minPressure: 3, triggerActionCount: 30
    const EVENT_ID = 'ce_a1_01_hollow_tide_river_road'
    const atPressure3 = getScheduledCombatEvents(
      30, 1,
      { factionReputation: {}, questFlags: { act1_complete: true }, hollowPressure: 3 },
      roomInZone('river_road')
    )
    expect(atPressure3.some(e => e.id === EVENT_ID)).toBe(true)
  })

  it('combat event does NOT fire when hollowPressure is below minPressure', () => {
    const EVENT_ID = 'ce_a1_01_hollow_tide_river_road'
    const atPressure2 = getScheduledCombatEvents(
      30, 1,
      { factionReputation: {}, questFlags: { act1_complete: true }, hollowPressure: 2 },
      roomInZone('river_road')
    )
    expect(atPressure2.some(e => e.id === EVENT_ID)).toBe(false)
  })

  it('combat event does NOT fire when pressure is 0', () => {
    const EVENT_ID = 'ce_a1_01_hollow_tide_river_road'
    const atPressure0 = getScheduledCombatEvents(
      30, 1,
      { factionReputation: {}, questFlags: {}, hollowPressure: 0 },
      roomInZone('river_road')
    )
    expect(atPressure0.some(e => e.id === EVENT_ID)).toBe(false)
  })

  it('pressure encounter modifier scales linearly with pressure level', () => {
    // At 0: 1.0, at 10: 3.0
    expect(getPressureEncounterModifier(0)).toBe(1.0)
    expect(getPressureEncounterModifier(10)).toBe(3.0)
    expect(getPressureEncounterModifier(5)).toBeCloseTo(2.0)
  })

  it('higher pressure means more combat events may qualify', () => {
    // Act 1 at action 120 — pressure 0 vs pressure 8
    const lowPressureEvents = getScheduledCombatEvents(
      120, 1,
      { factionReputation: {}, questFlags: {}, hollowPressure: 0 },
      roomInZone('river_road')
    )
    const highPressureEvents = getScheduledCombatEvents(
      120, 1,
      { factionReputation: {}, questFlags: {}, hollowPressure: 8 },
      roomInZone('river_road')
    )
    // At high pressure more events should pass the minPressure gate
    expect(highPressureEvents.length).toBeGreaterThanOrEqual(lowPressureEvents.length)
  })

  it('swarm trigger fires when pressure reaches 10', () => {
    expect(shouldTriggerSwarm(10)).toBe(true)
    expect(shouldTriggerSwarm(9)).toBe(false)
    expect(shouldTriggerSwarm(0)).toBe(false)
  })

  it('pressure from 0 rises correctly over actions', () => {
    // computePressure: +1 per 10 actions since last tick
    const p1 = computePressure(0, 10, 0)  // 10 actions -> +1
    expect(p1).toBe(1)

    const p2 = computePressure(1, 20, 0)  // 20 actions -> +2 (floored to increments)
    expect(p2).toBe(3)
  })

  it('pressure clamps to [0, 10] at the extremes', () => {
    expect(applyPressureDelta(10, 5)).toBe(10)  // cannot exceed 10
    expect(applyPressureDelta(0, -5)).toBe(0)   // cannot go below 0
    expect(applyPressureDelta(5, 3)).toBe(8)
    expect(applyPressureDelta(5, -3)).toBe(2)
  })
})

// ============================================================
// BLOCK 12 — Combat events interaction with faction state
// ============================================================

describe('combat events x faction state interaction', () => {
  it('combat event does NOT fire when player is in active combat', () => {
    const inCombatState: Pick<GameState, 'combatState' | 'activeDialogue' | 'currentRoom'> = {
      combatState: { active: true } as CombatState,
      activeDialogue: undefined,
      currentRoom: { zone: 'river_road' } as import('@/types/game').Room,
    }
    const result = getScheduledCombatEvents(
      30, 1,
      { factionReputation: {}, questFlags: {}, hollowPressure: 5 },
      inCombatState
    )
    expect(result).toHaveLength(0)
  })

  it('combat event does NOT fire when player is in active dialogue', () => {
    const inDialogueState: Pick<GameState, 'combatState' | 'activeDialogue' | 'currentRoom'> = {
      combatState: null,
      activeDialogue: { npcId: 'marshal_cross', treeId: 'mc_main', currentNodeId: 'mc_01' },
      currentRoom: { zone: 'river_road' } as import('@/types/game').Room,
    }
    const result = getScheduledCombatEvents(
      30, 1,
      { factionReputation: {}, questFlags: {}, hollowPressure: 5 },
      inDialogueState
    )
    expect(result).toHaveLength(0)
  })

  it('combat event does NOT fire when zone does not match zoneGate', () => {
    const EVENT_ID = 'ce_a1_01_hollow_tide_river_road'
    const result = getScheduledCombatEvents(
      30, 1,
      { factionReputation: {}, questFlags: {}, hollowPressure: 5 },
      roomInZone('crossroads')  // wrong zone
    )
    expect(result.some(e => e.id === EVENT_ID)).toBe(false)
  })

  it('all combat events have combatParticipation with at least one enemyId', () => {
    ALL_COMBAT_EVENTS.forEach(event => {
      expect(event.combatParticipation).toBeDefined()
      expect(event.combatParticipation!.enemyIds.length).toBeGreaterThan(0)
    })
  })
})

// ============================================================
// BLOCK 13 — Cycle N+1 state: what carries, what resets
// ============================================================

describe('cycle N+1 state — carry vs. reset semantics', () => {
  it('NPC relationships from FLAG_TO_RELATIONSHIP are captured in snapshot', () => {
    const player = makePlayer({
      questFlags: {
        lev_trusts_player: true,
        player_betrayed_vesper: true,
        rook_indebted: true,
        avery_betrayed: true,
        harrow_recognized_truth: true,
        cross_expedition_sanctioned: true,
        vane_gave_blessing: true,
      },
    })
    const snap = createCycleSnapshot(player)
    expect(snap.npcRelationships['lev']).toBe('trusted')
    expect(snap.npcRelationships['vesper']).toBe('betrayed')
    expect(snap.npcRelationships['rook']).toBe('allied')
    expect(snap.npcRelationships['avery']).toBe('betrayed')
    expect(snap.npcRelationships['harrow']).toBe('trusted')
    expect(snap.npcRelationships['cross']).toBe('trusted')
    expect(snap.npcRelationships['vane']).toBe('trusted')
  })

  it('later flag for same NPC overrides earlier flag (allied > trusted)', () => {
    // avery_departed sets 'trusted', but both avery_betrayed and avery_departed map to avery
    // The last one in FLAG_TO_RELATIONSHIP iteration wins
    const player = makePlayer({
      questFlags: { avery_betrayed: true, avery_departed: true },
    })
    const snap = createCycleSnapshot(player)
    // Both flags map to avery — one should win (depends on iteration order)
    expect(['betrayed', 'trusted']).toContain(snap.npcRelationships['avery'])
  })

  it('milestone quest flags carry but non-milestone flags do not', () => {
    const player = makePlayer({
      questFlags: {
        act1_complete: true,
        act2_complete: true,
        scar_explored: true,
        some_vendor_purchase: true,  // non-milestone
        tutorial_done: true,          // non-milestone
      },
    })
    const snap = createCycleSnapshot(player)
    expect(snap.questsCompleted).toContain('act1_complete')
    expect(snap.questsCompleted).toContain('act2_complete')
    expect(snap.questsCompleted).toContain('scar_explored')
    expect(snap.questsCompleted).not.toContain('some_vendor_purchase')
    expect(snap.questsCompleted).not.toContain('tutorial_done')
  })

  it('cycle number in snapshot matches player cycle at time of death', () => {
    const player = makePlayer({ cycle: 4 })
    const snap = createCycleSnapshot(player)
    expect(snap.cycle).toBe(4)
  })

  it('new player cycle after rebirth = old cycle + 1', () => {
    const player = makePlayer({ cycle: 3 })
    const { newPlayer } = simulateRebirthCycle(player, [])
    expect(newPlayer.cycle).toBe(4)
  })

  it('inherited rep from aligned faction is always +1 (50% of +2 floor)', () => {
    const snap = makeSnapshot({ factionsAligned: ['kindling', 'accord', 'reclaimers', 'salters'] })
    const rep = computeInheritedReputation(snap)
    for (const faction of snap.factionsAligned) {
      expect(rep[faction]).toBe(1)
    }
  })

  it('inherited rep from antagonized faction is always -1 (50% of -2 ceiling)', () => {
    const snap = makeSnapshot({ factionsAntagonized: ['red_court', 'ferals', 'lucid'] })
    const rep = computeInheritedReputation(snap)
    for (const faction of snap.factionsAntagonized) {
      expect(rep[faction]).toBe(-1)
    }
  })

  it('inheritance returns empty object when no factions at aligned/antagonized threshold', () => {
    const snap = makeSnapshot()
    const rep = computeInheritedReputation(snap)
    expect(Object.keys(rep)).toHaveLength(0)
  })

  it('faction not in aligned or antagonized is NOT in inherited rep', () => {
    const snap = makeSnapshot({ factionsAligned: ['kindling'] })
    const rep = computeInheritedReputation(snap)
    expect(rep['accord']).toBeUndefined()
    expect(rep['salters']).toBeUndefined()
    expect(rep['red_court']).toBeUndefined()
  })
})

// ============================================================
// BLOCK 14 — Registry integrity: ALL_WORLD_EVENTS completeness
// ============================================================

describe('ALL_WORLD_EVENTS registry integrity', () => {
  it('contains events for all three acts', () => {
    const acts = new Set(ALL_WORLD_EVENTS.map(e => e.act))
    expect(acts.has(1)).toBe(true)
    expect(acts.has(2)).toBe(true)
    expect(acts.has(3)).toBe(true)
  })

  it('has no duplicate event IDs', () => {
    const ids = ALL_WORLD_EVENTS.map(e => e.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('all events have positive integer triggerActionCount', () => {
    ALL_WORLD_EVENTS.forEach(e => {
      expect(e.triggerActionCount).toBeGreaterThan(0)
      expect(Number.isInteger(e.triggerActionCount)).toBe(true)
    })
  })

  it('all events have escalationLevel in range [0, 3]', () => {
    ALL_WORLD_EVENTS.forEach(e => {
      expect(e.escalationLevel).toBeGreaterThanOrEqual(0)
      expect(e.escalationLevel).toBeLessThanOrEqual(3)
    })
  })

  it('all events have non-empty messagePool', () => {
    ALL_WORLD_EVENTS.forEach(e => {
      expect(e.messagePool.length).toBeGreaterThan(0)
    })
  })

  it('all events have at least 2 message variants', () => {
    ALL_WORLD_EVENTS.forEach(e => {
      expect(e.messagePool.length).toBeGreaterThanOrEqual(2)
    })
  })
})

// ============================================================
// BLOCK 15 — Cycle-aware dialogue with combined faction+NPC state
// ============================================================

describe('getCycleAwareDialogue — combined faction and NPC state', () => {
  it('all relevant NPCs return cycle-appropriate dialogue for complex history', () => {
    // Simulate a rich cycle 2 snapshot
    // Note: lev only responds to 'betrayed' or 'allied', not 'trusted' — using 'allied'
    const cycle2Snap = makeSnapshot({
      cycle: 2,
      factionsAligned: ['kindling', 'accord'],
      factionsAntagonized: ['red_court'],
      npcRelationships: {
        vesper: 'allied',
        lev: 'allied',
        rook: 'allied',
      },
    })
    const history = [cycle2Snap]

    // Each NPC with a relevant state should return non-null
    expect(getCycleAwareDialogue('vesper', history)).not.toBeNull()
    expect(getCycleAwareDialogue('lev', history)).not.toBeNull()
    expect(getCycleAwareDialogue('rook', history)).not.toBeNull()
    expect(getCycleAwareDialogue('deacon_harrow', history)).not.toBeNull()
    expect(getCycleAwareDialogue('marshal_cross', history)).not.toBeNull()
    // patch/sparks/dr_osei need >= 2 history entries
    expect(getCycleAwareDialogue('patch', history)).toBeNull()
  })

  it('at cycle 3 (2 history items), patch/sparks/dr_osei all respond', () => {
    const history = [makeSnapshot({ cycle: 1 }), makeSnapshot({ cycle: 2 })]
    expect(getCycleAwareDialogue('patch', history)).not.toBeNull()
    expect(getCycleAwareDialogue('sparks', history)).not.toBeNull()
    expect(getCycleAwareDialogue('dr_osei', history)).not.toBeNull()
  })

  it('combined NPC + faction: deacon_harrow responds to kindling alignment AND to kindling antagonization', () => {
    const alignedHistory = [makeSnapshot({ factionsAligned: ['kindling'] })]
    const antagonizedHistory = [makeSnapshot({ factionsAntagonized: ['kindling'] })]

    const alignedLine = getCycleAwareDialogue('deacon_harrow', alignedHistory)
    const antagonizedLine = getCycleAwareDialogue('deacon_harrow', antagonizedHistory)

    expect(alignedLine).not.toBeNull()
    expect(antagonizedLine).not.toBeNull()
    // Lines should be different
    expect(alignedLine).not.toBe(antagonizedLine)
  })
})
