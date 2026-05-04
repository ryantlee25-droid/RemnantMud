// ============================================================
// tests/eval/dialogueHealth.test.ts
// Static health analysis for all dialogue trees.
// Checks orphan targetNodes, unreachable nodes, broken
// faction/skill/flag references, and smart-quote hygiene.
//
// P2-B additions (2026-05-03):
//   - Section 18: runtime NPC-ID cross-ref sweep (npcSpawns[].npcId)
//   - Section 19: runtime dialogueTree cross-ref sweep — documents
//       known missing trees via it.fails(). Per PLAN-EVAL.md P2-B,
//       these are KNOWN FAILURES, not silenced. The snapshot at the
//       bottom of this file records the exact missing set.
//   - Section 20: named NPC tree coverage with known-gap snapshot
// ============================================================

import { describe, it, expect } from 'vitest'
import { DIALOGUE_TREES } from '@/data/dialogueTrees'
import { NPCS } from '@/data/npcs'
import { ITEMS } from '@/data/items'
import { ALL_ROOMS } from '@/data/rooms/index'
import { ROOM_EXIT_GATES } from '@/lib/narrativeKeys'
import type { DialogueTree, DialogueNode, FactionType, SkillType } from '@/types/game'

// ============================================================
// Constants — closed sets from types/game.ts
// ============================================================

const VALID_FACTIONS: Set<FactionType> = new Set([
  'accord',
  'salters',
  'drifters',
  'kindling',
  'reclaimers',
  'covenant_of_dusk',
  'red_court',
  'ferals',
  'lucid',
])

const VALID_SKILLS: Set<SkillType> = new Set([
  'survival',
  'marksmanship',
  'brawling',
  'bladework',
  'scavenging',
  'field_medicine',
  'mechanics',
  'tracking',
  'negotiation',
  'intimidation',
  'stealth',
  'lockpicking',
  'electronics',
  'lore',
  'climbing',
  'blood_sense',
  'daystalking',
  'mesmerize',
  'perception',
  'endurance',
  'resilience',
  'composure',
  'vigor',
  'presence',
])

// Nodes entered directly by the game engine (not via branch navigation).
// These are legitimate unreachable-via-BFS but reachable at runtime when the
// engine calls into them (e.g., on item-return, quest-complete, revisit).
const ENGINE_ENTRY_NODES: Set<string> = new Set([
  'sparks_quest_booster_return',  // entered on return with crafted signal booster
  'sparks_quest_final',           // entered on quest completion
  'cross_start_return',           // entered on return after first meeting
])

// Trees that don't correspond to a single NPC — narrator voice / event dialogues.
const NON_NPC_TREES: Set<string> = new Set([
  'faction_representatives',  // act1 climax narrator tree
])

// Named NPCs that intentionally don't have a dialogue tree (companions,
// extras-only vendors, etc.). Conversation handled outside the dialogue system.
const NAMED_NPCS_WITHOUT_TREE: Set<string> = new Set([
  'the_dog',            // companion — commentary, no conversation
  'dory',               // background NPC handled via room extras
  'leatherworker_vin',  // vendor — trade interface only
])

// Milestone flags considered "known-set" by the echo system — never orphaned
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

// Flags set by rooms, quests, and npcTopics (verified by grepping the codebase)
const EXTERNALLY_SET_FLAGS: Set<string> = new Set([
  // Rooms
  'found_r1_sequencing_data',          // data/rooms/the_stacks.ts
  'discovered_field_station_echo',     // data/rooms/the_stacks.ts
  'em_incinerator_radiation_investigated', // data/rooms/the_ember.ts
  'duskhollow_cistern_contamination_identified', // data/rooms/duskhollow.ts
  'discovered_archive_meridian_connection', // data/rooms/the_deep.ts
  'pens_rooks_letter_found',           // data/rooms/the_pens.ts
  'pens_rook_met_in_office',           // data/rooms/the_pens.ts
  'pens_yield_discrepancy_found',      // data/rooms/the_pens.ts — Rook's ledger extra (Perception DC 12)
  // npcTopics.ts
  'harrow_mentioned_tunnels',          // data/npcTopics.ts setsFlag
  'bombing_revealed',                  // referenced in npcTopics.ts requiresFlag
  // Quest flags
  'salters_contact',                   // world/quest system
  'kindling_contact',                  // world/quest system
  'drifters_contact',                  // world/quest system
  'red_court_contact',                 // world/quest system
  // Companion system flags (set by lib/companionSystem.ts / addCompanion for the_dog)
  'companion_the_dog_active',          // set when addCompanion fires for the_dog — see tests/integration/dogAdoption.test.ts
  // hollowKills tier flags (set by lib/gameEngine.ts:2219-2221 when hollowKills reaches 5/20/50)
  'hollow_kills_tier_1',               // set at 5 hollow kills
  'hollow_kills_tier_2',               // set at 20 hollow kills
  'hollow_kills_tier_3',               // set at 50 hollow kills
])

// ============================================================
// Helpers
// ============================================================

/**
 * Returns all unique trees (deduplicating alias entries that point to the
 * same DialogueTree object via reference equality).
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

/**
 * Collect all setFlag values from a node's onEnter.
 * Returns a flat array of string keys that are set to true.
 */
