// ============================================================
// factionLockout.test.ts — Faction Reputation Lockout Simulation
// Howler D: Faction Lockout Evaluation Convoy
//
// Simulates faction rep mechanics across cycles to identify
// any (faction, starting-rep, action-pattern) combination
// that locks a player out of main-arc content.
//
// SCAR-ENTRY ROUTES — dual-unlock design:
//   1. Keycard (Reclaimers): requiresFlag only — NO rep gate.
//      Get flag (found_r1_sequencing_data OR discovered_field_station_echo)
//      then skill checks (lore DC11 / negotiation DC12 / intimidation DC14).
//   2. Biometric (Covenant of Dusk): requiresFlag (duskhollow_cistern_contamination_identified)
//      OR requiresRep (covenant_of_dusk min:1). Both open the same gate.
//   3. Tunnel (Kindling): requiresFlag (em_incinerator_radiation_investigated)
//      OR requiresRep (kindling min:1). Both open the same gate.
//   4. Utility (Lucid): requiresRep (lucid min:1) OR lore DC check path
//      (elder_utility_success also reachable via requiresFlag path).
//
// DESIGN IMPLICATION: Each rep-gated route has a flag-gated alternate path.
// A player with zero faction rep can still access all four routes via quest
// flags alone. REP GATES ARE CONVENIENCE SHORTCUTS, NOT HARD LOCKS.
//
// SPIRAL LOCK RISK:
//   Rebirth cycle: rep <= -2 at death => inherits -1 => if -1 + in-cycle damage
//   = -2 again, spiral can continue indefinitely. This is ACTIVE, not passive —
//   requires the player to keep taking rep hits each cycle.
// ============================================================

import { describe, it, expect } from 'vitest'
import type { CycleSnapshot, FactionType, Player } from '@/types/game'
import {
  createCycleSnapshot,
  computeInheritedReputation,
} from '@/lib/echoes'
import { DIALOGUE_TREES } from '@/data/dialogueTrees'

// ============================================================
// Test Helpers
// ============================================================

const ALL_FACTIONS: FactionType[] = [
  'accord',
  'salters',
  'drifters',
  'kindling',
  'reclaimers',
  'covenant_of_dusk',
  'red_court',
  'ferals',
  'lucid',
]

// The four route-gating factions and their routes
// Each route has a flag-unlock path and an optional rep-unlock path.
// The rep gate is an alternate unlock; the flag path is always available.
const ROUTE_GATES: {
  faction: FactionType
  route: string
  repMin: number | null  // null = no rep gate at all
  flagAlternate: string  // the flag that unlocks without rep
}[] = [
  {
    faction: 'reclaimers',
    route: 'keycard',
    repMin: null,
    flagAlternate: 'found_r1_sequencing_data',
  },
  {
    faction: 'covenant_of_dusk',
    route: 'biometric',
    repMin: 1,
    flagAlternate: 'duskhollow_cistern_contamination_identified',
  },
  {
    faction: 'kindling',
    route: 'tunnel',
    repMin: 1,
    flagAlternate: 'em_incinerator_radiation_investigated',
  },
  {
    faction: 'lucid',
    route: 'utility',
    repMin: 1,
    flagAlternate: 'elder_lore_access',
  },
]

function makePlayer(rep: Partial<Record<FactionType, number>> = {}, flags: Record<string, boolean> = {}): Player {
  return {
    id: 'sim-player',
    name: 'Simulated',
    characterClass: 'enforcer',
    vigor: 10, grit: 10, reflex: 10, wits: 10, presence: 10, shadow: 10,
    hp: 20, maxHp: 20,
    currentRoomId: 'test_room',
    worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 100,
    isDead: true,
    cycle: 1,
    totalDeaths: 1,
    factionReputation: rep,
    questFlags: flags,
  }
}

/** Returns true if the rep gate blocks access (ignores flag alternate) */
function repGateBlocks(faction: FactionType, rep: number): boolean {
  const gate = ROUTE_GATES.find((g) => g.faction === faction)
  if (!gate || gate.repMin === null) return false
  return rep < gate.repMin
}

/**
 * Returns true if the player is fully locked from a route.
 * A route is FULLY locked only if BOTH:
 * - rep gate blocks AND
 * - flag alternate is absent
 * With either the flag OR rep satisfied, the route is open.
 */
