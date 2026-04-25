# SPLIT: playtest-suite-0424

**Branch:** `dev/followup-0426`
**Base commit:** `35f157a334120761ce2b6b1d04fbc159ca19ed76`
**Plan:** `PLAN.md` (written 2026-04-24)
**Howlers:** 6 (H1–H6)

---

## Dispatch Sequence — READ FIRST

This convoy uses **two-phase dispatch**. H1 is foundational. Its `PlayerSession` API is consumed by
every other Howler. H2–H6 cannot pass TypeScript compilation until `harness.ts` is on disk.

**Phase 1 — Drop H1 alone. Wait for H1 to complete and its branch to merge before Phase 2.**

**Phase 2 — Drop H2, H3, H4, H5, H6 in parallel** once H1's branch is merged to `dev/followup-0426`.

Do not skip this gate. Dropping H2–H6 before H1 completes produces import errors that Orange
cannot diagnose and that require manual intervention to unblock.

---

## File Ownership Matrix

| Howler | Pillar | Creates | Modifies |
|--------|--------|---------|----------|
| H1 | Harness (foundation) | `tests/playtest/harness.ts` | none |
| H2 | Enforcer path (combat) | `tests/playtest/enforcer-path.test.ts` | none |
| H3 | Broker path (social) | `tests/playtest/broker-path.test.ts` | none |
| H4 | Wraith path (stealth/exploration) | `tests/playtest/wraith-path.test.ts` | none |
| H5 | Full verb coverage | `tests/playtest/verb-coverage.test.ts` | none |
| H6 | Cross-cutting scenarios | `tests/playtest/cross-cutting.test.ts` | none |

---

## Conflict Audit

Union of all owned files across H1–H6:

```
tests/playtest/harness.ts
tests/playtest/enforcer-path.test.ts
tests/playtest/broker-path.test.ts
tests/playtest/wraith-path.test.ts
tests/playtest/verb-coverage.test.ts
tests/playtest/cross-cutting.test.ts
```

**Result: zero overlaps.** Each file appears in exactly one Howler's CREATE column.
H2–H6 import from `harness.ts` (read-only) but do not modify it.
No source files outside `tests/playtest/` are touched by any Howler.

---

## Frozen Harness API Contract (H2–H6 reference)

All Phase 2 Howlers must import exclusively from `../playtest/harness`:

```typescript
import {
  PlayerSession,
  CharacterSpec,
  SessionSnapshot,
  makeTestEngine,
  assertSnapshotEqual,
} from '../playtest/harness'
```

Never construct `GameEngine` directly in playtest files. Never import `@/lib/gameEngine` in
any playtest test file.

The full API surface is defined in PLAN.md §"Frozen Harness API":

- `PlayerSession` — class: `init()`, `cmd()`, `walk()`, `snapshot()`, `expectState()`,
  `expectMessage()`, `expectNoError()`, `reset()`
- `makeTestEngine()` — factory silencing all narrative pipeline modules; shims `_applyPopulation`
  to return rooms unchanged (deterministic NPC/item presence)
- `assertSnapshotEqual(a, b)` — deep equality on `SessionSnapshot`; throws on any field mismatch
- Types: `CharacterSpec`, `SessionSnapshot`

If H1 discovers during implementation that the engine requires a different signature than PLAN.md
specifies, H1 delivers the closest conformant API and documents the discrepancy in its commit
message. H2–H6 adapt to whatever H1 actually ships.

---

## Per-Howler Sections

### H1 — Harness (Phase 1 — alone)

**Scope:** Implement `tests/playtest/harness.ts` with the frozen API. Silence all narrative
pipeline modules (`hollowPressure`, `npcInitiative`, `companionSystem`, `factionWeb`,
`playerMonologue`, `narratorVoice`, `worldEvents`). Shim `_applyPopulation` at the engine level
to return rooms unchanged. Wire the Supabase dev mock using the same pattern as
`gameEngine-core.test.ts`. Include a `describe('harness smoke')` self-test block.

**Files (owned):**
- CREATE: `tests/playtest/harness.ts`

**Depends on:** nothing

**Self-test requirement:** Instantiate `PlayerSession` with Enforcer spec (vigor 8), call
`cmd('look')`, assert `messages.length > 0`, `snapshot().roomId === 'cr_01_approach'`,
`snapshot().hp === 20`.

