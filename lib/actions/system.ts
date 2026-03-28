// ============================================================
// lib/actions/system.ts — handleStats, handleInventory, handleHelp
// ============================================================

import type { GameMessage } from '@/types/game'
import type { EngineCore } from './types'
import { statModifier } from '@/lib/dice'

// ------------------------------------------------------------
// Local message helpers
// ------------------------------------------------------------

function systemMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'system' }
}

function statMod(n: number): string {
  if (n > 0) return `+${n}`
  return String(n)
}

// ------------------------------------------------------------
// Handlers
// ------------------------------------------------------------

export async function handleStats(engine: EngineCore): Promise<void> {
  const { player } = engine.getState()
  if (!player) return

  const lines = [
    `Name: ${player.name}  Class: ${player.characterClass}  Cycle: ${player.cycle ?? 1}  Level: ${player.level}  XP: ${player.xp}`,
    `HP: ${player.hp}/${player.maxHp}`,
    `Vigor: ${player.vigor} (${statMod(statModifier(player.vigor))})  ` +
    `Grit: ${player.grit} (${statMod(statModifier(player.grit))})  ` +
    `Reflex: ${player.reflex} (${statMod(statModifier(player.reflex))})`,
    `Wits: ${player.wits} (${statMod(statModifier(player.wits))})  ` +
    `Presence: ${player.presence} (${statMod(statModifier(player.presence))})  ` +
    `Shadow: ${player.shadow} (${statMod(statModifier(player.shadow))})`,
  ]

  engine._appendMessages(lines.map((l) => systemMsg(l)))

  const cycle = player.cycle ?? 1
  if (cycle >= 2) {
    const scarLine = cycle >= 13
      ? 'Revenant marks: The viral lines beneath your skin glow faintly in the dark. You have lost count of how many times you have come back.'
      : cycle >= 8
      ? 'Revenant marks: Luminescent scarring traces old wounds. Named NPCs recognize what you are.'
      : cycle >= 4
      ? 'Revenant marks: Faint lines cross older scars. People who knew you notice something wrong.'
      : 'Revenant marks: Thin lines, barely visible. You came back once. You could again.'
    engine._appendMessages([systemMsg(scarLine)])
  }
}

export async function handleInventory(engine: EngineCore): Promise<void> {
  const { inventory } = engine.getState()

  if (inventory.length === 0) {
    engine._appendMessages([systemMsg('You are carrying nothing.')])
    return
  }

  const lines = inventory.map((ii) => {
    const equipped = ii.equipped ? ' [equipped]' : ''
    const qty = ii.quantity > 1 ? ` x${ii.quantity}` : ''
    return `${ii.item.name}${qty}${equipped}`
  })

  engine._appendMessages([
    systemMsg('Inventory:'),
    ...lines.map((l) => systemMsg(`  ${l}`)),
  ])
}

export async function handleHelp(engine: EngineCore): Promise<void> {
  const lines = [
    'Commands:',
    '  north/south/east/west/up/down — move',
    '  look [thing]                  — look around or examine something',
    '  take [item]                   — pick up an item',
    '  drop [item]                   — drop an item',
    '  equip [item]                  — equip a weapon or armor',
    '  unequip [item]                — remove equipped item',
    '  attack [enemy]                — start or continue combat',
    '  flee                          — attempt to flee combat',
    '  talk [person]                 — speak with an NPC',
    '  search                        — search the room',
    '  rest / sleep                  — rest in a safe area to recover HP',
    '  camp                          — build a campfire to rest (needs fire supplies)',
    '  drink / fill                  — drink from a water source',
    '  use [item]                    — use a consumable item',
    '  inventory / i                 — show inventory',
    '  stash [item]                  — stash an item for safekeeping across deaths',
    '  unstash [item]                — retrieve from stash',
    '  stats                         — show character stats',
    '  help / ?                      — show this message',
  ]

  engine._appendMessages(lines.map((l) => systemMsg(l)))
}
