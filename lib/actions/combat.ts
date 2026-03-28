// ============================================================
// lib/actions/combat.ts — handleAttack, handleFlee, noise encounters
// ============================================================

import type { GameMessage, Player, Room, Enemy, CombatState } from '@/types/game'
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
import { fearCheck } from '@/lib/fear'
import { rt } from '@/lib/richText'
import { rollCheck } from '@/lib/dice'
import { getClassSkillBonus } from '@/lib/skillBonus'
import { cureCondition, tickConditions, tryShakeFrightened } from '@/lib/conditions'
import { buildAnalyzeMessages } from '@/lib/abilities'

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
 * Falls back to a flat 20% chance when the room has no hollow encounter data.
 */
export async function checkNoiseEncounter(engine: EngineCore, isLoud: boolean): Promise<void> {
  if (!isLoud) return

  const { player, currentRoom, combatState } = engine.getState()
  if (!player || !currentRoom) return
  // Don't trigger if already in combat
  if (combatState?.active) return
  // Don't trigger in safe rooms
  if (currentRoom.flags?.noCombat) return

  const encounter = currentRoom.hollowEncounter

  if (encounter && encounter.baseChance > 0 && encounter.noiseModifier) {
    // Room has hollow encounter data — use noise-modified threshold
    const roll = Math.floor(Math.random() * 20) + 1
    const threshold = Math.ceil(encounter.baseChance * encounter.noiseModifier * 20)
    if (roll > threshold) return
  } else {
    // Fallback: flat 20% chance for any non-safe room
    if (Math.random() > 0.20) return
  }

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
    ? `A ${rt.enemy(enemy.name)} emerges from the shadows. You react first.`
    : `A ${rt.enemy(enemy.name)} emerges from the shadows. It's already moving.`
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

  // Clone enemy with fresh HP
  const enemy = { ...enemyTemplate }

  const newCombatState = startCombat(player, enemy)
  // Store current room for flee escape
  const combatWithRoom = { ...newCombatState, lastRoomId: player.currentRoomId }

  // Fear check: high-difficulty rooms impose a first-round penalty on failed grit check
  if (currentRoom.difficulty >= 4) {
    const fear = fearCheck(player, currentRoom)
    if (fear.afraid) {
      combatWithRoom.fearPenalty = 1
      combatWithRoom.fearRoundsRemaining = fear.fearRounds
    }
    engine._appendMessages(fear.messages)
  }

  engine._setState({ combatState: combatWithRoom })

  const initMsg = combatWithRoom.playerGoesFirst
    ? `Combat begins. You face the ${rt.enemy(enemy.name)}. You move first.`
    : `Combat begins. You face the ${rt.enemy(enemy.name)}. It moves first.`
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
    engine._appendMessages([systemMsg(`Fighting with ${rt.item(equippedWeapon.item.name)}.`)])
  }
}

