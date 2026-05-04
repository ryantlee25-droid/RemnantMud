# SPLIT: eval-convoy-0503

_Written by Gold | 2026-05-03 | Source plan: PLAN-EVAL.md (27 tasks, 5 phases)_
_Supersedes previous SPLIT (convoy-2-gear)._

---

## Pre-Flight Checks (Main Context Must Verify Before Wave 1)

### P0 — Must fix before ANY Howler drops

**1. vitest.config.ts — partial worktree exclusion (P0 FIX REQUIRED)**

Current exclude list (line 12):
```
['**/node_modules/**', '**/dist/**', 'tests/eval/**', '.claude/worktrees/**']
```
Missing: `.claude/parallel/**` — the path used by this convoy.
Fix: add `.claude/parallel/**` to the exclude array in `/Users/ryan/projects/remnant/vitest.config.ts`.

**2. vitest.eval.config.ts — no worktree exclusion at all (P0 FIX REQUIRED)**

Current exclude list (line 17): `['**/node_modules/**', '**/dist/**']`
Missing both `.claude/worktrees/**` and `.claude/parallel/**`.
Fix: add both to the exclude array in `/Users/ryan/projects/remnant/vitest.eval.config.ts`.

Apply both fixes before Wave 1. These are 1-line edits; main context can do them directly.

### P1 — Verify before Wave 1

3. **Git state**: `git status` clean. No uncommitted changes.
4. **Base branch**: confirm HEAD commit. All Howlers branch from the same commit.
5. **`pnpm test` green**: 6,206 tests must pass. Phase 1 Howlers write new scripts; pre-existing failures confuse attribution.
6. **`pnpm test:eval` green**: 533 eval tests must pass before Phase 2 Howlers touch eval files.
7. **Worktree parent dir**: `mkdir -p ~/.claude/parallel/eval-convoy-0503/worktrees/`
8. **Worktree isolation guard** (per-Howler, every completion): run `git worktree list` after each Howler finishes. Verify the Howler's path is `~/.claude/parallel/eval-convoy-0503/worktrees/<name>`. If any Howler ran in the main repo path (`/Users/ryan/projects/remnant`), main is poisoned — stop all remaining Howlers and surface to Ryan before continuing.

---

## Open Questions (Blue Flagged 5 — Ryan Decides Before Dispatch)

| # | Question | Default | Blocks |
|---|----------|---------|--------|
| OQ-1 | Prose snapshot granularity: every variant vs. one per trigger×class×zone | One per trigger×class×zone (bounded set) | T1-C, P2-D |
| OQ-2 | Ability combat matrix home: expand `combatMatrix.test.ts` vs. new `tests/eval/abilityMatrix.test.ts` | New `tests/eval/abilityMatrix.test.ts` | P2-C |
| OQ-3 | Phase 5 rubrics: automated LLM-as-judge API calls vs. manual markdown checklists | Manual checklists, no API calls | P5-A through P5-D |
| OQ-4 | Coverage threshold raise: incremental during Phase 3 vs. end-of-all-phases only | Raise only at full completion, not mid-flight | `vitest.config.ts` thresholds update |
| OQ-5 | supabaseMock parity fix scope: same convoy vs. separate task | T1-B reports the finding; fix is a separate issue | P3-F (supabaseMock tests will expose the game_log divergence — Howler documents it, does not fix it) |

**Ryan must answer OQ-1 and OQ-2 before Wave 2 drops.** OQ-3, OQ-4, OQ-5 use defaults.

---

## Phase Flow

Blue's P1 → P2/P3 parallel → P4 sequential → P5 sequential flow is confirmed, with two
structural notes:

**Note 1 — T1-C/P2-D collapse**: PLAN-EVAL.md line 793 explicitly notes that T1-C and P2-D
both reference `tests/eval/narrativeSnapshotRegistry.test.ts`. These are the same Howler.
T1-C creates the registry (Phase 1 tooling task); that same Howler populates full class×zone
coverage (P2-D). This collapses one Phase 2 slot.

**Note 2 — T1-D/P2-E collapse**: Same pattern. Both reference `tests/eval/rngDistribution.test.ts`.
One Howler handles both. This collapses a second Phase 2 slot.

Result: Phase 2 is 3 Howlers (P2-A, P2-B, P2-C), not 5. P2-D and P2-E were absorbed into Phase 1.