**Key risk:** `createCharacter()` requires a fully wired Supabase mock chain plus an auth mock
returning a user object. Mirror the `makePlayersBuilder` pattern from `gameEngine-core.test.ts`
exactly — approximately 60 lines of scaffolding. Any missing piece fails silently with "Not
authenticated". See PLAN.md §H1 Pre-mortem.

---

### H2 — Enforcer Path (Phase 2)

**Scope:** 50-room playthrough for Kael Morrow (enforcer, vigor 8, maxHp 20). Zones:
crossroads → river_road → the_breaks → salt_creek → river_road return → crossroads. Combat
milestones: 5 distinct enemy encounters; at least one each of called shot (`attack_called`),
ability (`overwhelm`/`abilityUsed`), defend (`defendingThisTurn`), wait (`waitingBonus === 3`),
analyze; loot pickup; equip/unequip; `stats`; `equipment` system command.

**Files (owned):**
- CREATE: `tests/playtest/enforcer-path.test.ts`

**Depends on:** H1 merged

**Frozen API import:** `../playtest/harness`

**Key risk:** The Breaks entries may have survival-gate DCs that Kael (low wits) cannot pass.
Read `richExits` in the actual zone files before committing to the route. Mock combat via
`vi.mock('@/lib/combat', ...)` to deterministic outcomes — pattern is in
`tests/integration/combat.test.ts`. See PLAN.md §H2 Pre-mortem.

---

### H3 — Broker Path (Phase 2)

**Scope:** 50-room playthrough for Sable Rein (broker, presence 6, shadow 6, maxHp 8). Zones:
all 15 crossroads rooms → all accessible Covenant rooms (route around rep-gated exits) → 15
Duskhollow rooms. Milestones: 8 NPC dialogue trees with node-transition assertions; `onEnter`
effects (setFlag, grantItem, grantRep, grantNarrativeKey) each asserted; full trade session
(`buy` + `sell`); `give` to NPC advancing quest flag; `flee` combat; `rest`; `travel`
fast-travel; `rep`; `quests` commands.

**Files (owned):**
- CREATE: `tests/playtest/broker-path.test.ts`

**Depends on:** H1 merged

**Frozen API import:** `../playtest/harness`

**Key risk:** Covenant has `reputationGate` exits requiring rep >= 1; Sable starts at 0. Audit
Covenant room `richExits`, seed rep in test setup or route around gated exits. For `give`, use
Patch at `cr_07_patch_clinic` — documented quest interactions in release notes. See PLAN.md §H3
Pre-mortem.

---

### H4 — Wraith Path (Phase 2)

**Scope:** 50-room playthrough for Vesna (wraith, shadow 6, wits 6, maxHp 8). Zones: crossroads
(including locked basement exit) → the_pine_sea → the_stacks → the_deep. Milestones: 10+
`examine_extra` calls with extras state assertions; 3 successful skill-check extras (DC <= 6);
`sneak` suppresses encounter; `unlock` on locked exit, subsequent move succeeds; `search`
reveals item; `stash`/`unstash` round-trip; `read` lore item; `drink` at water source; `camp`
if `campfireAllowed` room found.

**Files (owned):**
- CREATE: `tests/playtest/wraith-path.test.ts`

**Depends on:** H1 merged

**Frozen API import:** `../playtest/harness`

**Key risk:** The Stacks and The Deep have rooms with `cycleGate: 2` or `questGate`. Read every
room definition in both zone files, enumerate gated rooms, route around them. Wraith
`shadowstrike` sets `cantFlee = true` — only test in encounters where enemy HP is mockable to
low values. See PLAN.md §H4 Pre-mortem.

---

### H5 — Verb Coverage (Phase 2)

**Scope:** Cover every verb in the 42-verb matrix not already owned by H2–H4: `swim`, `climb`,
`examine_spatial` (look under/behind/inside), `smell`, `listen`, `touch`, `journal`, `drop`,
`craft`, `map`, `help`, `hint`, `dialogue_blocked`. Spot-check `the_ember` (`em_01_the_approach`)
and `the_dust` (`du_01_dust_edge`) to push zone coverage to 11 of 13.

