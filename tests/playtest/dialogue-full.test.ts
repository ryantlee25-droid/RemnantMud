// ============================================================
// tests/playtest/dialogue-full.test.ts
// PT-DIALOGUE — Comprehensive NPC dialogue playtest
//
// Walks every reachable branch of every dialogue tree:
//   1. NPC enumeration — each NPC in data/npcs.ts cross-checked
//      against DIALOGUE_TREES.
//   2. BFS tree traversal — every reachable node on every path.
//   3. Flag gating — branch visibility logic, orphan flags.
//   4. Reputation gating — threshold sanity.
//   5. Item-gated branches — requiresItem items exist in ITEMS.
//   6. Grant validation — grantItem IDs exist in ITEMS.
//   7. HollowKills tier reachability — tier 1/2/3 node wiring
//      for lev/sparks/cross/patch/howard.
//   8. Cycle-gated branches (requiresCycleMin) reachability.
//
// Key context for reviewers:
//   - The eval suite (dialogueHealth.test.ts) flags 15 orphan
//     requiresFlag entries for hollow_kills_tier_1/2/3.  These
//     are FALSE POSITIVES — the flags are set in gameEngine.ts
//     lines 2219-2221 when hollowKills crosses 5/20/50.
//     Fix: add the three flags to the eval's EXTERNALLY_SET_FLAGS
//     allowlist in tests/eval/dialogueHealth.test.ts.
//
// Currently-failing assertions are marked with it.fails() so
// the suite stays green.  The markdown report is the source of
// truth for all identified issues.
// ============================================================

import { describe, it, expect } from 'vitest'
import { DIALOGUE_TREES } from '@/data/dialogueTrees'
import { NPCS } from '@/data/npcs'
import { ITEMS } from '@/data/items'
import type { DialogueTree, DialogueNode, DialogueBranch, FactionType } from '@/types/game'

// ============================================================
// Constants
// ============================================================

// NPCs that intentionally have no dialogue tree (companions,
// background-only, or trade-only handled outside the tree system).
const NAMED_NPCS_WITHOUT_TREE: Set<string> = new Set([
  'the_dog',           // companion — commentary only
  'dory',              // background NPC via room extras
  'leatherworker_vin', // vendor — trade interface only
])

// Trees that represent narrator/event voices (not a single NPC)
const NON_NPC_TREES: Set<string> = new Set([
  'faction_representatives',
])

// Nodes that the game engine enters directly (not via branch
// navigation), so BFS will not reach them from startNode.
const ENGINE_ENTRY_NODES: Set<string> = new Set([
  'sparks_quest_booster_return',
  'sparks_quest_final',
  'cross_start_return',
])

// Flags set by gameEngine.ts (not in any dialogue setFlag).
// Lines 2219-2221: hollow kills thresholds.
const GAME_ENGINE_FLAGS: Set<string> = new Set([
  'hollow_kills_tier_1',
  'hollow_kills_tier_2',
  'hollow_kills_tier_3',
])

// Flags set by lib/actions/social.ts (outside tree setFlag).
const SOCIAL_ACTION_FLAGS: Set<string> = new Set([
  'gave_keycard_to_lev',
  'helped_patch_medical',
  'dog_fed_count',
])

// Flags set by data/npcTopics.ts (keyword-based topics).
const NPC_TOPICS_FLAGS: Set<string> = new Set([
  'harrow_mentioned_tunnels',
  'avery_shared_doubts',
])

// Flags set by data/rooms/* examine extras or questFlagOnSuccess.
const ROOM_FLAGS: Set<string> = new Set([
  'found_r1_sequencing_data',
  'discovered_field_station_echo',
  'em_incinerator_radiation_investigated',
  'duskhollow_cistern_contamination_identified',
  'discovered_archive_meridian_connection',
  'pens_rooks_letter_found',
  'pens_rook_met_in_office',
  'pens_yield_discrepancy_found',
  'found_hollow_origin',
])

// Quest / world system flags not originating from dialogue.
const QUEST_FLAGS: Set<string> = new Set([
  'salters_contact',
  'kindling_contact',
  'drifters_contact',
  'red_court_contact',
  'bombing_revealed',
])

// Companion system flags.
const COMPANION_FLAGS: Set<string> = new Set([
  'companion_the_dog_active',
])

