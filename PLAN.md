# Plan: Convoy 1 — Combat Spine
_Created: 2026-04-24 | Type: New Feature (battle-MUD pivot — first convoy)_

---

## 1. Situation

### Pivot context

The Remnant is architecturally a battle-MUD — 7 classes, combat verbs, threat pools, a full action-economy engine — but runs a narrative-first experience inside that shell. A cycle-1 player walking through mid-game zones at daytime sees an effective spawn chance of 4–6% per room (baseChance 0.10 × day modifier 0.4–0.6 × no cycle bonus = ~0.04–0.06) and can cross 10 rooms without a fight. The game describes a lethal post-collapse world; it delivers a quiet exploration experience interrupted by occasional fights. That mismatch is the pivot.

The research brief numbers are grounded in code. `ENEMY_RESPAWN_ACTIONS = 160` at `lib/gameEngine.ts:292`. The `pressureModifier()` in `lib/spawn.ts` gives cycle-1 players a flat 1.0× multiplier with no bonus. The daytime modifier in `lib/gameEngine.ts:_applyPopulation` compounds those reductions. The Scar and The Pens carry `cycleGate: 3` on all 16 Scar rooms and all 18 Pens rooms (confirmed by grep), locking cycle-1 and cycle-2 players out of 34 of the best combat rooms. Four zones have 80–100% single-enemy threat-pool weight (Duskhollow 100% shuffler at baseChance 0.03, River Road 92%, Stacks 90%, Dust 80%), producing encounter homogeneity whenever encounters do fire. No enemy in `data/enemies.ts` has behavioral hooks — `onAttack`, `critChance`, or `fleeThreshold` fields do not exist in the `Enemy` interface or in any enemy definition; the brute's charge and the screamer's shriek are flavor text only.

### Convoy 1 scope

Convoy 1 establishes the combat spine: density, wanderers, new enemies, behavioral hooks, loot currency fix, and the three must-launch narrative counterparts (death prose variants, faction reactivity, combat world events). It does not touch gear affixes (Convoy 2), class active abilities (Convoy 3), or ending bosses (Convoy 4). The goal is that after Convoy 1 a cycle-1 mid-game walk delivers at least 10 fights per 50 rooms and no zone dominates above 70% single-enemy weight — partial fulfillment of M1 and M2, with the full M1 target (18–25 fights) requiring Convoy 2's gear lifts to make that density survivable and legible.

### Locked decisions (do not reopen)

- **OQ1 — cycleGate 3→2:** Scar and Pens remain cycle-gated but open at cycle 2 instead of cycle 3. The `cycleGate` field lives on `Room` objects checked in `lib/actions/movement.ts:302` and `lib/actions/travel.ts:163`. H1 changes the value on all 34 rooms.
- **OQ2 — Random affixes:** Diablo-style prefix/suffix system is Convoy 2 work. Convoy 1 must not change `Item` or `Enemy` types in ways that break the affix schema Convoy 2 will introduce. New fields must be optional or additive.
- **OQ3 — Keep 7 classes:** No class differentiation in this convoy.
- **OQ4 — Durability optional:** No durability fields added in Convoy 1.
- **OQ5 — One big release:** Each convoy is its own PR; all 4 land before public release.

---

## 2. Architecture Decisions

### Density formula changes (H1 scope)

The spawn pipeline lives in `lib/gameEngine.ts:_applyPopulation` (lines 286–322). It reads `baseChance` from room data, applies `timeModifier[timeOfDay]` from the room's `hollowEncounter` block, then multiplies by `pressureModifier(pressure)` from `lib/spawn.ts`. The `pressureModifier` function currently returns `1.0 + (pressure - 1) * 0.15`, so cycle-1 (pressure=1) gets exactly 1.0× — no bonus.

**Four changes in H1:**
1. **baseChance floor increases** — edited directly in `data/rooms/*.ts`. Target values per PRD A1: River Road 0.10→0.35, Salt Creek 0.12→0.45, Breaks/Dust/Stacks 0.14–0.32→0.55, Scar/Pens 0.28/0.38→0.60–0.65. Covenant and Crossroads left below 0.15 (safe hubs per PRD A6).
2. **Daytime modifier softening** — the per-room `timeModifier.day` values are currently 0.4–0.6 in starting and mid zones. Raise to 0.7–0.85. These are per-room data fields in the `hollowEncounter` block, not a centralized config — each room gets updated individually.
3. **Respawn timer cut** — `ENEMY_RESPAWN_ACTIONS = 160` at `lib/gameEngine.ts:292` → `80`. One-line change.
4. **Cycle-1 pressure baseline** — `pressureModifier()` in `lib/spawn.ts` currently returns `1.0 + (pressure - 1) * 0.15`. Change so pressure=1 returns 1.10: `1.0 + Math.max(0, pressure - 1) * 0.15 + (pressure === 1 ? 0.10 : 0.0)`.
5. **cycleGate 3→2** — all 34 rooms in `data/rooms/the_scar.ts` (16 rooms, all `cycleGate: 3`) and `data/rooms/the_pens.ts` (18 rooms, all `cycleGate: 3`) updated to `cycleGate: 2`.

Note: `lib/spawn.ts` is shared infrastructure — `pressureModifier()` is imported by `lib/gameEngine.ts`. Flag: `lib/spawn.ts` is imported by `lib/gameEngine.ts` — changes to `pressureModifier()` affect the entire spawn pipeline. Verify with `grep -rn "pressureModifier\|computePressure" lib/` before modifying.

