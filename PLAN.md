# Plan: Tabbed Sidebar + Interactive World Map
_Created: 2026-04-24 | Type: New Feature_

## Goal

Replace the current flat `Sidebar.tsx` with a four-tab right pane (STATS | MAP | INV | DATA),
and replace the existing MiniMap with an SVG-based interactive world map tab that renders the
full 13-zone room graph, fog-of-war, danger overlay, and a click-to-inspect overlay modal.

## Background

The current right pane is a single scrollable stats block with a 5x5 ASCII mini-map that
shows only the current room's exits. It neither communicates the game's 271-room scope nor
survives the terminal's scroll buffer. Previous tab components (StatTab, InventoryTab, DataTab)
were built and then deleted in commit 8751cb2; their structure serves as a reference pattern
but they cannot be dropped in directly because the current `Player` shape, `InventoryItem`
interface, and game state fields have diverged.

The ASCII `map` terminal command (`handleMap` in `lib/actions/travel.ts`) calls
`renderZoneMap` from `lib/mapRenderer.ts`. The BFS placement logic in that file will be
factored into a new `lib/mapLayout.ts` helper that both the ASCII renderer and the new
SVG React component can call. The ASCII output must remain byte-identical after the refactor.

## Scope

**In scope:**
- Tabbed right pane with STATS, MAP, INV, DATA tabs
- `TabBar.tsx` with PipBoy amber styling, ARIA tablist/tab roles, arrow-key keyboard navigation
- `StatsTab.tsx` extracting current Sidebar stats content
- `WorldMapTab.tsx`: SVG grid, zone colors, fog-of-war, danger overlay, Reveal All toggle,
  Center on Player button, hover tooltips, click-to-inspect overlay modal
- `InventoryTab.tsx`: equipped weapon/armor with traits, currency, items grouped by type
- `DataTab.tsx`: faction reputation, quest flags, cycle history, discovered enemies count
- `lib/mapLayout.ts` factoring BFS out of `lib/mapRenderer.ts`
- `data/zoneMetadata.ts` with label, color, dangerTier for all 13 zones
- Deletion of `components/MiniMap.tsx`
- Unit tests: `mapLayout.test.ts` (H2), `worldMapTab.test.tsx` (H3)

**Out of scope:**
- CMD tab
- Click-to-fast-travel from the map
- Faction or biome overlays beyond dangerTier
- Mobile/touch polish
- Persistence of tab selection across reload
- Feature flag (`NEXT_PUBLIC_FEATURE_WORLD_MAP`) — the new map is unconditional
- ARIA focus-trap on the overlay modal (H3 must restore focus to triggering cell on close,
  but full focus-trap is out of scope)
- Tests for visual styling / color correctness
- Any changes to `lib/actions/travel.ts` or `handleMap` logic

**Ambiguities resolved:**
- Default tab on mount: STATS (no persistence)
- Overlay modal for map room clicks: centered on top of the map, not a side panel
- MiniMap.tsx: deleted by H1; no import of it survives anywhere
- No feature flag: new map is the only map
- Tab props contract: each tab receives no props; reads `useGame()` internally

## Type Dependencies

- `ZoneType` in `types/game.ts` — used by H2 (zoneMetadata), H3 (WorldMapTab)
- `Room` in `types/game.ts` — used by H2 (mapLayout), H3 (WorldMapTab)
- `GameState` in `types/game.ts` — used by H1, H3, H4, H5 (all tab components via useGame)
- `PlayerLedger.discoveredRoomIds: string[]` in `types/game.ts` — used by H3
- `InventoryItem` (equipped: boolean, item: Item) in `types/game.ts` — used by H4
- `FactionType`, `ReputationLevel` in `types/game.ts` — used by H5
- `Player.questFlags`, `Player.factionReputation`, `Player.cycle`, `Player.totalDeaths`
  in `types/game.ts` — used by H5
- `PlayerLedger.cycleHistory: CycleSnapshot[]` in `types/game.ts` — used by H5

Note: `lib/mapLayout.ts` is shared infrastructure — `lib/mapRenderer.ts` imports it and
H3's `WorldMapTab.tsx` imports it. H2 must land this file before H3 can finalize its import.

