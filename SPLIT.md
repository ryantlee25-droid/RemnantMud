# SPLIT: convoy-2-gear

**Branch:** `dev/convoy-2-gear`
**Base commit:** `d508023` (feat(types): Convoy 2 type freeze pre-pass)
**Plan source:** `PLAN.md` — Convoy 2 Gear Overhaul (2026-04-24)

> Type freeze pre-pass is DONE. All 9 type fields are in `types/game.ts`.
> Wave 1-3 Howlers MUST NOT add new fields to `types/game.ts`.

---

## THREE-WAVE DISPATCH — READ THIS FIRST

```
TYPE FREEZE: already at d508023 — do not re-run

WAVE 1 — 5 Howlers in parallel (drop off d508023)
  H1  rarity backfill       data/items.ts, lib/ansiColors.ts
  H2  affix system          lib/affixes.ts (create), lib/loot.ts
  H3  loot count            data/enemies.ts, lib/loot.ts
  H5  AoE primitive         data/enemies.ts, lib/actions/combat.ts
  H6  armor slot expansion  lib/inventory.ts, lib/actions/combat.ts,
                            lib/actions/items.ts + migration (create)
  H4  stat bonus            -- HOLDS until H6 merges (same file) --

  Merge all Wave 1 + H4. Run pnpm test. Gate must pass before Wave 2.

WAVE 2 — partial parallel (after Wave 1 merged + tests pass)
  H7  7 new enemies         data/enemies.ts              -- drop immediately
  H9  60+ gear items        data/items.ts                -- parallel with H7
  H8  zone integration      7 data/rooms/ files          -- HOLDS until H7 merges
                                                            SEQUENTIAL: one zone at a time
  H10 boss drops + sets     data/enemies.ts, data/sets.ts (create), lib/loot.ts
                                                         -- HOLDS until H9 merges

  Merge all Wave 2. Run pnpm test. Gate must pass before Wave 3.

WAVE 3 — mixed (after Wave 2 merged + tests pass)
  H11 gear lore             data/items.ts                -- parallel with H12
  H12 boss intros           data/enemies.ts              -- parallel with H11
  H13 Cross + Patch         data/dialogueTrees.ts        -- after H11+H12 merge
  H14 Lev + Howard + Sparks data/dialogueTrees.ts        -- HOLDS until H13 merges

  Merge all Wave 3.

POST-MERGE QUALITY GATE (once on full convoy diff)
  White + Gray + /diff-review in parallel. Zero blockers. Copper opens PR.

OPTIONAL (after gate clears)
  H15 durability (default OFF) — resolve DB schema question before dropping.
```

---

## ANTI-STALL GUARDRAILS

**H4 equip-cycle test is a LAUNCH-BLOCKER.** Mandatory: 100-cycle equip/unequip loop
asserting stat returns to exact base value — no accumulation. H9 (60+ statBonus items)
and H10 (set bonuses) build on this foundation. Do not merge H4 without this test passing.

**H8 threatPool concurrency hazard.** Seven zone files, one at a time. Commit each zone
file before opening the next. Concurrent threatPool array edits corrupt spawn weights on
merge.

**H9 stall risk at item 30.** Batch by slot type: head armor → chest → legs → feet →
weapons → faction gear → boss-unique stubs. Random ordering causes creative fatigue and
incoherent stat bands.

**H6 breaks existing equip tests by design.** Old invariant: "equipping armor unequips all
armor." New invariant: "equipping armor unequips same-slot armor only." Fix broken tests
before merging. If >5 failures after H6 changes, escalate via Orange.

**H13/H14 file-size trap.** `data/dialogueTrees.ts` is ~5,700 lines. Grep for NPC IDs
only; do not read the full file. Both Howlers must stay in their NPC subtrees.

---

## File Ownership Matrix

