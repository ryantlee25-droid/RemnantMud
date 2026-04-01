# H1 — Database + Schema Audit

**Auditor**: Howler H1 (Sonnet)
**Date**: 2026-03-31
**Migration count**: 20 files (20260326000001 → 20260401000001)
**Tables audited**: players, player_inventory, player_ledger, player_stash, room_state, generated_rooms, world_state, game_log (dropped)

---

## BLOCKERS

### B1 — `saw_prologue` column is DB-orphaned (players table)

**Migration**: `20260326000005_narrative.sql` adds `saw_prologue BOOLEAN NOT NULL DEFAULT false`
**App code**: `app/page.tsx` line 41 defines `const PROLOGUE_KEY = 'remnant_saw_prologue'` and uses `localStorage` exclusively. The column is never read in `loadPlayer()` and never written in `_savePlayer()` or `createCharacter()`.

**Impact**: The `saw_prologue` column is dead schema weight with a `NOT NULL DEFAULT false` constraint. More critically: if any future code tries to set prologue-seen state in the DB (which would be the logical move), there is a discrepancy between the localStorage key and the DB column — they could diverge silently. The current behavior means prologue state is lost on new devices/browsers for the same user. Whether this is intentional must be explicitly confirmed.

**Classification**: BLOCKER — requires explicit decision: (a) remove the column, (b) migrate prologue state to the DB column and remove localStorage usage, or (c) document the localStorage-primary architecture as intentional. The column as-is is misleading for any future developer.

---

### B2 — `player_ledger` columns `faction_reputation_best` and `quest_flags_completed` are DB-orphaned

**Migration**: `20260327000005_new_zones.sql` adds both columns to `player_ledger`.
**App code**: The `PlayerLedger` TypeScript interface (types/game.ts) does NOT include `factionReputationBest` or `questFlagsCompleted`. The `loadPlayer()` method does not read them. No code writes them.

**Impact**: These two JSONB columns exist in the DB schema and are maintained by Postgres, but are entirely invisible to the application. The schema suggests they were intended to track best-ever reputation and completed quests for cross-cycle display or echo bonuses. If the echo/rebirth system was designed to use them, it currently does not — it uses `cycle_history` snapshots instead (via `computeInheritedReputation`). These columns have no application path to populate them and will remain empty `{}` indefinitely.

**Classification**: BLOCKER — dead schema. Requires explicit decision: (a) add them to `PlayerLedger` and wire up write paths, (b) drop them in a new migration if superseded by `cycle_history`, or (c) document them as planned-but-unimplemented with a tracking issue.

---

## WARNINGS

### W1 — `game_log` table still present in `supabaseMock.ts` but dropped in production

**Migration**: `20260329000001_rls_world_state.sql` drops `game_log`.
**Mock**: `lib/supabaseMock.ts` line 18 still includes `game_log: []` in `freshTables()`.

**Impact**: In dev mode, any code path writing to `game_log` silently succeeds (empty table, no error). In production, that table does not exist and the write would fail. A grep of all non-migration TypeScript files shows no current references to `from('game_log')` in production code paths, so this is not an active bug. However, the mock divergence is a maintenance hazard: if a developer adds a `game_log` write in dev without noticing the production table is gone, it will ship silently broken.

**Action**: Remove `game_log` from `supabaseMock.ts` `freshTables()` so dev fails fast if `game_log` is accidentally referenced.

**Classification**: WARNING

---

### W2 — `hollow_pressure` is serialized inside `narrative_progress` JSONB — no standalone column

**PLAN.md asked**: "is `hollow_pressure` a standalone column vs. being serialized inside `narrative_progress` JSONB — which is authoritative?"

**Finding**: `hollow_pressure` has NO standalone column in any migration. It is exclusively stored as `narrative_progress.hollowPressure` (the `20260401000001_add_narrative_progress.sql` migration adds the `narrative_progress JSONB` column). The `_savePlayer()` method packs `{ hollowPressure, narrativeKeys }` into `narrative_progress` and `loadPlayer()` unpacks them from there.

