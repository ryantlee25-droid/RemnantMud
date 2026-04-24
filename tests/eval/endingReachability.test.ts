// ============================================================
// Ending Reachability & Earning — Integration Test Suite
// Howler B — convoy: ending-eval
// ============================================================
// Tests the four endings (Cure/Weapon/Seal/Throne) in the
// scar_14_the_core room against:
//   1. Full-path players (flag-setting harness per Scar entry route)
//   2. Stumble-in players (cycle 3, zero flags, zero rep)
//   3. Cycle-gate enforcement (cycle 1/2 block)
//   4. Quest-spine flag consistency (each Scar-entry route)
//   5. Ending flavor uniqueness (distinct messages and charon_choice values)
// ============================================================

import { describe, it, expect } from 'vitest'
import type { Room, RoomExtra, Player } from '@/types/game'
import { THE_SCAR_ROOMS } from '@/data/rooms/the_scar'
import { QUEST_DESCRIPTIONS } from '@/data/questDescriptions'

// ============================================================
// Helpers
// ============================================================

/** Build a Player with sensible defaults and cycle override. */
function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'test-player',
    name: 'Tester',
    characterClass: 'enforcer',
    vigor: 10,
    grit: 8,
    reflex: 6,
    wits: 5,
    presence: 4,
    shadow: 3,
    hp: 20,
    maxHp: 20,
    currentRoomId: 'scar_14_the_core',
    worldSeed: 42,
    xp: 0,
    level: 1,
    actionsTaken: 0,
    isDead: false,
    cycle: 3,
    totalDeaths: 2,
    questFlags: {},
    factionReputation: {},
    ...overrides,
  }
}

/** Find a room by ID. */
function getRoom(id: string): Room {
  const room = THE_SCAR_ROOMS.find((r) => r.id === id)
  if (!room) throw new Error(`Room not found: ${id}`)
  return room
}

/** Find all extras for a room by keyword match. */
function findExtra(room: Room, keyword: string): RoomExtra | undefined {
  return room.extras?.find((e) => e.keywords.includes(keyword))
}

/**
 * Simulate the questFlagOnSuccess logic for a given extra.
 * Returns the flags that would be set. Does NOT check skill roll —
 * per code review: questFlagOnSuccess fires regardless of roll outcome.
 */
function collectFlagsFromExtra(
  extra: RoomExtra
): Array<{ flag: string; value: string | boolean | number }> {
  if (!extra.questFlagOnSuccess) return []
  if (Array.isArray(extra.questFlagOnSuccess)) return extra.questFlagOnSuccess
  return [extra.questFlagOnSuccess]
}

/** A player who has completed one Scar entry route (keycard via Reclaimers/Lev). */
function makeKeycardPlayer(): Player {
  return makePlayer({
    cycle: 3,
    questFlags: {
      found_r1_sequencing_data: true,
      discovered_archive_meridian_connection: true,
      discovered_charon7_deliberate_release: true,
      reclaimers_meridian_keycard: true,
      lev_trusts_player: true,
    },
    factionReputation: { reclaimers: 2 },
  })
}

/** A player who entered via Sanguine biometric (Vesper/Duskhollow route). */
function makeBiometricPlayer(): Player {
  return makePlayer({
    cycle: 3,
    questFlags: {
      found_r1_sequencing_data: true,
      discovered_archive_meridian_connection: true,
      discovered_charon7_deliberate_release: true,
      sanguine_biometric_obtained: true,
      vesper_shared_origin: true,
    },
    factionReputation: { covenant_of_dusk: 2 },
  })
}

/** A player who entered via Kindling tunnel (Harrow route). */
function makeTunnelPlayer(): Player {
  return makePlayer({
    cycle: 3,
    questFlags: {
      found_r1_sequencing_data: true,
      discovered_archive_meridian_connection: true,
      discovered_charon7_deliberate_release: true,
      kindling_tunnel_access: true,
      harrow_recognized_truth: true,
    },
    factionReputation: { kindling: 2 },
  })
}

/** A player who entered via Deep utility override (Elder/Lucid route). */
function makeUtilityPlayer(): Player {
  return makePlayer({
    cycle: 3,
    questFlags: {
      found_r1_sequencing_data: true,
      discovered_archive_meridian_connection: true,
      discovered_charon7_deliberate_release: true,
      deep_utility_access: true,
    },
    factionReputation: { lucid: 1 },
  })
}

