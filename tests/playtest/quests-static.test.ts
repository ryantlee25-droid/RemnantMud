// ============================================================
// PT-QUEST — static analysis: every quest's completionFlag
// must be set somewhere in the codebase.
//
// Catches the "journal entry never marks complete" class of bug
// described in docs/playtest/PT-QUEST-REPORT.md.
// ============================================================

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { QUEST_DESCRIPTIONS } from '@/data/questDescriptions'

const ROOT = join(process.cwd())

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue
    const full = join(dir, entry)
    const st = statSync(full)
    if (st.isDirectory()) out.push(...walk(full))
    else if (full.endsWith('.ts') && !full.endsWith('questDescriptions.ts')) out.push(full)
  }
  return out
}

const sourceFiles = [...walk(join(ROOT, 'data')), ...walk(join(ROOT, 'lib'))]
const allSource = sourceFiles.map((f) => readFileSync(f, 'utf8')).join('\n')

function hasSetter(flag: string): boolean {
  // Look for any non-`requires*` mention of the flag name.
  // We split into lines so we can skip comment lines and require-context lines.
  for (const line of allSource.split('\n')) {
    if (!line.includes(flag)) continue
    const t = line.trim()
    if (t.startsWith('//') || t.startsWith('*')) continue
    if (/requires(Flag|FlagAbsent|QuestFlag)\s*[:(]/.test(line)) continue
    if (/completionFlag\s*:/.test(line)) continue
    // Anything else mentioning the flag is treated as a setter.
    return true
  }
  return false
}

describe('PT-QUEST static — every quest start flag has at least one setter', () => {
  const startFlags = [...new Set(QUEST_DESCRIPTIONS.map((q) => q.flag))]
  for (const flag of startFlags) {
    it(`start flag '${flag}' is set somewhere`, () => {
      expect(hasSetter(flag), `Quest start flag '${flag}' has no setter — quest never enters the journal`).toBe(true)
    })
  }
})

describe('PT-QUEST static — every quest completionFlag has at least one setter', () => {
  const completionFlags = [
    ...new Set(QUEST_DESCRIPTIONS.map((q) => q.completionFlag).filter((f): f is string => typeof f === 'string')),
  ]

  // Known-orphan completion flags (documented in PT-QUEST-REPORT.md).
  // When a setter is added for one of these, flip to `it(...)` and ship.
  // F1 fix: broadcaster_found, fault_scar_connection_confirmed, hollow_origin_understood
  // now have setters in data/rooms/the_scar.ts (scar_13, scar_28, scar_17 respectively).
  // Removed from KNOWN_ORPHANS — the it() path below will confirm the setters exist.
  // Remaining orphans (fault_entity_observed, sanguine_origin_understood) are F2's scope
  // (dialogue-set flags in data/dialogueTrees.ts).
  const KNOWN_ORPHANS = new Set([
    'fault_entity_observed',
    'sanguine_origin_understood',
  ])

  for (const flag of completionFlags) {
    if (KNOWN_ORPHANS.has(flag)) {
      it.fails(`KNOWN ORPHAN: completionFlag '${flag}' is set somewhere`, () => {
        expect(hasSetter(flag)).toBe(true)
      })
    } else {
      it(`completionFlag '${flag}' is set somewhere`, () => {
        expect(hasSetter(flag), `Quest completionFlag '${flag}' has no setter — quest never marks complete`).toBe(true)
      })
    }
  }
})
