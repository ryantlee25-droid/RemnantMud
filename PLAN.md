# PLAN: Randomization & Procedural Presence System

**Project:** mud-game
**Stack:** Next.js 16.2.1 · TypeScript · Supabase
**Scope:** 5 phases — runtime spawning, time of day, NPC activity, depletion/respawn, roaming encounters
**Constraint:** `npx tsc --noEmit` must be zero-error before moving to the next phase.
**Migration command:** `supabase db push --yes` (migrations live in `supabase/migrations/`)

---

## Architectural Summary

`generated_rooms` currently bakes `items[]` and `enemies[]` at world-generation time.
The new system moves all dynamic content (items, enemies, NPCs) to runtime probabilistic rolls on room entry.
`generated_rooms` becomes structural-only (exits, zone, name, descriptions, difficulty).
Dynamic state lives in `room_state` (depletion records) and in-memory session state (noise, zone events).

---

## Phase 1 — Runtime Probabilistic Spawning

**Goal:** Replace static baked items/enemies with per-entry probability rolls.

### 1.1 New types in `types/game.ts`

Add to the existing file (no `any`):

```ts
// Spawn system
export type DistributionType = 'flat' | 'weighted_low' | 'weighted_high' | 'bell' | 'single'

export interface QuantityConfig {
  min: number
  max: number
  distribution: DistributionType
}

export interface SpawnPoolEntry {
  id: string                  // item or enemy id
  weight: number              // relative weight for weighted_roll
  spawnChance: number         // base 0.0–0.95
  quantity: QuantityConfig
  timeModifiers?: Record<TimeOfDay, number>   // added in Phase 2; optional here
}

export interface SpawnTable {
  items: SpawnPoolEntry[]
  enemies: SpawnPoolEntry[]
  npcs: SpawnPoolEntry[]
}

export interface SpawnedItem {
  itemId: string
  condition: number           // 0.0–1.0
}

export interface PopulatedRoom {
  items: SpawnedItem[]
  enemies: string[]           // enemy IDs
  npcs: string[]              // NPC IDs
  flavorLines: string[]       // ambient/flavor text appended to description (Phase 5)
}

// TimeOfDay — defined here so Phase 1 can import it (Phase 2 fills it in)
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'
```

Update `ZoneTemplate` in `types/game.ts`:

```ts
export interface ZoneTemplate {
  // ... existing fields unchanged ...
  spawnTable: SpawnTable      // NEW — replaces bare enemyPool / itemPool for runtime use
  // existing enemyPool / itemPool remain for worldGen.ts seeding (now writes empty arrays)
}
```

Update `Room` in `types/game.ts`:

```ts
export interface Room {
  // ... existing fields ...
  // items[] and enemies[] remain as string[] — populated at runtime, not from DB
}
```

No DB schema change needed in Phase 1 — `generated_rooms.items` and `.enemies` will always be `[]` after this change.

### 1.2 New file: `lib/spawn.ts`

Pure functions, no React, no Supabase.

```
weightedRoll<T extends { weight: number }>(pool: T[]): T
  — Implements the Python pseudocode exactly.
  — Returns last entry as fallback (never throws on non-empty pool).
  — Throws if pool is empty.

quantityRoll(config: QuantityConfig): number
  — Implements flat / weighted_low / weighted_high / bell / single.

spawnCheck(baseChance: number, modifiers: number[]): boolean
  — final = baseChance * product(modifiers), capped at 0.95
  — Returns Math.random() < final

rollCondition(): number
  — Returns random 0.0–1.0 representing item condition.

populateRoom(
  room: Room,
  zone: ZoneType,
  depletedItemIds: string[],        // from Phase 4 room_state; pass [] for now
  timeModifier: number,             // from Phase 2; pass 1.0 for now
  noiseModifier: number,            // from Phase 5; pass 1.0 for now
): PopulatedRoom
  — Looks up zone's spawnTable.
  — For each item entry: skip if depleted, run spawnCheck, then quantityRoll, rollCondition per instance.
  — For each enemy entry: run spawnCheck, quantityRoll.
  — For each NPC entry: run spawnCheck (single).
  — Returns PopulatedRoom.
```

### 1.3 Update `data/roomTemplates.ts`

Add `spawnTable: SpawnTable` to each of the 5 zone templates.
Each current `itemPool` / `enemyPool` / `npcPool` entry becomes a `SpawnPoolEntry` with:
- `weight`: set relative weights (common items higher, rare items lower)
- `spawnChance`: see per-zone table below
- `quantity`: sensible defaults per item type

**Per-zone spawn chance guidance:**

| Zone | Items (base) | Enemies (base) | NPCs (base) |
|---|---|---|---|
| shelter | 0.35 | 0.25 | 0.05 |
| ruins | 0.45 | 0.55 | 0.05 |
| wastes | 0.25 | 0.65 | 0.04 |
| outpost | 0.55 | 0.30 | 0.15 |
| underground | 0.30 | 0.75 | 0.03 |

Rare items (weapons, antibiotics, covenant_sigil): multiply base by 0.3–0.5.
Junk/consumables: multiply base by 1.0–1.5 (but still cap at 0.95).

### 1.4 Update `lib/worldGen.ts`

- Remove `rollItems`, `rollEnemies`, `rollNpcs` functions.
- In `buildRoom`: set `items: []`, `enemies: []`, `npcs: []` — no longer baked at generation.
- Start room (`isStart`) keeps `npcs: ['old_mae']` in the DB row as a hint, but `populateRoom` also handles it.

### 1.5 Update `lib/gameEngine.ts`