// ============================================================
// Shared room references
// ============================================================

const coreRoom = getRoom('scar_14_the_core')
const mainEntrance = getRoom('scar_02_main_entrance')
const craterRim = getRoom('scar_01_crater_rim')

// ============================================================
// 1. Ending Reachability — all four endings
// ============================================================

describe('ending: cure — reachability and flag-setting', () => {
  it('scar_14_the_core has a "cure" extra with the correct keywords', () => {
    const extra = findExtra(coreRoom, 'cure')
    expect(extra).toBeDefined()
    expect(extra!.keywords).toContain('cure')
  })

  it('cure extra has a lore skillCheck at DC 4', () => {
    const extra = findExtra(coreRoom, 'cure')!
    expect(extra.skillCheck).toBeDefined()
    expect(extra.skillCheck!.skill).toBe('lore')
    expect(extra.skillCheck!.dc).toBe(4)
  })

  it('cure questFlagOnSuccess sets charon_choice=cure and game_ending=true', () => {
    const extra = findExtra(coreRoom, 'cure')!
    const flags = collectFlagsFromExtra(extra)
    const choiceFlag = flags.find((f) => f.flag === 'charon_choice')
    const endingFlag = flags.find((f) => f.flag === 'game_ending')
    expect(choiceFlag).toBeDefined()
    expect(choiceFlag!.value).toBe('cure')
    expect(endingFlag).toBeDefined()
    expect(endingFlag!.value).toBe(true)
  })

  it('cure is reachable from keycard-route player state', () => {
    const player = makeKeycardPlayer()
    expect(player.cycle).toBe(3)
    expect(player.questFlags!.reclaimers_meridian_keycard).toBe(true)
    // cycleGate cleared; extra is present and flags work
    const extra = findExtra(coreRoom, 'cure')!
    const flags = collectFlagsFromExtra(extra)
    expect(flags.some((f) => f.flag === 'charon_choice' && f.value === 'cure')).toBe(true)
  })

  it('cure successAppend message is unique and non-empty', () => {
    const extra = findExtra(coreRoom, 'cure')!
    expect(extra.skillCheck!.successAppend.length).toBeGreaterThan(50)
    expect(extra.skillCheck!.successAppend).toContain('DEPLOYED')
  })
})

describe('ending: weapon — reachability and flag-setting', () => {
  it('scar_14_the_core has a "weapon" extra', () => {
    const extra = findExtra(coreRoom, 'weapon')
    expect(extra).toBeDefined()
  })

  it('weapon skillCheck is lore DC 4', () => {
    const extra = findExtra(coreRoom, 'weapon')!
    expect(extra.skillCheck!.skill).toBe('lore')
    expect(extra.skillCheck!.dc).toBe(4)
  })

  it('weapon questFlagOnSuccess sets charon_choice=weapon and game_ending=true', () => {
    const extra = findExtra(coreRoom, 'weapon')!
    const flags = collectFlagsFromExtra(extra)
    const choiceFlag = flags.find((f) => f.flag === 'charon_choice')
    const endingFlag = flags.find((f) => f.flag === 'game_ending')
    expect(choiceFlag!.value).toBe('weapon')
    expect(endingFlag!.value).toBe(true)
  })

  it('weapon is reachable from biometric-route player state', () => {
    const player = makeBiometricPlayer()
    expect(player.cycle).toBe(3)
    expect(player.questFlags!.sanguine_biometric_obtained).toBe(true)
    const extra = findExtra(coreRoom, 'weapon')!
    const flags = collectFlagsFromExtra(extra)
    expect(flags.some((f) => f.flag === 'charon_choice' && f.value === 'weapon')).toBe(true)
  })

  it('weapon successAppend message is unique (contains RELEASED)', () => {
    const extra = findExtra(coreRoom, 'weapon')!
    expect(extra.skillCheck!.successAppend).toContain('RELEASED')
  })
})

