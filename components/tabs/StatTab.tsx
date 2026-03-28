'use client'

// ============================================================
// StatTab.tsx — Character stats panel for PipBoy UI
// ============================================================

import { useGame } from '@/lib/gameContext'
import { statModifier } from '@/lib/dice'
import { xpForNextLevel } from '@/lib/gameEngine'
import { getItem } from '@/data/items'
import { CLASS_DEFINITIONS } from '@/types/game'
import type { Stat, Player, InventoryItem } from '@/types/game'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function modStr(n: number): string {
  return n >= 0 ? `+${n}` : String(n)
}

/** Build a block-character HP bar: █ for filled, ░ for empty. */
function hpBar(current: number, max: number, width: number = 10): string {
  const filled = Math.round((current / max) * width)
  return '█'.repeat(filled) + '░'.repeat(width - filled)
}

/** Derive the equipped weapon from inventory. */
function equippedWeapon(inventory: InventoryItem[]): { name: string; damage: number } | null {
  const item = inventory.find((ii) => ii.equipped && ii.item.type === 'weapon')
  if (!item) return null
  return { name: item.item.name, damage: item.item.damage ?? 0 }
}

/** Derive the equipped armor from inventory. */
function equippedArmor(inventory: InventoryItem[]): { name: string; defense: number } | null {
  const item = inventory.find((ii) => ii.equipped && ii.item.type === 'armor')
  if (!item) return null
  return { name: item.item.name, defense: item.item.defense ?? 0 }
}

// Skill-to-stat mapping (matches the game engine's derivation)
const SKILL_STAT_MAP: Record<string, Stat> = {
  // Vigor — raw physicality
  survival: 'vigor',
  brawling: 'vigor',
  climbing: 'vigor',
  // Grit — endurance, willpower, steady hands under pressure
  endurance: 'grit',
  resilience: 'grit',
  composure: 'grit',
  field_medicine: 'grit',
  // Reflex — speed, dexterity, quick reactions
  bladework: 'reflex',
  marksmanship: 'reflex',
  mechanics: 'reflex',
  perception: 'reflex',
  // Wits — knowledge, analysis, awareness
  lore: 'wits',
  electronics: 'wits',
  tracking: 'wits',
  blood_sense: 'wits',
  // Presence — social force, authority, persuasion
  negotiation: 'presence',
  intimidation: 'presence',
  mesmerize: 'presence',
  // Shadow — stealth, subtlety, operating unseen
  stealth: 'shadow',
  lockpicking: 'shadow',
  daystalking: 'shadow',
  scavenging: 'shadow',
}

function formatSkillName(skill: string): string {
  return skill
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export default function StatTab() {
  const { state } = useGame()
  const { player, inventory } = state

  if (!player) return null

  const stats: Stat[] = ['vigor', 'grit', 'reflex', 'wits', 'presence', 'shadow']
  const nextLevelXp = xpForNextLevel(player.level)
  const classDef = CLASS_DEFINITIONS[player.characterClass]
  const weapon = equippedWeapon(inventory)
  const armor = equippedArmor(inventory)

  return (
    <div className="overflow-y-auto flex-1 font-mono text-sm text-amber-400 p-4 space-y-5">
      {/* Pending stat increase banner */}
      {state.pendingStatIncrease && (
        <div className="border border-green-700 bg-green-950 text-green-400 px-3 py-2 text-xs uppercase tracking-widest text-center animate-pulse">
          ⬆ STAT INCREASE AVAILABLE — type &apos;boost [stat]&apos;
        </div>
      )}

      {/* CHARACTER header */}
      <section>
        <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-2">Character</h2>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>
              <span className="text-amber-600">Name: </span>
              <span className="text-amber-300">{player.name}</span>
            </span>
            <span>
              <span className="text-amber-600">Class: </span>
              <span className="text-amber-300">{classDef.name}</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span>
              <span className="text-amber-600">Cycle: </span>
              <span className="text-amber-300">{player.cycle}</span>
            </span>
            <span>
              <span className="text-amber-600">Level: </span>
              <span className="text-amber-300">{player.level}</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span>
              <span className="text-amber-600">HP: </span>
              <span className="text-amber-300">
                {hpBar(player.hp, player.maxHp)} {player.hp}/{player.maxHp}
              </span>
            </span>
          </div>
          <div className="flex justify-between">
            <span>
              <span className="text-amber-600">XP: </span>
              <span className="text-amber-300">
                {player.xp}{nextLevelXp !== null ? `/${nextLevelXp}` : ' (max)'}
              </span>
            </span>
          </div>
        </div>
      </section>

      {/* STAT INCREASE BANNER */}
      {state.pendingStatIncrease && (
        <section className="border border-green-500/50 bg-green-900/20 rounded px-3 py-2">
          <p className="text-green-400 text-sm">
            Stat increase available! Type <span className="font-bold">boost [stat]</span> to choose.
          </p>
        </section>
      )}

      {/* STATS */}
      <section>
        <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-2">Stats</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          {stats.map((stat) => {
            const value = player[stat]
            const mod = statModifier(value)
            return (
              <div key={stat} className="flex justify-between">
                <span className="capitalize">{stat}</span>
                <span className="text-amber-300">
                  {value}{' '}
                  <span className={mod >= 0 ? 'text-amber-400' : 'text-amber-600'}>
                    ({modStr(mod)})
                  </span>
                  {state.pendingStatIncrease && (
                    <span className="text-green-400 text-xs ml-1">+1</span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* EQUIPPED */}
      <section>
        <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-2">Equipped</h2>
        <div className="space-y-1">
          <div>
            <span className="text-amber-600">Weapon: </span>
            {weapon ? (
              <span className="text-amber-300">
                {weapon.name} ({weapon.damage} dmg)
              </span>
            ) : (
              <span className="text-amber-600 italic">None</span>
            )}
          </div>
          <div>
            <span className="text-amber-600">Armor: </span>
            {armor ? (
              <span className="text-amber-300">
                {armor.name} ({armor.defense} def)
              </span>
            ) : (
              <span className="text-amber-600 italic">None</span>
            )}
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section>
        <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-2">
          Skills <span className="normal-case tracking-normal">(derived from stats)</span>
        </h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          {Object.entries(SKILL_STAT_MAP).map(([skill, stat]) => {
            const mod = statModifier(player[stat])
            return (
              <div key={skill} className="flex justify-between">
                <span className="text-amber-400">{formatSkillName(skill)}</span>
                <span className={mod >= 0 ? 'text-amber-300' : 'text-amber-600'}>
                  {modStr(mod)}
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
