# PLAN: 300-Room Overhaul
**Project:** mud-game
**Stack:** Next.js 16.2.1 · TypeScript strict · Supabase · Tailwind CSS 4 · Vitest
**Objective:** Scale from ~30 rooms/playthrough to 300+ rooms with optimized architecture, wired game systems, and deep enough gameloop to make every room worth entering.
**Constraint:** `npx tsc --noEmit` must be zero-error. No blockers in code review. All migrations via `supabase db push --yes`.

---

## Pre-Flight: Blocker Fixes (MUST COMPLETE FIRST)

These are code review blockers. Nothing else starts until these are merged.

### BF-1 — Composite PK + inventory unique constraint (migration)
**Files:** `supabase/migrations/`, `lib/world.ts`, `lib/inventory.ts`
**Problem:** `generated_rooms` has a single-column PK on text `id` (e.g. `shelter-001`). Any second player generates the same ids and corrupts or fails. `player_inventory` has no UNIQUE constraint on `(player_id, item_id)` — race condition creates duplicate rows.
**Fix:**
1. New migration: drop existing PK on `generated_rooms.id`, add surrogate UUID PK, add `UNIQUE(player_id, id)`.
2. New migration: add `UNIQUE(player_id, item_id)` to `player_inventory`.
3. `lib/world.ts:87` — change `onConflict: 'id'` to `onConflict: 'player_id,id'`.
4. `lib/inventory.ts:65–98` — replace read-then-write with single upsert on `(player_id, item_id)`, increment quantity atomically.
**Done when:** `supabase db push` succeeds, `tsc --noEmit` clean, two players can generate worlds without conflict.

### BF-2 — Pressure formula unification
**Files:** `lib/gameEngine.ts:979`, `lib/gameEngine.ts:1072`
**Problem:** `rebirthCharacter` and `rebirthWithStats` both compute pressure with an inline formula that diverges from `computePressure()` in `lib/spawn.ts` at cycles 5–6+. Ledger stores wrong value.
**Fix:** Delete both inline formulas. Import and call `computePressure(newCycle)` from `lib/spawn.ts` in both rebirth paths.
**Done when:** pressure values match `computePressure()` output at all cycle counts 1–15.

### BF-3 — Rebirth room reset
**Files:** `lib/gameEngine.ts:992`
**Problem:** Rebirth leaves `current_room_id` unchanged. Player respawns at death location with 70% stats — death spiral.
**Fix:** On rebirth, set `current_room_id` to `shelter-000` (the deterministic start room id from worldGen).
**Done when:** death → rebirth always places player in shelter.

### BF-4 — `equipItem` by row UUID not item_id
**Files:** `lib/inventory.ts:181`
**Problem:** Equip targets by `item_id`, not row `id`. With duplicate rows (from race condition, now fixed by BF-1), all duplicates get equipped simultaneously.
**Fix:** After BF-1 lands, update `equipItem` to equip by the row `id` (UUID), not `item_id`.
**Done when:** equipping an item affects exactly one row.

---

## Track 1 — Optimization

Make the engine scale before adding content. Target: world gen <2s, room entry <200ms, log never unbounded.

### T1-1 — Graph topology redesign for 300 rooms
**Files:** `lib/worldGen.ts`
**Problem:** Current chain-first topology + 20% extras produces a nearly linear graph. 300 rooms in a chain is unplayable — no meaningful exploration branches. The extra-connection pass is O(n²) at this scale.
**Fix:**
- Switch to a **cluster-based topology**: generate rooms in clusters of 8–12 (named sub-areas within zones), fully interconnect within each cluster (avg degree 3–4), then add 2–3 inter-cluster bridges per zone boundary.
- This gives a navigable graph: players explore sub-areas rather than walking a corridor.
- Update `generateZone()` to accept a cluster count and bridge count parameter.
- BFS connectivity check is unchanged (still O(V+E), still required).
- Remove the O(n²) extra-connection pass; replace with the explicit bridge logic above.
**Done when:** 300-room world generates with avg node degree ≥ 3, all rooms reachable from shelter-000, gen time <2s.

### T1-2 — worldGen batch insert optimization
**Files:** `lib/world.ts`, `lib/worldGen.ts`
**Problem:** `persistWorld` chunks 300 rooms into groups of 50 and upserts sequentially (after BF-1 fixes the onConflict key). 6 sequential round trips on world gen.
**Fix:** Use a single batch insert (Supabase supports up to 1000 rows). Remove chunking loop. If the row count ever exceeds 1000, chunk to 500 but parallelize chunks with `Promise.all`.
**Done when:** 300-room world persists in ≤2 DB round trips.