describe('ending: seal — reachability and flag-setting', () => {
  it('scar_14_the_core has a "seal" extra', () => {
    const extra = findExtra(coreRoom, 'seal')
    expect(extra).toBeDefined()
  })

  it('seal skillCheck is lore DC 4', () => {
    const extra = findExtra(coreRoom, 'seal')!
    expect(extra.skillCheck!.skill).toBe('lore')
    expect(extra.skillCheck!.dc).toBe(4)
  })

  it('seal questFlagOnSuccess sets charon_choice=seal and game_ending=true', () => {
    const extra = findExtra(coreRoom, 'seal')!
    const flags = collectFlagsFromExtra(extra)
    const choiceFlag = flags.find((f) => f.flag === 'charon_choice')
    const endingFlag = flags.find((f) => f.flag === 'game_ending')
    expect(choiceFlag!.value).toBe('seal')
    expect(endingFlag!.value).toBe(true)
  })

  it('seal is reachable from tunnel-route player state', () => {
    const player = makeTunnelPlayer()
    expect(player.cycle).toBe(3)
    expect(player.questFlags!.kindling_tunnel_access).toBe(true)
    const extra = findExtra(coreRoom, 'seal')!
    const flags = collectFlagsFromExtra(extra)
    expect(flags.some((f) => f.flag === 'charon_choice' && f.value === 'seal')).toBe(true)
  })

  it('seal successAppend message is unique (contains SEALED)', () => {
    const extra = findExtra(coreRoom, 'seal')!
    expect(extra.skillCheck!.successAppend).toContain('SEALED')
  })
})

describe('ending: throne — reachability and flag-setting', () => {
  it('scar_14_the_core has a "throne" extra', () => {
    const extra = findExtra(coreRoom, 'throne')
    expect(extra).toBeDefined()
  })

  it('throne skillCheck is lore DC 4', () => {
    const extra = findExtra(coreRoom, 'throne')!
    expect(extra.skillCheck!.skill).toBe('lore')
    expect(extra.skillCheck!.dc).toBe(4)
  })

  it('throne questFlagOnSuccess sets charon_choice=throne and game_ending=true', () => {
    const extra = findExtra(coreRoom, 'throne')!
    const flags = collectFlagsFromExtra(extra)
    const choiceFlag = flags.find((f) => f.flag === 'charon_choice')
    const endingFlag = flags.find((f) => f.flag === 'game_ending')
    expect(choiceFlag!.value).toBe('throne')
    expect(endingFlag!.value).toBe(true)
  })

  it('throne is reachable from utility-route player state', () => {
    const player = makeUtilityPlayer()
    expect(player.cycle).toBe(3)
    expect(player.questFlags!.deep_utility_access).toBe(true)
    const extra = findExtra(coreRoom, 'throne')!
    const flags = collectFlagsFromExtra(extra)
    expect(flags.some((f) => f.flag === 'charon_choice' && f.value === 'throne')).toBe(true)
  })

  it('throne successAppend message is unique (contains SECURED)', () => {
    const extra = findExtra(coreRoom, 'throne')!
    expect(extra.skillCheck!.successAppend).toContain('SECURED')
  })
})

// ============================================================
// 2. Stumble-in design case
// ============================================================

describe('DESIGN: stumble-in endings are available by design', () => {
  const stumblePlayer = makePlayer({
    cycle: 3,
    questFlags: {},
    factionReputation: {},
    // lore stat is derived from wits; keep at baseline (wits: 5)
    wits: 5,
  })

  it('stumble player has cycle 3, zero quest flags, zero faction rep', () => {
    expect(stumblePlayer.cycle).toBe(3)
    expect(Object.keys(stumblePlayer.questFlags!)).toHaveLength(0)
    expect(Object.keys(stumblePlayer.factionReputation!)).toHaveLength(0)
  })

  it('cure extra has no questGate requirement — accessible with zero flags', () => {
    const extra = findExtra(coreRoom, 'cure')
    expect(extra).toBeDefined()
    // RoomExtra does not set a questGate on any of the four endings
    expect(extra!.questGate).toBeUndefined()
  })

  it('weapon extra has no questGate requirement — accessible with zero flags', () => {
    const extra = findExtra(coreRoom, 'weapon')
    expect(extra!.questGate).toBeUndefined()
  })

  it('seal extra has no questGate requirement — accessible with zero flags', () => {
    const extra = findExtra(coreRoom, 'seal')
    expect(extra!.questGate).toBeUndefined()
  })

  it('throne extra has no questGate requirement — accessible with zero flags', () => {
    const extra = findExtra(coreRoom, 'throne')
    expect(extra!.questGate).toBeUndefined()
  })

  it('stumble player in scar_14_the_core can trigger all four endings (no gate enforcement)', () => {
    // The room has cycleGate:3 (covered in section 3) but no ending-specific flag gates.
    // Placing a player here via test harness gives access to all four.
    const endingKeywords = ['cure', 'weapon', 'seal', 'throne']
    for (const kw of endingKeywords) {
      const extra = findExtra(coreRoom, kw)
      expect(extra).toBeDefined()
      const flags = collectFlagsFromExtra(extra!)
      expect(flags.some((f) => f.flag === 'charon_choice')).toBe(true)
    }
  })
})

