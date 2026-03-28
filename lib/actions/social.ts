// ============================================================
// lib/actions/social.ts — handleTalk, handleSearch, handleRep, handleQuests
// ============================================================

import type { GameMessage, FactionType, Direction, Player, SkillType } from '@/types/game'
import type { EngineCore } from './types'
import { getNPC, getRevenantDialogue } from '@/data/npcs'
import { updateRoomFlags } from '@/lib/world'
import { itemsLine } from './movement'
import { getClassSkillBonus } from '@/lib/skillBonus'

// ------------------------------------------------------------
// Local message helpers
// ------------------------------------------------------------

function msg(text: string, type: GameMessage['type'] = 'narrative'): GameMessage {
  return { id: crypto.randomUUID(), text, type }
}

function systemMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'system' }
}

function errorMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'error' }
}

// ------------------------------------------------------------
// Handlers
// ------------------------------------------------------------

export async function handleTalk(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { currentRoom, player } = engine.getState()
  if (!currentRoom || !player) return

  if (currentRoom.npcs.length === 0) {
    engine._appendMessages([errorMsg('There is no one to talk to here.')])
    return
  }

  let npcId: string | undefined
  if (noun) {
    const nounLower = noun.toLowerCase()
    npcId = currentRoom.npcs.find((id) => {
      const n = getNPC(id)
      if (!n) return false
      // Match against NPC display name
      if (n.name.toLowerCase().includes(nounLower)) return true
      // Match against NPC ID (e.g. "guard" matches "crossroads_gate_guard")
      if (id.toLowerCase().includes(nounLower)) return true
      // Match against the activity text the player actually sees in the room
      // (e.g. "A Drifter arbiter leans against the gate post...")
      const rolledNpc = currentRoom.population?.npcs.find(rn => rn.npcId === id)
      if (rolledNpc?.activity && rolledNpc.activity.toLowerCase().includes(nounLower)) return true
      // Match against NPC faction (e.g. "talk drifter" for a drifters-faction NPC)
      if (n.faction && n.faction.toLowerCase().includes(nounLower)) return true
      return false
    })
  } else {
    npcId = currentRoom.npcs[0]
  }

  if (!npcId) {
    engine._appendMessages([errorMsg(`You don't see that person here.`)])
    return
  }

  const npc = getNPC(npcId)
  if (!npc) {
    engine._appendMessages([errorMsg('That person has nothing to say.')])
    return
  }

  const messages: GameMessage[] = []
  const talkFlag = `talked_${npcId}`

  // Check rolled disposition from _applyPopulation (W-2)
  const rolledNpc = currentRoom.population?.npcs.find(n => n.npcId === npcId)
  const disposition = rolledNpc?.disposition ?? 'neutral'

  // Hostile NPCs refuse conversation
  if (disposition === 'hostile') {
    const hostileNpcName = npc.name
    engine._appendMessages([
      msg(`${hostileNpcName} turns away, hand moving toward something at their belt. You're not welcome here.`),
    ])
    return
  }

  // Show NPC description on first talk this session
  if (!currentRoom.flags[talkFlag]) {
    messages.push(msg(npc.description))

    await updateRoomFlags(currentRoom.id, player.id, { [talkFlag]: true })
    const updatedRoom = {
      ...currentRoom,
      flags: { ...currentRoom.flags, [talkFlag]: true },
    }
    engine._setState({ currentRoom: updatedRoom })
  }

  // Dialogue line — wary NPCs are terse
  const cycle = player.cycle ?? 1
  const revenantLine = getRevenantDialogue(npcId, cycle)
  const dialogue = revenantLine ?? npc.dialogue

  if (disposition === 'wary') {
    messages.push(msg(`${npc.name} doesn't meet your eyes. "${dialogue}"`))
    messages.push(msg(`They don't offer anything else.`))
  } else if (disposition === 'friendly') {
    messages.push(msg(`"${dialogue}" \u2014 ${npc.name}`))
    messages.push(msg(`${npc.name} seems willing to talk more if you have questions.`))
  } else {
    messages.push(msg(`"${dialogue}" \u2014 ${npc.name}`))
  }

  engine._appendMessages(messages)
}

