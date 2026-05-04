# PLAN-EVAL: Full-Spectrum Evaluation Testing Plan — The Remnant
_Created: 2026-05-03 | Type: Evaluation / Test Generation_

---

## Goal

Achieve complete, unambiguous evaluation coverage of every game system in The Remnant: every room, every NPC, every ability, every mechanic, every narrative path, every parser verb, every persistence edge case, and every UI component — with actionable test specifications that Howlers can execute without interpretation.

## Non-Goals

- This is not a game-design review. No redesign proposals. The plan evaluates what exists.
- This is not a security audit. See `evaluation/harness-review/H2-auth-security-audit.md`.
- This is not a performance profiling pass. Response-time SLAs are out of scope.
- Writing production code is not part of this plan. The deliverable is test code and eval tooling only.

---

## Inventory (Source-Verified)

| Entity | Count | Source |
|--------|-------|--------|
| Rooms | 268 | `tests/eval/mapIntegrity.test.ts` line 185, zone min-counts table |
| Zones | 13 | `data/rooms/index.ts`, `types/game.ts` ZoneType enum |
| NPCs defined | 122 | `data/npcs.ts` (`id:` entries) |
| NPC IDs referenced in rooms | 106 | `grep npcId: data/rooms/*.ts` unique |
| Dialogue trees (unique objects) | 24 | `dialogueHealth.test.ts` getUniqueTrees() aggregate |
| Dialogue nodes | 335 | `data/dialogueTrees.ts` (`id:` entries) |
| Items | 271 | `data/items.ts` (`id:` entries) |
| Enemies | 23 | `data/enemies.ts` (`id:` entries) |
| Recipes | 16 | `data/recipes.ts` (`name:` entries) |
| Character classes | 7 | `types/game.ts` CharacterClass |
| Factions | 9 | `types/game.ts` FactionType |
| Endings | 4 | cure / weapon / seal / throne |
| Scar entry routes | 4 | keycard / biometric / tunnel / utility |
| lib modules | 30 | `ls lib/*.ts` (excluding `.test.ts`) |
| lib/actions modules | 11 | `ls lib/actions/` |
| Total test files (non-eval) | 94 | `pnpm test:coverage` run |
| Total test cases (non-eval) | 6,206 | 6,199 pass + 3 xfail + 3 skip |
| Eval test cases | 533 | `pnpm test:eval` run |
| Playtest scenario files | 17 | `ls tests/playtest/` |
| Overall statement coverage | 75.96% | `pnpm test:coverage` 2026-05-03 |
| Overall branch coverage | 66.95% | same run |

**NPC ID cross-reference**: `comm` between room-referenced NPC IDs and `npcs.ts` definitions produced zero missing entries — all 106 room-referenced NPC IDs resolve to defined NPCS entries. This was a known gap from narrative-0329; it has been resolved.

---

## Coverage Matrix

### System → Gaps → Proposed Work

