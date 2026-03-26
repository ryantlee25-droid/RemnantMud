import type {
  Player,
  Enemy,
  CombatState,
  CombatResult,
  FleeResult,
  GameMessage,
} from '@/types/game'
import { roll1d10, rollCheck, rollDamage, DC } from '@/lib/dice'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function msg(text: string, type: GameMessage['type'] = 'combat'): GameMessage {
  return { text, type }
}

// ------------------------------------------------------------
// Initiative
// ------------------------------------------------------------

/**
 * Initialize combat and roll initiative.
 * Both sides roll 1d10; higher goes first (ties go to player).
 */
export function startCombat(player: Player, enemy: Enemy): CombatState {
  const playerInit = roll1d10()
  const enemyInit = roll1d10()
  const playerGoesFirst = playerInit >= enemyInit

  return {
    enemy,
    enemyHp: enemy.hp,
    playerGoesFirst,
    turn: 1,
    active: true,
  }
}

// ------------------------------------------------------------
// Player attacks enemy
// ------------------------------------------------------------

/**
 * Player attacks the enemy using their Body modifier vs the enemy's defense DC.
 * All weapons are treated as melee / short-range for the MVP.
 * Returns a CombatResult and the updated CombatState.
 */
export function playerAttack(
  player: Player,
  state: CombatState,
  playerDamageRange: [number, number] = [1, 3],
): { result: CombatResult; newState: CombatState } {
  const { enemy } = state
  const check = rollCheck(player.vigor, enemy.defense)

  const messages: GameMessage[] = []

  if (check.fumble) {
    messages.push(
      msg(`You swing wildly. ${enemy.name} sidesteps and you nearly fall.`),
    )
    const newState: CombatState = { ...state, turn: state.turn + 1 }
    return {
      result: { hit: false, damage: 0, critical: false, fumble: true, messages },
      newState,
    }
  }

  if (!check.success) {
    messages.push(msg(`You lunge at ${enemy.name}. It glances off nothing.`))
    const newState: CombatState = { ...state, turn: state.turn + 1 }
    return {
      result: { hit: false, damage: 0, critical: false, fumble: false, messages },
      newState,
    }
  }

  // Hit — roll damage
  let damage = rollDamage(playerDamageRange)
  if (check.critical) {
    damage = Math.ceil(damage * 1.5)
  }

  const newEnemyHp = Math.max(0, state.enemyHp - damage)
  const enemyDefeated = newEnemyHp === 0

  if (check.critical) {
    messages.push(
      msg(`Critical hit. ${enemy.name} staggers. [${damage} damage]`),
    )
  } else {
    const hitLines = [
      `You swing hard. It connects with a wet crack. [${damage} damage]`,
      `Your blow lands square. ${enemy.name} reels. [${damage} damage]`,
      `You drive the strike home. [${damage} damage]`,
    ]
    const line = hitLines[damage % hitLines.length]!
    messages.push(msg(line))
  }

  let loot: string[] | undefined
  if (enemyDefeated) {
    messages.push(msg(`${enemy.name} collapses. Silence.`))
    loot = rollLoot(enemy)
    if (loot.length > 0) {
      messages.push(msg(`You search the remains and find something.`, 'narrative'))
    }
  }

  const newState: CombatState = {
    ...state,
    enemyHp: newEnemyHp,
    active: !enemyDefeated,
    turn: state.turn + 1,
  }

  return {
    result: {
      hit: true,
      damage,
      critical: check.critical,
      fumble: false,
      messages,
      enemyDefeated,
      loot,
    },
    newState,
  }
}

// ------------------------------------------------------------
// Enemy attacks player
// ------------------------------------------------------------

/**
 * Enemy attacks the player.
 * Enemy rolls 1d10 + enemy.attack; must beat DC.MODERATE (8) to hit.
 * Returns damage dealt, messages, and updated state.
 */
export function enemyAttack(
  player: Player,
  state: CombatState,
): { damage: number; messages: GameMessage[]; newState: CombatState } {
  const { enemy } = state
  const roll = roll1d10()
  const total = roll + enemy.attack

  const messages: GameMessage[] = []

  if (roll === 1 || total < DC.MODERATE) {
    messages.push(msg(`${enemy.name} lunges but misses.`))
    const newState: CombatState = { ...state, turn: state.turn + 1 }
    return { damage: 0, messages, newState }
  }

  let damage = rollDamage(enemy.damage)
  if (roll === 10) {
    damage = Math.ceil(damage * 1.5)
    messages.push(
      msg(`${enemy.name} catches you clean. It hurts. [${damage} damage]`),
    )
  } else {
    const hitLines = [
      `${enemy.name} skitters under your guard and bites. [${damage} damage]`,
      `${enemy.name} slams into you before you can react. [${damage} damage]`,
      `${enemy.name} gets through. [${damage} damage]`,
    ]
    const line = hitLines[damage % hitLines.length]!
    messages.push(msg(line))
  }

  const playerDefeated = player.hp - damage <= 0
  if (playerDefeated) {
    messages.push(msg(`You drop. Everything goes dark.`, 'narrative'))
  }

  const newState: CombatState = {
    ...state,
    active: !playerDefeated,
    turn: state.turn + 1,
  }

  return { damage, messages, newState }
}

// ------------------------------------------------------------
// Flee
// ------------------------------------------------------------

/**
 * Attempt to flee combat. Uses Reflex vs DC.MODERATE (8).
 */
export function flee(player: Player): FleeResult {
  const check = rollCheck(player.reflex, DC.MODERATE)
  const messages: GameMessage[] = []

  if (check.success) {
    messages.push(msg(`You bolt for cover. It doesn't follow.`))
    return { success: true, messages }
  }

  messages.push(msg(`You try to break away — no luck. You're still in it.`))
  return { success: false, messages }
}

// ------------------------------------------------------------
// Loot
// ------------------------------------------------------------

/**
 * Roll against each entry in the enemy's loot table.
 * Returns an array of item IDs that dropped.
 */
export function rollLoot(enemy: Enemy): string[] {
  const dropped: string[] = []
  for (const entry of enemy.loot) {
    if (Math.random() < entry.chance) {
      dropped.push(entry.itemId)
    }
  }
  return dropped
}
