// ============================================================
// echoes.ts — Cycle snapshot creation & reputation inheritance
// Part of the Echoes system: cross-cycle memory that bleeds through.
// ============================================================

import type {
  CycleSnapshot,
  EndingChoice,
  FactionType,
  GameMessage,
  Player,
} from '@/types/game'

// ------------------------------------------------------------
// Quest flag → NPC relationship mapping
// ------------------------------------------------------------

const FLAG_TO_RELATIONSHIP: Record<string, { npc: string; relationship: 'trusted' | 'distrusted' | 'betrayed' | 'allied' }> = {
  lev_trusts_player:           { npc: 'lev',    relationship: 'trusted' },
  lev_distrusts_player:        { npc: 'lev',    relationship: 'distrusted' },
  player_betrayed_vesper:      { npc: 'vesper',  relationship: 'betrayed' },
  rook_indebted:               { npc: 'rook',    relationship: 'allied' },
  avery_betrayed:              { npc: 'avery',   relationship: 'betrayed' },
  avery_will_leave:            { npc: 'avery',   relationship: 'trusted' },
  harrow_recognized_truth:     { npc: 'harrow',  relationship: 'trusted' },
  player_alignment_kindling:   { npc: 'harrow',  relationship: 'allied' },
  player_deceived_harrow:      { npc: 'harrow',  relationship: 'distrusted' },
  cross_expedition_sanctioned: { npc: 'cross',   relationship: 'trusted' },
  cross_committed_truth_mission: { npc: 'cross', relationship: 'allied' },
  vane_gave_blessing:          { npc: 'vane',    relationship: 'trusted' },
  vesper_peace_envoy:          { npc: 'vesper',  relationship: 'allied' },
  wren_respects_player:        { npc: 'wren',    relationship: 'trusted' },
  dell_escape_partner:         { npc: 'dell',    relationship: 'allied' },
}

// Milestone quest flags that represent major story beats
const MILESTONE_FLAGS: string[] = [
  'act1_complete',
  'act2_complete',
  'act3_complete',
  'lev_trusts_player',
  'player_betrayed_vesper',
  'vesper_peace_envoy',
  'harrow_recognized_truth',
  'player_alignment_kindling',
  'cross_expedition_sanctioned',
  'cross_committed_truth_mission',
  'rook_indebted',
  'avery_betrayed',
  'avery_will_leave',
  'vane_gave_blessing',
  'wren_respects_player',
  'dell_escape_partner',
  'scar_explored',
  'deep_explored',
  'ember_defended',
  'covenant_joined',
  'salt_creek_cleared',
  'pine_sea_mapped',
  'hollow_hive_destroyed',
  'elder_sanguine_defeated',
]

// ------------------------------------------------------------
// createCycleSnapshot
// Builds a CycleSnapshot from the player's current state.
// Called at death (deathRoom set) or at ending (endingChoice set).
// ------------------------------------------------------------

export function createCycleSnapshot(
  player: Player,
  endingChoice?: EndingChoice
): CycleSnapshot {
  const factionRep = player.factionReputation ?? {}
  const questFlags = player.questFlags ?? {}

  // Factions aligned (rep >= 2) and antagonized (rep <= -2)
  const factionsAligned: FactionType[] = []
  const factionsAntagonized: FactionType[] = []
  for (const [faction, rep] of Object.entries(factionRep)) {
    if (rep != null && rep >= 2) factionsAligned.push(faction as FactionType)
    if (rep != null && rep <= -2) factionsAntagonized.push(faction as FactionType)
  }

  // NPC relationships derived from quest flags
  // Later flags override earlier ones for the same NPC (e.g. allied > trusted)
  const npcRelationships: Record<string, 'trusted' | 'distrusted' | 'betrayed' | 'allied'> = {}
  for (const [flag, mapping] of Object.entries(FLAG_TO_RELATIONSHIP)) {
    if (questFlags[flag]) {
      npcRelationships[mapping.npc] = mapping.relationship
    }
  }

  // Filter quest flags down to milestone flags
  const questsCompleted: string[] = MILESTONE_FLAGS.filter(
    (flag) => !!questFlags[flag]
  )

  const snapshot: CycleSnapshot = {
    cycle: player.cycle,
    factionsAligned,
    factionsAntagonized,
    npcRelationships,
    questsCompleted,
  }

  if (endingChoice) {
    snapshot.endingChoice = endingChoice
  } else {
    // Death — record where the player died
    snapshot.deathRoom = player.currentRoomId
  }

  return snapshot
}

// ============================================================
// Narrative Overhaul additions — convoy remnant-narrative-0329
// Rider D (consequences) appends these exports.
// Real implementations live on rider-consequences branch.
// These stubs satisfy gameEngine.ts imports until merge.
// APPEND-ONLY: no changes to existing exports above this line.
// ============================================================

/**
 * Returns cross-cycle consequence messages to display at the
 * start of a new cycle. Real implementation on rider-consequences.
 */
export function getCrossCycleConsequences(
  _cycleHistory: CycleSnapshot[],
  _currentPlayer: Player,
): GameMessage[] {
  return []
}

/**
 * Returns graffiti changes driven by cycle history.
 * Real implementation on rider-consequences.
 */
export function getGraffitiChange(
  _cycleHistory: CycleSnapshot[],
): Array<{ roomId: string; newGraffiti: string }> {
  return []
}

/**
 * Returns a cycle-aware NPC dialogue override, or null.
 * Real implementation on rider-consequences.
 */
export function getCycleAwareDialogue(
  _npcId: string,
  _cycleHistory: CycleSnapshot[],
): string | null {
  return null
}

// ------------------------------------------------------------
// computeInheritedReputation
// Returns 50% of aligned/antagonized faction rep from a previous
// cycle snapshot, clamped to [-2, +2].
// ------------------------------------------------------------

export function computeInheritedReputation(
  previousSnapshot: CycleSnapshot
): Partial<Record<FactionType, number>> {
  const inherited: Partial<Record<FactionType, number>> = {}

  for (const faction of previousSnapshot.factionsAligned) {
    // Aligned means rep was >= 2; inherit +1 (50% of +2, floored)
    inherited[faction] = 1
  }

  for (const faction of previousSnapshot.factionsAntagonized) {
    // Antagonized means rep was <= -2; inherit -1 (50% of -2, ceiled)
    inherited[faction] = -1
  }

  return inherited
}