```
Phase 1 — sequential (5 tasks, package.json conflict noted below)
    |
    ├── Phase 2 (3 Howlers parallel) ─────────────────────────────┐
    └── Phase 3 (8 Howlers parallel) ──────────────────────────┐  │
                                                                │  │
                                   Phase 4 (6 Howlers parallel)┘  │  ← waits for Phase 3 complete
                                                                   │
                                   Phase 5 (up to 4 parallel) ────┘  ← waits for Phase 2 complete
```

Phases 2 and 3 run concurrently — different file ownership, no conflicts.
Phase 4 waits for Phase 3 (unit test infrastructure must be stable before playtest expansion).
Phase 5 waits for Phase 2 (snapshot registry must exist before rubric work begins).

---

## File Ownership Matrix

### Wave 1 — Phase 1 Tooling (Sequential)

| Task | Howler | Creates | Modifies | Read-Only Inputs | Bash Commands |
|------|--------|---------|----------|-----------------|---------------|
| T1-A | howler-t1a | `scripts/validate-npc-cross-refs.ts` | `package.json` (`validate` script) | `data/rooms/*.ts`, `data/npcs.ts`, `scripts/validate-consistency.ts` | `tsx scripts/validate-npc-cross-refs.ts`, `grep -r npcId data/rooms/`, `pnpm test` |
| T1-B | howler-t1b | `scripts/validate-schema-drift.ts` | `package.json` (`validate` script) | `lib/gameEngine.ts`, `lib/supabaseMock.ts`, `supabase/migrations/*.sql`, `scripts/validate-consistency.ts` | `tsx scripts/validate-schema-drift.ts`, `tsx scripts/validate-consistency.ts`, `pnpm test` |
| T1-C+P2-D | howler-t1c | `tests/eval/narrativeSnapshotRegistry.test.ts` | — | `lib/deathProse.ts`, `lib/hollowPressure.ts`, `lib/terminalCreation.ts`, `lib/terminalDeath.ts`, `lib/narratorVoice.ts`, `lib/playerMonologue.ts`, `types/game.ts` | `pnpm test:eval`, `vitest -u` (snapshot population) |
| T1-D+P2-E | howler-t1d | `tests/eval/rngDistribution.test.ts` | — | `lib/testing/seededRng.ts`, `lib/dice.ts` | `pnpm test:eval` |
| T1-E | howler-t1e | — | `tests/playtest/harness.ts` (additive only: `teleport()`, `setQuestFlag()`) | `tests/playtest/harness.ts` (current API), `types/game.ts` | `pnpm test` |

**package.json conflict (T1-A and T1-B both modify `"validate"` script)**:
Run T1-A first, wait for it to complete, then run T1-B. T1-B reads T1-A's result and appends its own script reference. Do not run them in parallel.

**T1-E FROZEN API note**: `tests/playtest/harness.ts` header states FROZEN API. The two new methods are additive — no existing signatures change. Howler must not touch existing methods.

**Revised Wave 1 ordering**:
- Sub-wave 1a (parallel): howler-t1c, howler-t1d, howler-t1e (no package.json touches, fully independent)
- Sub-wave 1b (sequential): howler-t1a, then howler-t1b (package.json conflict)

Sub-waves 1a and 1b can run concurrently since 1a tasks don't touch package.json. Practical ordering: drop all 5 at once but instruct main context that T1-A and T1-B must not merge their package.json edits simultaneously.

---

### Wave 2 — Phase 2 Eval Expansion (Parallel, 3 Howlers)

Entry criteria: Phase 1 complete. `pnpm test:eval` passes with T1-C and T1-D additions. OQ-1 and OQ-2 answered by Ryan.

_P2-D and P2-E were absorbed into Wave 1. Wave 2 is 3 Howlers only._

| Task | Howler | Creates | Modifies | Read-Only Inputs | Bash Commands |
|------|--------|---------|----------|-----------------|---------------|
| P2-A | howler-p2a | — | `tests/eval/mapIntegrity.test.ts` | `data/rooms/*.ts`, `types/game.ts` | `pnpm test:eval` |
| P2-B | howler-p2b | — | `tests/eval/dialogueHealth.test.ts` | `data/npcs.ts`, `data/dialogueTrees.ts`, `data/rooms/*.ts`, `scripts/validate-npc-cross-refs.ts` (T1-A output) | `pnpm test:eval`, `tsx scripts/validate-npc-cross-refs.ts` |
| P2-C | howler-p2c | `tests/eval/abilityMatrix.test.ts` | — | `lib/actions/combat.ts`, `lib/abilities.ts`, `tests/playtest/harness.ts`, `types/game.ts`, `data/enemies.ts`, `tests/eval/combatMatrix.test.ts` | `pnpm test:eval` |

