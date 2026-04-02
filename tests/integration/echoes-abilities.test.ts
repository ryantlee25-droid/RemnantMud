// ============================================================
// Integration tests for lib/echoes.ts and lib/abilities.ts
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { CycleSnapshot, Player, Enemy, CombatState } from '@/types/game'
import {
  createCycleSnapshot,
  computeInheritedReputation,
  getCrossCycleConsequences,
  getGraffitiChange,
  getCycleAwareDialogue,
  getDeathRoomNarration,
} from '@/lib/echoes'
import { CLASS_ABILITIES, resolveAbility } from '@/lib/abilities'

// ------------------------------------------------------------
// Dice mock — abilities.ts uses rollCheck + rollDamage
// ------------------------------------------------------------

vi.mock('@/lib/dice', () => ({
  statModifier: (stat: number) => Math.floor((stat - 10) / 2),
  rollCheck: vi.fn(() => ({ roll: 10, modifier: 0, total: 10, dc: 8, success: true, critical: false, fumble: false })),
  rollDamage: vi.fn(() => 3),
}))

import { rollCheck, rollDamage } from '@/lib/dice'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

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
    hp: 20, maxHp: 20, currentRoomId: 'room_1', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 2, totalDeaths: 1,
    factionReputation: {},
    questFlags: {},
    ...overrides,
  }
}

function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: 'shuffler', name: 'Shuffler', description: 'Shambling.',
    hp: 20, maxHp: 20, attack: 5, defense: 8, damage: [1, 3] as [number, number],
    xp: 10, loot: [],
    ...overrides,
  }
}

function makeCombatState(overrides: Partial<CombatState> = {}): CombatState {
  return {
    enemy: makeEnemy(),
    enemyHp: 20,
    playerGoesFirst: true,
    turn: 1,
    active: true,
    playerConditions: [],
    enemyConditions: [],
    abilityUsed: false,
    defendingThisTurn: false,
    waitingBonus: 0,
    ...overrides,
  }
}

// ============================================================
// echoes.ts — createCycleSnapshot
// ============================================================

describe('createCycleSnapshot', () => {
  it('records faction alignment from reputation >= 2', () => {
    const player = makePlayer({ factionReputation: { kindling: 3, accord: 1, red_court: -3 } })
    const snap = createCycleSnapshot(player)
    expect(snap.factionsAligned).toContain('kindling')
    expect(snap.factionsAligned).not.toContain('accord')
    expect(snap.factionsAntagonized).toContain('red_court')
  })

  it('records deathRoom when no endingChoice provided', () => {
    const player = makePlayer({ currentRoomId: 'scar_01_crater_rim' })
    const snap = createCycleSnapshot(player)
    expect(snap.deathRoom).toBe('scar_01_crater_rim')
    expect(snap.endingChoice).toBeUndefined()
  })

  it('records endingChoice and omits deathRoom', () => {
    const player = makePlayer()
    const snap = createCycleSnapshot(player, 'cure')
    expect(snap.endingChoice).toBe('cure')
    expect(snap.deathRoom).toBeUndefined()
  })

  it('filters questFlags to milestone flags only', () => {
    const player = makePlayer({
      questFlags: {
        act1_complete: true,
        some_minor_flag: true,
        lev_trusts_player: true,
      },
    })
    const snap = createCycleSnapshot(player)
    expect(snap.questsCompleted).toContain('act1_complete')
    expect(snap.questsCompleted).toContain('lev_trusts_player')
    expect(snap.questsCompleted).not.toContain('some_minor_flag')
  })

  it('derives npc relationships from quest flags', () => {
    const player = makePlayer({ questFlags: { player_betrayed_vesper: true, rook_indebted: true } })
    const snap = createCycleSnapshot(player)
    expect(snap.npcRelationships['vesper']).toBe('betrayed')
    expect(snap.npcRelationships['rook']).toBe('allied')
  })
})

// ============================================================
// echoes.ts — computeInheritedReputation
// ============================================================

describe('computeInheritedReputation', () => {
  it('inherits +1 for aligned factions and -1 for antagonized', () => {
    const snap = makeSnapshot({
      factionsAligned: ['kindling', 'accord'],
      factionsAntagonized: ['red_court'],
    })
    const rep = computeInheritedReputation(snap)
    expect(rep['kindling']).toBe(1)
    expect(rep['accord']).toBe(1)
    expect(rep['red_court']).toBe(-1)
  })

  it('returns empty object when no factions carry over', () => {
    const snap = makeSnapshot()
    const rep = computeInheritedReputation(snap)
    expect(Object.keys(rep)).toHaveLength(0)
  })
})