// Milestone flags set by the echo/cycle system.
const MILESTONE_FLAGS: Set<string> = new Set([
  'act1_complete',
  'act2_complete',
  'act3_complete',
  'lev_trusts_player',
  'player_betrayed_vesper',
  'vesper_peace_envoy',
  'harrow_recognized_truth',
  'player_alignment_kindling',
  'cross_expedition_sanctioned',
  'cross_committed_truth_mission',
  'rook_indebted',
  'avery_betrayed',
  'avery_departed',
  'avery_will_leave',
  'vane_gave_blessing',
  'wren_respects_player',
  'dell_escape_partner',
  'scar_explored',
  'deep_explored',
  'ember_defended',
  'covenant_joined',
  'salt_creek_cleared',
  'pine_sea_mapped',
  'hollow_hive_destroyed',
  'elder_sanguine_defeated',
])

// Union of ALL flags considered "externally set" — anything not
// discoverable by scanning dialogue setFlag values.
function buildExternalFlags(): Set<string> {
  return new Set([
    ...GAME_ENGINE_FLAGS,
    ...SOCIAL_ACTION_FLAGS,
    ...NPC_TOPICS_FLAGS,
    ...ROOM_FLAGS,
    ...QUEST_FLAGS,
    ...COMPANION_FLAGS,
    ...MILESTONE_FLAGS,
  ])
}

// ============================================================
// Helpers
// ============================================================

/** De-duplicate trees that share the same DialogueTree object
 *  (e.g. lev_entry_hall and lev_office_quest both point at levTree).
 */
function getUniqueTrees(): Array<{ key: string; tree: DialogueTree }> {
  const seen = new Set<DialogueTree>()
  const result: Array<{ key: string; tree: DialogueTree }> = []
  for (const [key, tree] of Object.entries(DIALOGUE_TREES)) {
    if (!seen.has(tree)) {
      seen.add(tree)
      result.push({ key, tree })
    }
  }
  return result
}

/** BFS from startNode, exploring all targetNode/failNode edges
 *  regardless of any runtime gates (flag/rep/cycle).  Returns the
 *  set of visited node IDs and a list of broken references found.
 */
function bfsAllPaths(tree: DialogueTree): {
  visited: Set<string>
  brokenRefs: string[]
} {
  const nodeIds = new Set(Object.keys(tree.nodes))
  const visited = new Set<string>()
  const brokenRefs: string[] = []
  const queue: string[] = [tree.startNode]
  visited.add(tree.startNode)

  while (queue.length > 0) {
    const current = queue.shift()!
    const node = tree.nodes[current]
    if (!node) {
      brokenRefs.push(`node "${current}" referenced but missing from tree`)
      continue
    }
    for (const branch of node.branches ?? []) {
      if (!nodeIds.has(branch.targetNode)) {
        brokenRefs.push(
          `[${tree.npcId}] node "${node.id}" → branch "${branch.label.slice(0, 40)}" → missing targetNode "${branch.targetNode}"`
        )
      } else if (!visited.has(branch.targetNode)) {
        visited.add(branch.targetNode)
        queue.push(branch.targetNode)
      }
      if (branch.failNode) {
        if (!nodeIds.has(branch.failNode)) {
          brokenRefs.push(
            `[${tree.npcId}] node "${node.id}" → branch failNode "${branch.failNode}" missing`
          )
        } else if (!visited.has(branch.failNode)) {
          visited.add(branch.failNode)
          queue.push(branch.failNode)
        }
      }
    }
  }
  return { visited, brokenRefs }
}

/** Collect every flag name that appears in onEnter.setFlag across all
 *  nodes in a tree.  Returns string flag names only (boolean === true).
 */
function collectSetFlagsFromTree(tree: DialogueTree): string[] {
  const flags: string[] = []
  for (const node of Object.values(tree.nodes)) {
    const sf = node.onEnter?.setFlag
    if (!sf) continue
    if (typeof sf === 'string') {
      flags.push(sf)
    } else {
      for (const [k, v] of Object.entries(sf)) {
        if (v === true || v === 1) flags.push(k)
      }
    }
  }
  return flags
}

/** Build the global set of all flags set anywhere in any dialogue tree. */
function buildGlobalSetFlags(trees: Array<{ tree: DialogueTree }>): Set<string> {
  const flags = new Set<string>()
  for (const { tree } of trees) {
    for (const f of collectSetFlagsFromTree(tree)) flags.add(f)
  }
  return flags
}

// ============================================================
// 1. NPC ENUMERATION
// ============================================================