| System | Existing Tests | Current Coverage | Known Gaps | New Tests Needed | Test Type | Owner |
|--------|---------------|-----------------|-----------|-----------------|-----------|-------|
| **Map integrity** | `tests/eval/mapIntegrity.test.ts` (15 tests) | Full: reachability, bidir, target-validity, gate-validity, zone-cohesion | None — comprehensive | Baseline snapshots for bidir count | Eval/snapshot | Gray |
| **Dialogue health** | `tests/eval/dialogueHealth.test.ts` (20 tests × trees) | Full: orphan nodes, unreachable, flag round-trip, smart quotes, cycle-gating | Runtime NPC-ID sweep missing (known from LESSONS.md) | NPC-ID cross-ref validator script; runtime sweep test | Content cross-ref | Gray |
| **Ending reachability** | `tests/eval/endingReachability.test.ts` (72 tests) | Full: all 4 endings × 4 routes × stumble × cycle-gate | None | None needed | Eval | — |
| **Faction lockout** | `tests/eval/factionLockout.test.ts` (33 tests) | Full: rep curves, spiral lock, pessimum, dialogue refs | None | None needed | Eval | — |
| **Combat balance matrix** | `tests/eval/combatMatrix.test.ts` (4 tests, 560 scenarios) | 7 classes × 16 enemies × 5 levels × 3 seeds | Abilities not exercised in matrix (matrix uses raw playerAttack only); conditions not active in fights; stealth/surprise not tested | Ability-specific combat matrix; condition injection tests; stealth surprise-round matrix | Eval/property | Gray |
| **`lib/combat.ts`** | Integration tests: combat-math, combat-edge-cases, combat-env, aoe | 86.54% stmt / 81.52% branch | Lines ~991–1036, 1057, 1233 uncovered; `resolveAoE` secondary paths; environment `combat_collapsing` special-effect branch | AoE multi-target property test; collapsing-environment 20% branch | Unit/property | Gray |
| **`lib/actions/combat.ts`** | Integration: combat-abilities, combat-social-deep | 48.97% stmt / 42.05% branch | Lines 546–887, 899–1018 — flee paths, noise encounters, loot-roll branches, all ability dispatch branches | Per-ability handler tests for all 7 classes; flee under-health path; noise encounter trigger | Unit/integration | Gray |
| **`lib/abilities.ts`** | `tests/integration/echoes-abilities.test.ts`, `combat-abilities.test.ts` | 89.89% stmt / 82.14% branch | Lines 222, 237, 304–310 — Broker contract-expiry path, Shepherd summon-fail path | Broker contract-expiry; Shepherd full summon sequence | Unit | Gray |
| **`lib/conditions.ts`** | `tests/integration/conditions.test.ts` | 80.7% stmt / 75% branch | Lines 94, 99, 183–197 — multi-condition interaction paths | Stacked conditions: bleeding + stunned + frightened simultaneous tick | Unit/property | Gray |
| **`lib/stealth.ts`** | `tests/integration/inventory-craft-stealth.test.ts` | 100% stmt / 75% branch | Branch: no light source path in `attemptStealth` | Stealth with/without light; Wraith class bonus composition | Unit | Gray |
| **`lib/echoes.ts`** | `tests/integration/echoes-abilities.test.ts`, `factionLockout.test.ts` | 75.18% stmt / 68.42% branch | Lines 437–543, 556–577 — `getCrossCycleConsequences` for deeper cycle counts; `getCycleAwareDialogue` variant paths | Cross-cycle consequence matrix (cycles 2–5); cycle-aware dialogue for all 7 classes | Integration | Gray |
| **`lib/worldEvents.ts`** | `lib/worldEvents.test.ts` (co-located) | 78.94% stmt / 67.18% branch | Lines ~136, 141–144, 185 — act 2/3 event trigger paths; event expiry | Act-transition world events; event expiry after N actions | Integration | Gray |
| **`lib/narrativeKeys.ts`** | `tests/integration/narrative-modules-deep.test.ts` | 69.49% stmt / 64.44% branch | Lines 208–277 — `getContradictionReport()` and `updateContradiction()` paths | Contradiction creation/resolution round-trip; contradiction with multiple claims | Unit | Gray |
| **`lib/narratorVoice.ts`** | `tests/integration/monologue-narrator.test.ts` | 79.66% stmt / 72.5% branch | Lines 166–169, 202–210 — low-HP voice variants; specific zone voice variants | Low-HP narrator trigger; zone-specific voice per all 13 zones | Snapshot/unit | Gray |
| **`lib/playerMonologue.ts`** | `tests/integration/monologue-narrator.test.ts` | 83.17% stmt / 74.73% branch | Lines 220, 271–306, 353 — Scout/Reclaimer voice divergence paths; act 3 monologue | Blind-class test (7 classes × act × trigger); repeat-detection (same monologue ≤3 consecutive) | Eval/snapshot | Gray |
| **`lib/gameEngine.ts`** | gameEngine-core, gameEngine-deep, many integration | 83.97% stmt / 76.33% branch | Lines 2301, 2337–2355 — CONFIRM RESTART delete-partial-failure path; ending BEGIN before snapshot path | Restart with Supabase delete failure; ending persist-fail before delete; concurrency guard | Integration | Gray |
| **`lib/inventory.ts`** | inventory.test.ts, stash-inventory.test.ts | 72.58% stmt / 58.44% branch | Lines ~316, 424, 440–459 — stash full-capacity path; weight-overflow path | Inventory full add; stash capacity edge; item-move DB-first ordering | Unit/integration | Gray |
| **`lib/companionSystem.ts`** | `tests/integration/faction-companion.test.ts` | 84.7% stmt / 74.6% branch | Lines ~281, 294, 299 — companion commentary for all personal-loss types; dog idle during combat | All 5 personalLossType companion reactions; dog commentary in combat | Unit/snapshot | Gray |
| **`lib/factionWeb.ts`** | `tests/integration/faction-companion.test.ts` | 97.91% stmt / 88.88% branch | Line 563 — delayed-consequence ripple when triggering faction is already antagonized | Ripple on pre-antagonized faction | Unit | Gray |
| **`lib/npcInitiative.ts`** | `tests/integration/narrative-world.test.ts` | 100% stmt / 64.61% branch | Lines 153, 170–243, 257 — patrol-cycle NPC initiative; initiative cooldown timer | NPC initiative cycles 1–3; initiative with hollow-pressure ≥8 | Integration | Gray |
| **`lib/hollowPressure.ts`** | `lib/hollowPressure.test.ts` (co-located) | 100% all | None | None needed | — | — |
| **`lib/wanderers.ts`** | `tests/unit/wanderers.test.ts` | 86.25% stmt / 68.51% branch | Lines 75, 81 — wanderer-faction conflict when two wanderers share a zone | Multi-wanderer zone conflict resolution | Unit | Gray |
| **`lib/terminalCreation.ts`** | `tests/integration/terminal-flows.test.ts` | 93.91% stmt / 89.74% branch | Lines ~341, 347, 443–446 — stat-boost selection for all 6 stats; cycle-N creation flow | All stat choices at levels 3/6/9; rebirth vs. first-create flow | Integration | Gray |
| **`lib/terminalDeath.ts`** | `tests/integration/terminal-flows.test.ts` | 95.32% stmt / 75% branch | Line 210 — death with zero cycle history | Death at cycle 1 (no previous cycle data) | Integration | Gray |
| **`lib/actions/movement.ts`** | `tests/integration/movement.test.ts`, movement-zones | 78.14% stmt / 73.81% branch | Lines ~503–612, 649–658 — zone-gate rejection message path; cycleGate block message; fear-check on move | CycleGate block at cycle 1 trying to enter Scar; fear-check move abort; zone-gate rejection | Integration | Gray |
| **`lib/actions/social.ts`** | `tests/integration/social-dialogue.test.ts`, combat-social-deep | 78.02% stmt / 73.35% branch | Lines ~37, 805–808 — `handleChat` with no active NPC; multiple social commands in sequence | Chat with no NPC present; ask/tell/say sequence; talk ending mid-tree | Integration | Gray |
| **`lib/actions/trade.ts`** | `tests/integration/trade.test.ts` | 79.06% stmt / 64.75% branch | Lines ~301–302, 318–319 — sell when vendor budget exhausted; sell item vendor doesn't want | Sell with depleted vendor budget; sell unwanted item | Integration | Gray |
| **`lib/actions/vendorDialogue.ts`** | None | 54.54% stmt / 50% branch | Lines 16–17, 38–39, 60–62 — empty-array paths for all 4 functions | All 4 functions with empty/undefined inputs | Unit | Gray |
| **`lib/actions/types.ts`** | None | 0% | Action type definitions — no executable logic | No tests needed (type-only file) | — | — |
| **`lib/ansiColors.ts`** | None | 0% | ANSI constants — no logic | No tests needed (constant file) | — | — |
| **`lib/supabaseMock.ts`** | Indirect via integration tests | 10.75% stmt | Lines 35–174 — `freshTables()`, `isDevMode()`, all mock implementations | Direct supabaseMock unit tests: `resetDevDb()`, table state isolation, `isDevMode()` flag | Unit | Gray |
| **`lib/testing/seededRng.ts`** | Used by `combatMatrix.test.ts` | 0% stmt (100% branch) | `mulberry32` and `withSeededRandom` function bodies never hit by v8 (test-only file) | Property test: seeded sequence is deterministic; different seeds produce different sequences | Unit | Gray |
| **`components/` (7 files at 0%)** | None | 0% | CharacterCreation.tsx (630 lines), CommandInput.tsx, ErrorBoundary.tsx, GameLayout.tsx, RemnantLogo.tsx, Sidebar.tsx, Terminal.tsx | RTL render tests; CommandInput submit/history; ErrorBoundary catch; Terminal ANSI render | React/RTL | Gray |
| **`components/tabs/DataTab.tsx`** | None | 0% | DataTab rendering with player state | RTL render with mock state; tab switching | React/RTL | Gray |
| **`components/tabs/InventoryTab.tsx`** | None | 0% | InventoryTab item list rendering | RTL render with inventory items | React/RTL | Gray |
| **Parser** | `tests/unit/parser.test.ts` (38 tests) | 100% | None — all commands covered | Grammar fuzz (random word combos); ambiguous input disambiguation | Fuzz | Gray |
| **Save/load round-trip** | `tests/integration/save-load-roundtrip.test.ts` | Exists — field-level assertions | Retry-path field assertions; schema-drift detector comparing `_savePlayer()` keys to migration columns | Schema-drift detector; retry path with simulated failure | Integration | Gray |
| **Supabase mock vs. prod parity** | `scripts/validate-consistency.ts` (Check 1) | Partial — save fields only | Mock `freshTables()` vs. current migration schema; no column-type validation | Parity validator script comparing mock table shapes to cumulative migration schema | Tooling | Gray |
| **RNG distribution** | `tests/unit/dice.test.ts` (20 tests), `combatMatrix.test.ts` | dice.ts at 100% | RNG distribution curve for `roll1d10`, `rollDamage` across 10,000 runs | Chi-squared distribution test for dice rolls; damage range property test | Property | Gray |
| **Narrative prose snapshots** | `tests/integration/narrative-modules-deep.test.ts` | Partial | No snapshot registry exists; prose can change without test failure | Prose snapshot suite for: deathProse, terminalCreation, terminalDeath, narratorVoice, playerMonologue | Snapshot | Gray |
| **World events** | `tests/integration/worldEvents.test.ts`, `lib/worldEvents.test.ts` | 78.94% | Act 2/3 trigger path; expiry path | Act-trigger and expiry integration | Integration | Gray |
| **Crafting** | `tests/integration/crafting-recipes.test.ts`, `inventory-craft-stealth.test.ts` | 95.23% stmt | Line 102 — craft with insufficient materials (partial fail path) | Craft with exact-minus-1 materials; all 16 recipes round-trip | Integration | Gray |

---

## Type Dependencies

No types changes are proposed by this plan. All tests read the existing type system.