## Architecture

```
GameLayout (unchanged)
  └─ Sidebar.tsx [H1 rewrites]
       ├─ TabBar.tsx [H1 creates]  — renders STATS | MAP | INV | DATA tabs
       ├─ StatsTab.tsx [H1 creates] — HP bar, stats, location, time, pressure, combat
       ├─ WorldMapTab.tsx [H3 creates] — SVG map, toggles, overlay modal
       ├─ InventoryTab.tsx [H4 creates] — equipped, currency, inventory by type
       └─ DataTab.tsx [H5 creates] — factions, quests, cycles, enemies
```

Data flow: all tab components call `useGame()` directly. No props passed down from Sidebar.

Map data flow (H2 → H3):
```
lib/mapLayout.ts (H2)
  ├─ imported by lib/mapRenderer.ts (H2 refactors)  → terminal `map` command unchanged
  └─ imported by components/tabs/WorldMapTab.tsx (H3) → SVG render
data/zoneMetadata.ts (H2)
  └─ imported by components/tabs/WorldMapTab.tsx (H3) → zone colors + danger tiers
```

## File Ownership Matrix

| Howler | Creates | Modifies | Deletes |
|--------|---------|----------|---------|
| H1 | `components/tabs/TabBar.tsx`, `components/tabs/StatsTab.tsx` | `components/Sidebar.tsx` | `components/MiniMap.tsx` |
| H2 | `lib/mapLayout.ts`, `data/zoneMetadata.ts`, `tests/unit/mapLayout.test.ts` | `lib/mapRenderer.ts` | — |
| H3 | `components/tabs/WorldMapTab.tsx`, `tests/unit/worldMapTab.test.tsx` | — | — |
| H4 | `components/tabs/InventoryTab.tsx` | — | — |
| H5 | `components/tabs/DataTab.tsx` | — | — |

No file appears in two Howlers. H1 owns all of `components/Sidebar.tsx`; H3/H4/H5 do not
touch it. H2 is the only writer of `lib/mapRenderer.ts`.

---

## H1 — Tab Shell + StatsTab

**Owned files:** `components/Sidebar.tsx` (rewrite), `components/tabs/TabBar.tsx` (create),
`components/tabs/StatsTab.tsx` (create), `components/MiniMap.tsx` (delete)

### TabBar.tsx

- Props: `tabs: string[]`, `active: string`, `onChange: (tab: string) => void`
- Renders a `<div role="tablist">` with one `<button role="tab">` per tab label
- Active tab: `text-amber-400 border-b-2 border-amber-400`
- Inactive tab: `text-amber-700 hover:text-amber-500`
- Full-width bar, equal width tabs, PipBoy amber palette, `font-mono text-xs tracking-widest`
- Arrow-key keyboard navigation: `ArrowRight` / `ArrowLeft` cycle through tabs; `Home`/`End`
  jump to first/last; `Enter`/`Space` activate focused tab
- Each button: `aria-selected={active === tab}`, `tabIndex={active === tab ? 0 : -1}`
- Tab IDs: `'stats'`, `'map'`, `'inv'`, `'data'`

### StatsTab.tsx

Extract verbatim from current `Sidebar.tsx` content:
- HP bar block (`buildHpBar` helper, `hpColor` from `lib/ansiColors`, `player.hp/maxHp`)
- LV + XP line
- Location block: zone (formatted), room name in `text-green-400`
- Exits line: direction initials in `text-green-400`
- Time of day block (uses `getTimeOfDay` from `lib/gameEngine`)
- Hollow pressure block (color thresholds: ≥7 red, ≥4 yellow, else gray)
- Combat indicator block (if `combatState?.active`)
- Cycle line
- No MiniMap import; that widget is gone

### Sidebar.tsx (rewritten)

- Local `useState<'stats' | 'map' | 'inv' | 'data'>('stats')`
- Renders: title bar `THE REMNANT`, `<TabBar>`, then one tab component based on active state
- Imports: `TabBar`, `StatsTab`, `WorldMapTab`, `InventoryTab`, `DataTab` (lazy is fine but
  not required)
