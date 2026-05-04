#!/usr/bin/env tsx
// scripts/validate-schema-drift.ts
// Schema-drift detector for The Remnant MUD.
//
// Four-way cross-reference:
//   1. Migration columns  — canonical truth; derived by walking supabase/migrations/*.sql in order
//   2. _savePlayer() keys — fields written to DB on every game tick
//   3. loadPlayer() cols  — fields read from DB on session start
//   4. supabaseMock tables — in-memory mock tables registered in freshTables()
//
// Exits 0 on perfect parity, 1 on any drift.
//
// Two prior production outages were caused by _savePlayer() writing columns that had no matching
// migration (active_buffs, narrative_progress). This script operationalises CLAUDE.md Critical
// Rule #1 as a static check.

import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '..')
const WORKTREE_ROOT = ROOT  // same thing — script lives in scripts/ one level below root

// ============================================================
// Output helpers (same style as validate-consistency.ts)
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

function warn(msg: string) {
  console.log(`  ⚠ ${msg}`)
}

function info(msg: string) {
  console.log(`  · ${msg}`)
}

// ============================================================
// Step 1: Walk migrations to derive canonical schema
// Returns per-table column sets and the set of extant tables.
// ============================================================

interface MigrationSchema {
  /** Per-table column sets, reflecting all CREATE/ALTER ADD/DROP in migration order */
  tableColumns: Map<string, Set<string>>
  /** Tables that exist after all migrations (created but never fully dropped) */
  extantTables: Set<string>
}

function deriveMigrationSchema(): MigrationSchema {
  const migrationsDir = path.join(WORKTREE_ROOT, 'supabase', 'migrations')
  const sqlFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()  // chronological order by filename

  const tableColumns = new Map<string, Set<string>>()
  const extantTables = new Set<string>()

  for (const sqlFile of sqlFiles) {
    const sqlPath = path.join(migrationsDir, sqlFile)
    const sql = fs.readFileSync(sqlPath, 'utf-8')
    // Normalise: collapse newlines and extra whitespace within lines to simplify matching
    const normalised = sql.replace(/\r\n/g, '\n')

    // --- CREATE TABLE ---
    // Matches: CREATE TABLE [IF NOT EXISTS] <tableName> ( ... );
    // Uses a greedy match to capture the full column block.
    const createTableRe = /create\s+table\s+(?:if\s+not\s+exists\s+)?(\w+)\s*\(([\s\S]*?)\);/gi
    let ctMatch: RegExpExecArray | null
    while ((ctMatch = createTableRe.exec(normalised)) !== null) {
      const tableName = ctMatch[1].toLowerCase()
      const block = ctMatch[2]

      // Skip internal Postgres objects (auth.users, etc.)
      if (tableName.includes('.')) continue

      if (!tableColumns.has(tableName)) {
        tableColumns.set(tableName, new Set<string>())
      }
      extantTables.add(tableName)

      const cols = tableColumns.get(tableName)!
      // Each column definition starts with an identifier followed by a type keyword.
      // Constraint-only lines start with CONSTRAINT, PRIMARY, UNIQUE, CHECK, FOREIGN — skip them.
      const colLineRe = /^\s+(\w+)\s+\w/gm
      let colMatch: RegExpExecArray | null
      while ((colMatch = colLineRe.exec(block)) !== null) {
        const colName = colMatch[1].toLowerCase()
        // Skip constraint keywords that can appear as identifiers
        const SKIP = new Set(['constraint', 'primary', 'unique', 'check', 'foreign', 'not'])
        if (!SKIP.has(colName)) {
          cols.add(colName)
        }
      }
    }

    // --- DROP TABLE ---
    // Matches: DROP TABLE [IF EXISTS] <tableName>
    const dropTableRe = /drop\s+table\s+(?:if\s+exists\s+)?(\w+)/gi
    let dtMatch: RegExpExecArray | null
    while ((dtMatch = dropTableRe.exec(normalised)) !== null) {
      const tableName = dtMatch[1].toLowerCase()
      extantTables.delete(tableName)
      tableColumns.delete(tableName)
    }

    // --- ALTER TABLE ... ADD COLUMN [IF NOT EXISTS] col type ---
    // Handles both single-column and multi-column ADD COLUMN statements.
    const addColRe = /add\s+column\s+(?:if\s+not\s+exists\s+)?(\w+)\s+\w/gi
    // We need to know which table the ALTER TABLE refers to.
    // Walk the file line-by-line to associate ADD COLUMN with the right table.
    const alterTableRe = /alter\s+table\s+(?:if\s+exists\s+)?(\w+)/gi
    // Reset lastIndex before walking
    alterTableRe.lastIndex = 0

    // Collect all ALTER TABLE positions and their target tables
    const alterPositions: Array<{ pos: number; table: string }> = []
    let atMatch: RegExpExecArray | null
    while ((atMatch = alterTableRe.exec(normalised)) !== null) {
      alterPositions.push({ pos: atMatch.index, table: atMatch[1].toLowerCase() })
    }

    // For each ADD COLUMN, find the nearest ALTER TABLE that precedes it
    addColRe.lastIndex = 0
    let acMatch: RegExpExecArray | null
    while ((acMatch = addColRe.exec(normalised)) !== null) {
      const colName = acMatch[1].toLowerCase()
      const colPos = acMatch.index

      // Find the last ALTER TABLE that appears before this ADD COLUMN
      let owningTable: string | null = null
      for (const ap of alterPositions) {
        if (ap.pos < colPos) {
          owningTable = ap.table
        }
      }

      if (owningTable) {
        if (!tableColumns.has(owningTable)) {
          tableColumns.set(owningTable, new Set<string>())
        }
        tableColumns.get(owningTable)!.add(colName)
      }
    }

    // --- ALTER TABLE ... DROP COLUMN [IF EXISTS] col ---
    const dropColRe = /drop\s+column\s+(?:if\s+exists\s+)?(\w+)/gi
    dropColRe.lastIndex = 0
    let dcMatch: RegExpExecArray | null
    while ((dcMatch = dropColRe.exec(normalised)) !== null) {
      const colName = dcMatch[1].toLowerCase()
      const colPos = dcMatch.index

      // Find the last ALTER TABLE that appears before this DROP COLUMN
      let owningTable: string | null = null
      for (const ap of alterPositions) {
        if (ap.pos < colPos) {
          owningTable = ap.table
        }
      }

      if (owningTable && tableColumns.has(owningTable)) {
        tableColumns.get(owningTable)!.delete(colName)
      }
    }

    // --- ALTER TABLE ... RENAME COLUMN old TO new ---
    // Handles squirrel-related rename: dog_trust -> squirrel_trust
    const renameColRe = /rename\s+column\s+(\w+)\s+to\s+(\w+)/gi
    renameColRe.lastIndex = 0
    let rcMatch: RegExpExecArray | null
    while ((rcMatch = renameColRe.exec(normalised)) !== null) {
      const oldCol = rcMatch[1].toLowerCase()
      const newCol = rcMatch[2].toLowerCase()
      const rcPos = rcMatch.index

      let owningTable: string | null = null
      for (const ap of alterPositions) {
        if (ap.pos < rcPos) {
          owningTable = ap.table
        }
      }

      if (owningTable && tableColumns.has(owningTable)) {
        const cols = tableColumns.get(owningTable)!
        if (cols.has(oldCol)) {
          cols.delete(oldCol)
          cols.add(newCol)
        }
      }
    }
  }

  return { tableColumns, extantTables }
}

