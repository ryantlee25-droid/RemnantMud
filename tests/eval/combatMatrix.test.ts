// ============================================================
// tests/integration/combatMatrix.test.ts
// Combat Balance Matrix — 7 classes × 16 enemies × 5 levels × 3 seeds
//
// This test does NOT fail on balance outliers — those are design decisions.
// It DOES fail if the matrix can't complete (crash, infinite loop, NaN damage).
//
// Output: win-rate table printed to console + JSON at the end.
// ============================================================

import { describe, it, expect } from 'vitest'
import type { Player, Enemy, CombatState, Item } from '@/types/game'
import type { CharacterClass } from '@/types/game'
import { CLASS_DEFINITIONS } from '@/types/game'
import { ENEMIES } from '@/data/enemies'
import { startCombat, playerAttack, enemyAttack, applyHollowRoundEffects } from '@/lib/combat'
import { tickConditions } from '@/lib/conditions'
import { withSeededRandom } from '@/lib/testing/seededRng'

// ============================================================
// Configuration
// ============================================================

const SEEDS = [1, 42, 9001]
const MAX_TURNS = 200  // safety valve — a fight going 200 rounds is a bug
const OUTLIER_LOW = 0.10   // <10% win rate = balance concern
const OUTLIER_HIGH = 0.95  // >95% win rate = balance concern

// ============================================================
// Enemy roster (16 enemies from data/enemies.ts)
// ============================================================

const ENEMY_IDS: string[] = [
  // Hollow (7)
  'shuffler',
  'remnant',
  'screamer',
  'stalker',
  'brute',
  'whisperer',
  'hive_mother',
  // Sanguine (3)
  'sanguine_feral',
  'red_court_enforcer',
  'elder_sanguine',
  // MERIDIAN (2)
  'meridian_automated_turret',
  'meridian_ancient_hollow',
  // Deep (4)
  'elder_sanguine_deep',
  'hive_mother_the_deep',
  'hollow_brute_deep',
  'hollow_remnant_deep',
]

// ============================================================
// Character classes
// ============================================================

const CLASSES: CharacterClass[] = [
  'enforcer', 'scout', 'wraith', 'shepherd', 'reclaimer', 'warden', 'broker',
]

// ============================================================
// Stat progression rules
//
// Base stats: all 4 (as per CLASS_DEFINITIONS starting context — 4/4/4/4/4/4)
// Class bonus: applied directly
// Free points (4): distributed to the class's primary stats
// Level bonuses: +1 to primary stat at levels 3, 6, 9 (player's best stat)
// ============================================================

/** Determine which stat to boost for a class (its highest-bonus stat). */
function primaryStat(cls: CharacterClass): keyof Pick<Player, 'vigor' | 'grit' | 'reflex' | 'wits' | 'presence' | 'shadow'> {
  const bonuses = CLASS_DEFINITIONS[cls].classBonus
  let best: keyof typeof bonuses = 'vigor'
  let bestVal = 0
  for (const [k, v] of Object.entries(bonuses)) {
    if (v !== undefined && v > bestVal) {
      bestVal = v
      best = k as keyof typeof bonuses
    }
  }
  return best as keyof Pick<Player, 'vigor' | 'grit' | 'reflex' | 'wits' | 'presence' | 'shadow'>
}

/**
 * Distribute N free points to the class's two highest-bonus stats (split evenly).
 * Returns an object of stat deltas.
 */
function distributeFreePoints(
  cls: CharacterClass,
  points: number,
): Partial<Record<'vigor' | 'grit' | 'reflex' | 'wits' | 'presence' | 'shadow', number>> {
  const bonuses = CLASS_DEFINITIONS[cls].classBonus
  const sorted = (Object.entries(bonuses) as [string, number][])
    .sort((a, b) => b[1] - a[1])
  const result: Partial<Record<string, number>> = {}
  let remaining = points
  // Put 3 into primary, 1 into secondary
  if (sorted.length >= 1) {
    const primary = sorted[0]![0]
    const primaryPts = Math.min(3, remaining)
    result[primary] = primaryPts
    remaining -= primaryPts
  }
  if (sorted.length >= 2 && remaining > 0) {
    const secondary = sorted[1]![0]
    result[secondary] = remaining
  }
  return result as Partial<Record<'vigor' | 'grit' | 'reflex' | 'wits' | 'presence' | 'shadow', number>>
}

