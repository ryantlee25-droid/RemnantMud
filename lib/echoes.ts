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
import { msg } from '@/lib/messages'

// ------------------------------------------------------------
// Quest flag → NPC relationship mapping
// ------------------------------------------------------------

const FLAG_TO_RELATIONSHIP: Record<string, { npc: string; relationship: 'trusted' | 'distrusted' | 'betrayed' | 'allied' }> = {
  lev_trusts_player:           { npc: 'lev',    relationship: 'trusted' },
  lev_distrusts_player:        { npc: 'lev',    relationship: 'distrusted' },
  player_betrayed_vesper:      { npc: 'vesper',  relationship: 'betrayed' },
  rook_indebted:               { npc: 'rook',    relationship: 'allied' },
  avery_betrayed:              { npc: 'avery',   relationship: 'betrayed' },
  avery_departed:              { npc: 'avery',   relationship: 'trusted' },
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
  'avery_departed',
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
// DEATH ROOM PERSISTENCE
// Added by Rider H (remnant-final-0329) — append only.
// The world remembers where you bled. Every cycle. Permanently.
// NOTE: deathRoom is correctly populated above (line 112) via
// player.currentRoomId on non-ending death. Verified by Rider H.
// ============================================================

/**
 * Get haunting narration when the player enters a room where they
 * previously died in any cycle. Cycle-aware: escalates with repeat deaths.
 * Returns null if the player never died in this room.
 */
export function getDeathRoomNarration(
  roomId: string,
  cycleHistory: CycleSnapshot[]
): GameMessage | null {
  if (!cycleHistory || cycleHistory.length === 0) return null

  // Count how many times the player died in this specific room
  const deathCount = cycleHistory.filter(
    (snap) => snap.deathRoom === roomId
  ).length

  if (deathCount === 0) return null

  if (deathCount === 1) {
    const pool = [
      'This is where you fell. The stain on the floor is yours. ' +
        'The wall still has the marks from when you tried to stand.',
      'You have been here before. You died here. The room has not ' +
        'forgotten even if you have. Something in the air is different ' +
        'where blood was spilled.',
      'Your body remembers this place before your mind does. ' +
        'A flinch in the shoulders. A tightness in the throat. ' +
        'You died here. The floor knows.',
      'The light falls wrong in this room. It did last time too. ' +
        'You were looking at it when you went down. That detail ' +
        'has survived the cycle.',
    ]
    return msg(pool[Math.floor(Math.random() * pool.length)], 'echo')
  }

  if (deathCount === 2) {
    const pool = [
      'You have died here twice. The second time was worse. ' +
        'The walls are stained in a pattern you almost recognize.',
      'Twice you have bled out in this room. The floor has a ' +
        'memory of its own. You can feel it pulling at your feet.',
      'This is the second time. Your blood is layered here like ' +
        'sediment. Old death and older death, pressed into the stone.',
    ]
    return msg(pool[Math.floor(Math.random() * pool.length)], 'echo')
  }

  // Three or more deaths in the same room
  const pool = [
    `You have died here ${deathCount} times. The room is becoming ` +
      'a shrine to your failure. Something about the air has changed ' +
      'permanently. It tastes like iron and endings.',
    `${deathCount} deaths in this room. The walls know you better ` +
      'than anyone alive. They have watched you fall from every angle. ' +
      'They are patient.',
    'This room has killed you so many times it has become personal. ' +
      'The shadows know where you stand. The floor knows where you fall. ' +
      'You are expected here.',
  ]
  return msg(pool[Math.floor(Math.random() * pool.length)], 'echo')
}

// ============================================================
// Narrative Overhaul additions — convoy remnant-narrative-0329
// Rider D (consequences) appends these exports.
// Real implementations live on rider-consequences branch.
// These stubs satisfy gameEngine.ts imports until merge.
// APPEND-ONLY: no changes to existing exports above this line.
// ============================================================

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

// ============================================================
// CROSS-CYCLE CONSEQUENCE MEMORY
// Added by Rider D (remnant-narrative-0329) — append only.
// Existing exports above are untouched.
//
// The world remembers what you did in previous cycles,
// even if you don't. The haunting is in specific details:
// empty rooms, changed graffiti, NPCs who watched your
// previous self and are watching you now.
// ============================================================

// ------------------------------------------------------------
// getCrossCycleConsequences
//
// Call at the start of a new cycle (player.cycle > 1).
// Returns narrative messages reflecting what the previous
// cycle's choices have done to the world.
// ------------------------------------------------------------

export function getCrossCycleConsequences(
  cycleHistory: CycleSnapshot[],
  currentState: { questFlags?: Record<string, string | boolean | number>; cycle?: number }
): GameMessage[] {
  if (!cycleHistory || cycleHistory.length === 0) return []

  const messages: GameMessage[] = []
  const previous = cycleHistory[cycleHistory.length - 1]

  if (!previous) return []

  // After WEAPON ending: fewer Hollows, worse silence
  if (previous.endingChoice === 'weapon') {
    messages.push(
      msg(
        'There are fewer Hollows. Noticeably fewer. ' +
        'The silence where they used to be is worse.',
        'echo'
      )
    )
  }

  // After SEAL ending: the containment holds, barely
  if (previous.endingChoice === 'seal') {
    messages.push(
      msg(
        'The eastern roads are open again. ' +
        'The thing you sealed is still sealed. ' +
        'You know this the way you know things in dreams — ' +
        'without evidence, with certainty.',
        'echo'
      )
    )
  }

  // After CURE ending: some people are different
  if (previous.endingChoice === 'cure') {
    messages.push(
      msg(
        'Some of the people you pass look different. Not better, exactly. ' +
        'Changed. They look at you the way people look at someone ' +
        'who did something they witnessed and cannot explain.',
        'echo'
      )
    )
  }

  // After betraying Vesper
  if (previous.npcRelationships?.['vesper'] === 'betrayed') {
    messages.push(
      msg(
        'A new contact at Duskhollow says: the previous one — ' +
        'the one who looked like you — we don\u2019t discuss them here.',
        'echo'
      )
    )
  }

  // After siding with Kindling
  if (previous.factionsAligned?.includes('kindling')) {
    messages.push(
      msg(
        'The graffiti near the Ember has been amended. ' +
        'Someone added a line below the old text. It references your previous self ' +
        'without using a name — just a description that is accurate.',
        'echo'
      )
    )
  }

  // After betraying Lev
  if (previous.npcRelationships?.['lev'] === 'betrayed') {
    messages.push(
      msg(
        'The Reclaimer lab has a new door. Reinforced. ' +
        'The person at the desk says the old one was damaged. ' +
        'The way they say it means something else.',
        'echo'
      )
    )
  }

  // After siding with Red Court
  if (previous.factionsAligned?.includes('red_court')) {
    messages.push(
      msg(
        'The Red Court\u2019s footguard looks at you twice. ' +
        'Not recognition — the previous cycle is not in their records. ' +
        'Something else. Pattern recognition. They have seen your face before, ' +
        'in a different context, and they are trying to place it.',
        'echo'
      )
    )
  }

  // NPC death in previous cycle — room stays empty
  const knownDeaths: Array<{ flag: string; message: string }> = [
    {
      flag: 'avery_death_cycle',
      message:
        'The room where Avery used to stand at dawn is empty. It stays empty.',
    },
    {
      flag: 'patch_death_cycle',
      message:
        'Patch\u2019s table is at the crossroads market. ' +
        'Someone else is behind it. The instruments are in the wrong order.',
    },
    {
      flag: 'howard_death_cycle',
      message:
        'The bridge has a new keeper. They do not know the names of the regulars yet.',
    },
    {
      flag: 'sparks_death_cycle',
      message:
        'MERIDIAN is still broadcasting. The voice is not Sparks.',
    },
  ]

  for (const death of knownDeaths) {
    if (previous.questsCompleted?.includes(death.flag)) {
      messages.push(msg(death.message, 'echo'))
    }
  }

  return messages
}

// ------------------------------------------------------------
// getGraffitiChange
//
// Returns changes to world graffiti based on previous cycle
// actions. Each entry specifies the room and new text.
// Called when player enters rooms that have graffiti.
// ------------------------------------------------------------

export function getGraffitiChange(
  cycleHistory: CycleSnapshot[]
): Array<{ roomId: string; newGraffiti: string }> {
  if (!cycleHistory || cycleHistory.length === 0) return []

  const previous = cycleHistory[cycleHistory.length - 1]
  if (!previous) return []

  const changes: Array<{ roomId: string; newGraffiti: string }> = []

  // Betrayed Accord — graffiti near checkpoints changes
  if (previous.factionsAntagonized?.includes('accord')) {
    changes.push({
      roomId: 'cv_01_main_gate',
      newGraffiti: 'THE REVENANT LIES',
    })
  }

  // Betrayed Kindling — Ember graffiti changes
  if (previous.factionsAntagonized?.includes('kindling')) {
    changes.push({
      roomId: 'em_02_gate_of_flame',
      newGraffiti: 'THEY TRUSTED THE LAST ONE',
    })
  }

  // Aligned with Kindling — Ember graffiti honors past self
  if (previous.factionsAligned?.includes('kindling')) {
    changes.push({
      roomId: 'em_03_the_nave',
      newGraffiti: 'THE ONE BEFORE YOU STOOD HERE AND CHOSE RIGHT',
    })
  }

  // Betrayed Vesper/Lucid — Duskhollow graffiti warns
  if (previous.npcRelationships?.['vesper'] === 'betrayed') {
    changes.push({
      roomId: 'dh_18_night_market',
      newGraffiti: 'ASK THEM WHAT THEY DID WITH THE LAST CONTACT',
    })
  }

  // Weapon ending — hollow territories changed
  if (previous.endingChoice === 'weapon') {
    changes.push({
      roomId: 'scar_01_crater_rim',
      newGraffiti: 'QUIETER SINCE THEY CAME THROUGH',
    })
  }

  // Completed act 3 — MERIDIAN entrance graffiti
  if (previous.questsCompleted?.includes('act3_complete')) {
    changes.push({
      roomId: 'scar_02_main_entrance',
      newGraffiti: 'SOMEONE MADE IT THROUGH. MAYBE YOU CAN TOO.',
    })
  }

  return changes
}

// ------------------------------------------------------------
// getCycleAwareDialogue
//
// Returns a dialogue override string for an NPC who has
// encountered a previous version of the player.
// Return value is the opening line replacing the NPC's
// default dialogue. Returns null if no cycle memory applies.
// ------------------------------------------------------------

export function getCycleAwareDialogue(
  npcId: string,
  cycleHistory: CycleSnapshot[]
): string | null {
  if (!cycleHistory || cycleHistory.length === 0) return null

  const previous = cycleHistory[cycleHistory.length - 1]
  if (!previous) return null

  const rel = previous.npcRelationships ?? {}

  switch (npcId) {
    case 'vesper':
      if (rel['vesper'] === 'betrayed') {
        return (
          'The last one who looked like you chose differently. ' +
          'I\u2019m watching to see what you choose.'
        )
      }
      if (rel['vesper'] === 'allied') {
        return (
          'I remember someone with your face. They helped me do something difficult. ' +
          'I don\u2019t know if you\u2019ll make the same choice.'
        )
      }
      return null

    case 'lev':
      if (rel['lev'] === 'betrayed') {
        return (
          'I\u2019ve seen that look before. On someone who had the same eyes you do. ' +
          'They were here two cycles ago. I\u2019m going to need you to prove ' +
          'you\u2019re not them.'
        )
      }
      if (rel['lev'] === 'allied') {
        return (
          'Someone with your face worked with us before. I don\u2019t know if ' +
          'you\u2019re the same person. I don\u2019t need to know. ' +
          'I just need to know if you\u2019re going to do what they did.'
        )
      }
      return null

    case 'deacon_harrow':
      if (previous.factionsAligned?.includes('kindling')) {
        return (
          'The Kindling remember you. Or someone like you. ' +
          'The fire doesn\u2019t forget faces.'
        )
      }
      if (previous.factionsAntagonized?.includes('kindling')) {
        return (
          'We remember the last one who came through here with your face. ' +
          'They made choices we cannot forgive. ' +
          'You will need to show us you are not them.'
        )
      }
      return null

    case 'marshal_cross':
      if (previous.factionsAntagonized?.includes('accord')) {
        return (
          'I have a file on someone who looks like you. ' +
          'I\u2019m going to ask you to explain some things before we talk about anything else.'
        )
      }
      if (previous.factionsAligned?.includes('accord')) {
        return (
          'Someone with your description helped this settlement through something difficult. ' +
          'I\u2019m not going to pretend that means I trust you. ' +
          'But I\u2019m listening.'
        )
      }
      return null

    case 'patch':
      // Patch is clinical; they notice patterns
      if (cycleHistory.length >= 2) {
        return (
          'You\u2019ve got the same scar placement as the last person I treated ' +
          'who came through after a full cycle. Same stress fractures in your movement. ' +
          'I\u2019m not going to ask. I\u2019m going to note it and move on. ' +
          'That work for you?'
        )
      }
      return null

    case 'rook':
      if (rel['rook'] === 'allied') {
        return (
          'You look like someone who did me a favor once. ' +
          'I\u2019m not saying it was you. I\u2019m saying I don\u2019t forget favors.'
        )
      }
      return null

    case 'briggs':
      if (cycleHistory.length >= 4) {
        return (
          'How many times now? The files say more than you\u2019d like.'
        )
      }
      if (cycleHistory.length >= 2) {
        return (
          'You again. My people have files. The files have your face.'
        )
      }
      return null

    case 'sparks':
      if (cycleHistory.length >= 2) {
        return (
          'The signal hasn\u2019t changed. But you have.'
        )
      }
      return null

    case 'dr_osei':
      if (cycleHistory.length >= 4) {
        return (
          'You\u2019re iterating. The virus is iterating you.'
        )
      }
      if (cycleHistory.length >= 2) {
        return (
          'Your cellular markers are\u2026 consistent. Across instances.'
        )
      }
      return null

    default:
      return null
  }
}