// ============================================================
// Step 2: Extract _savePlayer() payload keys from gameEngine.ts
// ============================================================

function extractSavePlayerKeys(): string[] {
  const enginePath = path.join(WORKTREE_ROOT, 'lib', 'gameEngine.ts')
  const src = fs.readFileSync(enginePath, 'utf-8')

  // Find `const payload = {` block inside _savePlayer().
  // The regex matches from `const payload = {` to the closing `}` on its own line
  // (4 spaces indent + closing brace), same pattern as validate-consistency.ts.
  const payloadMatch = src.match(/const payload = \{([\s\S]*?)\n\s{4}\}/)
  if (!payloadMatch) {
    throw new Error('Could not locate `const payload = {` block in _savePlayer()')
  }

  const payloadBlock = payloadMatch[1]
  const keyPattern = /^\s+(\w+):/gm
  const keys: string[] = []
  let m: RegExpExecArray | null
  while ((m = keyPattern.exec(payloadBlock)) !== null) {
    keys.push(m[1])
  }

  if (keys.length === 0) {
    throw new Error('No fields found in _savePlayer() payload — regex may have broken')
  }

  return keys
}

// ============================================================
// Step 3: Extract loadPlayer() column reads from gameEngine.ts
// ============================================================

function extractLoadPlayerCols(): string[] {
  const enginePath = path.join(WORKTREE_ROOT, 'lib', 'gameEngine.ts')
  const src = fs.readFileSync(enginePath, 'utf-8')

  // Find the `const row = data as { ... }` block inside loadPlayer().
  // It starts at `const row = data as {` and ends at the matching `}`.
  const rowTypeMatch = src.match(/const row = data as \{([\s\S]*?)\n    \}/)
  if (!rowTypeMatch) {
    throw new Error('Could not locate `const row = data as {` block in loadPlayer()')
  }

  const rowTypeBlock = rowTypeMatch[1]
  // Each typed column looks like: `  col_name: SomeType`
  const colPattern = /^\s+(\w+):/gm
  const cols: string[] = []
  let m: RegExpExecArray | null
  while ((m = colPattern.exec(rowTypeBlock)) !== null) {
    cols.push(m[1])
  }

  // Also pick up the out-of-band narrative_progress read:
  // `(row as Record<string, unknown>).narrative_progress`
  if (src.includes('.narrative_progress') && !cols.includes('narrative_progress')) {
    cols.push('narrative_progress')
  }

  return cols
}

