import type {
  Player,
  Enemy,
  CombatState,
  CombatResult,
  FleeResult,
  GameMessage,
  HollowType,
} from '@/types/game'
import { roll1d10, rollCheck, rollDamage, DC } from '@/lib/dice'
import { getClassSkillBonus } from '@/lib/skillBonus'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function msg(text: string, type: GameMessage['type'] = 'combat'): GameMessage {
  return { id: crypto.randomUUID(), text, type }
}

/** Pick a random flavor text entry from the enemy, or return undefined. */
function pickFlavorText(enemy: Enemy): string | undefined {
  if (!enemy.flavorText || enemy.flavorText.length === 0) return undefined
  return enemy.flavorText[Math.floor(Math.random() * enemy.flavorText.length)]
}

/** Return a rough health description for the enemy. */
export function enemyHpIndicator(currentHp: number, maxHp: number): string {
  const ratio = currentHp / maxHp
  if (ratio > 0.75) return 'barely scratched'
  if (ratio > 0.50) return 'wounded'
  if (ratio > 0.25) return 'badly hurt'
  return 'near death'
}

/**
 * Apply hive_mother damage bonus: +1 damage for all other Hollow
 * while a hive_mother is present in combat (main enemy or additional).
 * The hive_mother herself does not receive the bonus.
 */