Key types that evaluation tests depend on (do not change during test-gen):
- `Player`, `Enemy`, `CombatState`, `Room`, `Item`, `GameMessage` in `types/game.ts`
- `CharacterClass`, `FactionType`, `SkillType`, `PersonalLossType` in `types/game.ts`
- `ActiveCondition`, `ConditionId`, `WeaponTraitId`, `ArmorTraitId` in `types/traits.ts`
- `CycleSnapshot`, `NarrativeKey` in `types/convoy-contracts.d.ts`

---

## Phased Execution

### Phase 1 — Tooling & Infrastructure (Sequential, must complete first)
Entry criteria: None  
Exit criteria: All 3 scripts exist, pass `tsx` execution, produce machine-readable output

**Why sequential**: Phases 2–5 depend on the cross-ref validator and schema-drift detector outputs. Running them before tooling produces false-negative results.

| Task | Description | Effort |
|------|-------------|--------|
| T1-A | **NPC-ID cross-ref validator** (new script) | S |
| T1-B | **Schema-drift detector** (new script) | S |
| T1-C | **Prose snapshot registry setup** | S |

---

### Phase 2 — Eval Suite Expansion (Parallel, 5 Howlers)
Entry criteria: Phase 1 complete; existing `pnpm test:eval` passes (533 tests green)  
Exit criteria: All 5 eval files expanded; `pnpm test:eval` passes with expanded count

Tasks P2-A through P2-E are independent (different files). **Gold dispatch candidate.**

| Task | File(s) Modified | Effort |
|------|-----------------|--------|
| P2-A | Expand `tests/eval/mapIntegrity.test.ts` | S |
| P2-B | Expand `tests/eval/dialogueHealth.test.ts` — runtime NPC-ID sweep | S |
| P2-C | Expand `tests/eval/combatMatrix.test.ts` — ability matrix + condition injection | M |
| P2-D | New: `tests/eval/narrativeSnapshotRegistry.test.ts` | M |
| P2-E | New: `tests/eval/rngDistribution.test.ts` | S |

---

### Phase 3 — Unit & Integration Gap Fill (Parallel, up to 8 Howlers)
Entry criteria: Phase 1 complete; `pnpm test` passes (6,206 tests green)  
Exit criteria: All targeted modules reach stated coverage floors; `pnpm test` passes with new cases

Tasks P3-A through P3-H are independent by file ownership. **Gold dispatch candidate.**

| Task | Target Files | Coverage Floor | Effort |
|------|-------------|---------------|--------|
| P3-A | `lib/actions/combat.ts` (48% → 75%) | 75% stmt | L |
| P3-B | `lib/actions/social.ts` + `vendorDialogue.ts` (78%/54% → 85%) | 85% stmt | M |
| P3-C | `lib/actions/trade.ts` + `lib/actions/travel.ts` (79%/91% → 90%) | 90% stmt | S |
| P3-D | `lib/echoes.ts` + `lib/worldEvents.ts` (75%/78% → 90%) | 90% stmt | M |
| P3-E | `lib/narrativeKeys.ts` + `lib/narratorVoice.ts` (69%/79% → 90%) | 90% stmt | M |
| P3-F | `lib/inventory.ts` + `lib/supabaseMock.ts` (72%/10% → 85%/60%) | see targets | M |
| P3-G | `lib/gameEngine.ts` edge paths — restart delete-fail; ending persist-fail; concurrency guard | 86% → 90% | M |
| P3-H | `components/` and `components/tabs/` — RTL render suite | 0% → 70% | L |

---

### Phase 4 — Playtest Scenario Expansion (Parallel, up to 6 Howlers)
Entry criteria: Phase 3 complete  
Exit criteria: All 6 zone/strategy playtest files exist and pass in `pnpm test`

Tasks P4-A through P4-F are independent (different scenario files and zones).

| Task | Description | Effort |
|------|-------------|--------|
| P4-A | Zone A (Crossroads) full playtest script | M |
| P4-B | Zone B (River Road) full playtest script | M |
| P4-C | Stealth-run strategy scenario | M |
| P4-D | Social/diplomatic strategy scenario | M |
| P4-E | Speedrun / minimal-kill scenario | M |
| P4-F | Completionist scenario (all quests, all factions, all 4 endings) | L |

---

### Phase 5 — Eval Rubrics & LLM Judge (Sequential — requires narrative snapshots from P2-D)
Entry criteria: Phase 2 complete (narrative snapshots established)  
Exit criteria: 4 rubric definitions documented; manual eval pass completed against 10 sampled outputs

| Task | Description | Effort |
|------|-------------|--------|
| P5-A | Narrative quality rubric — authored + `test:eval` hook | S |
| P5-B | Combat-feel rubric — pacing, turn count, outcome variety | S |
| P5-C | Dialogue-coherence rubric — NPC voice consistency | S |
| P5-D | World-consistency rubric — cross-zone contradiction detection | S |

---

### Phase Parallelism Summary

```
Phase 1 (sequential, ~4h)
    |
    └── Phase 2 (5 parallel Howlers, ~6h) ──┐
    └── Phase 3 (8 parallel Howlers, ~8h) ──┤
                                              |
                                         Phase 4 (6 parallel Howlers, ~8h)
                                              |
                                         Phase 5 (sequential, ~4h)
```

Phases 2 and 3 can run in parallel with each other (different file ownership). Phase 4 requires Phase 3's unit test infrastructure to be stable. Phase 5 requires Phase 2's snapshot registry.

---

## Test Type Playbooks

### 1. Content Cross-Reference Test

**Pattern**: Load all data, build lookup sets, iterate exhaustively, assert zero violations.

**Canonical example** (NPC-ID cross-ref):
```typescript
// All npcId values in room npcSpawns must exist as keys in NPCS
const allRoomNpcIds = ALL_ROOMS.flatMap(r =>
  (r.npcSpawns ?? []).map(s => s.npcId)
)
const missingIds = allRoomNpcIds.filter(id => !NPCS[id])
expect(missingIds, `Undefined NPC IDs in npcSpawns: ${missingIds.join(', ')}`).toHaveLength(0)
```

**Applies to**: T1-A, P2-B, NPC-ID sweep

---

### 2. Mechanic Unit Test

**Pattern**: Construct minimal state, call function, assert return value. Never mock the function under test.

**Canonical example** (condition stacking):
```typescript
import { applyCondition, tickConditions } from '@/lib/conditions'
const conditions = []
const c1 = applyCondition(conditions, 'bleeding', { duration: 3, damage: 2 })
const c2 = applyCondition(c1.result, 'stunned', { duration: 2 })
const tick = tickConditions(c2.result)
expect(tick.damage).toBe(2) // only bleeding deals damage
expect(tick.remaining).toHaveLength(2) // both conditions still active (duration decremented)
```

**Applies to**: P3-A through P3-G

---

### 3. RNG Distribution / Property Test

**Pattern**: Run N iterations with varied seeds, assert the output distribution falls within expected bounds using `withSeededRandom` from `lib/testing/seededRng.ts`.

**Canonical example** (damage range):
```typescript
import { withSeededRandom } from '@/lib/testing/seededRng'
import { rollDamage } from '@/lib/dice'
const N = 10_000
const results: number[] = []
for (let i = 0; i < N; i++) {
  withSeededRandom(i, () => { results.push(rollDamage([1, 8])) })
}
const min = Math.min(...results); const max = Math.max(...results)
expect(min).toBe(1)
expect(max).toBe(8)
// Distribution: each value should appear between 5% and 20% of the time
for (let v = 1; v <= 8; v++) {
  const pct = results.filter(r => r === v).length / N
  expect(pct).toBeGreaterThan(0.05)
  expect(pct).toBeLessThan(0.20)
}
```