async function doAttackRound(engine: EngineCore): Promise<void> {
  const { player, currentRoom, combatState, inventory } = engine.getState()
  if (!player || !currentRoom || !combatState) return

  const equippedWeapon = inventory.find((ii) => ii.equipped && ii.item.type === 'weapon')
  const equippedArmor = inventory.find((ii) => ii.equipped && ii.item.type === 'armor')
  const armorDefense = equippedArmor?.item.defense ?? 0

  // ── Round start: reset defendingThisTurn ──
  let activeCombat: CombatState = { ...combatState, defendingThisTurn: false }

  // ── Tick player conditions (DOTs, debuffs, expirations) ──
  const playerTick = tickConditions(activeCombat.playerConditions)
  if (playerTick.messages.length > 0) {
    engine._appendMessages(playerTick.messages.map(t => combatMsg(`[${rt.keyword('CONDITION')}] ${t}`)))
  }
  let latestPlayerHp = player.hp
  if (playerTick.damage > 0) {
    latestPlayerHp = Math.max(0, player.hp - playerTick.damage)
    engine._setState({ player: { ...player, hp: latestPlayerHp } })
    engine._appendMessages([combatMsg(`Conditions deal ${playerTick.damage} damage to you. HP: ${latestPlayerHp}/${player.maxHp}`)])
    if (latestPlayerHp <= 0) {
      engine._setState({ combatState: { ...activeCombat, playerConditions: playerTick.remaining, active: false } })
      await engine._handlePlayerDeath()
      return
    }
  }
  activeCombat = { ...activeCombat, playerConditions: playerTick.remaining }

  // ── Tick enemy conditions (DOTs, debuffs, expirations) ──
  const enemyTick = tickConditions(activeCombat.enemyConditions)
  if (enemyTick.messages.length > 0) {
    engine._appendMessages(enemyTick.messages.map(t => combatMsg(`[${rt.keyword('CONDITION')}] ${rt.enemy(combatState.enemy.name)}: ${t}`)))
  }
  if (enemyTick.damage > 0) {
    const newEHp = Math.max(0, activeCombat.enemyHp - enemyTick.damage)
    activeCombat = { ...activeCombat, enemyHp: newEHp, enemyConditions: enemyTick.remaining }
    engine._appendMessages([combatMsg(`Conditions deal ${enemyTick.damage} damage to ${rt.enemy(combatState.enemy.name)}.`)])
    if (newEHp <= 0) {
      engine._appendMessages([combatMsg(`${rt.enemy(combatState.enemy.name)} succumbs to its wounds.`)])
      activeCombat = { ...activeCombat, active: false }
      engine._setState({ combatState: activeCombat })
      await handleEnemyDefeated(engine, engine.getState().player!, currentRoom, activeCombat, equippedWeapon, false)
      return
    }
  } else {
    activeCombat = { ...activeCombat, enemyConditions: enemyTick.remaining }
  }

  // ── Try to shake frightened with grit check ──
  if (activeCombat.playerConditions.some(c => c.id === 'frightened')) {
    const latestPlayer = engine.getState().player!
    const shakeResult = tryShakeFrightened(activeCombat.playerConditions, latestPlayer.grit)
    activeCombat = { ...activeCombat, playerConditions: shakeResult.conditions }
    if (shakeResult.message) {
      engine._appendMessages([combatMsg(shakeResult.message)])
    }
  }

  // ── Check for player stun (skip player turn) ──
  const playerStunned = activeCombat.playerConditions.some(c => c.id === 'stunned')
  if (playerStunned) {
    engine._appendMessages([combatMsg(`You're stunned and can't act this turn.`)])
  }

  // ── Check for enemy stun (skip enemy turn) ──
  const enemyStunned = activeCombat.enemyConditions.some(c => c.id === 'stunned')

  engine._setState({ combatState: activeCombat })

  // ── Apply hollow round effects (screamer summon, whisperer debuff with grit resistance) ──
  const { messages: hollowMsgs, newState: afterHollow } = applyHollowRoundEffects(activeCombat, engine.getState().player!)
  if (hollowMsgs.length > 0) {
    engine._appendMessages(hollowMsgs)
    engine._setState({ combatState: afterHollow })
  }
  activeCombat = hollowMsgs.length > 0 ? afterHollow : activeCombat

  // ── Player attacks (unless stunned) ──
  if (!playerStunned) {
    const playerDamageRange: [number, number] = equippedWeapon?.item.damage
      ? [1, equippedWeapon.item.damage]
      : [1, 3]
    const { result: playerResult, newState: afterPlayer } = playerAttack(
      engine.getState().player!,
      activeCombat,
      playerDamageRange,
      equippedWeapon?.item,
    )
    engine._appendMessages(playerResult.messages)
    engine._setState({ combatState: afterPlayer })

    // Apply draining heal from weapon trait
    if (afterPlayer._healPlayer && afterPlayer._healPlayer > 0) {
      const healTarget = engine.getState().player!
      const healedHp = Math.min(healTarget.maxHp, healTarget.hp + afterPlayer._healPlayer)
      engine._setState({ player: { ...healTarget, hp: healedHp } })
    }

    if (playerResult.enemyDefeated) {
      const suppressNoise = afterPlayer._suppressNoise ?? false
      await handleEnemyDefeated(engine, engine.getState().player!, currentRoom, afterPlayer, equippedWeapon, suppressNoise)
      return
    }

    activeCombat = afterPlayer
  }

  // ── Enemy attacks back (unless stunned) ──
  if (enemyStunned) {
    engine._appendMessages([combatMsg(`${rt.enemy(combatState.enemy.name)} is stunned and can't act.`)])
  } else {
    const latestPlayer = engine.getState().player!
    const { damage: rawDamage, messages: eMsgs, newState: afterEnemy } = enemyAttack(
      latestPlayer,
      activeCombat,
      equippedArmor?.item,
    )
    // Apply armor reduction (percentage-based: each defense point = 12%, capped at 50%, minimum 1 damage)
    const reductionPct = Math.min(armorDefense * 0.12, 0.50)
    const actualDamage = rawDamage > 0 ? Math.max(1, Math.ceil(rawDamage * (1 - reductionPct))) : 0

    // Rewrite last damage message to reflect armor
    const adjustedMsgs = eMsgs.map((m, i) => {
      if (i === eMsgs.length - 1 && actualDamage !== rawDamage && rawDamage > 0) {
        return { ...m, text: m.text.replace(`[${rawDamage} damage]`, `[${actualDamage} damage after armor]`) }
      }
      return m
    })

    engine._appendMessages(adjustedMsgs)

    let totalDamage = actualDamage

    // Additional enemies (summoned by screamer) also attack
    let latestCombat = afterEnemy
    if (latestCombat.additionalEnemies && latestCombat.additionalEnemies.length > 0) {
      for (const addEnemy of latestCombat.additionalEnemies) {
        const addCombatState: CombatState = {
          ...latestCombat,
          enemy: addEnemy,
          enemyHp: addEnemy.hp,
        }
        const { damage: addRawDmg, messages: addMsgs } = enemyAttack(latestPlayer, addCombatState, equippedArmor?.item)
        const addReductionPct = Math.min(armorDefense * 0.12, 0.50)
        const addActualDmg = addRawDmg > 0 ? Math.max(1, Math.ceil(addRawDmg * (1 - addReductionPct))) : 0

        const addAdjustedMsgs = addMsgs.map((m, i) => {
          if (i === addMsgs.length - 1 && addActualDmg !== addRawDmg && addRawDmg > 0) {
            return { ...m, text: m.text.replace(`[${addRawDmg} damage]`, `[${addActualDmg} damage after armor]`) }
          }
          return m
        })
        engine._appendMessages(addAdjustedMsgs)
        totalDamage += addActualDmg
      }
    }

    const newHp = Math.max(0, latestPlayer.hp - totalDamage)
    const updatedPlayer: Player = { ...latestPlayer, hp: newHp }
    engine._setState({ player: updatedPlayer, combatState: latestCombat })

    if (newHp <= 0) {
      await engine._handlePlayerDeath()
      return
    }

    // Show HP hint
    engine._appendMessages([systemMsg(`HP: ${newHp}/${latestPlayer.maxHp}`)])
  }

  await engine._savePlayer()
}