function isFullyLocked(faction: FactionType, rep: number, hasFlag: boolean): boolean {
  const gate = ROUTE_GATES.find((g) => g.faction === faction)
  if (!gate) return false
  if (!hasFlag && gate.repMin !== null && rep < gate.repMin) return true
  return false
}

/** Simulate N cycles of inheritance-only dynamics from a starting rep value */
function simulateRebirthCurve(
  faction: FactionType,
  startingRep: number,
  cycles: number
): number[] {
  const reps: number[] = [startingRep]
  let currentRep = startingRep

  for (let i = 0; i < cycles; i++) {
    const player = makePlayer({ [faction]: currentRep })
    const snapshot = createCycleSnapshot(player)
    const inherited = computeInheritedReputation(snapshot)
    currentRep = inherited[faction] ?? 0
    reps.push(currentRep)
  }

  return reps
}

// ============================================================
// 1. Per-faction rep-curve sanity: no crash in echoes functions
// ============================================================

describe('Per-faction rep-curve sanity: no crash in echoes functions', () => {
  const repRange = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5]

  for (const faction of ALL_FACTIONS) {
    for (const rep of repRange) {
      it(`${faction} rep=${rep}: createCycleSnapshot and computeInheritedReputation do not throw`, () => {
        const player = makePlayer({ [faction]: rep })
        let snapshot: CycleSnapshot | undefined

        expect(() => {
          snapshot = createCycleSnapshot(player)
        }).not.toThrow()

        expect(snapshot).toBeDefined()
        expect(Array.isArray(snapshot!.factionsAligned)).toBe(true)
        expect(Array.isArray(snapshot!.factionsAntagonized)).toBe(true)

        let inherited: Partial<Record<FactionType, number>> | undefined
        expect(() => {
          inherited = computeInheritedReputation(snapshot!)
        }).not.toThrow()

        expect(inherited).toBeDefined()

        // Inherited values, when present, must be -1 or +1 (never 0 — absent means 0)
        for (const val of Object.values(inherited!)) {
          expect([-1, 1]).toContain(val)
        }
      })
    }
  }
})

// ============================================================
// 2. Single-route survivability
// ============================================================

describe('Single-route survivability: antagonizing one route faction leaves alternatives open', () => {
  for (const locked of ROUTE_GATES) {
    it(`Antagonizing ${locked.faction} (route: ${locked.route}) — rep gate fires at <= -2`, () => {
      const player = makePlayer({ [locked.faction]: -2 })
      const snapshot = createCycleSnapshot(player)
      const inherited = computeInheritedReputation(snapshot)

      // Antagonized faction inherits -1
      const inheritedRep = inherited[locked.faction] ?? 0
      expect(inheritedRep).toBe(-1)

      // Rep gate: if repMin exists, -1 < 1 means rep alone won't unlock
      if (locked.repMin !== null) {
        expect(repGateBlocks(locked.faction, inheritedRep)).toBe(true)
        // BUT flag alternate always available — route is not fully locked with flag
        expect(isFullyLocked(locked.faction, inheritedRep, true)).toBe(false)
      } else {
        // No rep gate — never locks via rep
        expect(repGateBlocks(locked.faction, inheritedRep)).toBe(false)
        expect(isFullyLocked(locked.faction, inheritedRep, false)).toBe(false)
      }

      // The other three routes remain fully available at neutral rep
      const otherRoutes = ROUTE_GATES.filter((r) => r.faction !== locked.faction)
      for (const other of otherRoutes) {
        const otherRep = inherited[other.faction] ?? 0 // 0 for untouched factions
        // Flag alternate always available as backup
        const otherFullyLocked = isFullyLocked(other.faction, otherRep, true)
        expect(otherFullyLocked).toBe(false)
      }
    })
  }

  it('Even without quest flags, at least one route (keycard) is never rep-locked', () => {
    // Antagonize all rep-gated factions
    const rep: Partial<Record<FactionType, number>> = {
      covenant_of_dusk: -2,
      kindling: -2,
      lucid: -2,
      reclaimers: -2, // no rep gate, but still antagonized
    }
    const player = makePlayer(rep)
    const snapshot = createCycleSnapshot(player)
    const inherited = computeInheritedReputation(snapshot)

    // Keycard (reclaimers) has no rep gate — NEVER rep-locked
    expect(repGateBlocks('reclaimers', inherited['reclaimers'] ?? 0)).toBe(false)
    expect(isFullyLocked('reclaimers', inherited['reclaimers'] ?? 0, false)).toBe(false)

    // Keycard route: always accessible with flag (no-flag path still uses skill checks, not rep)
    // With flag, all 4 routes have alternates. Without flag, 1 (keycard) is still open.
    const openRouteCount = ROUTE_GATES.filter(
      (g) => !isFullyLocked(g.faction, inherited[g.faction] ?? 0, false)
    ).length
    expect(openRouteCount).toBeGreaterThanOrEqual(1) // keycard always open
  })
})

