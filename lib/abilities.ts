// ============================================================
// lib/abilities.ts — Class combat abilities (one per class, once per combat)
// ============================================================

import type { GameMessage } from '@/types/game'
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
    markTargetBonus: 4,
    markTargetAttacks: 2,
  }

  engine._setState({ combatState: updatedCombat })
  engine._appendMessages([
    combatMsg('You study the enemy\'s movements. You see the pattern now.'),
    systemMsg('Next 2 attacks get +4 accuracy. Skipping attack this turn.'),
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
