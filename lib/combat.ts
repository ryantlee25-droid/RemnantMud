import type {
  Player,
  Enemy,
  CombatState,
  CombatResult,
  FleeResult,
  GameMessage,
  HollowType,
  Item,
} from '@/types/game'
import type { ConditionId } from '@/types/traits'
import { roll1d10, rollCheck, rollDamage, statModifier, DC } from '@/lib/dice'
import { getClassSkillBonus } from '@/lib/skillBonus'
import { getItem } from '@/data/items'
import { resistWhisperer } from '@/lib/fear'
import { resolveWeaponTraits, resolveArmorTraits } from '@/lib/traits'
import { applyCondition, totalRollPenalty } from '@/lib/conditions'
import { rt } from '@/lib/richText'

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
    playerConditions: [],
    enemyConditions: [],
    abilityUsed: false,
    defendingThisTurn: false,
    waitingBonus: 0,
  }
}

// ------------------------------------------------------------
// Player attacks enemy
// ------------------------------------------------------------

/**
 * Player attacks the enemy using their Body modifier vs the enemy's defense DC.
 * All weapons are treated as melee / short-range for the MVP.
 * Now integrates weapon traits, conditions, waiting bonus, and defending state.
 * Returns a CombatResult and the updated CombatState.
 */
export function playerAttack(
  player: Player,
  state: CombatState,
  playerDamageRange: [number, number] = [1, 3],
  weapon?: Item,
): { result: CombatResult; newState: CombatState } {
  const { enemy } = state
  const messages: GameMessage[] = []
  const weaponTraits = weapon?.weaponTraits ?? []

  // If defending this turn, deal 0 damage — skip attack entirely
  if (state.defendingThisTurn) {
    messages.push(msg(`You hold your ground, bracing for the next blow.`))
    const newState: CombatState = { ...state, turn: state.turn + 1 }
    return {
      result: { hit: false, damage: 0, critical: false, fumble: false, messages },
      newState,
    }
  }

  // --- Overwhelm (Enforcer): auto-hit, ignore armor/defense ---
  const isOverwhelm = state.overwhelmActive ?? false

  // Apply whisperer debuff + fear penalty + condition roll penalties
  const debuffPenalty = (state.whispererDebuff ?? 0) > 0 ? state.whispererDebuff! : 0
  const fearPenalty = state.fearPenalty ?? 0
  const conditionPenalty = totalRollPenalty(state.playerConditions)
  const effectiveVigor = player.vigor - debuffPenalty - fearPenalty - Math.abs(conditionPenalty)

  // Mark Target (Scout): accuracy bonus
  const markBonus = state.markTargetBonus ?? 0

  // Precise weapon trait: halve enemy defense
  const hasPrecise = weaponTraits.includes('precise')
  const baseDefense = hasPrecise ? Math.ceil(enemy.defense / 2) : enemy.defense

  // Add waiting bonus + mark target bonus to the attack roll
  const waitingBonus = state.waitingBonus ?? 0
  const effectiveDefense = Math.max(1, baseDefense - waitingBonus - markBonus)

  // Overwhelm: skip the roll entirely — auto-hit
  const check = isOverwhelm
    ? { roll: 10, modifier: 0, total: 99, dc: effectiveDefense, success: true, critical: false, fumble: false }
    : rollCheck(effectiveVigor, effectiveDefense)

  // Keen weapon trait: crit on natural 9 or 10 (instead of just 10)
  const hasKeen = weaponTraits.includes('keen')
  if (hasKeen && !isOverwhelm && check.roll >= 9 && !check.critical) {
    (check as { critical: boolean }).critical = true;
    (check as { success: boolean }).success = true
  }

  // Shadowstrike (Wraith): force crit on next attack
  const isShadowstrike = state.shadowstrikeActive ?? false
  if (isShadowstrike && check.success) {
    (check as { critical: boolean }).critical = true
  }

  if (waitingBonus > 0) {
    messages.push(msg(`Patience pays off — +${waitingBonus} to your attack.`))
  }
  if (markBonus > 0) {
    messages.push(msg(`Marked target — +${markBonus} accuracy.`))
  }
  if (isOverwhelm) {
    messages.push(msg(`Pure force. No technique. No defense matters.`))
  }

  // Decrement whisperer debuff even on miss/fumble (it was consumed this round)
  const debuffAfterRound = debuffPenalty > 0 ? Math.max(0, debuffPenalty - 1) : state.whispererDebuff

  // Reset waiting bonus after use; consume ability flags
  const baseStateUpdates: Partial<CombatState> = {
    whispererDebuff: debuffAfterRound,
    waitingBonus: 0,
    // Clear one-shot ability flags after this attack
    overwhelmActive: false,
    shadowstrikeActive: false,
    // Decrement mark target attacks
    markTargetBonus: (state.markTargetAttacks ?? 0) > 0 ? state.markTargetBonus : 0,
    markTargetAttacks: (state.markTargetAttacks ?? 0) > 0 ? (state.markTargetAttacks! - 1) : 0,
  }

  if (check.fumble) {
    messages.push(
      msg(`You swing wildly. ${rt.enemy(enemy.name)} sidesteps and you nearly fall.`),
    )
    const newState: CombatState = { ...state, ...baseStateUpdates, turn: state.turn + 1 }
    return {
      result: { hit: false, damage: 0, critical: false, fumble: true, messages },
      newState,
    }
  }

  if (!check.success) {
    messages.push(msg(`You lunge at ${rt.enemy(enemy.name)}. It glances off nothing.`))
    const newState: CombatState = { ...state, ...baseStateUpdates, turn: state.turn + 1 }
    return {
      result: { hit: false, damage: 0, critical: false, fumble: false, messages },
      newState,
    }
  }

  // Hit — roll damage (weapon + vigor bonus)
  const vigorBonus = Math.max(0, statModifier(player.vigor))  // only positive bonus
  let damage = rollDamage(playerDamageRange) + vigorBonus
  if (check.critical) {
    damage = Math.ceil(damage * 1.5)
  }

  // Resolve weapon traits
  let traitBonusDamage = 0
  let healPlayer = 0
  let suppressNoise = false
  let updatedEnemyConditions = [...state.enemyConditions]

  if (weapon) {
    const traitResult = resolveWeaponTraits(player, weapon, enemy, check.critical, damage)
    traitBonusDamage = traitResult.bonusDamage
    healPlayer = traitResult.healPlayer
    suppressNoise = traitResult.suppressNoise

    // Apply conditions from weapon traits to enemy
    for (const condId of traitResult.conditionsToApply) {
      const immunities = enemy.resistanceProfile?.conditionImmunities
      const condResult = applyCondition(updatedEnemyConditions, condId, weapon.name, immunities)
      updatedEnemyConditions = condResult.conditions
    }

    // Show trait messages
    for (const traitMsg of traitResult.messages) {
      messages.push(msg(`[${rt.keyword('TRAIT')}] ${traitMsg}`))
    }
  }

  // Add trait bonus damage
  damage += traitBonusDamage

  // Weakened condition: halve final damage
  const isWeakened = state.playerConditions.some(c => c.id === 'weakened')
  if (isWeakened) {
    damage = Math.ceil(damage / 2)
    messages.push(msg(`Weakened — your damage is halved.`))
  }

  // Floor damage at 1 on a hit
  damage = Math.max(1, damage)

  let newEnemyHp = Math.max(0, state.enemyHp - damage)
  let enemyDefeated = newEnemyHp <= 0

  if (check.critical) {
    messages.push(
      msg(`Critical hit. ${rt.enemy(enemy.name)} staggers. [${damage} damage]`),
    )
  } else {
    const flavor = pickFlavorText(enemy)
    if (flavor) {
      messages.push(msg(`${flavor} You strike back. [${damage} damage]`))
    } else {
      const hitLines = [
        `You swing hard. It connects with a wet crack. [${damage} damage]`,
        `Your blow lands square. ${rt.enemy(enemy.name)} reels. [${damage} damage]`,
        `You drive the strike home. [${damage} damage]`,
      ]
      const line = hitLines[damage % hitLines.length]!
      messages.push(msg(line))
    }
  }

  // Apply draining heal
  if (healPlayer > 0) {
    messages.push(msg(`[${rt.keyword('DRAINING')}] You recover ${healPlayer} HP.`))
  }

  let loot: string[] | undefined
  if (enemyDefeated) {
    messages.push(msg(`${rt.enemy(enemy.name)} collapses. Silence.`))
    loot = rollLoot(enemy)
    // Loot message is handled by the combat action handler with resolved item names
  } else {
    // Show rough HP indicator instead of exact numbers
    messages.push(msg(`The ${rt.enemy(enemy.name)} looks ${enemyHpIndicator(newEnemyHp, enemy.maxHp)}.`))
  }

  // Quick weapon trait: second strike at half damage
  let quickBonusDamage = 0
  const hasQuick = weaponTraits.includes('quick')
  if (hasQuick && !enemyDefeated) {
    const halfDamage = Math.max(1, Math.ceil(damage / 2))
    const secondHp = Math.max(0, newEnemyHp - halfDamage)
    quickBonusDamage = newEnemyHp - secondHp
    newEnemyHp = secondHp
    enemyDefeated = newEnemyHp <= 0
    messages.push(msg(`[${rt.keyword('QUICK')}] A second strike follows — [${quickBonusDamage} damage]`))
    if (enemyDefeated) {
      messages.push(msg(`${rt.enemy(enemy.name)} collapses. Silence.`))
      loot = rollLoot(enemy)
    } else {
      messages.push(msg(`The ${rt.enemy(enemy.name)} looks ${enemyHpIndicator(newEnemyHp, enemy.maxHp)}.`))
    }
  }

  const totalDamage = damage + quickBonusDamage

  const newState: CombatState = {
    ...state,
    ...baseStateUpdates,
    enemyHp: newEnemyHp,
    enemyConditions: updatedEnemyConditions,
    active: !enemyDefeated,
    turn: state.turn + 1,
    // Store trait flags for the combat action handler
    _suppressNoise: suppressNoise,
    _healPlayer: healPlayer,
  }

  return {
    result: {
      hit: true,
      damage: totalDamage,
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
  player?: Player,
): { messages: GameMessage[]; newState: CombatState } {
  const { enemy } = state
  const messages: GameMessage[] = []
  let newState = { ...state }

  // Decrement fear rounds remaining each round; remove penalty when exhausted
  if (newState.fearPenalty && newState.fearRoundsRemaining !== undefined) {
    if (newState.fearRoundsRemaining <= 1) {
      newState.fearPenalty = 0
      newState.fearRoundsRemaining = 0
    } else {
      newState.fearRoundsRemaining = newState.fearRoundsRemaining - 1
    }
  }

  // Whisperer: 20% chance to apply a -2 combat roll debuff this round
  // Grit check DC 10 can resist the effect
  if (enemy.hollowType === 'whisperer') {
    if (Math.random() < 0.20) {
      if (player && resistWhisperer(player)) {
        newState.whispererDebuff = 0
        messages.push(msg(`It whispers something terrible. You grit your teeth and hold.`))
      } else {
        newState.whispererDebuff = 2
        messages.push(msg(`Something it says takes the edge off your focus.`))
      }
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
        hp: 12,
        maxHp: 12,
        attack: 1,
        defense: 7,
        damage: [2, 4],
        xp: 12,
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
 * Also integrates: defending damage reduction, armor traits (fortified/reactive),
 * and enemy condition application (e.g., brute charge → bleeding).
 * Returns damage dealt, messages, and updated state.
 */
export function enemyAttack(
  player: Player,
  state: CombatState,
  armor?: Item,
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
      messages.push(msg(`${rt.enemy(enemy.name)} lunges but misses.`))
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
      msg(`${rt.enemy(enemy.name)} catches you clean. It hurts. [${damage} damage]`),
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
        `${rt.enemy(enemy.name)} skitters under your guard and bites. [${damage} damage]`,
        `${rt.enemy(enemy.name)} slams into you before you can react. [${damage} damage]`,
        `${rt.enemy(enemy.name)} gets through. [${damage} damage]`,
      ]
      const line = hitLines[damage % hitLines.length]!
      messages.push(msg(line))
    }
  }

  // Defending this turn: reduce incoming damage by 30%
  if (state.defendingThisTurn && damage > 0) {
    const reduced = Math.ceil(damage * 0.70)
    messages.push(msg(`Your defensive stance absorbs some of the blow. [${damage} → ${reduced}]`))
    damage = reduced
  }

  // Armor trait: Fortified flat reduction (applied after % reduction)
  let updatedPlayerConditions = [...state.playerConditions]
  if (armor) {
    // Determine incoming conditions from enemy attack
    const incomingConditions: ConditionId[] = []
    if (isBruteCharge) {
      incomingConditions.push('bleeding')
    }

    const armorResult = resolveArmorTraits(armor, incomingConditions, 0)

    // Fortified: flat damage reduction
    if (armorResult.flatReduction > 0 && damage > 0) {
      const before = damage
      damage = Math.max(1, damage - armorResult.flatReduction)
      if (before !== damage) {
        messages.push(msg(`[${rt.keyword('FORTIFIED')}] Armor absorbs ${before - damage} damage.`))
      }
    }

    // Base armor defense reduction
    const armorBaseDefense = armor.defense ?? 0
    if (armorBaseDefense > 0 && damage > 0) {
      const before = damage
      damage = Math.max(1, damage - armorBaseDefense)
      if (before !== damage) {
        messages.push(msg(`Armor absorbs ${before - damage} damage.`))
      }
    }

    // Reactive / Insulated: block conditions
    const survivingConditions = incomingConditions.filter(c => !armorResult.conditionsBlocked.includes(c))

    for (const blocked of armorResult.conditionsBlocked) {
      messages.push(msg(`[${rt.keyword('REACTIVE')}] Armor blocks ${blocked}.`))
    }

    // Apply surviving conditions to player
    for (const condId of survivingConditions) {
      const condResult = applyCondition(updatedPlayerConditions, condId, enemy.name)
      updatedPlayerConditions = condResult.conditions
      if (condResult.applied) {
        messages.push(msg(`[${rt.keyword('CONDITION')}] ${condId} applied by ${rt.enemy(enemy.name)}.`))
      }
    }
  } else {
    // No armor — apply brute charge bleeding directly
    if (isBruteCharge) {
      const condResult = applyCondition(updatedPlayerConditions, 'bleeding', enemy.name)
      updatedPlayerConditions = condResult.conditions
      if (condResult.applied) {
        messages.push(msg(`[${rt.keyword('CONDITION')}] The charge tears you open — bleeding.`))
      }
    }
  }

  const playerDefeated = player.hp - damage <= 0
  if (playerDefeated) {
    messages.push(msg(`You drop. Everything goes dark.`, 'narrative'))
  }

  const newState: CombatState = {
    ...state,
    playerConditions: updatedPlayerConditions,
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

  // DC scales with enemy threat: attack + half defense, floor at MODERATE
  const fleeDc = Math.max(DC.MODERATE, enemy.attack + Math.ceil(enemy.defense / 2))

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
      // Validate that the item actually exists before adding to drops
      if (getItem(entry.itemId)) {
        dropped.push(entry.itemId)
      }
    }
  }
  return dropped
}