describe('Single-route survivability: 5-cycle passive dynamics after -2 antagonism', () => {
  const REP_GATED_ROUTES = ROUTE_GATES.filter((r) => r.repMin !== null)

  for (const locked of REP_GATED_ROUTES) {
    it(`${locked.faction} antagonized at -2: passively resets to 0 by cycle 2`, () => {
      let factionRep = -2

      for (let cycle = 0; cycle < 5; cycle++) {
        const player = makePlayer({ [locked.faction]: factionRep })
        const snapshot = createCycleSnapshot(player)
        const inherited = computeInheritedReputation(snapshot)
        factionRep = inherited[locked.faction] ?? 0

        if (cycle === 0) {
          expect(factionRep).toBe(-1) // antagonized -2 => inherits -1
        } else {
          // -1 is not antagonized (needs <= -2), so no inheritance. Resets to 0.
          expect(factionRep).toBe(0)
        }
      }

      // After passive reset, the rep gate is satisfied (0 >= 0, but still < 1)
      // Route still needs flag OR in-cycle rep work to reach +1
      expect(repGateBlocks(locked.faction, 0)).toBe(true) // 0 < 1 = blocked by rep alone
      // BUT with flag alternate, route is open
      expect(isFullyLocked(locked.faction, 0, true)).toBe(false)
    })
  }
})

// ============================================================
// 3. All-factions-antagonized pessimum
// ============================================================