### T1-3 — Room cache with LRU eviction
**Files:** `lib/world.ts:13`
**Problem:** `const roomCache = new Map<string, Room>()` is module-level and grows unbounded across cycles. At 300 rooms × multiple cycles = 600–900 stale entries never evicted.
**Fix:** Replace with a simple LRU Map capped at 150 entries (evict oldest on insert when over limit). Add `clearRoomCache()` call on cycle rebirth as well as logout.
**Done when:** cache never exceeds 150 entries; cache miss falls back to DB correctly.

### T1-4 — Game log cap + Terminal key fix
**Files:** `lib/gameEngine.ts:109`, `components/Terminal.tsx:34`
**Problem:** In-memory log array is unbounded. Terminal uses array index as React key — re-diffs entire list on every append.
**Fix:**
1. Cap `this.state.log` at 500 entries (drop oldest on append).
2. Add a stable `id: string` field to `GameMessage` type (assigned at creation: `crypto.randomUUID()`). Use it as the React key in Terminal.tsx.
**Done when:** log never exceeds 500 in memory; Terminal appends without full-list re-render.

### T1-5 — Split gameEngine.ts
**Files:** `lib/gameEngine.ts` (1,458 lines)
**Problem:** Single file handles character creation, combat dispatch, inventory actions, world navigation, NPC dialogue, death/rebirth, and save/load. Hard to parallelize future work, slow for devs to navigate.
**Fix:** Extract into:
- `lib/gameEngine.ts` — core dispatcher and state only (~250 lines)
- `lib/actions/movement.ts` — move, look, examine
- `lib/actions/combat.ts` — attack, flee (delegates to lib/combat.ts)
- `lib/actions/items.ts` — take, drop, equip, use, stash
- `lib/actions/social.ts` — talk, search
- `lib/actions/system.ts` — stats, help, save, quit, rebirth
Each action module exports a handler function; gameEngine.ts imports and dispatches.
**Done when:** `tsc --noEmit` clean; all existing game actions work identically; each file <300 lines.

### T1-6 — Fix `actionsTaken` persistence gaps
**Files:** `lib/gameEngine.ts` (handleTake, handleDrop, handleSearch)
**Problem:** `actionsTaken` is incremented in memory but `savePlayer()` is not called after `take`, `drop`, or `search`. Time-of-day regresses after reload.
**Fix:** Add `await savePlayer()` at the end of handleTake, handleDrop, and handleSearch (or ensure `actionsTaken` is included in the next save that does fire on these paths).
**Done when:** time-of-day persists correctly across page reloads at any point in a session.

### T1-7 — Clean up optional types that are actually required
**Files:** `types/game.ts`
**Problem:** `Player.actionsTaken`, `cycle`, `totalDeaths`, `isDead` are all typed optional (`?`) but treated as required throughout gameEngine. Results in 4+ `?? 0` nullish coalescings and type unsafety.
**Fix:** Remove `?` from these fields. Initialize to `0` / `false` in `createCharacter` and `loadPlayer`.
**Done when:** `tsc --noEmit` clean with no nullish coalescing on these fields.

---

## Track 2 — Content Architecture

Design and implement the zone/room structure that supports 300+ rooms with variety and replayability.

### T2-1 — Zone structure decision: 12 zones, variable depth
**Decision (locked):**
- **10 named zones** (up from 5): shelter, ruins, wastes, outpost, underground, **highway, factory, flooded_district, bunker, deadlands**
- Each zone generates **25–35 rooms** (previously 5–6), using T1-1 cluster topology
- Total: 250–350 rooms per playthrough (target 300)
- Zone difficulty ladder: shelter(1) → ruins(2) → wastes(2) → highway(3) → flooded_district(3) → outpost(3) → factory(4) → bunker(4) → deadlands(5) → underground(5)
- Inter-zone exits: 2–3 connection points between adjacent zones (not all zones accessible from the start)

### T2-2 — Expand roomTemplates.ts with 5 new zones
**Files:** `data/roomTemplates.ts`
**New zones:** highway, factory, flooded_district, bunker, deadlands
**Each zone requires:**
- Name fragments (15+), location fragments (15+), description fragments (25+), feature pool (10+)
- Full `spawnTable` (items, enemies, NPCs) with spawnChance, quantity configs, timeModifiers
- Zone-appropriate enemy pool (not all 7 enemies everywhere — zone gating)
- At least 2 zone-exclusive items referenced from items.ts

**Done when:** each new zone generates varied rooms with names/descriptions that feel distinct; spawn tables reference valid item/enemy IDs; `tsc --noEmit` clean.

