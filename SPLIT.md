# SPLIT: post-tabs-followup-0424

Base commit: `adbb1423fc83cc816ae26193bc7f482f062b1335`
Branch: `dev/tabs-worldmap-0425`
Plan: `PLAN.md` (written 2026-04-24)

---

## H1 — Interactive-element color convention

**Scope**: Unify all interactive-entity colors to `text-cyan-400` across `lib/ansiColors.ts` and
the four sidebar tab components. Retire `text-green-400` and `text-yellow-400` from interactive
entity rendering.

### Files

| Action | File |
|--------|------|
| MODIFY | `lib/ansiColors.ts` |
| MODIFY | `components/tabs/StatsTab.tsx` _(lines 25–130 range — color classes only)_ |
| MODIFY | `components/tabs/WorldMapTab.tsx` |
| MODIFY | `components/tabs/InventoryTab.tsx` |
| MODIFY | `components/tabs/DataTab.tsx` _(audit-only; no change expected unless interactive entity display found)_ |

### Notes

- Change `TAG_COLOR.exit` from `text-green-400` → `text-cyan-400`.
- Change `TAG_COLOR.item` from `text-yellow-400` → `text-cyan-400`.
- `TAG_COLOR.npc` is already `text-cyan-400` — no change needed.
- Do NOT touch `text-green-400` used for HP-bar healthy state.
- Do NOT touch `text-yellow-400` for currency display.
- Do NOT touch `text-amber-*` used for UI chrome (borders, headers, section labels).
- `lib/ansiColors.ts` is FROZEN for all other Howlers once H1 merges.
- Verify pass: `npx tsc --noEmit` + `pnpm test --run`.
- Depends on: nothing.

---

## H2 — Map rendering bug fix + regression test

**Scope**: Fix `lib/gameEngine.ts:728` where `_setState({ ledger: null })` discards the
`player_ledger` row just upserted, causing `WorldMapTab.tsx` to display "Loading world..."
forever for new characters. Add an integration test asserting `state.ledger` shape after
`createCharacter`.

### Files

| Action | File |
|--------|------|
| MODIFY | `lib/gameEngine.ts` |
| CREATE | `tests/integration/createCharacterLedger.test.ts` |

### Notes

- Construct `PlayerLedger` inline from upsert values in `createCharacter`; no new DB query.
- Required fields: `playerId` (from `user.id`), `worldSeed` (from `seed`), `currentCycle: 1`,
  `pressureLevel: 1`, `totalDeaths: 0`, `discoveredRoomIds: []`, `discoveredEnemies: []`,
  `squirrelAlive: true`, `squirrelTrust: 0`, `squirrelCyclesKnown: 0`.
- Cross-check `types/game.ts:PlayerLedger` (line ~582) against `loadPlayer` mapper
  (lines ~884–897) before writing the constructed object — the field list must be exhaustive.
- `rebirthWithStats` is confirmed safe (calls `loadPlayer` which populates ledger from DB).
- Integration test: follow existing pattern in `tests/integration/`. Use dev mock.
  Assert: `engine.getState().ledger` is non-null; `ledger.currentCycle === 1`;
  `ledger.pressureLevel === 1`; `ledger.totalDeaths === 0`;
  `Array.isArray(ledger.discoveredRoomIds)`; `ledger.worldSeed` is a number.
- Does not modify `types/game.ts` — reads `PlayerLedger` (already exists).
- Verify pass: `pnpm test --run` + `npx tsc --noEmit`.
- Depends on: nothing.

---

## H3 — UX polish (5 audit items)

**Scope**: Five targeted fixes from `docs/eval/UX-AUDIT-0424.md`. All front-end layer, no schema
changes. The StatsTab change is additive only — a new JSX block appended after line 130.

### Files