### Spawn-weight rebalancing (H1 and H3 scope — sequenced)

H1 rebalances existing enemies in the four lopsided zones (using `remnant` and `stalker` already defined):
- Duskhollow: change shuffler weight 100→65, add remnant weight 20, stalker weight 15.
- River Road, Stacks, Dust: similar redistribution capping the dominant enemy at ≤70%.

H3 then adds new faction-flavored enemy IDs to these same zone `threatPool` arrays after H1 merges. This is a hard sequencing dependency — H3 must wait for H1's file changes to land to avoid a merge conflict on 7 zone files.

### Wandering enemies system (H2 scope)

The existing `lib/worldEvents.ts` provides scheduled events but is not the right hook for wanderers (combat encounters tied to movement, not action count). H2 creates a separate lightweight module.

**System shape:**
- New module: `lib/wanderers.ts`. Pure functions only.
- `WandererState` persisted inside existing `narrative_progress` JSONB field — no new Supabase migration required.
- `tickWanderers(state, currentRoomId, cycle): WandererEvent | null` — called from `lib/gameEngine.ts` after the post-move `_applyPopulation` block.
- A wanderer holds a `currentRoomId` and moves to adjacent rooms probabilistically each tick.
- Hard cap: `MAX_WANDERERS_ACTIVE = 2` (cycles 1–3), `= 4` (cycles 4+), enforced at spawn time.
- Wanderers do not set `room_cleared` flag and do not count against per-room density.

Note: `lib/gameEngine.ts` is touched by H1 (line 292), H2 (post-move block), and H6 (death handler). These three regions are distinct and non-overlapping. Each Howler must grep `gameEngine.ts` before writing to confirm.

### New enemy types (H3 scope, behavioral fields H4 scope)

The `Enemy` interface at `types/game.ts:427` has no behavioral fields. H4 adds these optional fields:
- `critChance?: number` — probability (0.0–1.0) of enemy dealing 1.5× damage on attack
- `fleeThreshold?: number` — HP fraction (0.0–1.0) below which enemy attempts to flee

H3 authors new enemies without these fields (adding `// TODO-H4: critChance/fleeThreshold` comments on entries that will receive them). H4 fills in values on both H3's new enemies and select existing enemies. This design allows true parallel execution between H3 and H4, with H4 doing a final patch on H3's entries.

**TYPE DEPENDENCY: `HollowType` union in `types/game.ts`** — H3 adds 7 new string literals. This union is used in `data/enemies.ts`, all `data/rooms/*.ts` threat pool blocks, and `lib/combat.ts`. H3 must run `tsc --noEmit` after extending the union to catch any exhaustive-switch failures.

### Behavioral hooks contract (H4 scope)

H4 modifies `lib/combat.ts` in two existing functions:
1. `playerAttack()` (~line 245): after damage calculation, check `enemy.critChance` — if the enemy's counter-attack this round rolls under critChance, the damage is multiplied by 1.5.
2. `applyHollowRoundEffects()` (~line 573): check `enemy.fleeThreshold`; if `enemy.hp / enemy.maxHp < fleeThreshold`, roll flee attempt for the enemy (escape combat, no loot).

H4 also adds `combatLogCompress(messages: GameMessage[]): GameMessage[]` as a pure utility in `lib/combat.ts` that collapses consecutive identical messages. This does not change any function signatures.

H4 does NOT touch `startCombat()`, `flee()`, `rollLoot()`, or any part of `lib/gameEngine.ts` beyond what is already called.

### Narrative selection logic

**Death prose (H6):** Creates `lib/deathProse.ts` exporting `selectDeathProse(context: DeathContext): string`. Context: `{ cause: 'combat' | 'infection' | 'environmental' | 'faction-vendetta', zone: string, cycle: number }`. The death handler in `lib/gameEngine.ts` replaces the hard-coded string with a call to this function. H6 also adds a single kill-count increment line (`questFlags['hollow_kills']++`) in the death handler for H7 to consume.

**Faction reactivity (H7):** Uses `questFlags['hollow_kills']` (set by H6) as the trigger. Adds new dialogue nodes to `data/dialogueTrees.ts` and adds a kill-count check in `lib/actions/social.ts` before NPC dialogue node selection.

**Combat world events (H8):** Adds 8+ `WorldEvent` entries to `data/worldEvents/act1_events.ts` and `data/worldEvents/act2_events.ts`. May extend `WorldEvent` in `types/convoy-contracts.d.ts` with an optional `combatParticipation?` field — see Open Questions for the freeze-constraint issue.

---

## 3. Type Dependencies

- `HollowType` union in `types/game.ts` — H3 adds 7 new values. Used by: `data/enemies.ts`, all `data/rooms/*.ts` threatPool blocks, `lib/combat.ts`. All Howlers touching these files depend on the expanded union.
- `Enemy` interface in `types/game.ts` — H4 adds `critChance?`, `fleeThreshold?`. Used by: `lib/combat.ts`, `data/enemies.ts`, all test files that mock Enemy objects.
- `WorldEvent` interface in `types/convoy-contracts.d.ts` — H8 adds `combatParticipation?`. Used by: `lib/worldEvents.ts`, `data/worldEvents/*.ts`. **Freeze constraint — see Open Questions.**