### T2-3 — Expand items.ts and enemies.ts for new zones
**Files:** `data/items.ts`, `data/enemies.ts`
**Current:** 50+ items, 7 enemies
**Target:**
- Add 20–25 zone-specific items (e.g. flooded_district: waterproof case, boat fuel; bunker: military rations, keycard; highway: vehicle parts, road flare)
- Add 5–6 new enemy types (e.g. flooded_district: bloated corpse, eel; factory: rogue drone, smelter wraith; bunker: armored remnant)
- Maintain data-driven pattern: new items/enemies are dictionary entries, no code changes required
**Done when:** all new items/enemies have valid types, stats, and loot tables; all referenced in zone spawn tables.

### T2-4 — Update worldGen.ts for 10 zones + cluster topology
**Files:** `lib/worldGen.ts`
**Fix:**
- Update zone ordering array to include all 10 zones
- Wire T1-1 cluster-based generator for each zone
- Ensure inter-zone connections respect the difficulty ladder (you can't skip from shelter to bunker)
- Update ZONE_ROOM_COUNT constant (and delete the stale comment) to `[25, 35]` per zone
**Done when:** generated world has 250–350 rooms, BFS confirms all reachable, no dead ends, difficulty scales correctly.

---

## Track 3 — Wire Incomplete Systems

These are Phase 2–4 systems that are designed and partially built. They MUST be wired before scaling because they become harder to retrofit at 300 rooms.

### T3-1 — Phase 2: Time-of-day modifiers live
**Files:** `lib/gameEngine.ts`, `lib/spawn.ts`, `components/StatusBar.tsx`
**Status:** actionsTaken column exists, getTimeOfDay() exists, timeModifiers defined in spawnTable entries — NOT applied
**Fix:**
1. In `applyPopulation()`, compute `timeOfDay = getTimeOfDay(player.actionsTaken)` and pass to `populateRoom()`.
2. In `populateRoom()` in spawn.ts, apply `timeModifiers[timeOfDay]` multiplier to `spawnChance` in `spawnCheck()`.
3. In StatusBar.tsx, display current time of day (e.g. `[DUSK]`) next to HP.
4. T1-6 fix (persistence) must already be done.
**Done when:** enemies spawn more at night, dawn/day/dusk affect item/NPC spawn rates, time displays in StatusBar, time persists across reload.

### T3-2 — Phase 3: NPC activity + disposition rolls
**Files:** `lib/spawn.ts`, `lib/gameEngine.ts`
**Status:** All 9 NPCs have activityPool and dispositionRoll defined — NOT called
**Fix:**
1. Add `rollNpcActivity(npc: NPC, timeOfDay: TimeOfDay): string` to spawn.ts — weighted random from `npc.activityPool`, filtered by time restriction.
2. Add `rollNpcDisposition(npc: NPC): NpcDisposition` to spawn.ts — weighted random from `npc.dispositionRoll`.
3. Add `spawnNpc(entry: SpawnPoolEntry, timeOfDay: TimeOfDay): SpawnedNPC` to spawn.ts — calls both.
4. Update `populateRoom()` to call `spawnNpc()` instead of hardcoding `activity: 'idle', disposition: 'neutral'`.
5. In gameEngine.ts, update NPC room description line to show activity: `"Old Mae is sorting dried beans in the corner."` instead of `"Old Mae is here."`
6. In `handleTalk()`, vary response based on disposition: wary NPCs are terse, hostile refuse or threaten.
**Done when:** NPCs have varied activities per time-of-day, dispositions affect dialogue, descriptions are dynamic.

### T3-3 — Phase 4: Item depletion wired
**Files:** `lib/gameEngine.ts`, `lib/spawn.ts`, `lib/world.ts`
**Status:** `room_state` table exists, `depleted_item_ids` schema ready — NOT wired
**Fix:**
1. In `handleTake()`, after successful item take, call `recordDepletion(playerId, roomId, itemId)` — insert/update `room_state`.
2. In `applyPopulation()`, fetch `depleted_item_ids` from `room_state` for the current room and pass to `populateRoom()`.
3. In `populateRoom()`, filter out depleted item ids before rolling spawn (item was taken — don't re-spawn it this visit).
4. Respawn: items respawn after N in-game time periods (default: 4 time periods = 1 full day). Clear depletion record in `room_state` when respawn timer elapses.
**Done when:** taken items don't re-appear on immediate re-entry; items respawn after sufficient time; depletion persists across reload.

### T3-4 — Phase 4: Enemy defeat persistence
**Files:** `lib/gameEngine.ts`, `lib/world.ts`
**Status:** Enemy defeat clears enemy from in-memory room but re-spawns on next entry (depletion only wired for items)
**Fix:** Extend `room_state` to include `defeated_enemy_ids TEXT[]`. On enemy defeat, record to room_state. Pass defeated enemy ids to `populateRoom()` — skip re-spawn until respawn timer elapses (8 time periods = longer than items).
**Done when:** cleared rooms stay clear for a meaningful duration; enemies respawn eventually.

---

## Track 4 — Gameloop Depth

300 rooms is only worth exploring if there's a reason to explore. These mechanics give each room a potential purpose beyond "move + fight + take".

### T4-1 — Locked areas and keys
**Files:** `data/items.ts`, `lib/gameEngine.ts`, `lib/worldGen.ts`, `data/roomTemplates.ts`
**Design:**
- Certain exits between zones are locked (`exit.locked: true`, `exit.keyId: 'factory_keycard'`).
- The required key spawns deterministically in a room 2–3 zones earlier (seeded placement).
- `handleMove()` checks for locked exits and required key in inventory before allowing passage.
- Locked zones: factory (requires factory_keycard), bunker (requires bunker_access_badge), underground level 2 (requires sewer_map).
**Done when:** 3 locked zone transitions exist; keys spawn in appropriate prior zones; move blocked with flavor text if key missing; key in inventory opens the exit.

### T4-2 — Cache rooms (hidden loot via search)
**Files:** `lib/worldGen.ts`, `data/roomTemplates.ts`, `lib/gameEngine.ts`
**Design:**
- ~5% of generated rooms are "cache rooms" — description gives no obvious indication of loot.
- `handleSearch()` in a cache room (with successful Mind check, DC 7) reveals hidden items.
- Items are higher value than standard spawn (military rations, ammo, stash notes).
- Cache rooms marked in room flags: `{ "cache": true, "cache_found": false }`.
**Done when:** cache rooms generate at correct frequency; search mechanic works; found cache doesn't re-trigger.

### T4-3 — Story fragments / collectible lore
**Files:** `data/roomTemplates.ts`, `lib/gameEngine.ts`, `types/game.ts`
**Design:**
- ~10% of rooms contain a lore item (journal entry, carved message, data chip).
- Reading lore items (`use journal_entry`) prints a short narrative vignette (2–4 sentences).
- Lore items are zone-specific and written to feel like survivor accounts, faction history, or pre-collapse records.
- 30–40 unique lore fragments across all 10 zones (3–4 per zone).
- Lore items are junk-type (can be dropped), not mechanically useful. Their value is narrative.
**Done when:** lore items appear in world, `use` command prints vignette, all 30+ fragments written.

### T4-4 — Squirrel companion integration
**Files:** `data/npcs.ts`, `lib/gameEngine.ts`, `lib/spawn.ts`, `lib/world.ts`
**Status:** Squirrel NPC defined, ledger has squirrel_alive/trust/cycles_known — NOT spawned
**Design:**
- Squirrel appears in shelter zone after cycle 1 if `squirrel_alive: true` in ledger.
- Trust level (0–10, increments on feed, decrements on ignoring) affects squirrel behavior:
  - Trust 0–3: skittish, runs away on approach
  - Trust 4–6: curious, follows player to adjacent rooms
  - Trust 7–10: loyal, warns player of nearby enemies (flavor message on room entry)
- `squirrel_name` is set by player on first naming (`name squirrel Rex`).
- Squirrel can be killed by enemies in its current room (if player leaves it in a dangerous zone).
**Done when:** squirrel spawns in shelter from cycle 2; trust system increments/decrements; warning mechanic works at high trust; can be named.

### T4-5 — Boss rooms
**Files:** `lib/worldGen.ts`, `data/enemies.ts`, `lib/combat.ts`
**Design:**
- One boss room per zone (5 total initially, expanding to 10 with new zones).
- Boss rooms are terminal nodes (no exits except back the way you came).
- Boss enemies are unique (one per zone): shelter → remnant_lord, ruins → hollow_horde_leader, etc.
- Boss enemies have 3–4x normal HP, guaranteed rare loot drop, unique combat flavor text.
- Defeating a boss sets a room flag `{ "boss_defeated": true }` — does not respawn until next cycle.
- Boss rooms marked in worldGen (`room.isBossRoom: true`), not revealed in description until entered.
**Done when:** 5 boss rooms generate (one per original zone); boss enemies defined; boss defeated flag persists; loot drops guaranteed.

---

## Convoy Plan (Parallel Execution)

### Wave 1 — Blockers (sequential, all must merge before Wave 2)
- **Worker A:** BF-1 (composite PK + inventory upsert) — touches: `supabase/migrations/`, `lib/world.ts`, `lib/inventory.ts`
- **Worker B:** BF-2 + BF-3 + BF-4 (pressure formula, rebirth room, equip by UUID) — touches: `lib/gameEngine.ts`

Wave 1 workers cannot be parallel (both touch gameEngine or migrations). Run A first, B second.

### Wave 2 — Optimization (parallel after Wave 1 merges)
- **Worker C:** T1-1 + T1-2 + T1-4 (topology redesign, batch insert, worldGen constant cleanup) — touches: `lib/worldGen.ts`, `lib/world.ts`
- **Worker D:** T1-3 + T1-6 + T1-7 (room cache LRU, actionsTaken persistence, type cleanup) — touches: `lib/world.ts` (cache only), `types/game.ts`
- **Worker E:** T1-4 + T1-5 (game log cap, Terminal key fix, split gameEngine) — touches: `lib/gameEngine.ts`, `components/Terminal.tsx`, `lib/actions/` (new files)

C, D, E are parallel-safe (no shared file writes given T1-5 splits gameEngine first).

### Wave 3 — Wire Systems (after Wave 2 merges)
- **Worker F:** T3-1 + T3-2 (time-of-day live, NPC activity/disposition) — touches: `lib/spawn.ts`, `lib/actions/social.ts`, `components/StatusBar.tsx`
- **Worker G:** T3-3 + T3-4 (item depletion + enemy defeat persistence) — touches: `lib/actions/items.ts`, `lib/actions/combat.ts`, `lib/world.ts`

F and G are parallel-safe.

### Wave 4 — Content (after Wave 3 merges, can overlap with Wave 4 depth work)
- **Worker H:** T2-1 + T2-4 (zone structure + worldGen update for 10 zones) — touches: `lib/worldGen.ts`
- **Worker I:** T2-2 (expand roomTemplates.ts with 5 new zones) — touches: `data/roomTemplates.ts`
- **Worker J:** T2-3 (expand items.ts + enemies.ts) — touches: `data/items.ts`, `data/enemies.ts`

H, I, J are parallel-safe (no shared files).

### Wave 5 — Gameloop Depth (after Wave 4 merges)
- **Worker K:** T4-1 + T4-2 (locked areas + cache rooms) — touches: `lib/worldGen.ts`, `lib/actions/movement.ts`, `lib/actions/items.ts`
- **Worker L:** T4-3 (story fragments + lore) — touches: `data/roomTemplates.ts`, `lib/actions/items.ts`
- **Worker M:** T4-4 (squirrel companion) — touches: `lib/spawn.ts`, `lib/actions/social.ts`, `lib/gameEngine.ts`
- **Worker N:** T4-5 (boss rooms) — touches: `lib/worldGen.ts`, `data/enemies.ts`, `lib/actions/combat.ts`

K, L, M, N are parallel-safe assuming actions/ split is done in Wave 2.

---

## Definition of Done

A "300-room MUD" is done when:

- [ ] **300+ rooms:** Generated world has 250–350 rooms per seed, all reachable, avg node degree ≥ 3
- [ ] **10 zones:** All 10 zone types generate with distinct names, descriptions, enemies, and items
- [ ] **No blockers:** All 5 code review blockers resolved; `tsc --noEmit` clean
- [ ] **Performance:** World gen <2s, room entry <200ms, log capped at 500
- [ ] **Time-of-day live:** Spawn rates shift at dawn/day/dusk/night; time displays in StatusBar
- [ ] **NPC depth:** NPCs have varied activities by time, dispositions affect dialogue
- [ ] **Depletion wired:** Taken items don't immediately re-spawn; enemies stay dead for a full day cycle
- [ ] **Locked zones:** 3 locked zone transitions with keys required
- [ ] **Cache rooms:** Hidden loot rooms discoverable via search check
- [ ] **Lore:** 30+ story fragments distributed across all zones
- [ ] **Squirrel:** Companion spawns from cycle 2, trust system functional
- [ ] **Boss rooms:** 5+ boss rooms, one per original zone, with guaranteed loot
- [ ] **Tests:** >80% coverage on all lib/ files; vitest zero failures
- [ ] **Playtest:** Full run (shelter → underground) completable in 45–90 min; death/rebirth cycle functional with pressure scaling

---

## References
- Code review report: 5 blockers, 7 warnings, 5 suggestions (see pre-flight section above)
- Existing PLAN.md superseded by this document
- Migration command: `supabase db push --yes`
- TypeScript check: `npx tsc --noEmit`
- Test run: `pnpm vitest run`