| Howler | Wave | Creates | Modifies |
|--------|------|---------|----------|
| H1 — rarity backfill | 1 | — | `data/items.ts`, `lib/ansiColors.ts` |
| H2 — affix system | 1 | `lib/affixes.ts` | `lib/loot.ts` |
| H3 — loot count | 1 | — | `data/enemies.ts`, `lib/loot.ts` |
| H4 — stat bonus on equip | 1-tail | — | `lib/actions/items.ts` |
| H5 — AoE primitive | 1 | — | `data/enemies.ts`, `lib/actions/combat.ts` |
| H6 — armor slot expansion | 1 | `supabase/migrations/20260424000002_armor_slots.sql` | `lib/inventory.ts`, `lib/actions/combat.ts`, `lib/actions/items.ts` |
| H7 — 7 new enemies | 2 | — | `data/enemies.ts` |
| H8 — zone integration | 2-seq | — | `data/rooms/river_road.ts`, `data/rooms/salt_creek.ts`, `data/rooms/covenant.ts`, `data/rooms/the_ember.ts`, `data/rooms/the_breaks.ts`, `data/rooms/the_dust.ts`, `data/rooms/the_stacks.ts` |
| H9 — 60+ gear items | 2 | — | `data/items.ts` |
| H10 — boss drops + sets | 2-tail | `data/sets.ts` | `data/enemies.ts`, `lib/loot.ts` |
| H11 — gear lore | 3 | — | `data/items.ts` |
| H12 — boss intros | 3 | — | `data/enemies.ts` |
| H13 — dialogue A (Cross + Patch) | 3 | — | `data/dialogueTrees.ts` |
| H14 — dialogue B (Lev + Howard + Sparks) | 3-tail | — | `data/dialogueTrees.ts` |
| H15 — durability (optional) | post | — | `types/game.ts`, `lib/actions/combat.ts`, `data/recipes.ts` |

---

## Conflict Audit — 8 Advisories

| File | Howlers | Advisory | Resolution |
|------|---------|----------|------------|
| `data/enemies.ts` | H3+H5 (W1) → H7 (W2) → H10+H12 (W3) | ADVISORY-1 | W1: H3 edits loot table fields on existing entries; H5 appends 2 new entries at array end — non-overlapping sections. Verify at W1 merge. W2: H7 appends 7 entries after W1. W2-tail: H10 edits boss loot after H9. W3: H12 adds intro fields after W2. Sequential waves are the guard. |
| `lib/loot.ts` | H2 creates → H3 extends (W1) → H10 extends (W2-tail) | ADVISORY-2 | H2 creates file (check if exists from Convoy 1; extend if present). H3 adds count resolver — check for file existence before writing. H10 adds set detection post-Wave 2. One active writer per wave. |
| `lib/actions/combat.ts` | H5 + H6 (both W1) | ADVISORY-3: hot pair | Non-overlapping: H5 edits `handleEnemyDefeated()` for onDeath; H6 edits lines 249-250 for defense sum. If both modified the same function body at merge, rebase second branch before landing. Gold verifies at W1 merge. |
| `lib/actions/items.ts` | H6 (W1) then H4 (W1-tail) | ADVISORY-4 | H6 merges first. H4 reads H6's rewritten `handleEquip()` before writing a line. Sequential by design. |
| `data/items.ts` | H1 (W1) → H9 (W2) → H11 (W3) | ADVISORY-5 | H1 backfills rarity on 182 existing items. H9 appends 60+ new items. H11 fills loreText on Rare+ items. Sequential waves; one writer per wave. |
| `data/dialogueTrees.ts` | H13 (W3) then H14 (W3-tail) | ADVISORY-6 | H14 drops only after H13 merges. Node ID namespaces: H13 = `cross_hollow_*`, `patch_hollow_*`; H14 = `lev_hollow_*`, `howard_hollow_*`, `sparks_hollow_*`. No ID collision possible. |
| `types/game.ts` | H15 only (post) | ADVISORY-7: type freeze guard | H15 is the ONLY post-convoy modifier. W1-3 Howlers must not touch this file. If any W1-3 Howler proposes a types/game.ts edit, stop and escalate. |
| `data/rooms/the_breaks.ts` + `the_dust.ts` | H8 (W2-seq) | ADVISORY-8 | H8 adds frenzy (from H5) to both zones by string ID reference only. Not a structural dependency — H5's enemy entry need only exist before H8 drops. |

---

## Per-Howler Sections

### H1 — Rarity Backfill
Backfill all 182 existing items with `rarity` using bands from PLAN.md. Add 5-tier color
constants to `lib/ansiColors.ts`. Wire color prefix to examine output.

**Do NOT read:** zone files, NPC files, class guides. Bands are in PLAN.md — use verbatim.
**Tests:** each rarity tier >=1 item; all 5 color constants exist; rare item shows blue prefix in examine.

---

### H2 — Affix System
Create `lib/affixes.ts` with `AFFIX_POOL` (20-30 entries, seeded in PLAN.md) and
`rollAffix(item: Item): Item`. Call rollAffix on drop in `lib/loot.ts`.

**Do NOT:** build prefix/suffix tables, compound affixes, or affix persistence.
Check if `lib/loot.ts` exists before creating it.
**Tests:** common item unchanged; epic always gets affix; legendary never modified.

---

