# Plan: Combat System Review — Convoy dev/followup-0425
_Created: 2026-04-24 | Type: Refactor + Bug Fix + New Feature_

---

## Situation

**What we have.** The Remnant has a working turn-based combat engine split across `lib/combat.ts` (972 lines of pure math), `lib/actions/combat.ts` (877 lines of handlers), and `lib/traits.ts` (228 lines of weapon/armor trait resolution). The math is correct — d10 hit roll vs defense DC, flat damage, 1.5× crits, conditions tracked as `ActiveCondition[]`. Seven class abilities work (408-line test file). Conditions `bleeding | burning | stunned | frightened | poisoned | weakened` are implemented in `types/traits.ts`. All four armor traits are functional, including `warded` (the audit's "unimplemented" claim was wrong — verified at `lib/traits.ts:208`). 1,728 lines of combat tests pass. `components/Terminal.tsx` already carries `role="log" aria-live="polite"` — the ARIA baseline is in place.

**Where it falls short.** The user's primary axis is *time-to-engage*. Several gaps converge on that axis: (1) The combat prompt shows only `<HP:X/Y>` — no enemy name, no active status, no verb hints. (2) Miss messages are a single generic line ("It glances off nothing") — no reason, no learning signal. (3) The `TUTORIAL_HINTS` table has a `first_enemy` hint but no in-fight scaffolding — no first-kill hint, no "try flee when low HP" trigger, no encounter-two-teaches-new-verb pattern. (4) The armor reduction formula in the flee handler (`15% per defense point, capped at 60%`) diverges from the flat-subtraction used in all other attack paths — inconsistent player experience. (5) Environment modifier paths have zero integration tests. (6) The B12 save/load round-trip during active combat is untested. (7) `additionalEnemies` (screamer summons) are silently discarded when the player flees — the enemies vanish, undercutting their threat. (8) The spawn-distribution audit confirms that a cycle-1 player exploring early zones at daytime sees 0–1 encounters per 10 rooms — technically intentional sparse-by-design, but the design is not *legible* to the player ("the world is empty" rather than "Act I is exploration-first").

**What this convoy delivers.** Seven focused Howlers: combat prompt and status-strip redesign (UX); miss-reason messaging and weapon-trait strike text (feel); first-fight onboarding layer (accessibility); armor formula normalization (correctness); environment modifier tests + B12 save/load round-trip tests (quality gate); additionalEnemies flee-persistence + miscellaneous bug fixes (correctness); and spawn-density floor lift for early zones + no-combat narrative hint (new-player onboarding).

**What this convoy explicitly does not deliver.** Monte Carlo balance harness, `stance` tactical knob, stealth/awareness subsystem, AP action budget, non-violence boss exits, `wimpy` auto-flee threshold, Option 2 (first-zone-visit spawn bonus), Option 3 (pressure scaling softening).

---

## Decisions Locked

1. **Turn structure granularity:** Keep per-action tick. No WAIT_STATE, no AP budget refactor.

2. **Combat verb floor:** `attack`/`flee`/`look`/`status`. No new verbs added — only better discoverability via hints (H3).

3. **Status effect set:** Keep the existing six. `Blind` deferred to Phase 2 (shared type risk).

4. **Called-shot subsystem:** Keep. Verified at `lib/gameEngine.ts:1888`. No regression risk.

5. **Armor formula normalization (flee path):** H4 extracts `computeArmorReduction(rawDamage: number, armorDefense: number): number` in `lib/combat.ts` and updates the flee handler. Default: flat subtraction.

6. **Save/load round-trip during combat (B12):** Test-only (H5). No new migration needed.

7. **Monte Carlo balance harness:** Deferred to Phase 2.

8. **Tutorial hints / first-fight:** H3 adds `first_combat_start`, `first_kill`, `low_hp_combat`, `second_encounter` entries to `TUTORIAL_HINTS` in `lib/actions/system.ts` and trigger sites in `lib/gameEngine.ts` (post-action section, ~lines 1969+).

9. **Spawn density — chosen path:** Option 1 (data-only density floor) + Option 4 (idle no-combat hint). Both assigned to H7.
   - Option 2 (first-zone-visit bonus) skipped: would disrupt the time-of-day modifiers' rhythm.
   - Option 3 (soften pressure scaling) skipped: premature without playtest data confirming cycle-3 ramp is too sharp.
   - Rationale: Option 1 lifts the floor without breaking the intentional 3-run pacing; Option 4 makes the sparse design *legible* to cycle-1 players without changing any density.

10. **Idle-hint implementation pattern:** H7 creates a new `lib/idleHint.ts` (counter logic + message text). `lib/gameEngine.ts` gets one call site added in the post-action section after H3's entries. H7 is sequenced after H3 to avoid a merge conflict in that region.

---

## Scope

**In scope:** Combat prompt redesign, status strip, miss-reason messages, weapon-trait strike text, in-fight onboarding hints, armor formula normalization, B12 save/load test, environment modifier tests, additionalEnemies flee persistence, W-input-maxlength fix, spawn density floor lift for Crossroads/Covenant/Duskhollow/The Stacks, idle no-combat narrative hint.

**Out of scope:** Monte Carlo harness, `stance` knob, stealth system, AP budget, `wimpy`, `Blind` condition, non-violence boss exits, threat-color enemy names, enemy FSM states, `last`/`replay` command, Option 2 (first-visit spawn bonus), Option 3 (pressure scaling), other zones' density (River Road, Salt Creek already adequate per audit).

**Ambiguities resolved:**
- Flee armor formula defaults to flat subtraction (matching all other paths).
- `additionalEnemies` re-added to `currentRoom.enemies` immediately on flee; cleared on zone transition.
- Idle hint threshold: 30 actions without a combat encounter (≈ 15 minutes of exploration). Single fire per cycle — resets when the player next enters combat.
- Density floor target: `baseChance` 0.06–0.10 for new blocks in the four sparse zones. Tonal consistency via existing `threatPool` patterns from verified rooms in each zone.

---

## Type Dependencies

- `ConditionId` in `types/traits.ts:19` — used by H1 (status strip), H2 (miss messages). Read-only; no changes.
- `CombatState` in `types/game.ts:618` — H1 reads for status strip; H6 uses existing `additionalEnemies` field. No changes.
- `ActiveCondition` in `types/traits.ts:42` — read by H1 for status strip rendering. No changes.
- `Room` / `hollowEncounter` shape in `types/game.ts` — H7 adds new `hollowEncounter` blocks that must conform to the existing interface. H7 must verify the `RoomEncounter` interface before writing data.

Note: `types/traits.ts` is shared infrastructure. H1, H2, and H4 all read it. None modify it.

---

## Architecture

**Turn structure.** Unchanged. Per-action tick. `_dispatchAction` → handler → `_savePlayer`. No AP refactor.

**Verb floor.** `attack`/`flee`/`look`/`status`. H3 adds inline prompt hints; no new verbs in `lib/parser.ts`.

**Status-effect machinery.** Unchanged at the data layer. H1 adds a `buildStatusStrip(player, combatState)` helper in `lib/actions/combat.ts` (near top of file, standalone export).

**Miss-reason vocabulary.** H2 adds three miss-reason buckets in `lib/combat.ts` within `doAttackRound()` and `playerCalledShot()`. Fumble retains its existing message.

**Prompt redesign.** H1 modifies `components/CommandInput.tsx`. New combat prompt: `[HP 80/100] [raider — wounded] (attack/flee) >`.

**Armor util.** H4 extracts `computeArmorReduction` into `lib/combat.ts`. Callers: `doEnemyTurn` (~line 689), flee handler (~line 559 in `lib/actions/combat.ts`).

**Idle hint.** H7 creates `lib/idleHint.ts`. The module tracks `actionsTaken` since `lastCombatActionsTaken` (stored in localStorage, not game state — avoids any save migration). After 30 no-combat actions it fires once. `lib/gameEngine.ts` calls `checkIdleHint(engine)` once in the post-action section, after H3's tutorial hint block. Counter resets when `combatState.active` becomes true.

**Spawn density.** H7 adds `hollowEncounter` blocks to empty rooms in 4 zone files. New blocks use existing `threatPool` patterns from same-zone rooms for tonal consistency.

---

## File Ownership Matrix

| Howler | Creates | Modifies |
|--------|---------|----------|
| H1 — Prompt + Status Strip | — | `components/CommandInput.tsx`, `lib/actions/combat.ts` |
| H2 — Miss Reasons + Trait Strike Text | — | `lib/combat.ts` |
| H3 — First-Fight Onboarding | — | `lib/actions/system.ts`, `lib/gameEngine.ts` |
| H4 — Armor Formula Normalization | — | `lib/combat.ts`, `lib/actions/combat.ts` |
| H5 — Save/Load + Env Modifier Tests | `tests/integration/save-load-roundtrip.test.ts`, `tests/integration/combat-env.test.ts` | — |
| H6 — AdditionalEnemies Flee + Bug Fixes | — | `lib/actions/combat.ts`, `lib/gameEngine.ts` |
| H7 — Spawn Density + Idle Hint | `lib/idleHint.ts`, `tests/unit/idleHint.test.ts` | `data/rooms/crossroads.ts`, `data/rooms/covenant.ts`, `data/rooms/duskhollow.ts`, `data/rooms/the_stacks.ts`, `lib/gameEngine.ts` |

**Conflict analysis:**
- `lib/combat.ts` shared by H2 and H4. Different regions (miss-message paths vs armor block). No line overlap; standard merge.
- `lib/actions/combat.ts` shared by H1 (top, `buildStatusStrip`), H4 (flee handler ~line 558), H6 (flee success ~line 549). Different regions; H4 merges before H6.
- `lib/gameEngine.ts` shared by H3 (post-action hint section ~lines 1969–2017), H6 (flee success path, different region), and H7 (one call site added after H3's block, ~line 2018+). **H7 merges after H3** — they both write to the post-action section; H7's single line is appended after H3's block rather than interleaved. H6's region is the flee path, not the post-action section — no overlap with H7.
- `data/rooms/*.ts` — four files owned exclusively by H7. No other Howler touches them.
- `lib/idleHint.ts` — new file, owned exclusively by H7.

---

## Tasks

- [ ] **H1 — Combat Prompt Redesign + Status Strip** — Replace bare `<HP:X/Y>` with a context-aware combat prompt; append a status strip to every round with active conditions.
  - Files: MODIFY `components/CommandInput.tsx`, MODIFY `lib/actions/combat.ts`
  - Tests: No new test file required; confirm existing combat tests pass. Add `maxLength={200}` to the input element (W-input-maxlength fix).
  - Depends on: nothing
  - Effort: S
  - Pre-mortem: If this takes 3× longer, it will be because `CommandInput.tsx` reads game state via a hook that doesn't currently expose `combatState`. Read existing `useGameStore` selectors in the file before writing — `state.player` is already selected, so `state.combatState` is one selector away.
  - Notes: `buildStatusStrip` must be placed near the top of `lib/actions/combat.ts` — not in the flee handler region (~line 558) owned by H4 or the flee success region (~line 549) owned by H6.

- [ ] **H2 — Miss-Reason Messaging + Weapon-Trait Strike Text** — Replace generic miss line with three reason buckets; add trait×enemy flavor text for blessed/vicious/scorching/draining on hit.
  - Files: MODIFY `lib/combat.ts`
  - Tests: Add 6 new test cases in `tests/integration/combat-math.test.ts` (3 miss-reason buckets, 3 trait strike texts).
  - Depends on: nothing
  - Effort: S
  - Pre-mortem: If this takes 3× longer, it will be because the whisperer debuff at `lib/combat.ts:306` mutates roll context before the miss check, and miss-reason bucketing must account for the debuffed roll total, not the raw roll. Read the full miss path (lines ~278–336) before writing bucket logic.

- [ ] **H3 — First-Fight Onboarding Layer** — Add four new `TUTORIAL_HINTS` entries and trigger sites for `first_combat_start`, `first_kill`, `low_hp_combat`, `second_encounter`.
  - Files: MODIFY `lib/actions/system.ts`, MODIFY `lib/gameEngine.ts`
  - Tests: Add 4 new test cases confirming each hint fires exactly once per localStorage key, and `low_hp_combat` triggers at ≤30% HP.
  - Depends on: nothing
  - Effort: S
  - Pre-mortem: If this takes 3× longer, it will be because the `low_hp_combat` trigger fires on the wrong side of the player-death check and surfaces after death rather than before. Read `lib/gameEngine.ts` lines 1823–2009 (post-action hook sequence) before wiring the HP trigger.
  - Notes: H7 depends on H3 — H7 appends one call site after the end of H3's tutorial-hint block (~line 2017+). H3 must merge first.

- [ ] **H4 — Armor Formula Normalization** — Extract `computeArmorReduction` utility; normalize flee-path armor to match all other damage paths.
  - Files: MODIFY `lib/combat.ts` (extract + export utility), MODIFY `lib/actions/combat.ts` (update flee handler)
  - Tests: Add 3 new test cases in `tests/integration/combat-math.test.ts` pinning the flee-path formula.
  - Depends on: nothing (but H6 depends on H4)
  - Effort: S
  - Pre-mortem: If this takes 3× longer, it will be because `doEnemyTurn` has multiple armor-related code paths and the extraction misses one. Read all of `lib/combat.ts:600–740` before writing — confirm there is exactly one armor-reduction site in `doEnemyTurn`.

- [ ] **H5 — Save/Load Round-Trip + Environment Modifier Tests** — Close TODO-RELEASE B12; add four environment modifier test cases. Pure test work.
  - Files: CREATE `tests/integration/save-load-roundtrip.test.ts`, CREATE `tests/integration/combat-env.test.ts`
  - Tests: All new (the deliverable IS tests). The save-load test covers three scenarios (combatState active, combatState null, narrative_progress JSONB round-trip). The env test covers 4 environment types.
  - Depends on: nothing
  - Effort: M
  - Pre-mortem: If this takes 3× longer, it will be because `computeEnvironmentEffects` reads deeply from `GameState.currentRoom` and setting up a fixture room with the correct environment property requires understanding the full room initialization chain. Read `computeEnvironmentEffects` and `getEnvironmentModifiers` source in `lib/combat.ts` before writing any test.

- [ ] **H6 — AdditionalEnemies Flee Persistence + Bug Fixes** — Re-inject screamer summons into the room when the player flees; document the Overwhelm+Keen non-crit design choice.
  - Files: MODIFY `lib/actions/combat.ts` (flee success path), MODIFY `lib/gameEngine.ts` (room enemy injection)
  - Tests: Add 2 new test cases in `tests/integration/combat.test.ts` (additionalEnemies present/absent on flee).
  - Depends on: H4 (must merge first — flee path armor logic)
  - Effort: S
  - Pre-mortem: If this takes 3× longer, it will be because injecting enemies back into `currentRoom.enemies` requires `currentRoom` to be mutable state. Verify that `engine._setState({ currentRoom: { ...currentRoom, enemies: [...] } })` is the correct mutation pattern by checking one existing room-state mutation in `lib/gameEngine.ts` before implementing.
  - Notes: H6 does NOT touch `components/CommandInput.tsx` — the W-input-maxlength fix is assigned to H1. H6's `lib/gameEngine.ts` edits are in the flee path — a different region from H3's and H7's post-action section.

- [ ] **H7 — Spawn Density Floor + Idle No-Combat Hint** — Add `hollowEncounter` blocks to ~15–20 currently-empty rooms in four early zones; add a one-shot idle hint after 30 no-combat actions pushing players toward denser zones.
  - Files: MODIFY `data/rooms/crossroads.ts` (2→4 encounter rooms), MODIFY `data/rooms/covenant.ts` (5→10 encounter rooms), MODIFY `data/rooms/duskhollow.ts` (6→10 encounter rooms), MODIFY `data/rooms/the_stacks.ts` (7→10 encounter rooms), CREATE `lib/idleHint.ts`, MODIFY `lib/gameEngine.ts` (one call site in post-action section), CREATE `tests/unit/idleHint.test.ts`
  - Tests: (a) Unit tests in `tests/unit/idleHint.test.ts` — hint fires after 30 no-combat actions, does not fire again until next combat, resets on `combatState.active`, does not fire if localStorage flag set for current cycle. (b) Manual verification: density table from audit visibly improved for four zones after adding blocks (re-run the grep-based count from the audit).
  - Depends on: H3 (must merge first — H7 appends one `lib/gameEngine.ts` call site after H3's tutorial-hint block, so H3's block must be in place before H7 can position its line correctly)
  - Effort: M
  - Pre-mortem: If this takes 3× longer, it will be because: (1) choosing which specific rooms to add encounters to requires reading each zone file in full to find rooms with `noCombat: false` (or no `noCombat` flag) that currently lack `hollowEncounter` — and some "empty" rooms may be `noCombat: true` for lore/quest reasons that must not be overridden; (2) the idle-hint cycle-reset logic using localStorage requires a per-cycle key (e.g., `remnant_idle_hint_cycle_${player.cycle}`) — verify the `player.cycle` field is accessible from `gameEngine.ts` at the call site before writing.
  - Notes: `baseChance` for new blocks should be 0.06–0.10; use existing `threatPool` entries from same-zone rooms for tonal consistency (e.g., `shuffler` + `remnant` weights already established in `crossroads.ts:106`). Do NOT add encounters to rooms with `flags.noCombat: true`, `flags.safeRest: true`, or `flags.questHub: true` — those are intentionally safe. H7 must NOT touch `lib/spawn.ts` (pressure scaling) or `types/game.ts` (no new fields needed — localStorage only).

---

## Cross-Howler Coordination

**Merge order:** H1, H2, H4, H5, H6 can merge in any order with these constraints:
- H6 merges after H4 (flee armor path dependency)
- H7 merges after H3 (post-action section in `lib/gameEngine.ts`)

**H4 frozen contract for H6:** `computeArmorReduction(rawDamage: number, armorDefense: number): number` exported from `lib/combat.ts`. H6 imports and calls it.

**H3 frozen contract for H7:** H7's `lib/gameEngine.ts` call site (`await checkIdleHint(engine, this.state)`) must be placed on the first line after H3's hint block closes (the `first_npc` check at ~line 2016). If H3's block ends at a different line number after merge, H7 appends immediately after whatever the last `attemptTutorialHint` call is.

**Shared type guard:** No Howler modifies `types/traits.ts` or `types/game.ts`. If any Howler discovers a change is needed, surface to main thread before proceeding.

---

## Open Questions

- [ ] **Flee armor formula preference.** H4 defaults to flat-subtraction to match `doEnemyTurn`. Blocks: H4, H6. **Default if unresolved:** flat subtraction.
- [ ] **AdditionalEnemies re-spawn scope.** Blocks: H6. **Default if unresolved:** re-add to `currentRoom.enemies` immediately; cleared on zone transition.
- [ ] **Idle hint cycle-reset key.** Should `lib/idleHint.ts` key off `player.cycle` (resets hint each new cycle) or fire once ever? Blocks: H7. **Default if unresolved:** key off `player.cycle` — the hint becomes useful again each time a player starts a new cycle and re-explores early zones.

---

## Phase 2 / Deferred

| Item | Why deferred |
|------|-------------|
| Monte Carlo balance harness | Standalone Howler; no dependency on this convoy. Run 7×15 = 105 class×enemy scenarios. |
| `stance offensive/balanced/defensive` | Touches turn-loop, parser, and GameState. Fits its own convoy. |
| Stealth / multi-state enemy awareness | New system (`unaware/alert/engaged`). High impact, medium scope. |
| AP action budget per turn | Would refactor the entire turn loop. Risk of regression high. |
| `wimpy <hp%>` auto-flee threshold | Requires new player setting field and possible migration. |
| `Blind` as a 7th condition | Requires `ConditionId` union change. Cross-Howler coordination risk. |
| Non-violence boss exits | Content work per boss + new stat-check plumbing. |
| Threat-color enemy names | Needs product decision on threat-tier palette. |
| Enemy FSM states | Adding FSM touches `data/enemies.ts` and round loop. Phase 2. |
| `last`/`replay` command | Belongs with a broader UX pass. |
| Option 2 — first-zone-visit spawn bonus | Skipped: disrupts time-of-day rhythm. Re-evaluate if H7 still feels sparse. |
| Option 3 — soften pressure scaling | Skipped: premature without playtest data. |
| Procedural density tuning (other zones) | River Road (43.5%), Salt Creek (45%) already adequate. The Breaks/Dust/Pine Sea/Deep are dense. Only the four listed zones need lifting. |

---

## Acceptance Criteria (Convoy-Level)

- [ ] All existing tests pass: `pnpm test --run` (baseline: 1,728+ lines in 5 combat test files)
- [ ] `tsc --noEmit` clean
- [ ] First fight reachable from a fresh dev character in ≤ 90 seconds of typing (manual): start game → see `first_enemy` hint → type `attack [enemy]` → get combat prompt with enemy name → land a hit with damage → see `first_combat_start` hint
- [ ] Miss messages contain at least one of: "sidesteps", "plating turns", "graze" — no bare "It glances off nothing" for non-fumble misses
- [ ] Status strip appears in combat log when conditions are active on player or enemy
- [ ] Combat prompt shows `[HP X/Y] [target — state] (attack/flee) >` during active combat
- [ ] Save/load round-trip test passes with `combatState` populated (B12 closed)
- [ ] Environment modifier tests pass (4 new test cases in `combat-env.test.ts`)
- [ ] Armor formula consistent between `doEnemyTurn` and flee free-attack path (verified by H4 tests)
- [ ] Screamer summons re-appear in room after flee success (verified by H6 tests)
- [ ] Crossroads `hollowEncounter` room count ≥ 4 (was 2); Covenant ≥ 10 (was 5); Duskhollow ≥ 10 (was 6); The Stacks ≥ 10 (was 7) — verified by grep counts
- [ ] Idle no-combat hint surfaces in a manual session after 30 no-combat actions in early zones; does not repeat until next combat + reexplore
- [ ] No regressions in `combat-abilities.test.ts`, `combat-edge-cases.test.ts`, `combat-social-deep.test.ts`

---

## Risks

1. **`lib/actions/combat.ts` three-Howler contention (HIGH).** H1, H4, and H6 all modify this file. Mitigations: strict region separation — H1 adds `buildStatusStrip` near top of file, H4 touches flee handler (~line 558), H6 touches flee success path (~line 549); enforced merge order (H4 before H6). Gold must verify region separation in SPLIT.md before dropping Howlers.

2. **`lib/gameEngine.ts` post-action section contention (HIGH).** H3 and H7 both write to the post-action hint block (~lines 1969–2018). Mitigation: enforced H3-before-H7 merge order. H7's single call site is appended after H3's block, not interleaved. Gold must include this in merge order instructions.

3. **H7 accidental encounter injection into safe rooms (HIGH).** If H7 adds `hollowEncounter` to rooms with `noCombat: true` or `safeRest: true`, players will see encounters in safe zones — breaking faction hub and healing room contracts. Mitigation: H7 must grep for rooms that currently have `noCombat: false` (or no `noCombat` flag) and zero `hollowEncounter` before choosing targets. Any room with `questHub: true` or `safeRest: true` is off-limits regardless of `noCombat` value.

4. **`CommandInput.tsx` prompt change breaks test assertions (MEDIUM).** Prompt string changes from `<HP:X/Y>` to `[HP X/Y]`. Mitigation: H1 must `grep -rn "HP:" tests/` before committing and update any matching assertions.

5. **Tutorial hint localStorage state pollution in dev (LOW).** H3 uses new key names (`remnant_tutorial_first_combat_start`, etc.) — no collision with existing keys. H7's idle hint uses a cycle-scoped key (`remnant_idle_hint_cycle_N`) — also collision-free.

6. **Environment modifier fixture complexity (MEDIUM).** `computeEnvironmentEffects` reads from `GameState.currentRoom`. Mitigation: H5 must read source before writing any test.

7. **Flee armor normalization is a behavior change (MEDIUM).** Defense 3 armor on a 10-damage parting shot: current formula ~5 damage; flat subtraction gives 7. Parting shots become slightly more dangerous. Document explicitly in H4 PR description — this is a feature, not a regression.

8. **AdditionalEnemies room injection breaks static room data contract (MEDIUM).** Room data in `data/rooms/` is imported as static const. Mitigation: H6 must verify that `engine._setState({ currentRoom: {...} })` replaces the mutable copy in `GameState`, not the static import (confirmed at `lib/gameEngine.ts:200`).

9. **Idle hint fires too early or loops (MEDIUM).** If the 30-action threshold is miscalibrated or the reset logic has an off-by-one, the hint fires on every session. Mitigation: H7 unit tests must cover the "fires exactly once then suppresses" and "resets correctly after next combat" cases before merge.
