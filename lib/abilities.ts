// ============================================================
// lib/abilities.ts — Class combat abilities (one per class, once per combat)
// ============================================================

import type { GameMessage, CharacterClass, Player, CombatState } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'
import { rollCheck, rollDamage, statModifier } from '@/lib/dice'
import { getClassSkillBonus } from '@/lib/skillBonus'
import { rt } from '@/lib/richText'
import { enemyHpIndicator } from '@/lib/combat'

// ------------------------------------------------------------
// Local message helpers
// ------------------------------------------------------------

function combatMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'combat' }
}

function systemMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'system' }
}

function errorMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'error' }
}

// ------------------------------------------------------------
// Analyze helper (shared by Reclaimer ability and analyze verb)
// ------------------------------------------------------------

export function buildAnalyzeMessages(engine: EngineCore): GameMessage[] {
  const { combatState } = engine.getState()
  if (!combatState?.active) return []

  const enemy = combatState.enemy
  const messages: GameMessage[] = []

  // HP description
  const ratio = combatState.enemyHp / enemy.maxHp
  let hpDesc: string
  if (ratio >= 1.0) hpDesc = 'Uninjured'
  else if (ratio > 0.75) hpDesc = 'Lightly wounded'
  else if (ratio > 0.50) hpDesc = 'Wounded'
  else if (ratio > 0.25) hpDesc = 'Badly wounded'
  else hpDesc = 'Near death'

  messages.push(combatMsg(`[ANALYSIS: ${rt.enemy(enemy.name)}]`))
  messages.push(combatMsg(`  Status: ${hpDesc}`))

  // Weaknesses and resistances
  const profile = enemy.resistanceProfile
  if (profile) {
    const weakKeys = Object.keys(profile.weaknesses) as Array<keyof typeof profile.weaknesses>
    if (weakKeys.length > 0) {
      const weakDescs = weakKeys.map(k => profile.weaknesses[k]!.description)
      messages.push(combatMsg(`  Weaknesses: ${weakDescs.join(', ')}`))
    } else {
      messages.push(combatMsg(`  Weaknesses: None detected`))
    }

    const resKeys = Object.keys(profile.resistances) as Array<keyof typeof profile.resistances>
    if (resKeys.length > 0) {
      const resDescs = resKeys.map(k => profile.resistances[k]!.description)
      messages.push(combatMsg(`  Resistances: ${resDescs.join(', ')}`))
    } else {
      messages.push(combatMsg(`  Resistances: None detected`))
    }

    if (profile.conditionImmunities.length > 0) {
      messages.push(combatMsg(`  Immunities: ${profile.conditionImmunities.join(', ')}`))
    }
  } else {
    messages.push(combatMsg(`  Weaknesses: Unknown`))
    messages.push(combatMsg(`  Resistances: Unknown`))
  }

  // Active conditions on enemy
  if (combatState.enemyConditions.length > 0) {
    const condNames = combatState.enemyConditions.map(c => c.id)
    messages.push(combatMsg(`  Conditions: ${condNames.join(', ')}`))
  } else {
    messages.push(combatMsg(`  Conditions: None`))
  }

  return messages
}

// ------------------------------------------------------------
// Main ability handler
// ------------------------------------------------------------

export async function handleAbility(engine: EngineCore): Promise<void> {
  const { player, combatState } = engine.getState()
  if (!player) return

  if (!combatState?.active) {
    engine._appendMessages([errorMsg('You are not in combat.')])
    return
  }

  if (combatState.abilityUsed) {
    engine._appendMessages([errorMsg('You have already used your ability this combat.')])
    return
  }

  switch (player.characterClass) {
    case 'enforcer':
      handleOverwhelm(engine)
      break
    case 'scout':
      handleMarkTarget(engine)
      break
    case 'wraith':
      handleShadowstrike(engine)
      break
    case 'shepherd':
      await handleMend(engine)
      break
    case 'reclaimer':
      handleAnalyzeAbility(engine)
      break
    case 'warden':
      handleBrace(engine)
      break
    case 'broker':
      handleIntimidate(engine)
      break
  }
}

// ------------------------------------------------------------
// Enforcer — Overwhelm
// ------------------------------------------------------------

function handleOverwhelm(engine: EngineCore): void {
  const { player, combatState } = engine.getState()
  if (!player || !combatState) return

  // Cost: 3 HP
  const newHp = Math.max(0, player.hp - 3)
  const updatedPlayer = { ...player, hp: newHp }

  const updatedCombat = {
    ...combatState,
    abilityUsed: true,
    overwhelmActive: true,
  }

  engine._setState({ player: updatedPlayer, combatState: updatedCombat })
  engine._appendMessages([
    combatMsg('You abandon technique. Pure force.'),
    systemMsg(`-3 HP. Next attack auto-hits and ignores all armor/defense.`),
  ])

  if (newHp <= 0) {
    engine._handlePlayerDeath()
  }
}

// ------------------------------------------------------------
// Scout — Mark Target
// ------------------------------------------------------------