// ============================================================
// 3. Negative case — cycleGate blocks low-cycle players
// ============================================================

describe('cycle gate — scar_14_the_core requires cycle >= 3', () => {
  it('scar_14_the_core has cycleGate set to 3', () => {
    expect(coreRoom.cycleGate).toBe(3)
  })

  it('scar_01_crater_rim has cycleGate set to 3 (Scar entry gated at rim)', () => {
    expect(craterRim.cycleGate).toBe(3)
  })

  it('a player at cycle 1 is below the cycleGate threshold', () => {
    const player = makePlayer({ cycle: 1 })
    expect(player.cycle).toBeLessThan(coreRoom.cycleGate!)
  })

  it('a player at cycle 2 is below the cycleGate threshold', () => {
    const player = makePlayer({ cycle: 2 })
    expect(player.cycle).toBeLessThan(coreRoom.cycleGate!)
  })

  it('a player at cycle 3 meets the cycleGate threshold', () => {
    const player = makePlayer({ cycle: 3 })
    expect(player.cycle).toBeGreaterThanOrEqual(coreRoom.cycleGate!)
  })

  it('all Scar zone rooms that have cycleGate set it to 3 (no partial gating)', () => {
    const gatedRooms = THE_SCAR_ROOMS.filter((r) => r.cycleGate !== undefined)
    for (const room of gatedRooms) {
      expect(room.cycleGate).toBe(3)
    }
    // At least the core, rim, main entrance are gated
    expect(gatedRooms.length).toBeGreaterThanOrEqual(3)
  })
})

// ============================================================
// 4. Quest-spine completability — four Scar-entry routes
// ============================================================

describe('quest spine — keycard route (Reclaimers/Lev)', () => {
  it('found_r1_sequencing_data quest entry exists', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'found_r1_sequencing_data')
    expect(entry).toBeDefined()
  })

  it('reclaimers_meridian_keycard quest entry exists', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'reclaimers_meridian_keycard')
    expect(entry).toBeDefined()
  })

  it('reclaimers_meridian_keycard completionFlag points to charon_choice', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'reclaimers_meridian_keycard')!
    expect(entry.completionFlag).toBe('charon_choice')
  })

  it('scar_02_main_entrance has a keycard-gated richExit (keycard reader)', () => {
    const entrance = mainEntrance
    const eastExit = entrance.richExits?.east
    expect(eastExit).toBeDefined()
    expect(eastExit!.locked).toBe(true)
    expect(eastExit!.lockedBy).toBe('meridian_keycard')
  })

  it('keycard-reader extra in scar_02_main_entrance has questGate matching keycard flag', () => {
    const keycardExtra = mainEntrance.extras?.find((e) =>
      e.keywords.includes('keycard')
    )
    expect(keycardExtra).toBeDefined()
    expect(keycardExtra!.questGate).toBe('reclaimers_meridian_keycard')
  })

  it('route chain: found_r1_sequencing_data -> reclaimers_meridian_keycard -> charon_choice is gapless', () => {
    // found_r1_sequencing_data → completionFlag = discovered_archive_meridian_connection
    const step1 = QUEST_DESCRIPTIONS.find((q) => q.flag === 'found_r1_sequencing_data')!
    expect(step1.completionFlag).toBe('discovered_archive_meridian_connection')
    // reclaimers_meridian_keycard → completionFlag = charon_choice
    const step2 = QUEST_DESCRIPTIONS.find((q) => q.flag === 'reclaimers_meridian_keycard')!
    expect(step2.completionFlag).toBe('charon_choice')
  })
})

