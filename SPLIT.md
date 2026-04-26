# SPLIT: convoy-1-combat-spine

**Branch:** `dev/battle-mud-pivot`
**Base commit:** `8d92d75fb8fe0b449873364d40478a2ddbbf4109`
**Plan source:** `PLAN.md` — Convoy 1 Combat Spine (2026-04-24)

---

## DISPATCH: TWO-WAVE STRUCTURE — READ FIRST

**Wave 1 — Drop all 6 in parallel:**
H1, H2, H4, H5, H6, H8

**Wave 2 — Drop only after Wave 1 fully merges and `tsc --noEmit` passes:**
H3 (requires H1 + H4 + H5 in place), H7 (requires H6 in place)

Both Wave 2 Howlers may drop simultaneously — their owned files do not overlap.

After Wave 2 merges: spawn White + Gray + /diff-review in parallel once on the combined diff.
Copper opens PR after quality gate clears.

---

## Ownership Matrix

| Howler | Wave | Creates | Modifies |
|--------|------|---------|----------|
| **H1** — Spawn Pipeline Retune | 1 | — | `lib/spawn.ts`, `lib/gameEngine.ts` (line 292 only), `data/rooms/river_road.ts`, `data/rooms/salt_creek.ts`, `data/rooms/the_breaks.ts`, `data/rooms/the_dust.ts`, `data/rooms/the_stacks.ts`, `data/rooms/duskhollow.ts`, `data/rooms/the_ember.ts`, `data/rooms/the_pens.ts`, `data/rooms/the_scar.ts` |
| **H2** — Wandering Enemies | 1 | `lib/wanderers.ts`, `tests/unit/wanderers.test.ts` | `lib/gameEngine.ts` (post-move block), `types/game.ts` (WandererState + WandererEvent interfaces) |
| **H4** — Behavioral Hooks | 1 | `tests/unit/behavioral-hooks.test.ts` | `types/game.ts` (Enemy interface — critChance/fleeThreshold fields), `lib/combat.ts` (playerAttack + applyHollowRoundEffects + combatLogCompress utility), `data/enemies.ts` (behavioral fields on existing entries only) |
| **H5** — Loot Drop Fix | 1 | `tests/unit/loot-drop.test.ts` | `data/enemies.ts` (loot arrays on existing entries only) |
| **H6** — Death Prose Variants | 1 | `lib/deathProse.ts`, `tests/unit/death-prose.test.ts` | `lib/gameEngine.ts` (death handler — selectDeathProse call + hollow_kills increment) |
| **H8** — Combat World Events | 1 | `tests/unit/combat-events.test.ts` | `data/worldEvents/act1_events.ts`, `data/worldEvents/act2_events.ts`, `lib/worldEvents.ts` (new CombatWorldEvent type — see Coordination), `types/convoy-contracts.d.ts` (conditional — see Coordination) |
| **H3** — New Enemy Roster | 2 | `tests/unit/new-enemies.test.ts` | `data/enemies.ts` (append 7 new entries at end only), `types/game.ts` (extend HollowType union), `data/rooms/river_road.ts`, `data/rooms/salt_creek.ts`, `data/rooms/the_breaks.ts`, `data/rooms/the_dust.ts`, `data/rooms/the_ember.ts`, `data/rooms/the_scar.ts`, `data/rooms/duskhollow.ts` |
| **H7** — Faction Combat Reactivity | 2 | `tests/integration/faction-reactivity.test.ts` | `data/dialogueTrees.ts`, `lib/actions/social.ts` |

---

## Conflict Audit

Every file touched by 2+ Howlers, with resolution:

