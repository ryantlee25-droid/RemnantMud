// ============================================================
// lib/actions/movement.ts — handleMove, handleLook, handleExamine
// ============================================================

import type { GameMessage, Room, Direction, Player } from '@/types/game'
import type { EngineCore } from './types'
import { getRoom, canMove, markVisited, getExits } from '@/lib/world'
import { getItem } from '@/data/items'
import { getEnemy } from '@/data/enemies'
import { getNPC } from '@/data/npcs'

// ------------------------------------------------------------
// Map skill to player stat (mirrors examine.ts — kept local to
// avoid circular imports)
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
  return map[skill] ?? null
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
  const names = room.npcs
    .map((id) => getNPC(id)?.name ?? id)
    .join(', ')
  return `${names} is here.`
}

export function enemiesLine(room: Room): string {
  if (room.enemies.length === 0) return ''
  const names = room.enemies
    .map((id) => getEnemy(id)?.name ?? id)
    .join(', ')
  return `${names} lurks nearby.`
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

  if (!nextRoom.visited) {
    messages.push(msg(nextRoom.description))
    await markVisited(nextRoomId, player.id)
  } else {
    messages.push(msg(nextRoom.shortDescription))
  }

  messages.push(msg(exitsLine(nextRoom)))
  if (npcsLine(nextRoom)) messages.push(msg(npcsLine(nextRoom)))
  if (enemiesLine(nextRoom)) messages.push(combatMsg(enemiesLine(nextRoom)))
  if (itemsLine(nextRoom)) messages.push(msg(itemsLine(nextRoom)))

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
  const messages: GameMessage[] = [
    msg(currentRoom.description),
    msg(exitsLine(currentRoom)),
  ]
  if (itemsLine(currentRoom)) messages.push(msg(itemsLine(currentRoom)))
  if (npcsLine(currentRoom)) messages.push(msg(npcsLine(currentRoom)))
  if (enemiesLine(currentRoom)) messages.push(combatMsg(enemiesLine(currentRoom)))

  engine._appendMessages(messages)
}
