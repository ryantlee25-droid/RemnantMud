// ============================================================
// lib/actions/combat.ts — handleAttack, handleFlee, noise encounters
// ============================================================

import type { GameMessage, Player, Room, Enemy } from '@/types/game'
import type { EngineCore } from './types'
import {
  startCombat,
  playerAttack,
  enemyAttack,
  flee as fleeCombat,
  applyHollowRoundEffects,
  enemyHpIndicator,
} from '@/lib/combat'
import { getItem } from '@/data/items'
import { getEnemy } from '@/data/enemies'
import { updateRoomItems, updateRoomFlags } from '@/lib/world'

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

function combatMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'combat' }
}

// ------------------------------------------------------------
// Noise-triggered hollow encounter
// ------------------------------------------------------------

/**
 * Check if a loud action draws Hollow to the current room.
 * Call after ranged weapon attacks or other noisy actions.
 */
export async function checkNoiseEncounter(engine: EngineCore, isLoud: boolean): Promise<void> {
  if (!isLoud) return

  const { player, currentRoom, combatState } = engine.getState()
  if (!player || !currentRoom) return
  // Don't trigger if already in combat
  if (combatState?.active) return

  const encounter = currentRoom.hollowEncounter
  if (!encounter || encounter.baseChance <= 0) return
  // Only trigger if room has a noise modifier
  if (!encounter.noiseModifier) return

  // d20 roll vs noise-modified base chance
  const roll = Math.floor(Math.random() * 20) + 1
  const threshold = Math.ceil(encounter.baseChance * encounter.noiseModifier * 20)

  if (roll > threshold) return

  // Spawn a shuffler or remnant randomly
  const spawnId = Math.random() < 0.6 ? 'shuffler' : 'remnant'
  const enemyTemplate = getEnemy(spawnId)
  if (!enemyTemplate) return

  engine._appendMessages([combatMsg(`Something in the dark heard that.`)])

  // Add enemy to room and start combat
  const updatedRoom: Room = { ...currentRoom, enemies: [...currentRoom.enemies, spawnId] }
  engine._setState({ currentRoom: updatedRoom })

  const enemy = { ...enemyTemplate }
  const newCombatState = startCombat(player, enemy)
  // Store current room as lastRoomId for flee escape
  const combatWithRoom = { ...newCombatState, lastRoomId: player.currentRoomId }
  engine._setState({ combatState: combatWithRoom })

  const initLine = combatWithRoom.playerGoesFirst
    ? `A ${enemy.name} emerges from the shadows. You react first.`
    : `A ${enemy.name} emerges from the shadows. It's already moving.`
  engine._appendMessages([combatMsg(initLine)])

  if (!combatWithRoom.playerGoesFirst) {
    const { damage, messages, newState } = enemyAttack(player, combatWithRoom)
    engine._appendMessages(messages)
    const newHp = Math.max(0, player.hp - damage)
    engine._setState({ player: { ...player, hp: newHp }, combatState: newState })
    if (newHp <= 0) {
      await engine._handlePlayerDeath()
    }
  }
}

// ------------------------------------------------------------
// Handlers
// ------------------------------------------------------------

