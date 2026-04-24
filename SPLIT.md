# SPLIT: tabs-worldmap-0425
_Date: 2026-04-24 | Branch: dev/tabs-worldmap-0425_
_Base commit (all Howlers): `0a3698241e9c56fbd2ac32f97d3124eff01ef1a5`_

---

## File Ownership Matrix

| Howler | Creates | Modifies | Deletes |
|--------|---------|----------|---------|
| H1 | `components/tabs/TabBar.tsx`, `components/tabs/StatsTab.tsx` | `components/Sidebar.tsx` | `components/MiniMap.tsx` |
| H2 | `lib/mapLayout.ts`, `data/zoneMetadata.ts`, `tests/unit/mapLayout.test.ts` | `lib/mapRenderer.ts` | — |
| H3 | `components/tabs/WorldMapTab.tsx`, `tests/unit/worldMapTab.test.tsx` | — | — |
| H4 | `components/tabs/InventoryTab.tsx` | — | — |
| H5 | `components/tabs/DataTab.tsx` | — | — |

---

## Worktree Locations

| Howler | Worktree path | Branch |
|--------|--------------|--------|
| H1 | `/tmp/remnant-worktrees/tabs-worldmap-h1` | `parallel/tabs-worldmap-0425/h1` |
| H2 | `/tmp/remnant-worktrees/tabs-worldmap-h2` | `parallel/tabs-worldmap-0425/h2` |
| H3 | `/tmp/remnant-worktrees/tabs-worldmap-h3` | `parallel/tabs-worldmap-0425/h3` |
| H4 | `/tmp/remnant-worktrees/tabs-worldmap-h4` | `parallel/tabs-worldmap-0425/h4` |
| H5 | `/tmp/remnant-worktrees/tabs-worldmap-h5` | `parallel/tabs-worldmap-0425/h5` |

---

## Per-Howler Scope

### H1 — Tab Shell + StatsTab
Scope: Rewrite `Sidebar.tsx` to a tabbed container; create `TabBar.tsx` and `StatsTab.tsx`; delete `MiniMap.tsx`.

Owned files:
- CREATE `components/tabs/TabBar.tsx`
- CREATE `components/tabs/StatsTab.tsx`
- MODIFY `components/Sidebar.tsx`
- DELETE `components/MiniMap.tsx`

Reference: PLAN.md §H1. The `components/tabs/` subdirectory does not exist in the base commit — H1 must create it with `mkdir -p`. Directory creation is idempotent in git; H3/H4/H5 working in the same directory is not a conflict.

