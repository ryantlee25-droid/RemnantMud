// ============================================================
// lib/actions/movement.ts — handleMove, handleLook, handleExamine
// ============================================================

import type { GameMessage, Room, Direction, Player, SkillType, TimeOfDay } from '@/types/game'
import type { EngineCore } from './types'
import { getRoom, canMove, markVisited, getExits } from '@/lib/world'
import { getItem } from '@/data/items'
import { getEnemy } from '@/data/enemies'
import { getNPC } from '@/data/npcs'
import { getClassSkillBonus } from '@/lib/skillBonus'
import { getTimeOfDay } from '@/lib/gameEngine'

// ------------------------------------------------------------
// Map skill to player stat + class bonus
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
// Local message helpers
// ------------------------------------------------------------

function msg(text: string, type: GameMessage['type'] = 'narrative'): GameMessage {
  return { id: crypto.randomUUID(), text, type }
}

function errorMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'error' }
}

function combatMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'combat' }
}

function reputationLabel(level: number): string {
  const labels: Record<number, string> = {
    [-3]: 'Hunted',
    [-2]: 'Hostile',
    [-1]: 'Wary',
    [0]: 'Unknown',
    [1]: 'Recognized',
    [2]: 'Trusted',
    [3]: 'Blooded',
  }
  return labels[level] ?? 'Unknown'
}

// ------------------------------------------------------------
// Room display helpers
// ------------------------------------------------------------

export function exitsLine(room: Room): string {
  const exits = getExits(room)
  if (exits.length === 0) return 'There are no obvious exits.'
  return `Exits: ${exits.map((e) => e.direction).join(', ')}.`
}

export function itemsLine(room: Room): string {
  if (room.items.length === 0) return ''
  const names = room.items
    .map((id) => getItem(id)?.name ?? id)
    .join(', ')
  return `You see: ${names}.`
}

export function npcsLine(room: Room): string {
  if (room.npcs.length === 0) return ''
  const lines = room.npcs.map((id) => {
    const rolledNpc = room.population?.npcs.find(n => n.npcId === id)
    // Use rolled activity description if available (full sentence from activityPool)
    if (rolledNpc && rolledNpc.activity !== 'is here') {
      return rolledNpc.activity
    }
    const name = getNPC(id)?.name ?? id
    return `${name} is here.`
  })
  return lines.join(' ')
}

export function enemiesLine(room: Room): string {
  if (room.enemies.length === 0) return ''
  const names = room.enemies
    .map((id) => getEnemy(id)?.name ?? id)
    .join(', ')
  return `${names} lurks nearby.`
}

// ------------------------------------------------------------
// Time-of-day room description
// ------------------------------------------------------------

function getRoomDescription(room: Room, timeOfDay: TimeOfDay): string {
  if (timeOfDay === 'night' && room.descriptionNight) return room.descriptionNight
  if (timeOfDay === 'dawn' && room.descriptionDawn) return room.descriptionDawn
  if (timeOfDay === 'dusk' && room.descriptionDusk) return room.descriptionDusk
  return room.description
}

// ------------------------------------------------------------
// Ambient sound helper
// ------------------------------------------------------------

function rollAmbientSound(room: Room, actionsTaken: number): string | null {
  const pool = room.environmentalRolls?.ambientSoundPool
  if (!pool) return null
  const tod = getTimeOfDay(actionsTaken)
  const entries = pool[tod] ?? pool.day ?? []
  if (entries.length === 0) return null
  // Weighted roll
  const totalWeight = entries.reduce((s, e) => s + e.weight, 0)
  if (totalWeight <= 0) return null
  let r = Math.random() * totalWeight
  for (const entry of entries) {
    r -= entry.weight
    if (r <= 0) return entry.sound
  }
  return null
}

// ------------------------------------------------------------
// Handlers
// ------------------------------------------------------------