// ============================================================
// Step 4: Extract mock table names from supabaseMock.ts
// ============================================================

function extractMockTableNames(): string[] {
  const mockPath = path.join(WORKTREE_ROOT, 'lib', 'supabaseMock.ts')
  const src = fs.readFileSync(mockPath, 'utf-8')

  // Find the `freshTables()` function body and extract string keys from the returned object.
  const freshMatch = src.match(/function freshTables\(\)[^{]*\{([\s\S]*?)\n\}/)
  if (!freshMatch) {
    throw new Error('Could not locate freshTables() in supabaseMock.ts')
  }

  const body = freshMatch[1]
  // Keys look like: `  tableName: [],`
  const keyPattern = /^\s+(\w+):\s*\[/gm
  const tables: string[] = []
  let m: RegExpExecArray | null
  while ((m = keyPattern.exec(body)) !== null) {
    tables.push(m[1])
  }

  return tables
}

// ============================================================
// Main validation logic
// ============================================================

interface DriftReport {
  passed: boolean
  findings: string[]
  warnings: string[]
}

function checkSavePlayerVsMigrations(
  saveKeys: string[],
  migrationCols: Set<string>,
): DriftReport {
  header('Check 1: _savePlayer() payload keys vs. migration columns (players table)')

  const findings: string[] = []
  const warnings: string[] = []

  // Keys in save payload that have no migration column
  const missingInMigration = saveKeys.filter(k => !migrationCols.has(k))
  // Migration columns that are never written by _savePlayer()
  // (expected — not all columns are written every tick; this is informational only)
  const notInSave = [...migrationCols].filter(k => !saveKeys.includes(k))

  if (missingInMigration.length === 0) {
    pass(`All ${saveKeys.length} _savePlayer() keys have matching migration columns`)
  } else {
    for (const k of missingInMigration) {
      const msg = `_savePlayer() writes column '${k}' but NO migration creates this column in players table`
      fail(msg)
      findings.push(msg)
    }
  }

  if (notInSave.length > 0) {
    info(`Migration columns NOT written by _savePlayer() (informational — some are read-only or set at creation):`)
    for (const k of notInSave) {
      info(`  ${k}`)
    }
  }

  return { passed: missingInMigration.length === 0, findings, warnings }
}

function checkLoadPlayerVsMigrations(
  loadCols: string[],
  migrationCols: Set<string>,
): DriftReport {
  header('Check 2: loadPlayer() column reads vs. migration columns (players table)')

  const findings: string[] = []
  const warnings: string[] = []

  const missingInMigration = loadCols.filter(k => !migrationCols.has(k))
  const notInLoad = [...migrationCols].filter(k => !loadCols.includes(k))

  if (missingInMigration.length === 0) {
    pass(`All ${loadCols.length} loadPlayer() column reads have matching migration columns`)
  } else {
    for (const k of missingInMigration) {
      const msg = `loadPlayer() reads column '${k}' but NO migration creates this column in players table`
      fail(msg)
      findings.push(msg)
    }
  }

  if (notInLoad.length > 0) {
    info(`Migration columns NOT read by loadPlayer() (informational — some are write-only or creation-time only):`)
    for (const k of notInLoad) {
      info(`  ${k}`)
    }
  }

  return { passed: missingInMigration.length === 0, findings, warnings }
}

function checkSaveVsLoad(saveKeys: string[], loadCols: string[]): DriftReport {
  header('Check 3: _savePlayer() payload vs. loadPlayer() column type-set')

  const findings: string[] = []
  const warnings: string[] = []

  const savedButNotLoaded = saveKeys.filter(k => !loadCols.includes(k))
  const loadedButNotSaved = loadCols.filter(k => !saveKeys.includes(k))

  if (savedButNotLoaded.length === 0 && loadedButNotSaved.length === 0) {
    pass('_savePlayer() and loadPlayer() have symmetric column sets')
  } else {
    if (savedButNotLoaded.length > 0) {
      for (const k of savedButNotLoaded) {
        // Some write-only columns are intentional (e.g. active_dialogue may not always be in
        // loadPlayer's typed declaration). Treat as warning unless it's a critical field.
        const msg = `_savePlayer() writes '${k}' but loadPlayer() does not declare it in its row type`
        warn(msg)
        warnings.push(msg)
      }
    }
    if (loadedButNotSaved.length > 0) {
      for (const k of loadedButNotSaved) {
        // Read-only fields (id, name, character_class, world_seed, etc.) are expected here.
        info(`loadPlayer() reads '${k}' but _savePlayer() does not write it (likely read-only field)`)
      }
    }
  }

  return { passed: true, findings, warnings }
}

function checkOrphanedMigrationColumns(
  migrationCols: Set<string>,
  saveKeys: string[],
  loadCols: string[],
): DriftReport {
  header('Check 6: Migration columns never accessed by save or load (orphaned columns)')

  // Columns that are deliberately set at creation time / managed outside of _savePlayer and loadPlayer
  const CREATION_TIME_COLS = new Set([
    'id', 'name', 'character_class', 'world_seed', 'created_at', 'updated_at',
    'personal_loss_type', 'personal_loss_detail', 'squirrel_name',
    'cycle', 'total_deaths', 'is_dead',
  ])

  const findings: string[] = []
  const warnings: string[] = []

  const allAccessed = new Set([...saveKeys, ...loadCols])
  const orphaned = [...migrationCols].filter(
    col => !allAccessed.has(col) && !CREATION_TIME_COLS.has(col)
  )

  if (orphaned.length === 0) {
    pass('All non-creation migration columns are accessed by save or load')
  } else {
    for (const col of orphaned) {
      // squirrel_trust on players is a known case — it was added to players in migration 005
      // but is actually maintained on player_ledger (different table). The players column is
      // orphaned — never written by _savePlayer(), never read by loadPlayer().
      const msg = `Migration column '${col}' in players table is NEVER read by loadPlayer() or written by _savePlayer() — orphaned column`
      warn(msg)
      warnings.push(msg)
    }
  }

  return { passed: true, findings, warnings }
}

function checkMockVsMigrations(
  mockTables: string[],
  extantTables: Set<string>,
): DriftReport {
  header('Check 4: supabaseMock.ts freshTables() vs. extant migration tables')

  const findings: string[] = []
  const warnings: string[] = []
  let passed = true

  // Tables in mock that don't exist in migrations
  const mockExtra = mockTables.filter(t => !extantTables.has(t))
  // Tables in migrations that don't exist in mock
  const migrationExtra = [...extantTables].filter(t => !mockTables.includes(t))

  if (mockExtra.length === 0 && migrationExtra.length === 0) {
    pass(`Mock freshTables() and migration extant tables are in sync (${mockTables.length} tables each)`)
  } else {
    if (mockExtra.length > 0) {
      for (const t of mockExtra) {
        const msg = `Mock freshTables() includes table '${t}' but it does NOT exist in migration schema (DRIFT: mock has phantom table)`
        fail(msg)
        findings.push(msg)
        passed = false
      }
    }
    if (migrationExtra.length > 0) {
      for (const t of migrationExtra) {
        // Some tables are intentionally absent from mock (world_state is server-only).
        // Classify as warning not failure — the validator documents them.
        const INTENTIONALLY_MOCK_EXEMPT = new Set(['world_state'])
        if (INTENTIONALLY_MOCK_EXEMPT.has(t)) {
          const msg = `Migration table '${t}' is absent from mock freshTables() — classified as intentional (server-role only table; no app writes go through mock path)`
          warn(msg)
          warnings.push(msg)
        } else {
          const msg = `Migration table '${t}' is absent from mock freshTables() — dev-mode writes to this table will silently fail`
          fail(msg)
          findings.push(msg)
          passed = false
        }
      }
    }
  }

  return { passed, findings, warnings }
}

function checkGameLogDropped(extantTables: Set<string>, mockTables: string[]): DriftReport {
  header('Check 5: game_log table consistency (known historical drift)')

  const findings: string[] = []
  const warnings: string[] = []

  // game_log was created in 20260326000001_init.sql but dropped in 20260329000001_rls_world_state.sql.
  // The LESSONS.md note (remnant-infra-0329) recorded that the mock STILL INCLUDED game_log after
  // the drop, causing dev-mode writes to silently succeed while production would fail.
  //
  // Current state check:
  const inMigrations = extantTables.has('game_log')
  const inMock = mockTables.includes('game_log')

  if (!inMigrations && !inMock) {
    pass('game_log: correctly absent from both migration schema and mock (drop applied consistently)')
  } else if (inMigrations && inMock) {
    pass('game_log: consistently present in both migration schema and mock')
  } else if (!inMigrations && inMock) {
    const msg = 'game_log: EXISTS in mock freshTables() but was DROPPED in migrations (20260329000001_rls_world_state.sql) — DRIFT: mock has phantom table'
    fail(msg)
    findings.push(msg)
  } else {
    // inMigrations && !inMock — table exists in schema but not in mock
    const msg = 'game_log: EXISTS in migration schema but absent from mock — dev-mode writes to game_log will silently fail'
    fail(msg)
    findings.push(msg)
  }

  return { passed: findings.length === 0, findings, warnings }
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('Remnant MUD — Schema Drift Detector')
  console.log('=====================================')
  console.log('Cross-references: migrations ↔ _savePlayer() ↔ loadPlayer() ↔ supabaseMock')
  console.log()

  // Step 1: Derive migration schema
  header('Deriving canonical schema from migrations...')
  const { tableColumns, extantTables } = deriveMigrationSchema()
  info(`Found ${extantTables.size} extant tables after all migrations: ${[...extantTables].sort().join(', ')}`)

  const playersCols = tableColumns.get('players')
  if (!playersCols) {
    console.error('\nFATAL: players table not found in migrations')
    process.exit(1)
  }
  info(`players table has ${playersCols.size} columns: ${[...playersCols].sort().join(', ')}`)

  // Step 2: Extract save/load fields
  let saveKeys: string[]
  let loadCols: string[]
  let mockTables: string[]

  try {
    saveKeys = extractSavePlayerKeys()
    info(`\n_savePlayer() payload has ${saveKeys.length} keys: ${saveKeys.join(', ')}`)
  } catch (e) {
    console.error(`\nFATAL: ${(e as Error).message}`)
    process.exit(1)
  }

  try {
    loadCols = extractLoadPlayerCols()
    info(`loadPlayer() reads ${loadCols.length} columns: ${loadCols.join(', ')}`)
  } catch (e) {
    console.error(`\nFATAL: ${(e as Error).message}`)
    process.exit(1)
  }

  try {
    mockTables = extractMockTableNames()
    info(`supabaseMock freshTables() has ${mockTables.length} tables: ${mockTables.join(', ')}`)
  } catch (e) {
    console.error(`\nFATAL: ${(e as Error).message}`)
    process.exit(1)
  }

  // Step 3: Run checks
  const results: DriftReport[] = []

  results.push(checkSavePlayerVsMigrations(saveKeys, playersCols))
  results.push(checkLoadPlayerVsMigrations(loadCols, playersCols))
  results.push(checkSaveVsLoad(saveKeys, loadCols))
  results.push(checkMockVsMigrations(mockTables, extantTables))
  results.push(checkGameLogDropped(extantTables, mockTables))
  results.push(checkOrphanedMigrationColumns(playersCols, saveKeys, loadCols))

  // Summary
  console.log('\n=====================================')
  const allFindings = results.flatMap(r => r.findings)
  const allWarnings = results.flatMap(r => r.warnings)
  const hasDrift = allFindings.length > 0

  if (allWarnings.length > 0) {
    console.log('\nWarnings (non-blocking, document for follow-up):')
    for (const w of allWarnings) {
      console.log(`  ⚠ ${w}`)
    }
  }

  if (!hasDrift) {
    console.log('\nAll schema-drift checks passed. No drift detected.')
    console.log('\nNote: Warnings above are informational — they describe intentional design decisions')
    console.log('that should be reviewed but do not constitute blocking drift.')
    process.exit(0)
  } else {
    console.log('\nSCHEMA DRIFT DETECTED — the following issues must be fixed before deploying:')
    for (const f of allFindings) {
      console.log(`  ✗ ${f}`)
    }
    console.log('\nEach drift item above is a potential production outage. Fix by either:')
    console.log('  a) Creating a migration that adds/removes the column, OR')
    console.log('  b) Removing the field from _savePlayer() / loadPlayer() if it was added in error')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Schema drift detector error:', err)
  process.exit(1)
})