- Removes all existing stats rendering (moved to StatsTab) and MiniMap import/render
- `bg-gray-950 h-full font-mono text-xs flex flex-col` outer container (unchanged)

### MiniMap.tsx deletion

Remove the file. Verify no other file imports it besides Sidebar.tsx before deleting.

**Tests:** No new unit tests required for H1 (tab switching is covered by H3's render tests
using the Sidebar shell). H1 must confirm `grep -r MiniMap components/` returns zero results
after deletion.

**Effort:** M

**Pre-mortem:** If this task fails or takes 3x longer it will be because: the `tabs/`
subdirectory does not exist yet and `mkdir` requires explicit creation, or the deleted
`StatTab.tsx` git reference has a different stat block shape than what currently lives in
`Sidebar.tsx` causing a re-extraction mismatch.

---

## H2 — Map Foundation

**Owned files:** `lib/mapLayout.ts` (create), `lib/mapRenderer.ts` (modify),
`data/zoneMetadata.ts` (create), `tests/unit/mapLayout.test.ts` (create)

### lib/mapLayout.ts

Export these exact signatures (frozen — H3 depends on them):

```ts
export interface LayoutResult {
  positions: Map<string, { x: number; y: number }>  // roomId -> grid coords
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
}

export function computeLayout(
  rooms: Room[],
  anchorRoomId: string,
  visitedIds: Set<string>,
  radius?: number,  // default 10
): LayoutResult
```

The function body is the BFS placement algorithm currently inlined in `renderZoneMap`
(lines 44–99 of `lib/mapRenderer.ts`). Extract it exactly. The only change: the radius cap
becomes the `radius` parameter (default 10 matches the current `MAX_GRID_RADIUS = 7` only
for the ASCII renderer — H2 passes `7` explicitly when calling from mapRenderer so the ASCII
output is unchanged).

**Critical:** `computeLayout` must produce `positions` using absolute coordinate values
(not normalized to 0-based). `lib/mapRenderer.ts` currently normalizes in step 3; that
normalization stays in the renderer, not in `computeLayout`. The `bounds` field gives the
renderer what it needs to compute offsets.

### lib/mapRenderer.ts (refactored)

- Import `computeLayout` from `lib/mapLayout.ts`
- Replace the BFS block (lines 44–99) with: `const { positions, bounds } = computeLayout(rooms, currentRoomId, visitedRoomIds, 7)`
- Replace the bounds-computation block (lines 93–99) with reads from `bounds.minX` etc.
- Replace the normalization block (lines 101–108) with a loop over `positions` applying the
  same `x - minX, y - minY` offset formula
- All downstream rendering logic (steps 4–7) stays unchanged
- ASCII output must be byte-identical to pre-refactor for the same inputs (verified by H2's
  regression test below)

### data/zoneMetadata.ts

```ts
export interface ZoneMeta {
  label: string
  color: string      // Tailwind class (text-* or fill-*), PipBoy-safe only
  dangerTier: number // 1–5
}
export const ZONE_META: Record<ZoneType, ZoneMeta>
```

`dangerTier` for each zone = `max(room.difficulty)` across all rooms in that zone, computed
once at module load by importing `ALL_ROOMS` from `data/rooms/index`. Color palette
constraint: only use amber, red, green, blue, cyan, orange Tailwind classes. No purple, pink,
indigo, violet, or custom hex. Suggested assignments (H2 may adjust, but must stay in palette):

| Zone | Suggested color class | Expected danger tier |
|------|-----------------------|---------------------|
Suggested palette (verify dangerTier against actual room difficulty in `data/rooms/`):
crossroads→amber-400, river_road→green-500, covenant→blue-400, salt_creek→cyan-500,
the_ember→orange-500, the_breaks→amber-600, the_dust→amber-500, the_stacks→cyan-400,
duskhollow→blue-500, the_deep→blue-600, the_pine_sea→green-400, the_scar→red-500,
the_pens→red-400. H2 adjusts as needed; palette constraint (no purple/pink/indigo/violet)
must hold.

### tests/unit/mapLayout.test.ts

