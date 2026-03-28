// ============================================================
// Class Abilities — one unique combat ability per class
// ============================================================

import type { Player, CombatState, GameMessage, CharacterClass } from '@/types/game'
import { statModifier, rollCheck, rollDamage } from '@/lib/dice'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface ClassAbility {
  id: string
  name: string
  description: string
  cost: 'free' | 'action' | 'hp'
  hpCost?: number
}

export interface AbilityResult {
  success: boolean
  messages: GameMessage[]
  newState: CombatState
  playerHpDelta: number
}

function msg(text: string, type: GameMessage['type'] = 'combat'): GameMessage {
  return { id: crypto.randomUUID(), text, type }
}

// ------------------------------------------------------------
// Ability Definitions
// ------------------------------------------------------------

export const CLASS_ABILITIES: Record<CharacterClass, ClassAbility> = {
  enforcer: {
    id: 'overwhelm',
    name: 'Overwhelm',
    description: 'Ignore all armor on next attack. Costs 3 HP.',
    cost: 'hp',
    hpCost: 3,
  },
  scout: {
    id: 'mark_target',
    name: 'Mark Target',
    description: '+3 to hit for next 2 attacks.',
    cost: 'free',
  },
  wraith: {
    id: 'shadowstrike',
    name: 'Shadowstrike',
    description: 'Guaranteed critical hit on next attack. Cannot flee after.',
    cost: 'action',
  },
  shepherd: {
    id: 'mend',
    name: 'Mend',
    description: 'Heal 1d6 + presence modifier. DC 8 field medicine check.',
    cost: 'action',
  },
  reclaimer: {
    id: 'analyze',
    name: 'Analyze',
    description: 'Reveal full enemy stats and weaknesses.',
    cost: 'free',
  },
  warden: {
    id: 'brace',
    name: 'Brace',
    description: 'Reduce next incoming damage by 50%. Uses your attack.',
    cost: 'action',
  },
  broker: {
    id: 'intimidate',
    name: 'Intimidate',
    description: 'Force enemy to skip next turn. Presence + Wits/2 vs DC 10.',
    cost: 'action',
  },
}

// ------------------------------------------------------------
// Ability Executor
// ------------------------------------------------------------

export function handleAbility(
  player: Player,
  state: CombatState,
): AbilityResult {
  const messages: GameMessage[] = []

  // Must be in active combat
  if (!state.active) {
    return {
      success: false,
      messages: [msg('You are not in combat.', 'error')],
      newState: state,
      playerHpDelta: 0,
    }
  }

  // Can only use ability once per combat
  if (state.abilityUsed) {
    return {
      success: false,
      messages: [msg('You have already used your ability this combat.', 'error')],
      newState: state,
      playerHpDelta: 0,
    }
  }

  const ability = CLASS_ABILITIES[player.characterClass]
  let newState: CombatState = { ...state, abilityUsed: true }
  let playerHpDelta = 0

  switch (player.characterClass) {
    case 'enforcer': {
      // Overwhelm: ignore armor on next attack, costs 3 HP
      const hpCost = ability.hpCost ?? 3
      playerHpDelta = -hpCost
      newState = { ...newState, overwhelmActive: true }
      messages.push(msg(`You channel everything into the next strike. [-${hpCost} HP]`))
      break
    }

    case 'scout': {
      // Mark Target: +3 accuracy for next 2 attacks
      newState = { ...newState, markTargetBonus: 3, markTargetAttacks: 2 }
      messages.push(msg(`You mark the target's weak points. +3 to hit for 2 attacks.`))
      break
    }

    case 'wraith': {
      // Shadowstrike: guaranteed crit next attack, can't flee after
      newState = { ...newState, shadowstrikeActive: true, cantFlee: true }
      messages.push(msg(`You coil into the shadows. Next strike will be devastating.`))
      break
    }

    case 'shepherd': {
      // Mend: heal 1d6 + presence modifier, DC 8 field_medicine check
      const presMod = statModifier(player.presence)
      const check = rollCheck(player.grit, 8) // field_medicine derives from grit
      if (check.success) {
        const heal = rollDamage([1, 6]) + Math.max(0, presMod)
        playerHpDelta = heal
        messages.push(msg(`You mend your wounds. [+${heal} HP]`))
      } else {
        messages.push(msg(`Your hands shake. The mending fails.`))
      }
      break
    }

    case 'reclaimer': {
      // Analyze: reveal enemy info (free action)
      const enemy = state.enemy
      const weaknesses = enemy.resistanceProfile?.weaknesses
        ? Object.keys(enemy.resistanceProfile.weaknesses).join(', ')
        : 'none'
      const resistances = enemy.resistanceProfile?.resistances
        ? Object.keys(enemy.resistanceProfile.resistances).join(', ')
        : 'none'
      const immunities = enemy.resistanceProfile?.conditionImmunities?.join(', ') ?? 'none'
      messages.push(msg(`Analysis: ${enemy.name} — HP ${state.enemyHp}/${enemy.maxHp}, ATK ${enemy.attack}, DEF ${enemy.defense}`, 'system'))
      messages.push(msg(`Weaknesses: ${weaknesses}. Resistances: ${resistances}. Immunities: ${immunities}.`, 'system'))
      break
    }

    case 'warden': {
      // Brace: reduce incoming damage by 50% this turn
      newState = { ...newState, braceActive: true, defendingThisTurn: true }
      messages.push(msg(`You brace for impact. Incoming damage reduced by half.`))
      break
    }

    case 'broker': {
      // Intimidate: presence + wits/2 vs DC 10
      const intimidateStat = player.presence + Math.floor(player.wits / 2)
      const check = rollCheck(intimidateStat, 10)
      if (check.success) {
        newState = { ...newState, enemyIntimidated: true }
        messages.push(msg(`Your words cut deeper than steel. The enemy hesitates.`))
      } else {
        newState = { ...newState, enemyEnraged: true }
        messages.push(msg(`It doesn't work. The enemy is enraged. +2 damage next attack.`))
      }
      break
    }
  }

  return { success: true, messages, newState, playerHpDelta }
}
