# Plan: Aardwolf-Style UX Rewrite

_Created: 2026-03-29 | Type: Refactor (ground-up UI rewrite)_

## Goal

Replace every UI component in The Remnant with an Aardwolf-style MUD interface: split-pane layout (terminal left, sidebar right), full 16-color ANSI palette, all game interactions flowing through the terminal text stream, no modals, no screen takeovers, no tab system, no CRT/amber theme.

## Background

The current UI wraps gameplay in a PipBoy-style frame with CRT scanlines, amber-only color scheme, tab-based navigation (TERM/STAT/INV/MAP/DATA/CMD), and modal screen takeovers for death, endings, character creation, and the prologue. The Aardwolf rewrite makes the terminal the single source of truth for all game content, adds a persistent sidebar with compact stats and ASCII minimap, and uses classic MUD colors (green exits, cyan NPCs, red enemies, yellow items).

## Scope

**In scope:**
- Delete 14 components (PipBoyFrame, ThemePicker, ThemeLoader, TheBetween, DeathScreen, EndingScreen, Prologue, CharacterCreation, all 5 tab components)
- Delete `lib/theme.ts` (theme system)
- Rewrite `app/globals.css` (remove CRT/bezel, add ANSI color variables)
- Rewrite `app/page.tsx` (remove tab system, phase-based takeovers)
- Rewrite `app/landing/page.tsx` (normal web page, not BBS)
- Simplify `app/login/page.tsx` (clean form, not themed terminal)
- Rewrite `components/Terminal.tsx` (ANSI colors, MUD prompt line)
- Modify `components/CommandInput.tsx` (remove placeholder, MUD prompt)
- Rewrite `lib/richText.ts` color mappings
- Create new: `GameLayout.tsx`, `Sidebar.tsx`, `MiniMap.tsx`, `lib/ansiColors.ts`, `lib/terminalCreation.ts`, `lib/terminalDeath.ts`
- Rewrite `app/layout.tsx` (remove ThemeLoader, update body classes)
- Update `components/ErrorBoundary.tsx` colors

**Out of scope:**
- Game engine (`lib/gameEngine.ts`, all `lib/actions/*`)
- Game data (rooms, NPCs, items, enemies, dialogue)
- Supabase persistence layer (`lib/world.ts`, `lib/inventory.ts`, `lib/supabase.ts`)
- Combat system, crafting, stealth, companion system
- Auth flow logic (Supabase magic link mechanics unchanged)
- `components/RemnantLogo.tsx` (unused in new layout, can delete if desired)

## Technical Approach

### Architecture

The new layout replaces `PipBoyFrame` with a `GameLayout` component that renders a CSS Grid split-pane:

```
+---------------------------------------+------------------+
|                                        |  Compact Stats   |
|           Terminal (70%)               |  ASCII MiniMap   |
|     (scrolling message log)            |  Current Exits   |
|                                        |  Combat Info     |
+---------------------------------------+------------------+
|  <HP:45 MN:12 MV:100> _               |                  |
+---------------------------------------+------------------+
```

- Terminal (`components/Terminal.tsx`): Remains the scrolling `role="log"` div, but colors change from amber-only to full ANSI palette
- Sidebar (`components/Sidebar.tsx`): Always visible, reads from `useGame()` context. Shows compact HP/MP bars, level, zone, time-of-day, and embeds `MiniMap`
- MiniMap (`components/MiniMap.tsx`): 5x5 ASCII grid. Uses `Room.exits` (type `Partial<Record<Direction, string>>`) from `currentRoom` and adjacent rooms loaded via `getRoom()` from `lib/world.ts`. Shows `@` for current room, `#` for rooms with exits, connections as `-` and `|`
- CommandInput (`components/CommandInput.tsx`): Prompt changes from `>` to a MUD-style HP/status prompt

### Color System

Replace amber-only Tailwind classes with ANSI-mapped classes. The new `lib/ansiColors.ts` defines:

| Semantic tag | ANSI color | Tailwind class |
|---|---|---|
| `item` | Yellow | `text-yellow-400` |
| `npc` | Cyan | `text-cyan-400` |
| `enemy` | Red | `text-red-500` |
| `exit` | Green | `text-green-400` |
| `keyword` | White bright | `text-white` |
| `currency` | Yellow bright | `text-yellow-300` |
| `condition` | Magenta | `text-purple-400` |
| `trait` | Blue | `text-blue-400` |
| `narrative` | White/Gray | `text-gray-300` |
| `combat` | Red | `text-red-400` |
| `system` | Cyan | `text-cyan-300` |
| `error` | Red bright | `text-red-500` |
| `echo` (typed cmd) | Gray dim | `text-gray-500` |