Minimum coverage:
1. A 3-room chain (A→B→C via north exits) produces positions where B.y = A.y - 1 and
   C.y = A.y - 2 (or equivalent relative offsets).
2. A room beyond `radius` is excluded from positions.
3. An unvisited room that is a neighbor of the anchor room is still placed (BFS expands
   from the anchor unconditionally for the first hop).
4. **Regression test for byte-identical ASCII output:** snapshot or string-comparison
   test of `renderZoneMap` output against a known-good fixture for a minimal 3-room
   crossroads slice, run before and after the refactor commit.

**Effort:** M

**Pre-mortem:** If this task fails or takes 3x longer it will be because: the BFS in
mapRenderer.ts uses `coordByRoomId` and `roomIdAtCoord` as paired structures; splitting
them out without also carrying the conflict-detection logic (`roomIdAtCoord.has(key)` check)
will corrupt the layout for rooms with multiple paths. H2 must carry both maps into
`computeLayout` — only the result positions are exposed in `LayoutResult`.

---

## H3 — WorldMapTab

**Owned files:** `components/tabs/WorldMapTab.tsx` (create),
`tests/unit/worldMapTab.test.tsx` (create)

**Reads from H2 (frozen before dispatch):**
- `computeLayout(rooms, anchorRoomId, visitedIds, radius?)` from `lib/mapLayout.ts`
- `ZONE_META: Record<ZoneType, ZoneMeta>` from `data/zoneMetadata.ts`

### WorldMapTab.tsx

State:
- `fogOfWar: boolean` — default true
- `dangerOverlay: boolean` — default true
- `revealAll: boolean` — default false
- `selectedRoomId: string | null` — default null (drives overlay modal)
- `lastClickedCell: HTMLElement | null` — for focus restore on modal close

Data reads via `useGame()`:
- `state.currentRoom` — current room (null-safe)
- `state.ledger` — for `ledger.discoveredRoomIds: string[]` (null-safe)

If either is null: render `<div className="text-amber-600 text-xs p-3">Loading world...</div>`.

Layout:
- Import `ALL_ROOMS` from `data/rooms/index`
- Build `visitedIds = new Set(ledger.discoveredRoomIds)` plus `state.currentRoom.id`
- Call `computeLayout(ALL_ROOMS, state.currentRoom.id, visitedIds, 10)`
- Render an SVG sized to `(maxX - minX + 1) * CELL` by `(maxY - minY + 1) * CELL`
  where `CELL = 20` px
- Each room = `<rect>` 16×16px centered in its 20×20 cell
- Zone color: derive from `ZONE_META[room.zone].color`; strip the `text-` prefix and
  convert to SVG fill (e.g. `text-amber-400` → look up the Tailwind v4 hex, or maintain
  a small parallel `SVG_ZONE_COLORS` map of hex values alongside `ZONE_META`). H3 owns
  this implementation detail; using a hex lookup map keyed on ZoneType is acceptable.
- Fog of war: if `fogOfWar && !revealAll`, unvisited rooms are hidden (`display:none` or
  opacity 0). If `revealAll`, all rooms render but unvisited rooms render at opacity 0.3.
- Danger overlay: if `dangerOverlay`, zones with `dangerTier >= 4` get a red-tinted stroke
  (`stroke="rgba(239,68,68,0.5)"`) on their room rects.
- Current room: `stroke="#f59e0b" stroke-width="2"` plus a CSS pulse animation class
  (`animate-pulse` Tailwind).
- Connectors: for each pair of adjacent rooms (east/west, north/south), draw a `<line>`
  only where a real exit exists between them. Check `room.exits[dir] === neighborId`.
- Hover tooltip: `<title>` child inside each `<g>` wrapping the room rect — text:
  `"Room Name — Zone Label"`.
- Click a visited room: set `selectedRoomId = roomId`. Store ref to the clicked SVG element
  for focus restore.
- Click an unvisited room (only reachable when `revealAll` is on): set `selectedRoomId` to
  show `"Unknown — visit to reveal."` modal.

Controls row above SVG: `[FOG OF WAR]`, `[DANGER OVERLAY]`, `[REVEAL ALL]`, `[CENTER]`
buttons. Styling: `text-amber-400 border border-amber-800 px-2 py-0.5 font-mono text-xs`;
active toggle: `bg-amber-900`.