/**
 * Build a Player of the given class at the given level.
 * Starting stats: all 4 + class bonus + free points (split 3/1 among top 2 stats)
 * Level stat boosts: +1 to primary stat at levels 3, 6, 9 (cumulative)
 */
function buildPlayer(cls: CharacterClass, level: number): Player {
  const def = CLASS_DEFINITIONS[cls]
  const base = { vigor: 4, grit: 4, reflex: 4, wits: 4, presence: 4, shadow: 4 }

  // Apply class bonus
  for (const [stat, bonus] of Object.entries(def.classBonus)) {
    if (bonus !== undefined) {
      base[stat as keyof typeof base] += bonus
    }
  }

  // Apply free points
  const freeDeltas = distributeFreePoints(cls, def.freePoints)
  for (const [stat, delta] of Object.entries(freeDeltas)) {
    if (delta !== undefined) {
      base[stat as keyof typeof base] += delta
    }
  }

  // Level stat boosts: +1 to primary stat at levels 3, 6, 9
  const primary = primaryStat(cls)
  if (level >= 3) base[primary] += 1
  if (level >= 6) base[primary] += 1
  if (level >= 9) base[primary] += 1

  // HP formula: 8 + (vigor - 2) * 2
  const maxHp = 8 + (base.vigor - 2) * 2

  return {
    id: `player-${cls}-lvl${level}`,
    name: `${cls} L${level}`,
    characterClass: cls,
    vigor: base.vigor,
    grit: base.grit,
    reflex: base.reflex,
    wits: base.wits,
    presence: base.presence,
    shadow: base.shadow,
    hp: maxHp,
    maxHp,
    currentRoomId: 'room_test',
    worldSeed: 1,
    xp: 0,
    level,
    actionsTaken: 0,
    isDead: false,
    cycle: 1,
    totalDeaths: 0,
  }
}

// ============================================================
// Tier gear sets by player level
//
// Simple progression: levels 1–2 get tier-1 items, 3–4 tier-2, etc.
// Weapon damage is the item.damage field used as [1, damage] range in combat.
// ============================================================

interface GearSet {
  weapon: Item
  armor: Item
}

function buildGear(level: number): GearSet {
  // tier 1: pipe_wrench + scrap_vest
  // tier 2: combat_knife + leather_jacket
  // tier 3: 9mm_pistol + reinforced_coat
  // tier 4: ar_platform_rifle + kevlar_vest
  // tier 5: sniper_rifle + kevlar_vest (level 9 only)

  if (level <= 2) {
    return {
      weapon: {
        id: 'pipe_wrench', name: 'Pipe Wrench', description: '', type: 'weapon',
        weight: 3, damage: 3, value: 5, weaponTraits: ['heavy'], tier: 1,
      },
      armor: {
        id: 'scrap_vest', name: 'Scrap Vest', description: '', type: 'armor',
        weight: 3, defense: 1, value: 6, tier: 1,
      },
    }
  } else if (level <= 4) {
    return {
      weapon: {
        id: 'combat_knife', name: 'Combat Knife', description: '', type: 'weapon',
        weight: 1, damage: 4, value: 12, weaponTraits: ['keen', 'quick'], tier: 2,
      },
      armor: {
        id: 'leather_jacket', name: 'Leather Jacket', description: '', type: 'armor',
        weight: 3, defense: 2, value: 18, tier: 2,
      },
    }
  } else if (level <= 6) {
    return {
      weapon: {
        id: '9mm_pistol', name: '9mm Pistol', description: '', type: 'weapon',
        weight: 2, damage: 7, value: 45, weaponTraits: ['precise', 'quick'], tier: 3,
      },
      armor: {
        id: 'reinforced_coat', name: 'Reinforced Coat', description: '', type: 'armor',
        weight: 5, defense: 3, value: 45, armorTraits: ['fortified'], tier: 3,
      },
    }
  } else if (level <= 8) {
    return {
      weapon: {
        id: 'ar_platform_rifle', name: 'AR Platform Rifle', description: '', type: 'weapon',
        weight: 6, damage: 10, value: 130, weaponTraits: ['precise'], tier: 4,
      },
      armor: {
        id: 'kevlar_vest', name: 'Kevlar Vest', description: '', type: 'armor',
        weight: 4, defense: 4, value: 80, armorTraits: ['fortified', 'reactive'], tier: 4,
      },
    }
  } else {
    return {
      weapon: {
        id: 'sniper_rifle', name: 'Sniper Rifle', description: '', type: 'weapon',
        weight: 7, damage: 12, value: 200, weaponTraits: ['precise', 'keen'], tier: 4,
      },
      armor: {
        id: 'kevlar_vest', name: 'Kevlar Vest', description: '', type: 'armor',
        weight: 4, defense: 4, value: 80, armorTraits: ['fortified', 'reactive'], tier: 4,
      },
    }
  }
}

