#!/usr/bin/env tsx
// scripts/validate-npc-cross-refs.ts
// NPC cross-reference validator for The Remnant MUD.
// Walks every room in data/rooms/*.ts, checks every npcSpawns[].npcId and
// npcSpawns[].dialogueTree against actual exported NPCS and DIALOGUE_TREES keys.
// Also checks static room.npcs[] arrays and detects hard-coded NPC names in
// room descriptions when that NPC has spawnChance < 1.0.
//
// Run via: tsx scripts/validate-npc-cross-refs.ts
// Exit 0 if all checks pass, exit 1 if any findings are reported.

import * as path from 'path'

const ROOT = path.resolve(__dirname, '..')

// ============================================================
// Helpers (same style as validate-consistency.ts)
// ============================================================

function header(title: string) {
  console.log(`\n── ${title} ──`)
}

function pass(msg: string) {
  console.log(`  ✓ ${msg}`)
}

function fail(msg: string) {
  console.log(`  ✗ ${msg}`)
}

// ============================================================
// Check 1: npcSpawns[].npcId → NPCS key coverage
// Every npcId referenced in any room's npcSpawns array must
// exist as a key in the NPCS export from data/npcs.ts.
// ============================================================

async function checkNpcSpawnIds(): Promise<boolean> {
  header('Check 1: npcSpawns[].npcId → NPCS key coverage')

  const { ALL_ROOMS } = await import('../data/rooms/index')
  const { NPCS } = await import('../data/npcs')

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

  if (orphans.length === 0) {
    pass(`All npcSpawns[].npcId values resolve to defined NPCS keys`)
    return true
  } else {
    orphans.forEach(o =>
      fail(`Room '${o.roomId}': npcSpawns npcId '${o.npcId}' is not defined in NPCS`)
    )
    return false
  }
}

// ============================================================
// Check 2: static room.npcs[] → NPCS key coverage
// Every string in room.npcs[] must exist as a key in NPCS.
// ============================================================

async function checkStaticRoomNpcs(): Promise<boolean> {
  header('Check 2: static room.npcs[] → NPCS key coverage')

  const { ALL_ROOMS } = await import('../data/rooms/index')
  const { NPCS } = await import('../data/npcs')

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

  if (orphans.length === 0) {
    pass(`All static room.npcs[] values resolve to defined NPCS keys`)
    return true
  } else {
    orphans.forEach(o =>
      fail(`Room '${o.roomId}': static npcs[] entry '${o.npcId}' is not defined in NPCS`)
    )
    return false
  }
}

// ============================================================
// Check 3: npcSpawns[].dialogueTree → DIALOGUE_TREES key coverage
// Every dialogueTree reference in npcSpawns must exist as a key
// in the DIALOGUE_TREES export from data/dialogueTrees.ts.
// ============================================================

async function checkDialogueTreeRefs(): Promise<boolean> {
  header('Check 3: npcSpawns[].dialogueTree → DIALOGUE_TREES key coverage')

  const { ALL_ROOMS } = await import('../data/rooms/index')
  const { DIALOGUE_TREES } = await import('../data/dialogueTrees')

  const treeIds = new Set(Object.keys(DIALOGUE_TREES))
  const orphans: Array<{ roomId: string; npcId: string; treeId: string }> = []

  for (const room of ALL_ROOMS) {
    if (!room.npcSpawns) continue
    for (const spawn of room.npcSpawns) {
      if (!spawn.dialogueTree) continue
      if (!treeIds.has(spawn.dialogueTree)) {
        orphans.push({ roomId: room.id, npcId: spawn.npcId, treeId: spawn.dialogueTree })
      }
    }
  }

  if (orphans.length === 0) {
    pass(`All npcSpawns[].dialogueTree values resolve to defined DIALOGUE_TREES keys`)
    return true
  } else {
    orphans.forEach(o =>
      fail(
        `Room '${o.roomId}': npcSpawn '${o.npcId}' dialogueTree '${o.treeId}' is not defined in DIALOGUE_TREES`
      )
    )
    return false
  }
}

// ============================================================
// Check 4: Named NPCs with isNamed:true → dialogue tree coverage
// Every NPC with isNamed:true should have at least one entry in
// DIALOGUE_TREES (any key whose tree.npcId matches the NPC id,
// or a key that conventionally matches the NPC).
// Produces a human-readable report — does not fail the build on
// its own since dialogueHealth.test.ts already enforces this in
// the test suite. Reported as informational warnings here.
// ============================================================