**Conflict check**: CLEAN. All three tasks touch different files.

**P2-B dependency note**: P2-B reads T1-A's output (`scripts/validate-npc-cross-refs.ts`). Ensure T1-A has been merged before P2-B drops.

---

### Wave 2 (concurrent) — Phase 3 Unit/Integration Gap Fill (Parallel, 8 Howlers)

Entry criteria: Phase 1 complete. `pnpm test` passes with T1-E additions.

Phase 3 runs concurrently with Phase 2. Drop Wave 3 Howlers simultaneously with Wave 2 Howlers.

| Task | Howler | Creates | Modifies | Read-Only Inputs | Bash Commands |
|------|--------|---------|----------|-----------------|---------------|
| P3-A | howler-p3a | `tests/integration/combat-action-abilities.test.ts` | — | `lib/actions/combat.ts`, `lib/abilities.ts`, `tests/playtest/harness.ts`, `types/game.ts`, `data/enemies.ts` | `pnpm test`, `pnpm test:coverage` |
| P3-B | howler-p3b | `tests/integration/social-vendor-deep.test.ts` | — | `lib/actions/social.ts`, `lib/actions/vendorDialogue.ts`, `data/npcs.ts`, `data/dialogueTrees.ts`, `tests/playtest/harness.ts` | `pnpm test`, `pnpm test:coverage` |
| P3-C | howler-p3c | `tests/integration/trade-travel-deep.test.ts` | — | `lib/actions/trade.ts`, `lib/actions/travel.ts`, `data/items.ts`, `data/rooms/*.ts`, `tests/playtest/harness.ts` | `pnpm test`, `pnpm test:coverage` |
| P3-D | howler-p3d | `tests/integration/echoes-worldevents-deep.test.ts` | — | `lib/echoes.ts`, `lib/worldEvents.ts`, `types/game.ts`, `tests/integration/echoes-abilities.test.ts` | `pnpm test`, `pnpm test:coverage` |
| P3-E | howler-p3e | `tests/integration/narrativekeys-voice-deep.test.ts` | — | `lib/narrativeKeys.ts`, `lib/narratorVoice.ts`, `lib/playerMonologue.ts`, `types/game.ts`, `types/convoy-contracts.d.ts` | `pnpm test`, `pnpm test:coverage` |
| P3-F | howler-p3f | `tests/integration/supabasemock-inventory-deep.test.ts` | — | `lib/supabaseMock.ts`, `lib/inventory.ts`, `supabase/migrations/*.sql`, `scripts/validate-schema-drift.ts` (T1-B output) | `pnpm test`, `tsx scripts/validate-schema-drift.ts` |
| P3-G | howler-p3g | `tests/integration/gameengine-edge-persist.test.ts` | — | `lib/gameEngine.ts`, `lib/supabaseMock.ts`, `LESSONS.md` (CONFIRM RESTART section — read before writing) | `pnpm test`, `pnpm test:coverage` |
| P3-H | howler-p3h | `tests/unit/components.test.tsx` | — | `components/CharacterCreation.tsx`, `components/CommandInput.tsx`, `components/ErrorBoundary.tsx`, `components/GameLayout.tsx`, `components/RemnantLogo.tsx`, `components/Sidebar.tsx`, `components/Terminal.tsx`, `components/tabs/DataTab.tsx`, `components/tabs/InventoryTab.tsx`, `types/game.ts`, `tests/setup.ts` | `pnpm test`, `pnpm test:coverage` |

**Conflict check**: CLEAN. All 8 Howlers create new files only. No two Howlers modify the same existing file.

**P3-F warning (OQ-5)**: T1-B will surface the `game_log` mock divergence from production schema (confirmed in LESSONS.md). P3-F Howler must be told: "Write tests that document current supabaseMock state. If `game_log` or any table diverges from migration schema, write a test that asserts the divergence as a known issue — do not skip it or work around it. Fixing mock parity is out of scope for this convoy."

**P3-G read prerequisite**: Howler must read `LESSONS.md` "CONFIRM RESTART" section before writing gameEngine edge tests. The plan explicitly flags this.