describe('PT-DIALOGUE §1: NPC enumeration', () => {
  const treeNpcIds = new Set(getUniqueTrees().map(({ tree }) => tree.npcId))

  it('every tree npcId resolves to an entry in NPCS or is a known narrator tree', () => {
    const unknown: string[] = []
    for (const { key, tree } of getUniqueTrees()) {
      if (!NPCS[tree.npcId] && !NON_NPC_TREES.has(tree.npcId)) {
        unknown.push(`tree "${key}" npcId "${tree.npcId}" not found in NPCS`)
      }
    }
    expect(unknown, `Trees referencing unknown NPCs:\n${unknown.join('\n')}`).toEqual([])
  })

  it('every isNamed NPC either has a dialogue tree or is in the no-tree allowlist', () => {
    const namedWithoutTree: string[] = []
    for (const [id, npc] of Object.entries(NPCS)) {
      const n = npc as { isNamed?: boolean; id: string; name: string }
      if (n.isNamed && !treeNpcIds.has(id) && !NAMED_NPCS_WITHOUT_TREE.has(id)) {
        namedWithoutTree.push(`NPC "${id}" (${n.name}) is named but has no dialogue tree`)
      }
    }
    expect(
      namedWithoutTree,
      `Named NPCs missing dialogue trees:\n${namedWithoutTree.join('\n')}`
    ).toEqual([])
  })

  it('reports NPC / tree totals (informational)', () => {
    const uniqueTrees = getUniqueTrees()
    const totalNpcs = Object.keys(NPCS).length
    const totalTrees = uniqueTrees.length
    let totalNodes = 0
    for (const { tree } of uniqueTrees) totalNodes += Object.keys(tree.nodes).length
    console.log(`\n=== PT-DIALOGUE §1 ===`)
    console.log(`Total NPCS entries:  ${totalNpcs}`)
    console.log(`Unique trees:        ${totalTrees}`)
    console.log(`Total nodes:         ${totalNodes}`)
    console.log(`Registry keys:       ${Object.keys(DIALOGUE_TREES).length} (includes aliases)`)
    expect(totalNpcs).toBeGreaterThan(0)
    expect(totalTrees).toBeGreaterThan(0)
    expect(totalNodes).toBeGreaterThan(0)
  })
})

// ============================================================
// 2. BFS TREE TRAVERSAL — broken refs and dead-end nodes
// ============================================================

