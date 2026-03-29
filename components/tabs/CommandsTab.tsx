'use client'

// ============================================================
// CommandsTab.tsx — Command reference panel for PipBoy UI
// Shows all available commands grouped by category.
// CONTRACT: C4 (remnant-ux-0329) defines data structures and layout.
// ============================================================

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface CommandEntry {
  syntax: string       // e.g. "north / n"
  description: string  // one line, <=60 chars
}

interface CommandCategory {
  label: string
  commands: CommandEntry[]
}

// ------------------------------------------------------------
// Command data
// ------------------------------------------------------------

const COMMAND_CATEGORIES: CommandCategory[] = [
  {
    label: 'Movement',
    commands: [
      { syntax: 'north / n',            description: 'Move north' },
      { syntax: 'south / s',            description: 'Move south' },
      { syntax: 'east / e',             description: 'Move east' },
      { syntax: 'west / w',             description: 'Move west' },
      { syntax: 'up',                   description: 'Move up' },
      { syntax: 'down',                 description: 'Move down' },
      { syntax: 'go [direction]',       description: 'Move in named direction' },
      { syntax: 'travel / fast travel', description: 'Fast travel to a waypoint' },
    ],
  },
  {
    label: 'Looking',
    commands: [
      { syntax: 'look / l',             description: 'Look at current room' },
      { syntax: 'look [keyword]',       description: 'Look at something nearby' },
      { syntax: 'examine [thing]',      description: 'Examine an object closely' },
      { syntax: 'smell',                description: 'Smell your surroundings' },
      { syntax: 'listen',               description: 'Listen to your surroundings' },
      { syntax: 'touch',                description: 'Touch something nearby' },
    ],
  },
  {
    label: 'Combat',
    commands: [
      { syntax: 'attack [enemy]',            description: 'Attack an enemy' },
      { syntax: 'attack [enemy] [bodypart]', description: 'Target a specific body part' },
      { syntax: 'flee / run',                description: 'Flee from combat' },
      { syntax: 'defend / block',            description: 'Take a defensive stance' },
      { syntax: 'wait',                      description: 'Skip your turn' },
      { syntax: 'ability / special',         description: 'Use your class ability' },
    ],
  },
  {
    label: 'Inventory',
    commands: [
      { syntax: 'take / get [item]',        description: 'Pick up an item' },
      { syntax: 'drop [item]',              description: 'Drop an item' },
      { syntax: 'use / eat [item]',         description: 'Use or consume an item' },
      { syntax: 'equip / wear [item]',      description: 'Equip an item' },
      { syntax: 'unequip / remove [item]',  description: 'Unequip an item' },
      { syntax: 'inventory / i',            description: 'View your inventory' },
      { syntax: 'stash',                    description: 'Store item in persistent stash' },
      { syntax: 'unstash',                  description: 'Retrieve item from stash' },
    ],
  },
  {
    label: 'Social',
    commands: [
      { syntax: 'talk / speak [npc]',       description: 'Talk to an NPC' },
      { syntax: 'trade [npc]',              description: 'Open trade with an NPC' },
      { syntax: 'give [item] to [npc]',     description: 'Give an item to an NPC' },
    ],
  },
  {
    label: 'Survival',
    commands: [
      { syntax: 'rest / sleep',             description: 'Rest to recover HP' },
      { syntax: 'camp',                     description: 'Make camp for the night' },
      { syntax: 'drink / fill',             description: 'Drink water or fill canteen' },
    ],
  },
  {
    label: 'Exploration',
    commands: [
      { syntax: 'sneak / stealth',          description: 'Move quietly, reduce detection' },
      { syntax: 'climb',                    description: 'Climb a surface' },
      { syntax: 'swim',                     description: 'Swim across water' },
      { syntax: 'unlock',                   description: 'Unlock a door or container' },
    ],
  },
  {
    label: 'Information',
    commands: [
      { syntax: 'journal',                  description: 'View your journal' },
      { syntax: 'codex',                    description: 'Browse the codex' },
      { syntax: 'notes',                    description: 'View notes and lore' },
      { syntax: 'map',                      description: 'View discovered waypoints' },
      { syntax: 'read',                     description: 'Read a readable item' },
      { syntax: 'hint / stuck',             description: 'Get a hint for current area' },
    ],
  },
  {
    label: 'System',
    commands: [
      { syntax: 'save',                     description: 'Save your game' },
      { syntax: 'help',                     description: 'Show help text' },
      { syntax: 'boost [stat]',             description: 'Spend a stat increase point' },
    ],
  },
]

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export default function CommandsTab() {
  return (
    <div className="overflow-y-auto flex-1 font-mono text-sm text-amber-400 p-4">
      <div className="columns-2 gap-x-6">
        {COMMAND_CATEGORIES.map((category) => (
          <section key={category.label} className="break-inside-avoid mb-1">
            <h2 className="text-amber-600 uppercase text-xs tracking-widest mb-1 mt-2">
              {category.label}
            </h2>
            <div>
              {category.commands.map((cmd) => (
                <div key={cmd.syntax} className="flex justify-between gap-2 px-2 py-0.5">
                  <span className="text-amber-600 shrink-0">{cmd.syntax}</span>
                  <span className="text-amber-700 text-right">{cmd.description}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