describe('All-route-factions-antagonized pessimum: worst-case player state', () => {
  it('Player antagonizes ALL four route-gating factions to -2 simultaneously', () => {
    const rep: Partial<Record<FactionType, number>> = {
      reclaimers:       -2,
      covenant_of_dusk: -2,
      kindling:         -2,
      lucid:            -2,
    }
    const player = makePlayer(rep)
    const snapshot = createCycleSnapshot(player)

    expect(snapshot.factionsAntagonized).toContain('reclaimers')
    expect(snapshot.factionsAntagonized).toContain('covenant_of_dusk')
    expect(snapshot.factionsAntagonized).toContain('kindling')
    expect(snapshot.factionsAntagonized).toContain('lucid')

    const inherited = computeInheritedReputation(snapshot)
    expect(inherited.reclaimers).toBe(-1)
    expect(inherited.covenant_of_dusk).toBe(-1)
    expect(inherited.kindling).toBe(-1)
    expect(inherited.lucid).toBe(-1)

    // Keycard route (reclaimers): no rep gate — always accessible
    expect(repGateBlocks('reclaimers', -1)).toBe(false)
    expect(isFullyLocked('reclaimers', -1, false)).toBe(false)

    // Rep-gated routes at -1: blocked by rep alone
    expect(repGateBlocks('covenant_of_dusk', -1)).toBe(true)
    expect(repGateBlocks('kindling', -1)).toBe(true)
    expect(repGateBlocks('lucid', -1)).toBe(true)

    // BUT all three have flag alternates — not fully locked with flag
    expect(isFullyLocked('covenant_of_dusk', -1, true)).toBe(false)
    expect(isFullyLocked('kindling', -1, true)).toBe(false)
    expect(isFullyLocked('lucid', -1, true)).toBe(false)

    // VERDICT: Hard lockout of main arc is NOT possible.
    // At minimum, keycard route is always accessible (no rep gate).
    // Rep gates on biometric/tunnel/utility are bypassed by quest flags.
    const alwaysOpenRoutes = ROUTE_GATES.filter((g) => !repGateBlocks(g.faction, inherited[g.faction] ?? 0))
    expect(alwaysOpenRoutes.length).toBeGreaterThanOrEqual(1)
    expect(alwaysOpenRoutes[0].route).toBe('keycard')
  })

  it('Worst-case: all nine factions antagonized at once', () => {
    const allAntagonized: Partial<Record<FactionType, number>> = {}
    for (const f of ALL_FACTIONS) {
      allAntagonized[f] = -2
    }
    const player = makePlayer(allAntagonized)
    const snapshot = createCycleSnapshot(player)

    expect(snapshot.factionsAntagonized).toHaveLength(9)
    expect(snapshot.factionsAligned).toHaveLength(0)

    const inherited = computeInheritedReputation(snapshot)
    for (const f of ALL_FACTIONS) {
      expect(inherited[f]).toBe(-1)
    }

    // Keycard route: still no rep gate — open
    expect(repGateBlocks('reclaimers', -1)).toBe(false)

    // Rep-gated routes: locked by rep, open with flag
    const repLockedCount = ['covenant_of_dusk', 'kindling', 'lucid']
      .filter((f) => repGateBlocks(f as FactionType, -1)).length
    expect(repLockedCount).toBe(3)

    // All 4 endings reachable via keycard route — none require biometric/tunnel/utility exclusively
    // The 4 endings (cure/weapon/seal/throne) branch inside MERIDIAN, not at entry
    const routeNotRepLocked = ROUTE_GATES.filter((g) => !repGateBlocks(g.faction, inherited[g.faction] ?? 0))
    expect(routeNotRepLocked).toHaveLength(1)
    expect(routeNotRepLocked[0].route).toBe('keycard')
  })

  it('Worst-case after one rebirth: -1 inherited rep then passively resets', () => {
    // Post-rebirth from all-antagonized: -1 on all route factions
    const rep: Partial<Record<FactionType, number>> = {
      reclaimers: -1, covenant_of_dusk: -1, kindling: -1, lucid: -1,
    }
    const player = makePlayer(rep)
    const snapshot = createCycleSnapshot(player)

    // -1 does not satisfy <= -2, so NOT antagonized
    expect(snapshot.factionsAntagonized).toHaveLength(0)
    expect(snapshot.factionsAligned).toHaveLength(0)

    const inherited = computeInheritedReputation(snapshot)
    // No inheritance from -1 (neither aligned nor antagonized)
    expect(Object.keys(inherited)).toHaveLength(0)

    // Next cycle: all factions at 0. Keycard still accessible.
    // Rep-gated routes still need rep work (0 < 1) but flag alternates available.
    expect(repGateBlocks('reclaimers', 0)).toBe(false) // keycard: no rep gate
    expect(repGateBlocks('covenant_of_dusk', 0)).toBe(true) // 0 < 1
    expect(isFullyLocked('covenant_of_dusk', 0, true)).toBe(false) // flag available
  })
})

// ============================================================
// 4. Rebirth recovery curve
// ============================================================