---

## 4. File Ownership Matrix

| Howler | Creates | Modifies |
|--------|---------|----------|
| **H1** | — | `data/rooms/river_road.ts`, `data/rooms/salt_creek.ts`, `data/rooms/the_breaks.ts`, `data/rooms/the_dust.ts`, `data/rooms/the_stacks.ts`, `data/rooms/duskhollow.ts`, `data/rooms/the_ember.ts`, `data/rooms/the_pens.ts`, `data/rooms/the_scar.ts`, `lib/spawn.ts`, `lib/gameEngine.ts` (line 292 only) |
| **H2** | `lib/wanderers.ts`, `tests/unit/wanderers.test.ts` | `lib/gameEngine.ts` (post-move block — distinct from H1 line 292 and H6 death handler), `types/game.ts` (add `WandererState` interface and `WandererEvent` interface if needed) |
| **H3** | `tests/unit/new-enemies.test.ts` | `data/enemies.ts` (append 7 new entries at end only — zero edits to existing entries), `types/game.ts` (extend `HollowType` union), `data/rooms/river_road.ts`†, `data/rooms/salt_creek.ts`†, `data/rooms/the_dust.ts`†, `data/rooms/the_ember.ts`†, `data/rooms/the_breaks.ts`†, `data/rooms/the_scar.ts`†, `data/rooms/duskhollow.ts`† |
| **H4** | `tests/unit/behavioral-hooks.test.ts` | `types/game.ts` (add fields to `Enemy` interface), `lib/combat.ts` (playerAttack + applyHollowRoundEffects + compress utility), `data/enemies.ts` (add behavioral fields to existing entries only — not new H3 entries) |
| **H5** | `tests/unit/loot-drop.test.ts` | `data/enemies.ts` (loot arrays in existing entries only — not new H3 entries, not behavioral fields from H4) |
| **H6** | `lib/deathProse.ts`, `tests/unit/death-prose.test.ts` | `lib/gameEngine.ts` (death handler — add `selectDeathProse()` call and `hollow_kills` increment; region distinct from H1 and H2) |
| **H7** | `tests/integration/faction-reactivity.test.ts` | `data/dialogueTrees.ts`, `lib/actions/social.ts` |
| **H8** | `tests/unit/combat-events.test.ts` | `data/worldEvents/act1_events.ts`, `data/worldEvents/act2_events.ts`, `types/convoy-contracts.d.ts` (conditional on freeze resolution) |

† H3 modifies these 7 room files to add new enemy IDs to `threatPool` arrays. H1 also modifies these same files for `baseChance`/`timeModifier` changes. **Hard sequencing constraint: H1 must merge before H3 begins editing these files.**

**`data/enemies.ts` three-way coordination:**
H3 appends new entries at file end. H4 edits existing entries' `critChance`/`fleeThreshold`. H5 edits existing entries' `loot` arrays. These target different properties on different entries, but to avoid merge conflicts: H4 and H5 complete and merge first (Wave 1), then H3 appends safely (Wave 2).

**`lib/gameEngine.ts` three-region split:**
H1 edits line 292 (`ENEMY_RESPAWN_ACTIONS`). H2 edits the post-move block (after `_applyPopulation`). H6 edits the death handler. All three must grep their target region before writing to confirm no overlap.

---

## 5. Per-Howler Specifications

---

### H1 — Spawn Pipeline Retune
**One-line scope:** Raise `baseChance` floors across 9 zone files, soften daytime modifiers, cut respawn timer to 80, add 1.10× cycle-1 density bonus, loosen Scar/Pens `cycleGate` to 2, and rebalance 4 lopsided threat pools using existing enemy types.

**Owned files:** (see matrix above — 9 zone files + `lib/spawn.ts` + `lib/gameEngine.ts` line 292)

**Frozen contracts:**
- `pressureModifier(pressure: number): number` signature in `lib/spawn.ts` must not change.
- `computePressure(cycle: number): number` must not change — other Howlers depend on stable pressure levels.
- `cycleGate` field on `Room` type must not be removed.
- Do not add any new rooms or remove any rooms. Data edits only.

**Specific changes:**
1. `lib/spawn.ts:pressureModifier` — new body: `return 1.0 + Math.max(0, pressure - 1) * 0.15 + (pressure === 1 ? 0.10 : 0.0)`
2. `lib/gameEngine.ts:292` — `ENEMY_RESPAWN_ACTIONS = 160` → `= 80`
3. All 34 rooms in `the_scar.ts` and `the_pens.ts` with `cycleGate: 3` → `cycleGate: 2`. Before changing: audit these rooms' `extras`, `descriptionPool`, and `narrativeNotes` for any cycle-3-specific narrative content that would be exposed too early.
4. Per-zone `baseChance` increases — apply to `hollowEncounter.baseChance` fields. Leave Crossroads (max 0.15) and Covenant (max 0.12) as near-safe hubs.
5. `timeModifier.day` in affected zones: raise from 0.4–0.5 range to 0.7–0.8.
6. Threat-pool rebalancing in Duskhollow, River Road, Stacks, Dust: add `remnant` (weight ~20) and `stalker` (weight ~15) entries, reduce dominant entry weight so no single type exceeds 70% of total.

