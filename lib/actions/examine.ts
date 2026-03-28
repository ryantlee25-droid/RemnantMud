// ============================================================
// lib/actions/examine.ts — handleExamineExtra
// Handles "look <keyword>" — examines room extras by keyword.
// ============================================================

import type { EngineCore } from '@/lib/actions/types'
import type { Player } from '@/types/game'
import { weightedRoll } from '@/lib/spawn'
import { getStatForSkill } from '@/lib/skillBonus'
import { handleLook } from '@/lib/actions/movement'
import { msg, systemMsg, errorMsg } from '@/lib/messages'

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

  // Check quest gate
  if (match.questGate) {
    const flags = player?.questFlags ?? {}
    if (!flags[match.questGate]) {
      engine._appendMessages([msg(`You examine it closely, but you don't have enough context to understand what you're seeing.`)])
      return
    }
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