/**
 * Handle enemy defeat: XP, loot, room cleanup, additional enemies, noise check.
 * Extracted to share between normal kills and DOT kills.
 */
async function handleEnemyDefeated(
  engine: EngineCore,
  player: Player,
  currentRoom: Room,
  afterPlayer: CombatState,
  equippedWeapon: { item: { name: string; description: string } } | undefined,
  suppressNoise: boolean,
): Promise<void> {
  const xpGained = afterPlayer.enemy.xp
  const updatedPlayer: Player = { ...player, xp: player.xp + xpGained }
  const newEnemies = currentRoom.enemies.filter((id) => id !== afterPlayer.enemy.id)
  const updatedRoom: Room = { ...currentRoom, enemies: newEnemies }

  engine._appendMessages([systemMsg(`You gain ${xpGained} XP.`)])
  engine._setState({
    player: updatedPlayer,
    currentRoom: updatedRoom,
    combatState: null,
  })

  engine._checkLevelUp()

  // Roll and add loot to room
  const loot: string[] = []
  for (const entry of afterPlayer.enemy.loot) {
    if (Math.random() < entry.chance) {
      if (getItem(entry.itemId)) {
        loot.push(entry.itemId)
      }
    }
  }

  if (loot.length > 0) {
    const newItems = [...updatedRoom.items, ...loot]
    const roomWithLoot: Room = { ...updatedRoom, items: newItems }
    engine._setState({ currentRoom: roomWithLoot })
    const counts = new Map<string, { name: string; qty: number }>()
    for (const id of loot) {
      const existing = counts.get(id)
      if (existing) {
        existing.qty += 1
      } else {
        counts.set(id, { name: getItem(id)?.name ?? id, qty: 1 })
      }
    }
    const parts: string[] = []
    for (const { name, qty } of counts.values()) {
      parts.push(qty > 1 ? `${rt.item(name)} (x${qty})` : rt.item(name))
    }
    engine._appendMessages([msg(`You search the remains and find: ${parts.join(', ')}.`)])
    await updateRoomItems(currentRoom.id, player.id, newItems)
  }

  // W-4: Mark room cleared when last enemy falls
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

  // Check if screamer summoned additional enemies
  if (afterPlayer.additionalEnemies && afterPlayer.additionalEnemies.length > 0) {
    const nextEnemy = afterPlayer.additionalEnemies[0]!
    const remaining = afterPlayer.additionalEnemies.slice(1)
    const latestPlayer = engine.getState().player!
    const nextCombat = startCombat(latestPlayer, nextEnemy)
    engine._setState({
      combatState: { ...nextCombat, additionalEnemies: remaining, lastRoomId: afterPlayer.lastRoomId },
    })
    engine._appendMessages([combatMsg(`Another ${rt.enemy(nextEnemy.name)} closes in.`)])
  } else {
    // Combat fully over — check noise (unless silenced trait active)
    if (!suppressNoise) {
      const isRanged = equippedWeapon?.item.description
        ? /rifle|pistol|gun|firearm/i.test(equippedWeapon.item.description)
        : false
      if (isRanged) {
        await checkNoiseEncounter(engine, true)
      }
    } else {
      engine._appendMessages([combatMsg(`[${rt.keyword('SILENCED')}] The kill makes no sound.`)])
    }
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

  // Wraith shadowstrike prevents fleeing
  if (combatState.cantFlee) {
    engine._appendMessages([errorMsg('You committed to the fight. There is no running now.')])
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
    // Percentage-based armor reduction (each defense point = 12%, capped at 50%, minimum 1 damage)
    const fleeReductionPct = Math.min(armorDefense * 0.12, 0.50)
    const actualDamage = freeAttack.damage > 0 ? Math.max(1, Math.ceil(freeAttack.damage * (1 - fleeReductionPct))) : 0

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

// ------------------------------------------------------------
// Defend — skip attack, reduce incoming damage, cure burning
// ------------------------------------------------------------

export async function handleDefend(engine: EngineCore): Promise<void> {
  const { player, combatState } = engine.getState()
  if (!player) return

  if (!combatState?.active) {
    engine._appendMessages([errorMsg('You are not in combat.')])
    return
  }

  // Set defending flag
  const updatedCombat = { ...combatState, defendingThisTurn: true }

  // Cure burning condition
  const burnResult = cureCondition(updatedCombat.playerConditions, 'burning')
  if (burnResult.cured) {
    updatedCombat.playerConditions = burnResult.conditions
    engine._appendMessages([combatMsg('You roll on the ground. The flames die.')])
  }

  engine._setState({ combatState: updatedCombat })
  engine._appendMessages([combatMsg('You brace for impact.')])

  // Enemy still attacks (at reduced damage due to defendingThisTurn flag)
  await doEnemyTurn(engine)
}

// ------------------------------------------------------------
// Wait — skip attack, gain +3 accuracy next turn
// ------------------------------------------------------------

export async function handleWait(engine: EngineCore): Promise<void> {
  const { player, combatState } = engine.getState()
  if (!player) return

  if (!combatState?.active) {
    engine._appendMessages([errorMsg('You are not in combat.')])
    return
  }

  const updatedCombat = { ...combatState, waitingBonus: 3 }
  engine._setState({ combatState: updatedCombat })
  engine._appendMessages([combatMsg('You watch. You wait. You learn.')])

  // Enemy still attacks
  await doEnemyTurn(engine)
}

// ------------------------------------------------------------
// Analyze — inspect enemy (Reclaimer auto-success, others Wits DC 11)
// ------------------------------------------------------------

export async function handleAnalyze(engine: EngineCore): Promise<void> {
  const { player, combatState } = engine.getState()
  if (!player) return

  if (!combatState?.active) {
    engine._appendMessages([errorMsg('You are not in combat.')])
    return
  }

  if (player.characterClass === 'reclaimer') {
    // Reclaimer: free, auto-success
    const analyzeMessages = buildAnalyzeMessages(engine)
    engine._appendMessages(analyzeMessages)
  } else {
    // Other classes: Wits DC 11 check
    const check = rollCheck(player.wits, 11)
    if (check.success) {
      const analyzeMessages = buildAnalyzeMessages(engine)
      engine._appendMessages(analyzeMessages)
    } else {
      engine._appendMessages([combatMsg('You try to read the enemy. Nothing useful comes to mind.')])
    }
  }
}

// ------------------------------------------------------------
// Enemy turn helper (used by defend/wait to run enemy attack)
// ------------------------------------------------------------

async function doEnemyTurn(engine: EngineCore): Promise<void> {
  const { player, combatState, inventory } = engine.getState()
  if (!player || !combatState) return

  const equippedArmor = inventory.find((ii) => ii.equipped && ii.item.type === 'armor')
  const armorDefense = equippedArmor?.item.defense ?? 0

  // Apply hollow round effects
  const { messages: hollowMsgs, newState: afterHollow } = applyHollowRoundEffects(combatState, player)
  if (hollowMsgs.length > 0) {
    engine._appendMessages(hollowMsgs)
    engine._setState({ combatState: afterHollow })
  }
  const activeCombat = hollowMsgs.length > 0 ? afterHollow : combatState

  // Check intimidated: enemy skips turn
  if (activeCombat.enemyIntimidated) {
    engine._appendMessages([combatMsg(`The ${rt.enemy(activeCombat.enemy.name)} hesitates, unable to act.`)])
    const cleared = { ...activeCombat, enemyIntimidated: false, turn: activeCombat.turn + 1 }
    engine._setState({ combatState: cleared })
    engine._appendMessages([systemMsg(`HP: ${player.hp}/${player.maxHp}`)])
    await engine._savePlayer()
    return
  }

  // Enemy attacks (pass armor for trait resolution)
  const { damage: rawDamage, messages: eMsgs, newState: afterEnemy } = enemyAttack(player, activeCombat, equippedArmor?.item)

  // Apply armor reduction
  const reductionPct = Math.min(armorDefense * 0.12, 0.50)
  let actualDamage = rawDamage > 0 ? Math.max(1, Math.ceil(rawDamage * (1 - reductionPct))) : 0

  // Defending damage reduction is now handled inside enemyAttack via state.defendingThisTurn
  // But doEnemyTurn also applies its own defend/brace reductions for the defend/wait commands
  if (activeCombat.defendingThisTurn && actualDamage > 0) {
    actualDamage = Math.max(1, Math.ceil(actualDamage * 0.5))
  }

  // Brace active (Warden): reduce damage 60%
  if (activeCombat.braceActive && actualDamage > 0) {
    actualDamage = Math.max(1, Math.ceil(actualDamage * 0.4))
  }

  // Enraged enemy: +2 damage
  if (activeCombat.enemyEnraged && actualDamage > 0) {
    actualDamage += 2
  }

  // Rewrite damage messages to reflect reductions
  const adjustedMsgs = eMsgs.map((m, i) => {
    if (i === eMsgs.length - 1 && actualDamage !== rawDamage && rawDamage > 0) {
      return { ...m, text: m.text.replace(`[${rawDamage} damage]`, `[${actualDamage} damage after defense]`) }
    }
    return m
  })

  engine._appendMessages(adjustedMsgs)

  // Clear per-turn flags
  const clearedCombat = {
    ...afterEnemy,
    defendingThisTurn: false,
    braceActive: false,
    enemyEnraged: false,
  }

  const newHp = Math.max(0, player.hp - actualDamage)
  const updatedPlayer: Player = { ...player, hp: newHp }
  engine._setState({ player: updatedPlayer, combatState: clearedCombat })

  if (newHp <= 0) {
    await engine._handlePlayerDeath()
    return
  }

  engine._appendMessages([systemMsg(`HP: ${newHp}/${player.maxHp}`)])
  await engine._savePlayer()
}