// ============================================================
// Single fight simulation
// ============================================================

interface FightResult {
  won: boolean
  turns: number
  playerHpRemaining: number
  enemyId: string
  class: CharacterClass
  level: number
  crashReason?: string
}

/**
 * Simulate one fight to completion between a player and enemy.
 * Returns win/loss, turns, and remaining player HP.
 * Never throws — wraps errors and returns a loss with crashReason.
 */
function simulateFight(
  playerTemplate: Player,
  enemy: Enemy,
  gear: GearSet,
): FightResult {
  const base: FightResult = {
    won: false,
    turns: 0,
    playerHpRemaining: 0,
    enemyId: enemy.id,
    class: playerTemplate.characterClass,
    level: playerTemplate.level,
  }

  try {
    // Fresh player each fight (don't mutate the template)
    let playerHp = playerTemplate.maxHp
    let combatState: CombatState = startCombat(playerTemplate, enemy)
    let playerConditions = combatState.playerConditions

    for (let turn = 0; turn < MAX_TURNS; turn++) {
      if (!combatState.active) break

      // Tick player conditions at turn start
      const playerCondTick = tickConditions(playerConditions)
      playerHp -= playerCondTick.damage
      playerConditions = playerCondTick.remaining

      if (playerHp <= 0) {
        return { ...base, turns: turn + 1, playerHpRemaining: 0, won: false }
      }

      // Tick enemy conditions
      const enemyCondTick = tickConditions(combatState.enemyConditions)
      const newEnemyHp = Math.max(0, combatState.enemyHp - enemyCondTick.damage)
      combatState = { ...combatState, enemyHp: newEnemyHp, enemyConditions: enemyCondTick.remaining }

      if (newEnemyHp <= 0) {
        return { ...base, turns: turn + 1, playerHpRemaining: playerHp, won: true }
      }

      // Apply pre-attack hollow effects (whisperer debuff, screamer summon, etc.)
      const { newState: stateAfterHollowEffects } = applyHollowRoundEffects(combatState, playerTemplate)
      combatState = stateAfterHollowEffects

      // Build player with current HP for damage formula
      const currentPlayer: Player = { ...playerTemplate, hp: playerHp }

      const damageRange: [number, number] = [1, gear.weapon.damage ?? 3]

      if (combatState.playerGoesFirst) {
        // Player attacks
        const { result: pResult, newState: afterPlayerAtk } = playerAttack(
          currentPlayer,
          combatState,
          damageRange,
          gear.weapon,
        )
        combatState = afterPlayerAtk

        // Validate damage not NaN/Infinity
        if (!isFinite(pResult.damage)) {
          return { ...base, turns: turn + 1, playerHpRemaining: playerHp, won: false, crashReason: `NaN/Inf player damage: ${pResult.damage}` }
        }

        if (pResult.enemyDefeated || combatState.enemyHp <= 0) {
          return { ...base, turns: turn + 1, playerHpRemaining: playerHp, won: true }
        }

        // Enemy attacks back
        const { damage: eDmg, newState: afterEnemyAtk } = enemyAttack(
          currentPlayer,
          combatState,
          gear.armor,
        )
        combatState = afterEnemyAtk

        if (!isFinite(eDmg)) {
          return { ...base, turns: turn + 1, playerHpRemaining: playerHp, won: false, crashReason: `NaN/Inf enemy damage: ${eDmg}` }
        }

        playerHp -= eDmg
      } else {
        // Enemy goes first
        const { damage: eDmg, newState: afterEnemyAtk } = enemyAttack(
          currentPlayer,
          combatState,
          gear.armor,
        )
        combatState = afterEnemyAtk

        if (!isFinite(eDmg)) {
          return { ...base, turns: turn + 1, playerHpRemaining: playerHp, won: false, crashReason: `NaN/Inf enemy damage: ${eDmg}` }
        }

        playerHp -= eDmg

        if (playerHp <= 0) {
          return { ...base, turns: turn + 1, playerHpRemaining: 0, won: false }
        }

        const { result: pResult, newState: afterPlayerAtk } = playerAttack(
          { ...currentPlayer, hp: playerHp },
          combatState,
          damageRange,
          gear.weapon,
        )
        combatState = afterPlayerAtk

        if (!isFinite(pResult.damage)) {
          return { ...base, turns: turn + 1, playerHpRemaining: playerHp, won: false, crashReason: `NaN/Inf player damage: ${pResult.damage}` }
        }

        if (pResult.enemyDefeated || combatState.enemyHp <= 0) {
          return { ...base, turns: turn + 1, playerHpRemaining: playerHp, won: true }
        }
      }

      if (playerHp <= 0) {
        return { ...base, turns: turn + 1, playerHpRemaining: 0, won: false }
      }
    }

    // MAX_TURNS reached — fight did not terminate
    return {
      ...base,
      turns: MAX_TURNS,
      playerHpRemaining: playerHp,
      won: false,
      crashReason: `Non-terminating: exceeded ${MAX_TURNS} turns`,
    }
  } catch (err) {
    return {
      ...base,
      turns: 0,
      playerHpRemaining: 0,
      won: false,
      crashReason: `Exception: ${String(err)}`,
    }
  }
}