**Tests:**
- `pressureModifier(1)` returns 1.10.
- `pressureModifier(3)` returns 1.30 (unchanged from prior formula — pressure 3 → `1.0 + 2 * 0.15 = 1.30`).
- For each rebalanced zone, total threat-pool weight sum / dominant-entry weight ≥ 1.43 (i.e., dominant ≤ 70%).
- All 1475 existing tests pass after respawn timer and pressure changes.

**Effort:** M  
**Depends on:** Nothing — first task in execution order.  
**Pre-mortem:** "If this task fails or takes 3× longer, it will be because: the pressureModifier change breaks downstream test assertions that hard-code the old pressure-1 = 1.0 value, requiring a grep-and-fix pass across the 65 test files."

---

### H2 — Wandering Enemies System
**One-line scope:** New `lib/wanderers.ts` module implementing pressure-driven wanderer movement, integrated at the post-move hook in `lib/gameEngine.ts`.

**Owned files:** (see matrix above)

**Frozen contracts:**
- Exported function signature: `tickWanderers(state: WandererState, currentRoomId: string, zoneId: string, cycle: number, adjacentRoomIds: string[]): { updatedState: WandererState; event: WandererEvent | null }`
- `WandererEvent` shape: `{ enemyId: string; roomId: string; message: string }`
- Max wanderers: `MAX_WANDERERS_ACTIVE_LOW = 2` (cycles 1–3), `MAX_WANDERERS_ACTIVE_HIGH = 4` (cycles 4+). Constants, not configurable per zone.
- Wanderers do not set `room_cleared` and do not count against per-room `hollowEncounter` rolls.
- Persist `WandererState` inside `narrative_progress` JSONB — no new Supabase column, no migration.
- Initial wanderer types: only `stalker` and (after H3 merges) `apex_screamer`. Do not reference H3 enemy IDs directly — make the wanderer type a string that callers supply.

**Specific changes:**
1. `lib/wanderers.ts`: implement `WandererState` (map of wanderer ID → current room), `tickWanderers`, `spawnWanderer`, `getActiveWanderers` (filtered by zone), `capWanderers`.
2. `lib/gameEngine.ts`: in the post-move block (after the `_applyPopulation` call and before the NPC spawn block), call `tickWanderers` and append any `WandererEvent` messages to the output. Identify exact line range by reading the post-move region before writing.

**Tests:**
- `tickWanderers` with 0 wanderers returns null event.
- At cap, `spawnWanderer` returns without adding a new wanderer.
- Wanderer movement does not produce a roomId outside the current zone.