**This is the correct architecture** — consistent and intentional. No action required on the column itself.

**Secondary issue**: The migration comment says the `narrative_progress` column "Tracks hollow pressure and narrative keys for story progression." This comment is accurate but the column name `narrative_progress` is generic enough that future contributors may add unrelated fields to it without a new migration. Consider a doc comment listing the canonical fields: `hollowPressure: number, narrativeKeys: string[]`.

**Classification**: WARNING (low severity — documentation gap, not a data integrity issue)

---

### W3 — `world_state` table: RLS enabled with NO policy (intentional but undocumented in code)

**Migration**: `20260329000001` enables RLS on `world_state` with no authenticated/anon policy. Only `service_role` can access it.
**App code**: No references to `from('world_state')` found in any non-migration TypeScript file.

**The architecture is consistent**: the init migration notes "Not used in single-player MVP — present for schema compatibility." RLS with no policy + service_role-only access is an acceptable guard for a reserved table.

**Risk**: The Supabase anon client used by the app cannot access this table — any accidental `from('world_state')` query in client code will be silently denied (empty result or permission error). This is desirable but could confuse debugging.

**Classification**: WARNING (document the "no policy = service_role only" architecture decision explicitly)

---

### W4 — `createCharacter()` does not write `narrative_progress` to the DB

**Finding**: In `createCharacter()` (gameEngine.ts line ~573), the `playerRow` upserted to `players` does NOT include `narrative_progress`. The column defaults to `'{}'::jsonb`.

After `createCharacter()` completes, the in-memory `player` object has `hollowPressure: 0` and `narrativeKeys: []`, and the next `_savePlayer()` call will write `narrative_progress: { hollowPressure: 0, narrativeKeys: [] }` correctly.

**Risk**: There is a window between character creation and the first `_savePlayer()` call where the DB has `narrative_progress: {}` while in-memory has the populated values. If the page reloads in that window, `loadPlayer()` reads `{}` and defaults both fields to 0 / `[]` — which is correct, so no data loss. This is acceptable.

**Classification**: WARNING (low — no data loss, but the creation payload is inconsistent with the save payload)

---

### W5 — `stash` operations do not check for errors on Supabase calls

**File**: `lib/actions/items.ts` — `handleStash()` and `handleUnstash()`

In `handleStash()` (line ~368), the `supabase.from('player_stash').update(...)` and `.insert(...)` calls do not destructure `{ error }` and do not check or report errors. If the DB write fails, the item is still removed from inventory (via `removeItem`) and the player sees a success message. The item is permanently lost.

In `handleUnstash()` (line ~429), the `supabase.from('player_stash').update(...)` and `.delete(...)` calls also have no error checks. If the stash row delete fails but `addItem` succeeds, the item exists in both inventory and stash (duplicate). If `addItem` fails but the stash row was deleted, the item is lost.

**Classification**: WARNING (data loss possible on transient DB failure; no recovery path)

---

## INFO

### I1 — Column inventory: `players` table (fully verified)