// ============================================================
// echoes.ts — getCrossCycleConsequences
// ============================================================

describe('getCrossCycleConsequences', () => {
  it('returns empty array for no history', () => {
    expect(getCrossCycleConsequences([], {})).toHaveLength(0)
  })

  it('emits weapon-ending consequence message', () => {
    const history = [makeSnapshot({ endingChoice: 'weapon' })]
    const msgs = getCrossCycleConsequences(history, {})
    expect(msgs.some(m => m.text.includes('fewer Hollows'))).toBe(true)
    expect(msgs[0]!.type).toBe('echo')
  })

  it('emits vesper-betrayed consequence message', () => {
    const history = [makeSnapshot({ npcRelationships: { vesper: 'betrayed' } })]
    const msgs = getCrossCycleConsequences(history, {})
    expect(msgs.some(m => m.text.includes('Duskhollow'))).toBe(true)
  })

  it('emits kindling-aligned consequence message', () => {
    const history = [makeSnapshot({ factionsAligned: ['kindling'] })]
    const msgs = getCrossCycleConsequences(history, {})
    expect(msgs.some(m => m.text.includes('graffiti'))).toBe(true)
  })

  it('emits seal-ending consequence message', () => {
    const history = [makeSnapshot({ endingChoice: 'seal' })]
    const msgs = getCrossCycleConsequences(history, {})
    expect(msgs.some(m => m.text.includes('eastern roads'))).toBe(true)
  })
})

// ============================================================
// echoes.ts — getGraffitiChange
// ============================================================

describe('getGraffitiChange', () => {
  it('returns empty array for no history', () => {
    expect(getGraffitiChange([])).toHaveLength(0)
  })

  it('adds graffiti when accord was antagonized', () => {
    const history = [makeSnapshot({ factionsAntagonized: ['accord'] })]
    const changes = getGraffitiChange(history)
    expect(changes.some(c => c.roomId === 'cv_01_main_gate' && c.newGraffiti === 'THE REVENANT LIES')).toBe(true)
  })

  it('adds graffiti when kindling was aligned', () => {
    const history = [makeSnapshot({ factionsAligned: ['kindling'] })]
    const changes = getGraffitiChange(history)
    expect(changes.some(c => c.roomId === 'em_03_the_nave')).toBe(true)
  })

  it('adds graffiti after weapon ending', () => {
    const history = [makeSnapshot({ endingChoice: 'weapon' })]
    const changes = getGraffitiChange(history)
    expect(changes.some(c => c.roomId === 'scar_01_crater_rim' && c.newGraffiti.includes('QUIETER'))).toBe(true)
  })

  it('adds graffiti after act3 completion', () => {
    const history = [makeSnapshot({ questsCompleted: ['act3_complete'] })]
    const changes = getGraffitiChange(history)
    expect(changes.some(c => c.roomId === 'scar_02_main_entrance')).toBe(true)
  })
})

// ============================================================
// echoes.ts — getCycleAwareDialogue
// ============================================================

describe('getCycleAwareDialogue', () => {
  it('returns null for empty history', () => {
    expect(getCycleAwareDialogue('vesper', [])).toBeNull()
  })

  it('returns null for unknown npc with history', () => {
    const history = [makeSnapshot()]
    expect(getCycleAwareDialogue('unknown_npc', history)).toBeNull()
  })

  it('returns betrayal line for vesper when betrayed', () => {
    const history = [makeSnapshot({ npcRelationships: { vesper: 'betrayed' } })]
    const line = getCycleAwareDialogue('vesper', history)
    expect(line).not.toBeNull()
    expect(line).toContain('last one')
  })

  it('returns allied line for vesper when allied', () => {
    const history = [makeSnapshot({ npcRelationships: { vesper: 'allied' } })]
    const line = getCycleAwareDialogue('vesper', history)
    expect(line).toContain('helped me')
  })

  it('returns recognition line for lev when betrayed', () => {
    const history = [makeSnapshot({ npcRelationships: { lev: 'betrayed' } })]
    const line = getCycleAwareDialogue('lev', history)
    expect(line).toContain('prove')
  })

  it('returns escalated line for briggs at 4+ cycles', () => {
    const history = [
      makeSnapshot({ cycle: 1 }),
      makeSnapshot({ cycle: 2 }),
      makeSnapshot({ cycle: 3 }),
      makeSnapshot({ cycle: 4 }),
    ]
    const line = getCycleAwareDialogue('briggs', history)
    expect(line).toContain('How many times')
  })

  it('returns basic line for briggs at exactly 2 cycles', () => {
    const history = [makeSnapshot({ cycle: 1 }), makeSnapshot({ cycle: 2 })]
    const line = getCycleAwareDialogue('briggs', history)
    expect(line).toContain('files')
  })

  it('returns kindling line for deacon_harrow when kindling aligned', () => {
    const history = [makeSnapshot({ factionsAligned: ['kindling'] })]
    const line = getCycleAwareDialogue('deacon_harrow', history)
    expect(line).toContain('Kindling')
  })

  it('returns null for patch on first cycle (no history)', () => {
    const history = [makeSnapshot()]
    // Single snapshot = first cycle reference, patch needs >= 2
    const line = getCycleAwareDialogue('patch', history)
    expect(line).toBeNull()
  })

  it('returns scar observation for patch at 2+ cycles', () => {
    const history = [makeSnapshot({ cycle: 1 }), makeSnapshot({ cycle: 2 })]
    const line = getCycleAwareDialogue('patch', history)
    expect(line).toContain('scar')
  })
})

