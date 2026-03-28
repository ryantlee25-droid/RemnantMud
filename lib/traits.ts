// ============================================================
// Trait Resolution — weapon and armor trait effects in combat
// ============================================================

import type { Player, Enemy, Item } from '@/types/game'
import type { ConditionId, WeaponTraitId } from '@/types/traits'
import { WEAPON_TRAITS } from '@/types/traits'
import { statModifier } from '@/lib/dice'

// ------------------------------------------------------------
// Weapon Trait Resolution
// ------------------------------------------------------------

/**
 * Calculate all effects from a weapon's traits when the player hits an enemy.
 * Returns bonus damage, conditions to apply, healing, messages, and noise suppression.
 */
export function resolveWeaponTraits(
  player: Player,
  weapon: Item,
  enemy: Enemy,
  isCritical: boolean,
  hitDamage: number,
): {
  bonusDamage: number
  conditionsToApply: ConditionId[]
  healPlayer: number
  messages: string[]
  suppressNoise: boolean
} {
  let bonusDamage = 0
  const conditionsToApply: ConditionId[] = []
  let healPlayer = 0
  const messages: string[] = []
  let suppressNoise = false

  const traits = weapon.weaponTraits ?? []
  const resistProfile = enemy.resistanceProfile

  for (const traitId of traits) {
    // Check enemy resistance (reduction multiplier)
    const resistance = resistProfile?.resistances?.[traitId]
    const reductionFactor = resistance ? 1 - resistance.reduction : 1

    // Check enemy weakness (bonus damage)
    const weakness = resistProfile?.weaknesses?.[traitId]

    switch (traitId) {
      case 'keen': {
        // +15% crit chance is handled at the roll level (caller checks trait presence).
        // If this hit IS a crit, note it was aided by keen.
        if (isCritical) {
          messages.push('Keen edge finds the gap.')
        }
        break
      }

      case 'heavy': {
        // +2 flat damage (affected by resistance)
        const bonus = Math.round(2 * reductionFactor)
        bonusDamage += bonus
        if (bonus > 0) {
          messages.push(`Heavy blow adds ${bonus} damage.`)
        }
        break
      }

      case 'vicious': {
        // On hit, apply Bleeding
        if (reductionFactor > 0) {
          conditionsToApply.push('bleeding')
          messages.push('The serrated edge tears flesh — bleeding.')
        } else {
          messages.push('The enemy shrugs off the serrated edge.')
        }
        break
      }

      case 'scorching': {
        // 30% chance to apply Burning
        if (Math.random() < 0.30 * reductionFactor) {
          conditionsToApply.push('burning')
          messages.push('Incendiary tip ignites — burning!')
        }
        break
      }

      case 'draining': {
        // Heal 1 HP on hit, 2 on crit. Presence scaling: +1 if presence >= 7
        let heal = isCritical ? 2 : 1
        if (player.presence >= 7) heal += 1
        heal = Math.round(heal * reductionFactor)
        if (heal > 0) {
          healPlayer += heal
          messages.push(`The blade drinks — you recover ${heal} HP.`)
        }
        break
      }

      case 'quick': {
        // +2 initiative handled at combat start. Double-strike at half damage:
        // The caller should check for quick trait and offer/auto-resolve the second strike.
        // Here we note the trait is present.
        messages.push('Quick weapon — double-strike possible.')
        break
      }

      case 'silenced': {
        // Suppresses noise on kill
        suppressNoise = true
        break
      }

      case 'precise': {
        // 50% enemy defense ignored — handled at the roll level.
        // Note the effect for the combat log.
        messages.push('Precise strike bypasses defenses.')
        break
      }

      case 'blessed': {
        // +3 vs Sanguine types, +1 vs Hollow, presence 7+ adds +1
        const enemyType = enemy.hollowType
        let blessedBonus = 0
        if (isSanguine(enemyType)) {
          blessedBonus = 3
        } else if (enemyType) {
          // Any hollow type
          blessedBonus = 1
        }
        if (player.presence >= 7) blessedBonus += 1
        blessedBonus = Math.round(blessedBonus * reductionFactor)
        if (blessedBonus > 0) {
          bonusDamage += blessedBonus
          messages.push(`Blessed steel sears the unclean — +${blessedBonus} damage.`)
        }
        break
      }

      case 'disrupting': {
        // On kill, prevents summons/buffs. Caller checks after enemy defeated.
        // We just flag the message; the actual prevention is handled in combat flow.
        messages.push('Disrupting force lingers on the wound.')
        break
      }
    }

    // Apply weakness bonus damage (additive, after trait-specific logic)
    if (weakness) {
      bonusDamage += weakness.bonusDamage
      messages.push(weakness.description)
    }
  }

  return { bonusDamage, conditionsToApply, healPlayer, messages, suppressNoise }
}

// ------------------------------------------------------------
// Armor Trait Resolution
// ------------------------------------------------------------

/**
 * Calculate armor trait effects on incoming damage and conditions.
 */
export function resolveArmorTraits(
  armor: Item,
  incomingConditions: ConditionId[],
  fearDuration: number,
): {
  flatReduction: number
  conditionsBlocked: ConditionId[]
  adjustedFearDuration: number
} {
  let flatReduction = 0
  const conditionsBlocked: ConditionId[] = []
  let adjustedFearDuration = fearDuration

  const traits = armor.armorTraits ?? []

  for (const traitId of traits) {
    switch (traitId) {
      case 'fortified': {
        // Flat damage reduction based on armor tier
        const tier = armor.tier ?? 1
        flatReduction += tier  // tier 1 = 1 DR, tier 5 = 5 DR
        break
      }

      case 'reactive': {
        // Block incoming bleeding and poisoned conditions
        if (incomingConditions.includes('bleeding')) {
          conditionsBlocked.push('bleeding')
        }
        if (incomingConditions.includes('poisoned')) {
          conditionsBlocked.push('poisoned')
        }
        break
      }

      case 'insulated': {
        // Block incoming burning condition
        if (incomingConditions.includes('burning')) {
          conditionsBlocked.push('burning')
        }
        break
      }

      case 'warded': {
        // Reduce frightened duration by 1 (minimum 1)
        if (adjustedFearDuration > 1) {
          adjustedFearDuration = Math.max(1, adjustedFearDuration - 1)
        }
        break
      }
    }
  }

  return { flatReduction, conditionsBlocked, adjustedFearDuration }
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

/** Check if a hollow type is a sanguine variant */
function isSanguine(hollowType?: string): boolean {
  return hollowType === 'elder_sanguine' || hollowType === 'sanguine_feral'
}