function collectSetFlags(node: DialogueNode): string[] {
  const flags: string[] = []
  if (!node.onEnter?.setFlag) return flags
  const sf = node.onEnter.setFlag
  if (typeof sf === 'string') {
    flags.push(sf)
  } else {
    for (const [k, v] of Object.entries(sf)) {
      if (v === true) flags.push(k)
    }
  }
  return flags
}

/**
 * Build the set of all flags that are required (requiresFlag) across
 * all branches in a tree.
 */
function collectRequiredFlags(tree: DialogueTree): string[] {
  const required: string[] = []
  for (const node of Object.values(tree.nodes)) {
    for (const branch of node.branches ?? []) {
      if (branch.requiresFlag) required.push(branch.requiresFlag)
    }
  }
  return required
}

/**
 * Build the set of all flags set anywhere in a collection of trees.
 */
function buildGlobalSetFlags(trees: Array<{ tree: DialogueTree }>): Set<string> {
  const flags = new Set<string>()
  for (const { tree } of trees) {
    for (const node of Object.values(tree.nodes)) {
      for (const f of collectSetFlags(node)) flags.add(f)
    }
  }
  return flags
}

// ============================================================
// Test Suite
// ============================================================

describe('Dialogue Tree Health — exhaustive static analysis', () => {
  const uniqueTrees = getUniqueTrees()

  // ── 1. No orphan targetNodes ──────────────────────────────
  describe('1. No orphan targetNodes', () => {
    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] every targetNode resolves within the same tree`, () => {
        const nodeIds = new Set(Object.keys(tree.nodes))
        const orphans: string[] = []

        for (const node of Object.values(tree.nodes)) {
          for (const branch of node.branches ?? []) {
            if (!nodeIds.has(branch.targetNode)) {
              orphans.push(`branch in node "${node.id}" → missing targetNode "${branch.targetNode}"`)
            }
            if (branch.failNode && !nodeIds.has(branch.failNode)) {
              orphans.push(`branch in node "${node.id}" → missing failNode "${branch.failNode}"`)
            }
          }
        }

        expect(orphans, `Orphan targetNodes in tree "${key}":\n${orphans.join('\n')}`).toEqual([])
      })
    }
  })

  // ── 2. No unreachable nodes ───────────────────────────────
  describe('2. No unreachable nodes (every non-root node has an incoming edge)', () => {
    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] all non-start nodes are reachable from startNode`, () => {
        const startNode = tree.startNode
        const nodeIds = new Set(Object.keys(tree.nodes))

        // Build incoming edge count
        const reachable = new Set<string>()
        reachable.add(startNode)

        // Walk via BFS
        const queue = [startNode]
        while (queue.length > 0) {
          const current = queue.shift()!
          const node = tree.nodes[current]
          if (!node) continue
          for (const branch of node.branches ?? []) {
            if (!reachable.has(branch.targetNode)) {
              reachable.add(branch.targetNode)
              queue.push(branch.targetNode)
            }
            if (branch.failNode && !reachable.has(branch.failNode)) {
              reachable.add(branch.failNode)
              queue.push(branch.failNode)
            }
          }
        }

        const unreachable = [...nodeIds]
          .filter((id) => !reachable.has(id))
          .filter((id) => !ENGINE_ENTRY_NODES.has(id))
        expect(
          unreachable,
          `Unreachable nodes in tree "${key}":\n${unreachable.join(', ')}`
        ).toEqual([])
      })
    }
  })

  // ── 3. Terminal dead-ends ─────────────────────────────────
  // A terminal node (no branches) is valid — the framework treats it as
  // conversation end. We flag any node that is *not* terminal but also
  // *not* the startNode without any branches AND has no incoming edge from
  // any exit-intent branch label pattern. We only warn — this is informational.
  describe('3. Terminal nodes are intentional (no branches means conversation ends)', () => {
    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] terminal nodes have no branches (informational)`, () => {
        const terminals: string[] = []
        for (const node of Object.values(tree.nodes)) {
          if (!node.branches || node.branches.length === 0) {
            terminals.push(node.id)
          }
        }
        // The test passes regardless — this just documents them.
        // A tree with zero terminals would be unusual (infinite loop risk).
        // A tree with too many terminals is suspicious but not a hard error.
        // We assert that at least one terminal exists per tree.
        expect(terminals.length).toBeGreaterThanOrEqual(1)
      })
    }
  })

  // ── 4. Valid faction refs ─────────────────────────────────
  describe('4. Valid faction references', () => {
    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] grantRep and requiresRep reference valid FactionType values`, () => {
        const badFactions: string[] = []

        for (const node of Object.values(tree.nodes)) {
          if (node.onEnter?.grantRep) {
            const faction = node.onEnter.grantRep.faction
            if (!VALID_FACTIONS.has(faction)) {
              badFactions.push(`node "${node.id}" grantRep.faction "${faction}" is invalid`)
            }
          }
          for (const branch of node.branches ?? []) {
            if (branch.requiresRep) {
              const faction = branch.requiresRep.faction
              if (!VALID_FACTIONS.has(faction)) {
                badFactions.push(
                  `node "${node.id}" branch requiresRep.faction "${faction}" is invalid`
                )
              }
            }
          }
        }

        expect(badFactions, `Bad faction refs in "${key}":\n${badFactions.join('\n')}`).toEqual([])
      })
    }
  })

  // ── 5. Valid skill refs ───────────────────────────────────
  describe('5. Valid skill references', () => {
    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] skillCheck.skill references valid SkillType values`, () => {
        const badSkills: string[] = []

        for (const node of Object.values(tree.nodes)) {
          for (const branch of node.branches ?? []) {
            if (branch.skillCheck) {
              const skill = branch.skillCheck.skill
              if (!VALID_SKILLS.has(skill)) {
                badSkills.push(`node "${node.id}" branch skillCheck.skill "${skill}" is invalid`)
              }
            }
          }
        }

        expect(badSkills, `Bad skill refs in "${key}":\n${badSkills.join('\n')}`).toEqual([])
      })
    }
  })

  // ── 6. Flag round-trip ────────────────────────────────────
  describe('6. Flag round-trip — required flags are set somewhere', () => {
    it('every requiresFlag appears in setFlag or is a known-set external flag', () => {
      const allSetFlags = buildGlobalSetFlags(uniqueTrees)
      // Merge with milestone and external flags
      const knownFlags = new Set([...allSetFlags, ...MILESTONE_FLAGS, ...EXTERNALLY_SET_FLAGS])

      const orphanedRequires: string[] = []

      for (const { key, tree } of uniqueTrees) {
        const required = collectRequiredFlags(tree)
        for (const flag of required) {
          if (!knownFlags.has(flag)) {
            orphanedRequires.push(`[${key}] requiresFlag "${flag}" — not set anywhere`)
          }
        }
      }

      expect(
        orphanedRequires,
        `Orphaned requiresFlag entries (nothing sets these):\n${orphanedRequires.join('\n')}`
      ).toEqual([])
    })
  })

  // ── 7. No smart quotes ────────────────────────────────────
  describe('7. No smart quotes in dialogue text or branch labels', () => {
    // Match actual Unicode smart/curly quotes: U+2018, U+2019, U+201C, U+201D
    const smartQuotePattern = /[‘’“”]/

    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] no curly/smart quotes in node text or branch labels`, () => {
        const violations: string[] = []

        for (const node of Object.values(tree.nodes)) {
          if (smartQuotePattern.test(node.text)) {
            violations.push(`node "${node.id}" text contains smart quotes`)
          }
          for (const branch of node.branches ?? []) {
            if (smartQuotePattern.test(branch.label)) {
              violations.push(`node "${node.id}" branch label "${branch.label.slice(0, 60)}…" contains smart quotes`)
            }
          }
        }

        expect(violations, `Smart quotes in "${key}":\n${violations.join('\n')}`).toEqual([])
      })
    }
  })

  // ── 8. NPC cross-reference ────────────────────────────────
  describe('8. NPC cross-reference — tree NPCs exist in data/npcs.ts', () => {
    it('every tree npcId resolves to an entry in NPCS (or is a known narrator/event tree)', () => {
      const missingNpcs: string[] = []

      for (const { key, tree } of uniqueTrees) {
        if (!NPCS[tree.npcId] && !NON_NPC_TREES.has(tree.npcId)) {
          missingNpcs.push(`tree "${key}" npcId "${tree.npcId}" not found in NPCS`)
        }
      }

      expect(
        missingNpcs,
        `Trees referencing unknown NPCs:\n${missingNpcs.join('\n')}`
      ).toEqual([])
    })

    it('every named NPC (isNamed: true) has a dialogue tree or is in the no-tree allowlist', () => {
      const treeNpcIds = new Set(uniqueTrees.map(({ tree }) => tree.npcId))
      const namedWithoutTree: string[] = []

      for (const [id, npc] of Object.entries(NPCS)) {
        // Cast to access isNamed — NPCS extends NPC which has isNamed
        const n = npc as { isNamed?: boolean; id: string; name: string }
        if (n.isNamed && !treeNpcIds.has(id) && !NAMED_NPCS_WITHOUT_TREE.has(id)) {
          namedWithoutTree.push(`NPC "${id}" (${n.name}) isNamed:true but has no dialogue tree`)
        }
      }

      expect(
        namedWithoutTree,
        `Named NPCs missing dialogue trees:\n${namedWithoutTree.join('\n')}`
      ).toEqual([])
    })
  })

  // ── 9. startNode exists ───────────────────────────────────
  describe('9. startNode exists in each tree', () => {
    it('every DIALOGUE_TREES entry has a startNode that resolves in its node map', () => {
      const badTrees: string[] = []

      for (const [key, tree] of Object.entries(DIALOGUE_TREES)) {
        if (!tree.nodes[tree.startNode]) {
          badTrees.push(`tree "${key}" startNode "${tree.startNode}" not in nodes`)
        }
      }

      expect(badTrees, `Trees with missing startNode:\n${badTrees.join('\n')}`).toEqual([])
    })
  })

  // ── 10. Node id consistency ───────────────────────────────
  describe('10. Node id matches its map key', () => {
    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] every node.id matches its key in nodes map`, () => {
        const mismatches: string[] = []

        for (const [mapKey, node] of Object.entries(tree.nodes)) {
          if (node.id !== mapKey) {
            mismatches.push(`nodes["${mapKey}"].id = "${node.id}" (mismatch)`)
          }
        }

        expect(mismatches, `Node id mismatches in "${key}":\n${mismatches.join('\n')}`).toEqual([])
      })
    }
  })

  // ── 11. No zero-branch non-terminal nodes in error paths ─
  // Skill-check fail nodes that have no branches trap the player.
  describe('11. failNodes have at least one exit branch', () => {
    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] every failNode has branches (player can exit skill-fail states)`, () => {
        const trappedFailNodes: string[] = []
        const nodeIds = new Set(Object.keys(tree.nodes))

        for (const node of Object.values(tree.nodes)) {
          for (const branch of node.branches ?? []) {
            if (branch.failNode && nodeIds.has(branch.failNode)) {
              const failNodeObj = tree.nodes[branch.failNode]
              if (!failNodeObj.branches || failNodeObj.branches.length === 0) {
                trappedFailNodes.push(
                  `failNode "${branch.failNode}" (from node "${node.id}") has no exit branches — player trapped`
                )
              }
            }
          }
        }

        expect(
          trappedFailNodes,
          `Trapped failNodes in "${key}":\n${trappedFailNodes.join('\n')}`
        ).toEqual([])
      })
    }
  })

  // ── 12. Summary — aggregate stats ────────────────────────
  describe('12. Aggregate stats (informational)', () => {
    it('reports node count, tree count, and npcId distribution', () => {
      let totalNodes = 0
      let totalTrees = 0

      for (const { tree } of uniqueTrees) {
        totalNodes += Object.keys(tree.nodes).length
        totalTrees++
      }

      // Not a hard assertion — records the numbers in the test output.
      console.log(`\n=== Dialogue Health Stats ===`)
      console.log(`Unique trees: ${totalTrees}`)
      console.log(`Total nodes:  ${totalNodes}`)
      console.log(`Registry keys: ${Object.keys(DIALOGUE_TREES).length} (includes aliases)`)

      expect(totalTrees).toBeGreaterThanOrEqual(15)
      expect(totalNodes).toBeGreaterThanOrEqual(150)
    })
  })

  // ── 13. Cycle-gated branches have a non-cycle-1 fallback ──
  //
  // If a node has at least one branch with requiresCycleMin >= 2,
  // at least one OTHER branch on that same node must have no
  // requiresCycleMin OR requiresCycleMin <= 1.
  //
  // Exception: if every branch on the node is cycle-gated AND the
  // node itself is only reachable from a parent that is also cycle-gated
  // (meaning cycle-1 players can never reach it), the node passes.
  // We detect this by checking whether every incoming edge in the tree
  // carries requiresCycleMin >= 2.
  describe('13. Cycle-gated branches have a non-cycle-1 fallback', () => {
    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] every node with cycle-2+ branches also has a cycle-1 fallback (or is itself cycle-gated)`, () => {
        // Build an incoming-edges map: nodeId -> list of branches pointing to it
        const incomingEdges: Record<string, Array<{ fromNodeId: string; requiresCycleMin?: number }>> = {}
        for (const node of Object.values(tree.nodes)) {
          for (const branch of node.branches ?? []) {
            if (!incomingEdges[branch.targetNode]) incomingEdges[branch.targetNode] = []
            incomingEdges[branch.targetNode].push({
              fromNodeId: node.id,
              requiresCycleMin: branch.requiresCycleMin,
            })
          }
        }

        const violations: string[] = []

        for (const node of Object.values(tree.nodes)) {
          const branches = node.branches ?? []
          if (branches.length === 0) continue

          // Check if this node has any branch with requiresCycleMin >= 2
          const hasCycleGatedBranch = branches.some(
            (b) => b.requiresCycleMin !== undefined && b.requiresCycleMin >= 2
          )
          if (!hasCycleGatedBranch) continue

          // Does it have at least one branch without a cycle gate (or cycle 1)?
          const hasFallback = branches.some(
            (b) => b.requiresCycleMin === undefined || b.requiresCycleMin <= 1
          )
          if (hasFallback) continue

          // ALL branches are cycle-gated. Check if the node itself is only
          // reachable from cycle-gated parents (so cycle-1 players never reach it).
          const incoming = incomingEdges[node.id] ?? []
          const isStartNode = node.id === tree.startNode
          if (!isStartNode && incoming.length > 0) {
            const allIncomingCycleGated = incoming.every(
              (e) => e.requiresCycleMin !== undefined && e.requiresCycleMin >= 2
            )
            if (allIncomingCycleGated) continue // legitimate cycle-2+ only vignette
          }

          violations.push(
            `node "${node.id}" has all branches requiring cycle 2+, and cycle-1 players can reach it`
          )
        }

        expect(
          violations,
          `Cycle-trapped nodes in "${key}":\n${violations.join('\n')}`
        ).toEqual([])
      })
    }
  })

  // ── 14. Faction-gated branches have a fallback ────────────
  //
  // If a node has at least one branch with requiresRep (faction rep gate),
  // at least one OTHER branch on that same node must have no requiresRep
  // so that players with low/no faction rep can still progress.
  describe('14. Faction-gated branches have a rep-agnostic fallback', () => {
    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] every node with requiresRep branches also has a branch without requiresRep`, () => {
        const violations: string[] = []

        for (const node of Object.values(tree.nodes)) {
          const branches = node.branches ?? []
          if (branches.length === 0) continue

          const hasFactionGatedBranch = branches.some((b) => b.requiresRep !== undefined)
          if (!hasFactionGatedBranch) continue

          // Must have at least one branch without requiresRep
          const hasFallback = branches.some((b) => b.requiresRep === undefined)
          if (!hasFallback) {
            violations.push(
              `node "${node.id}" has all branches gated behind requiresRep — no fallback for low-rep players`
            )
          }
        }

        expect(
          violations,
          `Rep-trapped nodes in "${key}":\n${violations.join('\n')}`
        ).toEqual([])
      })
    }
  })

  // ── 15. onEnter.grantItem references valid item IDs ───────
  //
  // Every item ID listed in onEnter.grantItem must exist as a
  // key in ITEMS from data/items.ts. A missing item silently
  // swallows the grant at runtime.
  describe('15. onEnter.grantItem references valid item IDs', () => {
    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] every grantItem id exists in ITEMS`, () => {
        const invalidGrants: string[] = []

        for (const node of Object.values(tree.nodes)) {
          const grantItem = node.onEnter?.grantItem
          if (!grantItem) continue
          for (const itemId of grantItem) {
            if (!ITEMS[itemId]) {
              invalidGrants.push(
                `node "${node.id}" onEnter.grantItem "${itemId}" — not found in ITEMS`
              )
            }
          }
        }

        expect(
          invalidGrants,
          `Invalid grantItem refs in "${key}":\n${invalidGrants.join('\n')}`
        ).toEqual([])
      })
    }
  })

  // ── 16. No empty or near-empty node text ──────────────────
  //
  // Every node's primary text field must trim() to at least 5
  // characters. Placeholder nodes with '' or '...' indicate
  // authoring left-behind and will display as blank in-game.
  describe('16. Node text must be non-empty (>= 5 chars trimmed)', () => {
    for (const { key, tree } of uniqueTrees) {
      it(`[${key}] every node has meaningful text (trimmed length >= 5)`, () => {
        const emptyNodes: string[] = []

        for (const node of Object.values(tree.nodes)) {
          const trimmed = (node.text ?? '').trim()
          if (trimmed.length < 5) {
            emptyNodes.push(
              `node "${node.id}" text is too short (trimmed: "${trimmed}", length: ${trimmed.length})`
            )
          }
        }

        expect(
          emptyNodes,
          `Nodes with insufficient text in "${key}":\n${emptyNodes.join('\n')}`
        ).toEqual([])
      })
    }
  })

  // ── 17. Orphan narrative keys (INFORMATIONAL — does not fail) ──
  //
  // Collects all grantNarrativeKey values across all trees.
  // Checks which of those granted keys have no consumer
  // (no entry in ROOM_EXIT_GATES, no requiresNarrativeKey in
  // room extras, no dialogue branch gate using that key).
  //
  // This is informational only: we warn via console.warn but
  // the test always passes. Orphaned keys = authored content
  // never hooked up to any gate.
  describe('17. Orphan narrative keys (informational)', () => {
    it('warns about granted narrative keys with no known consumer (non-failing)', () => {
      // Collect all keys granted by dialogue
      const grantedKeys = new Set<string>()
      for (const { tree } of uniqueTrees) {
        for (const node of Object.values(tree.nodes)) {
          if (node.onEnter?.grantNarrativeKey) {
            grantedKeys.add(node.onEnter.grantNarrativeKey)
          }
        }
      }

      // Build set of consumed keys: keys that appear in ROOM_EXIT_GATES
      const consumedKeys = new Set<string>()
      for (const gate of Object.values(ROOM_EXIT_GATES)) {
        consumedKeys.add(gate.keyId)
        // Also check allOf arrays if present
        if (gate.allOf) {
          for (const k of gate.allOf) consumedKeys.add(k)
        }
      }

      // Warn on any granted key that has no consumer
      const orphans: string[] = []
      for (const key of grantedKeys) {
        if (!consumedKeys.has(key)) {
          orphans.push(key)
        }
      }

      if (orphans.length > 0) {
        console.warn(
          `\n=== Category 17: Orphan Narrative Keys ===\n` +
          `The following keys are granted via grantNarrativeKey in dialogue\n` +
          `but have no consumer in ROOM_EXIT_GATES:\n` +
          orphans.map((k) => `  - ${k}`).join('\n') + '\n'
        )
      } else {
        console.log('\n=== Category 17: No orphan narrative keys found ===')
      }

      // Always pass — informational only
      expect(true).toBe(true)
    })
  })

  // ── 18. Runtime NPC-ID cross-ref sweep (P2-B) ────────────────
  //
  // Every npcId referenced in any room's npcSpawns array must
  // exist as a key in NPCS. This is a runtime-equivalent check
  // that catches typos and stale references that static analysis
  // cannot find by walking dialogue trees alone.
  //
  // Per PLAN-EVAL.md §Coverage Matrix: "Runtime NPC-ID sweep
  // missing (known from LESSONS.md)".
  //
  // Expected result: PASSES (all 106 room-referenced NPC IDs
  // resolve to defined NPCS entries per the PLAN-EVAL.md inventory).
  describe('18. Runtime NPC-ID cross-ref sweep (P2-B)', () => {
    it('every npcSpawns[].npcId in ALL_ROOMS resolves to a defined NPCS entry', () => {
      const npcIds = new Set(Object.keys(NPCS))
      const orphans: Array<{ roomId: string; npcId: string }> = []

      for (const room of ALL_ROOMS) {
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!npcIds.has(spawn.npcId)) {
            orphans.push({ roomId: room.id, npcId: spawn.npcId })
          }
        }
      }

      expect(
        orphans.map(o => `Room '${o.roomId}': npcId '${o.npcId}' not in NPCS`),
        `Undefined NPC IDs in npcSpawns — fix these before next convoy:\n` +
        orphans.map(o => `  ${o.roomId}: ${o.npcId}`).join('\n')
      ).toHaveLength(0)
    })

    // Known gap: 3 NPCs in static room.npcs[] are not yet in NPCS data file.
    // These are documented as known failures. Add to NPCS when authoring.
    // Known missing: pens_intake_orderly, pens_donor_long_term, pens_donor_ward_b
    it.fails(
      'every static room.npcs[] entry in ALL_ROOMS resolves to a defined NPCS key (known gap: 3 pens NPCs)',
      () => {
        const npcIds = new Set(Object.keys(NPCS))
        const orphans: Array<{ roomId: string; npcId: string }> = []

        for (const room of ALL_ROOMS) {
          if (!room.npcs || room.npcs.length === 0) continue
          for (const npcId of room.npcs) {
            if (!npcIds.has(npcId)) {
              orphans.push({ roomId: room.id, npcId })
            }
          }
        }

        expect(
          orphans.map(o => `Room '${o.roomId}': static npcs[] '${o.npcId}' not in NPCS`),
          `Undefined NPC IDs in static room.npcs[]:\n` +
          orphans.map(o => `  ${o.roomId}: ${o.npcId}`).join('\n')
        ).toHaveLength(0)
      }
    )

    // Snapshot of the known missing static npcs[] set
    it('missing static room.npcs[] entries match known snapshot (run vitest -u to update)', () => {
      const npcIds = new Set(Object.keys(NPCS))
      const orphans: Array<string> = []

      for (const room of ALL_ROOMS) {
        if (!room.npcs || room.npcs.length === 0) continue
        for (const npcId of room.npcs) {
          if (!npcIds.has(npcId) && !orphans.includes(npcId)) {
            orphans.push(npcId)
          }
        }
      }

      orphans.sort()
      expect(orphans).toMatchSnapshot()
    })

    it('documents all npcSpawn dialogue tree IDs referenced across ALL_ROOMS (audit log)', () => {
      // Collect every unique dialogueTree value referenced in npcSpawns
      const allReferencedTrees = new Set<string>()
      for (const room of ALL_ROOMS) {
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (spawn.dialogueTree) {
            allReferencedTrees.add(spawn.dialogueTree)
          }
        }
      }

      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const missingTrees = [...allReferencedTrees]
        .filter(id => !definedTrees.has(id))
        .sort()

      // Log summary for test output visibility
      console.log(
        `\n=== Category 18 Audit ===\n` +
        `Room-referenced dialogue trees: ${allReferencedTrees.size}\n` +
        `Defined DIALOGUE_TREES keys: ${definedTrees.size}\n` +
        `Missing trees: ${missingTrees.length}\n`
      )

      // This test always passes — it's the audit log. The it.fails tests
      // in section 19 enforce the actual known-failure contracts.
      expect(allReferencedTrees.size).toBeGreaterThan(0)
    })
  })

  // ── 19. dialogueTree cross-ref sweep — known failures (P2-B) ─
  //
  // Every npcSpawns[].dialogueTree value must exist as a key in
  // DIALOGUE_TREES. Currently 78 trees are referenced in rooms
  // but not yet authored. These are DOCUMENTED known failures,
  // not silenced ones.
  //
  // Pattern: it.fails() — these tests are EXPECTED to fail.
  // When a tree is authored and added to DIALOGUE_TREES, remove
  // its corresponding it.fails() entry.
  //
  // Per PLAN-EVAL.md P2-B: "Expect dialogue health failures —
  // there are 78 missing dialogue trees ... Your test should
  // DOCUMENT these as known failures (e.g., it.fails(...) or
  // expect(...).toMatchSnapshot() with the orphan list as the
  // snapshot), not be silenced."
  describe('19. dialogueTree cross-ref sweep — known missing trees (P2-B)', () => {
    // This master test passes when ALL room-referenced trees exist.
    // Currently expected to fail due to ~78 missing trees.
    // When all trees are authored, this becomes the passing gate.
    it.fails(
      'all npcSpawns[].dialogueTree values in ALL_ROOMS resolve to DIALOGUE_TREES keys (master gate)',
      () => {
        const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
        const orphans: Array<{ roomId: string; npcId: string; treeId: string }> = []

        for (const room of ALL_ROOMS) {
          if (!room.npcSpawns) continue
          for (const spawn of room.npcSpawns) {
            if (!spawn.dialogueTree) continue
            if (!definedTrees.has(spawn.dialogueTree)) {
              orphans.push({ roomId: room.id, npcId: spawn.npcId, treeId: spawn.dialogueTree })
            }
          }
        }

        expect(
          orphans,
          `Missing DIALOGUE_TREES entries (${orphans.length} total):\n` +
          orphans.map(o => `  ${o.treeId} (room ${o.roomId}, npc ${o.npcId})`).join('\n')
        ).toHaveLength(0)
      }
    )

    // ── Snapshot of the known missing tree set ──────────────────
    // This snapshot records the exact set of missing dialogue trees
    // as of 2026-05-03. When new trees are authored, update this
    // snapshot with: vitest -u (or remove entries from the list).
    it('missing dialogue tree set matches known snapshot (run vitest -u to update)', () => {
      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const missingTrees: string[] = []

      for (const room of ALL_ROOMS) {
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!spawn.dialogueTree) continue
          if (!definedTrees.has(spawn.dialogueTree) && !missingTrees.includes(spawn.dialogueTree)) {
            missingTrees.push(spawn.dialogueTree)
          }
        }
      }

      missingTrees.sort()

      expect(missingTrees).toMatchSnapshot()
    })

    // ── Per-zone breakdown — each zone's missing trees ──────────
    // Individual it.fails() per zone so authors can track progress
    // zone by zone. Remove the it.fails() wrapper when the zone is
    // complete (all its referenced trees authored).

    it.fails('crossroads zone: all dialogueTrees resolve (known gap)', () => {
      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const orphans: string[] = []
      for (const room of ALL_ROOMS) {
        if (room.zone !== 'crossroads') continue
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!spawn.dialogueTree) continue
          if (!definedTrees.has(spawn.dialogueTree) && !orphans.includes(spawn.dialogueTree)) {
            orphans.push(spawn.dialogueTree)
          }
        }
      }
      expect(orphans, `Crossroads missing trees: ${orphans.join(', ')}`).toHaveLength(0)
    })

    it.fails('river_road zone: all dialogueTrees resolve (known gap)', () => {
      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const orphans: string[] = []
      for (const room of ALL_ROOMS) {
        if (room.zone !== 'river_road') continue
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!spawn.dialogueTree) continue
          if (!definedTrees.has(spawn.dialogueTree) && !orphans.includes(spawn.dialogueTree)) {
            orphans.push(spawn.dialogueTree)
          }
        }
      }
      expect(orphans, `River Road missing trees: ${orphans.join(', ')}`).toHaveLength(0)
    })

    it.fails('covenant zone: all dialogueTrees resolve (known gap)', () => {
      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const orphans: string[] = []
      for (const room of ALL_ROOMS) {
        if (room.zone !== 'covenant') continue
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!spawn.dialogueTree) continue
          if (!definedTrees.has(spawn.dialogueTree) && !orphans.includes(spawn.dialogueTree)) {
            orphans.push(spawn.dialogueTree)
          }
        }
      }
      expect(orphans, `Covenant missing trees: ${orphans.join(', ')}`).toHaveLength(0)
    })

    it.fails('salt_creek zone: all dialogueTrees resolve (known gap)', () => {
      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const orphans: string[] = []
      for (const room of ALL_ROOMS) {
        if (room.zone !== 'salt_creek') continue
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!spawn.dialogueTree) continue
          if (!definedTrees.has(spawn.dialogueTree) && !orphans.includes(spawn.dialogueTree)) {
            orphans.push(spawn.dialogueTree)
          }
        }
      }
      expect(orphans, `Salt Creek missing trees: ${orphans.join(', ')}`).toHaveLength(0)
    })

    it.fails('the_ember zone: all dialogueTrees resolve (known gap)', () => {
      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const orphans: string[] = []
      for (const room of ALL_ROOMS) {
        if (room.zone !== 'the_ember') continue
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!spawn.dialogueTree) continue
          if (!definedTrees.has(spawn.dialogueTree) && !orphans.includes(spawn.dialogueTree)) {
            orphans.push(spawn.dialogueTree)
          }
        }
      }
      expect(orphans, `The Ember missing trees: ${orphans.join(', ')}`).toHaveLength(0)
    })

    it.fails('the_breaks zone: all dialogueTrees resolve (known gap)', () => {
      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const orphans: string[] = []
      for (const room of ALL_ROOMS) {
        if (room.zone !== 'the_breaks') continue
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!spawn.dialogueTree) continue
          if (!definedTrees.has(spawn.dialogueTree) && !orphans.includes(spawn.dialogueTree)) {
            orphans.push(spawn.dialogueTree)
          }
        }
      }
      expect(orphans, `The Breaks missing trees: ${orphans.join(', ')}`).toHaveLength(0)
    })

    it.fails('duskhollow zone: all dialogueTrees resolve (known gap)', () => {
      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const orphans: string[] = []
      for (const room of ALL_ROOMS) {
        if (room.zone !== 'duskhollow') continue
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!spawn.dialogueTree) continue
          if (!definedTrees.has(spawn.dialogueTree) && !orphans.includes(spawn.dialogueTree)) {
            orphans.push(spawn.dialogueTree)
          }
        }
      }
      expect(orphans, `Duskhollow missing trees: ${orphans.join(', ')}`).toHaveLength(0)
    })

    it.fails('the_deep zone: all dialogueTrees resolve (known gap)', () => {
      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const orphans: string[] = []
      for (const room of ALL_ROOMS) {
        if (room.zone !== 'the_deep') continue
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!spawn.dialogueTree) continue
          if (!definedTrees.has(spawn.dialogueTree) && !orphans.includes(spawn.dialogueTree)) {
            orphans.push(spawn.dialogueTree)
          }
        }
      }
      expect(orphans, `The Deep missing trees: ${orphans.join(', ')}`).toHaveLength(0)
    })

    it.fails('the_pine_sea zone: all dialogueTrees resolve (known gap)', () => {
      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const orphans: string[] = []
      for (const room of ALL_ROOMS) {
        if (room.zone !== 'the_pine_sea') continue
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!spawn.dialogueTree) continue
          if (!definedTrees.has(spawn.dialogueTree) && !orphans.includes(spawn.dialogueTree)) {
            orphans.push(spawn.dialogueTree)
          }
        }
      }
      expect(orphans, `The Pine Sea missing trees: ${orphans.join(', ')}`).toHaveLength(0)
    })

    // The Pens: all referenced dialogue trees ARE authored — this zone is complete.
    it('the_pens zone: all dialogueTrees resolve (COMPLETE — no missing trees)', () => {
      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const orphans: string[] = []
      for (const room of ALL_ROOMS) {
        if (room.zone !== 'the_pens') continue
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!spawn.dialogueTree) continue
          if (!definedTrees.has(spawn.dialogueTree) && !orphans.includes(spawn.dialogueTree)) {
            orphans.push(spawn.dialogueTree)
          }
        }
      }
      expect(orphans, `The Pens missing trees: ${orphans.join(', ')}`).toHaveLength(0)
    })

    it.fails('the_scar zone: all dialogueTrees resolve (known gap)', () => {
      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const orphans: string[] = []
      for (const room of ALL_ROOMS) {
        if (room.zone !== 'the_scar') continue
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!spawn.dialogueTree) continue
          if (!definedTrees.has(spawn.dialogueTree) && !orphans.includes(spawn.dialogueTree)) {
            orphans.push(spawn.dialogueTree)
          }
        }
      }
      expect(orphans, `The Scar missing trees: ${orphans.join(', ')}`).toHaveLength(0)
    })

    // The Stacks: room files (the_stacks.ts) reference only lev_entry_hall / lev_office_quest.
    // If no missing trees, this is a passing test.
    it('the_stacks zone: all dialogueTrees resolve (COMPLETE — only Lev trees referenced)', () => {
      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const orphans: string[] = []
      for (const room of ALL_ROOMS) {
        if (room.zone !== 'the_stacks') continue
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!spawn.dialogueTree) continue
          if (!definedTrees.has(spawn.dialogueTree) && !orphans.includes(spawn.dialogueTree)) {
            orphans.push(spawn.dialogueTree)
          }
        }
      }
      expect(orphans, `The Stacks missing trees: ${orphans.join(', ')}`).toHaveLength(0)
    })

    // The Dust: if no npcSpawns with dialogueTrees, this passes trivially.
    it('the_dust zone: all dialogueTrees resolve (informational)', () => {
      const definedTrees = new Set(Object.keys(DIALOGUE_TREES))
      const orphans: string[] = []
      for (const room of ALL_ROOMS) {
        if (room.zone !== 'the_dust') continue
        if (!room.npcSpawns) continue
        for (const spawn of room.npcSpawns) {
          if (!spawn.dialogueTree) continue
          if (!definedTrees.has(spawn.dialogueTree) && !orphans.includes(spawn.dialogueTree)) {
            orphans.push(spawn.dialogueTree)
          }
        }
      }
      expect(orphans, `The Dust missing trees: ${orphans.join(', ')}`).toHaveLength(0)
    })
  })

  // ── 20. Named NPC dialogue tree coverage (P2-B) ──────────────
  //
  // Every NPC with isNamed:true should have at least one entry in
  // DIALOGUE_TREES where tree.npcId matches the NPC's id.
  //
  // Known allowlist (intentionally no tree):
  //   - the_dog: companion — commentary only, no conversation
  //   - dory: background NPC via room extras
  //   - leatherworker_vin: vendor — trade interface only
  //
  // These three are in NAMED_NPCS_WITHOUT_TREE above (section 8)
  // and remain passing. Any NEW named NPC without a tree appears
  // here as a known failure until its tree is authored.
  describe('20. Named NPC dialogue tree coverage — known gaps documented (P2-B)', () => {
    // This master test passes only when ALL named NPCs (minus the
    // explicit allowlist) have dialogue trees. Currently expected
    // to fail for any named NPC added since the initial authoring.
    it('named NPC tree coverage matches known snapshot (run vitest -u to update)', () => {
      const treeNpcIds = new Set(uniqueTrees.map(({ tree }) => tree.npcId))
      const missingNamedNpcs: string[] = []

      for (const [id, npc] of Object.entries(NPCS)) {
        const n = npc as { isNamed?: boolean; id: string; name: string }
        if (n.isNamed && !treeNpcIds.has(id) && !NAMED_NPCS_WITHOUT_TREE.has(id)) {
          missingNamedNpcs.push(`${id} (${n.name})`)
        }
      }

      missingNamedNpcs.sort()

      // Snapshot so failures are visible in PR diffs
      expect(missingNamedNpcs).toMatchSnapshot()
    })

    it('counts and logs all named NPCs and their tree coverage status', () => {
      const treeNpcIds = new Set(uniqueTrees.map(({ tree }) => tree.npcId))
      const namedNpcs = Object.entries(NPCS).filter(
        ([, npc]) => (npc as { isNamed?: boolean }).isNamed
      )

      const covered = namedNpcs.filter(([id]) => treeNpcIds.has(id)).length
      const allowlisted = namedNpcs.filter(([id]) => NAMED_NPCS_WITHOUT_TREE.has(id)).length
      const missing = namedNpcs.filter(
        ([id]) => !treeNpcIds.has(id) && !NAMED_NPCS_WITHOUT_TREE.has(id)
      ).length

      console.log(
        `\n=== Category 20: Named NPC Dialogue Coverage ===\n` +
        `Total named NPCs: ${namedNpcs.length}\n` +
        `With dialogue tree: ${covered}\n` +
        `Allowlisted (no tree intentionally): ${allowlisted}\n` +
        `Missing trees (known gap): ${missing}\n`
      )

      // Informational — always passes. The snapshot test above enforces the gap set.
      expect(namedNpcs.length).toBeGreaterThan(0)
    })
  })
})
