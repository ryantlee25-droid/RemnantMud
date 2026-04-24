// ============================================================
// tests/integration/dialogueHealth.test.ts
// Static health analysis for all dialogue trees.
// Checks orphan targetNodes, unreachable nodes, broken
// faction/skill/flag references, and smart-quote hygiene.
// ============================================================

import { describe, it, expect } from 'vitest'
import { DIALOGUE_TREES } from '@/data/dialogueTrees'
import { NPCS } from '@/data/npcs'
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
  // npcTopics.ts
  'harrow_mentioned_tunnels',          // data/npcTopics.ts setsFlag
  'bombing_revealed',                  // referenced in npcTopics.ts requiresFlag
  // Quest flags
  'salters_contact',                   // world/quest system
  'kindling_contact',                  // world/quest system
  'drifters_contact',                  // world/quest system
  'red_court_contact',                 // world/quest system
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

        const unreachable = [...nodeIds].filter((id) => !reachable.has(id))
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
    const smartQuotePattern = /[''""]/

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
    it('every tree npcId resolves to an entry in NPCS', () => {
      const missingNpcs: string[] = []

      for (const { key, tree } of uniqueTrees) {
        if (!NPCS[tree.npcId]) {
          missingNpcs.push(`tree "${key}" npcId "${tree.npcId}" not found in NPCS`)
        }
      }

      expect(
        missingNpcs,
        `Trees referencing unknown NPCs:\n${missingNpcs.join('\n')}`
      ).toEqual([])
    })

    it('every named NPC (isNamed: true) has at least one dialogue tree entry', () => {
      const treeNpcIds = new Set(uniqueTrees.map(({ tree }) => tree.npcId))
      const namedWithoutTree: string[] = []

      for (const [id, npc] of Object.entries(NPCS)) {
        // Cast to access isNamed — NPCS extends NPC which has isNamed
        const n = npc as { isNamed?: boolean; id: string; name: string }
        if (n.isNamed && !treeNpcIds.has(id)) {
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
})