| Action | File |
|--------|------|
| MODIFY | `app/page.tsx` |
| MODIFY | `components/CharacterCreation.tsx` |
| MODIFY | `components/CommandInput.tsx` |
| MODIFY | `components/tabs/StatsTab.tsx` _(saving-indicator JSX block appended after line ~130 — no edits to lines 25–130 owned by H1)_ |
| MODIFY | `types/game.ts` _(add `saving?: boolean` to `GameState` only)_ |
| MODIFY | `lib/gameEngine.ts` _(`_savePlayer` function only — no overlap with H2's `createCharacter` edit)_ |

### Notes

- **Item A (#14)**: Wrap `SKIP` keyword in prologue output with `rt.keyword('SKIP')` so terminal
  renders it in `text-white`. Locate exact string in `app/page.tsx` before editing.
- **Item B (#11)**: When `state.activeDialogue` is active and branches are rendered, append a dim
  instruction line `[1–9] to choose, 'leave' to exit` below choices in `app/page.tsx`.
- **Item C (#8)**: Add one-line description beneath each stat name in `CharacterCreation.tsx` stat
  allocation step. Read existing stat row JSX structure first. Descriptions: Vigor=HP scaling;
  Grit=echo retention; Reflex=initiative; Wits=skill checks; Presence=faction rep gains;
  Shadow=stealth/sneak.
- **Item D (refocus)**: Add `useEffect` keyed on `state.log.length` in `CommandInput.tsx` that
  focuses the input whenever a new message arrives. Prefer this over `useImperativeHandle`.
- **Item E (auto-save indicator)**: Add `saving?: boolean` to `GameState` in `types/game.ts`.
  Set `_setState({ saving: true })` before the Supabase call in `_savePlayer` and
  `_setState({ saving: false })` after (both success and retry-fail paths). Render dim
  `[saving...]` in StatsTab when `state.saving === true`.
- H3's `lib/gameEngine.ts` edit touches `_savePlayer` only. H2's edit touches `createCharacter`
  only. Different functions, no overlap.
- H3 must rebase on top of H1 before pushing — H1 edits StatsTab lines 25–130; H3 appends
  after that range. Rebase is expected to be trivial (no shared lines).
- Verify pass: `pnpm test --run` + `npx tsc --noEmit`.
- Depends on: H1 (StatsTab merge order).

---

## H4 — Dialogue tree integrity — test expansion + fixes

**Scope**: Add five new test categories (13–17) to `tests/eval/dialogueHealth.test.ts`, run
`pnpm test:eval` to find failures, fix failures in `data/dialogueTrees.ts`, re-run until all
pass.

### Files

| Action | File |
|--------|------|
| MODIFY | `tests/eval/dialogueHealth.test.ts` |
| MODIFY | `data/dialogueTrees.ts` |
| MODIFY | `data/items.ts` _(conditional — only if a `grantItem` ID references a genuinely missing item)_ |

### Notes

- **Category 13**: For every node with at least one branch where `requiresCycleMin >= 2`, the
  same node must also have at least one branch without a cycle gate (or `requiresCycleMin <= 1`).
  Fail if ALL branches require cycle 2+.
- **Category 14**: For every node with at least one branch where `requiresRep` is set, at least
  one branch in the same node must have no `requiresRep` gate (or the node must be terminal).
- **Category 15**: All `onEnter.grantItem` IDs must exist in `data/items.ts`. Verify export name
  before importing `ITEMS`.
- **Category 16**: `node.text.trim().length >= 5`. Hard fail on empty or near-empty nodes.
- **Category 17**: Collect all `onEnter.grantNarrativeKey` values; collect all
  `requiresNarrativeKey` gates from `data/rooms/`. Log orphan keys — warn only, no hard assert.
- `data/dialogueTrees.ts` is FROZEN for all other Howlers.
- When writing fallback branches to fix categories 13/14, read surrounding node text and match
  NPC tone. If fix count exceeds 10 nodes, surface an audit report and await author review
  rather than auto-generating all fixes.
- Verify pass: `pnpm test:eval` green (all 432 + new categories) + `npx tsc --noEmit`.
- Depends on: nothing.

---

## Conflict Audit

Full union of all owned files across H1–H4:

| File | Owner | Edit Scope | Advisory |
|------|-------|------------|----------|
| `lib/ansiColors.ts` | H1 | entire file — FROZEN after H1 merges | — |
| `components/tabs/StatsTab.tsx` | H1 | lines 25–130 range (color classes) | ADVISORY — see below |
| `components/tabs/StatsTab.tsx` | H3 | new JSX block appended after line ~130 | ADVISORY — see below |
| `components/tabs/WorldMapTab.tsx` | H1 | NPC/item/exit color classes in modal | — |
| `components/tabs/InventoryTab.tsx` | H1 | item name color class | — |
| `components/tabs/DataTab.tsx` | H1 | audit-only; no change expected | — |
| `lib/gameEngine.ts` | H2 | `createCharacter` function (~line 728) | — |
| `lib/gameEngine.ts` | H3 | `_savePlayer` function only | — |
| `tests/integration/createCharacterLedger.test.ts` | H2 | CREATE (new file) | — |
| `app/page.tsx` | H3 | prologue text + dialogue hint lines | — |
| `components/CharacterCreation.tsx` | H3 | stat row JSX | — |
| `components/CommandInput.tsx` | H3 | `useEffect` for input refocus | — |
| `types/game.ts` | H3 | `GameState` interface — add `saving?: boolean` | — |
| `tests/eval/dialogueHealth.test.ts` | H4 | new `describe` blocks (categories 13–17) | — |
| `data/dialogueTrees.ts` | H4 | entire file — FROZEN for others | — |
| `data/items.ts` | H4 | conditional (missing `grantItem` IDs only) | — |

**ADVISORY — `components/tabs/StatsTab.tsx`**: H1 edits color classes in the lines 25–130
range. H3 appends a new saving-indicator JSX block after that range. There is no line overlap
and no logical conflict. The advisory exists only because both Howlers write to the same file.
If both run in parallel worktrees and H3 merges before H1, H3's rebase will need a trivial
conflict resolution. Mitigation: H1 merges first; H3 rebases before pushing. This is the only
advisory in this convoy — there are no hard conflicts.

**`lib/gameEngine.ts` note**: H2 edits `createCharacter` (~line 728); H3 edits `_savePlayer`.
Separate functions, no shared lines. Normal merge — no advisory needed.

---

## Coordination Notes

1. **H1 before H3 on StatsTab**: H1 must merge its StatsTab color edits before H3 pushes its
   saving-indicator block. H3 rebases on top of H1 before opening its diff.

2. **`lib/ansiColors.ts` frozen after H1**: H2, H3, and H4 must not touch this file.

3. **`data/dialogueTrees.ts` frozen for H4**: No other Howler touches this file.

4. **`types/game.ts` usage split**: H3 adds `saving?: boolean` to `GameState`. H2 reads
   `PlayerLedger` (already exists) but does not modify the file. No write conflict.

5. **Recommended merge sequence**:
   - Parallel round 1: H2 and H4 — fully independent, no shared files, merge in any order.
   - Parallel round 2: H1 — color convention changes including StatsTab lines 25–130.
   - Sequential: H3 — rebase on H1's StatsTab result, then merge.
   - Alternative: run all four Howlers in parallel worktrees simultaneously; when complete,
     merge H2 and H4 first, then H1, then H3 (with rebase). The rebase is expected to be
     trivial given non-overlapping line ranges.