**Effort:** M  
**Depends on:** Nothing (no overlap with H1's line 292 edit in `gameEngine.ts`).  
**Pre-mortem:** "If this task fails or takes 3× longer, it will be because: the `narrative_progress` JSONB column has existing shape assumptions that make nesting `WandererState` inside it awkward, requiring either a new column (migration) or a different persistence strategy."

---

### H3 — New Enemy Roster
**One-line scope:** Add 7 new enemies to `data/enemies.ts` and integrate them into zone threat pools. Runs after H1 merges.

**Owned files:** (see matrix — append to `data/enemies.ts`, extend `HollowType`, add to 7 zone threatPools)

**TYPE DEPENDENCY:** Extending `HollowType` in `types/game.ts` affects every file importing this type. Run `tsc --noEmit` after the extension before editing zone files.

**Frozen contracts:**
- Append new enemy entries at the END of `data/enemies.ts`. Zero edits to existing entries (H4 and H5 own those).
- New entries include `// TODO-H4: add critChance/fleeThreshold here` on entries that will receive behavioral fields from H4.
- Zone placement rules: `frenzy` and `apex_screamer` must NOT appear in Crossroads or Covenant threat pools. `lucid_thrall` appears only in Deep and Scar (now cycleGate:2 after H1). `accord_peacekeeper` goes in the Duskhollow approach room (not inside Covenant interior).
- Do not change existing enemy loot arrays (H5 scope) or add behavioral fields (H4 scope).

**Enemies to add:**
1. `frenzy` — HP 8, attack 5, defense 8, damage [6,12], xp 60. Glass cannon. Zones: dust, breaks, scar. Note: "explodes on death" is flavor text only in Convoy 1; mechanical AoE is Convoy 2.
2. `apex_screamer` — HP 8, attack 4, defense 8, damage [4,10], xp 70. Glass cannon / caster. Zones: breaks, scar, deep.
3. `drifter_road_warden` — HP 28, attack 3, defense 12, damage [3,7], xp 120. Faction: Drifters. Zone: river_road only.
4. `salter_scout` — HP 32, attack 4, defense 13, damage [3,8], xp 130. Faction: Salters. Zone: salt_creek only.
5. `accord_peacekeeper` — HP 26, attack 3, defense 12, damage [2,6], xp 110. Faction: Accord/Covenant. Zone: duskhollow (approach room only).
6. `kindling_zealot` — HP 32, attack 4, defense 11, damage [3,8], xp 140. Faction: Kindling. Zone: ember.
7. `lucid_thrall` — HP 36, attack 5, defense 12, damage [4,9], xp 180. Faction: Sanguine. Zone: deep and scar.

**Tests:**
- Each new enemy has valid `id`, `name`, `hp`, `damage` tuple, `loot` array, and `resistanceProfile`.
- Zone threat-pool weight totals are positive after adding new entries.
- No new enemy appears in Crossroads or Covenant threat pools (automated assertion).

**Effort:** M  
**Depends on:** H1 must merge first (H3 writes to 7 zone files that H1 also touches). H4 must have delivered the `Enemy` interface extension so TypeScript compiles correctly if any new enemies use `critChance` — but since H3 adds fields as `// TODO-H4` comments only, H3 can proceed with the existing interface.  
**Pre-mortem:** "If this task fails or takes 3× longer, it will be because: the `HollowType` union expansion triggers exhaustive-switch errors in `lib/combat.ts` or `lib/gameEngine.ts` that were not caught in planning, requiring a search for all switch-on-hollowType patterns and adding fallthrough cases."

---

### H4 — Behavioral Hooks
**One-line scope:** Add `critChance` and `fleeThreshold` optional fields to `Enemy` interface, implement the hooks in `lib/combat.ts`, and add combat log compression utility.

**Owned files:** (see matrix — `types/game.ts` Enemy interface, `lib/combat.ts` two functions + new utility, `data/enemies.ts` behavioral fields on existing entries)

**Frozen contracts:**
- `playerAttack(player, enemy, weapon, state, ...): AttackResult` — signature must not change.
- `applyHollowRoundEffects(state): { state, messages }` — signature must not change.
- `critChance` semantics: on each enemy attack in `applyHollowRoundEffects` (or wherever enemy attacks are resolved — confirm by reading the function), if `Math.random() < enemy.critChance`, the damage for that attack is `Math.ceil(baseDamage * 1.5)`. This is the same formula as player crits at `lib/combat.ts:185`.
- `fleeThreshold` semantics: checked at the start of `applyHollowRoundEffects`; if `enemy.hp / enemy.maxHp < fleeThreshold`, the enemy exits combat (no loot, room clears, message output).
- `combatLogCompress(messages: GameMessage[]): GameMessage[]` — pure function, collapses consecutive identical `text` fields into one entry with ` (×N)` suffix.
- Both new fields are `optional` — enemies without them behave identically to today. No existing test should break.

**Enemies to add behavioral fields to (existing roster):**
- `screamer`: `fleeThreshold: 0.30` (fits lore — signal flare enemy avoids direct fight)
- `stalker`: `critChance: 0.15` (ambush specialist)
- `brute`: `critChance: 0.10` (slow but devastating swing)
- H3's new enemies (after H3 merges): `frenzy` gets `critChance: 0.25`; `apex_screamer` gets `fleeThreshold: 0.20`.

**Tests:**
- Enemy with `critChance: 1.0` always crits (damage = `ceil(baseDamage * 1.5)`).
- Enemy with `fleeThreshold: 1.0` flees immediately on first round.
- Enemy without either field: behavior identical to pre-H4 (regression guard using existing enemy in existing test).
- `combatLogCompress(['foo','foo','foo'])` returns `['foo (×3)']` (or equivalent collapsed representation).
- Existing 1700-line combat test suite passes without modification.

**Effort:** M  
**Depends on:** Can run in parallel with H1, H2, H5, H6, H8 in Wave 1. Must coordinate with H3 on `data/enemies.ts` — H4 edits existing entries (lines before H3's appended entries), H3 appends new entries. No structural conflict if both Howlers are careful about line ranges, but safest to have H4 merge before H3 (Wave 1 vs Wave 2).  
**Pre-mortem:** "If this task fails or takes 3× longer, it will be because: test fixtures that mock the `Enemy` type exhaustively (without allowing extra properties) fail TypeScript compilation after the interface extension, requiring a fixture-update pass across multiple test files."

---

### H5 — Loot Drop Fix
**One-line scope:** Add `.22 LR` currency entries to every enemy loot table that lacks them, and reduce Brute's overweighted scrap_metal drop.

**Owned files:** (see matrix — `data/enemies.ts` loot arrays in existing entries only)

**Frozen contracts:**
- H5 ONLY touches `loot: []` arrays in existing entries. No HP, attack, defense, damage, behavioral fields, or new entries.
- Verify `ammo_22lr` is a valid item ID: `grep "'ammo_22lr'" data/items.ts`. If not found, check `grep "22lr\|22_lr\|ammo_22" data/items.ts` and use the correct ID.
- Do not change loot tables for entries appended by H3. H5 runs in Wave 1, H3 runs in Wave 2, so there is no conflict — but H5 should not reference H3's new enemy IDs.

**Specific changes:**
- Add `{ itemId: 'ammo_22lr', chance: 0.20 }` to: `remnant`, `stalker`, `brute`, `whisperer`, `sanguine_feral`, `red_court_enforcer`, `elder_sanguine`, `meridian_ancient_hollow`, `elder_sanguine_deep`, `hive_mother_the_deep`, `hollow_brute_deep`, `hollow_remnant_deep`.
- `shuffler` and `screamer` already have `ammo_22lr` in loot — verify and leave unchanged.
- Brute `scrap_metal` chance: 0.60 → 0.35.

**Tests:**
- Statistical test: `rollLoot(enemy)` for each modified enemy run 500 times, assert at least one `ammo_22lr` result.
- Brute loot test: 500 rolls, assert `scrap_metal` appears in fewer than 45% of results (was 60%).

**Effort:** S  
**Depends on:** Nothing in Wave 1. H5 should not begin editing any entries that H3 will add — those don't exist yet, and H3 runs in Wave 2.  
**Pre-mortem:** "If this task fails or takes 3× longer, it will be because: `ammo_22lr` does not exist as a valid item ID in `data/items.ts` and needs to be added there first, which is outside the H5 scope and requires a quick cross-check."

---

### H6 — Death Prose Variants (E1)
**One-line scope:** Create `lib/deathProse.ts` with 7 death prose templates selected by cause/cycle/zone; wire into the death handler in `lib/gameEngine.ts`; add kill-count increment for H7.

**Owned files:** (see matrix — creates `lib/deathProse.ts` + test; modifies `lib/gameEngine.ts` death handler only)

**Frozen contracts:**
- `selectDeathProse(context: DeathContext): string` — exported from `lib/deathProse.ts`. `DeathContext`: `{ cause: 'combat' | 'infection' | 'environmental' | 'faction-vendetta', zone: string, cycle: number }`.
- The death handler change in `lib/gameEngine.ts` is exactly two modifications: (1) replace the hard-coded death prose string with `selectDeathProse(context)`, (2) add `player.questFlags['hollow_kills'] = (player.questFlags['hollow_kills'] ?? 0) + 1` immediately before the death sequence completes. No other changes to the death handler.
- Do NOT touch `rebirthWithStats()`, `createCharacter()`, or Supabase persistence logic.
- Minimum 7 variants. Required variants: combat-generic, combat-in-Sanguine-territory, cycle-1 (first-run tone), cycle-5-plus (veteran tone), environmental/infection, faction-vendetta, and one wildcard (location-specific or cycle-aware interpolation).

**Tests:**
- `selectDeathProse({ cause: 'combat', zone: 'the_scar', cycle: 1 })` returns non-empty string.
- `selectDeathProse({ cause: 'combat', zone: 'the_scar', cycle: 1 })` and `selectDeathProse({ cause: 'combat', zone: 'crossroads', cycle: 6 })` return different strings.
- All 7 variants are reachable by some input combination (coverage check using varied inputs).
- Existing death handler tests in integration test suite pass after the call-site change.

**Effort:** S  
**Depends on:** Nothing — `lib/deathProse.ts` is new and independent. The `lib/gameEngine.ts` death handler change is a targeted single-region modification with no overlap from H1 (line 292), H2 (post-move block).  
**Pre-mortem:** "If this task fails or takes 3× longer, it will be because: the death handler in gameEngine.ts embeds the prose inline inside a block with conditional logic rather than as a simple string, making surgical replacement harder than expected."

---

### H7 — Faction Combat Reactivity (E4)
**One-line scope:** Add body-count-triggered dialogue nodes for Marshal Cross, Patch, Vesper, and Lev; wire kill-count check in `lib/actions/social.ts`. Runs after H6 merges.

**Owned files:** (see matrix — `data/dialogueTrees.ts`, `lib/actions/social.ts`, creates integration test)

**Frozen contracts:**
- Kill-count field: `player.questFlags['hollow_kills']` (integer), incremented by H6's death handler change. H7 reads this field but does not write it.
- Trigger thresholds: 5 kills (light awareness), 15 kills (strong acknowledgment), 30 kills (reputation comment). Each NPC may use different thresholds that fit their character.
- At minimum 3 new dialogue nodes per NPC (Marshal Cross, Patch, Vesper, Lev). Lines must fit established NPC voice (Marshal Cross: tactical/resource framing; Patch: clinical observation; Vesper: aesthetic distance; Lev: data/pattern observation).
- Do not modify `data/npcs.ts`. Do not touch any combat path.
- Dialogue trigger is additive — existing dialogue for these NPCs must still fire in their existing conditions. Kill-count dialogue is supplemental, not replacing.

**Tests:**
- `player.questFlags['hollow_kills'] = 0` → NPC returns default dialogue (no new node).
- `player.questFlags['hollow_kills'] = 20` → Marshal Cross returns a combat-aware line.
- NPC dialogue nodes pass any existing dialogue-tree schema validation tests (grep `tests/integration/` for dialogue tests before writing).

**Effort:** M  
**Depends on:** H6 must merge first (H7 depends on `hollow_kills` being incremented by H6's death handler change).  
**Pre-mortem:** "If this task fails or takes 3× longer, it will be because: `data/dialogueTrees.ts` is large (~130 nodes) and authoring 12+ new NPC lines in consistent voice across four NPCs is creative work that often requires multiple draft passes to feel right."

---

### H8 — Combat World Events (E5)
**One-line scope:** Add 8+ new combat world events to the act1 and act2 event data files; extend `WorldEvent` type with optional `combatParticipation` field if the freeze constraint allows.

**Owned files:** (see matrix — `data/worldEvents/act1_events.ts`, `data/worldEvents/act2_events.ts`, `types/convoy-contracts.d.ts` conditionally)

**Frozen contracts:**
- Existing `WorldEvent` fields must not change — only add `combatParticipation?` as optional.
- Combat events must NOT fire during active combat. Verify by reading the `getScheduledEvents()` call site in `lib/gameEngine.ts` to confirm it is outside the `combatState` block. Add a test asserting events do not fire when `state.combat !== null`.
- If `types/convoy-contracts.d.ts` frozen-contract header blocks extension: H8 creates a new type `CombatWorldEvent extends WorldEvent` in `lib/worldEvents.ts` or in a new `data/worldEvents/combatEvents.ts`. Do not block on the freeze decision — attempt the extension, and if it fails the process, use the fallback type.

**Events to author (8 minimum — spread between act1 and act2):**
1. "Hollow swarm converging north — Drifters holding the bridge, calling for help." (Act 1, interval 30)
2. "Sanguine raiding party hit the creek caravan — survivors moving south." (Act 1, interval 45)
3. "Accord and Salters clashed at the ford last night — bodies on both banks." (Act 1, interval 60)
4. "Screamer signal from the Breaks. Three groups of Hollow converging." (Act 1, interval 40)
5. "Kindling patrol burning Hollow nests in the Ember. Smoke visible from two zones away." (Act 2, interval 35)
6. "Red Court patrol sighted the Drifter camp. Both sides are armed. Nobody has fired." (Act 2, interval 50)
7. "Deep colony eruption. Hollow spilling from the old mine entrance at Stacks border." (Act 2, interval 55)
8. "Pack of Sanguine ferals cleared a Salter outpost at dawn. No survivors reported." (Act 2, interval 65)

**Tests:**
- Each new event fires at expected action interval (unit test of `getScheduledEvents`).
- Events with faction gates do not fire outside rep range.
- World events do not fire when `state.combat !== null`.

**Effort:** M  
**Depends on:** Nothing (fully independent).  
**Pre-mortem:** "If this task fails or takes 3× longer, it will be because: the frozen-contract constraint on `convoy-contracts.d.ts` triggers a process question that requires user decision, stalling the task while awaiting resolution."

---

## 6. Cross-Howler Coordination

### Hard sequencing constraints

1. **H1 before H3** — H3 adds new enemy IDs to 7 zone room files that H1 also modifies for `baseChance` and `timeModifier` changes. H1 must merge to the convoy branch before H3 begins editing those zone files. This is the single biggest sequencing risk for the Howler dispatch.

2. **H6 before H7** — H7 depends on `questFlags['hollow_kills']` being incremented in the death handler, which H6 adds. H6 must merge before H7 begins.

3. **H4 and H5 before H3 on `data/enemies.ts`** — H4 and H5 edit existing entries in `data/enemies.ts`; H3 appends new entries. Running H4 and H5 first in Wave 1, then H3 in Wave 2, eliminates any merge conflict on this file.

### Parallel wave structure

**Wave 1 (simultaneous):** H1, H2, H4, H5, H6, H8

**Wave 2 (after Wave 1 merges):** H3 (after H1+H4+H5 merge), H7 (after H6 merges)

Wave 1 completes 6 of 8 Howlers in one dispatch. Wave 2 is 2 Howlers.

### `lib/gameEngine.ts` coordination

Three Howlers touch `lib/gameEngine.ts` in Wave 1 (H1 at line 292, H2 at post-move block, H6 at death handler). These are three distinct, non-overlapping code regions. Gold should verify after Wave 1 merges by running `diff` on gameEngine.ts to confirm no merge conflicts before Wave 2 dispatch.

### `types/game.ts` coordination

H2 may add `WandererState`/`WandererEvent` interfaces. H3 extends `HollowType` union. H4 adds fields to `Enemy` interface. All three modify different declarations. Git merge should handle this cleanly, but if all three are in Wave 1, coordinate merge order: H4 → H2 → H3, so `Enemy` interface is stable before wanderer types are added and before `HollowType` is extended.

---

## 7. Acceptance Criteria (Convoy Level)

White + Gray quality gate must clear all of the following before Copper opens the PR.

### Regression
- [ ] All 1475 existing tests pass (1 skip, 1 todo acceptable — no new failures)
- [ ] `tsc --noEmit` clean — zero TypeScript errors

### M1 (partial) — Combat density
- [ ] Cycle-1 mid-game walk through Salt Creek, Breaks, or Dust yields ≥10 encounters per 50-room traverse, verified via playtest harness with `forceSpawn:false`. Full M1 target (18–25) is gated on Convoy 2.

### M2 — Enemy variety
- [ ] No zone has a single enemy type above 70% of total threat-pool weight. Verify by summing `weight` fields per zone's `threatPool` entries and asserting `max_weight / total_weight ≤ 0.70`.

### M5 (partial) — Narrative coherence
- [ ] Death prose has ≥7 distinct variants, each reachable by different cause/cycle/zone inputs
- [ ] Marshal Cross, Patch, Vesper, and Lev each have ≥3 kill-count-triggered dialogue lines
- [ ] ≥8 new combat world events exist in `data/worldEvents/` with correct interval and act settings

### Enemy roster
- [ ] 7 new enemies defined with valid stats, loot tables, and resistanceProfile
- [ ] `frenzy` and `apex_screamer` absent from Crossroads and Covenant threat pools

### Behavioral hooks
- [ ] ≥5 enemies have `critChance` or `fleeThreshold` populated
- [ ] Enemy crit produces `ceil(baseDamage * 1.5)` damage (test verifiable)
- [ ] Enemy flee exits combat, no loot drop (test verifiable)

### Loot currency
- [ ] All 16 original enemy loot tables include at least one `ammo_22lr` entry

### Cycle gate
- [ ] `grep "cycleGate: 3" data/rooms/the_scar.ts` returns no results
- [ ] `grep "cycleGate: 3" data/rooms/the_pens.ts` returns no results

### Spawn tuning
- [ ] `pressureModifier(1)` returns 1.10
- [ ] `ENEMY_RESPAWN_ACTIONS` is 80 (grep `lib/gameEngine.ts`)

### No engine regressions
- [ ] Wanderer tick does not cause infinite loop or stack overflow on room traversal tests
- [ ] World events do not fire when `state.combat !== null`

---

## 8. Risks

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|------------|
| R1 | Scar/Pens cycleGate 3→2 exposes cycle-3 narrative in room `extras`, `descriptionPool`, or `narrativeNotes` to cycle-2 players | Medium | Medium | H1 must audit both zone files for any content referencing cycle-3 plot events before flipping the gate value. Grep for `cycle` in the narrative fields of both files. |
| R2 | Wanderer cap not enforced causes performance degradation at high pressure | Low | High | Hard-cap enforced in `spawnWanderer()` before adding to state. Unit test at cycle 6 asserts no wanderer spawns when already at cap. |
| R3 | Faction reactivity dialogue leaks ending spoilers | Low | Medium | H7's new dialogue nodes must not reference ending-specific events (Cure/Weapon/Seal/Throne flags). Kill-count triggers only; no ending-state checks. |
| R4 | Combat world events fire during active combat (concurrency hazard) | Low | Medium | H8 verifies `getScheduledEvents()` call site is outside `combatState` block in `gameEngine.ts`. Test: world event check with `state.combat !== null` returns empty array. |
| R5 | `frenzy` explode-on-death mechanic missing from combat (flavor text only) | Low-Medium | Low | Explicitly scoped as flavor text for Convoy 1. Mechanical AoE is Convoy 2. H3 adds a `narrativeNotes` field on the enemy noting this deferral. |
| R6 | `convoy-contracts.d.ts` freeze constraint blocks H8's type extension | Medium | Medium | H8 fallback: define `CombatWorldEvent` in `lib/worldEvents.ts` as a separate type extending `WorldEvent`. No need to touch `convoy-contracts.d.ts`. |
| R7 | H4's optional `Enemy` fields break TypeScript strict-mode in test mocks | Medium | Medium | Optional fields with `?:` syntax should not break existing code. However, test mocks that use `as Enemy` casts or `Partial<Enemy>` may behave differently. H4 runs `tsc --noEmit` after the interface change before touching `data/enemies.ts`. |
| R8 | H1's respawn timer cut (160→80) makes cleared rooms feel insecure for narrative-heavy sequences | Low | Low | This is the desired effect for a battle-MUD. If playtesting reveals it breaks specific narrative sequences (e.g., a puzzle room that requires dwelling), those rooms can get `noCombat: true` flag — which already exists in the type. |

---

## 9. Out of Scope (Deferred to Convoys 2–4)

**Convoy 2 (Gear Overhaul):**
- Random affixes (prefix/suffix system on drops)
- Gear rarity tiers (Common/Uncommon/Rare/Epic/Legendary)
- Rarity color coding in item names
- Boss-unique drop tables
- New armor slots (head/chest/legs/feet)
- `statBonus` field on items
- Initiative system
- Durability (opt-in)
- Auto-loot UX and `loot all` / `loot <type>` verbs
- Loot summary line after combat
- Faction-flavored gear items
- Gear lore (E2 — all Rare+ items)

**Convoy 3 (Class Identity):**
- Class active abilities (slam, vanish, garrote, etc.)
- Class-specific combat verbs registered in parser
- New status conditions (Marked, Silenced, Bound, Exposed)
- Build paths (3 per class)
- Loadouts
- Set bonuses
- Boss intros (E3)

**Convoy 4 (Endings and Apex):**
- Ending-specific final bosses (Hollow Avatar, Lord of Cups, Sealed One, The Throne)
- Echo boss (prior-cycle self)
- Zone-signature mini-bosses (Canyon Sentinel, Wildfire Guardian, etc. — PRD B4)
- Swarm mechanics (Plague Carrier, Hive Worker — PRD B3)
- Boss phase mechanics with HP thresholds (PRD B5)
- Remaining faction reactivity NPCs beyond the 4 priority ones
- Resistance reveal on first hit (PRD B9/F6)
- Round summary line per combat round (PRD F1)
- Verbose/terse combat log toggle (PRD F3)
- Faction color coding in combat output (PRD F4)
- Rebirth tree / permanent upgrade system

---

## Open Questions

- [ ] **Frozen `convoy-contracts.d.ts`:** Can H8 add an optional field to `WorldEvent` in this file, or does the `FROZEN AT DISPATCH` header require a formal amendment process? — Blocks: H8 type extension path only (fallback available). Default if unresolved: H8 uses the `CombatWorldEvent` fallback type in `lib/worldEvents.ts`.

- [ ] **`frenzy` mechanical death:** Is flavor-text-only "explodes on death" acceptable for Convoy 1, or does the glass-cannon archetype require a mechanical death effect to be viable? — Blocks: H3 if the answer is "mechanical effect required." Default: flavor text only for Convoy 1, mechanical AoE deferred to Convoy 2.

---

## Definition of Done

- [ ] All Wave 1 and Wave 2 Howlers complete with no open blockers
- [ ] All 1475 existing tests pass; new tests pass; `tsc --noEmit` clean
- [ ] White + Gray quality gate passes on merged result
- [ ] All convoy-level acceptance criteria checked green
- [ ] PR description notes any coverage gaps as warnings (not blockers)