export async function handleMove(engine: EngineCore, direction: string | undefined): Promise<void> {
  const { player, currentRoom, combatState } = engine.getState()
  if (!player || !currentRoom) return

  if (combatState?.active) {
    engine._appendMessages([errorMsg('You cannot flee this way while in combat. Use "flee" instead.')])
    return
  }

  if (!direction) {
    engine._appendMessages([errorMsg('Which direction?')])
    return
  }

  if (!canMove(currentRoom, direction)) {
    engine._appendMessages([errorMsg(`You can't go ${direction} from here.`)])
    return
  }

  const nextRoomId = currentRoom.exits[direction as keyof typeof currentRoom.exits]
  if (!nextRoomId) {
    engine._appendMessages([errorMsg(`No exit to the ${direction}.`)])
    return
  }

  // Check richExit gates before allowing passage
  const richExit = currentRoom.richExits?.[direction as Direction]
  if (richExit) {
    // Cycle gate
    if (richExit.cycleGate && (player.cycle ?? 1) < richExit.cycleGate) {
      engine._appendMessages([msg(`Something about this path feels wrong. You're not ready.`)])
      return
    }
    // Skill gate — must meet the DC in the relevant stat
    if (richExit.skillGate) {
      const { skill, dc, failMessage } = richExit.skillGate
      const statVal = getStatForSkill(skill, player)
      if (statVal !== null && statVal < dc) {
        engine._appendMessages([msg(failMessage)])
        return
      }
    }
    // Reputation gate — check faction standing
    if (richExit.reputationGate) {
      const { faction, minLevel } = richExit.reputationGate
      const rep = (player.factionReputation ?? {})[faction] ?? 0
      if (rep < minLevel) {
        const label = reputationLabel(rep)
        const required = reputationLabel(minLevel)
        engine._appendMessages([msg(`The ${faction} don't know you well enough. You're ${label} — need to be ${required}.`)])
        return
      }
    }
    // Quest gate
    if (richExit.questGate) {
      const flags = player.questFlags ?? {}
      if (!flags[richExit.questGate]) {
        engine._appendMessages([msg(`Something is missing. You're not ready for this path.`)])
        return
      }
    }
    // Locked exit — check if player holds the required key item
    if (richExit.locked) {
      const { inventory } = engine.getState()
      if (richExit.lockedBy && !inventory.some(i => i.itemId === richExit.lockedBy)) {
        engine._appendMessages([msg(`The way is locked. You need something to open it.`)])
        return
      }
    }
  }

  const rawNextRoom = await getRoom(nextRoomId, player.id)
  if (!rawNextRoom) {
    engine._appendMessages([errorMsg('That path leads nowhere.')])
    return
  }

  const nextRoom = engine._applyPopulation(rawNextRoom)
  const updatedPlayer = { ...player, currentRoomId: nextRoomId }
  engine._setState({ player: updatedPlayer, currentRoom: nextRoom })

  const messages: GameMessage[] = []
  const tod = getTimeOfDay(player.actionsTaken)

  if (!nextRoom.visited) {
    messages.push(msg(getRoomDescription(nextRoom, tod)))
    await markVisited(nextRoomId, player.id)
  } else {
    messages.push(msg(nextRoom.shortDescription))
  }

  messages.push(msg(exitsLine(nextRoom)))
  if (npcsLine(nextRoom)) messages.push(msg(npcsLine(nextRoom)))
  if (enemiesLine(nextRoom)) messages.push(combatMsg(enemiesLine(nextRoom)))
  if (itemsLine(nextRoom)) messages.push(msg(itemsLine(nextRoom)))

  // Personal loss echoes — intrusive thoughts tied to the player's loss
  const playerLoss = updatedPlayer.personalLossType
  if (playerLoss && nextRoom.personalLossEchoes?.[playerLoss]) {
    messages.push(msg(nextRoom.personalLossEchoes[playerLoss]))
  }

  // Ambient sound roll
  const ambientSound = rollAmbientSound(nextRoom, player.actionsTaken)
  if (ambientSound) messages.push(msg(ambientSound))

  // Memory bleeds — triggered at Cycle 4+, 5% base chance
  const playerCycle = engine.getState().player?.cycle ?? 1
  if (playerCycle >= 4 && Math.random() < 0.05) {
    const bleeds = [
      'A fragment: this corridor, different light. You were here before. You died here.',
      'For a moment you know exactly what is behind the next door. The feeling passes.',
      'Someone is standing where you are standing. You blink and they are gone.',
      'The smell hits you first — specific, wrong. A memory from a cycle you can barely reach.',
      'You have walked this exact path before. Not in this life.',
      'A sound: your name, in a voice you no longer remember the face of.',
      'The scar on your arm throbs. You died near here once. The virus remembers.',
      'Déjà vu, but worse — you know it is real.',
    ]
    const bleed = bleeds[Math.floor(Math.random() * bleeds.length)]!
    messages.push(msg(`[${bleed}]`, 'narrative'))
  }

  engine._appendMessages(messages)
  await engine._savePlayer()
}

export async function handleLook(engine: EngineCore, target: string | undefined): Promise<void> {
  const { currentRoom, combatState } = engine.getState()
  if (!currentRoom) return

  if (target) {
    const targetLower = target.toLowerCase()

    // Check enemies
    const enemyId = currentRoom.enemies.find((id) => {
      const e = getEnemy(id)
      return e && e.name.toLowerCase().includes(targetLower)
    })
    if (enemyId) {
      const enemy = getEnemy(enemyId)!
      const hpDisplay = combatState?.active && combatState.enemy.id === enemyId
        ? ` [${combatState.enemyHp}/${enemy.maxHp} HP]`
        : ''
      engine._appendMessages([msg(`${enemy.name}${hpDisplay}: ${enemy.description}`)])
      return
    }

    // Check items in room
    const itemId = currentRoom.items.find((id) => {
      const it = getItem(id)
      return it && it.name.toLowerCase().includes(targetLower)
    })
    if (itemId) {
      const item = getItem(itemId)!
      engine._appendMessages([msg(`${item.name}: ${item.description}`)])
      return
    }

    // Check inventory items
    const invItem = engine.getState().inventory.find((ii) =>
      ii.item.name.toLowerCase().includes(targetLower)
    )
    if (invItem) {
      engine._appendMessages([msg(`${invItem.item.name}: ${invItem.item.description}`)])
      return
    }

    // Check NPCs
    const npcId = currentRoom.npcs.find((id) => {
      const n = getNPC(id)
      return n && n.name.toLowerCase().includes(targetLower)
    })
    if (npcId) {
      const npc = getNPC(npcId)!
      engine._appendMessages([msg(`${npc.name}: ${npc.description}`)])
      return
    }

    engine._appendMessages([errorMsg(`You don't see that here.`)])
    return
  }

  // General look
  const player = engine.getState().player
  const tod = getTimeOfDay(player?.actionsTaken ?? 0)
  const messages: GameMessage[] = [
    msg(getRoomDescription(currentRoom, tod)),
    msg(exitsLine(currentRoom)),
  ]
  if (itemsLine(currentRoom)) messages.push(msg(itemsLine(currentRoom)))
  if (npcsLine(currentRoom)) messages.push(msg(npcsLine(currentRoom)))
  if (enemiesLine(currentRoom)) messages.push(combatMsg(enemiesLine(currentRoom)))

  // Ambient sound roll
  const ambientSound = rollAmbientSound(currentRoom, player?.actionsTaken ?? 0)
  if (ambientSound) messages.push(msg(ambientSound))

  engine._appendMessages(messages)
}