The `Terminal.tsx` `TAG_COLOR` map and `messageColor()` function update to these values. `lib/richText.ts` helper functions (`rt.item()`, `rt.npc()`, etc.) remain unchanged -- they produce `<item>...</item>` tags. Only the rendering layer changes.

### Game Phase Routing (app/page.tsx)

Current `app/page.tsx` uses two state machines: `AuthPhase` ('checking' | 'unauthenticated' | 'loading-player' | 'prologue' | 'no-player' | 'ready') and `GamePhase` ('alive' | 'dead' | 'between' | 'rebirth' | 'rebirthing' | 'ending'). These render different full-screen components.

New approach:
- `AuthPhase` simplifies: 'checking' | 'unauthenticated' | 'loading-player' | 'creating' | 'ready'
- `GamePhase` collapses entirely -- death, endings, and rebirth are handled as terminal output + special command handlers
- The `GameLayout` always renders during 'creating' and 'ready' phases
- During 'creating', the terminal displays character creation prompts and `CommandInput` routes to the creation handler instead of the game parser
- During death, the engine appends death narrative messages to the log and registers a `begin` command handler
- During endings, the engine appends ending narrative and registers a `newgame` command handler

### Character Creation (terminal-based)

`lib/terminalCreation.ts` drives a state machine that outputs to the terminal:

```
THE REMNANT -- Character Creation
Enter your name: _
```
```
Select class:
  [1] Enforcer -- Front-line bruiser
  [2] Scout -- Ranged specialist
  ...
Type a number: _
```
```
Allocate stats (6 free points):
  [1] Vigor:    2  (+/-)
  [2] Grit:     2  (+/-)
  ...
Type "[stat] +" or "[stat] -": _
Type "done" when finished: _
```

This module exports functions that produce `GameMessage[]` arrays and interpret player input strings, keeping it decoupled from React. The `CommandInput` routes to this handler when `authPhase === 'creating'`.

The loss ritual also runs in-terminal: typewriter text prints line-by-line to the log, player types numbers to select loss type, types a name/detail, and the closing text prints. No modal, no separate component.

### Death / Ending In-Stream

`lib/terminalDeath.ts` exports:
- `deathMessages(cycle, xpGained, roomsExplored, causeOfDeath, echoStats, stashCount)` -- returns `GameMessage[]` with the death narrative, stats, "what carries forward" section, and "Type BEGIN to start a new cycle"
- `endingMessages(choice, cycle, totalDeaths, roomsExplored, xpEarned)` -- returns `GameMessage[]` with ending title, narrative paragraphs, stats, "THE END", "Type NEWGAME to start fresh"
- `theBetweenMessages(cycle, fragments, inheritedFactions, discoveredRooms, stashItems)` -- returns `GameMessage[]` for the between-cycles interstitial

The death/ending narratives from `DeathScreen.tsx` and `EndingScreen.tsx` contain rich text that must be preserved. The `DEATH_NARRATIVE` constant, `ENDING_NARRATIVES` record, and `MEMORY_POOL` from `TheBetween.tsx` move into `lib/terminalDeath.ts`.

### Landing Page

New `app/landing/page.tsx` is a normal web page (Server Component, zero client JS):
- Hero section with game title, tagline, one-paragraph description
- Feature highlights (rooms, endings, factions, death cycles)
- Terminal excerpt showing sample gameplay (reuse existing example)
- "Play Now" button linking to `/login`
- No BBS boot sequence, no CRT scanlines, no amber-only

### Test Impact

The 433 existing tests are primarily in `tests/unit/` and `tests/integration/`. Reviewing the test files:
- `tests/unit/theme.test.ts` -- DELETE (theme system removed)
- All integration tests (`combat.test.ts`, `inventory.test.ts`, `dialogue.test.ts`, etc.) test the game engine via `GameEngine` directly, not through React components. These should be unaffected.
- No existing component tests (no `__tests__` under `components/`). The tab components, DeathScreen, etc. have no dedicated test files.

**Risk**: The `theme.test.ts` deletion drops the test count. New tests should be added for `lib/ansiColors.ts`, `lib/terminalCreation.ts`, and `lib/terminalDeath.ts` to maintain or exceed 433.

### Existing Code to Reuse

- `useGame()` hook from `lib/gameContext.tsx` -- all sidebar/terminal components use this. Do not create alternative state access.
- `GameEngine._appendMessages()` -- the mechanism for printing to terminal. Death/ending/creation modules produce `GameMessage[]` arrays and call this.
- `getRoom()` from `lib/world.ts` -- MiniMap uses this to load adjacent rooms for the grid.
- `getExits()` from `lib/world.ts` -- MiniMap uses this to determine connections.
- `rt.*` helpers from `lib/richText.ts` -- tag wrappers unchanged. Only the CSS color mappings change.
- `parseCommand()` / `parseDialogueInput()` from `lib/parser.ts` -- CommandInput routing unchanged.
- `xpForNextLevel()`, `getTimeOfDay()` from `lib/gameEngine.ts` -- Sidebar reuses these.
- `ErrorBoundary` from `components/ErrorBoundary.tsx` -- kept, just update color classes.
- `CLASS_DEFINITIONS` from `types/game.ts` -- terminal creation reuses this.
- `handleStats`, `handleInventory`, `handleHelp`, `handleQuests` from `lib/actions/system.ts` and `lib/actions/social.ts` -- these ALREADY print to terminal. Rider F enhances their output formatting with ANSI colors but the handlers exist.
- `handleMap` from `lib/actions/travel.ts` -- already prints waypoints to terminal.

