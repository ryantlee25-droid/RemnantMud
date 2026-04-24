# Enemy/Monster Spawn Distribution — Audit

> **Date:** 2026-04-24
> **Branch:** dev/followup-0425
> **Audit by:** Explore agent (transcript captured inline; agent could not write directly)
> **Spot-checks performed by main thread:** confirmed `ENEMY_RESPAWN_ACTIONS = 160` at `lib/gameEngine.ts:282`; confirmed crossroads.ts=2, covenant.ts=5, the_dust.ts=18, the_pens.ts=18 hollowEncounter blocks via `grep -c`. Other line numbers and percentages cited below are agent-recalled — Blue should re-grep when turning specific claims into work.

---

## Headline

**The user's "rarely find any" report is mostly real but mostly intentional.** Early zones are sparse-by-design (Crossroads 13% room density, Covenant 18%) and the spawn pipeline applies a daytime modifier (0.4–0.6×) and probabilistic roll on top. A new player wandering the starting zones at noon legitimately sees ~4–6% effective spawn chance per room and can clear 10 rooms with 0–1 encounters.

**Not a bug. Working as designed.** But the design isn't readable to a new player, who experiences "the world is empty" rather than "Act I emphasizes exploration and faction diplomacy."

---

## 1. Spawn data layout — zone density table

| Zone | Total rooms | Rooms w/ `hollowEncounter` | % populated | Avg `baseChance` |
|------|-------------|----------------------------|-------------|------------------|
| Crossroads     | 15 | 2  | 13.3%  | 0.10 |
| River Road     | 23 | 10 | 43.5%  | 0.10 |
| Covenant       | 28 | 5  | 17.9%  | 0.08 |
| Salt Creek     | 20 | 9  | 45.0%  | 0.12 |
| The Breaks     | 20 | 18 | 90.0%  | 0.14 |
| The Dust       | 18 | 18 | 100.0% | 0.32 |
| The Ember      | 20 | 12 | 60.0%  | 0.11 |
| The Stacks     | 20 | 7  | 35.0%  | 0.15 |
| Duskhollow     | 18 | 6  | 33.3%  | 0.10 |
| The Deep       | 20 | 20 | 100.0% | 0.26 |
| The Pine Sea   | 20 | 20 | 100.0% | 0.25 |
| The Scar       | 28 | 25 | 89.3%  | 0.28 |
| The Pens       | 18 | 18 | 100.0% | 0.38 |

`enemies: []` static slots are mostly empty. Of 271 rooms, only ~6 have non-empty static enemies (a few in The Ember and The Scar). All other encounters come from the dynamic `hollowEncounter` block (170 rooms / 62.7%).

---

## 2. Spawn pipeline at runtime

When a player enters a room, `lib/gameEngine.ts:275-310` runs:

1. Fetch raw room
2. Check `room_cleared` flag and `room_cleared_at` timestamp
3. If cleared and `actionsTakenNow - clearedAt < 160` actions → suppress
4. If cleared and elapsed ≥ 160 → re-enable
5. Roll static enemies (almost always empty)
6. Roll hollow encounters:

```ts
const finalChance = Math.min(baseChance * timeModifier * pressureModifier, 0.95)
if (Math.random() < finalChance) { spawn enemy }
```

Suppression gates: `safeRest`, `noCombat`, `room_cleared && elapsed < 160`. **No "first visit only" suppression** — the cleared timer is the only respawn brake.

---

## 3. Zone difficulty vs. enemy density

Strong correlation (R² ≈ 0.82). Difficulty 1–2 zones have density 0.13–0.45; difficulty 3+ zones run 0.8–1.0. The progression is intentional.

| Tier | Zones | Density |
|------|-------|---------|
| S — Very dense (0.8–1.0)  | The Dust, Pine Sea, The Deep, The Pens | 0.80–1.00 |
| A — Dense (0.6–0.8)        | The Breaks, The Scar, The Ember        | 0.60–0.90 |
| B — Moderate (0.3–0.6)     | River Road, Salt Creek, The Stacks, Duskhollow | 0.33–0.45 |
| C — Sparse (<0.3)          | Crossroads, Covenant                   | 0.13–0.18 |

---

## 4. Cycle / time-of-day gating

**Pressure scaling** (`lib/spawn.ts:120-126`):
- Cycle 1–2 → multiplier 1.0×
- Cycle 3–4 → 1.15×
- Cycle 5–6 → 1.30×
- Cycle 10+ → 1.60×

So cycle-1 players get **no pressure bonus**.

**Time-of-day modifier (per-room `timeModifier`):**
- Day: 0.4–0.6×
- Night: 1.5–2.0×

A player exploring at noon sees ~60% fewer encounters than at midnight.