Overlay modal (when `selectedRoomId !== null`):
- Backdrop: `fixed inset-0 bg-black/60` with `onClick={() => closeModal()}`
- Modal: `absolute centered` (use flex center on the SVG wrapper), `bg-gray-950 border
  border-amber-600 p-3 font-mono text-xs text-amber-400 min-w-48 max-w-64`
- Content for visited room: room name, zone label, `shortDescription`, exits list,
  NPC names (from `room.npcs`), item count (`room.items.length`)
- Content for unvisited room: `"Unknown — visit to reveal."` + zone label
- Close: X button (`aria-label="Close"`) in top-right corner + backdrop click
- On close (`closeModal`): `selectedRoomId = null`, restore focus to the triggering element

### tests/unit/worldMapTab.test.tsx

Minimum coverage:
1. Renders `"Loading world..."` when `state.ledger` is null.
2. With a minimal 2-room game state, renders without crashing and shows the current room.
3. Fog toggle: after clicking `[FOG OF WAR]` to turn off fog, previously-hidden unvisited
   room rects become visible.
4. Clicking a visited room rect opens the overlay modal with that room's name.
5. Clicking the backdrop closes the modal.

**Effort:** L

**Pre-mortem:** If this task fails or takes 3x longer it will be because: converting
Tailwind class names to SVG fill hex values requires a parallel color map that isn't
automatically generated. If H3 embeds a hardcoded `SVG_COLORS` map of ZoneType → hex,
it will work but the colors must be verified manually against the Tailwind v4 palette.
Risk two: JSDOM in vitest does not support SVG `animate-pulse` or `<title>` tooltips —
tests must avoid asserting on CSS animation classes and `<title>` text lookups.

---

## H4 — InventoryTab

**Owned files:** `components/tabs/InventoryTab.tsx` (create)

**Reference:** `git show 8751cb2^:components/tabs/InventoryTab.tsx` (146 lines) — use for
structural patterns only. The old version had save/theme-picker logic and `stash`; this
rebuild strips those (save/theme are out of scope for this convoy).

**Reads via `useGame()`:**
- `state.player` (null-safe guard at top)
- `state.inventory: InventoryItem[]` — each item has `equipped: boolean`, `item: Item`,
  `quantity: number`

Sections in render order:
1. **Equipped weapon** — `inventory.find(ii => ii.equipped && ii.item.type === 'weapon')`.
   Show: item name, `item.damage` stat, each `item.weaponTraits` (imported from
   `@/types/traits` as `WEAPON_TRAITS` for trait display names).
2. **Equipped armor** — same pattern, `item.defense`, `item.armorTraits` via `ARMOR_TRAITS`.
3. **Currency** — items with `type === 'currency'`. Label: `"ROUNDS"`.
4. **All other inventory items** — grouped by `item.type` (consumable, weapon/not equipped,
   armor/not equipped, key, junk, lore). Each group has a heading. Within group: name,
   quantity (if > 1), equipped badge `[eq]`.

Styling: `text-amber-400`, section headings `text-amber-600 text-xs uppercase tracking-widest`.
No `any`. No off-brand colors.

If `!player`: return null.

