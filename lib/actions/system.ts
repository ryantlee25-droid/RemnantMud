// ============================================================
// lib/actions/system.ts — handleStats, handleInventory, handleHelp
// ============================================================

import type { GameMessage, Stat } from '@/types/game'
import type { EngineCore } from './types'
import { statModifier } from '@/lib/dice'
import { rt } from '@/lib/richText'
import { WEAPON_TRAITS, ARMOR_TRAITS } from '@/types/traits'

const VALID_STATS: Set<string> = new Set(['vigor', 'grit', 'reflex', 'wits', 'presence', 'shadow'])
const STAT_BOOST_MAX = 9  // stat increase can push one stat to 9

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

    // Show damage/defense and traits for weapons/armor
    let details = ''
    if (ii.item.type === 'weapon' && ii.item.damage) {
      const traitNames = (ii.item.weaponTraits ?? []).map(t => rt.trait(WEAPON_TRAITS[t].name))
      const traitStr = traitNames.length > 0 ? ` [${traitNames.join(', ')}]` : ''
      details = ` (${ii.item.damage} dmg)${traitStr}`
    } else if (ii.item.type === 'armor' && ii.item.defense) {
      const traitNames = (ii.item.armorTraits ?? []).map(t => rt.trait(ARMOR_TRAITS[t].name))
      const traitStr = traitNames.length > 0 ? ` [${traitNames.join(', ')}]` : ''
      details = ` (${ii.item.defense} def)${traitStr}`
    }

    return `${rt.item(ii.item.name)}${details}${qty}${equipped}`
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
    '  defend / block                — skip attack, reduce incoming damage',
    '  wait                          — skip attack, gain +3 accuracy next turn',
    '  ability / special             — use class combat ability (once per fight)',
    '  analyze / scan                — study the enemy (Reclaimer: free; others: Wits check)',
    '  flee                          — attempt to flee combat',
    '  talk [person]                 — speak with an NPC',
    '  search                        — search the room',
    '  rest / sleep                  — rest in a safe area to recover HP',
    '  camp                          — build a campfire to rest (needs fire supplies)',
    '  drink / fill                  — drink from a water source',
    '  use [item]                    — use a consumable item',
    '  trade [person]                — see an NPC\'s wares',
    '  buy [item]                    — buy from a trader',
    '  sell [item]                   — sell to a trader (half price)',
    '  inventory / i                 — show inventory',
    '  stash [item]                  — stash an item for safekeeping across deaths',
    '  unstash [item]                — retrieve from stash',
    '  map                           — show discovered fast travel waypoints',
    '  travel [destination]          — fast travel to a discovered waypoint',
    '  boost [stat]                  — increase a stat when leveling up (at levels 3, 6, 9)',
    '  stats                         — show character stats',
    '  help / ?                      — show this message',
  ]

  engine._appendMessages(lines.map((l) => systemMsg(l)))
}

export async function handleBoost(engine: EngineCore, noun: string | undefined): Promise<void> {
  const state = engine.getState()
  const { player } = state

  if (!player) return

  if (!state.pendingStatIncrease) {
    engine._appendMessages([systemMsg('You do not have a stat increase available.')])
    return
  }

  if (!noun) {
    engine._appendMessages([
      systemMsg("Choose a stat to boost: type 'boost [stat]'."),
      systemMsg('Options: vigor, grit, reflex, wits, presence, shadow'),
    ])
    return
  }

  const statName = noun.toLowerCase().trim()

  if (!VALID_STATS.has(statName)) {
    engine._appendMessages([
      systemMsg(`'${noun}' is not a valid stat.`),
      systemMsg('Options: vigor, grit, reflex, wits, presence, shadow'),
    ])
    return
  }

  const stat = statName as Stat
  const currentValue = player[stat]

  if (currentValue >= STAT_BOOST_MAX) {
    engine._appendMessages([systemMsg(`Your ${stat} is already at ${currentValue} and cannot be increased further.`)])
    return
  }

  const newValue = currentValue + 1
  const updatedPlayer = { ...player, [stat]: newValue }

  // If boosting vigor, also increase maxHp by 2 (HP formula depends on vigor)
  if (stat === 'vigor') {
    updatedPlayer.maxHp = player.maxHp + 2
    updatedPlayer.hp = Math.min(player.hp + 2, updatedPlayer.maxHp)
  }

  engine._setState({ player: updatedPlayer, pendingStatIncrease: false })
  engine._appendMessages([
    systemMsg(`+1 ${stat}! Your ${stat} is now ${newValue}.`),
  ])

  if (stat === 'vigor') {
    engine._appendMessages([systemMsg(`Max HP increased to ${updatedPlayer.maxHp}.`)])
  }

  await engine._savePlayer()
}