### H3 — LootEntry Count Field
Wire `count` resolver in `lib/loot.ts`. Apply specific loot table fixes to
`data/enemies.ts` (full list in PLAN.md section 4 H3).

**Do NOT read:** room files. Enemy loot tables are in `data/enemies.ts` only.
**Tests:** count [2,8] rolls 2-8 inclusive; absent count returns 1; elder_sanguine has ammo_22lr.

---

### H4 — Stat Bonus on Equip (drops after H6)
Wire `statBonus` apply/reverse in `handleEquip()` / `handleUnequip()` in
`lib/actions/items.ts`. In-memory only. Read H6's rewrite of this file before starting.

**LAUNCH-BLOCKER:** 100-cycle equip/unequip loop — stat must not accumulate.
**Do NOT:** add DB column, migration, or new GameState field. In-memory only.
**Tests:** 100-cycle loop passes; combat reads updated stat via `engine.getState().player`.

---

### H5 — AoE Damage Primitive
Append `frenzy` and `apex_screamer` entries to `data/enemies.ts` (exact stats in
PLAN.md). Add one conditional in `handleEnemyDefeated()` in `lib/actions/combat.ts`.

**Do NOT:** implement room-wide AoE, weapon AoE, or new combat infrastructure.
Scope is one conditional. H3 also edits `data/enemies.ts` — H5 appends at array end only.
**Tests:** Frenzy death decreases player HP + logs AoE message; standard enemy death no AoE.

---

### H6 — Armor Slot Expansion
Slot-aware equipItem() in `lib/inventory.ts`. Multi-slot defense sum in
`lib/actions/combat.ts`. Slot name in equip message in `lib/actions/items.ts`.
Create migration placeholder.

**Before starting:** verify `20260327000004_fix_inventory_unique.sql` constraint is on
`(player_id, item_id)` not `(player_id, equipped)`. If latter, a new migration is needed.
**Tests:** head + chest both equipped=true; second head unequips first head; defense sums correctly; broken equip tests fixed.

---

### H7 — 7 New Enemies (data only)
Append exactly 7 enemy entries to `data/enemies.ts`. Exact stats in PLAN.md section 4 H7.
No zone integration (H8 handles that).

**Pre-drop check:** verify `Enemy.onDeath.spawnEnemy?` type exists for plague_carrier. If
not in type freeze, add as Wave 2 pre-pass before H7 drops.
**Do NOT read:** zone files, ability docs, faction guides.
**Tests:** each enemy has id + name + hp + >=1 loot entry; plague_carrier.onDeath.spawnEnemy present.

---

### H8 — Zone Integration (sequential)
Inject 9 enemies into threatPools across 7 zone files. Exact assignments in PLAN.md
section 4 H8. ONE FILE AT A TIME — commit each before opening the next.

**Do NOT read:** the 6 untargeted zone files. Grep threatPool in each target; append only.
Do not change existing weights or baseChance.
**Tests:** each modified zone >=3 enemy types; no room total probability >0.95.

---

### H9 — 60+ New Gear Items
Append 60+ items to `data/items.ts`. All armor must have `armorSlot`. All Rare+ must have
`statBonus` >=1 field and `loreText: ''`. Full target mix + stat bands in PLAN.md.

**Batch order (mandatory):** head → chest → legs → feet → weapons → faction gear → boss stubs.
**Do NOT wait** on balance research — rough bands are sufficient. Balance is Convoy 3.
**Tests:** total items >=240; every armor has armorSlot; every Rare+ has statBonus; no duplicate IDs.

---

### H10 — Boss-Unique Drops + Set Bonuses
Add >=1 unique drop (chance <=0.15) to every boss-tier enemy (xp >= 200). Create
`data/sets.ts` with 3 required sets. Add set bonus detection to `lib/loot.ts` via
`activeBuffs` — do not direct-mutate player stats.

Full boss target list, set definitions, and bonus text in PLAN.md section 4 H10.
**Do NOT:** design more than 3 sets or make set bonuses interact with class abilities.
**Tests:** 2-piece/4-piece bonuses apply and revert correctly; boss loot has >=1 exclusive itemId.

---

### H11 — Gear Lore
Fill `loreText` on all Rare+ items in `data/items.ts`. Target >=50 items. Voice register
and batch order (by faction) in PLAN.md section 4 H11. Banned words: magical, enchanted,
mystical, ancient power, imbued.

**Write in faction batches, not alphabetically.** Voice drifts when items are written randomly.
**Tests:** all Rare+ items have loreText.length > 0; no loreText contains banned words.

---