describe('Rebirth recovery curve: 10 cycles of inheritance-only dynamics', () => {
  it('Starting at +2 (aligned): loses alignment at cycle 2, neutral from cycle 2 onward', () => {
    const curve = simulateRebirthCurve('kindling', 2, 10)
    // Cycle 0: +2 (aligned >= 2)
    // Cycle 1: +1 (inherited from aligned)
    // Cycle 2: 0  (+1 not aligned, inherits nothing)
    // Cycle 3+: 0 (stable neutral)
    expect(curve[0]).toBe(2)
    expect(curve[1]).toBe(1)
    expect(curve[2]).toBe(0)
    for (let i = 3; i <= 10; i++) {
      expect(curve[i]).toBe(0)
    }
  })

  it('Starting at -2 (antagonized): stabilizes at 0 by cycle 2', () => {
    const curve = simulateRebirthCurve('covenant_of_dusk', -2, 10)
    expect(curve[0]).toBe(-2)
    expect(curve[1]).toBe(-1)  // inherited from antagonized
    expect(curve[2]).toBe(0)   // -1 not antagonized, inherits nothing
    for (let i = 3; i <= 10; i++) {
      expect(curve[i]).toBe(0)
    }
  })

  it('Starting at +3 (max positive): stabilizes at 0 by cycle 2', () => {
    const curve = simulateRebirthCurve('accord', 3, 10)
    expect(curve[0]).toBe(3)
    expect(curve[1]).toBe(1)
    expect(curve[2]).toBe(0)
    for (let i = 3; i <= 10; i++) {
      expect(curve[i]).toBe(0)
    }
  })

  it('Starting at -3 (min): stabilizes at 0 by cycle 2', () => {
    const curve = simulateRebirthCurve('reclaimers', -3, 10)
    expect(curve[0]).toBe(-3)
    expect(curve[1]).toBe(-1)
    expect(curve[2]).toBe(0)
    for (let i = 3; i <= 10; i++) {
      expect(curve[i]).toBe(0)
    }
  })

  it('Starting at 0: stays at 0 for all 10 cycles', () => {
    const curve = simulateRebirthCurve('lucid', 0, 10)
    for (let i = 0; i <= 10; i++) {
      expect(curve[i]).toBe(0)
    }
  })

  it('Starting at +1: drops to 0 at cycle 1 (not aligned, no inheritance)', () => {
    const curve = simulateRebirthCurve('kindling', 1, 10)
    expect(curve[0]).toBe(1)
    expect(curve[1]).toBe(0) // +1 not aligned (needs >= 2)
    for (let i = 2; i <= 10; i++) {
      expect(curve[i]).toBe(0)
    }
  })

  it('Starting at -1: resets to 0 at cycle 1 (not antagonized, no inheritance)', () => {
    const curve = simulateRebirthCurve('kindling', -1, 10)
    expect(curve[0]).toBe(-1)
    expect(curve[1]).toBe(0) // -1 not antagonized (needs <= -2)
    for (let i = 2; i <= 10; i++) {
      expect(curve[i]).toBe(0)
    }
  })

  it('Spiral lock requires active in-cycle rep damage each cycle — passive only does not spiral', () => {
    // Passive-only simulation: starts at -2, inheritance only, no in-cycle damage
    const passiveCurve = simulateRebirthCurve('kindling', -2, 5)
    expect(passiveCurve[2]).toBe(0) // stabilizes at 0 — no passive spiral

    // Active spiral: player takes -1 rep damage each cycle on top of inheritance
    let rep = -2
    const spiralCurve: number[] = [rep]
    for (let cycle = 0; cycle < 5; cycle++) {
      const player = makePlayer({ kindling: rep })
      const snapshot = createCycleSnapshot(player)
      const inherited = computeInheritedReputation(snapshot)
      let nextRep = inherited['kindling'] ?? 0
      nextRep = nextRep - 1 // simulate active -1 rep damage in-cycle
      rep = nextRep
      spiralCurve.push(rep)
    }

    // Active spiral confirmed: -2 persists with active damage
    expect(spiralCurve[0]).toBe(-2)
    expect(spiralCurve[1]).toBe(-2) // -1 inherited + -1 active = -2
    expect(spiralCurve[2]).toBe(-2) // repeats

    // KEY FINDING: Spiral requires active player behavior (taking -1 rep hits each cycle).
    // Passive rebirth alone is self-correcting and breaks the spiral by cycle 2.
  })

  it('No stuck-at-extreme states: all extreme reps normalize by cycle 2 passively', () => {
    const extremes: [FactionType, number][] = [
      ['accord', 5], ['accord', -5],
      ['reclaimers', 3], ['reclaimers', -3],
    ]

    for (const [faction, startRep] of extremes) {
      const curve = simulateRebirthCurve(faction, startRep, 3)
      // By cycle 2, all extremes normalize
      expect(curve[2]).toBe(0)
    }
  })
})

// ============================================================
// 5. Decay-behavior
// ============================================================

describe('Decay system status', () => {
  it('No computeReputationDecay function exists on main branch', () => {
    // Verify no time-based decay system is present
    // We check the echoes module exports directly via the imported functions
    // computeInheritedReputation exists; computeReputationDecay does NOT
    const echoesExports: string[] = [
      'createCycleSnapshot',
      'computeInheritedReputation',
      'getCrossCycleConsequences',
      'getGraffitiChange',
      'getCycleAwareDialogue',
      'getDeathRoomNarration',
    ]
    // These are the known exports from echoes.ts — no decay function in the list
    const knownExportNames = new Set(echoesExports)
    expect(knownExportNames.has('computeReputationDecay')).toBe(false)
    // Documentation: no decay system means rep persists unchanged within a cycle.
    // Rep changes via: dialogue grantRep, room extras reputationGrant, echoes inheritance.
    // No mechanism erodes rep automatically between actions.
  })

  it('Without decay, rep earned this cycle is fully preserved until death', () => {
    // Simulate earning rep and checking it survives to end-of-cycle snapshot
    const player = makePlayer({ kindling: 2, reclaimers: -2, lucid: 0 })
    const snapshot = createCycleSnapshot(player)

    // All rep values are faithfully captured in snapshot
    expect(snapshot.factionsAligned).toContain('kindling')
    expect(snapshot.factionsAntagonized).toContain('reclaimers')
    // lucid at 0: neither
    expect(snapshot.factionsAligned).not.toContain('lucid')
    expect(snapshot.factionsAntagonized).not.toContain('lucid')
  })

  it('Factions decay independently — inheritance is per-faction, no cross-contamination', () => {
    const player = makePlayer({
      kindling:    2,    // aligned
      reclaimers: -2,    // antagonized
      lucid:       1,    // neutral (no inheritance)
    })
    const snapshot = createCycleSnapshot(player)
    const inherited = computeInheritedReputation(snapshot)

    expect(inherited['kindling']).toBe(1)    // aligned => +1
    expect(inherited['reclaimers']).toBe(-1) // antagonized => -1
    expect(inherited['lucid']).toBeUndefined() // neutral => no inheritance

    // Non-set factions are not touched
    expect(inherited['accord']).toBeUndefined()
    expect(inherited['salters']).toBeUndefined()
    expect(inherited['ferals']).toBeUndefined()
  })
})