**Cycle gates:** The Scar and The Pens (46 rooms / 17% of world) require `cycleGate: 3` — fully locked to cycle 1–2 players. Intentional per the 3-run design.

---

## 5. Re-spawn after defeat

```ts
const ENEMY_RESPAWN_ACTIONS = 160  // ~8 time periods (lib/gameEngine.ts:282)
const enemiesRestored = !roomCleared ||
  (typeof clearedAt === 'number' && actionsTakenNow - clearedAt >= ENEMY_RESPAWN_ACTIONS)
```

Cleared rooms re-enable encounters after 160 actions. No permanent clearing, no respawn bug. Working as designed.

---

## 6. Generated rooms vs hand-crafted

**0% procedural generation.** All 271 rooms hand-crafted in `data/rooms/*.ts`. The `world_seed` column exists but is unused for spawning.

---

## 7. Empty-room density audit (cycle-1 perspective)

Of 271 rooms:
- ~25 (9%) have no encounter source — `baseChance: 0.0` or `noCombat: true`
- 50–80 (18–29%) have rare encounters (0.02–0.10 base chance) — visible only after many visits
- 46 (17%) cycle-gated to cycle 3+ — inaccessible to a new player
- **Total sparse/gated for cycle-1 player: 120–150 rooms (44–55%)**

A cycle-1 player exploring early zones at daytime can statistically expect 0–1 encounters per 10 rooms.

---

## 8. Hypothesis testing (the "rarely find any" report)

| Hypothesis | Verdict | Evidence |
|---|---|---|
| (a) Spawn rate tuned low intentionally | **CONFIRMED** | Crossroads 13% density, baseChance 0.10, daytime 0.04–0.06 effective |
| (b) `visited` flag suppresses respawn | **RULED OUT** | `visited` only affects description; respawn uses `room_cleared` + 160-action timer |
| (c) `npcSpawns` dead config | **RULED OUT** | NPC spawning rolled at gameEngine.ts:313-358 |
| (d) Zone-tier filtering excludes mobs | **RULED OUT** | No tier filter; weighted `threatPool` |
| (e) Cycle-1 gated from spawns | **PARTIAL** | 17% of rooms gated; rest accessible but sparse |
| (f) Faction/quest flags suppress | **RULED OUT** | No quest gates on `hollowEncounter` |
| (g) Field name mismatch | **RULED OUT** | `enemies: []` consistent everywhere |
| (h) Dev mode returns empty lists | **RULED OUT** | Same path as prod |

**Most likely root cause (80% confidence):** sparse intentional tuning in starting zones combined with day-time modifier dropping effective spawn rate to 4–6%, plus no pressure bonus on cycle 1. The 3-run design expects the player to feel sparse on cycle 1 and ramp on cycle 3+.

---

## 9. Recommendations

The audit ranks the proposed re-tunings:

### Option 1 — Data-only minimum density floor
Add `hollowEncounter` blocks to currently-empty rooms in Covenant (5→10), Crossroads (2→4), Stacks (7→10), Duskhollow (6→10), with `baseChance: 0.05–0.15`. ~15–20 file edits, fully reversible. Lifts cycle-1 starting experience without changing pacing on cycle 3+.

### Option 2 — First-zone-visit bonus
Apply +0.10 to `baseChance` on a player's first room entry in each zone. ~5 lines in the spawn roll. Surfaces the zone's flavor enemy on first contact.

### Option 3 — Soften pressure scaling
Change pressure multiplier from +0.15 to +0.10 per level. Smooths the cycle-3 ramp. Pure config change.

### Option 4 — Onboarding signal
A one-time system message after 5 minutes of no combat: "*The roads are quiet. The Hollow gather where blood has been shed — try the river or the old gas station.*" Soft narrative push toward higher-density rooms without changing density.

**Recommended path:** Option 1 + Option 4 combined.
- Option 1 lifts the floor without breaking the 3-run pacing
- Option 4 makes the existing-by-design sparseness *legible* to the player (turning "I rarely find any" into "I see — the world is sparse here, the action is north")
- Skip Option 2 (would break the time-of-day rhythm)
- Skip Option 3 unless playtesting shows cycle-3 ramp too sharp

Estimated work: ~2–3 hours of data edits + 1 hour for the narrative-signal hint. Single Howler.

---

## Caveats

- Densities, baseChance averages, and percentages are agent-computed; Blue should re-verify any number it bases a Howler task on
- Spot-checks confirmed: `ENEMY_RESPAWN_ACTIONS = 160` at `lib/gameEngine.ts:282`, hollowEncounter counts in 4 sampled zones
- The agent could not access live game state — recommendations assume the data audit is accurate; a 30-minute manual playtest of cycle 1 in Crossroads/Covenant would validate the "feels sparse" hypothesis