**P3-H RTL notes**: `environment: 'jsdom'` and `@testing-library/react` are already in devDependencies and vitest config. Custom ANSI `<span>` matchers may be needed for Terminal.tsx — check `tests/setup.ts` first for existing `@testing-library/jest-dom` matchers before writing custom ones.

---

### Wave 3 — Phase 4 Playtest Scenarios (Parallel, 6 Howlers)

Entry criteria: Phase 3 complete (all 8 Wave 2-concurrent Howlers merged). `pnpm test` passes with all new additions.

| Task | Howler | Creates | Modifies | Read-Only Inputs | Bash Commands |
|------|--------|---------|----------|-----------------|---------------|
| P4-A | howler-p4a | `tests/playtest/zone-crossroads-full.test.ts` | — | `data/rooms/crossroads.ts`, `data/npcs.ts`, `tests/playtest/harness.ts`, `PLAN-EVAL.md` (Zone A section) | `pnpm test` |
| P4-B | howler-p4b | `tests/playtest/zone-river-road-full.test.ts` | — | `data/rooms/river_road.ts`, `data/npcs.ts`, `tests/playtest/harness.ts`, `PLAN-EVAL.md` (Zone B section) | `pnpm test` |
| P4-C | howler-p4c | `tests/playtest/strategy-stealth-run.test.ts` | — | `lib/stealth.ts`, `tests/playtest/harness.ts`, `data/rooms/*.ts`, `types/game.ts` | `pnpm test` |
| P4-D | howler-p4d | `tests/playtest/strategy-social-diplomatic.test.ts` | — | `lib/actions/social.ts`, `lib/factionWeb.ts`, `tests/playtest/harness.ts`, `data/npcs.ts`, `types/game.ts` | `pnpm test` |
| P4-E | howler-p4e | `tests/playtest/strategy-speedrun.test.ts` | — | `tests/playtest/harness.ts`, `data/rooms/*.ts`, `lib/gameEngine.ts` | `pnpm test` |
| P4-F | howler-p4f | `tests/playtest/strategy-completionist.test.ts` | — | `tests/playtest/harness.ts`, `data/rooms/*.ts`, `data/npcs.ts`, `lib/echoes.ts` | `pnpm test` |

**Conflict check**: CLEAN. All 6 Howlers create new files only.

**P4-A and P4-B note**: Both use `harness.ts` `teleport()` and `setQuestFlag()` methods added by T1-E. Confirm T1-E has merged before dropping these Howlers.

---

### Wave 4 — Phase 5 Eval Rubrics (Parallel, up to 4 Howlers)

Entry criteria: Phase 2 complete (snapshot registry populated by T1-C/P2-D Howler). These are markdown documents only — no test code.

| Task | Howler | Creates | Modifies | Read-Only Inputs | Bash Commands |
|------|--------|---------|----------|-----------------|---------------|
| P5-A | howler-p5a | `evaluation/narrative-review/narrative-quality-rubric.md` | — | `PLAN-EVAL.md` (Rubric 1 section), `tests/eval/narrativeSnapshotRegistry.test.ts` | none required |
| P5-B | howler-p5b | `evaluation/narrative-review/combat-feel-rubric.md` | — | `PLAN-EVAL.md` (Rubric 2 section), `tests/eval/combatMatrix.test.ts` | none required |
| P5-C | howler-p5c | `evaluation/narrative-review/dialogue-coherence-rubric.md` | — | `PLAN-EVAL.md` (Rubric 3 section), `tests/eval/dialogueHealth.test.ts` | none required |
| P5-D | howler-p5d | `evaluation/narrative-review/world-consistency-rubric.md` | — | `PLAN-EVAL.md` (Rubric 4 section), `scripts/validate-npc-cross-refs.ts` | none required |

**Conflict check**: CLEAN. Four different files in the same directory.

**No research docs in releases**: These rubric files live in `evaluation/narrative-review/` and must not be committed alongside source code. They are eval artifacts only.

---

## Dispatch Waves Summary