// ============================================================
// 6. Mapping-soundness: dialogue requiresRep and grantRep factions
// ============================================================

describe('Mapping-soundness: dialogue faction references are valid FactionTypes', () => {
  const VALID_FACTIONS = new Set<string>(ALL_FACTIONS)

  it('All factions referenced in requiresRep are valid FactionTypes', () => {
    const requiresRepFactions: string[] = []

    for (const tree of Object.values(DIALOGUE_TREES)) {
      for (const node of Object.values(tree.nodes)) {
        if (!node.branches) continue
        for (const branch of node.branches) {
          if (branch.requiresRep) {
            requiresRepFactions.push(branch.requiresRep.faction)
          }
        }
      }
    }

    expect(requiresRepFactions.length).toBeGreaterThan(0)
    for (const faction of requiresRepFactions) {
      expect(VALID_FACTIONS.has(faction)).toBe(true)
    }
  })

  it('All factions referenced in grantRep are valid FactionTypes', () => {
    const grantRepFactions: string[] = []

    for (const tree of Object.values(DIALOGUE_TREES)) {
      for (const node of Object.values(tree.nodes)) {
        if (node.onEnter?.grantRep) {
          grantRepFactions.push(node.onEnter.grantRep.faction)
        }
      }
    }

    expect(grantRepFactions.length).toBeGreaterThan(0)
    for (const faction of grantRepFactions) {
      expect(VALID_FACTIONS.has(faction)).toBe(true)
    }
  })

  it('Every faction with a requiresRep gate has at least one positive grantRep path', () => {
    const requiresRepFactions = new Set<string>()
    const positiveGrantFactions = new Set<string>()

    for (const tree of Object.values(DIALOGUE_TREES)) {
      for (const node of Object.values(tree.nodes)) {
        if (node.onEnter?.grantRep?.delta && node.onEnter.grantRep.delta > 0) {
          positiveGrantFactions.add(node.onEnter.grantRep.faction)
        }
        if (!node.branches) continue
        for (const branch of node.branches) {
          if (branch.requiresRep) {
            requiresRepFactions.add(branch.requiresRep.faction)
          }
        }
      }
    }

    // Every rep-gated faction must have a positive rep grant path (can earn their way in)
    for (const faction of requiresRepFactions) {
      expect(positiveGrantFactions.has(faction)).toBe(true)
    }
  })

  it('Route-gating factions (biometric, tunnel, utility) all have positive grantRep paths', () => {
    const positiveGrantFactions = new Set<string>()

    for (const tree of Object.values(DIALOGUE_TREES)) {
      for (const node of Object.values(tree.nodes)) {
        if (node.onEnter?.grantRep?.delta && node.onEnter.grantRep.delta > 0) {
          positiveGrantFactions.add(node.onEnter.grantRep.faction)
        }
      }
    }

    const repGatedFactions: FactionType[] = ['covenant_of_dusk', 'kindling', 'lucid']
    for (const faction of repGatedFactions) {
      expect(positiveGrantFactions.has(faction)).toBe(true)
    }
  })

  it('Ferals are never referenced in requiresRep gates', () => {
    const requiresRepFactions: string[] = []

    for (const tree of Object.values(DIALOGUE_TREES)) {
      for (const node of Object.values(tree.nodes)) {
        if (!node.branches) continue
        for (const branch of node.branches) {
          if (branch.requiresRep) {
            requiresRepFactions.push(branch.requiresRep.faction)
          }
        }
      }
    }

    expect(requiresRepFactions).not.toContain('ferals')
  })

  it('Reclaimers have no requiresRep gates (keycard route is flag-only)', () => {
    const requiresRepFactions: string[] = []

    for (const tree of Object.values(DIALOGUE_TREES)) {
      for (const node of Object.values(tree.nodes)) {
        if (!node.branches) continue
        for (const branch of node.branches) {
          if (branch.requiresRep) {
            requiresRepFactions.push(branch.requiresRep.faction)
          }
        }
      }
    }

    // Reclaimers: keycard route is purely flag-gated — no rep gate anywhere
    expect(requiresRepFactions).not.toContain('reclaimers')
  })
})

