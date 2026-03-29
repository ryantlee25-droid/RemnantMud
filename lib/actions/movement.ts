// ============================================================
// lib/actions/movement.ts — handleMove, handleLook, handleExamine
// ============================================================

import type { GameMessage, Room, Direction, Player, TimeOfDay } from '@/types/game'
import type { EngineCore } from './types'
import { getRoom, canMove, markVisited, getExits } from '@/lib/world'
import { getItem } from '@/data/items'
import { groupAndFormatItems } from '@/lib/inventory'
import { getEnemy } from '@/data/enemies'
import { getNPC } from '@/data/npcs'
import { getStatForSkill } from '@/lib/skillBonus'
import { getTimeOfDay } from '@/lib/gameEngine'
import { fearCheck } from '@/lib/fear'
import { rt } from '@/lib/richText'
import { msg, combatMsg, errorMsg } from '@/lib/messages'

const DIRECTIONS: Record<string, Direction> = {
  north: 'north',
  n: 'north',
  south: 'south',
  s: 'south',
  east: 'east',
  e: 'east',
  west: 'west',
  w: 'west',
  up: 'up',
  down: 'down',
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
  return `Exits: ${exits.map((e) => rt.exit(e.direction)).join(', ')}.`
}

export function itemsLine(room: Room): string {
  if (room.items.length === 0) return ''
  const grouped = groupAndFormatItems(room.items)
  const names = grouped.map((g) => rt.item(g.displayName)).join(', ')
  return `You see: ${names}.`
}

export function npcsLine(room: Room): string {
  if (room.npcs.length === 0) return ''
  const lines = room.npcs.map((id) => {
    const rolledNpc = room.population?.npcs.find(n => n.npcId === id)
    const spawnEntry = room.npcSpawns?.find(s => s.npcId === id)
    const traderTag = spawnEntry?.tradeInventory?.length ? ` ${rt.keyword('[trader]')}` : ''
    // Use rolled activity description if available (full sentence from activityPool)
    if (rolledNpc && rolledNpc.activity !== 'is here') {
      return `${rolledNpc.activity}${traderTag}`
    }
    const name = getNPC(id)?.name ?? id
    return `${rt.npc(name)} is here.${traderTag}`
  })
  return lines.join(' ')
}