Notes:
- Verify `grep -r MiniMap components/` returns zero hits after deletion
- No new unit tests required for H1 (tab switching exercised by H3's render tests)
- `TabBar.tsx` props contract: `tabs: string[]`, `active: string`, `onChange: (tab: string) => void`
- `StatsTab.tsx` reads all state via `useGame()` — no props

---

### H2 — Map Foundation
Scope: Extract BFS from `mapRenderer.ts` into `mapLayout.ts`; create `zoneMetadata.ts` and `mapLayout.test.ts`.

Owned files:
- CREATE `lib/mapLayout.ts`
- CREATE `data/zoneMetadata.ts`
- CREATE `tests/unit/mapLayout.test.ts`
- MODIFY `lib/mapRenderer.ts`

Reference: PLAN.md §H2.

Frozen exports (H3 depends on these — must not change after H2 lands):
```ts
export interface LayoutResult {
  positions: Map<string, { x: number; y: number }>
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
}

export function computeLayout(
  rooms: Room[],
  anchorRoomId: string,
  visitedIds: Set<string>,
  radius?: number,  // default 10
): LayoutResult

export interface ZoneMeta {
  label: string
  color: string      // Tailwind class only — no hex
  dangerTier: number // 1–5
}
export const ZONE_META: Record<ZoneType, ZoneMeta>
```

Critical: `computeLayout` returns absolute coordinates (not normalized). The normalization step (`x - minX`, `y - minY`) stays inside `lib/mapRenderer.ts`. Pass `radius=7` when calling from the renderer to preserve byte-identical ASCII output.

---

### H3 — WorldMapTab
Scope: Create `WorldMapTab.tsx` SVG world map component with fog-of-war, danger overlay, controls, overlay modal, and unit tests.

Owned files:
- CREATE `components/tabs/WorldMapTab.tsx`
- CREATE `tests/unit/worldMapTab.test.tsx`

Reference: PLAN.md §H3.

Dependency on H2: H3 imports `computeLayout` from `lib/mapLayout.ts` and `ZONE_META` from `data/zoneMetadata.ts`. These signatures are frozen before dispatch (see H2 section above). During development, H3 stubs both locally:

```ts
// Stub — replace with real imports in final commit
import type { LayoutResult } from '../lib/mapLayout'
function computeLayout(...): LayoutResult { /* stub */ }
const ZONE_META: Record<ZoneType, ZoneMeta> = { /* stub */ }
```

H3 MUST replace stubs with real imports (`from 'lib/mapLayout'` and `from 'data/zoneMetadata'`) in its final commit. H2 must be merged to the feature branch before H3's final commit can be validated.

---

### H4 — InventoryTab
Scope: Create `InventoryTab.tsx` with equipped weapon/armor, currency, and grouped inventory sections.

Owned files:
- CREATE `components/tabs/InventoryTab.tsx`

Reference: PLAN.md §H4. Structural reference: `git show 8751cb2^:components/tabs/InventoryTab.tsx` (strip save/theme/stash logic).

No new unit tests required. H4 must run `tsc --noEmit` and confirm zero errors before reporting done.

---

### H5 — DataTab
Scope: Create `DataTab.tsx` with faction reputation, quest flags, cycle history, and discovered enemies sections.

Owned files:
- CREATE `components/tabs/DataTab.tsx`

Reference: PLAN.md §H5. Structural reference: `git show 8751cb2^:components/tabs/DataTab.tsx` (strip `ExplorationProgress`/`getEnemy`/`ENEMIES` dependencies).

No new unit tests required. H5 must run `tsc --noEmit` and confirm zero errors before reporting done.

Note on quest flag filtering: use `value !== false && value !== null && value !== undefined` — not a truthy check. `0` values must display.

---

## Cross-Howler Dependency

H3 depends on H2's frozen exported signatures:
- `computeLayout` + `LayoutResult` from `lib/mapLayout.ts`
- `ZONE_META` + `ZoneMeta` from `data/zoneMetadata.ts`

These are locked before dispatch and must not change after H2 lands. H3 stubs them locally and replaces with real imports at final commit.

**No other cross-Howler dependencies.** H1/H4/H5 are fully independent of each other and of H2/H3. H4 and H5 only need the `components/tabs/` directory to exist (H1 creates it; idempotent).

---

## Integration Order

H1, H2, H4, H5 may merge in any order.
H3 must merge after H2 (so `lib/mapLayout.ts` and `data/zoneMetadata.ts` exist when H3's stubs are replaced).

---

## Conflict Audit

Union of all owned files across all Howlers:

```
components/tabs/TabBar.tsx          → H1 only
components/tabs/StatsTab.tsx        → H1 only
components/Sidebar.tsx              → H1 only
components/MiniMap.tsx              → H1 only (delete)
lib/mapLayout.ts                    → H2 only
data/zoneMetadata.ts                → H2 only
tests/unit/mapLayout.test.ts        → H2 only
lib/mapRenderer.ts                  → H2 only
components/tabs/WorldMapTab.tsx     → H3 only
tests/unit/worldMapTab.test.tsx     → H3 only
components/tabs/InventoryTab.tsx    → H4 only
components/tabs/DataTab.tsx         → H5 only
```

Result: **no file overlap.** Every file appears in exactly one Howler's ownership column.

Shared directory note: `components/tabs/` is created by H1 and written into by H3/H4/H5. Directory creation is not a file conflict — git tracks files, not directories. Each Howler writes distinct files within that directory.
