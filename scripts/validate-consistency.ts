#!/usr/bin/env tsx
// scripts/validate-consistency.ts
// Automated consistency validation for The Remnant MUD.
// Run via: pnpm run validate
// Exit 0 if all checks pass, exit 1 if any fail.

import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '..')

// ============================================================
// Helpers
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
// Check 1: Save field → migration column coverage
// Parses _savePlayer() payload keys from gameEngine.ts and
// cross-references them against all players table column
// definitions across every migration SQL file.
// ============================================================

function checkSaveFields(): boolean {
  header('Check 1: Save field → migration column coverage')

  // --- Extract save payload keys from gameEngine.ts ---
  const enginePath = path.join(ROOT, 'lib', 'gameEngine.ts')
  const engineSrc = fs.readFileSync(enginePath, 'utf-8')

  // Find the payload object literal inside _savePlayer()
  const payloadMatch = engineSrc.match(/const payload = \{([\s\S]*?)\n\s{4}\}/)
  if (!payloadMatch) {
    fail('Could not locate `const payload = {` block in _savePlayer()')
    return false
  }

  const payloadBlock = payloadMatch[1]
  // Extract snake_case keys (left-hand side of key: value lines)
  const keyPattern = /^\s+(\w+):/gm
  const saveFields: string[] = []
  let m: RegExpExecArray | null
  while ((m = keyPattern.exec(payloadBlock)) !== null) {
    saveFields.push(m[1])
  }

  if (saveFields.length === 0) {
    fail('No fields found in _savePlayer() payload')
    return false
  }

  // --- Extract column names from migration SQL files ---
  const migrationsDir = path.join(ROOT, 'supabase', 'migrations')
  const sqlFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  const migratedColumns = new Set<string>()

  for (const sqlFile of sqlFiles) {
    const sql = fs.readFileSync(path.join(migrationsDir, sqlFile), 'utf-8')

    // CREATE TABLE players ( ... column_name type ... )
    const createTableMatch = sql.match(/create table if not exists players\s*\(([\s\S]*?)\);/i)
    if (createTableMatch) {
      const colPattern = /^\s+(\w+)\s+\w/gm
      let cm: RegExpExecArray | null
      while ((cm = colPattern.exec(createTableMatch[1])) !== null) {
        migratedColumns.add(cm[1])
      }
    }

    // ALTER TABLE players ... ADD COLUMN [IF NOT EXISTS] col_name type
    // Handles both single-line and multi-line ALTER TABLE blocks
    const alterPattern = /add column\s+(?:if not exists\s+)?(\w+)\s/gi
    let am: RegExpExecArray | null
    while ((am = alterPattern.exec(sql)) !== null) {
      migratedColumns.add(am[1])
    }
  }

  // --- Compare ---
  const missing = saveFields.filter(f => !migratedColumns.has(f))

  if (missing.length === 0) {
    pass(`All ${saveFields.length} save fields have matching migration columns`)
    return true
  } else {
    missing.forEach(f => fail(`Save field '${f}' has no matching migration column`))
    return false
  }
}

// ============================================================
// Check 2: Room exit integrity
// Every exit target must point to a room ID that exists.
// ============================================================

async function checkRoomExits(): Promise<boolean> {
  header('Check 2: Room exit integrity')

  // Dynamically import via tsx so TS path aliases resolve
  const { ALL_ROOMS } = await import('../data/rooms/index')

  const roomIds = new Set(ALL_ROOMS.map((r: { id: string }) => r.id))
  const broken: string[] = []

  for (const room of ALL_ROOMS) {
    if (!room.exits) continue
    for (const [direction, target] of Object.entries(room.exits)) {
      if (!target) continue  // null exits are intentional dead ends
      if (!roomIds.has(target as string)) {
        broken.push(`Room '${room.id}' exit '${direction}' → unknown room '${target}'`)
      }
    }
  }

  if (broken.length === 0) {
    pass(`All exits across ${ALL_ROOMS.length} rooms resolve to valid room IDs`)
    return true
  } else {
    broken.forEach(b => fail(b))
    return false
  }
}

// ============================================================
// Check 3: NPC topic key coverage
// Every key in NPC_TOPICS must match an NPC ID in NPCS.
// Known aliases (topic key → actual NPC id) are documented here.
// ============================================================

async function checkNpcTopics(): Promise<boolean> {
  header('Check 3: NPC topic key coverage')

  const { NPC_TOPICS } = await import('../data/npcTopics')
  const { NPCS } = await import('../data/npcs')

  // Known aliases: topic key → actual NPC id in NPCS
  const KNOWN_ALIASES: Record<string, string> = {
    avery_kindling:   'kindling_doubter_avery',
    accord_soldier:   'accord_militia',
    salter_guard:     'salters_soldier',
  }

  const npcIds = new Set(Object.keys(NPCS))
  const topicKeys = Object.keys(NPC_TOPICS)
  const unmatched: string[] = []

  for (const key of topicKeys) {
    if (npcIds.has(key)) continue
    if (KNOWN_ALIASES[key] && npcIds.has(KNOWN_ALIASES[key])) continue
    unmatched.push(key)
  }

  if (unmatched.length === 0) {
    pass(`All ${topicKeys.length} NPC topic keys resolve to a known NPC ID`)
    return true
  } else {
    unmatched.forEach(k =>
      fail(`Topic key '${k}' does not match any NPC ID (add to KNOWN_ALIASES if intentional alias)`)
    )
    return false
  }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('Remnant MUD — Consistency Validation')
  console.log('=====================================')

  const results = await Promise.all([
    Promise.resolve(checkSaveFields()),
    checkRoomExits(),
    checkNpcTopics(),
  ])

  const allPassed = results.every(Boolean)

  console.log('\n=====================================')
  if (allPassed) {
    console.log('All checks passed.')
    process.exit(0)
  } else {
    const failures = results.filter(r => !r).length
    console.log(`${failures} check(s) failed.`)
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Validation script error:', err)
  process.exit(1)
})