// ============================================================
// Matrix runner
// ============================================================

interface ScenarioKey {
  class: CharacterClass
  enemyId: string
  level: number
}

interface AggregateResult {
  wins: number
  total: number
  winRate: number
  totalTurns: number
  crashes: string[]
}

function runMatrix(seed: number): Map<string, AggregateResult> {
  const results = new Map<string, AggregateResult>()

  const levels = [1, 3, 5, 7, 9]

  for (const cls of CLASSES) {
    for (const enemyId of ENEMY_IDS) {
      for (const level of levels) {
        const key = `${cls}|${enemyId}|${level}`
        const existing = results.get(key) ?? { wins: 0, total: 0, winRate: 0, totalTurns: 0, crashes: [] }

        const enemy = ENEMIES[enemyId]
        if (!enemy) continue

        const player = buildPlayer(cls, level)
        const gear = buildGear(level)

        const result = withSeededRandom(seed, () => simulateFight(player, enemy, gear))

        const updated: AggregateResult = {
          wins: existing.wins + (result.won ? 1 : 0),
          total: existing.total + 1,
          winRate: 0,
          totalTurns: existing.totalTurns + result.turns,
          crashes: result.crashReason ? [...existing.crashes, result.crashReason] : existing.crashes,
        }
        updated.winRate = updated.wins / updated.total
        results.set(key, updated)
      }
    }
  }

  return results
}

// ============================================================
// Aggregate across multiple seeds
// ============================================================

function aggregateSeeds(seedResults: Map<string, AggregateResult>[]): Map<string, AggregateResult> {
  const combined = new Map<string, AggregateResult>()

  for (const seedMap of seedResults) {
    for (const [key, val] of seedMap.entries()) {
      const existing = combined.get(key) ?? { wins: 0, total: 0, winRate: 0, totalTurns: 0, crashes: [] }
      const updated: AggregateResult = {
        wins: existing.wins + val.wins,
        total: existing.total + val.total,
        winRate: 0,
        totalTurns: existing.totalTurns + val.totalTurns,
        crashes: [...existing.crashes, ...val.crashes],
      }
      updated.winRate = updated.wins / updated.total
      combined.set(key, updated)
    }
  }

  return combined
}