// ============================================================
// echoes.ts — getDeathRoomNarration
// ============================================================

describe('getDeathRoomNarration', () => {
  it('returns null for empty history', () => {
    expect(getDeathRoomNarration('room_1', [])).toBeNull()
  })

  it('returns null if player never died in this room', () => {
    const history = [makeSnapshot({ deathRoom: 'other_room' })]
    expect(getDeathRoomNarration('room_1', history)).toBeNull()
  })

  it('returns echo message for one death in room', () => {
    const history = [makeSnapshot({ deathRoom: 'room_1' })]
    const msg = getDeathRoomNarration('room_1', history)
    expect(msg).not.toBeNull()
    expect(msg!.type).toBe('echo')
  })

  it('returns escalated message for two deaths in room', () => {
    const history = [
      makeSnapshot({ deathRoom: 'room_1' }),
      makeSnapshot({ deathRoom: 'room_1' }),
    ]
    const msg = getDeathRoomNarration('room_1', history)
    expect(msg!.type).toBe('echo')
    expect(msg!.text).toMatch(/twice|second time|sediment/i)
  })

  it('includes death count in message for 3+ deaths', () => {
    const history = [
      makeSnapshot({ deathRoom: 'room_1' }),
      makeSnapshot({ deathRoom: 'room_1' }),
      makeSnapshot({ deathRoom: 'room_1' }),
    ]
    const msg = getDeathRoomNarration('room_1', history)
    expect(msg!.text).toMatch(/3|three|so many/i)
  })
})

// ============================================================
// abilities.ts — CLASS_ABILITIES registry
// ============================================================

describe('CLASS_ABILITIES', () => {
  beforeEach(() => vi.clearAllMocks())

  const classes = ['enforcer', 'scout', 'wraith', 'shepherd', 'reclaimer', 'warden', 'broker'] as const

  it('has an entry for every character class', () => {
    for (const cls of classes) {
      expect(CLASS_ABILITIES[cls]).toBeDefined()
      expect(CLASS_ABILITIES[cls].id).toBeTruthy()
    }
  })

  it('enforcer ability costs HP', () => {
    expect(CLASS_ABILITIES['enforcer'].cost).toBe('hp')
    expect(CLASS_ABILITIES['enforcer'].hpCost).toBe(3)
  })

  it('reclaimer ability is a free action', () => {
    expect(CLASS_ABILITIES['reclaimer'].cost).toBe('free')
  })

  it('resolveAbility marks abilityUsed on success', () => {
    const player = makePlayer({ characterClass: 'warden' })
    const state = makeCombatState()
    const result = resolveAbility(player, state)
    expect(result.success).toBe(true)
    expect(result.newState.abilityUsed).toBe(true)
  })

  it('resolveAbility fails cleanly when not in combat', () => {
    const player = makePlayer()
    const state = makeCombatState({ active: false })
    const result = resolveAbility(player, state)
    expect(result.success).toBe(false)
    expect(result.messages[0]!.type).toBe('error')
  })

  it('resolveAbility fails cleanly when ability already used', () => {
    const player = makePlayer()
    const state = makeCombatState({ abilityUsed: true })
    const result = resolveAbility(player, state)
    expect(result.success).toBe(false)
    expect(result.messages[0]!.text).toContain('already used')
  })
})