| Column | Migration | Code (save) | Code (load) | Status |
|---|---|---|---|---|
| `id` | 001 | N/A (PK) | ✓ | OK |
| `name` | 001 | N/A | ✓ | OK |
| `hp` | 001 | ✓ | ✓ | OK |
| `max_hp` | 001 | ✓ | ✓ | OK |
| `current_room_id` | 001 | ✓ | ✓ | OK |
| `world_seed` | 001 | N/A | ✓ | OK |
| `xp` | 001 | ✓ | ✓ | OK |
| `level` | 001 | ✓ | ✓ | OK |
| `created_at` | 001 | N/A | N/A | OK (managed by DB) |
| `updated_at` | 001 | N/A | N/A | OK (trigger) |
| `body`, `finesse`, `mind`, `spirit` | 001 (dropped in 002) | N/A | N/A | OK (dropped) |
| `vigor` | 002 | ✓ | ✓ | OK |
| `grit` | 002 | ✓ | ✓ | OK |
| `reflex` | 002 | ✓ | ✓ | OK |
| `wits` | 002 | ✓ | ✓ | OK |
| `presence` | 002 | ✓ | ✓ | OK |
| `shadow` | 002 | ✓ | ✓ | OK |
| `character_class` | 002 | N/A (not in `_savePlayer`) | ✓ | OK* |
| `actions_taken` | 003 | ✓ | ✓ | OK |
| `personal_loss_type` | 005 | N/A (not in `_savePlayer`) | ✓ | OK |
| `personal_loss_detail` | 005 | N/A (not in `_savePlayer`) | ✓ | OK |
| `saw_prologue` | 005 | NEVER | NEVER | BLOCKER (see B1) |
| `squirrel_trust` (renamed from `dog_trust`) | 005 + 006 | N/A | N/A | NOTE: squirrel_trust on players is not read by loadPlayer — only ledger.squirrel_trust is used |
| `squirrel_name` | 007 | N/A (not in `_savePlayer`) | ✓ | OK |
| `cycle` | 20260327000001 | N/A (not in `_savePlayer`) | ✓ | OK |
| `total_deaths` | 20260327000001 | N/A (not in `_savePlayer`) | ✓ | OK |
| `is_dead` | 20260327000001 | N/A (not in `_savePlayer`) | ✓ | OK |
| `faction_reputation` | 20260327000005 | ✓ | ✓ | OK |
| `quest_flags` | 20260327000005 | ✓ | ✓ | OK |
| `active_buffs` | 20260328000002 | ✓ | ✓ | OK |
| `pending_stat_increase` | 20260328000002 | ✓ | ✓ | OK |
| `narrative_progress` | 20260401000001 | ✓ (packs hollowPressure + narrativeKeys) | ✓ | OK |

*`character_class` is written at creation time (upsert) and at rebirth, but not in the regular `_savePlayer()` update payload. Since class is immutable during a cycle, this is correct.

Note on `squirrel_trust` on `players`: Migration 006 renames `dog_trust → squirrel_trust` on the `players` table. However, `_savePlayer()` never writes this field and `loadPlayer()` never reads it from the `players` row — only from `player_ledger.squirrel_trust`. The column exists in `players` but is application-invisible. This may be intentional (squirrel state is cross-cycle, so ledger is authoritative), but it is dead schema on the `players` table itself.

---

### I2 — Column inventory: `player_ledger` table (fully verified)

| Column | Migration | Code (load) | Code (write) | Status |
|---|---|---|---|---|
| `id` | 20260327000001 | N/A | N/A (PK) | OK |
| `player_id` | 20260327000001 | ✓ | ✓ | OK |
| `world_seed` | 20260327000001 | ✓ | ✓ | OK |
| `current_cycle` | 20260327000001 | ✓ | ✓ | OK |
| `total_deaths` | 20260327000001 | ✓ | ✓ | OK |
| `pressure_level` | 20260327000001 | ✓ | ✓ | OK |
| `discovered_room_ids` | 20260327000001 | ✓ | NOT WRITTEN | NOTE: loaded but never updated after creation; stays `[]` |
| `squirrel_alive` | 20260327000001 | ✓ | N/A | OK (updated elsewhere) |
| `squirrel_trust` | 20260327000001 | ✓ | N/A | OK |
| `squirrel_cycles_known` | 20260327000001 | ✓ | N/A | OK |
| `squirrel_name` | 20260327000001 | ✓ | N/A | OK |
| `created_at` / `updated_at` | 20260327000001 | N/A | N/A | OK (managed by DB) |
| `faction_reputation_best` | 20260327000005 | NEVER | NEVER | BLOCKER (see B2) |
| `quest_flags_completed` | 20260327000005 | NEVER | NEVER | BLOCKER (see B2) |
| `cycle_history` | 20260328000001 | ✓ | ✓ | OK |
| `discovered_enemies` | 20260328000002 | ✓ | ✓ | OK |