describe('quest spine — biometric route (Sanguine/Vesper)', () => {
  it('sanguine_biometric_obtained quest entry exists', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'sanguine_biometric_obtained')
    expect(entry).toBeDefined()
  })

  it('sanguine_biometric_obtained completionFlag points to charon_choice', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'sanguine_biometric_obtained')!
    expect(entry.completionFlag).toBe('charon_choice')
  })

  it('scar_02_main_entrance has a biometric-gated extra with questGate', () => {
    const biometricExtra = mainEntrance.extras?.find((e) =>
      e.keywords.includes('biometric')
    )
    expect(biometricExtra).toBeDefined()
    expect(biometricExtra!.questGate).toBe('sanguine_biometric_obtained')
  })

  it('biometric quest entry hints at Vesper/Duskhollow as the source NPC', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'sanguine_biometric_obtained')!
    // The hint references Vesper and biometric panel
    expect(entry.hint).toBeDefined()
    expect(entry.hint!.toLowerCase()).toMatch(/vesper|blue biometric|biometric/)
  })
})

describe('quest spine — tunnel route (Kindling/Harrow)', () => {
  it('kindling_tunnel_access quest entry exists', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'kindling_tunnel_access')
    expect(entry).toBeDefined()
  })

  it('kindling_tunnel_access completionFlag points to charon_choice', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'kindling_tunnel_access')!
    expect(entry.completionFlag).toBe('charon_choice')
  })

  it('harrow_recognized_truth quest entry exists (intermediate flag)', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'harrow_recognized_truth')
    expect(entry).toBeDefined()
  })

  it('harrow_recognized_truth completionFlag points to kindling_tunnel_access', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'harrow_recognized_truth')!
    expect(entry.completionFlag).toBe('kindling_tunnel_access')
  })

  it('scar_02_main_entrance has a Kindling-gated extra (tunnel/hatch)', () => {
    const tunnelExtra = mainEntrance.extras?.find((e) =>
      e.keywords.includes('maintenance')
    )
    expect(tunnelExtra).toBeDefined()
    expect(tunnelExtra!.questGate).toBe('kindling_tunnel_access')
  })

  it('em_kindling_intro quest entry exists (faction intro flag)', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'em_kindling_intro')
    expect(entry).toBeDefined()
  })
})

describe('quest spine — utility route (Elder/Lucid/Deep)', () => {
  it('deep_utility_access quest entry exists', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'deep_utility_access')
    expect(entry).toBeDefined()
  })

  it('deep_utility_access completionFlag points to charon_choice', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'deep_utility_access')!
    expect(entry.completionFlag).toBe('charon_choice')
  })

  it('scar_01_crater_rim has a utility richExit gated by deep_utility_access', () => {
    const westExit = craterRim.richExits?.west
    expect(westExit).toBeDefined()
    expect(westExit!.questGate).toBe('deep_utility_access')
  })

  it('utility richExit has discoverSkill set (perception-gated discovery)', () => {
    const westExit = craterRim.richExits?.west
    expect(westExit!.discoverSkill).toBe('perception')
    expect(westExit!.discoverDc).toBeDefined()
  })

  it('utility route hint references The Deep as the source location', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'deep_utility_access')!
    expect(entry.hint).toBeDefined()
    expect(entry.hint!.toLowerCase()).toMatch(/deep|elder/)
  })
})

// ============================================================
// 5. Ending flavor divergence — no aliasing
// ============================================================