**Applies to**: P2-E, combat property tests in P2-C, P3-A

---

### 4. Narrative Snapshot Test

**Pattern**: Call narrative function with fixed seed and fixed state, capture the returned text, compare to a stored snapshot. Use `toMatchInlineSnapshot()` for portability; use `toMatchSnapshot()` only for large multi-output corpora.

**Canonical example** (deathProse snapshot):
```typescript
import { getDeathProse } from '@/lib/deathProse'
const prose = getDeathProse({ cause: 'hollow', roomId: 'cr_01_approach', zone: 'crossroads' })
expect(prose).toMatchInlineSnapshot(`"The hollow's grip closes..."`) // locked text
```

**Applies to**: P2-D, P5-A through P5-D

Prose snapshot tests MUST be re-evaluated after any intentional prose edit — use `vitest -u` to update. Failing prose snapshots are blockers, not warnings. The purpose is to catch unintentional prose drift (e.g., a refactor that changes variable interpolation).

---

### 5. Playtest Scenario Test

**Pattern**: Use `PlayerSession` from `tests/playtest/harness.ts`. Create a character with a specific class/stats, execute a command sequence, assert game state at checkpoints. Use `session.lastLogContains()` for output assertions and `session.player` / `session.currentRoom` for state assertions.

**Canonical example** (NPC interaction):
```typescript
const session = new PlayerSession({ mockRandom: 0.5 })
await session.create({ name: 'Test', characterClass: 'enforcer', stats: { vigor: 6, ... }, personalLoss: { type: 'community' } })
await session.cmd('go north')
await session.cmd('go north') // arrive at cr_03_marketplace
await session.cmd('talk marta')
expect(session.isInDialogue()).toBe(true)
await session.cmd('1') // first branch
expect(session.lastLogContains('bread')).toBe(true) // vendor responds
```

**Applies to**: P4-A through P4-F; see Per-Zone Playtest Scripts section.

---

### 6. Parser Fuzz Test

**Pattern**: Generate random input strings (known-word permutations + garbage) and assert the parser never throws; assert ambiguous inputs produce a specific error message type.

**Canonical example**:
```typescript
import { parseCommand } from '@/lib/parser'
const knownVerbs = ['go', 'attack', 'look', 'take', 'drop', 'talk', 'use', 'craft', 'trade']
const garbage = ['xyzzy', '', '   ', '123', 'go go go', 'attack attack']
for (const input of [...knownVerbs.map(v => `${v}`), ...garbage]) {
  expect(() => parseCommand(input)).not.toThrow()
  const action = parseCommand(input)
  expect(action.type).toBeTruthy() // always returns an action type
}
```

**Applies to**: P3-B's social/parser gap; existing `tests/unit/parser.test.ts` extension

---

### 7. Eval Rubric (LLM-as-Judge)

**Pattern**: Sample 10–20 real game outputs (stored as fixtures). Apply a structured rubric using a scoring function. The rubric is defined as a TypeScript constant, not an LLM call — this makes it deterministic. Human review applies the rubric manually and records scores in a tracking document.

**Canonical example** (combat-feel rubric):
```typescript
const COMBAT_FEEL_RUBRIC = {
  // Score each dimension 1–5
  pacing: 'Average fight concludes in 3–8 turns. <3 = trivial; >12 = drag.',
  variety: 'At least 3 distinct outcomes (won cleanly, won with damage, lost) observed in 20 fights.',
  readability: 'Every log message identifies which entity caused the effect.',
  stakes: 'At least one near-death scenario (player at <20% HP) occurs in 20 fights.',
}
```

Rubrics produce a score document, not a pass/fail assertion. They feed into the open questions list and identify design-review candidates. They are recorded in `evaluation/narrative-review/` and `evaluation/test-analysis/`.

**Applies to**: P5-A through P5-D

---

## Per-File Ownership Table

### `lib/` — Logic Modules

| File | Stmt% | Branch% | Target Stmt% | Test Types Needed | Blockers |
|------|-------|---------|-------------|------------------|---------|
| `abilities.ts` | 89.89 | 82.14 | 95 | Unit: Broker expiry, Shepherd summon-fail | None |
| `affixes.ts` | 98.18 | 87.5 | 98 | Unit: already good; branch 92–93 | None |
| `ansiColors.ts` | 0 | 0 | N/A | Constants only — no tests needed | — |
| `combat.ts` | 86.54 | 81.52 | 92 | Property: AoE multi-target; Unit: collapsing env special | None |
| `companionSystem.ts` | 84.7 | 74.6 | 90 | Snapshot: all personalLossType reactions; Unit: combat idle | None |
| `conditions.ts` | 80.7 | 75 | 90 | Unit: stacked conditions; Property: all ConditionId values tick correctly | None |
| `crafting.ts` | 95.23 | 70 | 95 | Unit: insufficient materials path (line 102) | None |
| `deathProse.ts` | 90.62 | 88.23 | 95 | Snapshot: lines 210–211 | None |
| `dice.ts` | 100 | 100 | 100 | Maintain; add distribution property test | None |
| `echoes.ts` | 75.18 | 68.42 | 90 | Integration: getCycleAwareDialogue × 7 classes; getCrossCycleConsequences cycles 2–5 | None |
| `factionWeb.ts` | 97.91 | 88.88 | 98 | Unit: line 563 ripple on pre-antagonized faction | None |
| `fear.ts` | 85 | 69.23 | 90 | Unit: lines 57–59 — fear-resistance path | None |
| `gameEngine.ts` | 83.97 | 76.33 | 90 | Integration: restart delete-fail; ending persist-fail; lines 2301, 2337–2355 | Read LESSONS.md "CONFIRM RESTART" section first |
| `hollowPressure.ts` | 100 | 100 | 100 | Already complete | — |
| `idleHint.ts` | 100 | 100 | 100 | Already complete | — |
| `inventory.ts` | 72.58 | 58.44 | 85 | Unit: stash full-capacity; weight-overflow; DB-first ordering | None |
| `mapLayout.ts` | 90 | 81.48 | 95 | Unit: line 42 | None |
| `mapRenderer.ts` | 98.82 | 58.69 | 99 | Unit: line 142 — ANSI color in map render | None |
| `messages.ts` | 100 | 100 | 100 | Already complete | — |
| `narrativeKeys.ts` | 69.49 | 64.44 | 90 | Unit: getContradictionReport(); updateContradiction() round-trip; lines 208–277 | None |
| `narratorVoice.ts` | 79.66 | 72.5 | 90 | Unit: low-HP voice trigger; zone-specific voice × 13 zones | None |
| `npcInitiative.ts` | 100 | 64.61 | 100 | Integration: lines 153, 170–243, 257 — patrol-cycle + initiative cooldown | None |
| `parser.ts` | 100 | 100 | 100 | Already complete; add fuzz | — |
| `playerMonologue.ts` | 83.17 | 74.73 | 90 | Snapshot: blind-class test × 7; repeat-detection | None |
| `richText.ts` | 88.88 | 100 | 95 | Unit: line 15 | None |
| `setBonuses.ts` | 95.45 | 91.66 | 98 | Unit: lines 115, 144 | None |
| `skillBonus.ts` | 92.3 | 90 | 95 | Unit: line 74 | None |
| `spawn.ts` | 97.01 | 97.56 | 99 | Unit: line 31 | None |
| `stealth.ts` | 100 | 75 | 100 | Unit: branch — no-light-source path | None |
| `supabaseMock.ts` | 10.75 | 2.27 | 60 | Unit: resetDevDb(); isDevMode(); table state isolation | None |
| `terminalCreation.ts` | 93.91 | 89.74 | 97 | Integration: all stat choices at levels 3/6/9; rebirth path | None |
| `terminalDeath.ts` | 95.32 | 75 | 98 | Integration: line 210 — death at cycle 1 | None |
| `traits.ts` | 91.66 | 75 | 95 | Unit: lines 127–129, 143–144 | None |
| `wanderers.ts` | 86.25 | 68.51 | 92 | Unit: lines 75, 81 — multi-wanderer zone conflict | None |
| `world.ts` | 92.3 | 81.48 | 95 | Unit: lines 199, 281, 292, 325 | None |
| `worldEvents.ts` | 78.94 | 67.18 | 90 | Integration: act 2/3 trigger; event expiry | None |