export async function handleSearch(engine: EngineCore): Promise<void> {
  const { currentRoom, player } = engine.getState()
  if (!currentRoom || !player) return

  if (currentRoom.flags['searched']) {
    engine._appendMessages([systemMsg('You have already searched this area.')])
    return
  }

  engine._appendMessages([systemMsg('You search the area carefully...')])

  // Nothing extra for now — items are already in the room
  if (currentRoom.items.length > 0) {
    engine._appendMessages([msg(itemsLine(currentRoom))])
  } else {
    engine._appendMessages([msg('You find nothing of note.')])
  }

  // Discover hidden exits via skill checks
  const newFlags: Record<string, boolean | number> = { searched: true }
  if (currentRoom.richExits) {
    for (const dir of Object.keys(currentRoom.richExits) as Direction[]) {
      const richExit = currentRoom.richExits[dir]
      if (!richExit?.hidden) continue
      if (currentRoom.flags[`discovered_exit_${dir}`]) continue

      const skill = richExit.discoverSkill ?? 'perception'
      const dc = richExit.discoverDc ?? 10
      const playerStat = getStatForSkill(skill, player)
      if (playerStat === null) continue

      const roll = Math.floor(Math.random() * 10) + 1 + playerStat
      if (roll >= dc) {
        newFlags[`discovered_exit_${dir}`] = true
        const discoverMsg = richExit.discoverMessage ?? `You notice a passage leading ${dir}.`
        engine._appendMessages([msg(discoverMsg)])
      }
    }
  }

  await updateRoomFlags(currentRoom.id, player.id, newFlags)
  const updatedRoom = { ...currentRoom, flags: { ...currentRoom.flags, ...newFlags } }
  engine._setState({ currentRoom: updatedRoom })
}

// ------------------------------------------------------------
// Map skill to player stat + class bonus (local helper)
// ------------------------------------------------------------

function getStatForSkill(skill: string, player: Player | null): number | null {
  if (!player) return null
  const map: Record<string, number> = {
    tracking: player.wits,
    survival: player.vigor,
    perception: player.wits,
    scavenging: player.wits,
    mechanics: player.wits,
    stealth: player.shadow,
    lockpicking: player.shadow,
    negotiation: player.presence,
    brawling: player.vigor,
    climbing: player.vigor,
    lore: player.wits,
    electronics: player.wits,
    marksmanship: player.reflex,
    bladework: player.reflex,
    field_medicine: player.presence,
    intimidation: player.presence,
    blood_sense: player.wits,
    daystalking: player.shadow,
    mesmerize: player.presence,
    vigor: player.vigor,
  }
  const base = map[skill] ?? null
  if (base === null) return null
  return base + getClassSkillBonus(player.characterClass, skill as SkillType)
}

// ------------------------------------------------------------
// Reputation display
// ------------------------------------------------------------

const ALL_FACTIONS: FactionType[] = [
  'accord', 'salters', 'drifters', 'kindling', 'reclaimers',
  'covenant_of_dusk', 'red_court', 'ferals', 'lucid',
]

const FACTION_DISPLAY_NAMES: Record<FactionType, string> = {
  accord: 'Accord',
  salters: 'Salters',
  drifters: 'Drifters',
  kindling: 'Kindling',
  reclaimers: 'Reclaimers',
  covenant_of_dusk: 'Covenant of Dusk',
  red_court: 'Red Court',
  ferals: 'Ferals',
  lucid: 'Lucid',
}

const REPUTATION_LABELS: Record<number, string> = {
  [-3]: 'Hunted',
  [-2]: 'Hostile',
  [-1]: 'Wary',
  [0]: 'Unknown',
  [1]: 'Recognized',
  [2]: 'Trusted',
  [3]: 'Blooded',
}

export async function handleRep(engine: EngineCore): Promise<void> {
  const { player } = engine.getState()
  if (!player) return

  const rep = player.factionReputation ?? {}
  const lines: string[] = ['Your standing:']

  for (const faction of ALL_FACTIONS) {
    const level = rep[faction] ?? 0
    const label = REPUTATION_LABELS[level] ?? 'Unknown'
    const displayName = FACTION_DISPLAY_NAMES[faction]
    const sign = level > 0 ? '+' : ''
    const padding = '.'.repeat(Math.max(1, 24 - displayName.length))
    lines.push(`  ${displayName} ${padding} ${label} (${sign}${level})`)
  }

  engine._appendMessages([systemMsg(lines.join('\n'))])
}

// ------------------------------------------------------------
// Quest flags display
// ------------------------------------------------------------

export async function handleQuests(engine: EngineCore): Promise<void> {
  const { player } = engine.getState()
  if (!player) return

  const flags = player.questFlags ?? {}
  const active = Object.entries(flags).filter(([, v]) => !!v)

  if (active.length === 0) {
    engine._appendMessages([systemMsg('No active quests.')])
    return
  }

  const lines: string[] = ['Active quests:']
  for (const [key, value] of active) {
    const name = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    if (typeof value === 'number') {
      lines.push(`  ${name} (${value})`)
    } else {
      lines.push(`  ${name}`)
    }
  }

  engine._appendMessages([systemMsg(lines.join('\n'))])
}