export function enemiesLine(room: Room): string {
  if (room.enemies.length === 0) return ''
  const names = room.enemies
    .map((id) => rt.enemy(getEnemy(id)?.name ?? id))
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
  // Only fire ~35% of the time to avoid spamming ambient text every room entry
  if (Math.random() > 0.35) return null
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
// Flavor line helper
// ------------------------------------------------------------

function rollFlavorLine(room: Room, actionsTaken: number): string | null {
  const lines = room.environmentalRolls?.flavorLines
  if (!lines || lines.length === 0) return null
  // Only fire ~25% of the time (independent of ambient sounds)
  if (Math.random() > 0.25) return null
  const tod = getTimeOfDay(actionsTaken)
  // Filter to lines valid for the current time of day (null/undefined time = always valid)
  const eligible = lines.filter((fl) => !fl.time || fl.time.includes(tod))
  if (eligible.length === 0) return null
  // Each eligible line has its own chance; pick the first that passes
  const shuffled = [...eligible].sort(() => Math.random() - 0.5)
  for (const fl of shuffled) {
    if (Math.random() < fl.chance) return fl.line
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
      if (statVal !== null) {
        const skillLabel = skill.replace(/_/g, ' ')
        const capitalizedSkill = skillLabel.charAt(0).toUpperCase() + skillLabel.slice(1)
        if (statVal < dc) {
          const diff = dc - statVal
          if (diff <= 2) {
            engine._appendMessages([msg(failMessage), { id: crypto.randomUUID(), text: `[${capitalizedSkill} check failed (close) — you're almost capable enough]`, type: 'system' }])
          } else {
            engine._appendMessages([msg(failMessage), { id: crypto.randomUUID(), text: `[${capitalizedSkill} check failed — you'd need more skill to pass this way]`, type: 'system' }])
          }
          return
        } else {
          engine._appendMessages([{ id: crypto.randomUUID(), text: `[${capitalizedSkill} check succeeded]`, type: 'system' }])
        }
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

  // Room-level cycle gate — block entry if player hasn't reached the required cycle
  if (rawNextRoom.cycleGate && (player.cycle ?? 1) < rawNextRoom.cycleGate) {
    engine._appendMessages([msg(`Something prevents you from going further. You're not ready yet.`)])
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
    // Increment rooms explored counter
    const currentState = engine.getState()
    engine._setState({ roomsExplored: currentState.roomsExplored + 1 })
  } else {
    messages.push(msg(nextRoom.shortDescription))
  }

  messages.push(msg(exitsLine(nextRoom)))
  if (npcsLine(nextRoom)) messages.push(msg(npcsLine(nextRoom)))
  if (enemiesLine(nextRoom)) messages.push(combatMsg(enemiesLine(nextRoom)))
  if (itemsLine(nextRoom)) messages.push(msg(itemsLine(nextRoom)))

  // Cleared-room feedback: tell the player the area is quiet (enemies suppressed)
  if (nextRoom.flags.room_cleared && nextRoom.enemies.length === 0) {
    const ENEMY_RESPAWN_ACTIONS = 160
    const clearedAt = nextRoom.flags.room_cleared_at
    if (typeof clearedAt === 'number') {
      const elapsed = (updatedPlayer.actionsTaken ?? 0) - clearedAt
      const remaining = ENEMY_RESPAWN_ACTIONS - elapsed
      if (remaining > 0) {
        messages.push(msg('This area has been cleared. It is quiet — for now.'))
      }
    } else {
      // room_cleared set but no timestamp — just show the quiet message
      messages.push(msg('This area has been cleared. It is quiet — for now.'))
    }
  }

  // Fear check for high-difficulty rooms with enemies (grit stat)
  if (nextRoom.enemies.length > 0 && nextRoom.difficulty >= 4) {
    const fear = fearCheck(updatedPlayer, nextRoom)
    messages.push(...fear.messages)
  }

  // Room flag flavor text on first visit
  if (!nextRoom.visited) {
    if (nextRoom.flags.safeRest) {
      messages.push(msg('This place feels safe. You could rest here.'))
    }
    if (nextRoom.flags.waterSource) {
      messages.push(msg('You hear the sound of running water nearby.'))
    }
    if (nextRoom.flags.campfireAllowed) {
      messages.push(msg('There is a sheltered spot here — good enough for a campfire.'))
    }
  }

  // Personal loss echoes — intrusive thoughts tied to the player's loss
  const playerLoss = updatedPlayer.personalLossType
  if (playerLoss && nextRoom.personalLossEchoes?.[playerLoss]) {
    messages.push(msg(nextRoom.personalLossEchoes[playerLoss]))
  }

  // Ambient sound roll
  const ambientSound = rollAmbientSound(nextRoom, player.actionsTaken)
  if (ambientSound) messages.push(msg(ambientSound))

  // Flavor line roll (independent of ambient sounds, ~25% chance)
  const flavorLine = rollFlavorLine(nextRoom, player.actionsTaken)
  if (flavorLine) messages.push(msg(flavorLine))

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

  // Weather flavor (skip 'clear' — no message needed)
  const weather = engine.getState().weather
  if (weather && weather !== 'clear') {
    const weatherFlavor: Record<string, string> = {
      rain: 'Rain streaks across the view.',
      dust_storm: 'The air is thick with dust. You squint.',
      fog: 'Everything beyond thirty feet is suggestion.',
      overcast: 'Grey light. No shadows.',
    }
    if (weatherFlavor[weather]) {
      messages.push(msg(weatherFlavor[weather]!))
    }
  }

  engine._appendMessages(messages)

  // After room entry, check for environmental hazards
  const newRoomFlags = nextRoom.flags ?? {}
  if (newRoomFlags.hazard_type) {
    const damage = (newRoomFlags.hazard_damage as number) ?? 0
    const hazardMessage = (newRoomFlags.hazard_message as string) ?? 'The environment is hostile.'
    const mitigatedBy = newRoomFlags.hazard_mitigated_by as string | undefined
    const mitigationMsg = newRoomFlags.hazard_mitigation_message as string | undefined

    // Check if player has mitigation item in inventory
    const { inventory: currentInventory } = engine.getState()
    const hasMitigation = mitigatedBy !== undefined && currentInventory.some(i => i.itemId === mitigatedBy)

    if (hasMitigation && mitigationMsg) {
      engine._appendMessages([msg(mitigationMsg)])
    } else if (damage > 0) {
      const currentState = engine.getState()
      const currentPlayer = currentState.player!
      const newHp = Math.max(1, currentPlayer.hp - damage)
      engine._setState({ player: { ...currentPlayer, hp: newHp } })
      engine._appendMessages([combatMsg(`${hazardMessage} [-${damage} HP]`)])

      if (newHp <= 1) {
        engine._appendMessages([combatMsg('You need to find shelter. You can barely stand.')])
      }
    } else {
      // Dark rooms or 0-damage hazards — just show the message
      engine._appendMessages([msg(hazardMessage)])
    }
  }

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
      engine._appendMessages([msg(`${rt.enemy(enemy.name)}${hpDisplay}: ${enemy.description}`)])
      return
    }

    // Check items in room
    const itemId = currentRoom.items.find((id) => {
      const it = getItem(id)
      return it && it.name.toLowerCase().includes(targetLower)
    })
    if (itemId) {
      const item = getItem(itemId)!
      engine._appendMessages([msg(`${rt.item(item.name)}: ${item.description}`)])
      return
    }

    // Check inventory items
    const invItem = engine.getState().inventory.find((ii) =>
      ii.item.name.toLowerCase().includes(targetLower)
    )
    if (invItem) {
      engine._appendMessages([msg(`${rt.item(invItem.item.name)}: ${invItem.item.description}`)])
      return
    }

    // Check NPCs — match by name, ID, activity text, or faction
    const npcId = currentRoom.npcs.find((id) => {
      const n = getNPC(id)
      if (!n) return false
      if (n.name.toLowerCase().includes(targetLower)) return true
      if (id.toLowerCase().includes(targetLower)) return true
      const rolledNpc = currentRoom.population?.npcs.find(rn => rn.npcId === id)
      if (rolledNpc?.activity && rolledNpc.activity.toLowerCase().includes(targetLower)) return true
      if (n.faction && n.faction.toLowerCase().includes(targetLower)) return true
      return false
    })
    if (npcId) {
      const npc = getNPC(npcId)!
      engine._appendMessages([msg(`${rt.npc(npc.name)}: ${npc.description}`)])
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

  // Cleared-room feedback on look
  if (currentRoom.flags.room_cleared && currentRoom.enemies.length === 0) {
    const ENEMY_RESPAWN_ACTIONS = 160
    const clearedAt = currentRoom.flags.room_cleared_at
    if (typeof clearedAt === 'number') {
      const elapsed = (player?.actionsTaken ?? 0) - clearedAt
      const remaining = ENEMY_RESPAWN_ACTIONS - elapsed
      if (remaining > 0) {
        messages.push(msg('This area has been cleared. It is quiet — for now.'))
      }
    } else {
      messages.push(msg('This area has been cleared. It is quiet — for now.'))
    }
  }

  // Ambient sound roll
  const ambientSound = rollAmbientSound(currentRoom, player?.actionsTaken ?? 0)
  if (ambientSound) messages.push(msg(ambientSound))

  engine._appendMessages(messages)
}

// ------------------------------------------------------------
// handleUnlock — unlock a locked exit using a key item
// ------------------------------------------------------------

export async function handleUnlock(engine: EngineCore, noun: string): Promise<void> {
  if (!noun || noun.trim() === '') {
    engine._appendMessages([errorMsg('Unlock what? Specify a direction.')])
    return
  }

  const direction = DIRECTIONS[noun.toLowerCase().trim()]
  if (!direction) {
    engine._appendMessages([errorMsg('Unlock what? Specify a direction.')])
    return
  }

  const { currentRoom, inventory } = engine.getState()
  if (!currentRoom) return

  const richExit = currentRoom.richExits?.[direction]

  if (!richExit || !richExit.locked || !richExit.lockedBy) {
    engine._appendMessages([msg(`There's nothing locked to the ${direction}.`)])
    return
  }

  const hasKey = inventory.some(i => i.itemId === richExit.lockedBy)
  if (!hasKey) {
    engine._appendMessages([msg("You don't have the right key.")])
    return
  }

  // Set room flag to mark the exit as unlocked
  const updatedFlags = { ...currentRoom.flags, [`unlocked_${direction}`]: true }
  engine._setState({ currentRoom: { ...currentRoom, flags: updatedFlags } })
  engine._appendMessages([msg(`You unlock the way to the ${direction}.`)])
}