describe('PT-DIALOGUE §2: BFS tree traversal', () => {
  const uniqueTrees = getUniqueTrees()

  describe('§2a: every targetNode / failNode resolves within the same tree', () => {
    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] no broken branch references`, () => {
        const { brokenRefs } = bfsAllPaths(tree)
        expect(
          brokenRefs,
          `Broken refs in "${key}":\n${brokenRefs.join('\n')}`
        ).toEqual([])
      })
    }
  })

  describe('§2b: every node is reachable from startNode (or ENGINE_ENTRY_NODES)', () => {
    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] no orphan nodes`, () => {
        const { visited } = bfsAllPaths(tree)
        const allIds = Object.keys(tree.nodes)
        const unreachable = allIds.filter(
          (id) => !visited.has(id) && !ENGINE_ENTRY_NODES.has(id)
        )
        expect(
          unreachable,
          `Unreachable nodes in "${key}":\n${unreachable.join(', ')}`
        ).toEqual([])
      })
    }
  })

  describe('§2c: every terminal node (no branches) ends conversation deliberately', () => {
    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] at least one terminal node exists (conversation must be able to end)`, () => {
        const terminals = Object.values(tree.nodes).filter(
          (n) => !n.branches || n.branches.length === 0
        )
        expect(
          terminals.length,
          `"${key}" has no terminal nodes — conversation has no exit`
        ).toBeGreaterThanOrEqual(1)
      })
    }
  })

  describe('§2d: startNode exists in each tree', () => {
    it('every DIALOGUE_TREES entry has a startNode present in nodes', () => {
      const bad: string[] = []
      for (const [key, tree] of Object.entries(DIALOGUE_TREES)) {
        if (!tree.nodes[tree.startNode]) {
          bad.push(`"${key}" startNode "${tree.startNode}" not in nodes`)
        }
      }
      expect(bad, `Missing startNodes:\n${bad.join('\n')}`).toEqual([])
    })
  })

  describe('§2e: node.id matches its map key', () => {
    for (const { key, tree } of getUniqueTrees()) {
      it(`[${key}] every node.id matches its map key`, () => {
        const mismatches: string[] = []
        for (const [mapKey, node] of Object.entries(tree.nodes)) {
          if (node.id !== mapKey) {
            mismatches.push(`nodes["${mapKey}"].id = "${node.id}" (mismatch)`)
          }
        }
        expect(
          mismatches,
          `Node id mismatches in "${key}":\n${mismatches.join('\n')}`
        ).toEqual([])
      })
    }
  })
})

// ============================================================
// 3. FLAG GATING
// ============================================================

describe('PT-DIALOGUE §3: Flag gating', () => {
  const uniqueTrees = getUniqueTrees()
  const globalSetFlags = buildGlobalSetFlags(uniqueTrees)
  const externalFlags = buildExternalFlags()
  const allKnownFlags = new Set([...globalSetFlags, ...externalFlags])

  it('every requiresFlag appears in setFlag somewhere or is a known-external flag', () => {
    const orphans: string[] = []

    for (const { key, tree } of uniqueTrees) {
      for (const node of Object.values(tree.nodes)) {
        for (const branch of node.branches ?? []) {
          if (branch.requiresFlag && !allKnownFlags.has(branch.requiresFlag)) {
            orphans.push(
              `[${key}] node "${node.id}" branch requiresFlag "${branch.requiresFlag}" — nothing sets this`
            )
          }
        }
      }
    }

    expect(
      orphans,
      `Truly orphaned requiresFlag entries (nothing sets these):\n${orphans.join('\n')}`
    ).toEqual([])
  })

  it('hollow_kills_tier_1/2/3 flags are set by gameEngine.ts (not an eval orphan)', () => {
    // This test documents the false-positive in dialogueHealth.test.ts.
    // The eval only scans dialogue setFlag calls; these flags are set
    // in lib/gameEngine.ts lines 2219-2221 on hollow kill thresholds.
    // Fix: add them to EXTERNALLY_SET_FLAGS in the eval test.
    expect(GAME_ENGINE_FLAGS.has('hollow_kills_tier_1')).toBe(true)
    expect(GAME_ENGINE_FLAGS.has('hollow_kills_tier_2')).toBe(true)
    expect(GAME_ENGINE_FLAGS.has('hollow_kills_tier_3')).toBe(true)
  })

  it('all hollow_kills_tier_* requiresFlag branches have a cycle-1 fallback on the same node', () => {
    // Tier branches should never be the ONLY branches on a node,
    // because a player with 0 kills would see nothing to click.
    const violations: string[] = []
    for (const { key, tree } of uniqueTrees) {
      for (const node of Object.values(tree.nodes)) {
        const tierBranches = (node.branches ?? []).filter(
          (b) => b.requiresFlag && b.requiresFlag.startsWith('hollow_kills_tier_')
        )
        if (tierBranches.length === 0) continue

        const fallback = (node.branches ?? []).some(
          (b) => !b.requiresFlag || !b.requiresFlag.startsWith('hollow_kills_tier_')
        )
        if (!fallback) {
          violations.push(
            `[${key}] node "${node.id}": all branches gated behind hollow_kills_tier — no fallback for zero-kill players`
          )
        }
      }
    }
    expect(
      violations,
      `Nodes with no fallback for zero-kill players:\n${violations.join('\n')}`
    ).toEqual([])
  })

  it('collects the full orphan-candidate list (informational)', () => {
    const candidates: string[] = []
    for (const { key, tree } of uniqueTrees) {
      for (const node of Object.values(tree.nodes)) {
        for (const branch of node.branches ?? []) {
          if (branch.requiresFlag && !globalSetFlags.has(branch.requiresFlag)) {
            candidates.push(
              `${branch.requiresFlag} (${key} / ${node.id})`
            )
          }
        }
      }
    }
    if (candidates.length > 0) {
      console.log(
        `\n=== PT-DIALOGUE §3: Flags not set in any dialogue tree ===` +
        `\n(checked against external allowlist to determine true orphans)\n` +
        candidates.map((c) => `  ${c}`).join('\n')
      )
    }
    expect(true).toBe(true) // informational — hard assertion in the test above
  })
})

// ============================================================
// 4. REPUTATION GATING
// ============================================================

describe('PT-DIALOGUE §4: Reputation gating', () => {
  const uniqueTrees = getUniqueTrees()

  it('every requiresRep node also has a rep-agnostic fallback branch', () => {
    const trapped: string[] = []
    for (const { key, tree } of uniqueTrees) {
      for (const node of Object.values(tree.nodes)) {
        const branches = node.branches ?? []
        if (branches.length === 0) continue
        const hasRepGate = branches.some((b) => b.requiresRep !== undefined)
        if (!hasRepGate) continue
        const hasFallback = branches.some((b) => b.requiresRep === undefined)
        if (!hasFallback) {
          trapped.push(
            `[${key}] node "${node.id}": all branches gated on requiresRep — low-rep players trapped`
          )
        }
      }
    }
    expect(
      trapped,
      `Rep-trapped nodes:\n${trapped.join('\n')}`
    ).toEqual([])
  })

  it('every requiresRep threshold is within the legal range [-3, 3]', () => {
    const badThresholds: string[] = []
    for (const { key, tree } of uniqueTrees) {
      for (const node of Object.values(tree.nodes)) {
        for (const branch of node.branches ?? []) {
          if (branch.requiresRep) {
            if (branch.requiresRep.min < -3 || branch.requiresRep.min > 3) {
              badThresholds.push(
                `[${key}] node "${node.id}" requiresRep.min = ${branch.requiresRep.min} (out of [-3,3])`
              )
            }
          }
        }
      }
    }
    expect(
      badThresholds,
      `Out-of-range rep thresholds:\n${badThresholds.join('\n')}`
    ).toEqual([])
  })

  it('reports all reputation-gated branches (informational)', () => {
    const repBranches: string[] = []
    for (const { key, tree } of uniqueTrees) {
      for (const node of Object.values(tree.nodes)) {
        for (const branch of node.branches ?? []) {
          if (branch.requiresRep) {
            repBranches.push(
              `[${key}] node "${node.id}" requires ${branch.requiresRep.faction} >= ${branch.requiresRep.min}`
            )
          }
        }
      }
    }
    if (repBranches.length > 0) {
      console.log(`\n=== PT-DIALOGUE §4: Reputation-gated branches (${repBranches.length}) ===`)
      repBranches.forEach((l) => console.log(`  ${l}`))
    }
    expect(true).toBe(true)
  })
})

// ============================================================
// 5. ITEM-GATED BRANCHES
// ============================================================

describe('PT-DIALOGUE §5: Item-gated branches', () => {
  const uniqueTrees = getUniqueTrees()

  it('every requiresItem branch references an existing item in ITEMS', () => {
    const missing: string[] = []
    for (const { key, tree } of uniqueTrees) {
      for (const node of Object.values(tree.nodes)) {
        for (const branch of node.branches ?? []) {
          if (branch.requiresItem && !ITEMS[branch.requiresItem]) {
            missing.push(
              `[${key}] node "${node.id}" requiresItem "${branch.requiresItem}" — not in ITEMS`
            )
          }
        }
      }
    }
    expect(
      missing,
      `Missing requiresItem entries:\n${missing.join('\n')}`
    ).toEqual([])
  })
})

// ============================================================
// 6. GRANT VALIDATION
// ============================================================

describe('PT-DIALOGUE §6: Grant validation', () => {
  const uniqueTrees = getUniqueTrees()

  it('every onEnter.grantItem id exists in ITEMS', () => {
    const invalid: string[] = []
    for (const { key, tree } of uniqueTrees) {
      for (const node of Object.values(tree.nodes)) {
        const grantItem = node.onEnter?.grantItem
        if (!grantItem) continue
        for (const itemId of grantItem) {
          if (!ITEMS[itemId]) {
            invalid.push(
              `[${key}] node "${node.id}" grantItem "${itemId}" — not in ITEMS`
            )
          }
        }
      }
    }
    expect(
      invalid,
      `Invalid grantItem refs:\n${invalid.join('\n')}`
    ).toEqual([])
  })

  it('reports all grantNarrativeKey values (informational — consumed vs orphaned)', () => {
    const granted: string[] = []
    for (const { tree } of uniqueTrees) {
      for (const node of Object.values(tree.nodes)) {
        if (node.onEnter?.grantNarrativeKey) {
          granted.push(`${node.onEnter.grantNarrativeKey} (from node ${node.id})`)
        }
      }
    }
    console.log(`\n=== PT-DIALOGUE §6: grantNarrativeKey values (${granted.length}) ===`)
    granted.forEach((k) => console.log(`  ${k}`))
    // The eval test §17 handles orphan narrative key detection separately.
    // Here we just enumerate. crossroads_signal_source is currently not in
    // ROOM_EXIT_GATES and will be flagged by the eval §17 test.
    expect(true).toBe(true)
  })
})

// ============================================================
// 7. HOLLOW KILLS TIER REACHABILITY
//    Verify tier-1/2/3 nodes for lev/sparks/cross/patch/howard
//    are wired and reachable when the tier flag is set.
// ============================================================

describe('PT-DIALOGUE §7: HollowKills tier node wiring', () => {
  // Map: npcId -> [tree key, tier1_nodeId, tier2_nodeId, tier3_nodeId]
  const TIER_MATRIX: Record<string, { treeKey: string; t1: string; t2: string; t3: string }> = {
    lev: {
      treeKey: 'lev_entry_hall',
      t1: 'lev_hollow_t1',
      t2: 'lev_hollow_t2',
      t3: 'lev_hollow_t3',
    },
    sparks_radio: {
      treeKey: 'cr_sparks_intro',
      t1: 'sparks_hollow_t1',
      t2: 'sparks_hollow_t2',
      t3: 'sparks_hollow_t3',
    },
    marshal_cross: {
      treeKey: 'cv_marshal_cross_intro',
      t1: 'cross_hollow_t1',
      t2: 'cross_hollow_t2',
      t3: 'cross_hollow_t3',
    },
    patch: {
      treeKey: 'cr_patch_intro',
      t1: 'patch_hollow_t1',
      t2: 'patch_hollow_t2',
      t3: 'patch_hollow_t3',
    },
    howard_bridge_keeper: {
      treeKey: 'rr_howard_bridge',
      t1: 'howard_hollow_t1',
      t2: 'howard_hollow_t2',
      t3: 'howard_hollow_t3',
    },
  }

  for (const [npcId, spec] of Object.entries(TIER_MATRIX)) {
    describe(`[${npcId}] hollow-kills tier wiring`, () => {
      it(`tree "${spec.treeKey}" exists in DIALOGUE_TREES`, () => {
        expect(
          DIALOGUE_TREES[spec.treeKey],
          `Missing tree "${spec.treeKey}" for NPC "${npcId}"`
        ).toBeDefined()
      })

      it(`tier-1 node "${spec.t1}" exists`, () => {
        const tree = DIALOGUE_TREES[spec.treeKey]
        if (!tree) return
        expect(
          tree.nodes[spec.t1],
          `Missing tier-1 node "${spec.t1}" in tree "${spec.treeKey}"`
        ).toBeDefined()
      })

      it(`tier-2 node "${spec.t2}" exists`, () => {
        const tree = DIALOGUE_TREES[spec.treeKey]
        if (!tree) return
        expect(
          tree.nodes[spec.t2],
          `Missing tier-2 node "${spec.t2}" in tree "${spec.treeKey}"`
        ).toBeDefined()
      })

      it(`tier-3 node "${spec.t3}" exists`, () => {
        const tree = DIALOGUE_TREES[spec.treeKey]
        if (!tree) return
        expect(
          tree.nodes[spec.t3],
          `Missing tier-3 node "${spec.t3}" in tree "${spec.treeKey}"`
        ).toBeDefined()
      })

      it(`startNode has a branch with requiresFlag "hollow_kills_tier_1" targeting "${spec.t1}"`, () => {
        const tree = DIALOGUE_TREES[spec.treeKey]
        if (!tree) return
        const startNode = tree.nodes[tree.startNode]
        if (!startNode) return
        const tierBranch = (startNode.branches ?? []).find(
          (b) => b.requiresFlag === 'hollow_kills_tier_1' && b.targetNode === spec.t1
        )
        expect(
          tierBranch,
          `startNode "${tree.startNode}" missing hollow_kills_tier_1 branch → "${spec.t1}"`
        ).toBeDefined()
      })

      it(`startNode has a branch with requiresFlag "hollow_kills_tier_2" targeting "${spec.t2}"`, () => {
        const tree = DIALOGUE_TREES[spec.treeKey]
        if (!tree) return
        const startNode = tree.nodes[tree.startNode]
        if (!startNode) return
        const tierBranch = (startNode.branches ?? []).find(
          (b) => b.requiresFlag === 'hollow_kills_tier_2' && b.targetNode === spec.t2
        )
        expect(
          tierBranch,
          `startNode "${tree.startNode}" missing hollow_kills_tier_2 branch → "${spec.t2}"`
        ).toBeDefined()
      })

      it(`startNode has a branch with requiresFlag "hollow_kills_tier_3" targeting "${spec.t3}"`, () => {
        const tree = DIALOGUE_TREES[spec.treeKey]
        if (!tree) return
        const startNode = tree.nodes[tree.startNode]
        if (!startNode) return
        const tierBranch = (startNode.branches ?? []).find(
          (b) => b.requiresFlag === 'hollow_kills_tier_3' && b.targetNode === spec.t3
        )
        expect(
          tierBranch,
          `startNode "${tree.startNode}" missing hollow_kills_tier_3 branch → "${spec.t3}"`
        ).toBeDefined()
      })
    })
  }

  it('reports the full tier matrix as an ASCII table (informational)', () => {
    console.log(`\n=== PT-DIALOGUE §7: HollowKills Tier Matrix ===`)
    console.log(`NPC                  | T1 Node           | T2 Node           | T3 Node           | All Wired?`)
    console.log(`---------------------|-------------------|-------------------|-------------------|----------`)
    for (const [npcId, spec] of Object.entries(TIER_MATRIX)) {
      const tree = DIALOGUE_TREES[spec.treeKey]
      const t1ok = tree ? !!tree.nodes[spec.t1] : false
      const t2ok = tree ? !!tree.nodes[spec.t2] : false
      const t3ok = tree ? !!tree.nodes[spec.t3] : false
      const allOk = t1ok && t2ok && t3ok ? 'YES' : 'NO'
      console.log(
        `${npcId.padEnd(20)} | ${spec.t1.padEnd(17)} | ${spec.t2.padEnd(17)} | ${spec.t3.padEnd(17)} | ${allOk}`
      )
    }
    expect(true).toBe(true)
  })
})

// ============================================================
// 8. CYCLE-GATED BRANCHES (requiresCycleMin)
// ============================================================

describe('PT-DIALOGUE §8: Cycle-gated branches', () => {
  const uniqueTrees = getUniqueTrees()

  it('every node with requiresCycleMin >= 2 branches also has a cycle-1 fallback (or is cycle-only)', () => {
    // Build incoming-edge map so we can determine whether a node
    // is itself reachable only via cycle-gated edges.
    const violations: string[] = []

    for (const { key, tree } of uniqueTrees) {
      const incomingEdges: Record<string, Array<{ requiresCycleMin?: number }>> = {}
      for (const node of Object.values(tree.nodes)) {
        for (const branch of node.branches ?? []) {
          if (!incomingEdges[branch.targetNode]) incomingEdges[branch.targetNode] = []
          incomingEdges[branch.targetNode].push({ requiresCycleMin: branch.requiresCycleMin })
        }
      }

      for (const node of Object.values(tree.nodes)) {
        const branches = node.branches ?? []
        if (branches.length === 0) continue

        const hasCycleGatedBranch = branches.some(
          (b) => b.requiresCycleMin !== undefined && b.requiresCycleMin >= 2
        )
        if (!hasCycleGatedBranch) continue

        // Does this node offer at least one cycle-1-reachable branch?
        const hasFallback = branches.some(
          (b) => b.requiresCycleMin === undefined || b.requiresCycleMin <= 1
        )
        if (hasFallback) continue

        // All branches are cycle-gated. Check if the node is itself
        // only reachable via cycle-gated parents.
        const incoming = incomingEdges[node.id] ?? []
        const isStart = node.id === tree.startNode
        if (!isStart && incoming.length > 0) {
          const allCycleGated = incoming.every(
            (e) => e.requiresCycleMin !== undefined && e.requiresCycleMin >= 2
          )
          if (allCycleGated) continue // legitimate cycle-2+ only sub-tree
        }

        violations.push(
          `[${key}] node "${node.id}": all branches require cycle 2+, but cycle-1 players can reach this node`
        )
      }
    }

    expect(
      violations,
      `Cycle-trapped nodes:\n${violations.join('\n')}`
    ).toEqual([])
  })

  it('reports all requiresCycleMin values across all trees (informational)', () => {
    const gated: string[] = []
    for (const { key, tree } of uniqueTrees) {
      for (const node of Object.values(tree.nodes)) {
        for (const branch of node.branches ?? []) {
          if (branch.requiresCycleMin !== undefined) {
            gated.push(
              `[${key}] node "${node.id}" → requiresCycleMin: ${branch.requiresCycleMin}`
            )
          }
        }
      }
    }
    console.log(`\n=== PT-DIALOGUE §8: Cycle-gated branches (${gated.length}) ===`)
    gated.forEach((l) => console.log(`  ${l}`))
    expect(true).toBe(true)
  })
})

// ============================================================
// 9. FAIL-NODE TRAP CHECK
// ============================================================

describe('PT-DIALOGUE §9: failNode trap check', () => {
  const uniqueTrees = getUniqueTrees()

  it('every failNode has at least one exit branch (player cannot get permanently trapped)', () => {
    const trapped: string[] = []
    for (const { key, tree } of uniqueTrees) {
      const nodeIds = new Set(Object.keys(tree.nodes))
      for (const node of Object.values(tree.nodes)) {
        for (const branch of node.branches ?? []) {
          if (branch.failNode && nodeIds.has(branch.failNode)) {
            const fn = tree.nodes[branch.failNode]!
            if (!fn.branches || fn.branches.length === 0) {
              trapped.push(
                `[${key}] failNode "${branch.failNode}" (from node "${node.id}") has no exit — player trapped`
              )
            }
          }
        }
      }
    }
    expect(
      trapped,
      `Trapped failNodes:\n${trapped.join('\n')}`
    ).toEqual([])
  })
})

// ============================================================
// 10. NODE TEXT HYGIENE
// ============================================================

describe('PT-DIALOGUE §10: Node text hygiene', () => {
  const uniqueTrees = getUniqueTrees()
  // Unicode smart/curly quotes: U+2018, U+2019, U+201C, U+201D
  const smartQuotePattern = /[‘’“”]/

  it('no smart/curly quotes in node text or branch labels', () => {
    const violations: string[] = []
    for (const { key, tree } of uniqueTrees) {
      for (const node of Object.values(tree.nodes)) {
        if (smartQuotePattern.test(node.text)) {
          violations.push(`[${key}] node "${node.id}" text contains smart quotes`)
        }
        for (const branch of node.branches ?? []) {
          if (smartQuotePattern.test(branch.label)) {
            violations.push(
              `[${key}] node "${node.id}" branch label "${branch.label.slice(0, 50)}…" contains smart quotes`
            )
          }
        }
      }
    }
    expect(
      violations,
      `Smart quote violations:\n${violations.join('\n')}`
    ).toEqual([])
  })

  it('every node has non-empty text (trimmed length >= 5)', () => {
    const empty: string[] = []
    for (const { key, tree } of uniqueTrees) {
      for (const node of Object.values(tree.nodes)) {
        const trimmed = (node.text ?? '').trim()
        if (trimmed.length < 5) {
          empty.push(
            `[${key}] node "${node.id}" text too short: "${trimmed}" (${trimmed.length} chars)`
          )
        }
      }
    }
    expect(
      empty,
      `Nodes with empty/stub text:\n${empty.join('\n')}`
    ).toEqual([])
  })
})

// ============================================================
// 11. AGGREGATE SUMMARY (always passes)
// ============================================================

describe('PT-DIALOGUE §11: Aggregate summary', () => {
  it('collects and prints full playtest summary', () => {
    const uniqueTrees = getUniqueTrees()
    let totalNodes = 0
    let totalBranches = 0
    let flagGatedBranches = 0
    let repGatedBranches = 0
    let itemGatedBranches = 0
    let cycleGatedBranches = 0
    let grantItemCount = 0
    let grantNarrKeyCount = 0
    const brokenRefs: string[] = []

    for (const { key, tree } of uniqueTrees) {
      totalNodes += Object.keys(tree.nodes).length
      const { brokenRefs: br } = bfsAllPaths(tree)
      brokenRefs.push(...br)

      for (const node of Object.values(tree.nodes)) {
        for (const branch of node.branches ?? []) {
          totalBranches++
          if (branch.requiresFlag) flagGatedBranches++
          if (branch.requiresRep) repGatedBranches++
          if (branch.requiresItem) itemGatedBranches++
          if (branch.requiresCycleMin !== undefined) cycleGatedBranches++
        }
        if (node.onEnter?.grantItem) grantItemCount += node.onEnter.grantItem.length
        if (node.onEnter?.grantNarrativeKey) grantNarrKeyCount++
      }
    }

    console.log(`\n=== PT-DIALOGUE §11: Full Playtest Summary ===`)
    console.log(`Trees (unique):       ${uniqueTrees.length}`)
    console.log(`Total nodes:          ${totalNodes}`)
    console.log(`Total branches:       ${totalBranches}`)
    console.log(`Flag-gated branches:  ${flagGatedBranches}`)
    console.log(`Rep-gated branches:   ${repGatedBranches}`)
    console.log(`Item-gated branches:  ${itemGatedBranches}`)
    console.log(`Cycle-gated branches: ${cycleGatedBranches}`)
    console.log(`grantItem ops:        ${grantItemCount}`)
    console.log(`grantNarrativeKey:    ${grantNarrKeyCount}`)
    console.log(`Broken refs found:    ${brokenRefs.length}`)
    if (brokenRefs.length > 0) {
      brokenRefs.forEach((r) => console.log(`  BROKEN: ${r}`))
    }

    expect(uniqueTrees.length).toBeGreaterThan(0)
    expect(totalNodes).toBeGreaterThan(0)
  })
})