## Open Questions

- [ ] Should the MiniMap load adjacent rooms async (via `getRoom()` which hits Supabase) or only show connections from the current room's `exits` keys without room names? Async loading is richer but adds latency on every room change. **Recommendation**: Use only `currentRoom.exits` for the grid shape (which directions have exits), no async loading. Show `?` for unvisited adjacent rooms.
- [ ] Should the prologue print to terminal on first connection, or should we cut it entirely and go straight to character creation? The prologue is ~40 lines of lore. **Recommendation**: Print it to terminal, line by line, with a `skip` command available.
- [ ] The `save` command currently exists. The InventoryTab had a GUI save button. Is the `save` command sufficient, or do we need a save indicator in the sidebar? **Recommendation**: `save` command is sufficient -- this is a MUD.

---

## Rider Decomposition (8 Riders)

### File Ownership Matrix

| File | Rider | Action |
|---|---|---|
| `lib/ansiColors.ts` | A | CREATE |
| `lib/richText.ts` | A | MODIFY (color map only) |
| `app/globals.css` | A | REWRITE |
| `app/layout.tsx` | A | MODIFY (remove ThemeLoader, update body classes) |
| `lib/theme.ts` | A | DELETE |
| `components/ThemeLoader.tsx` | A | DELETE |
| `components/ThemePicker.tsx` | A | DELETE |
| `tests/unit/theme.test.ts` | A | DELETE |
| `tests/unit/ansiColors.test.ts` | A | CREATE |
| `components/GameLayout.tsx` | A | CREATE |
| `components/Terminal.tsx` | B | MODIFY |
| `components/CommandInput.tsx` | B | MODIFY |
| `tests/unit/terminal.test.ts` | B | CREATE |
| `components/Sidebar.tsx` | C | CREATE |
| `components/MiniMap.tsx` | C | CREATE |
| `components/StatusBar.tsx` | C | DELETE (replaced by Sidebar) |
| `tests/unit/minimap.test.ts` | C | CREATE |
| `lib/terminalCreation.ts` | D | CREATE |
| `components/CharacterCreation.tsx` | D | DELETE |
| `tests/unit/terminalCreation.test.ts` | D | CREATE |
| `lib/terminalDeath.ts` | E | CREATE |
| `components/DeathScreen.tsx` | E | DELETE |
| `components/EndingScreen.tsx` | E | DELETE |
| `components/TheBetween.tsx` | E | DELETE |
| `components/Prologue.tsx` | E | DELETE |
| `tests/unit/terminalDeath.test.ts` | E | CREATE |
| `lib/actions/system.ts` | F | MODIFY (enhance `handleStats`, `handleInventory`, `handleHelp` with ANSI color formatting) |
| `components/tabs/StatTab.tsx` | F | DELETE |
| `components/tabs/InventoryTab.tsx` | F | DELETE |
| `components/tabs/MapTab.tsx` | F | DELETE |
| `components/tabs/DataTab.tsx` | F | DELETE |
| `components/tabs/CommandsTab.tsx` | F | DELETE |
| `app/landing/page.tsx` | G | REWRITE |
| `app/login/page.tsx` | G | REWRITE |
| `tests/unit/landing.test.ts` | G | CREATE (optional -- Server Component smoke test) |
| `app/page.tsx` | H | REWRITE |
| `components/PipBoyFrame.tsx` | H | DELETE |
| `components/ErrorBoundary.tsx` | H | MODIFY (update color classes) |

### Dependency DAG

```
A (Core Layout + ANSI Colors)
├── B (Terminal Rewrite) — depends on A for color definitions and GameLayout
├── C (Sidebar + MiniMap) — depends on A for GameLayout shell and color system
├── D (Text-Based Character Creation) — depends on A for colors; depends on B for terminal input routing
├── E (In-Stream Death + Ending) — depends on A for colors; depends on B for terminal message format
├── F (Command-Driven Info) — depends on A for colors
├── G (Landing + Login) — depends on A for globals.css rewrite (independent of game components)
└── H (app/page.tsx Rewrite) — depends on A, B, C, D, E, F (integrates everything)
```

