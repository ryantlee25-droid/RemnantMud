// ============================================================
// lib/fear.ts — Grit-based fear checks for high-threat rooms
// Makes the "grit" stat mechanically meaningful.
// ============================================================

import type { Player, Room, GameMessage, InventoryItem } from '@/types/game'
import { rollCheck, DC } from '@/lib/dice'
import { resolveArmorTraits } from '@/lib/traits'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function msg(text: string, type: GameMessage['type'] = 'narrative'): GameMessage {
  return { id: crypto.randomUUID(), text, type }
}

// ------------------------------------------------------------
// Fear check — called when entering a room with enemies of
// difficulty >= 4. Returns messages and whether fear applies.
// ------------------------------------------------------------

export interface FearCheckResult {
  afraid: boolean
  fearRounds: number
  messages: GameMessage[]
}

/**
 * Roll a grit check when entering a high-threat room.
 * DC scales with room difficulty: difficulty 4 = DC 10, difficulty 5 = DC 13.
 * On failure: player is shaken (-1 combat penalty for first round).
 * On success: player steadies themselves (no penalty).
 */
export function fearCheck(player: Player, room: Room, equippedArmor?: InventoryItem): FearCheckResult {
  if (room.difficulty < 4) return { afraid: false, fearRounds: 0, messages: [] }
  if (room.enemies.length === 0) return { afraid: false, fearRounds: 0, messages: [] }

  // DC scales: difficulty 4 = DC.MODERATE + 2 = 10, difficulty 5 = DC.MODERATE + 5 = 13
  const dc = DC.MODERATE + (room.difficulty - 3) * 3 - 1
  const check = rollCheck(player.grit, dc)

  if (check.success) {
    return {
      afraid: false,
      fearRounds: 0,
      messages: [msg('You steady yourself.')],
    }
  }

  // Fear duration scales with room difficulty:
  // difficulty 4 = 2 rounds, difficulty 5+ = 3 rounds
  let fearRounds = room.difficulty >= 5 ? 3 : 2

  // Warded armor reduces fear duration by 1 (minimum 1)
  if (equippedArmor?.item) {
    const armorResult = resolveArmorTraits(equippedArmor.item, [], fearRounds)
    if (armorResult.adjustedFearDuration < fearRounds) {
      fearRounds = armorResult.adjustedFearDuration
    }
  }

  return {
    afraid: true,
    fearRounds,
    messages: [
      msg('Your hands shake. The presence here is overwhelming.'),
    ],
  }
}

// ------------------------------------------------------------
// Whisperer grit resistance — roll grit to resist the debuff
// Returns true if the player resists the whisperer's effect.
// ------------------------------------------------------------

export function resistWhisperer(player: Player): boolean {
  const check = rollCheck(player.grit, DC.MODERATE + 2) // DC 10
  return check.success
}

// ------------------------------------------------------------
// Rebirth echo retention — higher grit = better stat retention
// Base echo factor is 0.7; grit adds up to +0.1 (grit 8 = 0.8).
// ------------------------------------------------------------

export function echoRetentionFactor(grit: number): number {
  const base = 0.7
  const bonus = Math.max(0, (grit - 5) * 0.033) // grit 5 = +0, grit 8 = +0.1
  return Math.min(base + bonus, 0.85) // cap at 0.85
}