| File | Howlers | Advisory | Resolution |
|------|---------|----------|------------|
| `lib/gameEngine.ts` | H1, H2, H6 | ADVISORY-1: three Howlers, one file | Three non-overlapping regions: H1 owns line 292 (`ENEMY_RESPAWN_ACTIONS`); H2 owns post-move block (after `_applyPopulation`); H6 owns death handler. Each Howler must grep their target region before writing. After Wave 1 merges, Gold runs diff to confirm no overlap before Wave 2. |
| `data/enemies.ts` | H4, H5 (Wave 1) then H3 (Wave 2) | ADVISORY-2: three Howlers; sequencing is the guard | H4 adds behavioral fields to existing entries. H5 adds loot entries to existing entries. H3 appends new entries at end of file only — zero edits to existing lines. Wave sequencing prevents conflict: H4 and H5 merge in Wave 1 before H3 begins. H3 must read the file's current end-of-array after Wave 1 merges before appending. |
| `types/game.ts` | H2, H4 (Wave 1) then H3 (Wave 2) | ADVISORY-3: three Howlers, different declarations | H2 adds WandererState/WandererEvent interfaces. H4 adds critChance/fleeThreshold to Enemy interface. H3 extends HollowType union. All three target different type declarations. When merging Wave 1, apply H4 first so Enemy interface is stable before H2's types land. H3's HollowType extension applies in Wave 2 on the already-merged result. |
| `data/rooms/river_road.ts` | H1 (Wave 1), H3 (Wave 2) | ADVISORY-4: same file, sequential only | H1 updates baseChance and timeModifier values. H3 adds new enemy IDs to threatPool arrays. Different object fields; no structural overlap. Sequencing eliminates conflict: H3 drops only after H1 merges. H3 reads file fresh after Wave 1 before writing. |
| `data/rooms/salt_creek.ts` | H1 (Wave 1), H3 (Wave 2) | ADVISORY-5: same file, sequential only | Same pattern as river_road. |
| `data/rooms/the_breaks.ts` | H1 (Wave 1), H3 (Wave 2) | ADVISORY-6: same file, sequential only | Same pattern as river_road. |
| `data/rooms/the_dust.ts` | H1 (Wave 1), H3 (Wave 2) | ADVISORY-7: same file, sequential only | Same pattern as river_road. |
| `data/rooms/the_ember.ts` | H1 (Wave 1), H3 (Wave 2) | ADVISORY-8: same file, sequential only | Same pattern as river_road. |
| `data/rooms/the_scar.ts` | H1 (Wave 1), H3 (Wave 2) | ADVISORY-9: same file, sequential only | Same pattern as river_road. |
| `data/rooms/duskhollow.ts` | H1 (Wave 1), H3 (Wave 2) | ADVISORY-10: same file, sequential only | Same pattern as river_road. |

**Total advisories: 10** (3 structural, 7 zone-file sequencing)

---

## Per-Howler Scope

### H1 — Spawn Pipeline Retune

Raise baseChance floors across 9 zone files, soften daytime modifiers, cut respawn timer 160→80, add 1.10× cycle-1 pressure bonus, change cycleGate 3→2 on all 34 Scar/Pens rooms, rebalance 4 lopsided threat pools using existing enemy types.

**Frozen contracts H1 must not break:**
- `pressureModifier(pressure: number): number` in `lib/spawn.ts` — change body only, not signature
- `computePressure(cycle: number): number` — do not touch
- `cycleGate` field on `Room` type — do not remove
- Do not add or remove rooms; data edits only
- Crossroads max baseChance 0.15; Covenant max 0.12

**Cross-Howler note:** H1's zone file edits are the gate for H3. H3 cannot drop until H1 merges.

---

### H2 — Wandering Enemies System

New `lib/wanderers.ts` implementing pressure-driven wanderer movement, integrated via post-move hook in `lib/gameEngine.ts`. Persist state in existing `narrative_progress` JSONB — no new Supabase migration.

**Frozen contracts H2 must expose:**
- `tickWanderers(state: WandererState, currentRoomId: string, zoneId: string, cycle: number, adjacentRoomIds: string[]): { updatedState: WandererState; event: WandererEvent | null }`
- `WandererEvent`: `{ enemyId: string; roomId: string; message: string }`
- `MAX_WANDERERS_ACTIVE_LOW = 2` (cycles 1–3), `MAX_WANDERERS_ACTIVE_HIGH = 4` (cycles 4+)
- Wanderer enemy type is a caller-supplied string — do not hardcode H3 enemy IDs

---

### H4 — Behavioral Hooks

Add `critChance?` and `fleeThreshold?` to `Enemy` interface in `types/game.ts`; implement hooks in `lib/combat.ts`; add `combatLogCompress` pure utility.

**Frozen contracts H4 must expose (consumed by H3 in Wave 2):**
- `critChance?: number` on `Enemy` — H3's new enemies will populate this
- `fleeThreshold?: number` on `Enemy` — H3's new enemies will populate this
- Both fields must be optional so existing enemies compile without them
- `playerAttack()` and `applyHollowRoundEffects()` signatures must not change

**Cross-Howler note:** H4 must merge before H3 drops. H3 marks entries needing behavioral fields with `// TODO-H4: critChance/fleeThreshold` during authoring, then populates values after Wave 1 lands.

---

### H5 — Loot Drop Fix

Add `ammo_22lr` to 16 original enemy loot tables that lack it; reduce brute scrap_metal chance 0.60→0.35. Loot arrays on existing entries only — no behavioral fields, no new entries.

**Frozen contracts H5 must respect:**
- Do not touch entries H3 will append (they do not exist in Wave 1 — no risk of conflict)
- Verify `ammo_22lr` item ID in `data/items.ts` before writing; use the correct spelling

**Cross-Howler note:** H5 must merge before H3 drops (Wave 1 vs Wave 2 ensures this).

---

### H6 — Death Prose Variants (E1)