### `lib/actions/` — Verb Handlers

| File | Stmt% | Branch% | Target Stmt% | Test Types Needed |
|------|-------|---------|-------------|------------------|
| `combat.ts` | 48.97 | 42.05 | 75 | Integration: per-ability handler × 7 classes; flee paths; noise encounter; loot-roll branches |
| `craft.ts` | 91.83 | 84.61 | 95 | Integration: lines 78–80 — partial-material path |
| `examine.ts` | 90.25 | 80.64 | 95 | Integration: lines 137, 284, 288, 374 |
| `items.ts` | 87.22 | 72.22 | 92 | Integration: lines 573, 655, 666–673 — drop-in-combat; use-on-self vs. use-on-enemy |
| `movement.ts` | 78.14 | 73.81 | 90 | Integration: cycleGate block; fear-check abort; zone-gate rejection |
| `social.ts` | 78.02 | 73.35 | 88 | Integration: chat with no NPC; ask/tell/say sequence |
| `survival.ts` | 92.85 | 84.21 | 97 | Integration: lines 86–87 |
| `system.ts` | 81.71 | 63.41 | 90 | Integration: lines 391, 401, 492–493 — map/help/status edge cases |
| `trade.ts` | 79.06 | 64.75 | 90 | Integration: vendor-budget-exhausted sell; unwanted-item sell |
| `travel.ts` | 91.48 | 80 | 95 | Integration: lines 45, 159–160 — fast-travel with no waypoints |
| `types.ts` | 0 | 0 | N/A | Type-only — no tests needed |
| `vendorDialogue.ts` | 54.54 | 50 | 90 | Unit: all 4 functions with empty/undefined inputs |

### `components/` — UI Layer

| File | Stmt% | Target% | Test Types Needed |
|------|-------|---------|------------------|
| `CharacterCreation.tsx` | 0 | 70 | RTL: render all 7 class options; stat allocation; submit |
| `CommandInput.tsx` | 0 | 80 | RTL: submit command; history navigation; disabled state |
| `ErrorBoundary.tsx` | 0 | 80 | RTL: catch and display error; recover |
| `GameLayout.tsx` | 0 | 60 | RTL: renders with children |
| `RemnantLogo.tsx` | 0 | 60 | RTL: renders without error |
| `Sidebar.tsx` | 0 | 60 | RTL: renders with player state mock |
| `Terminal.tsx` | 0 | 80 | RTL: renders ANSI-colored messages; scroll-to-bottom |
| `tabs/DataTab.tsx` | 0 | 70 | RTL: renders with mock player + room data |
| `tabs/InventoryTab.tsx` | 0 | 70 | RTL: renders item list; empty state |
| `tabs/StatsTab.tsx` | 100 | 100 | Already complete |
| `tabs/TabBar.tsx` | 100 | 100 | Already complete |
| `tabs/WorldMapTab.tsx` | ~85 | 90 | Unit: WorldMapTab.test.tsx extension (31 tests existing) |

---

## Per-Zone Playtest Scripts

### Zone A — The Crossroads (`data/rooms/crossroads.ts`)
Starting room: `cr_01_approach`

**Required pass scenarios** (each is a `PlayerSession` test sequence):

1. **Golden Path Navigation**: Walk every room in the zone (15 rooms minimum per zone-cohesion test). Assert each room transition produces a non-empty room description. Assert no room loops back unexpectedly.

2. **NPC: Marta Food Vendor** (`cr_05_marketplace`, npcId `marta_food_vendor`): `talk marta` → enter dialogue tree → purchase food (trade) → confirm inventory updated → confirm currency deducted. Assert `session.hasItem('canned_food')` after purchase.

3. **NPC: Sparks Radio Repair** (`cr_06_radio_row`, npcId `sparks_radio_repair`): Full quest tree — initial meeting → quest accepted (questFlag `sparks_quest_active`) → return with `signal_booster` → assert `sparks_quest_final` node entered via ENGINE_ENTRY_NODES path → assert quest-complete flag set.

4. **NPC: Patch** (named NPC with dialogue tree): Full conversation tree — enter from startNode → exhaust all non-cycleGated branches → assert no orphan targetNodes (covered by dialogueHealth) → assert faction rep grant if applicable.

5. **Combat: Hollow Encounter at `cr_03_crossroads_camp`** (if hollowEncounter defined): Use `forceSpawn: true`. Enter room → assert combat active → execute `attack` 10 times with seeded RNG → assert fight terminates (not MAX_TURNS) → assert either player dead or enemy defeated.

6. **Item Usage: Crossroads consumables**: Pick up any crossroads-spawned consumable → use it in non-combat → assert HP change or status effect applied → assert item consumed from inventory.

7. **Lock/Key path**: Identify any `lockedBy` richExit in zone → attempt movement without key (assert blocked message) → acquire key → attempt movement (assert success).

8. **Hidden passage**: Identify any `discoverSkill` richExit in zone → attempt movement with low skill (assert fail or hidden) → with high-skill character → assert discovery message and access.

9. **Cycle-gate boundary**: Any room with `cycleGate` in crossroads → verify cycle-1 player blocked → verify cycle-3 player passes. (Most crossroads rooms have no cycleGate — confirm by inspection.)

10. **NPC: Bridge Keeper Howard** (river_road border): `talk howard` → complete negotiation branch → assert `questFlag` set if applicable. (Howard is at river_road zone entry but crossroads players encounter him first.)

---

### Zone B — The River Road (`data/rooms/river_road.ts`)
Starting room: `rr_01_west_approach`

**Required pass scenarios**:

1. **Golden Path Navigation**: Traverse all 23+ rooms. Assert every room has a description. Assert no ANSI escape codes appear raw (use `richText.ts` rendering check).

2. **NPC: Bridge Keeper Howard** (`rr_05_bridge_approach`, npcId `bridge_keeper_howard`): Negotiation encounter — `talk howard` → select negotiation branch (requires negotiation skill check) → success path: bridge open, assert exit unlocked → failure path: assert rejection message.

3. **NPC: Travelling Merchant** (`rr_02_east_caravan_staging`, npcId `traveling_merchant`): Full trade session — `trade merchant` → list wares → buy one item → sell one item → assert vendor budget decremented → `leave` or `done` to end session → assert vendorFarewell fires.

4. **Combat: Accord Sentry River** (`npcId accord_sentry_river`): This NPC is listed in npcSpawns. Approach → if hostile: combat sequence with seeded RNG → assert conclusion → if non-hostile: `talk` → assert dialogue or refusal.