function handleMarkTarget(engine: EngineCore): void {
  const { combatState } = engine.getState()
  if (!combatState) return

  const updatedCombat = {
    ...combatState,
    abilityUsed: true,
    markTargetBonus: 3,
    markTargetAttacks: 2,
  }

  engine._setState({ combatState: updatedCombat })
  engine._appendMessages([
    combatMsg('You study the enemy\'s movements. You see the pattern now.'),
    systemMsg('Next 2 attacks get +3 accuracy. Skipping attack this turn.'),
  ])

  // Skip attack — enemy still attacks (handled by caller flowing into enemy turn)
}

// ------------------------------------------------------------
// Wraith — Shadowstrike
// ------------------------------------------------------------

function handleShadowstrike(engine: EngineCore): void {
  const { combatState } = engine.getState()
  if (!combatState) return

  const updatedCombat = {
    ...combatState,
    abilityUsed: true,
    shadowstrikeActive: true,
    cantFlee: true,
  }

  engine._setState({ combatState: updatedCombat })
  engine._appendMessages([
    combatMsg('You strike from nothing.'),
    systemMsg('Next attack is a guaranteed crit. You can no longer flee this combat.'),
  ])
}

// ------------------------------------------------------------
// Shepherd — Mend
// ------------------------------------------------------------

async function handleMend(engine: EngineCore): Promise<void> {
  const { player, combatState } = engine.getState()
  if (!player || !combatState) return

  // Heal 1d6 + presence modifier
  let healing = rollDamage([1, 6]) + Math.max(0, statModifier(player.presence))

  // Field_medicine DC 8 for double healing
  const fmBonus = getClassSkillBonus(player.characterClass, 'field_medicine')
  const fmCheck = rollCheck(player.wits + fmBonus, 8)
  if (fmCheck.success) {
    healing = healing * 2
  }

  const newHp = Math.min(player.maxHp, player.hp + healing)
  const updatedPlayer = { ...player, hp: newHp }

  const updatedCombat = {
    ...combatState,
    abilityUsed: true,
  }

  engine._setState({ player: updatedPlayer, combatState: updatedCombat })

  const messages: GameMessage[] = [combatMsg('Your hands remember the work.')]
  if (fmCheck.success) {
    messages.push(systemMsg(`Field medicine success. Healed ${healing} HP (doubled). HP: ${newHp}/${player.maxHp}`))
  } else {
    messages.push(systemMsg(`Healed ${healing} HP. HP: ${newHp}/${player.maxHp}`))
  }
  messages.push(systemMsg('Skipping attack this turn.'))

  engine._appendMessages(messages)
}

// ------------------------------------------------------------
// Reclaimer — Analyze (ability version, free action)
// ------------------------------------------------------------

function handleAnalyzeAbility(engine: EngineCore): void {
  const { combatState } = engine.getState()
  if (!combatState) return

  const updatedCombat = {
    ...combatState,
    abilityUsed: true,
  }

  engine._setState({ combatState: updatedCombat })

  const analyzeMessages = buildAnalyzeMessages(engine)
  engine._appendMessages(analyzeMessages)
  // Reclaimer analyze is free — does not skip attack
}

// ------------------------------------------------------------
// Warden — Brace
// ------------------------------------------------------------

function handleBrace(engine: EngineCore): void {
  const { combatState } = engine.getState()
  if (!combatState) return

  const updatedCombat = {
    ...combatState,
    abilityUsed: true,
    braceActive: true,
    // Do NOT set defendingThisTurn — brace is its own 60% reduction, not stacked with defend's 50%
  }

  engine._setState({ combatState: updatedCombat })
  engine._appendMessages([
    combatMsg('You plant your feet. Nothing moves you.'),
    systemMsg('Incoming damage reduced 60% this turn. Your damage is halved.'),
  ])
}

// ------------------------------------------------------------
// Broker — Intimidate
// ------------------------------------------------------------

function handleIntimidate(engine: EngineCore): void {
  const { player, combatState } = engine.getState()
  if (!player || !combatState) return

  const enemy = combatState.enemy
  const dc = enemy.attack + 5

  // Intimidation check: presence + class bonus vs DC
  const intimBonus = getClassSkillBonus(player.characterClass, 'intimidation')
  const check = rollCheck(player.presence + intimBonus, dc)

  if (check.success) {
    const updatedCombat = {
      ...combatState,
      abilityUsed: true,
      enemyIntimidated: true,
    }
    engine._setState({ combatState: updatedCombat })
    engine._appendMessages([
      combatMsg('The enemy hesitates.'),
      systemMsg('Enemy will skip its next turn. Skipping your attack.'),
    ])
  } else {
    const updatedCombat = {
      ...combatState,
      abilityUsed: true,
      enemyEnraged: true,
    }
    engine._setState({ combatState: updatedCombat })
    engine._appendMessages([
      combatMsg('The enemy snarls. You\'ve made it angry.'),
      systemMsg('Intimidation failed. Enemy gets +2 damage. Skipping your attack.'),
    ])
  }
}