**Critical path**: A -> B -> H (with C, D, E, F parallelizable after A)

---

## Tasks

### Rider A: Core Layout + ANSI Colors
_Branch: `convoy/<id>/core-layout-ansi`_
_This is the foundation. All other Riders depend on it._

- [ ] **Create `lib/ansiColors.ts`** -- Define ANSI color constants as Tailwind class mappings. Export a `TAG_COLOR` record mapping semantic tags (item, npc, enemy, exit, keyword, currency, condition, trait) to Tailwind color classes. Export a `MESSAGE_COLOR` record mapping message types (narrative, combat, system, error, echo) to Tailwind classes.
  - Files: `lib/ansiColors.ts` (CREATE)
  - Tests: `tests/unit/ansiColors.test.ts` -- verify all tag names and message types have mappings, no undefined values
  - Notes: This replaces the inline `TAG_COLOR` in `Terminal.tsx` and the `messageColor()` function. Other Riders import from here.

- [ ] **Rewrite `app/globals.css`** -- Remove CRT scanlines (`.crt-scanlines::after`), bezel scratches (`.pipboy-scratches::before`), inv-pulse animation, amber-only CSS variables. Keep: reset styles, scrollbar styles, cursor blink, `animate-pulse` exception, `::selection`. Update `--foreground` from `#d4a44c` to `#e5e7eb` (gray-200). Update `--background` to `#111111`. Remove `--amber` variable.
  - Files: `app/globals.css` (REWRITE)
  - Notes: The global animation kill (`transition: none !important`) should stay -- MUDs don't animate.

- [ ] **Create `components/GameLayout.tsx`** -- New split-pane layout component using CSS Grid. Left column (terminal area) takes ~70% width, right column (sidebar) takes ~30%. Terminal area contains a scrollable content region and the command input at the bottom. Responsive: on screens < 1024px, sidebar collapses to a thin bar or hides behind a toggle.
  - Files: `components/GameLayout.tsx` (CREATE)
  - Props: `children` (terminal content), `sidebar` (sidebar content), `input` (command input), `showSidebar` boolean
  - Notes: Do NOT import from any deleted components. This replaces `PipBoyFrame.tsx` but does not delete it (Rider H deletes it).

- [ ] **Delete theme system** -- Remove `lib/theme.ts`, `components/ThemeLoader.tsx`, `components/ThemePicker.tsx`, `tests/unit/theme.test.ts`.
  - Files: DELETE all four files
  - Notes: `app/layout.tsx` imports `ThemeLoader` -- Rider A also updates `layout.tsx`.

- [ ] **Update `app/layout.tsx`** -- Remove `ThemeLoader` import and render. Update `<body>` class from `text-amber-400` to `text-gray-300`. Keep `GameProvider`, `Analytics`, `SpeedInsights`.
  - Files: `app/layout.tsx` (MODIFY)
  - Notes: Do not change `GameProvider` wrapping -- all game state depends on it.

- [ ] **Update `lib/richText.ts` color mappings** -- The `rt.*` helper functions are unchanged (they produce `<tag>text</tag>` strings). But the file currently has no color info -- colors live in `Terminal.tsx`. This task is a no-op on `richText.ts` itself; note this for documentation. The actual color update happens in Rider B's Terminal.tsx work, importing from `lib/ansiColors.ts`.
  - Files: No file changes needed in `lib/richText.ts`
  - Notes: Documenting that `richText.ts` tag helpers are stable -- only the rendering layer changes.

- [ ] **Signal STABLE checkpoint** (`core-layout-ansi#types`) -- Other Riders can begin once `lib/ansiColors.ts` and `components/GameLayout.tsx` are committed.

---

### Rider B: Terminal Rewrite
_Branch: `convoy/<id>/terminal-rewrite`_
_Depends on: A (for `lib/ansiColors.ts`, `GameLayout.tsx`)_

- [ ] **Update `components/Terminal.tsx`** -- Import `TAG_COLOR` and `MESSAGE_COLOR` from `lib/ansiColors.ts`. Replace the inline `TAG_COLOR` record (currently all amber variants) with ANSI-mapped colors. Replace `messageColor()` switch statement with lookup into `MESSAGE_COLOR`. Update the container div classes: remove `text-amber-*` references, set base `text-gray-300`. Keep: `memo` on `MessageLine`, `MAX_VISIBLE_MESSAGES` truncation, `role="log"`, `aria-live="polite"`, auto-scroll behavior, `parseRichText()` function.
  - Files: `components/Terminal.tsx` (MODIFY)
  - Tests: `tests/unit/terminal.test.ts` -- test that `parseRichText()` correctly wraps tags with new color classes; test `messageColor()` returns correct class for each message type
  - Notes: Extend the existing `TAG_NAMES` array if new semantic tags are needed. Currently: item, npc, enemy, exit, keyword, currency, condition, trait.