5. **Environmental modifier**: Identify any river_road room with `combatFlags` or `environmentModifiers` (e.g., `combat_narrow_passage` on bridge) → trigger combat in that room → assert modifier messages appear in log.

6. **Quest flag propagation**: River Road has multiple quest-flag-setting room extras (e.g., `found_r1_sequencing_data` in stacks, but river_road has flag-setting extras too — verify from room data). Trigger the extra → assert questFlag set on player.

7. **Wanderer encounter**: Set `forceSpawn: true` with a high wanderer-encounter zone → walk 5+ rooms → assert wanderer encounter fires at least once → assert wanderer dialogue or combat resolves cleanly.

8. **Death in zone**: Set player HP to 1 → enter a room with enemies → assert death triggers `terminalDeath.ts` sequence → assert death prose fires → assert cycle snapshot saved (mock DB verify).

9. **Faction reputation effect**: Identify a river_road NPC with `requiresRep` gate → test with rep below threshold (dialogue branch hidden) → test with rep at threshold (branch visible) → assert dialogue branch condition.

10. **Full save/load round-trip in zone**: After completing 3+ actions in zone, call `session.snapshot()` → create a new session → `session.restore(snap)` → assert player is in same room with same inventory and questFlags.

---

## Eval Rubrics

### Rubric 1: Narrative Quality (applies to deathProse, terminalCreation, terminalDeath)

Each output is scored 1–5 on each dimension. A score of 3 or higher on all dimensions is passing.

| Dimension | Score 5 | Score 3 | Score 1 |
|-----------|---------|---------|---------|
| Voice specificity | Uses post-collapse sensory detail unique to this room/zone | Generic but not cliche | Placeholder-level ("you died") |
| Show-don't-tell | Creates atmosphere through image/sound/texture | Mixed showing and telling | Tells emotion without imagery |
| Class differentiation | Player class unmistakably present in word choice | Slight class flavor | Generic across all classes |
| Pacing | Sentences vary in length; rhythm matches emotional content | Uniform length | Wall of similar sentences |
| No verbal tics | Zero instances of "specific [adjective]", "methodically", tautological openers | 1–2 instances | 3+ instances |

**Application method**: Sample 20 death-prose outputs (10 zones × 2 death causes). Score each manually. Record in `evaluation/narrative-review/narrative-quality-scores.md`.

**Automated gate**: `tests/eval/narrativeSnapshotRegistry.test.ts` uses `toMatchInlineSnapshot()` for all prose variants. Any prose change that fails snapshot = requires manual rubric re-scoring before merge.

---

### Rubric 2: Combat Feel

| Dimension | Pass | Warning | Fail |
|-----------|------|---------|------|
| Fight duration | 95% of fights end in 3–12 turns | >5% outside 3–12 | Any fight goes MAX_TURNS (200) |
| Outcome variety | All 3 outcomes (clean win, close win, loss) observed in 20 fights per class | Any class never loses at level 1 | Any class wins 100% at level 1 |
| NaN/Inf damage | Zero instances | — | Any NaN/Inf |
| Status-effect readability | Every condition application mentions condition name and duration | — | Any condition applied silently |
| Enemy-specific behavior | Screamer, Whisperer, Hive Mother each behave distinctly (messages reference their special mechanic) | — | Any boss-tier enemy behaves identically to base shuffler |

**Automated gate**: `tests/eval/combatMatrix.test.ts` enforces: zero crashes, finite win rates, no class sweeps level 1. Duration distribution check is new (P2-C).

---

### Rubric 3: Dialogue Coherence

| Dimension | Pass | Fail |
|-----------|------|------|
| NPC voice consistency | Same NPC uses consistent vocabulary register across all nodes in their tree | NPC contradicts their own established register |
| Faction alignment | NPC dialogue reflects their faction's values without stating them explicitly | NPC speeches their faction manifesto |
| Branch meaningfulness | Each branch option leads to a meaningfully different outcome | Two branches lead to identical next-node |
| Flag round-trip | Every `requiresFlag` used in a branch is reachable via at least one `setFlag` path | Any requiresFlag with no setter (caught by dialogueHealth test 6) |
| Smart quotes | Zero curly/smart quotes | Any Unicode curly quotes |

**Automated gate**: `tests/eval/dialogueHealth.test.ts` covers all automated checks. Manual rubric applies to voice-consistency and faction-alignment only.

---

### Rubric 4: World Consistency

| Dimension | Pass | Fail |
|-----------|------|------|
| Cross-zone NPC uniqueness | No NPC ID appears in two different zone files' static `npcs` arrays | Any cross-zone NPC duplication |
| Room description ↔ NPC presence | No room description hard-codes an NPC name when spawn probability < 1.0 | Any room with spawnChance < 1.0 mentioned by name in static description |
| Faction tone per zone | Zone with a dominant faction (e.g., Covenant zone = Covenant tone) uses faction-consistent vocabulary | Zone faction prose contradicts expected tone |
| Exit sign consistency | Every described exit in room prose has a corresponding entry in `exits` or `richExits` | Prose describes "a door to the north" but no north exit exists |

**Automated gate**: Content cross-ref validator (T1-A) checks cross-zone NPC uniqueness and NPC-name-in-description with low-spawn-probability. Others are manual.

---

## Tooling Needs

### T1-A: NPC-ID Cross-Reference Validator
**File**: `scripts/validate-npc-cross-refs.ts`

Extends the existing `scripts/validate-consistency.ts` pattern. Reads all room files, extracts every `npcId` value from `npcSpawns` arrays and static `npcs` arrays. Loads `data/npcs.ts` and builds the set of known NPC IDs. Reports:
1. NPC IDs in rooms not defined in NPCS (potential runtime gap — currently zero, but must stay zero)
2. Named NPCs in NPCS (`isNamed: true`) with no corresponding dialogue tree (covered by `dialogueHealth` test 8, but this script produces a human-readable report)
3. Room descriptions that contain an NPC's `name` string when that NPC has `spawnChance < 1.0` (hard-code-in-prose detection per LESSONS.md rule 2)

Output: JSON + human-readable console, exit 1 on any finding. Wire into `package.json` `"validate"` script alongside existing checks.

Estimated effort: S (2–3 hours). No new dependencies.

---

### T1-B: Schema-Drift Detector
**File**: `scripts/validate-schema-drift.ts`

Reads `lib/gameEngine.ts` and extracts the `_savePlayer()` payload keys (the existing Check 1 in `validate-consistency.ts` does this already). Additionally:
1. Reads `lib/supabaseMock.ts` and extracts the column names in `freshTables()` mock table definitions.
2. Computes the diff: columns in mock that don't exist in any migration SQL, and columns in migration SQL that don't exist in mock.
3. Reads `lib/gameEngine.ts` `loadPlayer()` and extracts every column name read from the DB result.
4. Cross-references `_savePlayer()` payload keys, `loadPlayer()` column reads, migration columns, and mock columns — any disagreement is reported.

Output: JSON + console. Exits 1 on any drift. This is the test that would have caught both production schema bugs described in LESSONS.md.

Wire into CI pipeline as a required check alongside `pnpm test:ci`.

Estimated effort: S (3–4 hours). No new dependencies.

---

### T1-C: Prose Snapshot Registry
**File**: `tests/eval/narrativeSnapshotRegistry.test.ts`