export function hiveDamageBonus(state: CombatState): number {
  const mainType = state.enemy.hollowType as string | undefined
  // Hive mother herself doesn't get the bonus
  if (mainType === 'hive_mother') return 0
  // Check if hive_mother is among additional enemies or is the main enemy
  const hasHiveMother = state.additionalEnemies?.some(e => (e.hollowType as string) === 'hive_mother')
  if (hasHiveMother || mainType === 'hive_mother') return 1
  return 0
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
    const flavor = pickFlavorText(enemy)
    if (flavor) {
      messages.push(msg(`${flavor} You strike back. [${damage} damage]`))
    } else {
      const hitLines = [
        `You swing hard. It connects with a wet crack. [${damage} damage]`,
        `Your blow lands square. ${enemy.name} reels. [${damage} damage]`,
        `You drive the strike home. [${damage} damage]`,
      ]
      const line = hitLines[damage % hitLines.length]!
      messages.push(msg(line))
    }
  }

  let loot: string[] | undefined
  if (enemyDefeated) {
    messages.push(msg(`${enemy.name} collapses. Silence.`))
    loot = rollLoot(enemy)
    // Loot message is handled by the combat action handler with resolved item names
  } else {
    // Show rough HP indicator instead of exact numbers
    messages.push(msg(`The ${enemy.name} looks ${enemyHpIndicator(newEnemyHp, enemy.maxHp)}.`))
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
 * Apply hollow-type special round effects before the enemy attacks.
 * Returns messages and an updated state. Does NOT deal direct damage.
 */
export function applyHollowRoundEffects(
  state: CombatState,
): { messages: GameMessage[]; newState: CombatState } {
  const { enemy } = state
  const messages: GameMessage[] = []
  let newState = { ...state }

  // Whisperer: 20% chance to apply a -2 combat roll debuff this round
  if (enemy.hollowType === 'whisperer') {
    if (Math.random() < 0.20) {
      newState.whispererDebuff = 2
      messages.push(msg(`Something it says takes the edge off your focus.`))
    } else {
      newState.whispererDebuff = 0
    }
  }

  // Screamer: 30% chance to summon a shuffler
  if (enemy.hollowType === 'screamer') {
    if (Math.random() < 0.30) {
      const shuffler: Enemy = {
        id: 'shuffler',
        name: 'Shuffler',
        description: 'Drawn by the shriek.',
        hollowType: 'shuffler',
        hp: 10,
        maxHp: 10,
        attack: 1,
        defense: 8,
        damage: [1, 3],
        xp: 10,
        loot: [{ itemId: 'scrap_metal', chance: 0.10 }],
      }
      const existing = newState.additionalEnemies ?? []
      newState.additionalEnemies = [...existing, shuffler]
      messages.push(msg(`The screamer's shriek splits the air — you hear movement in the dark.`))
    }
  }

  return { messages, newState }
}

/**
 * Enemy attacks the player.
 * Enemy rolls 1d10 + enemy.attack; must beat DC.MODERATE (8) to hit.
 * Now includes hollow-type special behaviors:
 * - brute: first attack is a charge (double damage), then cooldown for 1 turn
 * - hive_mother: all other Hollow deal +1 damage while she lives
 * - whisperer debuff is applied via applyHollowRoundEffects before this call
 * Returns damage dealt, messages, and updated state.
 */
export function enemyAttack(
  player: Player,
  state: CombatState,
): { damage: number; messages: GameMessage[]; newState: CombatState } {
  const { enemy } = state
  const messages: GameMessage[] = []

  // Brute cooldown: skip attack on the turn after a charge
  if (enemy.hollowType === 'brute' && state.bruteCooldownTurn === state.turn) {
    messages.push(msg(`The brute is recovering from its charge. It lumbers in place.`))
    const newState: CombatState = { ...state, turn: state.turn + 1 }
    return { damage: 0, messages, newState }
  }

  const roll = roll1d10()
  const total = roll + enemy.attack

  if (roll === 1 || total < DC.MODERATE) {
    const flavor = pickFlavorText(enemy)
    if (flavor) {
      messages.push(msg(`${flavor} Its attack goes wide.`))
    } else {
      messages.push(msg(`${enemy.name} lunges but misses.`))
    }
    const newState: CombatState = { ...state, turn: state.turn + 1 }
    return { damage: 0, messages, newState }
  }

  let damage = rollDamage(enemy.damage)

  // Brute charge: first attack does double damage
  let isBruteCharge = false
  if (enemy.hollowType === 'brute' && !state.bruteCharged) {
    damage = damage * 2
    isBruteCharge = true
  }

  // Hive mother damage bonus for non-hive_mother enemies
  damage += hiveDamageBonus(state)

  if (roll === 10) {
    damage = Math.ceil(damage * 1.5)
    messages.push(
      msg(`${enemy.name} catches you clean. It hurts. [${damage} damage]`),
    )
  } else if (isBruteCharge) {
    messages.push(
      msg(`The brute charges — there's no finesse in it, just mass and forward velocity. [${damage} damage]`),
    )
  } else {
    const flavor = pickFlavorText(enemy)
    if (flavor) {
      messages.push(msg(`${flavor} [${damage} damage]`))
    } else {
      const hitLines = [
        `${enemy.name} skitters under your guard and bites. [${damage} damage]`,
        `${enemy.name} slams into you before you can react. [${damage} damage]`,
        `${enemy.name} gets through. [${damage} damage]`,
      ]
      const line = hitLines[damage % hitLines.length]!
      messages.push(msg(line))
    }
  }

  const playerDefeated = player.hp - damage <= 0
  if (playerDefeated) {
    messages.push(msg(`You drop. Everything goes dark.`, 'narrative'))
  }

  const newState: CombatState = {
    ...state,
    active: !playerDefeated,
    turn: state.turn + 1,
    // Track brute charge state
    ...(isBruteCharge ? { bruteCharged: true, bruteCooldownTurn: state.turn + 1 } : {}),
  }

  return { damage, messages, newState }
}

// ------------------------------------------------------------
// Flee
// ------------------------------------------------------------

/**
 * Attempt to flee combat.
 * Flee roll = player.reflex + player.shadow + class bonuses (scout/wraith)
 * vs enemy.level-based DC (enemy attack * 3, min DC.MODERATE).
 * On failure: enemy gets a free attack.
 */
export function flee(
  player: Player,
  state: CombatState,
): { result: FleeResult; freeAttack?: { damage: number; messages: GameMessage[]; newState: CombatState } } {
  const { enemy } = state
  const messages: GameMessage[] = []

  // Flee bonus: base reflex + shadow, plus class bonuses for brawling/shadow skills
  const fleeBonus = getClassSkillBonus(player.characterClass, 'stealth')
  const fleeStat = player.reflex + player.shadow + fleeBonus

  // DC scales with enemy threat: attack * 3, floor at MODERATE
  const fleeDc = Math.max(DC.MODERATE, enemy.attack * 3)

  const check = rollCheck(fleeStat, fleeDc)

  if (check.success) {
    messages.push(msg(`You bolt for cover. It doesn't follow.`))
    return { result: { success: true, messages } }
  }

  messages.push(msg(`You try to break away — no luck. You're still in it.`))

  // Enemy gets a free attack on failed flee
  const freeAttack = enemyAttack(player, state)
  return {
    result: { success: false, messages },
    freeAttack,
  }
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