export async function handleAttack(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { player, currentRoom, combatState, inventory } = engine.getState()
  if (!player || !currentRoom) return

  // If already in combat, attack the current enemy
  if (combatState?.active) {
    await doAttackRound(engine)
    return
  }

  // Start combat
  if (currentRoom.enemies.length === 0) {
    engine._appendMessages([errorMsg('There is nothing to attack here.')])
    return
  }

  let targetId: string | undefined
  if (noun) {
    const nounLower = noun.toLowerCase()
    targetId = currentRoom.enemies.find((id) => {
      const e = getEnemy(id)
      return e && e.name.toLowerCase().includes(nounLower)
    })
  } else {
    targetId = currentRoom.enemies[0]
  }

  if (!targetId) {
    engine._appendMessages([errorMsg(`You don't see that enemy here.`)])
    return
  }

  const enemyTemplate = getEnemy(targetId)
  if (!enemyTemplate) {
    engine._appendMessages([errorMsg('Unknown enemy.')])
    return
  }

  // Get equipped weapon
  const equippedWeapon = inventory.find((ii) => ii.equipped && ii.item.type === 'weapon')

  // Check if this is a ranged weapon (noise trigger)
  const isRanged = equippedWeapon?.item.description
    ? /rifle|pistol|gun|firearm/i.test(equippedWeapon.item.description)
    : false

  // Clone enemy with fresh HP
  const enemy = { ...enemyTemplate }

  const newCombatState = startCombat(player, enemy)
  // Store current room for flee escape
  const combatWithRoom = { ...newCombatState, lastRoomId: player.currentRoomId }
  engine._setState({ combatState: combatWithRoom })

  const initMsg = combatWithRoom.playerGoesFirst
    ? `Combat begins. You face the ${enemy.name}. You move first.`
    : `Combat begins. You face the ${enemy.name}. It moves first.`
  engine._appendMessages([combatMsg(initMsg)])

  if (!combatWithRoom.playerGoesFirst) {
    // Enemy gets first attack
    const { damage, messages, newState } = enemyAttack(player, combatWithRoom)
    engine._appendMessages(messages)

    const newHp = Math.max(0, player.hp - damage)
    const updatedPlayer = { ...player, hp: newHp }
    engine._setState({ player: updatedPlayer, combatState: newState })

    if (newHp <= 0) {
      await engine._handlePlayerDeath()
      return
    }
  }

  // Display weapon hint
  if (equippedWeapon) {
    engine._appendMessages([systemMsg(`Fighting with ${equippedWeapon.item.name}.`)])
  }

  // Noise check for ranged weapons (may draw more enemies after this combat)
  if (isRanged) {
    await checkNoiseEncounter(engine, true)
  }
}

async function doAttackRound(engine: EngineCore): Promise<void> {
  const { player, currentRoom, combatState, inventory } = engine.getState()
  if (!player || !currentRoom || !combatState) return

  const equippedWeapon = inventory.find((ii) => ii.equipped && ii.item.type === 'weapon')
  const equippedArmor = inventory.find((ii) => ii.equipped && ii.item.type === 'armor')
  const armorDefense = equippedArmor?.item.defense ?? 0

  // Apply hollow round effects (screamer summon, whisperer debuff)
  const { messages: hollowMsgs, newState: afterHollow } = applyHollowRoundEffects(combatState)
  if (hollowMsgs.length > 0) {
    engine._appendMessages(hollowMsgs)
    engine._setState({ combatState: afterHollow })
  }
  const activeCombat = hollowMsgs.length > 0 ? afterHollow : combatState

  // Player attacks — use equipped weapon's damage range, or bare-hands fallback
  const playerDamageRange: [number, number] = equippedWeapon?.item.damage
    ? [1, equippedWeapon.item.damage]
    : [1, 3]
  const { result: playerResult, newState: afterPlayer } = playerAttack(player, activeCombat, playerDamageRange)
  engine._appendMessages(playerResult.messages)
  engine._setState({ combatState: afterPlayer })

  if (playerResult.enemyDefeated) {
    // Award XP, drop loot, remove enemy from room
    const xpGained = combatState.enemy.xp
    const updatedPlayer: Player = { ...player, xp: player.xp + xpGained }
    const newEnemies = currentRoom.enemies.filter((id) => id !== combatState.enemy.id)
    const updatedRoom: Room = { ...currentRoom, enemies: newEnemies }

    engine._appendMessages([systemMsg(`You gain ${xpGained} XP.`)])
    engine._setState({
      player: updatedPlayer,
      currentRoom: updatedRoom,
      combatState: null,
    })

    // Add loot to room
    if (playerResult.loot && playerResult.loot.length > 0) {
      const newItems = [...updatedRoom.items, ...playerResult.loot]
      const roomWithLoot: Room = { ...updatedRoom, items: newItems }
      engine._setState({ currentRoom: roomWithLoot })
      const lootNames = playerResult.loot.map((id) => getItem(id)?.name ?? id).join(', ')
      engine._appendMessages([msg(`The ${combatState.enemy.name} dropped: ${lootNames}.`)])
      await updateRoomItems(currentRoom.id, player.id, newItems)
    }

    // W-4: Mark room cleared when last enemy falls (suppresses re-spawn for 8 time periods)
    if (newEnemies.length === 0 && !afterPlayer.additionalEnemies?.length) {
      const actionsTaken = player.actionsTaken ?? 0
      await updateRoomFlags(currentRoom.id, player.id, {
        room_cleared: true,
        room_cleared_at: actionsTaken,
      })
      engine._setState({
        currentRoom: {
          ...engine.getState().currentRoom!,
          flags: {
            ...engine.getState().currentRoom!.flags,
            room_cleared: true,
            room_cleared_at: actionsTaken,
          },
        },
      })
    }

    // Check if screamer summoned additional enemies that need fighting
    if (afterPlayer.additionalEnemies && afterPlayer.additionalEnemies.length > 0) {
      const nextEnemy = afterPlayer.additionalEnemies[0]!
      const remaining = afterPlayer.additionalEnemies.slice(1)
      const nextCombat = startCombat(player, nextEnemy)
      engine._setState({
        combatState: { ...nextCombat, additionalEnemies: remaining, lastRoomId: afterPlayer.lastRoomId },
      })
      engine._appendMessages([combatMsg(`Another ${nextEnemy.name} closes in.`)])
    }

    await engine._savePlayer()
    return
  }

  // Enemy attacks back
  const { damage: rawDamage, messages: eMsgs, newState: afterEnemy } = enemyAttack(player, afterPlayer)
  // Apply armor reduction
  const actualDamage = Math.max(0, rawDamage - armorDefense)

  // Rewrite last damage message to reflect armor
  const adjustedMsgs = eMsgs.map((m, i) => {
    if (i === eMsgs.length - 1 && actualDamage !== rawDamage && rawDamage > 0) {
      return { ...m, text: m.text.replace(`[${rawDamage} damage]`, `[${actualDamage} damage after armor]`) }
    }
    return m
  })

  engine._appendMessages(adjustedMsgs)

  const newHp = Math.max(0, player.hp - actualDamage)
  const updatedPlayer: Player = { ...player, hp: newHp }
  engine._setState({ player: updatedPlayer, combatState: afterEnemy })

  if (newHp <= 0) {
    await engine._handlePlayerDeath()
    return
  }

  // Show HP hint
  engine._appendMessages([systemMsg(`HP: ${newHp}/${player.maxHp}`)])

  // Check ranged weapon noise after combat round
  const isRanged = equippedWeapon?.item.description
    ? /rifle|pistol|gun|firearm/i.test(equippedWeapon.item.description)
    : false
  if (isRanged) {
    // Noise check happens after combat ends, not during
    // (stored for post-combat trigger)
  }

  await engine._savePlayer()
}