// ============================================================
// Class Ability Definitions & Pure Resolver
// (Moved from lib/abilities/class.ts — used by tests and UI)
// ============================================================

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
    description: 'Heal 1d6 + presence modifier. Wits + field medicine vs DC 8 doubles healing.',
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
    description: 'Reduce next incoming damage by 60%. Uses your attack.',
    cost: 'action',
  },
  broker: {
    id: 'intimidate',
    name: 'Intimidate',
    description: 'Force enemy to skip next turn. Presence + intimidation vs enemy attack + 5.',
    cost: 'action',
  },
}

/**
 * Pure ability resolver — takes player + combat state, returns result.
 * Used by tests; the engine version (handleAbility above) wraps engine state.
 */
export function resolveAbility(
  player: Player,
  state: CombatState,
): AbilityResult {
  const messages: GameMessage[] = []

  if (!state.active) {
    return {
      success: false,
      messages: [{ id: crypto.randomUUID(), text: 'You are not in combat.', type: 'error' }],
      newState: state,
      playerHpDelta: 0,
    }
  }

  if (state.abilityUsed) {
    return {
      success: false,
      messages: [{ id: crypto.randomUUID(), text: 'You have already used your ability this combat.', type: 'error' }],
      newState: state,
      playerHpDelta: 0,
    }
  }

  const ability = CLASS_ABILITIES[player.characterClass]
  let newState: CombatState = { ...state, abilityUsed: true }
  let playerHpDelta = 0

  switch (player.characterClass) {
    case 'enforcer': {
      const hpCost = ability.hpCost ?? 3
      playerHpDelta = -hpCost
      newState = { ...newState, overwhelmActive: true }
      messages.push({ id: crypto.randomUUID(), text: `You channel everything into the next strike. [-${hpCost} HP]`, type: 'combat' })
      break
    }

    case 'scout': {
      newState = { ...newState, markTargetBonus: 3, markTargetAttacks: 2 }
      messages.push({ id: crypto.randomUUID(), text: `You mark the target's weak points. +3 to hit for 2 attacks.`, type: 'combat' })
      break
    }

    case 'wraith': {
      newState = { ...newState, shadowstrikeActive: true, cantFlee: true }
      messages.push({ id: crypto.randomUUID(), text: `You coil into the shadows. Next strike will be devastating.`, type: 'combat' })
      break
    }

    case 'shepherd': {
      const presMod = statModifier(player.presence)
      let healing = rollDamage([1, 6]) + Math.max(0, presMod)
      const fmBonus = getClassSkillBonus(player.characterClass, 'field_medicine')
      const check = rollCheck(player.wits + fmBonus, 8)
      if (check.success) {
        healing = healing * 2
        playerHpDelta = healing
        messages.push({ id: crypto.randomUUID(), text: `Field medicine success. You mend your wounds. [+${healing} HP]`, type: 'combat' })
      } else {
        playerHpDelta = healing
        messages.push({ id: crypto.randomUUID(), text: `You mend your wounds. [+${healing} HP]`, type: 'combat' })
      }
      break
    }

    case 'reclaimer': {
      const enemy = state.enemy
      const weaknesses = enemy.resistanceProfile?.weaknesses
        ? Object.keys(enemy.resistanceProfile.weaknesses).join(', ')
        : 'none'
      const resistances = enemy.resistanceProfile?.resistances
        ? Object.keys(enemy.resistanceProfile.resistances).join(', ')
        : 'none'
      const immunities = enemy.resistanceProfile?.conditionImmunities?.join(', ') ?? 'none'
      messages.push({ id: crypto.randomUUID(), text: `Analysis: ${enemy.name} — HP ${state.enemyHp}/${enemy.maxHp}, ATK ${enemy.attack}, DEF ${enemy.defense}`, type: 'system' })
      messages.push({ id: crypto.randomUUID(), text: `Weaknesses: ${weaknesses}. Resistances: ${resistances}. Immunities: ${immunities}.`, type: 'system' })
      break
    }

    case 'warden': {
      newState = { ...newState, braceActive: true }
      messages.push({ id: crypto.randomUUID(), text: `You brace for impact. Incoming damage reduced 60%.`, type: 'combat' })
      break
    }

    case 'broker': {
      const enemy = state.enemy
      const dc = enemy.attack + 5
      const intimBonus = getClassSkillBonus(player.characterClass, 'intimidation')
      const check = rollCheck(player.presence + intimBonus, dc)
      if (check.success) {
        newState = { ...newState, enemyIntimidated: true }
        messages.push({ id: crypto.randomUUID(), text: `Your words cut deeper than steel. The enemy hesitates.`, type: 'combat' })
      } else {
        newState = { ...newState, enemyEnraged: true }
        messages.push({ id: crypto.randomUUID(), text: `It doesn't work. The enemy is enraged. +2 damage next attack.`, type: 'combat' })
      }
      break
    }
  }

  return { success: true, messages, newState, playerHpDelta }
}
