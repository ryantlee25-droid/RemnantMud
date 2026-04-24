// ============================================================
// lib/actions/system.ts — handleStats, handleInventory, handleHelp,
//                         handleEquipment, handleHint, handleBoost
// ============================================================

import type { GameMessage, Stat, CharacterClass, InventoryItem } from '@/types/game'
import { CLASS_DEFINITIONS } from '@/types/game'
import type { EngineCore } from './types'
import { statModifier } from '@/lib/dice'
import { xpForNextLevel } from '@/lib/gameEngine'
import { rt } from '@/lib/richText'
import { WEAPON_TRAITS, ARMOR_TRAITS } from '@/types/traits'
import type { WeaponTraitId, ArmorTraitId } from '@/types/traits'
import { systemMsg, msg } from '@/lib/messages'
import { getQuestEntries } from '@/data/questDescriptions'

const VALID_STATS: Set<string> = new Set(['vigor', 'grit', 'reflex', 'wits', 'presence', 'shadow'])
const STAT_BOOST_MAX = 9  // stat increase can push one stat to 9

const BAR = '\u2550'.repeat(39) // ═══════════════════════════════════════

// ------------------------------------------------------------
// Constants extracted from tab components
// ------------------------------------------------------------

/** Class ability definitions for display. */
const CLASS_ABILITY: Record<CharacterClass, { name: string; description: string; cost: string }> = {
  enforcer:  { name: 'Overwhelm',    description: 'Ignore all armor on next attack.', cost: 'Costs 3 HP' },
  scout:     { name: 'Mark Target',  description: '+3 to hit for next 2 attacks.', cost: 'Free action' },
  wraith:    { name: 'Shadowstrike', description: 'Guaranteed critical hit if undetected.', cost: 'Cannot flee after' },
  shepherd:  { name: 'Mend',         description: 'Heal 1d6 + presence modifier.', cost: 'DC 8 field medicine' },
  reclaimer: { name: 'Analyze',      description: 'Reveal full enemy stats and weaknesses.', cost: 'Free action' },
  warden:    { name: 'Brace',        description: 'Reduce next incoming damage by 50%.', cost: 'Uses your attack' },
  broker:    { name: 'Intimidate',   description: 'Force enemy to skip next turn on success.', cost: 'Presence + Wits check' },
}