Create `lib/deathProse.ts` with 7+ prose templates selected by cause/zone/cycle. Wire `selectDeathProse()` into death handler in `lib/gameEngine.ts`. Add `hollow_kills` increment in death handler for H7.

**Frozen contracts H6 must expose (consumed by H7 in Wave 2):**
- `player.questFlags['hollow_kills']` incremented as `(player.questFlags['hollow_kills'] ?? 0) + 1` in the death handler
- `selectDeathProse(context: DeathContext): string` exported from `lib/deathProse.ts`
- `DeathContext`: `{ cause: 'combat' | 'infection' | 'environmental' | 'faction-vendetta', zone: string, cycle: number }`
- Death handler change is exactly two lines: replace hard-coded prose, add hollow_kills increment
- Do not touch `rebirthWithStats()`, `createCharacter()`, or Supabase persistence

**Cross-Howler note:** H7 cannot drop until H6 merges. H7 reads `hollow_kills` but does not write it.

---

### H7 — Faction Combat Reactivity (E4)

Add kill-count-triggered dialogue nodes for Marshal Cross, Patch, Vesper, and Lev (3+ nodes each at thresholds 5/15/30 kills). Wire kill-count check in `lib/actions/social.ts`. Runs after H6 merges.

**Frozen contracts H7 must respect:**
- Read `player.questFlags['hollow_kills']` only — do not write it
- Do not modify `data/npcs.ts`; do not touch any combat path
- New dialogue is additive — existing dialogue conditions must still fire

---

### H8 — Combat World Events (E5)

Add 8+ `WorldEvent` entries across act1 and act2 event data files. Extend or wrap `WorldEvent` type with optional `combatParticipation` field.

**Frozen contracts H8 must respect:**
- `types/convoy-contracts.d.ts` carries a `FROZEN AT DISPATCH` header. Default path: define `CombatWorldEvent` as a new type in `lib/worldEvents.ts` extending `WorldEvent`. Do not block on the freeze question — attempt the extension; if the header blocks it, use the `lib/worldEvents.ts` fallback without touching `convoy-contracts.d.ts`.
- Existing `WorldEvent` fields must not change
- Combat events must not fire when `state.combat !== null` — verify the `getScheduledEvents()` call site, add assertion test

---

## Coordination Notes

**`convoy-contracts.d.ts` is FROZEN.** H8 defaults to the `CombatWorldEvent` fallback in `lib/worldEvents.ts` unless the file's header explicitly permits optional additions.

**`lib/gameEngine.ts` three-region discipline.** After Wave 1 merges, Gold runs a diff on `lib/gameEngine.ts` to verify that H1 (line 292), H2 (post-move block), and H6 (death handler) merged without overlap before dropping Wave 2.

**`types/game.ts` merge order.** When landing Wave 1 branches, merge H4 first (Enemy interface), then H2 (WandererState/WandererEvent). H3's HollowType extension applies in Wave 2 on the already-merged file.

**Sole-ownership new files.** `lib/wanderers.ts` and `lib/deathProse.ts` are created by one Howler each and touched by no other. H3 and H7 integration tests are also sole-ownership.

**`data/enemies.ts` append discipline for H3.** After Wave 1 merges, H3 must read the file to locate the current last line of the exports array before appending. Do not assume line numbers from the base commit.

---

## Integration and Merge Order

**Wave 1 — merge in any order.** Recommended merge order for `types/game.ts` stability: H4 first, then H2, then remaining (H1, H5, H6, H8).

After Wave 1 merges: run `tsc --noEmit`. Zero errors required before dropping Wave 2.

**Wave 2 — H3 requires H1 + H4 + H5 merged; H7 requires H6 merged.** Both Wave 2 Howlers may run simultaneously since their owned files do not overlap.

After Wave 2 merges: one quality gate pass — White + Gray + /diff-review in parallel on the full combined diff. Copper opens PR after gate clears.

---

## Worktree Paths

```
~/.claude/parallel/convoy-1-combat-spine/worktrees/h1-spawn-retune
~/.claude/parallel/convoy-1-combat-spine/worktrees/h2-wanderers
~/.claude/parallel/convoy-1-combat-spine/worktrees/h4-behavioral-hooks
~/.claude/parallel/convoy-1-combat-spine/worktrees/h5-loot-fix
~/.claude/parallel/convoy-1-combat-spine/worktrees/h6-death-prose
~/.claude/parallel/convoy-1-combat-spine/worktrees/h8-combat-events
~/.claude/parallel/convoy-1-combat-spine/worktrees/h3-new-enemies
~/.claude/parallel/convoy-1-combat-spine/worktrees/h7-faction-reactivity
```

Branch pattern: `parallel/convoy-1-combat-spine/<howler-name>`