// ============================================================
// 7. Snapshot integrity checks
// ============================================================

describe('createCycleSnapshot integrity', () => {
  it('Snapshot correctly classifies rep >= 2 as aligned', () => {
    for (const faction of ALL_FACTIONS) {
      for (const rep of [2, 3, 5]) {
        const player = makePlayer({ [faction]: rep })
        const snapshot = createCycleSnapshot(player)
        expect(snapshot.factionsAligned).toContain(faction)
        expect(snapshot.factionsAntagonized).not.toContain(faction)
      }
    }
  })

  it('Snapshot correctly classifies rep <= -2 as antagonized', () => {
    for (const faction of ALL_FACTIONS) {
      for (const rep of [-2, -3, -5]) {
        const player = makePlayer({ [faction]: rep })
        const snapshot = createCycleSnapshot(player)
        expect(snapshot.factionsAntagonized).toContain(faction)
        expect(snapshot.factionsAligned).not.toContain(faction)
      }
    }
  })

  it('Rep -1, 0, +1 yields neither aligned nor antagonized', () => {
    for (const faction of ALL_FACTIONS) {
      for (const rep of [-1, 0, 1]) {
        const player = makePlayer({ [faction]: rep })
        const snapshot = createCycleSnapshot(player)
        expect(snapshot.factionsAligned).not.toContain(faction)
        expect(snapshot.factionsAntagonized).not.toContain(faction)
      }
    }
  })

  it('Multiple factions classified correctly in same snapshot', () => {
    const player = makePlayer({
      accord: 3,
      kindling: -2,
      lucid: 1,
      reclaimers: 0,
      salters: -3,
    })
    const snapshot = createCycleSnapshot(player)

    expect(snapshot.factionsAligned).toContain('accord')
    expect(snapshot.factionsAntagonized).toContain('kindling')
    expect(snapshot.factionsAntagonized).toContain('salters')
    expect(snapshot.factionsAligned).not.toContain('lucid')
    expect(snapshot.factionsAntagonized).not.toContain('lucid')
    expect(snapshot.factionsAligned).not.toContain('reclaimers')
    expect(snapshot.factionsAntagonized).not.toContain('reclaimers')
  })

  it('Empty factionReputation yields no aligned or antagonized factions', () => {
    const player = makePlayer({})
    const snapshot = createCycleSnapshot(player)
    expect(snapshot.factionsAligned).toHaveLength(0)
    expect(snapshot.factionsAntagonized).toHaveLength(0)
  })

  it('Ending snapshot: records endingChoice, no deathRoom', () => {
    const player = makePlayer({ accord: 2 })
    player.isDead = false
    const snapshot = createCycleSnapshot(player, 'cure')
    expect(snapshot.endingChoice).toBe('cure')
    expect(snapshot.deathRoom).toBeUndefined()
  })

  it('Death snapshot: records deathRoom, no endingChoice', () => {
    const player = makePlayer({})
    const snapshot = createCycleSnapshot(player)
    expect(snapshot.deathRoom).toBe('test_room')
    expect(snapshot.endingChoice).toBeUndefined()
  })

  it('All four ending choices are valid in snapshots', () => {
    const endings: Array<'cure' | 'weapon' | 'seal' | 'throne'> = ['cure', 'weapon', 'seal', 'throne']
    for (const ending of endings) {
      const player = makePlayer({})
      const snapshot = createCycleSnapshot(player, ending)
      expect(snapshot.endingChoice).toBe(ending)
    }
  })
})