export async function handleFlee(engine: EngineCore): Promise<void> {
  const { player, combatState } = engine.getState()
  if (!player) return

  if (!combatState?.active) {
    engine._appendMessages([errorMsg('You are not in combat.')])
    return
  }

  const { result, freeAttack } = fleeCombat(player, combatState)
  engine._appendMessages(result.messages)

  if (result.success) {
    engine._setState({ combatState: null })
    await engine._savePlayer()
    return
  }

  // Failed flee: enemy gets a free attack
  if (freeAttack) {
    const equippedArmor = engine.getState().inventory.find((ii) => ii.equipped && ii.item.type === 'armor')
    const armorDefense = equippedArmor?.item.defense ?? 0
    const actualDamage = Math.max(0, freeAttack.damage - armorDefense)

    // Rewrite damage messages to reflect armor
    const adjustedMsgs = freeAttack.messages.map((m, i) => {
      if (i === freeAttack.messages.length - 1 && actualDamage !== freeAttack.damage && freeAttack.damage > 0) {
        return { ...m, text: m.text.replace(`[${freeAttack.damage} damage]`, `[${actualDamage} damage after armor]`) }
      }
      return m
    })

    engine._appendMessages(adjustedMsgs)

    const newHp = Math.max(0, player.hp - actualDamage)
    const updatedPlayer: Player = { ...player, hp: newHp }
    engine._setState({ player: updatedPlayer, combatState: freeAttack.newState })

    if (newHp <= 0) {
      await engine._handlePlayerDeath()
      return
    }

    engine._appendMessages([systemMsg(`HP: ${newHp}/${player.maxHp}`)])
    await engine._savePlayer()
  }
}