Imports all prose-generating functions: `getDeathProse` from `lib/deathProse.ts`, `getPressureNarration` from `lib/hollowPressure.ts`, `getTerminalCreationText` from `lib/terminalCreation.ts`, `getTerminalDeathText` from `lib/terminalDeath.ts`, `getNarratorVoice` from `lib/narratorVoice.ts`, and monologue generators from `lib/playerMonologue.ts`.

For each function, calls it with deterministic inputs (all zone types, all character classes, fixed seeds) and stores the outputs as `toMatchInlineSnapshot()` assertions. The first run auto-populates the snapshots. Subsequent runs catch unintentional prose drift.

Snapshots are stored inline in the test file (not in `__snapshots__/` directories) so diffs are code-reviewed as part of PRs.

Run under `vitest.eval.config.ts` (on-demand, not in CI default run).

Estimated effort: M (5–6 hours to map all function signatures and generate all call patterns).

---

### T1-D: RNG Distribution Analyzer
**File**: `tests/eval/rngDistribution.test.ts`

Uses `withSeededRandom` from `lib/testing/seededRng.ts` to run 10,000 rolls of:
- `roll1d10()` — assert uniform distribution (each value 8%–12% of total)
- `rollDamage([1, n])` for n = 3, 6, 8, 10, 12 — assert min=1, max=n always reachable, distribution within ±15% of expected uniform
- `rollCheck(dc, modifier)` for dc in [5, 8, 10, 12, 15], modifier in [-2, 0, 2, 4] — assert pass rate matches theoretical binomial within 5% tolerance

Reports outliers as warnings (not failures) since slight non-uniformity is acceptable in game RNG.

Estimated effort: S (2–3 hours).

---

### T1-E: Playtest Replay Harness Extension
**File**: Extend `tests/playtest/harness.ts`

Add two methods to `PlayerSession`:
1. `teleport(roomId: string): void` — sets `player.currentRoomId` and `currentRoom` directly, bypassing movement logic. Needed for playtest scenarios that need to position the player without navigating there.
2. `setQuestFlag(flag: string, value: boolean | string | number): void` — sets a questFlag directly on the player state. Needed for playtest scenarios that test mid-quest states without replaying the entire setup.

These are test-only extensions. They do not call `_savePlayer()`.

Note: `PlayerSession` has FROZEN API status in the file header. Adding methods is additive (not breaking). Confirm with Ryan before modifying the harness API.

Estimated effort: S (1–2 hours).

---

## Risks & Known Failure Patterns

### Risk 1: Narrative Snapshot Brittleness
Prose snapshots will fail on any intentional prose edit. Maintainability cost: every prose PR requires a snapshot update pass (`vitest -u`). Mitigation: scope snapshots to deterministic inputs only; do not snapshot random-pick outputs without fixing the seed first.

### Risk 2: supabaseMock.ts Divergence (from LESSONS.md)
`supabaseMock.ts` `freshTables()` diverges from production schema. The schema-drift detector (T1-B) will catch this going forward, but it doesn't retroactively fix the current divergence in `game_log` table. The first run of T1-B will report this finding; it must be resolved before Phase 3 integration tests are added.

Note: Confirmed from LESSONS.md — `game_log` table was dropped in production by `20260329000001_rls_world_state.sql` but the mock still references it. The P3-F task (supabaseMock unit tests) will expose this gap explicitly.

### Risk 3: Component Tests Require jsdom + React Testing Library
`components/` tests require the full RTL stack. The project already has `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event` in devDependencies, and `vitest.config.ts` uses `environment: 'jsdom'`. No new dependencies needed. Risk: RTL tests for terminal ANSI rendering may need custom matchers to handle `<span>` wrapping of ANSI color codes.

### Risk 4: Playtest Harness Bash-Blocked in Worktrees
From LESSONS.md (feedback_howler_bash_blocked_in_worktree): if a Howler hits Bash-denied in worktree, pre-allow bash or route the task to main context. Phase 4 Howlers running playtest scenarios must have bash pre-allowed for `pnpm test` execution.

### Risk 5: Vitest Globs Into Worktrees
From LESSONS.md (feedback_vitest_worktree_glob): `.claude/worktrees/**` must be in `vitest.config.ts` exclude list. This is already noted in `vitest.config.ts` exclude — confirm it remains in place before Phase 3 and 4 parallel runs.

### Risk 6: Static Dialogue Analysis Misses Room→NPC ID Typos (from memory feedback_room_npc_id_typos)
Walking dialogue trees statically doesn't catch typos in `room.npcSpawns[].npcId` or `dialogueTree` keys. The NPC-ID cross-ref validator (T1-A) addresses this by runtime cross-referencing all room NPC references against NPCS keys. The current cross-ref shows zero missing entries, but this must be run after every content convoy.

### Risk 7: Schema Drift in CI
The existing `validate-consistency.ts` Check 1 parses `_savePlayer()` payload with a regex that looks for `const payload = {`. If the payload is ever refactored into a helper function or spread across assignments, the regex will silently stop working. T1-B should verify the regex matches before reporting "no drift".

### Risk 8: Combat Matrix Missing Conditions and Abilities
The existing `combatMatrix.test.ts` uses raw `playerAttack/enemyAttack` loops without invoking class abilities or applying conditions. This means a bug in ability dispatch (48.97% coverage in `lib/actions/combat.ts`) won't be caught by the matrix. Phase P2-C must add an ability-exercising variant.

---

## Definition of Done

The game is fully evaluated when ALL of the following are true:

**Content correctness:**
- [ ] `pnpm test:eval` runs all 5 eval files (plus new files from P2) with zero failures
- [ ] `pnpm validate` (extended with T1-A and T1-B) runs with zero findings
- [ ] NPC-ID cross-ref validator reports zero missing NPC definitions
- [ ] Schema-drift detector reports zero divergence between `_savePlayer()`, `loadPlayer()`, mock, and migrations
- [ ] mapIntegrity: zero orphaned rooms, zero broken exits, zero invalid gate references
- [ ] dialogueHealth: zero orphan targetNodes, zero unreachable nodes (excluding ENGINE_ENTRY_NODES), zero flag round-trip failures, zero smart quotes

**Combat & mechanics:**
- [ ] `lib/actions/combat.ts` ≥75% statement coverage
- [ ] `lib/combat.ts` ≥92% statement coverage
- [ ] `lib/abilities.ts` ≥95% statement coverage
- [ ] `lib/conditions.ts` ≥90% statement coverage
- [ ] Combat matrix: zero crashes, finite win rates, no single-class sweep at level 1
- [ ] Ability-specific matrix: all 7 class abilities fire at least once across 7×16×5×3 scenarios

**Narrative systems:**
- [ ] Prose snapshot registry established (all 5 prose-generating modules snapshotted)
- [ ] `lib/narrativeKeys.ts` ≥90% statement coverage
- [ ] `lib/playerMonologue.ts` ≥90% statement coverage
- [ ] `lib/narratorVoice.ts` ≥90% statement coverage
- [ ] `lib/echoes.ts` ≥90% statement coverage
- [ ] Narrative quality rubric: all sampled prose scores ≥3 on all 5 dimensions

**Parser & input:**
- [ ] `lib/parser.ts` remains 100% statement coverage
- [ ] Parser fuzz test: no throw for any of 200 sampled inputs (known-word combos + garbage)
- [ ] All action types in `lib/actions/types.ts` have at least one integration test exercising the handler

**World state & persistence:**
- [ ] `save-load-roundtrip.test.ts` covers retry path and schema-drift field detection
- [ ] Death DB persistence test confirms `is_dead=true` reaches mock DB
- [ ] Ending DB persistence test confirms cycle snapshot written before player delete
- [ ] supabaseMock.ts `freshTables()` matches current production schema (zero drift in T1-B)

