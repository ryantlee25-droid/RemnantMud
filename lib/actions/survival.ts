// ============================================================
// lib/actions/survival.ts — handleRest, handleCamp, handleDrink
// Room-flag-driven survival commands.
// ============================================================

import type { GameMessage, Player } from '@/types/game'
import type { EngineCore } from './types'

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
// rest / sleep — requires safeRest flag
// ------------------------------------------------------------

export async function handleRest(engine: EngineCore): Promise<void> {
  const { player, currentRoom, combatState } = engine.getState()
  if (!player || !currentRoom) return

  if (combatState?.active) {
    engine._appendMessages([errorMsg('You cannot rest while in combat.')])
    return
  }

  if (!currentRoom.flags.safeRest) {
    engine._appendMessages([msg('This place is too exposed. You need somewhere safer to rest.')])
    return
  }

  if (player.hp >= player.maxHp) {
    engine._appendMessages([msg('You sit for a moment, but you are already at full strength.')])
    return
  }

  // Heal 3-5 HP, boosted by healingBonus flag if present
  const baseHeal = 3 + Math.floor(Math.random() * 3) // 3–5
  const bonus = typeof currentRoom.flags.healingBonus === 'number' ? currentRoom.flags.healingBonus : 1
  const heal = Math.floor(baseHeal * bonus)
  const newHp = Math.min(player.maxHp, player.hp + heal)
  const actualHeal = newHp - player.hp

  const updatedPlayer: Player = { ...player, hp: newHp }
  engine._setState({ player: updatedPlayer })

  engine._appendMessages([
    msg('You settle in and close your eyes. The world goes quiet for a while.'),
    systemMsg(`You recover ${actualHeal} HP. (${newHp}/${player.maxHp})`),
  ])

  await engine._savePlayer()
}

// ------------------------------------------------------------
// camp — requires campfireAllowed flag + tinder/fire supplies
// ------------------------------------------------------------

const FIRE_SUPPLY_KEYWORDS = ['tinder', 'flint', 'lighter', 'matches', 'fire_kit', 'firestarter']

export async function handleCamp(engine: EngineCore): Promise<void> {
  const { player, currentRoom, combatState, inventory } = engine.getState()
  if (!player || !currentRoom) return

  if (combatState?.active) {
    engine._appendMessages([errorMsg('You cannot make camp while in combat.')])
    return
  }

  if (!currentRoom.flags.campfireAllowed) {
    engine._appendMessages([msg('There is no good place to build a fire here.')])
    return
  }

  // Check for fire supplies in inventory
  const hasFireSupplies = inventory.some((ii) =>
    FIRE_SUPPLY_KEYWORDS.some((kw) =>
      ii.itemId.toLowerCase().includes(kw) || ii.item.name.toLowerCase().includes(kw)
    )
  )

  if (!hasFireSupplies) {
    engine._appendMessages([msg('You could build a fire here, but you have nothing to start one with.')])
    return
  }

  if (player.hp >= player.maxHp) {
    engine._appendMessages([
      msg('You build a small fire. The warmth is welcome, though you are already at full strength.'),
    ])
    return
  }

  // Heal 4-6 HP with campfire warmth
  const baseHeal = 4 + Math.floor(Math.random() * 3) // 4–6
  const bonus = typeof currentRoom.flags.healingBonus === 'number' ? currentRoom.flags.healingBonus : 1
  const heal = Math.floor(baseHeal * bonus)
  const newHp = Math.min(player.maxHp, player.hp + heal)
  const actualHeal = newHp - player.hp

  const updatedPlayer: Player = { ...player, hp: newHp }
  engine._setState({ player: updatedPlayer })

  engine._appendMessages([
    msg('You gather what you can and coax a small fire to life. The warmth spreads through your aching bones.'),
    systemMsg(`You recover ${actualHeal} HP. (${newHp}/${player.maxHp})`),
  ])

  await engine._savePlayer()
}

// ------------------------------------------------------------
// drink / fill — requires waterSource flag
// ------------------------------------------------------------

export async function handleDrink(engine: EngineCore): Promise<void> {
  const { player, currentRoom, combatState } = engine.getState()
  if (!player || !currentRoom) return

  if (combatState?.active) {
    engine._appendMessages([errorMsg('You cannot drink while in combat.')])
    return
  }

  if (!currentRoom.flags.waterSource) {
    engine._appendMessages([msg('There is no water source here.')])
    return
  }

  // Small HP recovery: 2-3 HP
  const heal = 2 + Math.floor(Math.random() * 2) // 2–3
  const newHp = Math.min(player.maxHp, player.hp + heal)
  const actualHeal = newHp - player.hp

  if (actualHeal <= 0) {
    engine._appendMessages([msg('You drink from the water. It is cold and clean, though you feel no better for it.')])
    return
  }

  const updatedPlayer: Player = { ...player, hp: newHp }
  engine._setState({ player: updatedPlayer })

  engine._appendMessages([
    msg('You kneel and drink. The water is cold — startlingly alive against your throat.'),
    systemMsg(`You recover ${actualHeal} HP. (${newHp}/${player.maxHp})`),
  ])

  await engine._savePlayer()
}