// ============================================================
// Report helpers
// ============================================================

function formatPct(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`
}

function printWinRateTable(combined: Map<string, AggregateResult>): void {
  const levels = [1, 3, 5, 7, 9]

  console.log('\n=== COMBAT BALANCE MATRIX ===')
  console.log(`Seeds: ${SEEDS.join(', ')} | Fights per cell: ${SEEDS.length}`)
  console.log(`Dimensions: ${CLASSES.length} classes × ${ENEMY_IDS.length} enemies × ${levels.length} levels = ${CLASSES.length * ENEMY_IDS.length * levels.length * SEEDS.length} total fights`)

  // Per-class per-level (averaged across all enemies)
  console.log('\n--- Class × Level Win Rates (avg across all enemies) ---')
  const header = ['Class'.padEnd(12), ...levels.map(l => `Lvl ${l}`.padStart(8))].join(' ')
  console.log(header)
  console.log('-'.repeat(header.length))

  for (const cls of CLASSES) {
    const row = [cls.padEnd(12)]
    for (const level of levels) {
      let wins = 0
      let total = 0
      for (const enemyId of ENEMY_IDS) {
        const key = `${cls}|${enemyId}|${level}`
        const r = combined.get(key)
        if (r) { wins += r.wins; total += r.total }
      }
      const rate = total > 0 ? wins / total : 0
      row.push(formatPct(rate).padStart(8))
    }
    console.log(row.join(' '))
  }

  // Per-class per-enemy (averaged across all levels)
  console.log('\n--- Class × Enemy Win Rates (avg across levels 1,3,5,7,9) ---')
  const enemyHeader = ['Class'.padEnd(12), ...ENEMY_IDS.map(e => e.slice(0, 10).padStart(11))].join(' ')
  console.log(enemyHeader)
  console.log('-'.repeat(enemyHeader.length))

  for (const cls of CLASSES) {
    const row = [cls.padEnd(12)]
    for (const enemyId of ENEMY_IDS) {
      let wins = 0
      let total = 0
      for (const level of levels) {
        const key = `${cls}|${enemyId}|${level}`
        const r = combined.get(key)
        if (r) { wins += r.wins; total += r.total }
      }
      const rate = total > 0 ? wins / total : 0
      row.push(formatPct(rate).padStart(11))
    }
    console.log(row.join(' '))
  }
}

function collectOutliers(
  combined: Map<string, AggregateResult>,
): Array<{ class: CharacterClass; enemyId: string; level: number; winRate: number; direction: 'low' | 'high' }> {
  const outliers: Array<{ class: CharacterClass; enemyId: string; level: number; winRate: number; direction: 'low' | 'high' }> = []
  const levels = [1, 3, 5, 7, 9]

  for (const cls of CLASSES) {
    for (const enemyId of ENEMY_IDS) {
      for (const level of levels) {
        const key = `${cls}|${enemyId}|${level}`
        const r = combined.get(key)
        if (!r) continue
        if (r.winRate < OUTLIER_LOW) {
          outliers.push({ class: cls, enemyId, level, winRate: r.winRate, direction: 'low' })
        } else if (r.winRate > OUTLIER_HIGH) {
          outliers.push({ class: cls, enemyId, level, winRate: r.winRate, direction: 'high' })
        }
      }
    }
  }

  return outliers.sort((a, b) => a.winRate - b.winRate)
}

function collectCrashes(combined: Map<string, AggregateResult>): Array<{ key: string; reasons: string[] }> {
  const crashes: Array<{ key: string; reasons: string[] }> = []
  for (const [key, val] of combined.entries()) {
    if (val.crashes.length > 0) {
      crashes.push({ key, reasons: [...new Set(val.crashes)] })
    }
  }
  return crashes
}

// ============================================================
// The actual test suite
// ============================================================

describe('Combat Balance Matrix', () => {
  // Run all seeds and aggregate
  let combined: Map<string, AggregateResult>

  it('runs all 3 seeds without crashes', () => {
    const seedResults: Map<string, AggregateResult>[] = []

    for (const seed of SEEDS) {
      const result = runMatrix(seed)
      seedResults.push(result)
    }

    combined = aggregateSeeds(seedResults)

    // Print the full table
    printWinRateTable(combined)

    const crashes = collectCrashes(combined)
    if (crashes.length > 0) {
      console.log('\n=== CRASHES / NON-TERMINATING ===')
      for (const c of crashes) {
        console.log(`  ${c.key}: ${c.reasons.join('; ')}`)
      }
    }

    const outliers = collectOutliers(combined)
    if (outliers.length > 0) {
      console.log('\n=== BALANCE OUTLIERS (not failures — design review needed) ===')
      for (const o of outliers) {
        const dir = o.direction === 'low' ? '<10%' : '>95%'
        console.log(`  ${dir} | ${o.class} vs ${o.enemyId} @ lvl ${o.level}: ${formatPct(o.winRate)}`)
      }
    }

    // Structured JSON for the report
    const jsonOutput: Record<string, { winRate: number; wins: number; total: number; avgTurns: number }> = {}
    for (const [key, val] of combined.entries()) {
      jsonOutput[key] = {
        winRate: Math.round(val.winRate * 1000) / 1000,
        wins: val.wins,
        total: val.total,
        avgTurns: val.total > 0 ? Math.round(val.totalTurns / val.total) : 0,
      }
    }
    console.log('\n=== MATRIX JSON (for report) ===')
    console.log(JSON.stringify(jsonOutput, null, 2))

    // The only hard assertion: zero crashes
    expect(crashes.length, `Crashes found: ${crashes.map(c => c.key).join(', ')}`).toBe(0)
  })

  it('produces finite win rates for all 560 scenarios', () => {
    // combined may not be set if previous test was skipped
    if (!combined) {
      const seedResults = SEEDS.map(s => runMatrix(s))
      combined = aggregateSeeds(seedResults)
    }

    const levels = [1, 3, 5, 7, 9]
    for (const cls of CLASSES) {
      for (const enemyId of ENEMY_IDS) {
        for (const level of levels) {
          const key = `${cls}|${enemyId}|${level}`
          const r = combined.get(key)
          expect(r, `Missing result for ${key}`).toBeDefined()
          if (r) {
            expect(isFinite(r.winRate), `Non-finite win rate for ${key}: ${r.winRate}`).toBe(true)
            expect(r.winRate, `Win rate out of [0,1] for ${key}`).toBeGreaterThanOrEqual(0)
            expect(r.winRate, `Win rate out of [0,1] for ${key}`).toBeLessThanOrEqual(1)
            expect(r.total, `Zero total fights for ${key}`).toBeGreaterThan(0)
          }
        }
      }
    }
  })

  it('no class sweeps every enemy at level 1 (0% check already excluded by finite test)', () => {
    if (!combined) {
      const seedResults = SEEDS.map(s => runMatrix(s))
      combined = aggregateSeeds(seedResults)
    }

    // At level 1, no class should beat all 16 enemies with 100% win rate
    for (const cls of CLASSES) {
      const allPerfect = ENEMY_IDS.every(enemyId => {
        const key = `${cls}|${enemyId}|1`
        const r = combined.get(key)
        return r !== undefined && r.winRate >= 1.0
      })
      expect(allPerfect, `${cls} sweeps all enemies at level 1 — balance concern`).toBe(false)
    }
  })

  it('each class wins at least one fight overall', () => {
    if (!combined) {
      const seedResults = SEEDS.map(s => runMatrix(s))
      combined = aggregateSeeds(seedResults)
    }

    const levels = [1, 3, 5, 7, 9]
    for (const cls of CLASSES) {
      let totalWins = 0
      for (const enemyId of ENEMY_IDS) {
        for (const level of levels) {
          const key = `${cls}|${enemyId}|${level}`
          const r = combined.get(key)
          if (r) totalWins += r.wins
        }
      }
      expect(totalWins, `${cls} has 0 wins across all scenarios`).toBeGreaterThan(0)
    }
  })
})