| Wave | Phase | Howlers | Max Parallel | Entry Gate | Notes |
|------|-------|---------|-------------|------------|-------|
| 1 | Phase 1 | howler-t1a, t1b, t1c, t1d, t1e | 5 (but t1a → t1b sequential for package.json) | Clean tree, pnpm test green | t1c and t1d can run concurrently with t1a/t1b |
| 2 | Phase 2 | howler-p2a, p2b, p2c | 3 | Phase 1 complete, OQ-1+OQ-2 answered | |
| 2 (concurrent) | Phase 3 | howler-p3a through p3h | 8 | Phase 1 complete | Drop simultaneously with Wave 2 |
| 3 | Phase 4 | howler-p4a through p4f | 6 | Phase 3 complete | |
| 4 | Phase 5 | howler-p5a through p5d | 4 | Phase 2 complete | Can overlap Wave 3 if Phase 2 finished |

Total Howlers: 21. Total waves (wall-clock): 4. Total estimated wall-clock: ~36–44h.

---

## Conflict Audit

| Parallel set | Files touching same path | Verdict | Resolution |
|---|---|---|---|
| Wave 1: t1a + t1b | `package.json` | CONFLICT | Run t1a, wait for completion, then t1b |
| Wave 1: t1a + t1c/t1d/t1e | none | CLEAN | — |
| Wave 2: p2a + p2b + p2c | none | CLEAN | — |
| Wave 2-concurrent: p3a through p3h | none | CLEAN | All create new files |
| Wave 3: p4a through p4f | none | CLEAN | All create new files |
| Wave 4: p5a through p5d | none | CLEAN | All create new files in same dir, different names |
| Wave 2 vs Wave 2-concurrent | none | CLEAN | P2 and P3 have no file overlap |

One conflict identified and resolved: T1-A and T1-B on `package.json`. Resolved by sequential ordering.

---

## Bash Commands Pre-Allow List

Every Howler gets these as a baseline:

```
pnpm test
pnpm test:eval
pnpm test:coverage
npx tsc --noEmit
```

Additional per Howler:

| Howler | Additional |
|--------|-----------|
| howler-t1a | `tsx scripts/validate-npc-cross-refs.ts`, `grep -r npcId data/rooms/` |
| howler-t1b | `tsx scripts/validate-schema-drift.ts`, `tsx scripts/validate-consistency.ts`, `ls supabase/migrations/` |
| howler-t1c | `vitest -u` (snapshot population on first run) |
| howler-p3f | `tsx scripts/validate-schema-drift.ts` |

---

## Quality Gate Plan

After all waves complete and branches merged to feature branch — single round, not per-Howler:

Spawn in parallel: White (diff review) + Gray (`pnpm test`, `pnpm test:eval`, `pnpm test:coverage`) + /diff-review skill

**Pass criteria (all required to proceed to Copper)**:

| Check | Requirement |
|-------|-------------|
| `pnpm test` | Exit 0, 0 failures |
| `pnpm test:eval` | Exit 0, 0 failures |
| `pnpm validate` | Exit 0 (validate-consistency + validate-npc-cross-refs + validate-schema-drift all pass) |
| `npx tsc --noEmit` | Exit 0 |
| White | Zero blockers or criticals |
| Coverage statements | ≥80% |
| Coverage branches | ≥70% |

**Warnings (non-blocking, noted in PR description)**:

- Individual file coverage below target (acceptable per CLAUDE.md rule)
- White medium/low findings
- P3-F supabaseMock divergence documented as known issue (OQ-5 default: fix is a separate PR)

**Coverage thresholds in vitest.config.ts**: Do NOT raise thresholds during any phase. Raise to 80/70/75/80 only after the full quality gate passes (OQ-4 default).

If gate fails: fix in feature branch, re-run White + Gray + /diff-review before Copper opens PR.

---

## Worktree Paths

```
~/.claude/parallel/eval-convoy-0503/worktrees/howler-t1a
~/.claude/parallel/eval-convoy-0503/worktrees/howler-t1b
~/.claude/parallel/eval-convoy-0503/worktrees/howler-t1c
~/.claude/parallel/eval-convoy-0503/worktrees/howler-t1d
~/.claude/parallel/eval-convoy-0503/worktrees/howler-t1e
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p2a
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p2b
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p2c
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p3a
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p3b
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p3c
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p3d
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p3e
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p3f
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p3g
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p3h
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p4a
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p4b
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p4c
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p4d
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p4e
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p4f
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p5a
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p5b
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p5c
~/.claude/parallel/eval-convoy-0503/worktrees/howler-p5d
```

Branch pattern: `parallel/eval-convoy-0503/<howler-name>`
