# SPLIT: combat-followup-0425

**Base commit:** `d68caa5542e572239e663575312996179faab56e`
**Base branch:** `dev/followup-0425`
**Plan:** `PLAN.md` (written 2026-04-24)
**Howlers:** 7 (H1–H7)

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

---

## Howler Scopes

### H1 — Combat Prompt Redesign + Status Strip

Replaces bare `<HP:X/Y>` with `[HP X/Y] [target — state] (attack/flee) >` and appends a status strip to every combat round when conditions are active.

**MODIFY**
- `components/CommandInput.tsx` — new combat prompt format; add `maxLength={200}` to input element (W-input-maxlength fix)
- `lib/actions/combat.ts` — add `buildStatusStrip(player, combatState)` helper near top of file as a standalone export; do NOT touch flee handler (~line 558) or flee success path (~line 549) — those regions belong to H4 and H6 respectively

**Key notes:**
- Read existing `useGameStore` selectors before writing — `state.combatState` is one selector away from the already-selected `state.player`
- After modifying the prompt string, run `grep -rn "HP:" tests/` and update any matching test assertions before committing
- No new test file required; confirm existing combat tests pass

---

### H2 — Miss-Reason Messaging + Weapon-Trait Strike Text

Replaces the single generic miss line with three reason buckets; adds trait×enemy flavor text for blessed/vicious/scorching/draining on hit.

**MODIFY**
- `lib/combat.ts` — add miss-reason buckets in `doAttackRound()` and `playerCalledShot()`; add trait strike text paths

**Key notes:**
- Read the full miss path (lines ~278–336) before writing bucket logic — the whisperer debuff at ~line 306 mutates roll context before the miss check; bucketing must operate on the debuffed roll total, not the raw roll
- Fumble retains its existing message; only non-fumble misses get new buckets
- Add 6 test cases in `tests/integration/combat-math.test.ts` (3 miss-reason buckets, 3 trait strike texts)

---

### H3 — First-Fight Onboarding Layer

Adds four new `TUTORIAL_HINTS` entries and their trigger sites: `first_combat_start`, `first_kill`, `low_hp_combat`, `second_encounter`.

**MODIFY**
- `lib/actions/system.ts` — add four new entries to `TUTORIAL_HINTS` table
- `lib/gameEngine.ts` — add trigger sites in the post-action hook section (~lines 1969–2017); `low_hp_combat` must fire on the correct side of the player-death check

**Key notes:**
- H7 depends on H3: H7 appends one call site immediately after H3's hint block closes. **H3 MUST merge before H7.**
- Read `lib/gameEngine.ts` lines 1823–2009 before wiring the HP trigger — `low_hp_combat` must not surface after the death check
- Add 4 test cases confirming each hint fires exactly once per localStorage key; `low_hp_combat` triggers at ≤30% HP
- H3's block ends approximately at line 2016 (`first_npc` check); H7 appends after whatever the last `attemptTutorialHint` call is post-merge

---

### H4 — Armor Formula Normalization

Extracts `computeArmorReduction` utility and normalizes the flee-path armor formula to match flat-subtraction used in all other damage paths.

**MODIFY**
- `lib/combat.ts` — extract and export `computeArmorReduction(rawDamage: number, armorDefense: number): number`; update `doEnemyTurn` caller (~line 689)
- `lib/actions/combat.ts` — update flee handler (~line 558) to call `computeArmorReduction`; do NOT touch `buildStatusStrip` region near top (H1) or flee success path (~line 549, H6)

**Key notes:**
- H6 depends on H4: **H4 MUST merge before H6.** Frozen export contract for H6: `computeArmorReduction(rawDamage: number, armorDefense: number): number` exported from `lib/combat.ts`
- Read all of `lib/combat.ts:600–740` before writing — verify exactly one armor-reduction site in `doEnemyTurn` before extracting
- Add 3 test cases in `tests/integration/combat-math.test.ts` pinning the flee-path formula
- Behavior note: defense 3 armor on 10-damage parting shot shifts from ~5 to 7 damage — document explicitly in PR description as intentional

---

### H5 — Save/Load Round-Trip + Environment Modifier Tests

Pure test work closing TODO-RELEASE B12 and adding environment modifier coverage. No source modifications.

**CREATE**
- `tests/integration/save-load-roundtrip.test.ts` — three scenarios: `combatState` active, `combatState` null, `narrative_progress` JSONB round-trip
- `tests/integration/combat-env.test.ts` — four environment modifier test cases

**Key notes:**
- Read `computeEnvironmentEffects` and `getEnvironmentModifiers` source in `lib/combat.ts` before writing any env test — `computeEnvironmentEffects` reads deeply from `GameState.currentRoom`; fixture setup requires understanding the full room initialization chain
- Fully independent of all other Howlers; can merge at any point

---

### H6 — AdditionalEnemies Flee Persistence + Bug Fixes

Re-injects screamer summons (`additionalEnemies`) into `currentRoom.enemies` when the player flees; documents the Overwhelm+Keen non-crit design choice.

**MODIFY**
- `lib/actions/combat.ts` — update flee success path (~line 549); do NOT touch `buildStatusStrip` region near top (H1) or flee handler (~line 558, H4)
- `lib/gameEngine.ts` — room enemy injection on flee; this region is the flee path, separate from H3's and H7's post-action section