**Tests:** None new required (covered by H3's broader render test environment). H4 should
run `tsc --noEmit` locally to confirm no type errors before reporting done.

**Effort:** S

**Pre-mortem:** If this task fails or takes 3x longer it will be because: `WEAPON_TRAITS`
and `ARMOR_TRAITS` from `@/types/traits` may not have a display name field — H4 must check
the traits type file before referencing it and fall back to stringifying the trait ID if
no display name exists.

---

## H5 — DataTab

**Owned files:** `components/tabs/DataTab.tsx` (create)

**Reference:** `git show 8751cb2^:components/tabs/DataTab.tsx` (287 lines) — structural
reference only. The old DataTab imported `ExplorationProgress` and `getEnemy/ENEMIES`.
This rebuild uses: `factionReputation`, `questFlags`, cycle data from `ledger`, and
`ledger.discoveredEnemies`.

**Reads via `useGame()`:**
- `state.player.factionReputation?: Partial<Record<FactionType, number>>`
- `state.player.questFlags?: Record<string, string | boolean | number>`
- `state.player.cycle`
- `state.player.totalDeaths`
- `state.ledger.discoveredEnemies?: string[]`
- `state.ledger.cycleHistory?: CycleSnapshot[]`
- `state.currentRoom` (for current room name in cycle echo preview)

Null-safe guard: if `!state.player` return null. If `!state.ledger` skip ledger sections.

Sections in render order:
1. **Faction Reputation** — iterate `ALL_FACTIONS` (the 9 faction IDs from `types/game.ts`).
   For each, show: faction display name, reputation label (Hunted/Hostile/Wary/Unknown/
   Recognized/Trusted/Blooded), a 7-pip bar (`-3..+3`).
   Colors: negative = `text-red-400`, zero = `text-gray-500`, positive = `text-amber-400`.
2. **Quest Flags** — filter `questFlags` to entries where value is not `false` and not `null`.
   Show key (formatted: replace underscores with spaces, title case) and value. Group under
   heading `PROGRESS`. If empty: `"No flags set."`.
3. **Cycle History** — `ledger.cycleHistory` length = total cycles completed. Show:
   current cycle number, total deaths, most recent `CycleSnapshot.questsCompleted` count
   as "last cycle quests". If no history: `"First cycle."`.
4. **Discovered Enemies** — `ledger.discoveredEnemies?.length ?? 0` count.
   Label: `"ENEMIES ENCOUNTERED"`.

Styling: same amber palette as other tabs. No `any`. No off-brand colors.

**Tests:** None new required. H5 must run `tsc --noEmit` locally before reporting done.

**Effort:** S

**Pre-mortem:** If this task fails or takes 3x longer it will be because: `questFlags`
has type `Record<string, string | boolean | number>` — filtering out `false` values is
straightforward, but some flags may be `0` (falsy) and should still display. H5 must
filter on `value !== false && value !== null && value !== undefined`, not `if (value)`.

---

## H2 → H3 Coordination

H3 depends on two H2 exports. These signatures are frozen before dispatch and must not
change. H3 can stub `computeLayout` and `ZONE_META` locally during development. H3 must replace
stubs with real imports in the final commit. Gold should merge H2 before H3 in the
post-Howler integration step.

---

## Risks

1. **BFS factoring changes ASCII `map` output.** The `coordByRoomId` + `roomIdAtCoord`
   pair in `renderZoneMap` must both be carried into `computeLayout`. If only `coordByRoomId`
   is exposed and `roomIdAtCoord` (the conflict-detection map) is dropped, collision handling
   breaks and the grid layout shifts. Mitigation: H2 writes a regression test that snapshots
   ASCII output before and after the refactor on a fixed 3-room input.

2. **Zone color palette clash with PipBoy amber.** H2 is responsible for verifying all 13
   `color` values in `ZONE_META` are amber/red/green/blue/cyan/orange Tailwind classes.
   H3 is responsible for verifying the SVG hex equivalents look correct against the
   `bg-gray-950` background. No purple, pink, indigo, or violet. No raw hex in `ZONE_META`.

3. **Overlay modal focus management.** H3 must store a ref to the SVG `<g>` or `<rect>`
   element that was clicked before opening the modal, and call `.focus()` on it in the
   `closeModal` function. The SVG elements need `tabIndex={0}` to be focusable.
   Failure mode: screen-reader users lose their position in the map after closing a modal.

4. **Tab keyboard navigation regression.** `TabBar.tsx` must handle `ArrowLeft`/`ArrowRight`
   key events on `role="tablist"`. The `tabIndex` roving pattern (0 on active, -1 on others)
   must be correct. Failure mode: keyboard users cannot navigate between tabs, which breaks
   the ARIA contract.

5. **`components/tabs/` directory does not exist.** H1 creates this directory. H3, H4, H5
   work in the same directory. Gold's SPLIT.md must note that H1's directory creation is not
   a file conflict — the directory itself is the only shared structure, and subdirectory
   creation is idempotent in git (dirs are implicit). No conflict expected.

---

## Acceptance Criteria

### Per-Howler

**H1:**
- [ ] `components/Sidebar.tsx` renders `<TabBar>` and one of the four tab components based
  on local state; defaults to `'stats'`
- [ ] `components/tabs/TabBar.tsx` passes ARIA contract: `role="tablist"`, `role="tab"`,
  `aria-selected`, roving `tabIndex`, arrow-key navigation
- [ ] `components/tabs/StatsTab.tsx` shows all stats visible in the current `Sidebar.tsx`
  (HP bar, LV/XP, cycle, location, zone, exits, time, hollow pressure, combat indicator)
- [ ] `components/MiniMap.tsx` is deleted; `grep -r 'MiniMap' components/` returns zero hits

**H2:**
- [ ] `lib/mapLayout.ts` exports `computeLayout` with the exact signature above
- [ ] `lib/mapLayout.ts` exports `LayoutResult` interface
- [ ] `lib/mapRenderer.ts` calls `computeLayout` and produces byte-identical ASCII output
  to pre-refactor (verified by regression test in `tests/unit/mapLayout.test.ts`)
- [ ] `data/zoneMetadata.ts` exports `ZONE_META` with entries for all 13 `ZoneType` values
- [ ] All color values in `ZONE_META` are PipBoy-safe Tailwind classes (no custom hex,
  no purple/pink/indigo/violet)
- [ ] `tests/unit/mapLayout.test.ts` passes (3-room chain test + radius cap test)

**H3:**
- [ ] `components/tabs/WorldMapTab.tsx` renders `"Loading world..."` when `state.ledger`
  is null or `state.currentRoom` is null — no crash
- [ ] SVG renders visited rooms at full color, unvisited rooms hidden when `fogOfWar` is on
- [ ] Toggling `Fog of War` off reveals unvisited rooms at 0.3 opacity
- [ ] Toggling `Reveal All` on overrides fog and shows all rooms
- [ ] Clicking a visited room opens overlay modal with room name visible
- [ ] Clicking backdrop or X closes modal
- [ ] Current room has pulse/ring indicator
- [ ] `tests/unit/worldMapTab.test.tsx` passes (5 tests listed in H3 spec)

**H4:**
- [ ] `components/tabs/InventoryTab.tsx` renders without crashing when `state.player` is null
- [ ] Equipped weapon section shows weapon name and damage
- [ ] Equipped armor section shows armor name and defense
- [ ] Currency (rounds) shown separately from other items
- [ ] Items grouped by type with section headings
- [ ] No `any`, no off-brand colors, `tsc --noEmit` clean

**H5:**
- [ ] `components/tabs/DataTab.tsx` renders faction reputation for all 9 factions
- [ ] Quest flags show only non-false, non-null entries
- [ ] Cycle history section shows current cycle + total deaths
- [ ] `value !== false && value !== null` filter (not truthy filter) applied to quest flags
- [ ] No `any`, no off-brand colors, `tsc --noEmit` clean

### Integration (all Howlers complete)

- [ ] All 1215 existing tests still pass (`pnpm test`)
- [ ] `npx tsc --noEmit` clean — zero new errors
- [ ] `handleMap` terminal command produces byte-identical ASCII output pre/post refactor
- [ ] Sidebar renders all four tabs; default is STATS on fresh mount
- [ ] `components/MiniMap.tsx` is gone; no file in the repo imports it
- [ ] World map replaces old map experience — no feature flag, no dead code path
- [ ] `data/zoneMetadata.ts` covers all 13 zones with no missing keys
- [ ] Overlay modal closes on backdrop click and X button; focus returns to triggering element

## Open Questions

None. All decisions are locked per the brief.

## Definition of Done

- [ ] All five Howlers have completed their owned files
- [ ] H2 merged before H3 in integration (mapLayout.ts must exist when WorldMapTab.tsx imports it)
- [ ] All per-Howler acceptance criteria met
- [ ] All integration acceptance criteria met
- [ ] `pnpm test` passes (1215+ tests, zero regressions)
- [ ] `npx tsc --noEmit` clean
- [ ] PR opened with any coverage gaps noted in description