**`handleMove`:** After loading `nextRoom`, call `populateRoom(nextRoom, nextRoom.zone, [], 1.0, 1.0)`. Attach result to in-memory room state (do NOT persist dynamic spawns to DB — they're ephemeral per visit). Display `enemiesLine`, `itemsLine`, `npcsLine` from the populated result.

**`handleLook` (no target):** Re-use the last `populateRoom` result stored in `GameState`, or re-roll if not present.

**`handleTake`:** When item is taken from a spawned room, write depletion record (Phase 4 wires this up; for now just remove from in-memory list).

**Item display:** When listing spawned items, include condition: `Bandages [Good]`, `Hunting Rifle [Worn]`, `Scrap Metal [Poor]` based on condition thresholds (≥0.7 = Good, ≥0.4 = Fair, else Poor).

**`GameState` additions:**

```ts
export interface GameState {
  // ... existing ...
  roomPopulation: PopulatedRoom | null    // current room's live spawn result
}
```

### 1.6 Update `lib/world.ts`

`persistWorld`: Stop persisting items/enemies to DB rows. Always write `items: []`, `enemies: []`.
`updateRoomItems`: Keep this function but it now only writes dropped (player-placed) items — spawned items are never written to DB.

### 1.7 TypeScript check

```
npx tsc --noEmit
```

Zero errors required before Phase 2.

---

## Phase 2 — Time of Day + Modifiers

**Goal:** Action counter drives a time cycle that modulates spawn probability.

### 2.1 Migration: `supabase/migrations/20260326000002_time_of_day.sql`

```sql
ALTER TABLE players
  ADD COLUMN IF NOT EXISTS actions_taken int NOT NULL DEFAULT 0;
```

### 2.2 Update `types/game.ts`

Add `actionsTaken: number` to `Player` interface.

### 2.3 New function in `lib/spawn.ts`

```ts
export function getTimeOfDay(actionsTaken: number): TimeOfDay {
  const cycle = actionsTaken % 600
  if (cycle <= 50) return 'dawn'
  if (cycle <= 400) return 'day'
  if (cycle <= 450) return 'dusk'
  return 'night'
}
```

### 2.4 Update `SpawnPoolEntry` in `types/game.ts`

`timeModifiers` is already declared optional in Phase 1. Now populate it in `data/roomTemplates.ts`:

Sample modifiers (apply to high-activity enemies and nocturnal items):
- Enemies: `{ dawn: 0.8, day: 1.0, dusk: 1.2, night: 1.5 }` for wastes/underground
- Items: no modifier for most; `{ dawn: 1.2, day: 1.0, dusk: 1.0, night: 0.8 }` for outpost trade goods
- NPCs: `{ dawn: 0.5, day: 1.0, dusk: 0.8, night: 0.3 }` (NPCs less active at night)

Entries with no `timeModifiers` default to 1.0 (already handled by `spawnCheck`).

### 2.5 Update `lib/spawn.ts` — `spawnCheck` signature

```ts
export function spawnCheck(
  baseChance: number,
  modifiers: number[],    // [timeModifier, noiseModifier, weatherModifier, ...]
): boolean
```

`populateRoom` passes `timeModifiers[timeOfDay] ?? 1.0` per entry.

### 2.6 Update `lib/gameEngine.ts`

- `loadPlayer`: Read `actions_taken` from DB row into `player.actionsTaken`.
- Every meaningful action handler increments `player.actionsTaken` by 1 and calls `savePlayer()`.
  Meaningful actions: `handleMove`, `handleTake`, `handleAttack` (each round), `handleSearch`, `handleUse`, `handleTalk`.
- `savePlayer`: Include `actions_taken: player.actionsTaken` in the update payload.
- Pass `getTimeOfDay(player.actionsTaken)` into `populateRoom`.

### 2.7 Update `components/StatusBar.tsx`

Add time of day display:

```tsx
import { getTimeOfDay } from '@/lib/spawn'
// ...
const timeOfDay = player ? getTimeOfDay(player.actionsTaken) : null
// In JSX:
{timeOfDay && (
  <>
    <span className="mx-2 opacity-40">|</span>
    {timeOfDay.toUpperCase()}
  </>
)}
```

### 2.8 TypeScript check

```
npx tsc --noEmit
```

---

## Phase 3 — NPC Activity Pools + Disposition

**Goal:** Each NPC spawns with a rolled activity and disposition; `handleTalk` varies by disposition.

### 3.1 Update `types/game.ts`

```ts
export type NpcDisposition = 'friendly' | 'neutral' | 'wary' | 'hostile'

export interface NpcActivityEntry {
  activity: string
  weight: number
  timeRestrict?: TimeOfDay[]    // if set, only available at these times
}

export interface NpcDispositionWeights {
  friendly: number
  neutral: number
  wary: number
  hostile: number
}

export interface NPC {
  id: string
  name: string
  description: string
  dialogue: string                          // base dialogue (friendly)
  dialogueByDisposition?: Partial<Record<NpcDisposition, string>>  // overrides by mood
  activityPool: NpcActivityEntry[]
  dispositionRoll: NpcDispositionWeights
}

export interface SpawnedNPC {
  npcId: string
  activity: string
  disposition: NpcDisposition
}
```

### 3.2 Update `data/npcs.ts`

Add `activityPool` and `dispositionRoll` to all 5 NPCs. Add `dialogueByDisposition` for each.

**Example for `old_mae`:**
```ts
activityPool: [
  { activity: 'feeds a small fire, piece by piece', weight: 40 },
  { activity: 'mends a worn jacket with careful hands', weight: 20 },
  { activity: 'sits very still and listens to something you cannot hear', weight: 20, timeRestrict: ['night', 'dusk'] },
  { activity: 'counts something in a tin cup, over and over', weight: 20 },
],
dispositionRoll: { friendly: 50, neutral: 30, wary: 15, hostile: 5 },
dialogueByDisposition: {
  wary: "You'll want to state your business. People who wander in without purpose tend to leave without it too.",
  hostile: "I've got nothing for you. Keep moving.",
}
```

### 3.3 New functions in `lib/spawn.ts`

```ts
export function rollNpcDisposition(weights: NpcDispositionWeights): NpcDisposition
  — Uses weightedRoll on the disposition entries.

export function rollNpcActivity(
  pool: NpcActivityEntry[],
  timeOfDay: TimeOfDay,
): string
  — Filter pool by timeRestrict (keep entries with no restriction, or matching current time).
  — weightedRoll on filtered pool, return activity string.

export function spawnNpc(npc: NPC, timeOfDay: TimeOfDay): SpawnedNPC
  — Returns { npcId, activity, disposition }
```

### 3.4 Update `lib/spawn.ts` — `populateRoom`

When an NPC passes its spawn check, call `spawnNpc(npc, timeOfDay)` instead of just pushing the ID.
`PopulatedRoom.npcs` changes type to `SpawnedNPC[]` (update `types/game.ts`).

### 3.5 Update `lib/gameEngine.ts`

**`npcsLine`:** Rewrite to use `SpawnedNPC[]`:
```ts
// "Old Mae is here. She feeds a small fire, piece by piece."
function npcsLine(npcs: SpawnedNPC[]): string
```

**`handleTalk`:** Look up `SpawnedNPC` by name match in `state.roomPopulation.npcs`.
- If `disposition === 'hostile'`: output `dialogueByDisposition.hostile` or a fallback.
- If `disposition === 'wary'`: output `dialogueByDisposition.wary` or a fallback.
- `friendly` / `neutral`: output normal `dialogue`.
- Prefix with: `${npc.name} (${disposition}) says: "..."`

**`handleLook` targeting an NPC:** Include activity line in the description.

### 3.6 TypeScript check

```
npx tsc --noEmit
```

---

## Phase 4 — Depletion + Respawn

**Goal:** Items taken from rooms record a depletion cooldown; they re-enter spawn rotation after cooldown expires.

### 4.1 Migration: `supabase/migrations/20260326000003_room_state.sql`

```sql
CREATE TABLE IF NOT EXISTS room_state (
  id                   UUID NOT NULL DEFAULT gen_random_uuid(),
  player_id            UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  room_id              TEXT NOT NULL,
  item_id              TEXT NOT NULL,
  depleted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  respawn_after_minutes INT NOT NULL,
  PRIMARY KEY (player_id, room_id, item_id)
);

CREATE INDEX room_state_player_room_idx ON room_state(player_id, room_id);
CREATE INDEX room_state_respawn_idx ON room_state(player_id, depleted_at, respawn_after_minutes);

ALTER TABLE room_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "room_state: own rows only"
  ON room_state FOR ALL
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);
```

### 4.2 New file: `lib/roomState.ts`

Pure Supabase helpers (no React):

```ts
// Cooldown ranges by item type
const RESPAWN_MINUTES: Record<ItemType, [number, number]> = {
  weapon:     [120, 360],
  armor:      [120, 360],
  key:        [240, 480],
  consumable: [30, 90],
  junk:       [10, 30],
}

export async function recordDepletion(
  playerId: string,
  roomId: string,
  itemId: string,
  itemType: ItemType,
): Promise<void>
  — Insert/upsert into room_state.
  — respawn_after_minutes = random within RESPAWN_MINUTES[itemType].

export async function getDepletedItems(
  playerId: string,
  roomId: string,
): Promise<string[]>
  — SELECT item_id WHERE player_id = ? AND room_id = ?
    AND depleted_at + (respawn_after_minutes * interval '1 minute') > now()
  — Returns array of currently-depleted item IDs.
```

### 4.3 Update `lib/gameEngine.ts`

**`handleMove` / room entry:** Before calling `populateRoom`, call `getDepletedItems(player.id, nextRoomId)`.
Pass result as `depletedItemIds` to `populateRoom`.

**`handleTake`:** After removing the item from in-memory room state, call `recordDepletion(player.id, room.id, itemId, item.type)`.

### 4.4 Update `lib/spawn.ts` — `populateRoom`

```ts
// Skip depleted items
if (depletedItemIds.includes(entry.id)) continue
```

### 4.5 TypeScript check

```
npx tsc --noEmit
```

---

## Phase 5 — Roaming Encounters + Noise + Zone Events

**Goal:** Combat creates noise that bleeds into adjacent rooms. Zone-level events modulate the world. Ambient flavor text enriches room descriptions.

### 5.1 Update `types/game.ts`

```ts
export interface RoamingEncounterEntry {
  type: 'npc_group' | 'enemy_group'
  chancePerEntry: number    // 0.0–0.95
  pool: SpawnPoolEntry[]
}

export interface ZoneEventEffect {
  spawnModifier?: number          // multiplier applied to all spawn chances in zone
  ambientOverride?: string        // replaces ambient sounds when active
}

export interface ZoneEvent {
  eventId: string
  chancePerDay: number
  durationHours: number
  effects: ZoneEventEffect
}

export interface AmbientSoundEntry {
  line: string
  timeRestrict?: TimeOfDay[]
}

export interface FlavorLineEntry {
  line: string
  chance: number              // 0.0–1.0, rolled independently
  timeRestrict?: TimeOfDay[]
}

// Add to ZoneTemplate:
export interface ZoneTemplate {
  // ... existing + Phase 1 spawnTable ...
  roamingEncounters: RoamingEncounterEntry[]
  zoneEvents: ZoneEvent[]
  ambientSounds: AmbientSoundEntry[]
  flavorLines: FlavorLineEntry[]
}

// Add to GameState:
export interface GameState {
  // ... existing ...
  roomPopulation: PopulatedRoom | null
  noiseLevel: number              // in-memory only, not persisted
  activeZoneEvents: Record<ZoneType, string[]>  // eventIds active per zone
}
```

### 5.2 Update `data/roomTemplates.ts`

Add `roamingEncounters`, `zoneEvents`, `ambientSounds`, and `flavorLines` to each zone template.

**Sample entries for `shelter`:**
```ts
ambientSounds: [
  { line: 'Water drips somewhere in the dark, slow and regular.' },
  { line: 'The ventilation shaft ticks as the metal cools.' },
  { line: 'A distant door groans on its hinges.', timeRestrict: ['night'] },
],
flavorLines: [
  { line: 'Something has been moving through here recently. The dust patterns say so.', chance: 0.15 },
  { line: 'The scratch marks on the wall are new.', chance: 0.10, timeRestrict: ['night', 'dusk'] },
],
roamingEncounters: [
  {
    type: 'enemy_group',
    chancePerEntry: 0.08,
    pool: [{ id: 'shuffler', weight: 60, spawnChance: 0.6, quantity: { min: 1, max: 2, distribution: 'weighted_low' } }],
  },
],
zoneEvents: [
  {
    eventId: 'shelter_lockdown',
    chancePerDay: 0.05,
    durationHours: 6,
    effects: { spawnModifier: 1.5, ambientOverride: 'Something has driven the Hollow indoors. They are very close.' },
  },
],
```

### 5.3 Update `lib/spawn.ts`

**Noise modifier:**
```ts
export function noiseModifier(noiseLevel: number): number {
  return 1.0 + noiseLevel  // e.g. noiseLevel 0.5 → 1.5x spawn chance
}
```

**Noise decay (call on room transition):**
```ts
export function decayNoise(noiseLevel: number): number {
  return Math.max(0, noiseLevel - 0.3)
}
```

**Zone event modifier:**
```ts
export function zoneEventModifier(
  zone: ZoneType,
  activeZoneEvents: Record<ZoneType, string[]>,
): number
  — Look up active events for zone, sum their spawnModifier effects.
  — Return combined multiplier (default 1.0).
```

**Roaming encounter roll (zone-level, not per-room):**
```ts
export function rollRoamingEncounter(
  zone: ZoneType,
  noiseLevel: number,
  timeOfDay: TimeOfDay,
): SpawnedNPC[] | string[] | null
  — Roll once per zone entry.
  — If encounter triggered, return spawned enemies or NPCs.
  — Returns null if no encounter.
```

**Update `populateRoom`:**
```ts
export function populateRoom(
  room: Room,
  zone: ZoneType,
  depletedItemIds: string[],
  timeOfDay: TimeOfDay,
  noiseLevel: number,
  zoneEventMod: number,
): PopulatedRoom
```

Pass `[timeModifier, noiseModifier(noiseLevel), zoneEventMod]` to `spawnCheck` for each entry.

**Ambient/flavor text in `populateRoom`:**
Roll ambient sounds (pick one matching current time) and flavor lines (each rolled independently).
Attach to `PopulatedRoom.flavorLines`.

### 5.4 Update `lib/gameEngine.ts`

**`GameState` initialization:** Add `noiseLevel: 0`, `activeZoneEvents: { shelter: [], ruins: [], wastes: [], outpost: [], underground: [] }`.

**`handleMove`:**
- Decay noise: `state.noiseLevel = decayNoise(state.noiseLevel)`
- Pass `state.noiseLevel * 0.5` to `populateRoom` (adjacent room gets half the noise).
- After move completes, update `state.noiseLevel` to decayed value.
- Append `roomPopulation.flavorLines` as narrative messages after the room description.

**`handleAttack` / `doAttackRound`:**
- Increment noise: after each attack round, `state.noiseLevel += 0.4`.
- For gun use (pistol, shotgun, hunting rifle): `state.noiseLevel += 0.8` extra.
- Cap noise at 5.0.

**Zone events on session init:**
- In `loadPlayer` / `createCharacter`, call a new function `rollZoneEvents(templates)` that rolls each zone's `chancePerDay` and stores results in `state.activeZoneEvents`.
- This is in-memory only; not persisted.

**Zone entry detection:**
- When `nextRoom.zone !== currentRoom.zone`, roll `rollRoamingEncounter` and append any encounter to room messages.

### 5.5 Zone event storage in `world_state`

Active zone events can optionally be persisted in the existing `world_state` table (no schema change needed — it already has a `state_data jsonb` column). This is optional for now; in-memory is sufficient for single-player.

### 5.6 TypeScript check

```
npx tsc --noEmit
```

---

## File Change Summary

| File | Change |
|---|---|
| `types/game.ts` | Add: `DistributionType`, `QuantityConfig`, `SpawnPoolEntry`, `SpawnTable`, `SpawnedItem`, `SpawnedNPC`, `PopulatedRoom`, `TimeOfDay`, `NpcDisposition`, `NpcActivityEntry`, `NpcDispositionWeights`, `RoamingEncounterEntry`, `ZoneEventEffect`, `ZoneEvent`, `AmbientSoundEntry`, `FlavorLineEntry`. Update: `ZoneTemplate`, `NPC`, `Player`, `GameState`, `Room`. |
| `lib/spawn.ts` | NEW — all spawn logic: `weightedRoll`, `quantityRoll`, `spawnCheck`, `rollCondition`, `populateRoom`, `getTimeOfDay`, `rollNpcDisposition`, `rollNpcActivity`, `spawnNpc`, `noiseModifier`, `decayNoise`, `zoneEventModifier`, `rollRoamingEncounter` |
| `lib/roomState.ts` | NEW — depletion tracking: `recordDepletion`, `getDepletedItems` |
| `lib/worldGen.ts` | Remove: `rollItems`, `rollEnemies`, `rollNpcs`. Update `buildRoom`: always `items: [], enemies: [], npcs: []`. |
| `lib/world.ts` | Update `persistWorld`: write `items: [], enemies: []` to DB rows. |
| `lib/gameEngine.ts` | Update: `handleMove`, `handleLook`, `handleTake`, `handleTalk`, `doAttackRound`, `loadPlayer`, `createCharacter`, `savePlayer`. Add: `noiseLevel`, `activeZoneEvents`, `roomPopulation` to state. |
| `data/roomTemplates.ts` | Update: all 5 zone templates — add `spawnTable`, `roamingEncounters`, `zoneEvents`, `ambientSounds`, `flavorLines`. |
| `data/npcs.ts` | Update: all 5 NPCs — add `activityPool`, `dispositionRoll`, `dialogueByDisposition`. |
| `components/StatusBar.tsx` | Add time of day display. |
| `supabase/migrations/20260326000002_time_of_day.sql` | NEW — `actions_taken` column on `players` |
| `supabase/migrations/20260326000003_room_state.sql` | NEW — `room_state` table |

---

## Phase Gate: TypeScript Checks

Run after each phase before proceeding:

```bash
cd /Users/ryan/projects/mud-game && npx tsc --noEmit
```

---

## Definition of Done

- [ ] Phase 1: `lib/spawn.ts` exists, `worldGen.ts` no longer bakes items/enemies, `populateRoom` called on room entry, item conditions displayed.
- [ ] Phase 2: `actions_taken` in DB, `getTimeOfDay` implemented, StatusBar shows time, spawn modifiers applied.
- [ ] Phase 3: All NPCs have `activityPool` + `dispositionRoll`, activity displayed in room, `handleTalk` varies by disposition.
- [ ] Phase 4: `room_state` table exists, `recordDepletion` called on take, depleted items excluded from spawns.
- [ ] Phase 5: Noise increments on combat/guns, decays on move, `populateRoom` receives noise modifier, flavor lines appended to room descriptions, zone events rolled on session init.
- [ ] `npx tsc --noEmit` exits zero after each phase.
- [ ] Migrations applied via `supabase db push --yes`.

---

# PLAN: Death & Regeneration System for The Remnant
_Created: 2026-03-26 | Type: New Feature (Multi-phase system)_

## Goal
Implement a complete **Cycle & Regeneration system** where permadeath is real but death leads to rebirth with world persistence, progressive difficulty scaling, and narrative depth. Players lose some capability on death but carry forward knowledge (ledger), some stats (echoes), faction memory, and world state.

## Background
Currently, when player HP reaches 0, the engine resets HP and shows "Your journey ends here. Reload to try again." There is no cycle system, no persistence across deaths, and no mechanical consequence or progression.

The new system treats death as a transformation, not a failure state. Every cycle, the world becomes more dangerous via the **Pressure system**. The player becomes a **Revenant** — someone the virus keeps bringing back — with costs that mount with each death and rewards in the form of stat echoes and world persistence.

## Scope

**In scope:**
- Core cycle infrastructure (player_ledger table, cycle/death counters, world seed persistence)
- Death screen component with narrative framing
- Rebirth mechanics (HP reset, cycle increment, position reset, inventory clear, stat echoes)
- App state machine expansion (`dead` phase + The Between screen)
- Skill echoes system (pre-fill character creation stats at 70% of previous, min = class floor)
- Pressure level calculation and spawn scaling (1–5 based on cycle count)
- Stash system (persistent item storage, DB table, commands, UI)
- Faction memory persistence layer
- Revenant identity (NPC dialogue recognition, visible scarring, memory bleeds)
- New app phases: `dead` → The Between → rebirth choice

**Out of scope:**
- Skill system itself (what skills exist, how they're calculated, progression) — Phase 2+ work
- Multiplayer/shared world state (world_state table exists but unused)
- Currency system (stash/inherit is items only)
- Faction system full implementation (memory persistence layer only)
- Advanced personal quest evolution (basic hooks only)
- Squirrel aging system (structure only; logic TBD)

## Technical Approach

### Database Architecture
- **player_ledger** — One row per player (linked to auth.users.id). Records meta-progression across all cycles: world_seed, cycle count, total_deaths, discovered_room_ids, stash_location, squirrel state, faction memory rates.
- **player_stash** — Separate rows for each stash item slot (20–40 slots). Linked to player_id + ledger reference. Persists across cycles.
- **player_faction_memory** — One row per faction per player. Stores reputation rate multipliers (0.2–0.7) applied on rebirth.
- **players** table expanded — Add `cycle`, `total_deaths`, `is_dead` columns. These are the *current cycle* values (mutable). On rebirth, they reset/increment.

### Game Engine Flow
1. **handlePlayerDeath()** (currently calls HP reset; will trigger death screen + ledger update)
2. **rebirthCharacter()** (new) — same world_seed, reset stats/position/inventory, increment cycle, apply echoes
3. **computePressure()** (new) — `Math.min(5, Math.floor(cycle / 3) + 1)`
4. **spawnAdjustment()** — modify `populateRoom()` to accept pressure; scale enemy chances/quantities

### Type Changes
- Add to Player: `isDead: boolean`, `cycle: number`, `totalDeaths: number`
- Add to GameState: `playerDead: boolean`
- Create Ledger interface: `{ playerId, cycle, totalDeaths, worldSeed, discoveredRoomIds, stashLocation, stashItems, squirrel, factionMemory }`

### Component Architecture
- **DeathScreen.tsx** (new) — Full-screen narrative death moment. Shows cause, rooms explored, cycle #, XP gained. "The virus stirs. You are not done yet." Fade-out effect. Continue button.
- **TheBetween.tsx** (new) — Interstitial narrative screen. Shows 3 memory fragments (random narrative vignettes). No mechanical choices in Phase 1 (will add in Phase 2). Continue button.
- **CharacterCreation.tsx** (modified) — Add "echo" indicator on stat rows when stats pre-filled from previous cycle (not on first cycle).
- **Sidebar.tsx** (modified) — Add stash panel showing item count + capacity.

### App State Machine (page.tsx)
Current: `checking → unauthenticated | prologue | no-player | ready`

New: `checking → unauthenticated | prologue | no-player | ready` + within `ready`: `alive → dead` (DeathScreen shown) → The Between → rebirth prompt → character creation variant (with echoes) → ready

Implementation: Keep AuthPhase, add GamePhase ('alive' | 'dead' | 'between' | 'rebirth'). When HP reaches 0:
1. Set gamePhase = 'dead' → show DeathScreen
2. User clicks Continue → gamePhase = 'between' → show TheBetween
3. User clicks Continue → gamePhase = 'rebirth' → show CharacterCreation (pre-filled with echoes)
4. User confirms → gamePhase = 'alive'

---

## Phase 1 — Core Cycle Infrastructure
**These tasks have internal dependencies. Items 1–3 can run in parallel; 4–6 depend on 1.**

### Task 1: Create `player_ledger` migration
**Files affected:** `supabase/migrations/20260327000002_add_ledger.sql` (new)

Create the ledger table to persist cycle data across character deaths:
```sql
create table if not exists player_ledger (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null unique references players(id) on delete cascade,
  cycle int not null default 1,
  total_deaths int not null default 0,
  world_seed int not null,
  pressure_level int not null default 1,
  discovered_room_ids jsonb not null default '[]',
  stash_location text,  -- room_id where stash is stored
  stash_capacity int not null default 20,
  squirrel_alive boolean not null default false,
  squirrel_trust int not null default 0,
  squirrel_cycles_known int not null default 0,
  squirrel_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Add columns to `players` table:
```sql
alter table players add column if not exists cycle int not null default 1;
alter table players add column if not exists total_deaths int not null default 0;
alter table players add column if not exists is_dead boolean not null default false;
```

Enable RLS on ledger (players can only read/write their own). Create trigger for updated_at.

**Tests:** Verify table exists with correct columns and constraints. Verify RLS policies work.

**Depends on:** Nothing.

---

### Task 2: Create `player_stash` migration
**Files affected:** `supabase/migrations/20260327000003_add_stash.sql` (new)

```sql
create table if not exists player_stash (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  item_id text not null,
  quantity int not null default 1 check (quantity > 0),
  slot_index int not null,  -- 0-19 (or 0-39 if expanded)
  created_at timestamptz not null default now()
);

create index player_stash_player_id_idx on player_stash(player_id);
alter table player_stash enable row level security;
create policy "stash: own rows only"
  on player_stash for all
  using (auth.uid() = player_id)
  with check (auth.uid() = player_id);
```

**Tests:** Verify table exists, RLS works, indices created.

**Depends on:** Nothing (independent of Task 1).

---

### Task 3: Create `player_faction_memory` migration
**Files affected:** `supabase/migrations/20260327000004_add_faction_memory.sql` (new)

```sql
create table if not exists player_faction_memory (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  faction_id text not null,  -- e.g. 'the_accord', 'the_kindling'
  reputation_rate real not null,  -- 0.2–0.7 based on faction
  created_at timestamptz not null default now()
);

create unique index player_faction_memory_unique
  on player_faction_memory(player_id, faction_id);
alter table player_faction_memory enable row level security;
create policy "faction_memory: own rows only"
  on player_faction_memory for all
  using (auth.uid() = player_id)
  with check (auth.uid() = player_id);
```

**Tests:** Verify table, RLS, unique constraint.

**Depends on:** Nothing (independent).

---

### Task 4: Extend types in `game.ts`
**Files affected:** `types/game.ts` (modify)

Add new types:

```typescript
export interface Ledger {
  id: string
  playerId: string
  cycle: number
  totalDeaths: number
  worldSeed: number
  pressureLevel: number
  discoveredRoomIds: string[]
  stashLocation?: string
  stashCapacity: number
  squirrelAlive: boolean
  squirrelTrust: number
  squirrelCyclesKnown: number
  squirrelName?: string
}

export interface StashItem {
  id: string
  playerId: string
  itemId: string
  quantity: number
  slotIndex: number
}

export interface FactionMemory {
  id: string
  playerId: string
  factionId: string
  reputationRate: number
}

export type SkillEchoes = Partial<Record<Stat, number>>
```

Extend Player interface:
```typescript
export interface Player {
  // ... existing fields ...
  cycle: number
  totalDeaths: number
  isDead: boolean
}
```

Extend GameState:
```typescript
export interface GameState {
  // ... existing fields ...
  playerDead: boolean
  ledger?: Ledger
}
```

**Tests:** TypeScript compilation passes. No runtime changes needed.

**Depends on:** Task 1 (so schema is defined).

---

### Task 5: Create DeathScreen component
**Files affected:** `components/DeathScreen.tsx` (new)

A full-screen narrative component shown when player dies. Displays:
- Cause of death (passed in as prop)
- Rooms explored this cycle
- Current cycle number
- XP earned this cycle
- Flavor text: "The virus stirs. You are not done yet."
- Continue button (calls onContinue callback)

Design: Dark, mournful aesthetic. Fade-in text. Sound effect (optional). Fade-out on continue.

```typescript
interface DeathScreenProps {
  causeOfDeath: string
  roomsExplored: number
  currentCycle: number
  xpEarned: number
  onContinue: () => void
}

export default function DeathScreen(props: DeathScreenProps) { ... }
```

**Tests:** Component renders with correct props. Continue button triggers callback.

**Depends on:** Task 4 (types).

---

### Task 6: Update gameEngine `handlePlayerDeath()` + add `rebirthCharacter()`
**Files affected:** `lib/gameEngine.ts` (modify)

Modify `handlePlayerDeath()`:
1. Log death to database (increment total_deaths)
2. Set `player.isDead = true` and `gameState.playerDead = true`
3. Append death message to log (trigger UI to show DeathScreen)
4. Do NOT reset HP or state yet — let UI handle the transition

Create new `rebirthCharacter()` method:
1. Same world_seed (rooms persist)
2. Reset HP to maxHp
3. Reset position to starting room
4. Clear inventory
5. Increment cycle counter (player.cycle++)
6. Apply stat echoes: for each stat, set to `floor(previousValue * 0.7)` with min = class floor
7. Reset XP to 0
8. Mark `isDead = false`
9. Save to database

Modify character creation flow to accept optional echo stats:

```typescript
async createCharacter(
  userId: string,
  name: string,
  characterClass: CharacterClass,
  stats: StatBlock,
  echoStats?: SkillEchoes  // if rebirth, pre-fill with echoes
): Promise<Player>
```

**Tests:**
- Unit tests for stat echo calculation (70% with class floor)
- Integration test: create player → die → rebirth → verify cycle incremented, stats echoed, inventory cleared
- Verify ledger row created on first character creation

**Depends on:** Tasks 1, 4, 5.

---

### Task 7: Expand app state machine (page.tsx) + add The Between screen
**Files affected:** `app/page.tsx` (modify), `components/TheBetween.tsx` (new)

Modify page.tsx AuthPhase type to include game phases:
```typescript
type GamePhase = 'alive' | 'dead' | 'between' | 'rebirth'
```

When engine reports `playerDead === true`:
1. Show DeathScreen
2. On continue → show TheBetween
3. On continue → show CharacterCreation (with echo stats pre-filled)
4. On confirm → set gamePhase = 'alive'

Create TheBetween.tsx: Narrative interstitial showing 3 random "memory fragments" (narrative vignettes from a pool). No mechanical choices yet (Phase 2 adds those). Continue button.

```typescript
interface TheBetweenProps {
  cycle: number
  onContinue: () => void
}
```

**Tests:**
- Death flow: start game → die → verify DeathScreen shown → continue → verify TheBetween shown → continue → verify CharacterCreation shown with echoes
- Verify page transitions are smooth

**Depends on:** Tasks 5, 6.

---

### Task 8: Wire DeathScreen + rebirth flow end-to-end
**Files affected:** `lib/gameContext.ts` (likely small changes to expose rebirth method), test files

Integrate all Phase 1 pieces:
1. Engine's handlePlayerDeath() triggers UI death phase
2. DeathScreen shown with correct data (cause, rooms, cycle, XP)
3. User clicks Continue → TheBetween shown
4. User clicks Continue → CharacterCreation shown with echo stats
5. User confirms creation → rebirthCharacter() called → world reloaded with same seed, cycle incremented
6. Game resumes in ready phase

**Tests:**
- Full integration test from start → death → rebirth → gameplay resumes
- Verify stat echoes are applied correctly
- Verify cycle counter incremented
- Verify world seed is same (rooms are the same)
- Verify inventory is cleared

**Depends on:** Tasks 5, 6, 7.

---

## Phase 2 — Skill Echoes & Stat Persistence

### Task 9: Pre-fill character creation with echo stats
**Files affected:** `components/CharacterCreation.tsx` (modify)

When rebirth, receive echoStats and pre-fill stat rows with echo values instead of class bonus + base. Show "echo" indicator next to each stat showing it's a carryover from previous life.

User can still allocate free points (from class.freePoints) to bump stats further.

**Tests:**
- First character: no echoes, stats start at base + class bonus
- After rebirth: stats start at 70% of previous (min = class floor), user can still add free points

**Depends on:** Task 6 (rebirthCharacter method).

---

## Phase 3 — Pressure System

### Task 10: Implement pressure calculation
**Files affected:** `lib/gameEngine.ts` (add method), `types/game.ts` (add to Ledger)

Add method `computePressure(cycle: number): number`:
```typescript
const pressure = Math.min(5, Math.floor(cycle / 3) + 1)
```

Store in ledger on rebirth. Update when loading player.

**Tests:**
- Cycles 1–2 → pressure 1
- Cycles 3–5 → pressure 2
- Cycles 6–10 → pressure 3
- etc.

**Depends on:** Task 1 (ledger table has pressure_level column).

---

### Task 11: Modify spawn system for pressure scaling
**Files affected:** `lib/spawn.ts` (modify `populateRoom()` signature), `lib/gameEngine.ts` (wire pressure into applyPopulation)

Extend `populateRoom()` to accept optional `pressure: number` parameter. Modify spawn chances and quantities:

```typescript
function populateRoom(
  room: Room,
  timeOfDay: TimeOfDay,
  seed: number,
  pressure: number = 1
): PopulatedRoom
```

Inside populateRoom, apply pressure modifiers to spawn table entries:
- Spawn chances: multiply by `1 + (pressure - 1) * 0.15` (max 1.0, hard cap at 0.95)
- Enemy quantities: multiply by `1 + (pressure - 1) * 0.1`

When game engine loads room, pass pressure from ledger.

**Tests:**
- Same room at pressure 1 vs 5: pressure 5 has higher enemy spawn chance and quantities
- Hard cap at 0.95 still enforced

**Depends on:** Task 10 (pressure calculation).

---

## Phase 4 — Stash System

### Task 12: Implement stash commands + engine handlers
**Files affected:** `lib/gameEngine.ts` (add handlers), `lib/inventory.ts` (add stash functions)

Add commands: `stash [item]`, `unstash [item]`, `stash list`

Handlers:
- `handleStash(itemName)` — move item from inventory to stash (if stash not full)
- `handleUnstash(itemName)` — move item from stash to inventory (if inventory has room)
- `handleStashList()` — show stash contents (item count + capacity)

Wire into executeAction switch statement.

Create helper functions in inventory.ts:
- `addStashItem(playerId, itemId, quantity, slotIndex)`
- `removeStashItem(playerId, itemId, quantity)`
- `getStash(playerId): StashItem[]`

**Tests:**
- Add item to inventory → stash it → verify moved to stash
- Unstash → verify moved back to inventory
- Stash list → shows correct items and capacity
- Stash full → cannot add more
- Items in stash persist across death

**Depends on:** Task 2 (stash table).

---

### Task 13: Add stash panel to Sidebar
**Files affected:** `components/Sidebar.tsx` (modify)

Display stash section: "Stash: 5/20 items". List first 5 items (truncate with "...more"). Click to expand or toggle to show full stash.

**Tests:**
- Sidebar renders stash section
- Item count updates when stash changes
- Capacity display updates

**Depends on:** Task 12 (stash commands available).

---

## Phase 5 — Faction Memory

### Task 14: Implement faction memory persistence layer
**Files affected:** `lib/inventory.ts` or new `lib/faction.ts`, `lib/gameEngine.ts` (modify rebirth)

Create functions:
- `getFactionMemory(playerId): FactionMemory[]`
- `setFactionMemory(playerId, factionId, reputationRate)`
- `applyFactionMemory(player, factionMemories): Player` — multiplies current faction rep by memory rate

On rebirth, after applying stat echoes:
1. Load faction memories from DB
2. Apply rates to current rep (multiply, not add)
3. Save updated rep back to player state

**Tests:**
- Save rep at X value → die → rebirth → rep is X * memory_rate
- Faction memory persists across multiple deaths

**Depends on:** Task 3 (faction_memory table).

---

## Phase 6 — Revenant Identity

### Task 15: Add cycle-gated NPC dialogue
**Files affected:** `data/npcs.ts` (or dialogue system if exists), `lib/gameEngine.ts` (handleTalk)

For key NPCs (e.g., Wren Calloway), branch dialogue by cycle:
- Cycle 1: "Who are you?"
- Cycles 2–3: "You look familiar. Have we met?"
- Cycles 4–7: "I remember you. You've been through something."
- Cycles 8–12: "[Revenant-specific quest branch dialogue]"
- Cycles 13+: "[Legend dialogue]"

Implement as metadata on NPC:
```typescript
interface NPC {
  id: string
  name: string
  description: string
  dialogue: string | Record<string, string>  // simple or cycle-gated
  cycleDialogue?: { minCycle: number; maxCycle: number; text: string }[]
}
```

In handleTalk, select dialogue based on player.cycle.

**Tests:**
- Cycle 1 NPC dialogue differs from cycle 5
- Unknown cycles fall back to cycle 1 or nearest lower
- Dialogue text displays correctly

**Depends on:** Task 4 (Player.cycle added to types).

---

### Task 16: Add visible scarring (cycle-based player description)
**Files affected:** `lib/gameEngine.ts` (modify handleStats)

In the `stats` command output, append cycle-based flavor text:
- Cycles 0–1: "(You look recently risen.)"
- Cycles 2–4: "(Faint scars glow faintly under your skin.)"
- Cycles 5–7: "(Your skin is marked with luminescent patterns.)"
- Cycles 8+: "(You are a patchwork of viral scarring.)"

**Tests:**
- Stats command shows correct scarring description based on cycle

**Depends on:** Task 6 (rebirthCharacter increments cycle).

---

### Task 17: Memory bleed events on room entry
**Files affected:** `lib/gameEngine.ts` (modify handleMove)

On room entry, if player.cycle >= 4:
- 5% chance to roll a random "memory bleed" narrative event
- Event is flavor text: "(A fragment of another life flashes before you. A room like this. Blood. Something hunting.)"

Store a pool of 5–10 memory bleed messages. Roll one randomly.

**Tests:**
- Cycle < 4: no memory bleeds (0% chance)
- Cycle >= 4: ~5% of room entries trigger a bleed
- Message displays in log

**Depends on:** Task 6 (cycle tracking).

---

## Parallelization Note

**Phase 1:**
- Tasks 1–3 can run in parallel (no shared files)
- Task 4 depends on 1–3 (it needs the schema defined in types)
- Tasks 5–8 can run roughly in parallel but conceptually form a pipeline

**Phase 2–6:** Sequential; each depends on Phase 1 completion. Task 9 does not block 10–17.

**Recommended worker assignment (if using parallel):**
- Worker A: Tasks 1–2 (migrations 1–2) + Task 4 (types) — owns `supabase/`, `types/`
- Worker B: Tasks 3 (migration 3) + Task 5 (DeathScreen) — owns `supabase/`, `components/`
- Worker C: Tasks 6–7 (engine death, The Between, page.tsx) — owns `lib/gameEngine.ts`, `app/page.tsx`, `components/TheBetween.tsx`
- Worker D: Task 8 (integration) + Tasks 10–11 (pressure) — owns test files, `lib/spawn.ts`
- Remaining phases (2–6) are sequential but small enough for single execution

---

## File Change Summary

| File | Change |
|---|---|
| `types/game.ts` | Add: `Ledger`, `StashItem`, `FactionMemory`, `SkillEchoes`. Extend: `Player` (add `cycle`, `totalDeaths`, `isDead`), `GameState` (add `playerDead`, `ledger`). |
| `supabase/migrations/20260327000002_add_ledger.sql` | NEW — player_ledger table + players.cycle, .total_deaths, .is_dead columns |
| `supabase/migrations/20260327000003_add_stash.sql` | NEW — player_stash table |
| `supabase/migrations/20260327000004_add_faction_memory.sql` | NEW — player_faction_memory table |
| `lib/gameEngine.ts` | Modify: `handlePlayerDeath()` (no longer resets HP), add `rebirthCharacter()`, add `computePressure()`. Wire pressure into `populateRoom()` calls. |
| `lib/inventory.ts` | Add: `addStashItem()`, `removeStashItem()`, `getStash()` functions |
| `lib/spawn.ts` | Modify: `populateRoom()` signature to accept optional `pressure` parameter; apply pressure modifiers to spawn chances/quantities |
| `components/DeathScreen.tsx` | NEW — narrative death screen |
| `components/TheBetween.tsx` | NEW — memory fragments interstitial |
| `components/CharacterCreation.tsx` | Modify: pre-fill stats from echoes on rebirth, show "echo" indicators |
| `components/Sidebar.tsx` | Add: stash panel with item count + capacity |
| `app/page.tsx` | Modify: add GamePhase state machine, integrate death → between → rebirth flow |
| `lib/gameContext.ts` | Expose `rebirthCharacter()` method |
| `data/npcs.ts` | Modify: add cycle-gated dialogue branches to key NPCs |

---

## Definition of Done

Every task in this plan is complete when:
- [ ] Code written and self-reviewed
- [ ] Tests written or updated for the changed logic (migrations tested via schema validation, components via render tests, engine via integration tests)
- [ ] `code-reviewer` passes with no blockers
- [ ] `test-runner` passes with no failures
- [ ] Full death → rebirth → gameplay flow tested end-to-end
- [ ] MR opened via `git-agent` with coverage gaps (if any) noted in the description

---

## References
- Design Document: `/Users/ryan/projects/mud-game/docs/DEATH_REGENERATION.md`
- Current types: `/Users/ryan/projects/mud-game/types/game.ts`
- Game engine: `/Users/ryan/projects/mud-game/lib/gameEngine.ts` (handlePlayerDeath at line ~860)
- App page: `/Users/ryan/projects/mud-game/app/page.tsx` (AuthPhase state machine)
- Current DB schema: `/Users/ryan/projects/mud-game/supabase/migrations/20260326000001_init.sql`
- Spawn system: `/Users/ryan/projects/mud-game/lib/spawn.ts` (populateRoom function)
- Character creation: `/Users/ryan/projects/mud-game/components/CharacterCreation.tsx`

---

## Open Questions
- [ ] Should memory bleed messages reference other Revenant cycles (13+ cycles) or just generic "echo" flavor? (Deferred to Phase 6 implementation.)
- [ ] What happens to the squirrel at cycle 15+ when it dies? (Noted in design as "only permadeath", structure exists in ledger but logic deferred.)
- [ ] Should stash location be selectable in character creation or assigned randomly? (Defer to Phase 4; assume assigned for MVP.)
- [ ] Personal quest state — should it reset or evolve? (Out of scope; will hook in later phases.)

---

# Plan: Comprehensive Test Suite for MUD Game
_Created: 2026-03-26 | Type: New Feature_

## Goal
Build a production-ready test suite from zero covering pure functions (dice, spawn, parsing), deterministic world generation, Supabase-backed inventory operations, and React components using vitest + React Testing Library.

## Background

The MUD game has **zero existing tests** despite containing:
- **Pure functions** with probabilistic logic (spawn.ts, dice.ts)
- **Deterministic generators** that must verify seeding (worldGen.ts)
- **Parser logic** with complex verb/noun mapping
- **Supabase integration** requiring careful mocking
- **React components** consuming game data

Testing this codebase is critical because:
1. Spawn probability correctness is load-bearing — wrong weights = unfair difficulty
2. World generation determinism is required for reproducible seeds (player feature)
3. Combat calculations must not drift due to floating-point errors
4. Parser edge cases will surface in production (user input is chaos)
5. Inventory async operations require isolation from live Supabase

## Scope

**In scope:**
- Install and configure vitest (Next.js 16 + ESM native)
- Unit tests for all pure functions (dice, spawn, parser, theme)
- Determinism tests for worldGen seeding
- Integration tests for inventory (mocked Supabase)
- Mocking strategy for Supabase + localStorage
- Component render tests (ThemePicker, StatusBar, CharacterCreation)
- ~250–300 test cases across 11 suites

**Out of scope:**
- E2E tests (gameEngine requires full Supabase + auth integration)
- Visual regression testing
- Performance benchmarks (spawn probability distributions)
- Test coverage reports for gameEngine.ts (Supabase tight coupling prevents unit testing without major refactoring)

---

## Technical Approach

### 1. Framework Selection: Vitest
- **Why vitest**: Next.js 16 + React 19 expect ESM-native test runner; Jest has friction with Next.js App Router
- **Why not Jest**: Requires `@babel/preset-typescript` or `ts-jest`, adds complexity, slower startup
- **Config**: `vitest.config.ts` with `globals: true`, `environment: 'jsdom'` for component tests
- **Globals**: Enable `describe`, `it`, `expect` without imports (matches Jest UX)

### 2. Mocking Strategy

**Pure functions** (dice, spawn, parser, theme):
- No mocks needed — deterministic, no side effects
- Use `vi.spyOn(Math, 'random')` for probability tests only (to verify weighting is applied, not actual randomness)

**Supabase** (inventory operations):
- Mock entire `createSupabaseBrowserClient()` via `vi.mock('@/lib/supabase')`
- Each test gets a fresh mock instance (isolated database state)
- Return shapes match `InventoryRow` type exactly
- Track `.select()`, `.insert()`, `.update()`, `.delete()` chains via Vitest spies

**localStorage** (theme.ts):
- Mock via `vi.stubGlobal('localStorage', { getItem, setItem, ... })`
- Restore after each test to prevent cross-test pollution

**Math.random()** (spawn weights, condition rolls):
- **Default**: Let real Math.random() run (testing probability distributions is hard; instead test the logic path is taken)
- **Specific tests**: `vi.spyOn(Math, 'random')` to return fixed sequences when testing edge cases (e.g., 0.95 cap)

### 3. Test File Organization

```
tests/
  unit/
    dice.test.ts              — roll1d10, statModifier, rollCheck, rollDamage
    spawn.test.ts             — weightedRoll, quantityRoll, spawnCheck, rollCondition
    spawn-pressure.test.ts    — computePressure, pressureModifier, populateRoom
    parser.test.ts            — parseCommand across all verb categories
    theme.test.ts             — loadTheme, saveTheme, getTheme
    npcs.test.ts              — getNPC, getRevenantDialogue (pure lookups)
  integration/
    inventory.test.ts         — getInventory, addItem, removeItem, equipItem, unequipItem (mocked Supabase)
    worldGen.test.ts          — generateWorld determinism; seeding; reachability verification
  components/
    ThemePicker.test.tsx      — Render; theme selection; localStorage side effect
    StatusBar.test.tsx        — Props rendering; player stat display
    CharacterCreation.test.tsx— Form submission; class selection; stat distribution
```

### 4. Setup & Teardown

**vitest.config.ts**:
- `globals: true` (enable describe/it without imports)
- `environment: 'jsdom'` (for React component tests)
- `setupFiles: ['tests/setup.ts']` (global mocks)

**tests/setup.ts**:
- Mock localStorage before any test runs
- Set up default Supabase mock factory
- Restore after each test via `afterEach(vi.clearAllMocks)`

### 5. Supabase Mock Pattern

```typescript
// Mock factory — each test can customize
const mockSupabase = (overrides?: Partial<SupabaseClient>) => ({
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    // ... resolve all chainable returns
  })),
  ...overrides,
})

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: vi.fn(() => mockSupabase()),
}))
```

### 6. Random Number Seeding (worldGen.test.ts)

**Critical**: `generateWorld(seed)` must be **100% deterministic**.
- Generate a world with seed `12345`, capture room IDs and exit graph
- Generate again with same seed, assert identical
- Generate with different seed, assert different
- Repeat 10 times with random seeds to catch edge cases

**BFS reachability**:
- Verify generated world has zero unreachable rooms
- Test throws on malformed exit graphs (edge case coverage)

---

## Test Suite Breakdown

### Unit Tests

#### `dice.test.ts` (~25 cases)
**Functions**: `roll1d10`, `statModifier`, `rollCheck`, `rollDamage`

**Test cases**:
- `statModifier`: stat 5→0, stat 10→+5, stat 1→-4, stat 0→-5
- `roll1d10`: returns in range [1, 10]; spyOn Math.random to test bounds
- `rollCheck`:
  - Modifier adds correctly (stat 7 + roll 8 = 15 total)
  - Critical (roll 10) always succeeds
  - Fumble (roll 1) always fails
  - Tie goes to player (total === dc)
- `rollDamage`: min=2, max=5 returns in [2, 5]

#### `spawn.test.ts` (~40 cases)
**Functions**: `weightedRoll`, `quantityRoll`, `spawnCheck`, `rollCondition`

**Test cases**:
- `weightedRoll`:
  - Throws on empty pool
  - Weighted selection works (create pool with weights 100/1, assert first is picked 99% of the time — use 1000 iterations)
  - Floating-point edge case (returns last entry on edge)
- `quantityRoll`:
  - `single`: always 1
  - `flat`: uniform [min, max]
  - `weighted_low`: min of two rolls (bias toward min)
  - `weighted_high`: max of two rolls (bias toward max)
  - `bell`: average, rounded (sample 1000, verify normal-ish distribution)
- `spawnCheck`:
  - Base chance with no modifiers rolls correctly
  - Time modifiers apply (baseChance 0.5 × timeModifier 2.0 = 1.0, but capped at 0.95)
  - Noise modifier applies
  - Hard cap at 0.95 enforced (spy on Math.random, assert final < 0.95)
- `rollCondition`:
  - Default (0.3–1.0) returns in range, 2 decimals
  - Custom min/max respects bounds
  - Rounding to 2 decimals works (0.335 → 0.34)

#### `spawn-pressure.test.ts` (~30 cases)
**Functions**: `computePressure`, `pressureModifier`, `populateRoom`

**Test cases**:
- `computePressure`:
  - Cycle 1–2 → Pressure 1
  - Cycle 3–4 → Pressure 2
  - Cycle 5–6 → Pressure 3
  - Cycle 7–9 → Pressure 4
  - Cycle 10+ → Pressure 5
  - Boundary: cycle 2→1, cycle 3→2, cycle 10→5
- `pressureModifier`:
  - Pressure 1 → 1.0 (no modifier)
  - Pressure 2 → 1.15 (15% boost)
  - Pressure 5 → 1.60 (60% boost)
- `populateRoom`:
  - Items spawn correctly (spawnCheck passes, quantityRoll honored)
  - Depleted items are skipped
  - Enemies spawn with pressure boost applied
  - Pressure ≥3: enemy quantity +1 (but capped)
  - NPCs spawn (no pressure boost)
  - Returns shape matches `PopulatedRoom`

#### `parser.test.ts` (~80 cases)
**Function**: `parseCommand`

**Test cases** (by verb category):
- **Empty/unknown**:
  - Empty string → `{ verb: 'unknown', noun: '' }`
  - Gibberish → `{ verb: 'unknown', noun: 'gibberish' }`
  - Whitespace-only → `{ verb: 'unknown' }`
- **Bare directions**: `n`, `north`, `e` → `{ verb: 'go', noun: 'north' }` etc.
- **Movement verbs**:
  - `go north` → `{ verb: 'go', noun: 'north' }`
  - `move east` → `{ verb: 'go', noun: 'east' }`
  - `head down` → `{ verb: 'go', noun: 'down' }`
  - `go` (no direction) → `{ verb: 'go', noun: undefined }`
  - `go invalid` → `{ verb: 'go', noun: 'invalid' }`
- **Multi-word**: `pick up`, `put down`, `take off`, `search room`, `look around`
- **Look verbs**: `look`, `l`, `examine`, `x`, `inspect`, `check`, `describe`
- **Inventory verbs**: `inventory`, `i`, `take`, `get`, `drop`, `use`, `drink`, `eat`, `equip`, `wear`, `wield`, `unequip`, `remove`
- **Combat verbs**: `attack`, `kill`, `hit`, `fight`, `strike`, `flee`, `run`, `escape`, `retreat`
- **Interaction verbs**: `talk`, `speak`, `ask`, `greet`, `open`, `search`
- **System verbs**: `stats`, `status`, `character`, `char`, `help`, `?`, `save`, `quit`, `exit`
- **Noun capture**: `take sword` → `{ verb: 'take', noun: 'sword' }` etc.
- **Case insensitivity**: `NORTH`, `North`, `north` all → `{ verb: 'go', noun: 'north' }`
- **Extra whitespace**: `  go   north  ` → `{ verb: 'go', noun: 'north' }`

#### `theme.test.ts` (~15 cases)
**Functions**: `loadTheme`, `saveTheme`, `getTheme`

**Test cases**:
- `loadTheme`:
  - SSR (window undefined) → `'amber'`
  - No localStorage entry → `'amber'`
  - Valid entry (`'green'`) → `'green'`
  - Invalid entry (`'neon'`) → `'amber'`
- `saveTheme`:
  - SSR (no-op, no error)
  - Writes to localStorage
- `getTheme`:
  - `'amber'` → returns `{ id: 'amber', name: 'Amber', ... }`
  - Invalid ID → returns first theme (fallback)
  - All three themes exist in THEMES array

#### `npcs.test.ts` (~20 cases)
**Functions**: `getNPC`, `getRevenantDialogue`

**Test cases**:
- `getNPC`:
  - Valid NPC (`'old_mae'`) → returns full NPC object
  - Invalid NPC (`'fake'`) → returns undefined
  - All 8 NPCs exist (old_mae, patch, marshal_cross, deacon_harrow, the_wren, wren_shelter, wren_ruins, wren_wastes, wren_underground)
- `getRevenantDialogue`:
  - No entry for unknown NPC → null
  - Valid entry, cycle below minCycle → null
  - Valid entry, cycle meets minCycle → returns text
  - Multiple entries: highest eligible minCycle is returned
  - `wren_shelter` cycle 2+ → specific text
  - `old_mae` cycle 6+ → specific text

---

### Integration Tests

#### `inventory.test.ts` (~60 cases)
**Functions**: `getInventory`, `addItem`, `removeItem`, `equipItem`, `unequipItem`, `getEquipped`

**Setup**: Mock Supabase + mock `getItem()` to return item definitions

**Test cases**:
- `getInventory`:
  - Empty inventory → `[]`
  - Returns 3 items with conditions
  - Invalid item_id in DB → silently dropped
  - Order by item_id
- `addItem`:
  - New item → inserts row with quantity 1
  - Existing item → increments quantity
  - Custom quantity parameter honored
  - Error handling (selectError, insertError, updateError)
- `removeItem`:
  - Remove 1 from quantity 5 → quantity becomes 4
  - Remove 5 from quantity 5 → deletes row
  - Non-existent item → no-op
  - Error handling
- `equipItem`:
  - Equips target item
  - Unequips all other items of same type
  - Error if item doesn't exist in registry
  - Correct type matching
- `unequipItem`:
  - Sets equipped=false
  - No-op if already unequipped
- `getEquipped`:
  - Returns equipped weapon/armor
  - Returns null if nothing equipped of that type
  - Multiple equipped of same type → returns first found

---

#### `worldGen.test.ts` (~50 cases)
**Functions**: `generateWorld`, `generateSeed`, plus internal helpers

**Test cases**:
- **Determinism**:
  - `generateWorld(12345)` produces identical world when called twice
  - Different seeds produce different worlds (repeat 5 times)
  - Seed boundary: 0, 1, max int, negative (coerced to unsigned)
- **Structure**:
  - Returns array of Room objects
  - Exactly 5 zones generated (shelter, ruins, wastes, outpost, underground)
  - Each zone has 30–32 rooms (total 150–160)
  - First room in first zone is start room ("The Shelter")
  - Start room has fixed name, NPCs include 'old_mae'
- **Exits**:
  - Every room has exits object
  - Chaining works (room A → B via 'east', room B → A via 'west')
  - Bidirectional exits correct (opposite directions map)
  - No room has more than 6 exits (one per direction)
- **Room generation**:
  - Each room has name, description, shortDescription, zone, difficulty
  - Difficulty in zone template range
  - Names are 2–3 fragments + 1 location fragment
  - Descriptions are prose (not Lorem ipsum)
- **Reachability**:
  - BFS from start room visits all rooms (no islands)
  - Throws if islands would be created (e.g., disconnected zone)
  - No unreachable rooms
- **generateSeed**:
  - Returns number in range [0, 2147483647]
  - Each call is different (0.01% chance of collision is acceptable)

---

### Component Tests

#### `ThemePicker.test.tsx` (~20 cases)
**Props**: Likely `onThemeChange?: (themeId: ThemeId) => void`

**Test cases**:
- Renders all 3 theme options
- Theme name and tagline visible
- Color swatch renders correct hex
- Clicking theme calls `onThemeChange`
- Current theme shows as selected
- localStorage is updated on theme change (via spy)

#### `StatusBar.test.tsx` (~25 cases)
**Props**: `player: Player`, `roomName?: string`, `enemyCount?: number`

**Test cases**:
- Renders player HP bar
- Renders all 6 stats with correct modifiers
- Room name displays
- Enemy count badge shows when > 0
- HP bar color changes at 50%, 25% thresholds
- Stat display: "Vigor 8 (+3)" format
- Dead player state (HP 0)

#### `CharacterCreation.test.tsx` (~40 cases)
**Props**: `onCharacterCreated: (char: Player) => void`

**Test cases**:
- Renders all 7 classes
- Class name and description visible
- Clicking class selects it
- Stat slider (6 stats) responds to input
- Free points budget tracked (class.freePoints)
- Can't exceed free points
- Can't reduce stat below 2 (BASE)
- Can't exceed stat above 10 (reasonable cap)
- Submit button disabled until character valid
- Submit calls onCharacterCreated with correct Player shape
- Class bonus applied (e.g., Enforcer starts with Vigor +4)
- All stats sum correctly

---

## Mock Patterns & Utilities

### `tests/mocks/supabase.ts`
```typescript
export const createMockSupabaseClient = (overrides?: SupabaseOverrides) => {
  // Returns fully chainable mock with .select().eq().maybeSingle() etc.
}

