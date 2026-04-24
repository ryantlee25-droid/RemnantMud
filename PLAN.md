# Plan: Post-Tabs Followup — Color Convention, Map Bug, UX Polish, Dialogue Audit
_Created: 2026-04-24 | Type: Bug Fix + Refactor + New Feature_

---

## Goal

Fix the `ledger: null` map-rendering bug, unify interactive-element colors across all surfaces
(terminal, tabs, modal), apply the highest-impact UX audit items still outstanding, and bring
the dialogue tree to full structural health with expanded test coverage.

---

## Situation

**1. Color convention (Howler 1)**
`lib/ansiColors.ts` is the single source of truth for terminal tag colors. It already correctly
assigns `text-cyan-400` to `npc` and `text-green-400` to `exit`. The problem is inconsistency
between the terminal tags and the React tab surfaces. `StatsTab.tsx` renders the current room
name and exits line in `text-green-400` — matching the terminal `exit` tag but diverging from
any "interactive" convention. `WorldMapTab.tsx` modal renders NPC ids and item counts in raw
`text-amber-400` (narration color), losing the distinction. No shared color constant is imported
from `ansiColors.ts` into any tab component — they all inline `text-amber-*` strings. The
chosen convention: **`text-cyan-400` for all interactive entities** (NPCs, exits, items as
named objects) across terminal tags AND tab surfaces, with amber reserved for narration and UI
chrome. `text-cyan-400` is already used for the command prompt (`CommandInput.tsx:97`) and
`npc` tags, making it the natural anchor.

**2. Map not rendering bug (Howler 2)**
`lib/gameEngine.ts:728` (inside `createCharacter`) calls `this._setState({ ..., ledger: null })`
even though `player_ledger` was upserted two lines earlier (line 668–675). `WorldMapTab.tsx:374`
guards `if (!state.currentRoom || !state.ledger)` and returns "Loading world..." when either is
null — so first-time players, including all dev-mode sessions, see only the loading stub forever.
The fix is to construct a `PlayerLedger` object from the values written to the DB and pass it to
`_setState`. `rebirthWithStats` (line 1165–1186) takes a different path — it calls `loadPlayer`
at the end which populates `ledger` from the DB, so rebirth is not affected. A regression
integration test must assert that after `createCharacter`, `state.ledger` is non-null with the
expected shape.

**3. UX polish (Howler 3)**
The `docs/eval/UX-AUDIT-0424.md` lists 17 items. The prior branch addressed items from the tab
refactor. Items still fully unaddressed and feasible without data model changes:
- **#14 — Prologue exit prompt color**: the "Type SKIP" prompt is buried in 850 words of gray
  text; wrapping in `<keyword>` tag makes it visually pop in the terminal (1-line fix).
- **#11 — Dialogue choice numbering**: choices render as numbered list `1–9` but the UI never
  teaches this; a one-line "[Type a number to choose]" hint in the dialogue render surface
  (`app/page.tsx`) removes the discoverability cliff.
- **#8 — Stat tooltips in character creation**: `CharacterCreation.tsx` shows stat names and
  point allocators with no description of what Vigor/Grit/etc do; adding one short tooltip line
  per stat is ~15 lines and directly addresses the E3 audit finding.
- **Input refocus after tab click**: `CommandInput.tsx` focuses on mount only; clicking a sidebar
  tab captures focus and never returns it to the input. Adding a `pointerdown` capture listener
  on the terminal pane (or an exported `focus()` method) solves this without layout changes.
- **Auto-save silent failure indicator**: `_savePlayer` already appends a system message on retry
  failure but says nothing on initial failure; a brief "Saving..." → "Saved" indicator on the
  terminal header or StatsTab would surface the auto-save cycle. Scope: add a `saving` boolean
  to `GameState`, set it in `_savePlayer`, render a subtle indicator in `StatsTab`.