### H12 — Boss Intros
Populate `bossIntro` and `combatIntro` on 8 required bosses in `data/enemies.ts`. Wire
display in room-entry path (one conditional, xp >= 150 && bossIntro, once per room visit).

Required 8 bosses in PLAN.md section 4 H12. Do not build new infrastructure for display.
**Tests:** all 8 bosses have non-empty fields; bossIntro outputs on first room entry only.

---

### H13 — Dialogue A: Cross + Patch
Add 3 hollowKills-gated nodes per NPC to `data/dialogueTrees.ts`. Exact dialogue copy in
PLAN.md section 4 H13. Node IDs: `cross_hollow_t1/t2/t3`, `patch_hollow_t1/t2/t3`.

**Do NOT read the full file.** Grep for `npcId: 'cross'` and `npcId: 'patch'` only.
Verify player.hollowKills is incremented in combat handler; wire it if not.
**Tests:** tier-1 node shows when flag set; base node shows when no flags; Patch mirrors.

---

### H14 — Dialogue B: Lev + Howard + Sparks (drops after H13)
Add 3 hollowKills-gated nodes per NPC. Exact dialogue copy in PLAN.md section 4 H14.
Node IDs: `lev_hollow_*`, `howard_hollow_*`, `sparks_hollow_*`.

**Do NOT read the full file.** Grep for 3 NPC IDs only. Verify H13's nodes are untouched.
**Tests:** each NPC shows tier-appropriate node; Cross/Patch nodes not corrupted.

---

### H15 — Durability (Optional, default OFF)
Add `durability?: number` to InventoryItem. Decay 0.05/hit. Gate behind
`player.questFlags.durability_enabled`. Add 2 repair recipes to `data/recipes.ts`.

**First step:** inspect `supabase/migrations/` to determine if `player_inventory` uses
per-row columns or jsonb. If per-row, create migration before writing any logic.

---

## Integration / Merge Order

```
d508023 (type freeze on dev/convoy-2-gear)
 |
 +--[W1 parallel]---> H1, H2, H3, H5, H6
 +--[W1-tail]-------> H4 (after H6 merges)
 |
 v  pnpm test passes
 |
 +--[W2 parallel]---> H7, H9
 +--[W2-seq]--------> H8 (after H7; one zone at a time)
 +--[W2-tail]-------> H10 (after H9)
 |
 v  pnpm test passes
 |
 +--[W3 parallel]---> H11, H12
 +--[W3-seq]--------> H13 (after H11+H12)
 +--[W3-tail]-------> H14 (after H13)
 |
 v
 White + Gray + /diff-review — once, full diff
 Copper opens PR
 H15 optional post-gate
```

---

## Pre-Drop Open Questions

1. **lib/loot.ts existence** — exists from Convoy 1? H2 creates if absent, H3 extends.
   Verify before dropping Wave 1.
2. **Enemy.onDeath.spawnEnemy type** — in types/game.ts? Required for plague_carrier (H7).
   If missing, add as Wave 2 pre-pass.
3. **player.hollowKills increment** — wired post-Convoy 1? H13 adds if not. Verify before
   Wave 3.
4. **player_inventory constraint** — on `(player_id, item_id)` or `(player_id, equipped)`?
   Verify before H6 drops. If on equipped, H6 needs additional migration.

---

## Worktree Paths

```
~/.claude/parallel/convoy-2-gear/worktrees/h1-rarity-backfill
~/.claude/parallel/convoy-2-gear/worktrees/h2-affix-system
~/.claude/parallel/convoy-2-gear/worktrees/h3-loot-count
~/.claude/parallel/convoy-2-gear/worktrees/h5-aoe-primitive
~/.claude/parallel/convoy-2-gear/worktrees/h6-armor-slots
~/.claude/parallel/convoy-2-gear/worktrees/h4-stat-bonus
~/.claude/parallel/convoy-2-gear/worktrees/h7-new-enemies
~/.claude/parallel/convoy-2-gear/worktrees/h9-gear-items
~/.claude/parallel/convoy-2-gear/worktrees/h8-zone-integration
~/.claude/parallel/convoy-2-gear/worktrees/h10-boss-drops-sets
~/.claude/parallel/convoy-2-gear/worktrees/h11-gear-lore
~/.claude/parallel/convoy-2-gear/worktrees/h12-boss-intros
~/.claude/parallel/convoy-2-gear/worktrees/h13-dialogue-a
~/.claude/parallel/convoy-2-gear/worktrees/h14-dialogue-b
```

Branch pattern: `parallel/convoy-2-gear/<howler-name>`
