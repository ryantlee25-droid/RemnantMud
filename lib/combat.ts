import type {
  Player,
  Enemy,
  CombatState,
  CombatResult,
  FleeResult,
  GameMessage,
  HollowType,
  Item,
  CheckResult,
  Room,
  AoEDamage,
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
// Environment Modifiers — NOTE: section owned by Rider G
// ------------------------------------------------------------

export type EnvironmentModifierType = 'combat_high_ground' | 'combat_narrow_passage' | 'combat_collapsing' | 'combat_darkness'

export interface EnvironmentModifier {
  playerAccuracy: number
  playerDamage: number
  playerDefense: number
  enemyAccuracy: number
  enemyDefense: number
  specialEffect?: () => GameMessage[]
}

const MODIFIER_EFFECTS: Record<EnvironmentModifierType, (hasLight: boolean) => EnvironmentModifier> = {
  combat_high_ground: () => ({
    playerAccuracy: 1,
    playerDamage: 1,
    playerDefense: 0,
    enemyAccuracy: 0,
    enemyDefense: 0,
  }),
  combat_narrow_passage: () => ({
    playerAccuracy: 0,
    playerDamage: 0,
    playerDefense: -1,
    enemyAccuracy: 0,
    enemyDefense: -1,
  }),
  combat_collapsing: () => ({
    playerAccuracy: 0,
    playerDamage: 0,
    playerDefense: 0,
    enemyAccuracy: 0,
    enemyDefense: 0,
    specialEffect: () => {
      if (Math.random() < 0.20) {
        const debrisDamage = rollDamage([1, 4])
        return [
          msg(`Debris crashes from the ceiling. Rocks strike everything below. [${debrisDamage} debris damage to both]`, 'combat'),
        ]
      }
      return []
    },
  }),
  combat_darkness: (hasLight: boolean) => ({
    playerAccuracy: hasLight ? 0 : -2,
    playerDamage: 0,
    playerDefense: 0,
    enemyAccuracy: -2,  // enemy always penalized in darkness
    enemyDefense: 0,
  }),
}

const MODIFIER_NARRATION: Record<EnvironmentModifierType, string> = {
  combat_high_ground: 'You have the high ground. The advantage is yours.',
  combat_narrow_passage: 'The passage is tight. Neither of you can move freely.',
  combat_collapsing: 'The ceiling groans. Debris falls with every impact.',
  combat_darkness: "You're fighting blind. Every swing is a guess.",
}

const MODIFIER_NARRATION_DARKNESS_LIT = 'Your chemical light cuts the darkness. The enemy squints against it.'

/**
 * Read room flags and return active environment modifiers for combat.
 */
export function getEnvironmentModifiers(room: Room): EnvironmentModifierType[] {
  const modifiers: EnvironmentModifierType[] = []
  const flags = room.flags
  if (flags.combat_high_ground) modifiers.push('combat_high_ground')
  if (flags.combat_narrow_passage) modifiers.push('combat_narrow_passage')
  if (flags.combat_collapsing) modifiers.push('combat_collapsing')
  if (flags.combat_darkness) modifiers.push('combat_darkness')
  return modifiers
}

/**
 * Build narration messages for active environment modifiers at combat start.
 * @param hasLight Whether the player has a light source (crafted_chemical_light)
 */
export function getEnvironmentNarration(modifiers: EnvironmentModifierType[], hasLight: boolean): GameMessage[] {
  const messages: GameMessage[] = []
  for (const mod of modifiers) {
    if (mod === 'combat_darkness') {
      messages.push(msg(hasLight ? MODIFIER_NARRATION_DARKNESS_LIT : MODIFIER_NARRATION[mod], 'narrative'))
    } else {
      messages.push(msg(MODIFIER_NARRATION[mod], 'narrative'))
    }
  }
  return messages
}

/**
 * Compute combined environment modifier effects for the current room.
 * @param hasLight Whether the player has a light source (crafted_chemical_light)
 */
export function computeEnvironmentEffects(
  modifiers: EnvironmentModifierType[],
  hasLight: boolean,
): { combined: EnvironmentModifier; debrisMessages: GameMessage[]; debrisDamage: number } {
  const combined: EnvironmentModifier = {
    playerAccuracy: 0,
    playerDamage: 0,
    playerDefense: 0,
    enemyAccuracy: 0,
    enemyDefense: 0,
  }
  const debrisMessages: GameMessage[] = []
  let debrisDamage = 0

  for (const modType of modifiers) {
    const effect = MODIFIER_EFFECTS[modType](hasLight)
    combined.playerAccuracy += effect.playerAccuracy
    combined.playerDamage += effect.playerDamage
    combined.playerDefense += effect.playerDefense
    combined.enemyAccuracy += effect.enemyAccuracy
    combined.enemyDefense += effect.enemyDefense

    if (effect.specialEffect) {
      const specialMsgs = effect.specialEffect()
      if (specialMsgs.length > 0) {
        debrisMessages.push(...specialMsgs)
        // Extract damage from the debris message (1d4 applied to both)
        const match = specialMsgs[0]?.text.match(/\[(\d+) debris damage/)
        if (match) {
          debrisDamage = parseInt(match[1], 10)
        }
      }
    }
  }

  return { combined, debrisMessages, debrisDamage }
}

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

/**
 * Compute the post-armor damage value.
 * 15% reduction per defense point, capped at 60% total reduction.
 * Minimum 1 damage is always dealt (no full block).
 * Returns 0 when rawDamage is 0 (no-op for misses).
 */
export function computeArmorReduction(rawDamage: number, defenseValue: number): number {
  if (rawDamage <= 0) return 0
  const reductionPct = Math.min(0.15 * Math.max(0, defenseValue), 0.60)
  const reduced = Math.max(1, Math.ceil(rawDamage * (1 - reductionPct)))
  return reduced
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
  envMod?: EnvironmentModifier,
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
  // Environment accuracy bonus (high ground, darkness penalty, etc.)
  const envAccuracy = envMod?.playerAccuracy ?? 0
  const effectiveVigor = player.vigor - debuffPenalty - fearPenalty - Math.abs(conditionPenalty) + envAccuracy

  // Mark Target (Scout): accuracy bonus
  const markBonus = state.markTargetBonus ?? 0

  // Precise weapon trait: halve enemy defense
  const hasPrecise = weaponTraits.includes('precise')
  const baseDefense = hasPrecise ? Math.ceil(enemy.defense / 2) : enemy.defense

  // Environment defense modifier (narrow passage reduces enemy defense)
  const envEnemyDefense = envMod?.enemyDefense ?? 0

  // Add waiting bonus + mark target bonus to the attack roll
  const waitingBonus = state.waitingBonus ?? 0
  const effectiveDefense = Math.max(1, baseDefense - waitingBonus - markBonus + envEnemyDefense)

  // Overwhelm: skip the roll entirely — auto-hit
  const check = isOverwhelm
    ? { roll: 10, modifier: 0, total: 99, dc: effectiveDefense, success: true, critical: false, fumble: false }
    : rollCheck(effectiveVigor, effectiveDefense)

  // Design choice: Overwhelming guarantees a hit but does NOT roll for crit,
  // even with Keen weapons. The trade-off is: Overwhelming = certainty,
  // Keen = variance. Stacking both would make Keen redundant on every
  // Overwhelm-active turn. If a future design wants Overwhelm-with-crit-roll,
  // flip critical to undefined here so downstream Keen logic re-evaluates.

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

  const weaponName = weapon?.name ?? 'strike'

  if (check.fumble) {
    // Glanced — fumble (natural 1): player overextends
    messages.push(
      msg(`You overextend — your blow glances off ${rt.enemy(enemy.name)}.`),
    )
    const newState: CombatState = { ...state, ...baseStateUpdates, turn: state.turn + 1 }
    return {
      result: { hit: false, damage: 0, critical: false, fumble: true, messages },
      newState,
    }
  }

  if (!check.success) {
    // Miss-reason bucketing based on how badly the roll missed
    const gap = check.dc - check.total
    if (gap <= 1) {
      // Glanced — barely missed (gap of 1): player overextends
      messages.push(msg(`You overextend — your blow glances off ${rt.enemy(enemy.name)}.`))
    } else if (gap <= 2 && check.dc > 0) {
      // Dodged — small gap: enemy twists aside
      messages.push(msg(`${rt.enemy(enemy.name)} twists aside — your ${weaponName} finds nothing but air.`))
    } else {
      // Armored / blocked — large gap: weapon rings off solid defense
      messages.push(msg(`Your ${weaponName} rings off ${rt.enemy(enemy.name)}'s armor. No damage.`))
    }
    const newState: CombatState = { ...state, ...baseStateUpdates, turn: state.turn + 1 }
    return {
      result: { hit: false, damage: 0, critical: false, fumble: false, messages },
      newState,
    }
  }

  // Hit — roll damage (weapon + vigor bonus + environment damage bonus)
  const vigorBonus = Math.max(0, statModifier(player.vigor))  // only positive bonus
  const envDamageBonus = envMod?.playerDamage ?? 0
  let damage = rollDamage(playerDamageRange) + vigorBonus + envDamageBonus
  if (check.critical) {
    damage = Math.ceil(damage * 1.5)
  }

  // Resolve weapon traits
  let traitBonusDamage = 0
  let healPlayer = 0
  let suppressNoise = false
  let updatedEnemyConditions = [...state.enemyConditions]
  // Track which conditions trait resolution wanted to apply (for flavor text)
  let traitConditionsApplied: ConditionId[] = []
  let blessedFiredVsSanguine = false

  if (weapon) {
    const traitResult = resolveWeaponTraits(player, weapon, enemy, check.critical, damage)
    traitBonusDamage = traitResult.bonusDamage
    healPlayer = traitResult.healPlayer
    suppressNoise = traitResult.suppressNoise
    // Detect if blessed fired against a Sanguine enemy
    const enemyHollowType = enemy.hollowType
    const isSanguineEnemy = enemyHollowType === 'elder_sanguine' || enemyHollowType === 'sanguine_feral'
    blessedFiredVsSanguine = weaponTraits.includes('blessed') && isSanguineEnemy && traitResult.bonusDamage > 0

    // Apply conditions from weapon traits to enemy. Only record conditions that
    // actually landed — applyCondition returns applied:false for already-active
    // and immune conditions, and we don't want flavor text firing on those.
    for (const condId of traitResult.conditionsToApply) {
      const immunities = enemy.resistanceProfile?.conditionImmunities
      const condResult = applyCondition(updatedEnemyConditions, condId, weapon.name, immunities)
      updatedEnemyConditions = condResult.conditions
      if (condResult.applied) traitConditionsApplied.push(condId)
    }

    // Show trait messages
    for (const traitMsg of traitResult.messages) {
      messages.push(msg(`[${rt.keyword('TRAIT')}] ${traitMsg}`))
    }
  }

  // Add trait bonus damage
  damage += traitBonusDamage

  // Elemental damage bonus: weapon traits vs enemy weaknesses/resistances
  let elementalBonus = 0
  if (weaponTraits.length > 0) {
    // Map weapon traits to elemental damage types
    const elementMap: Partial<Record<string, string>> = {
      blessed: 'holy',
      scorching: 'fire',
      disrupting: 'electric',
    }

    for (const trait of weaponTraits) {
      const element = elementMap[trait]
      if (!element) continue

      // Check weakness (keyed by WeaponTraitId, not string)
      const weakness = enemy.resistanceProfile?.weaknesses?.[trait as keyof typeof enemy.resistanceProfile.weaknesses]
      // Check resistance
      const resistance = enemy.resistanceProfile?.resistances?.[trait as keyof typeof enemy.resistanceProfile.resistances]

      // Only apply elemental bonus if the weakness has bonusDamage > 0
      // (bonusDamage: 0 means the trait already applies a condition, not flat damage)
      if (weakness && weakness.bonusDamage > 0) {
        elementalBonus += weakness.bonusDamage
        messages.push(msg(`[WEAKNESS] The enemy is vulnerable to ${element}! [+${weakness.bonusDamage} damage]`))
      }

      // Resistance: apply a -2 penalty (flat reduction)
      if (resistance && resistance.reduction > 0 && resistance.reduction < 1.0) {
        const penalty = 2
        elementalBonus -= penalty
        messages.push(msg(`[RESIST] The enemy resists ${element}. [-${penalty} damage]`))
      }
    }
  }
  if (elementalBonus !== 0) {
    damage += elementalBonus
  }

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

  // Weapon-trait strike flavor text (appended after the damage line, only when the trait fired)
  if (blessedFiredVsSanguine) {
    messages.push(msg(`The blessing flares — ${rt.enemy(enemy.name)} recoils from sanctified steel.`))
  }
  if (traitConditionsApplied.includes('bleeding')) {
    messages.push(msg(`${rt.enemy(enemy.name)} bleeds. Red flowers on the ground.`))
  }
  if (traitConditionsApplied.includes('burning')) {
    messages.push(msg(`Heat licks the wound — ${rt.enemy(enemy.name)} shudders as flesh blackens.`))
  }
  if (healPlayer > 0 && weaponTraits.includes('draining')) {
    messages.push(msg(`You feel a thread of warmth pass into you. ${rt.enemy(enemy.name)}'s vigor lessens.`))
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
// Enemy flee check — called BEFORE enemy attacks each round
// ------------------------------------------------------------

/**
 * Check whether the enemy attempts to flee this round.
 * Uses fleeThreshold (default 0.0 = never flee).
 * Flee is attempted at most once per fight (guarded by enemyFleeAttempted flag).
 * Returns updated state and optional messages. If enemyFled=true in newState,
 * the caller should end combat and award full XP.
 */
export function checkEnemyFlee(
  state: CombatState,
): { messages: GameMessage[]; newState: CombatState } {
  const { enemy, enemyHp } = state
  const messages: GameMessage[] = []

  const fleeThreshold = enemy.fleeThreshold ?? 0.0

  // Never flees, or already attempted
  if (fleeThreshold <= 0 || state.enemyFleeAttempted) {
    return { messages, newState: state }
  }

  const hpRatio = enemyHp / enemy.hp
  if (hpRatio >= fleeThreshold) {
    return { messages, newState: state }
  }

  // Mark attempt as used regardless of outcome
  const afterAttempt: CombatState = { ...state, enemyFleeAttempted: true }

  // 50% base chance to escape
  if (Math.random() < 0.5) {
    messages.push(msg(`${enemy.name} breaks off — wounded, retreating!`))
    return {
      messages,
      newState: { ...afterAttempt, active: false, enemyFled: true },
    }
  }

  messages.push(msg(`${enemy.name} hesitates but presses on.`))
  return { messages, newState: afterAttempt }
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
  envMod?: EnvironmentModifier,
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
  // Environment accuracy modifier (darkness penalty, etc.)
  const envEnemyAcc = envMod?.enemyAccuracy ?? 0
  const total = roll + enemy.attack + envEnemyAcc

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

  // Environment player defense modifier (narrow passage reduces player defense = more damage taken)
  // Positive playerDefense = better defense; negative = worse. We don't modify damage here —
  // the defense reduction is handled at the hit-check level via DC adjustments in the action layer.

  // Brute charge: first attack does double damage
  let isBruteCharge = false
  if (enemy.hollowType === 'brute' && !state.bruteCharged) {
    damage = damage * 2
    isBruteCharge = true
  }

  // Hive mother damage bonus for non-hive_mother enemies
  damage += hiveDamageBonus(state)

  // Enemy critChance: per-hit critical strike (default 5% if not set)
  // Applied before armor reduction so crit shows in message but armor still mitigates.
  // Natural 10 roll is already a crit below — critChance only fires on non-natural-10 hits.
  let rawDamage = damage
  let enemyCrit = false
  if (roll !== 10) {
    const critChance = enemy.critChance ?? 0.05
    if (Math.random() < critChance) {
      rawDamage = Math.ceil(rawDamage * 1.5)
      damage = rawDamage
      enemyCrit = true
      messages.push(msg(`${rt.enemy(enemy.name)} strikes a vital spot — critical damage!`))
    }
  }

  if (roll === 10) {
    damage = Math.ceil(damage * 1.5)
    messages.push(
      msg(`${rt.enemy(enemy.name)} catches you clean. It hurts. [${damage} damage]`),
    )
  } else if (enemyCrit) {
    // Critical message was pushed above; emit a damage line now
    messages.push(msg(`[${damage} damage]`))
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
// Called Shots
// ------------------------------------------------------------

/**
 * Player makes a called shot at a specific body part.
 * Uses playerAttack as its base but applies a to-hit penalty and a body-part-specific
 * bonus effect on hit.
 *
 * Body parts:
 * - head:  -3 to hit, +50% damage, 50% chance to stun (enemy -2 attack/defense for 1 turn)
 * - legs:  -2 to hit, enemy defense -2 for the rest of the fight
 * - arms:  -2 to hit, enemy damage -1 for the rest of the fight
 * - eyes:  -4 to hit, enemy -3 to all rolls for 2 turns (tracked via whispererDebuff)
 * - torso: +0 penalty — identical to a normal attack
 */
export function playerCalledShot(
  player: Player,
  enemy: Enemy,
  bodyPart: string,
  state: CombatState,
  weaponTraits: string[],
): { result: CheckResult & { damage: number }; newState: Partial<CombatState>; messages: GameMessage[] } {
  const messages: GameMessage[] = []
  const part = bodyPart.toLowerCase()

  // Determine penalty and bonus descriptor
  let toHitPenalty = 0
  switch (part) {
    case 'head':  toHitPenalty = 3; break
    case 'legs':  toHitPenalty = 2; break
    case 'arms':  toHitPenalty = 2; break
    case 'eyes':  toHitPenalty = 4; break
    case 'torso': toHitPenalty = 0; break
    default:      toHitPenalty = 2; break  // unknown body part: treat like legs
  }

  // Base checks copied from playerAttack (no defending/overwhelm — called shots
  // are always intentional targeted strikes)
  const debuffPenalty = (state.whispererDebuff ?? 0) > 0 ? state.whispererDebuff! : 0
  const fearPenalty = state.fearPenalty ?? 0
  const conditionPenalty = totalRollPenalty(state.playerConditions)

  // Apply the called shot to-hit penalty on top of existing penalties
  const effectiveVigor = player.vigor - debuffPenalty - fearPenalty - Math.abs(conditionPenalty) - toHitPenalty

  const hasPrecise = weaponTraits.includes('precise')
  const baseDefense = hasPrecise ? Math.ceil(enemy.defense / 2) : enemy.defense
  const waitingBonus = state.waitingBonus ?? 0
  const markBonus = state.markTargetBonus ?? 0
  const effectiveDefense = Math.max(1, baseDefense - waitingBonus - markBonus)

  const check = rollCheck(effectiveVigor, effectiveDefense)

  // Keen: crit on 9 or 10
  const hasKeen = weaponTraits.includes('keen')
  if (hasKeen && check.roll >= 9 && !check.critical) {
    (check as { critical: boolean }).critical = true;
    (check as { success: boolean }).success = true
  }

  // Base state updates (consume wait/mark bonuses regardless of outcome)
  const baseStateUpdates: Partial<CombatState> = {
    whispererDebuff: debuffPenalty > 0 ? Math.max(0, debuffPenalty - 1) : state.whispererDebuff,
    waitingBonus: 0,
    markTargetBonus: (state.markTargetAttacks ?? 0) > 0 ? state.markTargetBonus : 0,
    markTargetAttacks: (state.markTargetAttacks ?? 0) > 0 ? (state.markTargetAttacks! - 1) : 0,
  }

  if (check.fumble) {
    messages.push(msg(`Your aimed shot goes wide — badly. You nearly lose your footing.`))
    const failResult: CheckResult & { damage: number } = { ...check, damage: 0 }
    return { result: failResult, newState: { ...baseStateUpdates, turn: state.turn + 1 }, messages }
  }

  if (!check.success) {
    messages.push(msg(`Your aimed shot at ${part === 'torso' ? 'center mass' : `the ${part}`} goes wide.`))
    const failResult: CheckResult & { damage: number } = { ...check, damage: 0 }
    return { result: failResult, newState: { ...baseStateUpdates, turn: state.turn + 1 }, messages }
  }

  // Hit — base damage
  const vigorBonus = Math.max(0, statModifier(player.vigor))
  let damage = rollDamage([1, 3]) + vigorBonus

  if (check.critical) {
    damage = Math.ceil(damage * 1.5)
    messages.push(msg(`[CRITICAL] Aimed shot lands perfectly — direct hit!`))
  }

  // Body-part bonus effects
  const newStateExtras: Partial<CombatState> = {}

  switch (part) {
    case 'head': {
      // +50% damage, 50% chance to stun (reduce enemy attack for 1 turn)
      damage = Math.ceil(damage * 1.5)
      messages.push(msg(`[CALLED SHOT: HEAD] You aim for the skull. [+50% damage]`))
      if (Math.random() < 0.5) {
        // Use whispererDebuff as a proxy stun penalty on enemy
        newStateExtras.whispererDebuff = (state.whispererDebuff ?? 0) + 2
        messages.push(msg(`[STUN] The blow staggers the enemy — they lose focus.`))
      }
      break
    }

    case 'legs': {
      // Reduce enemy defense by 2 for the rest of the fight
      // Store as a negative bonus on mark/wait — we use a dedicated field if available,
      // otherwise we write directly to enemy defense via newState
      messages.push(msg(`[CALLED SHOT: LEGS] You slash at the legs. Enemy defense reduced by 2 for this fight.`))
      newStateExtras.enemy = {
        ...state.enemy,
        defense: Math.max(1, state.enemy.defense - 2),
      }
      break
    }

    case 'arms': {
      // Reduce enemy damage by 1 for the rest of the fight
      const [dMin, dMax] = state.enemy.damage
      messages.push(msg(`[CALLED SHOT: ARMS] You target the striking arm. Enemy damage reduced by 1.`))
      newStateExtras.enemy = {
        ...state.enemy,
        damage: [Math.max(1, dMin - 1), Math.max(1, dMax - 1)] as [number, number],
      }
      break
    }

    case 'eyes': {
      // Blind: enemy -3 to hit for 2 turns (represented as whispererDebuff extending across turns)
      messages.push(msg(`[CALLED SHOT: EYES] A precise strike across the eyes — the enemy is blinded.`))
      // Whisperer debuff is a per-round penalty; we layer it as 3 and it decrements each turn
      // We extend it for 2 rounds by adding 6 (3 per round × 2 rounds) then letting it decrement
      newStateExtras.whispererDebuff = (state.whispererDebuff ?? 0) + 6
      messages.push(msg(`[BLIND] The enemy is blinded — -3 to hit for 2 turns.`))
      break
    }

    case 'torso':
    default: {
      // No special effect — just the base attack
      messages.push(msg(`[CALLED SHOT: TORSO] You aim for center mass.`))
      break
    }
  }

  // Floor damage at 1
  damage = Math.max(1, damage)

  // Apply damage to enemy
  const newEnemyHp = Math.max(0, state.enemyHp - damage)
  const enemyDefeated = newEnemyHp <= 0

  messages.push(msg(`Called shot connects. [${damage} damage]`))

  if (enemyDefeated) {
    messages.push(msg(`${rt.enemy(enemy.name)} collapses. Silence.`))
  } else {
    messages.push(msg(`The ${rt.enemy(enemy.name)} looks ${enemyHpIndicator(newEnemyHp, enemy.maxHp)}.`))
  }

  const newState: Partial<CombatState> = {
    ...baseStateUpdates,
    ...newStateExtras,
    enemyHp: newEnemyHp,
    active: !enemyDefeated,
    turn: state.turn + 1,
  }

  const hitResult: CheckResult & { damage: number } = { ...check, damage }
  return { result: hitResult, newState, messages }
}

// ------------------------------------------------------------
// Loot
// ------------------------------------------------------------

/**
 * Roll against each entry in the enemy's loot table.
 * Returns an array of item IDs that dropped (one entry per unit).
 *
 * Respects LootEntry.count: [min, max] — defaults to [1, 1] when absent.
 * The chance roll still gates the whole entry; count only controls quantity.
 */
export function rollLoot(enemy: Enemy): string[] {
  const dropped: string[] = []
  for (const entry of enemy.loot) {
    if (Math.random() < entry.chance) {
      // Validate that the item actually exists before adding to drops
      if (getItem(entry.itemId)) {
        const [min, max] = entry.count ?? [1, 1]
        const qty = min + Math.floor(Math.random() * (max - min + 1))
        for (let i = 0; i < qty; i++) {
          dropped.push(entry.itemId)
        }
      }
    }
  }
  return dropped
}

// ------------------------------------------------------------
// Log compression utility
// ------------------------------------------------------------

/**
 * Collapse consecutive identical 'combat' messages into "(×N)" format.
 * Only compresses messages with the same text AND the same type.
 * Non-combat messages (system, narrative, etc.) are never compressed.
 *
 * Example input:
 *   "Shuffler hits you for 2."   (combat)
 *   "Shuffler hits you for 2."   (combat)
 *   "Shuffler hits you for 2."   (combat)
 * Example output:
 *   "Shuffler hits you for 2. (×3)"  (combat)
 */
export function compressLog(messages: GameMessage[]): GameMessage[] {
  if (messages.length === 0) return messages

  const result: GameMessage[] = []
  let i = 0

  while (i < messages.length) {
    const current = messages[i]!
    // Only compress combat-type messages
    if (current.type !== 'combat') {
      result.push(current)
      i++
      continue
    }

    // Count consecutive identical combat messages
    let count = 1
    while (
      i + count < messages.length &&
      messages[i + count]!.type === 'combat' &&
      messages[i + count]!.text === current.text
    ) {
      count++
    }

    if (count > 1) {
      result.push({ ...current, text: `${current.text} (×${count})` })
    } else {
      result.push(current)
    }

    i += count
  }

  return result
}

// ------------------------------------------------------------
// AoE Resolution (H5, Convoy 2)
// ------------------------------------------------------------

export interface AoEResolveResult {
  damageToPlayer: number
  damageToEnemiesByIndex: Record<number, number>  // index in additionalEnemies array
  conditionsApplied: ConditionId[]
  messages: GameMessage[]
}

/**
 * Resolve area-of-effect damage from a source AoEDamage shape.
 * Pure function — returns a damage delta + messages; the CALLER mutates state.
 *
 * radius: 'adjacent' — damages player + first additionalEnemy (if any). Half damage per target.
 * radius: 'room'     — damages player + ALL additionalEnemies. Full damage per target.
 *
 * If condition is present, it is applied to all targets that took damage.
 * rng defaults to Math.random.
 */
export function resolveAoE(
  source: AoEDamage,
  player: Player,
  combatState: CombatState,
  rng: () => number = Math.random,
): AoEResolveResult {
  const messages: GameMessage[] = []
  const conditionsApplied: ConditionId[] = []
  const damageToEnemiesByIndex: Record<number, number> = {}

  const additionalEnemies = combatState.additionalEnemies ?? []

  // Roll base damage using provided rng
  const [min, max] = source.damage
  const baseRoll = Math.floor(rng() * (max - min + 1)) + min

  // Determine targets and per-target damage
  let playerDamage: number
  let enemyTargetIndices: number[]

  if (source.radius === 'adjacent') {
    // Half damage, rolled twice (one roll per target)
    playerDamage = Math.max(1, Math.ceil(baseRoll / 2))
    // Only first additionalEnemy
    enemyTargetIndices = additionalEnemies.length > 0 ? [0] : []
  } else {
    // 'room': full damage per target
    playerDamage = baseRoll
    enemyTargetIndices = additionalEnemies.map((_, i) => i)
  }

  // Damage player
  if (playerDamage > 0) {
    messages.push(msg(`The explosion catches you in the blast. [${playerDamage} AoE damage]`, 'combat'))
    if (source.condition) {
      conditionsApplied.push(source.condition)
      messages.push(msg(`[AoE] You are afflicted with ${source.condition}.`, 'combat'))
    }
  }

  // Damage additional enemies
  for (const idx of enemyTargetIndices) {
    const targetEnemy = additionalEnemies[idx]!
    // For adjacent, re-roll for the second target (half damage, separate roll)
    let enemyDamage: number
    if (source.radius === 'adjacent') {
      const enemyRoll = Math.floor(rng() * (max - min + 1)) + min
      enemyDamage = Math.max(1, Math.ceil(enemyRoll / 2))
    } else {
      // room: full damage per target — roll fresh per target
      const enemyRoll = Math.floor(rng() * (max - min + 1)) + min
      enemyDamage = enemyRoll
    }
    damageToEnemiesByIndex[idx] = enemyDamage
    messages.push(msg(`${targetEnemy.name} is caught in the blast. [${enemyDamage} AoE damage]`, 'combat'))
    if (source.condition) {
      if (!conditionsApplied.includes(source.condition)) {
        conditionsApplied.push(source.condition)
      }
      messages.push(msg(`[AoE] ${targetEnemy.name} is afflicted with ${source.condition}.`, 'combat'))
    }
  }

  return {
    damageToPlayer: playerDamage,
    damageToEnemiesByIndex,
    conditionsApplied,
    messages,
  }
}