**Files (owned):**
- CREATE: `tests/playtest/verb-coverage.test.ts`

**Depends on:** H1 merged

**Frozen API import:** `../playtest/harness`

**Key risk:** `craft` requires a recipe from `data/recipes.ts` with ingredients from
`data/items.ts`, seeded into test inventory. If recipe gates are complex, narrow to the simplest
available recipe. `swim`/`climb` returning a safe error message (no matching exit in room) is a
valid passing test — no crash and a message returned is sufficient. See PLAN.md §H5 Pre-mortem.

---

### H6 — Cross-Cutting Scenarios (Phase 2)

**Scope:** Six scenario groups in separate `describe` blocks with `beforeEach` resets.
(1) Save/load round-trip — `assertSnapshotEqual` before and after `_savePlayer`/`loadPlayer`.
(2) Interrupt handling — move/attack/inventory in wrong engine state all return blocked messages
without corrupting state. (3) Death/rebirth cycle — assert `totalDeaths === 1`, `cycle === 2`,
HP restored, ledger `discoveredRoomIds` persists after `rebirthWithStats()`. (4) Verb safety —
six invalid forms each in a separate `it` block; assert `type === 'error' | 'system'`, no
exception. (5) Boost stat — inject XP to level 3, trigger `_checkLevelUp()`, `cmd('boost vigor')`,
assert stat increases and `pendingStatIncrease === false`. (6) Restart gate — confirm prompt
step then `cmd('CONFIRM RESTART')` resets state.

**Files (owned):**
- CREATE: `tests/playtest/cross-cutting.test.ts`

**Depends on:** H1 merged

**Frozen API import:** `../playtest/harness`

**Key risk:** Save/load round-trip requires the Supabase mock to persist across three tables
(`players`, `player_ledger`, `player_inventory`). Copy `makePlayersBuilder` from
`save-load-roundtrip.test.ts` directly — approximately 80 lines. Do not reinvent. Use
`expect.assertions(N)` in verb-safety tests to guard against silent passes. See PLAN.md §H6
Pre-mortem.

---

## Coordination Notes

**Engine bug protocol.** If any Howler encounters a genuine engine defect mid-path, it must NOT
patch source code. Use `it.fails()` or `.skip` with a comment containing: symptom, expected
value, actual value, and recommended next-convoy fix target. The suite must pass overall; flagged
failures do not block merge. Defects become the next convoy's scope.

**No source code modifications.** Zero files outside `tests/playtest/` are touched by any
Howler. If an import path or type is missing, work around it with a local type assertion or a
targeted mock — do not edit engine files.

**Test runtime budget: under 60 seconds total.** Mitigation:
- Use `beforeAll` for expensive per-file state setup rather than `beforeEach`
- Batch assertions inline during the walk instead of separate `it` blocks per room
- Mock all Supabase async calls to resolve synchronously

**NPC presence.** The harness shims `_applyPopulation` to return rooms unchanged (static `npcs`
array, no random rolls). H3 must use NPC IDs that appear in the static `npcs: []` arrays of
Crossroads rooms, or coordinate with H1 on the shim strategy if needed.

---

## Integration and Merge Order

**Phase 1:**
1. H1 branch → merge to `dev/followup-0426`

**Phase 2 (after H1 merged):**
2. H2, H3, H4, H5, H6 → merge to `dev/followup-0426` in any order (no inter-dependencies among
   Phase 2 Howlers)

**Post-merge quality gate (after all 6 merged):**
- White + Gray + /diff-review run once on the combined diff
- Zero blockers required to proceed; coverage gaps are PR description warnings only
- Copper opens PR per project branch-protection rules

---

## Worktree Paths

```
~/.claude/parallel/playtest-suite-0424/worktrees/h1-harness
~/.claude/parallel/playtest-suite-0424/worktrees/h2-enforcer
~/.claude/parallel/playtest-suite-0424/worktrees/h3-broker
~/.claude/parallel/playtest-suite-0424/worktrees/h4-wraith
~/.claude/parallel/playtest-suite-0424/worktrees/h5-verb-coverage
~/.claude/parallel/playtest-suite-0424/worktrees/h6-cross-cutting
```

Branch pattern: `parallel/playtest-suite-0424/<howler-name>`