export const mockInventoryRows = (playerId: string, items: InventoryRow[]) => {
  // Helper to set up mock Supabase with pre-populated inventory
}
```

### `tests/mocks/localStorage.ts`
```typescript
export const mockLocalStorage = () => {
  // Returns getItem/setItem/clear/removeItem mocks
}
```

### `tests/setup.ts`
```typescript
beforeEach(() => {
  vi.clearAllMocks()
  // Reset localStorage before each test
})

afterEach(() => {
  vi.restoreAllMocks()
})
```

---

## Test Execution & Coverage

**Run all tests**:
```bash
npm test
```

**Run specific suite**:
```bash
npm test spawn.test.ts
```

**Run with coverage**:
```bash
npm test -- --coverage
```

**Coverage targets**:
- Pure function modules (dice, spawn, parser, theme, npcs): **95%+**
- worldGen: **90%+** (reachability check is hard to cover; acceptable)
- inventory: **85%+** (Supabase chains are verbose; integration tests suffice)
- Components: **75%+** (user interaction subtlety; acceptable)

---

## Risk Mitigation

### High-Risk Areas Requiring Extra Care

**1. Spawn probability distributions** (spawn-pressure.test.ts)
- **Risk**: Weighted rolls might favor wrong entries; pressure scaling might be off
- **Mitigation**:
  - Test each distribution type (flat, weighted_low, weighted_high, bell) with 1000-iteration samples
  - Verify pressure modifier math (15% per level)
  - Test populateRoom with all combination of pressure + timeOfDay + noise

**2. World generation determinism** (worldGen.test.ts)
- **Risk**: Seeding failure = reproducibility breaks
- **Mitigation**:
  - Generate same seed 10 times, assert identical
  - Assert different seeds produce different worlds
  - Verify reachability on every generated world (BFS check)
  - Test boundary seeds (0, large numbers, negative)

**3. Parser edge cases** (parser.test.ts)
- **Risk**: User input chaos — ambiguous verbs, multi-word commands, weird whitespace
- **Mitigation**:
  - Test all verb categories (movement, combat, inventory, interaction, system)
  - Test multi-word surface forms explicitly
  - Test whitespace normalization
  - Test case-insensitivity
  - Test partial noun capture

**4. Supabase mocking fidelity** (inventory.test.ts)
- **Risk**: Mock doesn't match real Supabase API; tests pass locally, fail in production
- **Mitigation**:
  - Mock returns exact InventoryRow shapes
  - Mock error conditions (selectError, insertError)
  - Test chaining (.select().eq().maybeSingle())
  - Test both insert and update paths for addItem

---

## Dependencies & Installation

**Add to package.json**:
```json
{
  "devDependencies": {
    "vitest": "^1.6.0",
    "@vitest/ui": "^1.6.0",
    "@testing-library/react": "^15.0.0",
    "@testing-library/jest-dom": "^6.4.0",
    "jsdom": "^24.1.0",
    "vi": "latest"
  },
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Files to create**:
- `vitest.config.ts` — main config
- `tests/setup.ts` — global mocks
- `tests/mocks/supabase.ts` — Supabase mock factory
- `tests/mocks/localStorage.ts` — localStorage mocks
- `tests/unit/*.test.ts` — 6 pure function suites
- `tests/integration/*.test.ts` — 2 integration suites
- `tests/components/*.test.tsx` — 3 component suites

---

## Definition of Done

Every task in this plan is complete when:
- [ ] Code written and self-reviewed
- [ ] Tests written or updated for the changed logic
- [ ] `code-reviewer` passes with no blockers
- [ ] `test-runner` passes with no failures
- [ ] All test suites pass locally (`npm test`)
- [ ] Coverage targets met (95% pure functions, 90% worldGen, 85% inventory, 75% components)

---

## References

- **Vitest docs**: https://vitest.dev/
- **Testing Library (React)**: https://testing-library.com/react
- **Spawn probability**: [spawn.ts weighted distribution logic](lib/spawn.ts#L22-L32)
- **World generation seeding**: [worldGen.ts mulberry32 PRNG](lib/worldGen.ts#L13-L22)
- **Supabase client**: [createSupabaseBrowserClient](lib/supabase.ts)
- **Player types**: [types/game.ts Player interface](types/game.ts)