- [ ] **Update `components/CommandInput.tsx`** -- Remove `placeholder="type a command..."`. Change prompt from `>` to a dynamic MUD prompt showing HP. Read `player.hp`, `player.maxHp` from `useGame()`. Prompt format: `<HP:45/60> ` in `text-cyan-400`. Update all `text-amber-*` classes to ANSI equivalents: input text `text-gray-200`, caret `caret-gray-400`, border `border-gray-700`. Keep: command history (arrow up/down), autofocus, `parseCommand()`/`parseDialogueInput()` routing, `engine._appendMessages()` echo.
  - Files: `components/CommandInput.tsx` (MODIFY)
  - Notes: The prompt reads from `useGame()` which is already imported. During character creation (`authPhase === 'creating'`), the prompt can show `>` instead of HP (player doesn't exist yet). Rider H wires this conditional.

---

### Rider C: Sidebar + MiniMap
_Branch: `convoy/<id>/sidebar-minimap`_
_Depends on: A (for `GameLayout.tsx`, color system)_

- [ ] **Create `components/Sidebar.tsx`** -- Compact stats panel for the right column of `GameLayout`. Reads from `useGame()`. Displays:
  - Player name, class, level, cycle
  - HP bar: `[#####.....]  45/60` with color coding (green > 50%, yellow > 25%, red <= 25%)
  - XP progress: `Lv 3  XP: 45/120`
  - Current zone and room name
  - Time of day (using `getTimeOfDay()` from `lib/gameEngine.ts`)
  - Hollow Pressure meter (using existing `PressureMeter` logic from `StatusBar.tsx`)
  - Combat status when active (enemy name, enemy HP)
  - Embeds `<MiniMap />` component
  - Current room exits list (e.g., `Exits: [N] [E] [S]`) with exit directions in green
  - Files: `components/Sidebar.tsx` (CREATE)
  - Tests: `tests/unit/minimap.test.ts` -- (MiniMap tests, see below)
  - Notes: Reuse `xpForNextLevel()`, `getTimeOfDay()` from `lib/gameEngine.ts`. Reuse `formatZone()` pattern from `StatusBar.tsx`. Do NOT import from `StatusBar.tsx` (it gets deleted).

- [ ] **Create `components/MiniMap.tsx`** -- 5x5 ASCII grid rendered in a `<pre>` block inside the sidebar. Current room = `@` at center. Adjacent rooms shown as `#` with `-` (east/west) and `|` (north/south) connections. Unknown/no-exit cells = spaces. Uses only `currentRoom.exits` from `useGame()` -- no async room loading.
  - Files: `components/MiniMap.tsx` (CREATE)
  - Example output:
    ```
         #
         |
    #----@----#
         |
         #
    ```
  - Tests: `tests/unit/minimap.test.ts` -- test grid generation with various exit configurations (all 4 exits, 1 exit, no exits, up/down handling)
  - Notes: `up`/`down` exits don't render on the 2D grid. Show them as text below the grid: `[Up] [Down]`. Only `north`/`south`/`east`/`west` appear in the ASCII grid.

- [ ] **Delete `components/StatusBar.tsx`** -- Its functionality moves into `Sidebar.tsx`.
  - Files: `components/StatusBar.tsx` (DELETE)
  - Notes: `StatusBar` is imported in `PipBoyFrame.tsx` (which Rider H deletes) and nowhere else.

---

### Rider D: Text-Based Character Creation
_Branch: `convoy/<id>/terminal-creation`_
_Depends on: A (colors), B (terminal input routing)_

- [ ] **Create `lib/terminalCreation.ts`** -- Pure TypeScript module (no React) that drives character creation through the terminal. Exports:
  - `CreationState` type -- tracks current step (name, class, stats, loss_ritual substeps)
  - `initialCreationState(): CreationState`
  - `creationPrompt(state: CreationState): GameMessage[]` -- returns messages to display for the current step
  - `handleCreationInput(state: CreationState, input: string): { nextState: CreationState; messages: GameMessage[]; done?: boolean; result?: { name, stats, characterClass, personalLoss } }` -- processes player input, returns next state and messages
  - Files: `lib/terminalCreation.ts` (CREATE)
  - Tests: `tests/unit/terminalCreation.test.ts` -- test full creation flow: enter name -> select class (by number) -> allocate stats ("+vigor", "-vigor", "done") -> loss ritual (select type by number, enter detail, confirm) -> returns complete character data. Test edge cases: invalid class number, stat overflow, empty name.
  - Notes: Import `CLASS_DEFINITIONS` from `types/game.ts` for class data. Import `LOSS_VIGNETTES`, `PERSONAL_LOSS_OPTIONS` content from `CharacterCreation.tsx` -- extract these constants before deleting the component (or duplicate them in the new module). Loss ritual typewriter effect is NOT needed in terminal -- text prints instantly as `GameMessage[]` lines. The stat allocation uses the same `BASE=2`, `MAX_STAT=8`, `freePoints` from `CLASS_DEFINITIONS` logic.
  - Notes: Reuse `buildInitialStats()` and `statFloor()` logic from `CharacterCreation.tsx`. These are pure functions -- copy them into `terminalCreation.ts`.

- [ ] **Delete `components/CharacterCreation.tsx`** -- After extracting constants and logic into `lib/terminalCreation.ts`.
  - Files: `components/CharacterCreation.tsx` (DELETE)
  - Notes: `CharacterCreation` is imported in `app/page.tsx` (which Rider H rewrites).

---

### Rider E: In-Stream Death + Ending
_Branch: `convoy/<id>/terminal-death-ending`_
_Depends on: A (colors), B (terminal message format)_

- [ ] **Create `lib/terminalDeath.ts`** -- Pure TypeScript module that generates death, between-cycles, and ending narrative as `GameMessage[]` arrays. Exports:
  - `deathMessages(opts: { cycle, xpGained, roomsExplored, causeOfDeath, echoStats?, stashCount?, questMilestones? }): GameMessage[]` -- Includes: "YOU ARE DEAD" header, cause of death, stats box, "what carries forward" section, the `DEATH_NARRATIVE` text (from `DeathScreen.tsx`), closing line, "Type BEGIN to start a new cycle."
  - `theBetweenMessages(opts: { cycle, inheritedFactions?, discoveredRooms?, stashItems? }): GameMessage[]` -- Includes: "THE BETWEEN" header, the intro paragraph (from `TheBetween.tsx`), 3 random memory fragments (from `MEMORY_POOL`), echoes section, "You wake." line, cycle 2 stash tip, blank line.
  - `endingMessages(opts: { choice, cycle, totalDeaths, roomsExplored, xpEarned }): GameMessage[]` -- Includes: ending title, full narrative paragraphs (from `ENDING_NARRATIVES`), stats box, "THE END", "Thank you for playing The Remnant.", "Type NEWGAME to start fresh."
  - `prologueMessages(): GameMessage[]` -- The prologue text from `Prologue.tsx` `PROLOGUE_LINES` array, converted to `GameMessage[]`. Ends with "Type CONTINUE to begin character creation."
  - Files: `lib/terminalDeath.ts` (CREATE)
  - Tests: `tests/unit/terminalDeath.test.ts` -- test that each function returns non-empty message arrays with correct message types. Test that `deathMessages` includes "BEGIN" instruction. Test that `endingMessages` covers all 4 endings. Test that `theBetweenMessages` includes memory fragments. Test `prologueMessages` contains "Welcome to The Remnant".
  - Notes: Move constants from deleted components: `DEATH_NARRATIVE` from `DeathScreen.tsx`, `ENDING_NARRATIVES` and `ENDING_TITLES` from `EndingScreen.tsx`, `MEMORY_POOL` from `TheBetween.tsx`, `PROLOGUE_LINES` from `Prologue.tsx`. No typewriter effect -- text prints instantly as terminal messages.

- [ ] **Delete screen-takeover components** -- `components/DeathScreen.tsx`, `components/EndingScreen.tsx`, `components/TheBetween.tsx`, `components/Prologue.tsx`.
  - Files: DELETE all four
  - Notes: All are imported only in `app/page.tsx` (which Rider H rewrites).

---

### Rider F: Command-Driven Info (Enhanced Terminal Commands)
_Branch: `convoy/<id>/command-driven-info`_
_Depends on: A (colors)_

- [ ] **Enhance `handleStats` in `lib/actions/system.ts`** -- Add ANSI color formatting using `rt.*` helpers. Show HP bar with color coding. Show equipped weapon/armor with trait colors. Show class ability status. Show skills grid. The current `handleStats` output is plain text -- enhance it to match the richness of `StatTab.tsx` but as colored terminal text.
  - Files: `lib/actions/system.ts` (MODIFY -- `handleStats` function)
  - Notes: The `score` command already routes to `handleStats`. Add a `stat` alias if not present. Import color helpers from `lib/ansiColors.ts`. The existing `handleStats` already prints name, class, cycle, level, XP, HP, and all 6 stats. Enhance with: equipped items, class ability status, skill modifiers. Reuse data extraction patterns from `StatTab.tsx` (`equippedWeapon()`, `equippedArmor()`, `CLASS_ABILITY` record, `SKILL_STAT_MAP`).

- [ ] **Enhance `handleInventory` in `lib/actions/system.ts`** -- Add stash count display. Add equipped markers with color. The current implementation already lists inventory items with damage/defense stats and trait names. Enhance: show stash summary line ("Stash: 3/20 items. Type 'stash list' to view.").
  - Files: `lib/actions/system.ts` (MODIFY -- `handleInventory` function)
  - Notes: Stash data available via `engine.getState().stash`.

- [ ] **Enhance `handleHelp` in `lib/actions/system.ts`** -- Format with ANSI colors. Group commands by category (matching `CommandsTab.tsx` categories). Show syntax in one color, description in another. The current implementation already has categorized help -- enhance the visual formatting.
  - Files: `lib/actions/system.ts` (MODIFY -- `handleHelp` function)

- [ ] **Verify `handleQuests` and `handleMap`** -- These already print to terminal via `lib/actions/social.ts` and `lib/actions/travel.ts`. Verify ANSI color formatting is adequate. Add `rt.*` color tags to quest titles, faction names, zone names if not already present.
  - Files: `lib/actions/social.ts` (MODIFY if needed), `lib/actions/travel.ts` (MODIFY if needed)

- [ ] **Add `equipment` command** -- New command that shows detailed equipped weapon + armor + traits (content from the "Equipped" and "Equipment Traits" sections of `StatTab.tsx`). Route via parser.
  - Files: `lib/actions/system.ts` (MODIFY), `lib/parser.ts` (MODIFY -- add 'equipment' to command routing)
  - Notes: The parser (`lib/parser.ts`) has a `parseCommand()` function with a switch/if chain. Add 'equipment' / 'eq' as a new verb.

- [ ] **Delete all tab components** -- `components/tabs/StatTab.tsx`, `components/tabs/InventoryTab.tsx`, `components/tabs/MapTab.tsx`, `components/tabs/DataTab.tsx`, `components/tabs/CommandsTab.tsx`.
  - Files: DELETE all five
  - Notes: All imported only in `app/page.tsx` (which Rider H rewrites). Extract any data constants (like `SKILL_STAT_MAP`, `CLASS_ABILITY`, `FACTION_DISPLAY_NAMES`) into shared locations or duplicate them in the enhanced command handlers before deleting.

---

### Rider G: Landing Page + Login
_Branch: `convoy/<id>/landing-login`_
_Depends on: A (for `globals.css` rewrite)_

- [ ] **Rewrite `app/landing/page.tsx`** -- Replace BBS boot screen with a clean web landing page. Server Component (zero client JS). Structure:
  - Hero: Large title "The Remnant", subtitle "A post-apocalyptic text MUD", 2-sentence description
  - Features grid: "250+ hand-crafted rooms", "4 distinct endings", "9 factions", "Death cycle mechanic", "Text command interface", "Free to play"
  - Terminal excerpt: Reuse the existing look/go/look example but with proper ANSI-style colors (use inline styles or Tailwind classes -- it's a Server Component, no `useGame()`)
  - CTA: "Play Now" button linking to `/login`
  - Footer: "The Remnant -- Post-Collapse Survival Terminal. Browser-based. Free. Save persists across sessions."
  - Files: `app/landing/page.tsx` (REWRITE)
  - Notes: Keep the existing `metadata` export (title, description, openGraph). This is a Server Component -- no `'use client'`, no hooks. Style with Tailwind dark theme classes (bg-gray-950, text-gray-100, etc.). No CRT effects.

- [ ] **Simplify `app/login/page.tsx`** -- Replace themed terminal login with a clean form. Keep all Supabase auth logic unchanged. Update visual:
  - Clean dark background (bg-gray-950)
  - Title: "Sign In to The Remnant"
  - Email input with standard styling
  - Submit button: "Send Magic Link"
  - Success state: "Check your email for a sign-in link."
  - Remove: "IDENT CODE" language, "NO CLEARANCE REQUIRED" footer, terminal-themed text
  - Files: `app/login/page.tsx` (REWRITE)
  - Notes: Auth logic (`createSupabaseBrowserClient`, `signInWithOtp`, `emailRedirectTo`) is unchanged. Only visual presentation changes.

---

### Rider H: app/page.tsx Rewrite (Integration)
_Branch: `convoy/<id>/page-rewrite`_
_Depends on: A, B, C, D, E, F (integrates all Riders' work)_

- [ ] **Rewrite `app/page.tsx`** -- This is the integration task. Replace the entire component:
  - Remove all imports for deleted components: `PipBoyFrame`, `CharacterCreation`, `Prologue`, `DeathScreen`, `TheBetween`, `EndingScreen`, `ThemePicker`, `StatTab`, `InventoryTab`, `MapTab`, `DataTab`, `CommandsTab`
  - Remove `lib/theme` imports
  - Import new components: `GameLayout`, `Terminal`, `CommandInput`, `Sidebar`
  - Import new modules: `lib/terminalCreation`, `lib/terminalDeath`
  - Simplify `AuthPhase`: 'checking' | 'unauthenticated' | 'loading-player' | 'creating' | 'ready'
  - Remove `GamePhase` state machine -- death/ending are terminal events
  - Remove tab system (`activeTab`, `handleTabChange`, `TAB_IDS`, number key shortcuts)
  - Remove theme picker logic (`showThemePicker`, `THEME_KEY`)
  - Remove inventory hint, travel hint (these can print naturally via game engine)
  - New rendering:
    - During 'checking' / 'loading-player': Show `GameLayout` with "Connecting..." in terminal
    - During 'creating': Show `GameLayout` with terminal displaying creation prompts. CommandInput routes input to `handleCreationInput()` from `lib/terminalCreation.ts`
    - During 'ready': Show `GameLayout` with `<Terminal>` + `<Sidebar>` + `<CommandInput>`
  - Death handling: When `state.playerDead` becomes true, call `deathMessages()` and `theBetweenMessages()` from `lib/terminalDeath.ts`, append to log via `engine._appendMessages()`. Register a special handler so that when the player types `begin`, it triggers `engine.rebirthWithStats()` flow (which also runs character creation via terminal prompts)
  - Ending handling: When `state.endingTriggered`, call `endingMessages()`, append to log. Register `newgame` command.
  - Prologue: On first visit (no `localStorage` prologue key), call `prologueMessages()` and append to log before showing creation prompts. Player types `continue` to proceed.
  - Files: `app/page.tsx` (REWRITE)
  - Notes: Keep `ErrorBoundary` wrapping. Keep auth logic (Supabase `getUser()`, dev mode handling). Keep `useGame()` hook usage.

- [ ] **Delete `components/PipBoyFrame.tsx`** -- No longer needed.
  - Files: `components/PipBoyFrame.tsx` (DELETE)

- [ ] **Update `components/ErrorBoundary.tsx`** -- Change `text-amber-*` classes to ANSI equivalents: title `text-red-400`, description `text-gray-400`, error message `text-gray-500`, button border `border-gray-600` text `text-gray-300`.
  - Files: `components/ErrorBoundary.tsx` (MODIFY)

- [ ] **Pre-MR pipeline**
  1. `code-reviewer` -- resolve any blockers
  2. `test-runner` -- fix failures; note coverage gaps
  3. `git-agent` -- open MR

---

## Definition of Done

Every task in this plan is complete when:
- [ ] Code written and self-reviewed
- [ ] Tests written or updated for the changed logic
- [ ] `code-reviewer` passes with no blockers
- [ ] `test-runner` passes with no failures (target: >= 433 tests)
- [ ] MR opened via `git-agent` with coverage gaps (if any) noted in the description
- [ ] All `text-amber-*` classes removed from modified files
- [ ] No references to deleted components remain in any file
- [ ] Split-pane layout renders correctly at 1024px+ width
- [ ] Character creation, death, ending, and prologue all flow through the terminal with no screen takeovers

---

## References

- `app/page.tsx` -- current auth/game phase state machine (lines 56-389)
- `components/PipBoyFrame.tsx` -- current layout (76 lines)
- `components/Terminal.tsx` -- message rendering with `parseRichText()` (121 lines)
- `components/CommandInput.tsx` -- input handling with command history (110 lines)
- `components/StatusBar.tsx` -- stats display (109 lines, data patterns reused in Sidebar)
- `components/CharacterCreation.tsx` -- creation flow with loss ritual (672 lines, logic extracted to `terminalCreation.ts`)
- `components/DeathScreen.tsx` -- death narrative and stats (191 lines, constants move to `terminalDeath.ts`)
- `components/EndingScreen.tsx` -- 4 ending narratives (185 lines, constants move to `terminalDeath.ts`)
- `components/TheBetween.tsx` -- between-cycles interstitial (195 lines, MEMORY_POOL moves to `terminalDeath.ts`)
- `components/Prologue.tsx` -- opening narrative (150 lines, PROLOGUE_LINES moves to `terminalDeath.ts`)
- `lib/richText.ts` -- tag wrapper helpers (18 lines, unchanged)
- `lib/world.ts` -- room loading, `getRoom()`, `getExits()` (347 lines, used by MiniMap)
- `lib/gameEngine.ts` -- central dispatcher, `_appendMessages()` (the mechanism for printing to terminal)
- `lib/gameContext.tsx` -- React context with `useGame()` hook (71 lines, unchanged)
- `types/game.ts` -- `Room` interface with `exits: Partial<Record<Direction, string>>`, `Direction` type, `GameMessage` type
- `lib/actions/system.ts` -- existing `handleStats`, `handleInventory`, `handleHelp` (enhanced by Rider F)
- `tests/unit/theme.test.ts` -- deleted (theme system removed)
- Aardwolf MUD (https://aardwolf.com) -- reference for split-pane layout, ANSI colors, command-driven gameplay