Note on `discovered_room_ids`: The column is loaded into `PlayerLedger.discoveredRoomIds` and used by `computeExplorationProgress()` in journal/map display. However, no code path writes to this column after initial creation (where it is set to the empty array `[]`). The exploration journal will always show 0 rooms explored regardless of actual visits. This appears to be an unimplemented feature — the exploration system reads from the ledger column but no code path populates it. Likely a WARNING-level finding but left as INFO pending confirmation of whether `markVisited()` was expected to update it.

---

### I3 — Column inventory: `player_inventory` table

| Column | Migration | Code | Status |
|---|---|---|---|
| `id` | 001 | ✓ | OK |
| `player_id` | 001 | ✓ | OK |
| `item_id` | 001 | ✓ | OK |
| `quantity` | 001 | ✓ | OK |
| `equipped` | 001 | ✓ | OK |
| `created_at` | 001 | N/A | OK |
| UNIQUE (player_id, item_id) | 20260327000004 | ✓ (race condition handled in addItem) | OK |
| INDEX player_inventory_player_id_idx | 001 | N/A | OK — index exists |

---

### I4 — Column inventory: `player_stash` table

| Column | Migration | Code | Status |
|---|---|---|---|
| `id` | 20260327000002 | ✓ | OK |
| `player_id` | 20260327000002 | ✓ | OK |
| `item_id` | 20260327000002 | ✓ | OK |
| `quantity` | 20260327000002 | ✓ | OK |
| `created_at` | 20260327000002 | N/A | OK |
| INDEX player_stash_player_id_idx | 20260327000002 | N/A | OK — index exists |
| UNIQUE (player_id, item_id) | 20260327000010 | ✓ (maybeSingle pattern) | OK |

---

### I5 — Column inventory: `room_state` table

| Column | Migration | Code | Status |
|---|---|---|---|
| `id` | 20260326000004 | N/A | OK |
| `player_id` | 20260326000004 | ✓ | OK |
| `room_id` | 20260326000004 | ✓ | OK |
| `depleted_item_ids` | 20260326000004 | ✓ | OK |
| `last_visited_at` | 20260326000004 | ✓ | OK |
| UNIQUE (player_id, room_id) | 20260326000004 | ✓ (doubles as index) | OK |
| RLS WITH CHECK | 20260327000009 | N/A | OK — fixed |

---

### I6 — Column inventory: `generated_rooms` table

| Column | Migration | Code | Status |
|---|---|---|---|
| `id` | 001 | ✓ | OK |
| `player_id` | 001 | ✓ | OK |
| `world_seed` | 001 | ✓ | OK |
| `zone` | 001 | ✓ | OK |
| `name` | 001 | ✓ | OK |
| `description` | 001 | ✓ | OK |
| `short_description` | 001 | ✓ | OK |
| `exits` | 001 | ✓ | OK |
| `items` | 001 | ✓ | OK |
| `enemies` | 001 | ✓ | OK |
| `npcs` | 001 | ✓ | OK |
| `difficulty` | 001 | ✓ | OK |
| `flags` | 001 | ✓ | OK |
| `visited` | 001 | ✓ | OK |
| `pk` (surrogate PK, UUID) | 20260327000003 | N/A | OK |
| UNIQUE (player_id, id) | 20260327000003 | ✓ (onConflict: 'player_id,id') | OK |
| zone CHECK (13 zones) | 20260327000008 | ✓ | OK — all 13 zones match ZoneType in types/game.ts |
| INDEX player_id | 001 | N/A | OK — index exists |
| INDEX zone | 001 | N/A | OK — index exists |
| RLS | 001 | N/A | OK |

---

### I7 — Index audit summary

| Table | Hot query path | Index | Status |
|---|---|---|---|
| `player_inventory` | `player_id` | `player_inventory_player_id_idx` (001) + UNIQUE(player_id,item_id) | OK |
| `room_state` | `(player_id, room_id)` | UNIQUE constraint doubles as index | OK |
| `player_ledger` | `player_id` | UNIQUE constraint on player_id | OK |
| `player_stash` | `player_id` | `player_stash_player_id_idx` (20260327000002) + UNIQUE(player_id,item_id) | OK |
| `generated_rooms` | `(player_id, id)` | UNIQUE constraint (20260327000003) | OK |
| `generated_rooms` | `player_id` | `generated_rooms_player_id_idx` (001) | OK |