async function checkNamedNpcDialogueCoverage(): Promise<boolean> {
  header('Check 4: Named NPCs (isNamed:true) → DIALOGUE_TREES coverage')

  const { NPCS } = await import('../data/npcs')
  const { DIALOGUE_TREES } = await import('../data/dialogueTrees')

  // Build set of npcIds that have at least one dialogue tree
  const coveredNpcIds = new Set<string>()
  for (const tree of Object.values(DIALOGUE_TREES)) {
    if (tree.npcId) {
      coveredNpcIds.add(tree.npcId)
    }
  }

  const namedNpcs = Object.entries(NPCS).filter(([, npc]) => (npc as { isNamed?: boolean }).isNamed)
  const uncovered: string[] = []

  for (const [npcKey, npc] of namedNpcs) {
    const npcId = (npc as { id: string }).id
    // Check coverage by npcId from tree.npcId OR by the NPCS key matching a tree key
    const treesKeys = Object.keys(DIALOGUE_TREES)
    const hasTreeEntry = coveredNpcIds.has(npcId) || treesKeys.some(k => k.includes(npcKey))
    if (!hasTreeEntry) {
      uncovered.push(npcKey)
    }
  }

  if (uncovered.length === 0) {
    pass(`All ${namedNpcs.length} named NPCs have at least one dialogue tree`)
    return true
  } else {
    uncovered.forEach(id =>
      fail(`Named NPC '${id}' (isNamed:true) has no corresponding entry in DIALOGUE_TREES`)
    )
    return false
  }
}

// ============================================================
// Check 5: Room description hard-codes NPC name with spawnChance < 1.0
// If a room's description/shortDescription/descriptionNight etc. contains
// an NPC's .name string verbatim, and that NPC has spawnChance < 1.0 in
// npcSpawns, flag it as a potential hard-code-in-prose error.
// Per LESSONS.md: static descriptions mention an NPC by name when the
// NPC may not be present at runtime.
// ============================================================

async function checkNpcNameHardcodeInProse(): Promise<boolean> {
  header('Check 5: Room prose hard-coding NPC name when spawnChance < 1.0')

  const { ALL_ROOMS } = await import('../data/rooms/index')
  const { NPCS } = await import('../data/npcs')

  type RichNPC = { id: string; name: string; spawnChance: number; isNamed?: boolean }

  // Build a lookup of npcId -> {name, spawnChance}
  const npcLookup: Record<string, RichNPC> = {}
  for (const [key, npc] of Object.entries(NPCS)) {
    npcLookup[key] = npc as RichNPC
  }

  const findings: Array<{ roomId: string; npcId: string; npcName: string; field: string; spawnChance: number }> = []

  for (const room of ALL_ROOMS) {
    if (!room.npcSpawns) continue

    for (const spawn of room.npcSpawns) {
      const npc = npcLookup[spawn.npcId]
      if (!npc) continue
      // Only flag if the NPC is non-guaranteed (spawnChance < 1.0) AND is named
      // (generic ambient NPCs with generic names are less risky)
      if (spawn.spawnChance >= 1.0) continue
      if (!npc.isNamed) continue

      const npcName = npc.name
      // Check all prose fields for exact name match
      const proseFields: Array<[string, string | undefined]> = [
        ['description', room.description],
        ['shortDescription', room.shortDescription],
        ['descriptionNight', room.descriptionNight],
        ['descriptionDawn', room.descriptionDawn],
        ['descriptionDusk', room.descriptionDusk],
      ]

      for (const [fieldName, fieldText] of proseFields) {
        if (!fieldText) continue
        if (fieldText.includes(npcName)) {
          findings.push({
            roomId: room.id,
            npcId: spawn.npcId,
            npcName,
            field: fieldName,
            spawnChance: spawn.spawnChance,
          })
        }
      }
    }
  }

  if (findings.length === 0) {
    pass(`No room descriptions hard-code a named NPC's name when spawnChance < 1.0`)
    return true
  } else {
    findings.forEach(f =>
      fail(
        `Room '${f.roomId}' ${f.field} contains NPC name '${f.npcName}' (npcId: ${f.npcId}) ` +
        `but spawnChance=${f.spawnChance} — NPC may not be present at runtime`
      )
    )
    return false
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('Remnant MUD — NPC Cross-Reference Validation')
  console.log('=============================================')

  const results = await Promise.all([
    checkNpcSpawnIds(),
    checkStaticRoomNpcs(),
    checkDialogueTreeRefs(),
    checkNamedNpcDialogueCoverage(),
    checkNpcNameHardcodeInProse(),
  ])

  const allPassed = results.every(Boolean)

  console.log('\n=============================================')
  if (allPassed) {
    console.log('All NPC cross-reference checks passed.')
    process.exit(0)
  } else {
    const failures = results.filter(r => !r).length
    console.log(`${failures} check(s) failed.`)
    process.exit(1)
  }
}

main().catch(err => {
  console.error('NPC cross-reference validation error:', err)
  process.exit(1)
})
