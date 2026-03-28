// ============================================================
// lib/actions/examine.ts — handleExamineExtra
// Handles "look <keyword>" — examines room extras by keyword.
// ============================================================

import type { EngineCore } from '@/lib/actions/types'
import type { Player, SkillType } from '@/types/game'
import { weightedRoll } from '@/lib/spawn'
import { getClassSkillBonus } from '@/lib/skillBonus'
import { handleLook } from '@/lib/actions/movement'

// ------------------------------------------------------------
// Local message helpers
// ------------------------------------------------------------

function msg(text: string) {
  return { id: crypto.randomUUID(), text, type: 'narrative' as const }
}

function systemMsg(text: string) {
  return { id: crypto.randomUUID(), text, type: 'system' as const }
}

function errorMsg(text: string) {
  return { id: crypto.randomUUID(), text, type: 'error' as const }
}

// ------------------------------------------------------------
// Map skill to player stat + class bonus
// ------------------------------------------------------------

function getStatForSkill(skill: string, player: Player | null): number | null {
  if (!player) return null
  const map: Record<string, number> = {
    // Vigor — raw physicality
    survival: player.vigor,
    brawling: player.vigor,
    climbing: player.vigor,
    vigor: player.vigor,
    // Grit — endurance, willpower, steady hands under pressure
    endurance: player.grit,
    resilience: player.grit,
    composure: player.grit,
    field_medicine: player.grit,
    // Reflex — speed, dexterity, quick reactions
    bladework: player.reflex,
    marksmanship: player.reflex,
    mechanics: player.reflex,
    perception: player.reflex,
    // Wits — knowledge, analysis, awareness
    lore: player.wits,
    electronics: player.wits,
    tracking: player.wits,
    blood_sense: player.wits,
    // Presence — social force, authority, persuasion
    negotiation: player.presence,
    intimidation: player.presence,
    mesmerize: player.presence,
    // Shadow — stealth, subtlety, operating unseen
    stealth: player.shadow,
    lockpicking: player.shadow,
    daystalking: player.shadow,
    scavenging: player.shadow,
  }
  const base = map[skill] ?? null
  if (base === null) return null
  return base + getClassSkillBonus(player.characterClass, skill as SkillType)
}

// ------------------------------------------------------------
// handleExamineExtra
// ------------------------------------------------------------

export async function handleExamineExtra(engine: EngineCore, keyword?: string): Promise<void> {
  const { currentRoom } = engine.getState()
  if (!currentRoom) return

  if (!keyword) {
    // No keyword — just do a regular look
    engine._appendMessages([msg(currentRoom.description)])
    return
  }

  const extras = currentRoom.extras ?? []
  const kw = keyword.toLowerCase().trim()

  // Find matching extra
  const match = extras.find(ex =>
    ex.keywords.some(k => k.toLowerCase().includes(kw) || kw.includes(k.toLowerCase()))
  )

  if (!match) {
    // No room extra matched — fall through to general look which checks
    // enemies, items, inventory, and NPCs by name
    await handleLook(engine, keyword)
    return
  }

  // Check if this extra sets charon_choice and the player already chose
  const { player } = engine.getState()
  if (match.questFlagOnSuccess) {
    const flags = Array.isArray(match.questFlagOnSuccess) ? match.questFlagOnSuccess : [match.questFlagOnSuccess]
    const setsCharonChoice = flags.some(f => f.flag === 'charon_choice')
    if (setsCharonChoice && player?.questFlags?.charon_choice) {
      engine._appendMessages([msg('The decision has been made. There is no going back.')])
      return
    }
  }

  // Check cycle gate
  if (match.cycleGate && (player?.cycle ?? 1) < match.cycleGate) {
    engine._appendMessages([msg(`You notice something about the ${keyword}, but can't make sense of it yet.`)])
    return
  }

  // Get description (pool or single)
  let description: string
  if (match.descriptionPool && match.descriptionPool.length > 0) {
    const available = match.descriptionPool.filter(
      e => !e.cycleGate || (player?.cycle ?? 1) >= e.cycleGate
    )
    if (available.length === 0) {
      description = match.description ?? `You examine the ${keyword} carefully.`
    } else {
      description = weightedRoll(available.map(e => ({ ...e, weight: e.weight }))).desc
    }
  } else {
    description = match.description ?? `You examine the ${keyword} carefully.`
  }

  engine._appendMessages([msg(description)])

  // Skill check bonus text
  if (match.skillCheck) {
    const { skill, dc, successAppend } = match.skillCheck
    const playerStat = getStatForSkill(skill, player)
    if (playerStat !== null) {
      const roll = Math.floor(Math.random() * 10) + 1 + playerStat
      const skillLabel = skill.replace(/_/g, ' ')
      const capitalizedSkill = skillLabel.charAt(0).toUpperCase() + skillLabel.slice(1)
      if (roll >= dc) {
        engine._appendMessages([systemMsg(`[${capitalizedSkill} check succeeded]`)])
        engine._appendMessages([msg(successAppend)])

        // Set quest flag(s) on successful skill check if configured
        if (match.questFlagOnSuccess) {
          const flags = Array.isArray(match.questFlagOnSuccess) ? match.questFlagOnSuccess : [match.questFlagOnSuccess]
          for (const { flag, value } of flags) {
            await engine.setQuestFlag(flag, value)
          }
        }
        // Grant reputation on successful skill check if configured
        if (match.reputationGrant) {
          await engine.adjustReputation(match.reputationGrant.faction, match.reputationGrant.delta)
        }
      } else {
        // Failure feedback — close miss if within 2 of DC
        const diff = dc - roll
        if (diff <= 2) {
          engine._appendMessages([systemMsg(`[${capitalizedSkill} check failed (close) — you almost understood, but not quite]`)])
        } else {
          engine._appendMessages([systemMsg(`[${capitalizedSkill} check failed — you'd need more expertise to understand this]`)])
        }
      }
    }
  }

  // Set quest flag(s) on examine if no skill check required
  if (!match.skillCheck && match.questFlagOnSuccess) {
    const flags = Array.isArray(match.questFlagOnSuccess) ? match.questFlagOnSuccess : [match.questFlagOnSuccess]
    for (const { flag, value } of flags) {
      await engine.setQuestFlag(flag, value)
    }
  }
}