// Skill-to-stat mapping (matches the game engine's derivation)
const SKILL_STAT_MAP: Record<string, Stat> = {
  survival: 'vigor',
  brawling: 'vigor',
  climbing: 'vigor',
  endurance: 'grit',
  resilience: 'grit',
  composure: 'grit',
  field_medicine: 'grit',
  bladework: 'reflex',
  marksmanship: 'reflex',
  mechanics: 'reflex',
  perception: 'reflex',
  lore: 'wits',
  electronics: 'wits',
  tracking: 'wits',
  blood_sense: 'wits',
  negotiation: 'presence',
  intimidation: 'presence',
  mesmerize: 'presence',
  stealth: 'shadow',
  lockpicking: 'shadow',
  daystalking: 'shadow',
  scavenging: 'shadow',
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function statMod(n: number): string {
  if (n > 0) return `+${n}`
  return String(n)
}

/** Build an ASCII HP bar: # for filled, . for empty. */
function hpBar(current: number, max: number, width: number = 12): string {
  const ratio = max > 0 ? current / max : 0
  const filled = Math.round(ratio * width)
  return '#'.repeat(filled) + '.'.repeat(width - filled)
}

/** HP color tag based on percentage. */
function hpTag(current: number, max: number, text: string): string {
  const ratio = max > 0 ? current / max : 0
  if (ratio > 0.5) return `<exit>${text}</exit>`       // green
  if (ratio > 0.25) return `<currency>${text}</currency>` // yellow
  return `<enemy>${text}</enemy>`                       // red
}

/** Derive equipped weapon from inventory. */
function equippedWeapon(inventory: InventoryItem[]): { name: string; damage: number; traits: WeaponTraitId[] } | null {
  const item = inventory.find((ii) => ii.equipped && ii.item.type === 'weapon')
  if (!item) return null
  return { name: item.item.name, damage: item.item.damage ?? 0, traits: item.item.weaponTraits ?? [] }
}

/** Derive equipped armor from inventory. */
function equippedArmor(inventory: InventoryItem[]): { name: string; defense: number; traits: ArmorTraitId[] } | null {
  const item = inventory.find((ii) => ii.equipped && ii.item.type === 'armor')
  if (!item) return null
  return { name: item.item.name, defense: item.item.defense ?? 0, traits: item.item.armorTraits ?? [] }
}

// ------------------------------------------------------------
// Handlers
// ------------------------------------------------------------

export async function handleStats(engine: EngineCore): Promise<void> {
  const { player, inventory } = engine.getState()
  if (!player) return

  const classDef = CLASS_DEFINITIONS[player.characterClass]
  const nextLevelXp = xpForNextLevel(player.level)
  const weapon = equippedWeapon(inventory)
  const armor = equippedArmor(inventory)
  const ability = CLASS_ABILITY[player.characterClass]

  const xpStr = nextLevelXp !== null
    ? `${player.xp}/${nextLevelXp}`
    : `${player.xp} (max)`

  const hpBarStr = hpBar(player.hp, player.maxHp)
  const hpDisplay = hpTag(player.hp, player.maxHp, `[${hpBarStr}]`)

  const weaponLine = weapon
    ? `${rt.item(weapon.name)} (DMG: ${rt.keyword(String(weapon.damage))})`
    : 'None'
  const armorLine = armor
    ? `${rt.item(armor.name)} (DEF: ${rt.keyword(String(armor.defense))})`
    : 'None'

  const lines = [
    BAR,
    `  ${rt.keyword(player.name)} \u2014 ${rt.keyword(classDef.name)} (Cycle ${rt.keyword(String(player.cycle ?? 1))})`,
    BAR,
    `  HP: ${rt.keyword(String(player.hp) + '/' + String(player.maxHp))} ${hpDisplay}`,
    `  Level: ${rt.keyword(String(player.level))}  XP: ${rt.keyword(xpStr)}`,
    '',
    `  VIG: ${rt.keyword(String(player.vigor))} (${statMod(statModifier(player.vigor))})  GRT: ${rt.keyword(String(player.grit))} (${statMod(statModifier(player.grit))})  REF: ${rt.keyword(String(player.reflex))} (${statMod(statModifier(player.reflex))})`,
    `  WIT: ${rt.keyword(String(player.wits))} (${statMod(statModifier(player.wits))})  PRE: ${rt.keyword(String(player.presence))} (${statMod(statModifier(player.presence))})  SHD: ${rt.keyword(String(player.shadow))} (${statMod(statModifier(player.shadow))})`,
    '',
    `  Weapon: ${weaponLine}`,
    `  Armor:  ${armorLine}`,
    '',
    `  Class Ability: ${rt.trait(ability.name)} \u2014 ${ability.description}`,
    BAR,
  ]

  engine._appendMessages(lines.map((l) => systemMsg(l)))

  // Pending stat increase reminder
  if (engine.getState().pendingStatIncrease) {
    engine._appendMessages([systemMsg(`  >> STAT INCREASE AVAILABLE \u2014 type 'boost [stat]' to choose.`)])
  }

  // Revenant marks (cycle scars)
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
  const { inventory, stash } = engine.getState()

  const lines: string[] = [BAR, '  INVENTORY', BAR]

  if (inventory.length === 0) {
    lines.push('  You are carrying nothing.')
  } else {
    for (const ii of inventory) {
      const equipped = ii.equipped ? `${rt.trait('[eq]')} ` : '  '
      const qty = ii.quantity > 1 ? ` x${ii.quantity}` : ''

      let details = ''
      if (ii.item.type === 'weapon' && ii.item.damage) {
        const traitNames = (ii.item.weaponTraits ?? []).map(t => WEAPON_TRAITS[t].name)
        const traitStr = traitNames.length > 0 ? `, Traits: ${traitNames.join(', ')}` : ''
        details = ` (DMG: ${ii.item.damage}${traitStr})`
      } else if (ii.item.type === 'armor' && ii.item.defense) {
        const traitNames = (ii.item.armorTraits ?? []).map(t => ARMOR_TRAITS[t].name)
        const traitStr = traitNames.length > 0 ? `, Traits: ${traitNames.join(', ')}` : ''
        details = ` (DEF: ${ii.item.defense}${traitStr})`
      }

      lines.push(`  ${equipped}${rt.item(ii.item.name)}${details}${qty}`)
    }
  }

  // Stash section
  lines.push(BAR)
  lines.push('  STASH (persists across death)')
  lines.push(BAR)

  if (stash.length === 0) {
    lines.push('  Empty. Use "stash [item]" to store items.')
  } else {
    for (const si of stash) {
      const qty = si.quantity > 1 ? ` x${si.quantity}` : ''
      lines.push(`  ${rt.item(si.item.name)}${qty}`)
    }
  }

  lines.push(BAR)

  engine._appendMessages(lines.map((l) => systemMsg(l)))
}

export async function handleEquipment(engine: EngineCore): Promise<void> {
  const { inventory } = engine.getState()

  const weapon = equippedWeapon(inventory)
  const armor = equippedArmor(inventory)

  if (!weapon && !armor) {
    engine._appendMessages([systemMsg('You have nothing equipped.')])
    return
  }

  const lines: string[] = []

  if (weapon) {
    const traitNames = weapon.traits.map(t => WEAPON_TRAITS[t].name)
    const traitStr = traitNames.length > 0 ? traitNames.join(', ') : 'none'
    lines.push(`  Weapon: ${rt.item(weapon.name)} \u2014 DMG: ${rt.keyword(String(weapon.damage))}, Traits: ${rt.trait(traitStr)}`)
    // Show trait descriptions
    for (const t of weapon.traits) {
      lines.push(`    ${rt.trait(WEAPON_TRAITS[t].name)}: ${WEAPON_TRAITS[t].description}`)
    }
  } else {
    lines.push('  Weapon: None')
  }

  if (armor) {
    const traitNames = armor.traits.map(t => ARMOR_TRAITS[t].name)
    const traitStr = traitNames.length > 0 ? traitNames.join(', ') : 'none'
    lines.push(`  Armor:  ${rt.item(armor.name)} \u2014 DEF: ${rt.keyword(String(armor.defense))}, Traits: ${rt.trait(traitStr)}`)
    // Show trait descriptions
    for (const t of armor.traits) {
      lines.push(`    ${rt.trait(ARMOR_TRAITS[t].name)}: ${ARMOR_TRAITS[t].description}`)
    }
  } else {
    lines.push('  Armor:  None')
  }

  engine._appendMessages(lines.map((l) => systemMsg(l)))
}

// ------------------------------------------------------------
// Help
// ------------------------------------------------------------

const HELP_CATEGORIES: Record<string, string[]> = {
  combat: [
    'Combat commands:',
    '  attack [enemy]     \u2014 start or continue combat',
    '  attack [enemy] [body part] \u2014 called shot at a specific location (head, arm, leg)',
    '  defend / block     \u2014 skip attack, reduce incoming damage',
    '  wait               \u2014 skip attack, gain +3 accuracy next turn',
    '  flee               \u2014 attempt to flee combat',
    '  ability / special  \u2014 use class combat ability (once per fight)',
    '  analyze / scan     \u2014 study the enemy (Reclaimer: free; others: Wits check)',
    '  use [item]         \u2014 use a consumable item in combat',
    '',
    'Dialogue (when in conversation):',
    '  1\u20139              \u2014 choose a numbered response option',
    '  leave              \u2014 exit the conversation',
  ],
  movement: [
    'Movement commands:',
    '  north/south/east/west/up/down \u2014 move between areas',
    '  look [thing]       \u2014 look around or examine something',
    '  look [keyword]     \u2014 examine a noun in the room description for detail',
    '  search             \u2014 search the room for hidden items or exits',
    '  sneak [direction]  \u2014 attempt to move stealthily into an area',
    '  climb [direction]  \u2014 climb to reach an elevated area',
    '  swim [direction]   \u2014 swim through a flooded passage',
    '  unlock [direction] \u2014 unlock a locked exit using a key item',
    '  travel [destination] \u2014 fast travel to a discovered waypoint',
    '  map                \u2014 show discovered fast travel waypoints',
  ],
  items: [
    'Item commands:',
    '  take [item]        \u2014 pick up an item',
    '  drop [item]        \u2014 drop an item',
    '  equip [item]       \u2014 equip a weapon or armor',
    '  unequip [item]     \u2014 remove equipped item',
    '  use [item]         \u2014 use a consumable item',
    '  craft [item]       \u2014 craft an item from components (aliases: build, make, forge, smith)',
    '  stash [item]       \u2014 stash an item for safekeeping across deaths',
    '  unstash [item]     \u2014 retrieve from stash',
    '  give [item] [person] \u2014 give an item to an NPC',
    '  read [item]        \u2014 read a lore document or note',
  ],
  social: [
    'Social commands:',
    '  talk [person]      \u2014 speak with an NPC',
    '  give [item] [person] \u2014 give an item to an NPC',
    '  buy [item]         \u2014 buy from a trader',
    '  sell [item]        \u2014 sell to a trader (half price)',
    '  trade [person]     \u2014 see an NPC\'s wares',
    '  rep                \u2014 show faction standing',
  ],
  sensory: [
    'Sensory commands (examine the world beyond sight):',
    '  smell [thing]      \u2014 smell the air or an object',
    '  listen [thing]     \u2014 listen carefully to surroundings or a sound',
    '  touch [thing]      \u2014 feel the texture or temperature of something',
  ],
  system: [
    'System commands:',
    '  score / stats      \u2014 show character stats',
    '  inventory / i      \u2014 show inventory',
    '  equipment / eq     \u2014 show equipped items',
    '  quests / journal   \u2014 show quest journal and knowledge keys',
    '  help [topic]       \u2014 show help (topics: combat, movement, items, social, sensory, system)',
    '  hint               \u2014 get a hint based on your current quests',
    '  save               \u2014 save the game',
    '  restart / newgame / RESET \u2014 wipe save and start fresh (requires confirmation)',
    '  quit               \u2014 quit the game',
  ],
}

export async function handleHelp(engine: EngineCore, noun?: string): Promise<void> {
  if (noun) {
    const key = noun.toLowerCase().trim()
    const categoryLines = HELP_CATEGORIES[key]
    if (categoryLines) {
      engine._appendMessages(categoryLines.map((l) => systemMsg(l)))
      return
    }
    // Unknown topic -- fall through to full list with a note
    engine._appendMessages([systemMsg(`Unknown help topic '${noun}'. Showing all commands.`)])
  }

  const lines = [
    BAR,
    '  COMMANDS',
    BAR,
    `  Movement: ${rt.keyword('north/n')}, ${rt.keyword('south/s')}, ${rt.keyword('east/e')}, ${rt.keyword('west/w')}, ${rt.keyword('up')}, ${rt.keyword('down')}`,
    `  Move+:    ${rt.keyword('sneak')}, ${rt.keyword('climb')}, ${rt.keyword('swim')}, ${rt.keyword('unlock')}`,
    `  Looking:  ${rt.keyword('look/l')}, ${rt.keyword('look [keyword]')}, ${rt.keyword('smell')}, ${rt.keyword('listen')}, ${rt.keyword('touch')}`,
    `  Combat:   ${rt.keyword('attack [enemy]')}, ${rt.keyword('flee')}, ${rt.keyword('defend')}, ${rt.keyword('ability')}`,
    `  Combat+:  ${rt.keyword('attack [enemy] [body part]')} for called shots, ${rt.keyword('1-9')} during dialogue`,
    `  Items:    ${rt.keyword('take [item]')}, ${rt.keyword('drop')}, ${rt.keyword('use')}, ${rt.keyword('equip')}, ${rt.keyword('unequip')}`,
    `  Items+:   ${rt.keyword('craft/build/make')}, ${rt.keyword('stash')}, ${rt.keyword('unstash')}, ${rt.keyword('give [item] [npc]')}`,
    `  Social:   ${rt.keyword('talk [npc]')}, ${rt.keyword('trade [npc]')}, ${rt.keyword('give [item] [npc]')}`,
    `  Info:     ${rt.keyword('score')}, ${rt.keyword('inventory')}, ${rt.keyword('equipment')}, ${rt.keyword('map')}, ${rt.keyword('journal')}, ${rt.keyword('hint')}, ${rt.keyword('help')}`,
    `  System:   ${rt.keyword('save')}, ${rt.keyword('rest')}, ${rt.keyword('restart/RESET')}`,
    BAR,
    '',
    "Type 'help [topic]' for details: combat, movement, items, social, sensory, system",
  ]

  engine._appendMessages(lines.map((l) => systemMsg(l)))
}

// ------------------------------------------------------------
// handleHint -- suggest next action based on active quests
// ------------------------------------------------------------

const QUEST_CATEGORY_PRIORITY: Record<string, number> = {
  main: 0,
  faction: 1,
  discovery: 2,
  personal: 3,
}

export async function handleHint(engine: EngineCore): Promise<void> {
  const { player } = engine.getState()
  if (!player) return

  const flags = player.questFlags ?? {}
  const { active } = getQuestEntries(flags)

  if (active.length === 0) {
    engine._appendMessages([
      msg('Try exploring. Talk to people. Examine everything.', 'echo'),
    ])
    return
  }

  // Find highest-priority quest with a hint
  const sorted = [...active].sort((a, b) => {
    const pa = QUEST_CATEGORY_PRIORITY[a.category] ?? 99
    const pb = QUEST_CATEGORY_PRIORITY[b.category] ?? 99
    return pa - pb
  })

  const hintEntry = sorted.find(e => e.hint)

  if (hintEntry) {
    engine._appendMessages([
      msg(`Perhaps you should: ${hintEntry.hint}`, 'echo'),
    ])
  } else {
    engine._appendMessages([
      msg("Review your quests with 'quests' for guidance.", 'echo'),
    ])
  }
}

// ------------------------------------------------------------
// handleTutorialHint -- show a one-time tutorial hint by context
// ------------------------------------------------------------

const TUTORIAL_HINTS: Record<string, string> = {
  'first_room': "Tip: Type 'look' to examine your surroundings, or try a direction like 'north' to move.",
  'first_item': "Tip: You see items here. Type 'take [item name]' to pick something up.",
  'first_weapon': "Tip: You picked up a weapon! Type 'equip [weapon name]' to ready it for combat.",
  'first_enemy': "Tip: An enemy is here! Type 'attack' to fight, 'flee' to run, or 'sneak' to try slipping past.",
  'first_npc': "Tip: Someone is here. Type 'talk [name]' to speak with them.",
  'first_death': "Tip: Death is not the end. Your memories echo forward. Choose wisely in the next cycle.",
  'first_combat_start': "You're in combat. Type 'attack' to strike. Type 'flee' if you're outmatched. Each turn: read what changed, then choose.",
  'first_kill': "The body settles. Loot stays where it falls — type 'look' to see what dropped, then 'take <item>'.",
  'low_hp_combat': "You're hurt. 'flee' carries a chance of failure but escape lets you rest. Pressing on with 'attack' is a real choice.",
  'second_encounter': "Each enemy fights differently. Hollow types are listed in the bestiary (DATA tab). 'examine <enemy>' before striking when you can.",
}

export async function handleTutorialHint(engine: EngineCore, context: string): Promise<void> {
  if (typeof localStorage === 'undefined') return

  const storageKey = `remnant_tutorial_${context}`
  if (localStorage.getItem(storageKey)) return

  const hint = TUTORIAL_HINTS[context]
  if (!hint) return

  localStorage.setItem(storageKey, '1')
  engine._appendMessages([systemMsg(hint)])
}

// ------------------------------------------------------------
// Restart — warn the player before wiping their save
// ------------------------------------------------------------

export function handleRestart(): GameMessage[] {
  return [
    systemMsg('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550'),
    systemMsg('  !! PERMANENT ACTION — CANNOT BE UNDONE !!'),
    systemMsg('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550'),
    systemMsg('  This will immediately delete your entire save:'),
    systemMsg('  - All inventory and stashed items'),
    systemMsg('  - All progress, levels, and stats'),
    systemMsg('  - All faction reputation'),
    systemMsg('  - Your full cycle history'),
    systemMsg('  There is no recovery. Your data will be gone.'),
    systemMsg('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550'),
    systemMsg('  Type CONFIRM RESTART to permanently wipe your save.'),
    systemMsg('  Type anything else to cancel.'),
    systemMsg('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550'),
  ]
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