Items deferred to a later run: restart flow safety (#1–4), tutorial hint wiring (#5), Phase E
migration work (#6, #7), Phase D discoverability docs.

**4. Dialogue tree audit (Howler 4)**
`data/dialogueTrees.ts` is 5711 lines with ~20 unique NPC trees (~20 `npcId` entries). The
existing `tests/eval/dialogueHealth.test.ts` already covers 12 test categories: orphan
targetNodes, unreachable nodes, terminal nodes, faction refs, skill refs, flag round-trip, smart
quotes, NPC cross-reference, startNode existence, node id consistency, trapped failNodes, and
aggregate stats. All 432 eval tests currently pass. What is NOT yet covered:
- Cycle-gated branches (`requiresCycleMin`) that lack a non-cycle-1 fallback branch in the same
  node — a cycle-1 player would see zero options and be silently stuck.
- Faction-gated branches (`requiresRep`) without a fallback — same trapped-player risk.
- `onEnter.grantItem` references that name item IDs not present in `data/items.ts`.
- `onEnter.grantNarrativeKey` values that are never consumed by a `requiresNarrativeKey` gate
  in rooms or dialogue (orphan keys — not a crash but signals drift).
- Node text length audit: nodes with `text === ''` or text under 5 characters (structural
  placeholder left in).
The Howler will add these test categories and fix any failures found.

---

## Architecture Decisions

**Color convention**: `text-cyan-400` = interactive (NPCs, exits, named items). The tag system
in `lib/ansiColors.ts` already uses `text-cyan-400` for `npc`; we extend the convention to
`exit` (currently `text-green-400`) and `item` (currently `text-yellow-400`) in the tag map,
and mirror it in tab components that render the same entity types. `text-green-400` will be
retired from interactive use (kept only for HP-bar "healthy" coloring, which is semantic, not
entity-type). `text-yellow-400` will be retired from item tags (kept for currency, which is
visually distinct by design). `lib/ansiColors.ts` is the single-file contract — tab components
will import `TAG_COLOR` rather than inlining strings. NOTE: `text-green-400` in `StatsTab`
room-name line is ambient location indicator, not interactive — change to `text-cyan-400` for
convention consistency.

**Map fix**: Construct `PlayerLedger` inline from the upsert values in `createCharacter`; pass
it to `_setState`. Use `user.id` for `playerId`, `seed` for `worldSeed`, and hardcode the
cycle-1 defaults (`currentCycle: 1`, `pressureLevel: 1`, `totalDeaths: 0`,
`discoveredRoomIds: []`, `discoveredEnemies: []`, `squirrelAlive: true`, `squirrelTrust: 0`,
`squirrelCyclesKnown: 0`). No new DB query needed.

**UX items selected** (from the 17-item audit):
1. #14 Prologue color (`app/page.tsx`) — trivial, unblocked, instant visible payoff
2. #11 Dialogue hint (`app/page.tsx`) — 1 line, removes the biggest discoverability cliff
3. #8 Stat tooltips (`components/CharacterCreation.tsx`) — small, addresses E3 audit directly
4. Input refocus (`components/CommandInput.tsx`, `components/tabs/TabBar.tsx`) — small, UX parity
5. Auto-save indicator (`lib/gameEngine.ts`, `components/tabs/StatsTab.tsx`) — small, surfaces
   silent behavior

**Dialogue audit methodology**: The Howler runs `pnpm test:eval` as the baseline, then adds new
`describe` blocks to `tests/eval/dialogueHealth.test.ts` for the uncovered categories, runs
tests to find failures, fixes failures in `data/dialogueTrees.ts` (or adds missing items to
`data/items.ts` allowlists in the test file if the item genuinely exists), then re-runs until
green.

---

## Type Dependencies

- `PlayerLedger` in `types/game.ts:582` — Howler 2 constructs an instance; no change to the
  interface itself. Shape must match the fields documented in `loadPlayer` (line 884–897).
- `GameState` in `types/game.ts:728` — Howler 3 adds `saving?: boolean` for the auto-save
  indicator. This field is optional so no other module breaks.
- `TAG_COLOR` in `lib/ansiColors.ts` — Howler 1 modifies two entries (`item`, `exit`). Imported
  by `components/Terminal.tsx`. All tab components that inline color strings will also import it.

---

## File Ownership Matrix

| Howler | Creates | Modifies |
|--------|---------|----------|
| H1 — Color convention | — | `lib/ansiColors.ts`, `components/tabs/StatsTab.tsx`, `components/tabs/WorldMapTab.tsx`, `components/tabs/InventoryTab.tsx`, `components/tabs/DataTab.tsx` |
| H2 — Map bug | `tests/integration/createCharacterLedger.test.ts` | `lib/gameEngine.ts` |
| H3 — UX polish | — | `app/page.tsx`, `components/CharacterCreation.tsx`, `components/CommandInput.tsx`, `components/tabs/StatsTab.tsx`, `types/game.ts` |
| H4 — Dialogue audit | — | `tests/eval/dialogueHealth.test.ts`, `data/dialogueTrees.ts` |

**Conflict check**: `components/tabs/StatsTab.tsx` appears in both H1 and H3. Resolution: H1
owns all color changes to StatsTab (including any new `TAG_COLOR` imports); H3 adds the `saving`
boolean indicator to StatsTab but does not touch color classes. Since these are distinct line
ranges with no overlap, they can run in parallel — but H1 must freeze its StatsTab changes first
so H3 can merge cleanly. In practice: H3 adds only new JSX at the bottom of the stats panel
(the saving indicator block) and touches no lines H1 will modify. The Howler that runs second
must rebase before opening its diff.

**Cross-Howler coordination note**: H1 changes `TAG_COLOR.exit` from `text-green-400` to
`text-cyan-400` in `lib/ansiColors.ts`. The `Terminal.tsx` component reads `TAG_COLOR` at
render time — no other file needs updating for terminal output. Tab components that H1 also
touches are fully owned by H1.

---

## Tasks

### H1 — Interactive-element color convention

**Scope**: Audit all uses of `text-green-400`, `text-yellow-400` (item tag), and `text-amber-*`
on interactive entities in the four sidebar tab components and `lib/ansiColors.ts`. Apply the
`text-cyan-400` = interactive convention. Do NOT change amber usage for UI chrome (borders,
headers, section labels) or `text-yellow-400` for currency. Do NOT change `text-red-*` for
enemies or `text-green-400` for HP bar healthy state.

- Files:
  - Modify: `lib/ansiColors.ts` — change `TAG_COLOR.item` to `'text-cyan-400'`, `TAG_COLOR.exit`
    to `'text-cyan-400'` (npc is already `text-cyan-400`)
  - Modify: `components/tabs/StatsTab.tsx` — import `TAG_COLOR` from `lib/ansiColors.ts`;
    change room-name `text-green-400` to `text-cyan-400`, exits `text-green-400` to
    `text-cyan-400`
  - Modify: `components/tabs/WorldMapTab.tsx` — in the modal, change NPC ids render from
    unstyled `text-amber-400` to `text-cyan-400`; change items count label from `text-amber-600`
    to `text-cyan-400`; exits list to `text-cyan-400`
  - Modify: `components/tabs/InventoryTab.tsx` — change item name `text-amber-300` to
    `text-cyan-400` for item names (not for stats/values which stay amber)
  - Modify: `components/tabs/DataTab.tsx` — quest flag names rendered as `text-amber-400`; these
    are data labels not interactive entities — leave amber. No change needed here unless a
    specific entity display is found.

- Tests: `npx tsc --noEmit` passes. Visual: terminal exits/items/npcs are `text-cyan-400`;
  StatsTab exits are `text-cyan-400`; WorldMapTab modal NPC/item/exit fields are `text-cyan-400`.
  No amber on named interactive entities.

- Depends on: nothing

- Effort: S

- Pre-mortem: N/A (S task)

- Notes: `TAG_COLOR` is already imported by `Terminal.tsx` via `parseRichText`. Tab components
  currently inline strings — importing `TAG_COLOR` is preferred but not required if it adds
  import complexity; consistent string values are acceptable.

---

### H2 — Map not rendering bug + regression test

**Scope**: Fix `lib/gameEngine.ts:728` where `ledger: null` is hardcoded. Add integration test.
Audit `rebirthWithStats` to confirm it does not share the bug (it calls `loadPlayer` at line
1190 which populates ledger from DB — confirmed safe, no fix needed there).

- Files:
  - Modify: `lib/gameEngine.ts` — in `createCharacter`, after the `player_ledger` upsert (line
    668–675), construct a `PlayerLedger` object and replace `ledger: null` with `ledger: <obj>`
    in the `_setState` call at line 721–737. Import `PlayerLedger` type from `@/types/game`
    (already imported via the broader types import at the top of the file — verify with grep).
  - Create: `tests/integration/createCharacterLedger.test.ts` — integration test using the dev
    mock (same pattern as existing integration tests in `tests/integration/`). Assertions:
    after `engine.createCharacter(...)`, `engine.getState().ledger` is non-null,
    `ledger.currentCycle === 1`, `ledger.pressureLevel === 1`, `ledger.totalDeaths === 0`,
    `Array.isArray(ledger.discoveredRoomIds)`, `ledger.worldSeed` is a number.

- Tests: `pnpm test --run` (includes the new test file). `npx tsc --noEmit`.

- Depends on: nothing

- Effort: S

- Pre-mortem: N/A (S task)

- Notes: `squirrelAlive`, `squirrelTrust`, `squirrelCyclesKnown` must be included in the
  constructed `PlayerLedger` — check `PlayerLedger` interface in `types/game.ts:582`. Default
  values: `squirrelAlive: true`, `squirrelTrust: 0`, `squirrelCyclesKnown: 0`.

---

### H3 — UX polish (5 items from audit)

**Scope**: Five targeted fixes from `docs/eval/UX-AUDIT-0424.md`, all feasible without data
model migrations, all in the front-end layer.

**Item A — #14 Prologue exit prompt color** (`app/page.tsx`): The prologue output string
contains "Type SKIP to skip" (or similar). Wrap the `SKIP` keyword with `rt.keyword('SKIP')` so
the terminal renders it in `text-white` (keyword tag). Locate the exact prologue text string and
apply. ~2 lines.

**Item B — #11 Dialogue choice numbering hint** (`app/page.tsx`): When `state.activeDialogue`
is active and branches are rendered, append a dim instruction line "[1–9] to choose, 'leave' to
exit" below the choices. ~5 lines in the dialogue display section.

**Item C — #8 Stat tooltips** (`components/CharacterCreation.tsx`): In the stat allocation
step, each stat row shows name + current value + +/- buttons. Add a one-line description
beneath each stat name. Content: Vigor=HP scaling; Grit=echo retention; Reflex=initiative;
Wits=skill checks; Presence=faction rep gains; Shadow=stealth/sneak. ~18 lines (6 stats × 3
lines each). Check existing stat row JSX structure before writing.

**Item D — Input refocus after tab click** (`components/CommandInput.tsx`): Add a
`useEffect` dependency on some game state (e.g., message log length) so the input receives
focus whenever a new message arrives — this means after dispatch completes, focus returns.
Alternative: export a `focus()` imperative handle from `CommandInput` via `useImperativeHandle`
and call it from `GameLayout` on terminal panel click. The simpler approach: add
`maxLength={200}` (already present) and a `useEffect` that focuses the input whenever
`state.log.length` changes. ~5 lines.

**Item E — Auto-save indicator** (`lib/gameEngine.ts`, `types/game.ts`,
`components/tabs/StatsTab.tsx`): Add `saving?: boolean` to `GameState`. In `_savePlayer`, set
`_setState({ saving: true })` before the Supabase call and `_setState({ saving: false })` after
(in both success and retry-fail paths). In `StatsTab.tsx`, render a dim `[saving...]` indicator
in the cycle/location block when `state.saving === true`. ~12 lines total.

- Files:
  - Modify: `app/page.tsx`
  - Modify: `components/CharacterCreation.tsx`
  - Modify: `components/CommandInput.tsx`
  - Modify: `types/game.ts` (add `saving?: boolean` to GameState)
  - Modify: `lib/gameEngine.ts` (saving flag in `_savePlayer`)
  - Modify: `components/tabs/StatsTab.tsx` (saving indicator display)

- Tests: `pnpm test --run`. `npx tsc --noEmit`. Manual: (a) prologue SKIP keyword is white/bright
  in terminal; (b) dialogue renders hint line; (c) stat tooltips appear; (d) after clicking MAP
  tab, typing resumes in terminal input without manual click-back; (e) `[saving...]` appears
  briefly during save.

- Depends on: H1 (StatsTab lines must not conflict — H1 owns color changes, H3 adds new JSX
  block only)

- Effort: M (5 items, 6 files, small changes but spread across front-end and engine)

- Pre-mortem: "If this task fails or takes 3× longer, it will be because: the prologue text
  string is dynamically generated in `gameEngine.ts` rather than in `page.tsx`, making the
  `rt.keyword` wrapping point hard to locate; or the auto-save indicator triggers a React
  re-render loop."

- Notes: For item D, prefer the `state.log.length` useEffect approach — it's pure React, no
  imperative handles needed.

---

### H4 — Dialogue tree integrity — test expansion + fixes

**Scope**: All 432 eval tests currently pass. Expand `tests/eval/dialogueHealth.test.ts` with
five new test categories (described below), run to find failures, fix failures in
`data/dialogueTrees.ts` or add to test-file allowlists where appropriate, then run until all
pass.

**New test category 13 — Cycle-gated branches have non-cycle-1 fallback**: For every node that
contains at least one branch with `requiresCycleMin >= 2`, the same node must also contain at
least one branch WITHOUT `requiresCycleMin` (or with `requiresCycleMin <= 1`). A node where ALL
branches require cycle 2+ traps cycle-1 players silently (they see an empty branch list and
the conversation stalls).

**New test category 14 — Faction-gated branches have fallback**: For every node that has at
least one branch with `requiresRep`, at least one branch in the same node must have no
`requiresRep` gate (or the node must be a terminal). Same silent-trap pattern.

**New test category 15 — onEnter.grantItem references valid item IDs**: Scan all `onEnter`
blocks for `grantItem` fields; each item ID must exist in `data/items.ts`. Import `ITEMS` from
`@/data/items` (check the export name first) and validate.

**New test category 16 — No empty node text**: Every `node.text` must have `trim().length >= 5`.
Structural placeholders left behind from authoring will fail this.

**New test category 17 — Orphan narrative keys (informational)**: Collect all
`onEnter.grantNarrativeKey` values across all trees; collect all `requiresNarrativeKey` values
from room data (grep `data/rooms/` for `requiresNarrativeKey`). Log any keys granted but never
consumed. This is informational (warn, don't fail) — orphan keys suggest authored content that
was never hooked up to a gate.

After adding tests, the Howler will run `pnpm test:eval` and fix any failures in
`data/dialogueTrees.ts` — adding missing fallback branches, fixing grantItem IDs, filling empty
node text. If a fix requires adding a new item to `data/items.ts`, scope it narrowly (name +
type + description only, no stats required for quest-only items).

- Files:
  - Modify: `tests/eval/dialogueHealth.test.ts`
  - Modify: `data/dialogueTrees.ts` (fixes for any failures)
  - Possibly modify: `data/items.ts` (if grantItem references a missing item)

- Tests: `pnpm test:eval` green (all categories including new 13–17). `npx tsc --noEmit`.

- Depends on: nothing (reads its own test file, does not touch files owned by H1–H3)

- Effort: M

- Pre-mortem: "If this task fails or takes 3× longer, it will be because: the 5711-line
  `dialogueTrees.ts` has many cycle-gated nodes where no cycle-1 fallback was authored —
  adding fallback branches requires writing new NPC dialogue text that must be tonally
  consistent with the existing character voice, which is time-consuming and requires judgment
  calls. If >10 nodes need new fallback branches, split into H4a (tests + audit report) and
  H4b (fixes)."

- Notes: The `grantNarrativeKey` / `requiresNarrativeKey` test is informational only — do not
  add hard assertions for orphan keys in this pass.

---

## Cross-Howler Coordination

1. **H1 before H3 on StatsTab**: H1 changes color classes on lines 104 and 113 of
   `StatsTab.tsx`. H3 adds a new JSX block (saving indicator) at the end of the stats panel —
   no line overlap. H3 should rebase on top of H1's StatsTab changes before committing.

2. **`lib/ansiColors.ts` is frozen after H1 merges**: H2, H3, H4 must not touch
   `lib/ansiColors.ts`. H1 is the sole owner.

3. **`data/dialogueTrees.ts` is frozen for H4**: No other Howler touches this file.

4. **`types/game.ts` shared caution**: H3 adds `saving?: boolean` to `GameState`. H2 reads but
   does not modify `types/game.ts` (uses `PlayerLedger` which already exists). No conflict.

---

## Out of Scope

- UX audit Phase A (restart flow safety, `CONFIRM RESTART` guard) — requires changes to
  `app/page.tsx` logic paths that are also touched by H3; defer to avoid page.tsx conflicts.
- UX audit Phase B (tutorial hint wiring) — `handleTutorialHint` dead code fix requires
  wiring into 4 action handlers; defer to its own session.
- UX audit Phase D (README docs update, `help` command sync) — content work, not code; defer.
- UX audit Phase E (dialogue/combat persistence column) — requires a Supabase migration;
  defer (migration risk, needs own session).
- DataTab quest flag rendering as human-readable strings — requires a flag→description lookup
  table; data model change, defer.
- New commands or verbs.
- Any changes to Supabase schema.
- Mobile viewport touch-first layout overhaul.
- `CommandInput maxLength` increase (200 is adequate; not a reported bug).

---

## Risks

1. **`TAG_COLOR` change breaks Terminal rendering**: Changing `exit` from `text-green-400` to
   `text-cyan-400` in `lib/ansiColors.ts` immediately affects all terminal output. If players
   have mentally mapped green=exits, this is a perceptible change. Risk is low (game is not
   shipped to a broad audience yet) but the Howler should verify via `pnpm test --run` that all
   terminal tests pass after the change.

2. **`createCharacter` ledger construction drift**: The `PlayerLedger` fields hardcoded in the
   fix must match the DB schema columns. If a migration has added a column that was not
   backfilled into the `loadPlayer` mapper (lines 884–897), the manually constructed object will
   be missing a field. H2 must cross-check `types/game.ts:PlayerLedger` against the `loadPlayer`
   mapper before writing the fix.

3. **Dialogue fallback branch authoring quality**: If H4 finds many cycle-gated nodes without
   fallbacks and writes terse generic branches ("I have nothing more to say."), it risks
   flattening NPC voice. The Howler must read the surrounding node text and match tone.
   If the fix count exceeds 10 nodes, the Howler should surface a report and await author review
   rather than auto-generating all fixes.

4. **H3 auto-save indicator re-render loop**: Setting `saving: true` in `_setState` triggers a
   React re-render; if `_savePlayer` is called inside a render-triggered effect, this could
   cycle. H3 must verify `_savePlayer` is only called from explicit user actions or the
   `executeAction` dispatch path — not from any `useEffect`.

5. **StatsTab file conflict (H1 vs H3)**: Both Howlers modify `StatsTab.tsx`. If they run
   simultaneously in worktrees and both land on main before a rebase, there will be a merge
   conflict. Mitigation: H1 runs first and merges; H3 rebases before pushing.

---

## Definition of Done

- [ ] Code written and self-reviewed by each Howler
- [ ] `npx tsc --noEmit` passes (zero type errors) after all changes
- [ ] `pnpm test --run` passes (integration + unit suite)
- [ ] `pnpm test:eval` passes (all 432 + new H4 tests green)
- [ ] Terminal exits/NPCs/items render in `text-cyan-400` in both terminal and tab surfaces
- [ ] MAP tab shows the world map for a brand-new dev-mode character (no "Loading world...")
- [ ] PR description notes: color change is a perceptible visual shift; any coverage gaps from
  H4 fallback branches that needed manual dialogue authoring