**Tactics & emergent play:**
- [ ] All 6 playtest scenario files pass (P4-A through P4-F)
- [ ] Crossroads full playtest: all 10 scenarios pass
- [ ] River Road full playtest: all 10 scenarios pass
- [ ] Stealth-run scenario completes the full stealth-path through at least 3 zones
- [ ] Social/diplomatic scenario completes at least 2 faction quest chains without combat
- [ ] Speedrun scenario reaches scar_14_the_core in ≤50 actions (seeded, forceSpawn:false)
- [ ] Completionist scenario activates all 4 endings (4 separate session runs)

**UI / terminal layer:**
- [ ] All 7 zero-coverage component files reach ≥60% statement coverage
- [ ] `Terminal.tsx` renders ANSI-colored messages without raw escape code leak (≥80%)
- [ ] `CommandInput.tsx` tests cover submit, history navigation, and disabled state (≥80%)
- [ ] `CharacterCreation.tsx` tests cover all 7 class selections and stat allocation (≥70%)

**Eval harness:**
- [ ] All eval rubrics (P5-A through P5-D) are documented with scoring criteria
- [ ] At least 10 sampled outputs manually scored against each rubric
- [ ] `pnpm test:eval` runtime remains under 30 seconds (prevents CI friction)

**Cross-cutting:**
- [ ] Overall statement coverage ≥85% (up from 75.96%)
- [ ] Overall branch coverage ≥75% (up from 66.95%)
- [ ] `pnpm test` passes with 0 failures
- [ ] `pnpm test:eval` passes with 0 failures
- [ ] `pnpm validate` exits 0
- [ ] `npx tsc --noEmit` exits 0
- [ ] Coverage thresholds in `vitest.config.ts` updated to: statements 80, branches 70, functions 75, lines 80

---

## Estimated Effort

| Phase | Howlers | Estimated Hours | Sequential or Parallel |
|-------|---------|----------------|------------------------|
| Phase 1 — Tooling (T1-A to T1-E) | 1–2 sequential | 10–14h total | Sequential |
| Phase 2 — Eval expansion (P2-A to P2-E) | 5 parallel | 6h wall-clock | Parallel |
| Phase 3 — Unit/integration gap (P3-A to P3-H) | 8 parallel | 8–10h wall-clock | Parallel |
| Phase 4 — Playtest scenarios (P4-A to P4-F) | 6 parallel | 8h wall-clock | Parallel |
| Phase 5 — Eval rubrics (P5-A to P5-D) | 1–2 sequential | 6h total | Sequential |
| **Total wall-clock** | | **~38–48h** | — |
| **Total dev-hours** | | **~80–100h** | — |

Phases 2 and 3 can overlap (different files). Phase 4 should start after Phase 3 stabilizes (tests passing). Phase 5 requires Phase 2's snapshot registry to be populated.

---

## Open Questions

1. **Prose snapshot granularity**: Should the narrative snapshot registry snapshot every single prose output variant (potentially thousands), or only one representative per trigger? Unresolved. Default: snapshot one variant per trigger-type × class × zone combination (bounded set). Blocks: P2-D.

2. **Combat matrix ability integration**: The P2-C ability-specific matrix requires `executeAction` dispatch rather than raw `playerAttack/enemyAttack`. This means using the `PlayerSession` harness, which requires a DB mock. Is `combatMatrix.test.ts` (eval suite, no harness) the right home for this, or should it move to `tests/playtest/`? Default: create a separate `tests/eval/abilityMatrix.test.ts` that uses a minimal PlayerSession. Blocks: P2-C.

3. **Eval rubric tooling**: Phase 5 rubrics are described as manual scoring processes. Does Ryan want them automated (LLM-as-judge API call) or kept as manual checklists? Default: manual checklists in markdown documents, no API calls. Blocks: P5-A through P5-D.

4. **Coverage threshold increase**: The plan proposes raising coverage thresholds from the current floor (60% statements, 50% branches) to 80%/70% after completion. Should these thresholds be updated incrementally during Phase 3 or only at the end? Default: raise only at completion of all phases to avoid blocking mid-flight. Blocks: nothing, but affects CI configuration.

5. **`lib/supabaseMock.ts` parity fixes**: T1-B will surface the `game_log` mock divergence. Fixing the mock is outside this plan's scope (it's a production code change, not a test change). Ryan needs to confirm whether fixing mock parity is in-scope for the same convoy as the test work, or a separate task. Default: T1-B reports the finding, fixing is a separate issue. Blocks: P3-F (supabaseMock unit tests will fail if mock is wrong).

---

## File Ownership Matrix (for Gold SPLIT.md)

| Phase/Task | Creates | Modifies |
|-----------|---------|----------|
| T1-A | `scripts/validate-npc-cross-refs.ts` | `package.json` (add to validate script) |
| T1-B | `scripts/validate-schema-drift.ts` | `package.json` (add to validate script) |
| T1-C | `tests/eval/narrativeSnapshotRegistry.test.ts` | — |
| T1-D | `tests/eval/rngDistribution.test.ts` | — |
| T1-E | — | `tests/playtest/harness.ts` (additive: teleport, setQuestFlag) |
| P2-A | — | `tests/eval/mapIntegrity.test.ts` |
| P2-B | — | `tests/eval/dialogueHealth.test.ts` |
| P2-C | `tests/eval/abilityMatrix.test.ts` | — |
| P2-D | `tests/eval/narrativeSnapshotRegistry.test.ts` | — |
| P2-E | `tests/eval/rngDistribution.test.ts` | — |
| P3-A | `tests/integration/combat-action-abilities.test.ts` | — |
| P3-B | `tests/integration/social-vendor-deep.test.ts` | — |
| P3-C | `tests/integration/trade-travel-deep.test.ts` | — |
| P3-D | `tests/integration/echoes-worldevents-deep.test.ts` | — |
| P3-E | `tests/integration/narrativekeys-voice-deep.test.ts` | — |
| P3-F | `tests/integration/supabasemock-inventory-deep.test.ts` | — |
| P3-G | `tests/integration/gameengine-edge-persist.test.ts` | — |
| P3-H | `tests/unit/components.test.tsx` | — |
| P4-A | `tests/playtest/zone-crossroads-full.test.ts` | — |
| P4-B | `tests/playtest/zone-river-road-full.test.ts` | — |
| P4-C | `tests/playtest/strategy-stealth-run.test.ts` | — |
| P4-D | `tests/playtest/strategy-social-diplomatic.test.ts` | — |
| P4-E | `tests/playtest/strategy-speedrun.test.ts` | — |
| P4-F | `tests/playtest/strategy-completionist.test.ts` | — |
| P5-A | `evaluation/narrative-review/narrative-quality-rubric.md` | — |
| P5-B | `evaluation/narrative-review/combat-feel-rubric.md` | — |
| P5-C | `evaluation/narrative-review/dialogue-coherence-rubric.md` | — |
| P5-D | `evaluation/narrative-review/world-consistency-rubric.md` | — |

**No file appears in two tasks.** (Gate 5c: zero conflicts.)

Note: T1-C and P2-D both reference `tests/eval/narrativeSnapshotRegistry.test.ts`. These are the same task — T1-C is the tooling spec, P2-D is the execution task. Assign to the same Howler.

Note: T1-D and P2-E both reference `tests/eval/rngDistribution.test.ts`. Same resolution — assign to the same Howler.