**Key notes:**
- **H6 MUST merge after H4** — imports `computeArmorReduction` from H4's export
- Verify that `engine._setState({ currentRoom: { ...currentRoom, enemies: [...] } })` is the correct mutation pattern by checking one existing room-state mutation in `lib/gameEngine.ts` before implementing (confirmed at `lib/gameEngine.ts:200`)
- `additionalEnemies` re-added to `currentRoom.enemies` immediately on flee; cleared on zone transition
- Add 2 test cases in `tests/integration/combat.test.ts` (additionalEnemies present/absent on flee)
- H6 does NOT touch `components/CommandInput.tsx`

---

### H7 — Spawn Density Floor + Idle No-Combat Hint

Adds `hollowEncounter` blocks to ~15–20 currently-empty rooms in four early zones; adds a one-shot idle hint after 30 no-combat actions.

**CREATE**
- `lib/idleHint.ts` — counter logic + message text; tracks `actionsTaken` since `lastCombatActionsTaken` in localStorage (not game state — avoids save migration); per-cycle key: `remnant_idle_hint_cycle_${player.cycle}`
- `tests/unit/idleHint.test.ts` — hint fires after 30 no-combat actions; suppresses until next combat; resets on `combatState.active`; does not fire if cycle localStorage flag already set

**MODIFY**
- `data/rooms/crossroads.ts` — 2 → ≥4 encounter rooms
- `data/rooms/covenant.ts` — 5 → ≥10 encounter rooms
- `data/rooms/duskhollow.ts` — 6 → ≥10 encounter rooms
- `data/rooms/the_stacks.ts` — 7 → ≥10 encounter rooms
- `lib/gameEngine.ts` — one call site appended in post-action section after H3's tutorial-hint block: `await checkIdleHint(engine, this.state)`

**Key notes:**
- **H7 MUST merge after H3** — H7's `lib/gameEngine.ts` line is positioned relative to H3's block close
- H7 MUST NOT touch `lib/spawn.ts` (pressure scaling) or `types/game.ts` (no new fields — localStorage only)
- New `hollowEncounter` blocks must conform to the existing `RoomEncounter` interface in `types/game.ts` — read it before writing data
- `baseChance` for new blocks: 0.06–0.10; use `threatPool` entries already established in same-zone rooms for tonal consistency
- Verify `player.cycle` is accessible at the `lib/gameEngine.ts` call site before writing `lib/idleHint.ts`

---

## Conflict Audit

The full union of owned files across H1–H7 produces **3 multi-Howler advisories**. Every other file is single-owner with no advisory.

| File | Owners | Advisory |
|------|--------|----------|
| `lib/combat.ts` | H2, H4 | Different regions: H2 in miss-message paths (~278–336), H4 in armor block (~600–740) and new export. No line overlap. Standard merge. |
| `lib/actions/combat.ts` | H1, H4, H6 | Three distinct regions: H1 near top (`buildStatusStrip`), H4 at flee handler (~line 558), H6 at flee success path (~line 549). H4 must merge before H6. H1 is independent of both. |
| `lib/gameEngine.ts` | H3, H6, H7 | H3 and H7 both write to the post-action section (~lines 1969–2018). H6 edits the flee path — a separate region. H7 appends after H3's block; H3 must merge first. |

All other files are single-owner. `types/traits.ts` and `types/game.ts` are read-only for this entire convoy.

---

## COORDINATION NOTE — H7 Safe-Room Guard (HIGH RISK)

Covenant has `noCombat: true` on most rooms. Any `hollowEncounter` block added to a flagged room will surface encounters in safe zones, breaking faction hub and healing room contracts. This is the most likely source of a post-merge regression.

**Before adding any `hollowEncounter` block, H7 MUST run:**

```
grep -n "noCombat\|safeRest\|questHub" data/rooms/crossroads.ts
grep -n "noCombat\|safeRest\|questHub" data/rooms/covenant.ts
grep -n "noCombat\|safeRest\|questHub" data/rooms/duskhollow.ts
grep -n "noCombat\|safeRest\|questHub" data/rooms/the_stacks.ts
```

Only target rooms that have `noCombat: false` or no `noCombat` flag AND currently lack `hollowEncounter`. Any room with `flags.noCombat: true`, `flags.safeRest: true`, or `flags.questHub: true` is off-limits regardless of other flags.

---

## Merge Order

```
Wave 1 — parallel, no inter-dependencies:
  H1, H2, H3, H4, H5

After H4 merges:
  H6 — imports computeArmorReduction

After H3 merges:
  H7 — appends one gameEngine.ts call site after H3's block

Recommended sequence: H1 + H2 + H3 + H4 + H5 (parallel) → H6 → H7
```

If H4 finishes before H3, H6 and H7 can proceed in parallel after their respective prerequisites.

---

## Post-Merge Quality Gate

After all 7 Howler branches merge to `dev/followup-0425`, spawn White + Gray + /diff-review in parallel once on the combined diff. Zero blockers/failures/criticals required before Copper opens PR. Coverage gaps and security high/medium are warnings in the PR description only.