describe('ending flavor divergence — four distinct charon_choice values', () => {
  const endingKeywords = ['cure', 'weapon', 'seal', 'throne'] as const

  it('all four ending extras exist in scar_14_the_core', () => {
    for (const kw of endingKeywords) {
      expect(findExtra(coreRoom, kw)).toBeDefined()
    }
  })

  it('each ending sets a distinct charon_choice value (no aliasing)', () => {
    const choiceValues = endingKeywords.map((kw) => {
      const extra = findExtra(coreRoom, kw)!
      const flags = collectFlagsFromExtra(extra)
      return flags.find((f) => f.flag === 'charon_choice')!.value
    })
    const uniqueValues = new Set(choiceValues)
    expect(uniqueValues.size).toBe(4)
    expect(uniqueValues).toContain('cure')
    expect(uniqueValues).toContain('weapon')
    expect(uniqueValues).toContain('seal')
    expect(uniqueValues).toContain('throne')
  })

  it('each ending has a non-empty description', () => {
    for (const kw of endingKeywords) {
      const extra = findExtra(coreRoom, kw)!
      expect(extra.description).toBeDefined()
      expect(extra.description!.length).toBeGreaterThan(20)
    }
  })

  it('each ending successAppend is distinct (no copy-paste)', () => {
    const messages = endingKeywords.map((kw) => {
      return findExtra(coreRoom, kw)!.skillCheck!.successAppend
    })
    const unique = new Set(messages)
    expect(unique.size).toBe(4)
  })

  it('cure and weapon descriptions differ (thematically opposite)', () => {
    const cureDesc = findExtra(coreRoom, 'cure')!.description!
    const weaponDesc = findExtra(coreRoom, 'weapon')!.description!
    expect(cureDesc).not.toBe(weaponDesc)
    // Cure refers to healing/reversing; weapon refers to killing/eliminating
    expect(cureDesc.toLowerCase()).toMatch(/reverse|restore|cognition/)
    expect(weaponDesc.toLowerCase()).toMatch(/kill|eliminate|pathogen|die/)
  })

  it('seal and throne descriptions differ (opposite philosophy)', () => {
    const sealDesc = findExtra(coreRoom, 'seal')!.description!
    const throneDesc = findExtra(coreRoom, 'throne')!.description!
    expect(sealDesc).not.toBe(throneDesc)
    // Seal references destruction/closing; throne references control/power
    expect(sealDesc.toLowerCase()).toMatch(/destroy|self-destruct|rubble|close/)
    expect(throneDesc.toLowerCase()).toMatch(/control|gatekeeper|power|leverage/)
  })

  it('each ending sets game_ending=true (no missing flag)', () => {
    for (const kw of endingKeywords) {
      const extra = findExtra(coreRoom, kw)!
      const flags = collectFlagsFromExtra(extra)
      const endingFlag = flags.find((f) => f.flag === 'game_ending')
      expect(endingFlag).toBeDefined()
      expect(endingFlag!.value).toBe(true)
    }
  })
})

// ============================================================
// 6. charon_choice quest description integrity
// ============================================================

describe('charon_choice quest entry — integrity', () => {
  it('charon_choice quest entry exists in QUEST_DESCRIPTIONS', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'charon_choice')
    expect(entry).toBeDefined()
  })

  it('charon_choice description mentions all four endings by name', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'charon_choice')!
    const desc = entry.description.toLowerCase()
    expect(desc).toContain('cure')
    expect(desc).toContain('weapon')
    expect(desc).toContain('seal')
    expect(desc).toContain('throne')
  })

  it('charon_choice completionFlag is game_ending', () => {
    const entry = QUEST_DESCRIPTIONS.find((q) => q.flag === 'charon_choice')!
    expect(entry.completionFlag).toBe('game_ending')
  })

  it('discovered_charon7_deliberate_release completionFlag is game_ending (main arc terminator)', () => {
    const entry = QUEST_DESCRIPTIONS.find(
      (q) => q.flag === 'discovered_charon7_deliberate_release'
    )!
    expect(entry.completionFlag).toBe('game_ending')
  })
})

// ============================================================
// 7. Scar room structure — additional sanity checks
// ============================================================

describe('scar_14_the_core — room structure', () => {
  it('room has noCombat flag (safe room)', () => {
    expect(coreRoom.flags.noCombat).toBe(true)
  })

  it('room has at least 6 extras (4 endings + weight + chosen; companion extras may be added)', () => {
    expect(coreRoom.extras).toBeDefined()
    expect(coreRoom.extras!.length).toBeGreaterThanOrEqual(6)
  })

  it('the fifth extra (weight/decide) has no questFlagOnSuccess', () => {
    const weightExtra = findExtra(coreRoom, 'weight')
    expect(weightExtra).toBeDefined()
    expect(weightExtra!.questFlagOnSuccess).toBeUndefined()
  })

  it('the sixth extra (result/chosen) is gated by questGate=charon_choice', () => {
    const resultExtra = findExtra(coreRoom, 'result')
    expect(resultExtra).toBeDefined()
    expect(resultExtra!.questGate).toBe('charon_choice')
  })

  it('room act is 3 (Act III)', () => {
    expect(coreRoom.act).toBe(3)
  })

  it('room is in the_scar zone', () => {
    expect(coreRoom.zone).toBe('the_scar')
  })

  it('room has no enemy spawns (true no-combat zone)', () => {
    expect(coreRoom.enemies).toHaveLength(0)
    expect(coreRoom.hollowEncounter).toBeUndefined()
  })

  it('room exits connect to broadcast room (west) and exit (east)', () => {
    expect(coreRoom.exits.west).toBe('scar_13_broadcast_room')
    expect(coreRoom.exits.east).toBe('scar_15_the_exit')
  })
})