No missing indexes on hot query paths.

---

### I8 — Type consistency: TypeScript vs Postgres

| Field | TypeScript type | Postgres type | Match? |
|---|---|---|---|
| `active_buffs` | `ActiveBuff[]` (JSONB array) | `JSONB DEFAULT '[]'` | OK |
| `narrative_progress` | `{ hollowPressure: number; narrativeKeys: string[] }` | `JSONB DEFAULT '{}'` | OK (JSON serde, compatible) |
| `faction_reputation` | `Partial<Record<FactionType, number>>` | `JSONB DEFAULT '{}'` | OK |
| `quest_flags` | `Record<string, string\|boolean\|number>` | `JSONB DEFAULT '{}'` | OK |
| `cycle_history` | `CycleSnapshot[]` | `JSONB DEFAULT '[]'` | OK |
| `discovered_enemies` | `string[]` | `JSONB DEFAULT '[]'` | OK |
| `discovered_room_ids` | `string[]` | `JSONB DEFAULT '[]'` | OK |
| `character_class` | `CharacterClass` (7-value union) | `TEXT CHECK (character_class IN (...))` — 7 values | OK — values match exactly |
| `zone` | `ZoneType` (13-value union) | `TEXT CHECK (zone IN (...))` — 13 values after 20260327000008 | OK — values match exactly |
| `personal_loss_type` | `PersonalLossType` (5-value union) | `TEXT CHECK (personal_loss_type IN (...))` — 5 values | OK — values match |

No type mismatches found.

---

### I9 — `discovered_room_ids` appears never written after creation (potential silent data loss for journal feature)

As noted in I2, `player_ledger.discovered_room_ids` is read by the journal system but no code writes to it. The `markVisited()` function in `world.ts` updates `generated_rooms.visited = true` for the current player/room, and `loadPlayer()` counts visited rooms via a COUNT query on `generated_rooms`, but neither code path updates `player_ledger.discovered_room_ids`.

The journal's "rooms explored" display reads from `ledger.discoveredRoomIds` which is `[]` at all times. This means exploration progress tracking is silently non-functional. This may be an unimplemented feature from the narrative convoy, or a regression.

**Recommendation**: Confirm whether `markVisited()` should also append to `player_ledger.discovered_room_ids`. If yes, this is a missing implementation. If exploration is tracked purely via `generated_rooms.visited` (which IS updated correctly), then `computeExplorationProgress` should be rewritten to use that source instead.

---

## Summary verdict: NO-GO

**2 BLOCKERs** require resolution before release:

1. **B1** — `saw_prologue` DB column is orphaned. The app uses localStorage. Decision required: remove the column or migrate to DB-primary.
2. **B2** — `faction_reputation_best` and `quest_flags_completed` on `player_ledger` are written by no code path. Dead schema from the new zones migration. Decision required: wire up or drop.

**5 WARNINGs** that should be addressed but do not block release by themselves:
- W1: `game_log` in mock diverges from production (maintenance hazard)
- W2: `narrative_progress` lacks field documentation
- W3: `world_state` RLS-with-no-policy architecture undocumented in code
- W4: `createCharacter()` doesn't write `narrative_progress` (zero-risk window but inconsistent)
- W5: stash operations have no error handling — item loss on transient DB failure

**Additional finding** (I9): `discovered_room_ids` ledger column appears permanently empty — exploration journal feature may be silently broken.

Schema is otherwise well-structured. All 13 zones match between TypeScript and Postgres. All hot query paths have appropriate indexes. The `narrative_progress` JSON column correctly encapsulates `hollowPressure` and `narrativeKeys`. The two "code added without migration" incidents have been patched (`20260328000002`, `20260401000001`). No further gaps found in the current migration set vs. code.
