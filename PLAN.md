# PLAN: The Remnant — Current State & Roadmap
**Updated:** 2026-03-27
**Stack:** Next.js 16 · TypeScript strict · Supabase · Tailwind CSS 4 · Vitest
**Constraint:** `npx tsc --noEmit` zero-error before any commit. All migrations via `supabase db push --yes`.

---

# PLAN: UX Polish Pass for The Remnant
_Date: 2026-03-27 | Type: Feature (UX Enhancement) | Parallelizable: Yes (3 independent batches)_

## Goal
Polish the player experience with branding consistency, discoverability hints, accessibility fixes, visual feedback, and thematic aesthetic improvements—without redesigning the core interface.

## Background
The Remnant MUD is a text-based post-apocalyptic RPG with an amber-on-black terminal aesthetic. This polish pass addresses:
- Branding inconsistency: "MUD" references remain on login and character creation
- Discoverability gap: new players don't know Tab toggles inventory or that [INV] button exists
- Contrast failures: secondary/tertiary text uses WCAG-failing color classes (amber-800, amber-900 on black)
- Feedback gaps: command submission, save operations, and loading states lack visual confirmation
- Theme system disconnect: picker says theme is changeable in inventory but implementation was only at startup
- Missing signature visual: no DOOM-style ASCII logo on key screens (landing, death, endgame)

## Scope
**In scope:**
- Replace "MUD" branding with "THE REMNANT" on login and character creation pages
- Create shared DOOM-style ASCII logo component (monospace-compatible, reusable)
- Add one-time discoverability hint for new players about Tab/[INV] button
- Fix WCAG AA contrast failures: amber-800/900 text → amber-600/700 respectively
- Add animated loading states for auth, rebirth, and save operations
- Implement in-game theme picker in sidebar (instead of launch-only)
- Echo player commands in terminal before responses with visual differentiation
- Deploy logo to landing page, death screen, and any endgame/credits screen

**Out of scope:**
- Mobile UI fixes (desktop-first; flag as future task)
- Redesigning sidebar or terminal layout
- Adding new game features or mechanics
- Changes to content or lore

## Technical Approach
- **Branding:** Simple string replacements in `/app/login/page.tsx` and `/components/CharacterCreation.tsx`
- **ASCII Logo:** Create new shared component `/components/RemnantsLogo.tsx` (monospace text, max 80 chars wide for terminal compatibility); DOOM-style heavy/blocky rendering
- **Discoverability:** Add localStorage flag `hasSeenInventoryHint` in Sidebar component; render one-time hint after first room entry
- **Contrast fixes:** Bulk search-and-replace: `text-amber-800` → `text-amber-600` (secondary labels), `text-amber-900` → `text-amber-700` (tertiary text). Leave `border-amber-8/900` and `placeholder-amber-900` untouched (decorative/acceptable contrast)
- **Loading states:** Update button text in CharacterCreation and login to show animated feedback during long operations
- **Theme picker:** Add color swatch row to Sidebar below save button; reuse existing theme system and `remnant-theme-change` custom event
- **Command echo:** Modify CommandInput to dispatch a synthetic `system` message before action executes; Terminal already styles `system` type distinctly
- **Logo placement:** Pass `size` prop to control scale (small for landing, large for death screen)

## Technical Constraints
- All components use `'use client'` (client-side React only)
- TypeScript strict mode required
- Must reuse existing theme system (`/lib/theme.ts`), GameContext, and dispatch mechanism
- localStorage for one-time hints (no backend changes)
- No new dependencies beyond current stack
- All color choices must preserve the amber-on-black aesthetic

## File Inventory (from codebase reading)
- `/app/login/page.tsx` — login branding (line 50)
- `/components/CharacterCreation.tsx` — character creation branding (line 189), loading state (line 348)
- `/components/Sidebar.tsx` — inventory, hints, theme picker, save feedback (new sections)
- `/components/Terminal.tsx` — message styling (messageColor fn)
- `/components/CommandInput.tsx` — command echo dispatch (submit fn)
- `/components/RemnantsLogo.tsx` — **new shared component**
- `/app/landing/page.tsx` — landing page logo placement
- `/components/DeathScreen.tsx` — death screen logo placement
- `/components/TheBetween.tsx` — check if endgame screen (if exists)
- `/app/globals.css` — theme reference, CRT scanlines
- `/lib/theme.ts` — existing theme system (do not modify)

## Parallelization Strategy

This plan is parallelizable into **3 independent batches** with zero file conflicts:

### Batch 1 — Branding & Logo
- Creates new component: RemnantsLogo
- Modifies: login page, character creation, landing page, death screen
- No conflicts with other batches

### Batch 2 — Contrast & Feedback
- Modifies: command input, terminal, sidebar (save feedback), character creation (loading), login (loading)
- Bulk contrast fixes across all component files
- No conflicts with other batches (except Sidebar, which is also modified in Batch 3 but with different sections)

### Batch 3 — Discoverability & Theme
- Modifies: Sidebar only (adds hint section, theme swatch section)
- Uses localStorage for state
- No conflicts with other batches (except Sidebar, but changes are isolated to new sections)

**Resolution:** Sidebar is modified in both Batch 2 (save feedback) and Batch 3 (hint + theme). These modifications are to different sections:
- Batch 2 adds toast feedback **after** the save button
- Batch 3 adds hint at **top** of sidebar, and theme picker **below** save button
- If run in parallel: merge conflicts in Sidebar are minimal and localized to clear sections; can be resolved in code review

**Recommendation:** Run all three batches in parallel. Sidebar is the only potential merge point, but conflicts are easy to resolve because changes touch different logical sections.

---

## Tasks

### Batch 1: Branding & Logo (Files: RemnantsLogo.tsx, login, character creation, landing, death screen)

- [ ] **Create RemnantsLogo shared component** — DOOM-style ASCII art in monospace
  - Files: `/components/RemnantsLogo.tsx` (new)
  - Design notes:
    - Spell "THE REMNANT" in heavy/blocky ASCII art style (inspired by DOOM title screen)
    - Width: ≤80 chars for terminal compatibility (standard terminal width)
    - Props: `size?: 'small' | 'large'` to control scaling (small for landing preview, large for death screen)
    - Styling: `text-amber-300` or `text-amber-400`, maintain monospace font
    - Make it a pure functional component (no hooks)
    - Example ASCII concept (8-bit block style):
      ```
      ╔═══════════════════════════════════════════════════════════════════╗
      ║ ████████ ███████ ███████ ███    ███ ███    ██ █████  ██████████  ║
      ║ ██          ██      ██   ████  ████ ████   ██ ██   ██    ██       ║
      ║ ██████      ██      ██   ██ ████ ██ ██ ██  ██ ██████     ██       ║
      ║ ██          ██      ██   ██  ██  ██ ██  ██ ██ ██   ██    ██       ║
      ║ ████████    ██      ██   ██      ██ ██   ████ ██   ██    ██       ║
      ╚═══════════════════════════════════════════════════════════════════╝
      ```
      (Adjust to taste; keep monospace-safe characters only)
  - Tests: Render component with both `size` values; verify no line-wrapping on 80-char width; check styling applies correctly

- [ ] **Replace "MUD" branding on login page** — Update header text
  - Files: `/app/login/page.tsx`
  - Change: Line 50, `"MUD — Post-Apocalyptic Text Adventure"` → `"THE REMNANT — Post-Apocalyptic Text Adventure"`
  - Tests: Visit `/login` and verify header displays new branding

- [ ] **Replace "MUD" branding on character creation** — Update header text
  - Files: `/components/CharacterCreation.tsx`
  - Change: Line 189, `'MUD — Character Creation'` → `'THE REMNANT — Character Creation'`
  - Tests: Trigger character creation and verify header displays new branding

- [ ] **Add RemnantsLogo to landing page** — Integrate logo into marketing page
  - Files: `/app/landing/page.tsx`
  - Changes: Import RemnantsLogo; render with `size="large"` after the title/header section (around line 100); place before faction cards for maximum impact
  - Tests: Visit `/landing` and verify logo appears with correct styling and doesn't break layout

- [ ] **Add RemnantsLogo to death screen** — Integrate logo with fade-in timing
  - Files: `/components/DeathScreen.tsx`
  - Changes: Import RemnantsLogo; render with `size="large"` at the top of the visible area (before "YOU ARE DEAD" heading); add same fade-in `transition-opacity` as surrounding elements
  - Tests: Trigger death screen and verify logo fades in with the rest of the content

---

### Batch 2: Contrast Fixes & Feedback (Files: all component/page files, CommandInput, Terminal, Sidebar, CharacterCreation, login)

- [ ] **Audit and fix WCAG AA contrast failures** — Replace low-contrast amber classes
  - Files: Search across `/app/**/*.tsx` and `/components/*.tsx` for `text-amber-800` and `text-amber-900`
  - Specific files to check: `/app/login/page.tsx`, `/components/CharacterCreation.tsx`, `/app/landing/page.tsx`, `/components/Sidebar.tsx`, `/components/StatusBar.tsx`, `/components/ThemePicker.tsx`, `/components/Prologue.tsx`, `/app/page.tsx`, `/components/Terminal.tsx`, `/components/DeathScreen.tsx`
  - Contrast requirements:
    - `text-amber-800` (#92400e) on black = 2.8:1 (WCAG fail) → replace with `text-amber-600` (#d97706) = ~5.5:1 (WCAG AA pass)
    - `text-amber-900` (#78350f) on black = 1.9:1 (WCAG fail) → replace with `text-amber-700` (#b45309) = ~4.2:1 (WCAG AA pass)
    - Do NOT change: `border-amber-800`, `border-amber-900`, `placeholder-amber-900` (borders are decorative; placeholders can be lower contrast)
  - Approach: Use `grep -r "text-amber-8\|text-amber-9"` to find all; systematically update each file
  - Tests: Use a contrast checker tool on fixed text; verify 4.5:1 minimum for normal text; visually scan each screen (login, character creation, game, sidebar) for readability
  - Notes: This is a bulk visual fix; each change should be straightforward

- [ ] **Add command echo to terminal** — Show player input before game response
  - Files: `/components/CommandInput.tsx`, `/components/Terminal.tsx`
  - Changes to CommandInput:
    - In the `submit()` function (line 23), before `await dispatch(action)`, add:
      ```typescript
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          text: `> ${trimmed}`,
          type: 'system',
        }
      })
      ```
      (Or use the appropriate action type if the engine uses named actions)
    - This echoes the player's command immediately, before the response
  - Changes to Terminal:
    - In `messageColor()` function (line 14), ensure `case 'system'` returns a distinct color: `return 'text-amber-500'` (slightly dimmer than narrative amber-400) to visually differentiate from game output
  - Tests: Type a command, press Enter; verify the echoed command appears in the log in amber-500 before the game's response in amber-400; test multiple commands
  - Notes: Reuses existing `GameMessage` dispatch; no new state needed

- [ ] **Add "Saved." toast feedback** — Confirm save operations visually
  - Files: `/components/Sidebar.tsx`
  - Changes:
    - Add state: `const [savedFeedback, setSavedFeedback] = useState(false)`
    - In `handleSave()` function (line 23), after `setSaving(false)`, add:
      ```typescript
      setSavedFeedback(true)
      setTimeout(() => setSavedFeedback(false), 2000)
      ```
    - After the save button (around line 27), add:
      ```tsx
      {savedFeedback && (
        <div className="mt-1 text-amber-500 text-xs italic">Saved.</div>
      )}
      ```
  - Tests: Click save button in-game; verify "Saved." message appears briefly and disappears after 2 seconds
  - Notes: Keep it minimal and terminal-appropriate (no animation, no spinner)

- [ ] **Add animated loading states** — Improve feedback during async operations
  - Files: `/app/login/page.tsx`, `/components/CharacterCreation.tsx`
  - Changes to login page (line 93):
    - Current: `{loading ? 'Sending...' : 'Send Link'}`
    - Options:
      - A) Keep as-is (already sufficient)
      - B) Animate dots: `{loading ? `Sending${'.'.repeat((Math.floor(Date.now() / 300) % 4))}` : 'Send Link'}`
    - Recommendation: Keep current simple state (A); it's already good
  - Changes to CharacterCreation (line 348):
    - Current: `{submitting ? (isRebirth ? 'Awakening...' : 'Generating world...') : ...}`
    - Options:
      - A) Keep as-is (already sufficient)
      - B) Add CSS animation class that makes text blink or pulse
    - Recommendation: Keep current simple state (A); add a subtle pulse animation class if desired for "Awakening..."
  - CSS option (if implementing): Add to `/app/globals.css`:
    ```css
    @keyframes pulse-text {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    .pulse {
      animation: pulse-text 1.5s ease-in-out infinite;
    }
    ```
  - Tests: Create a character or login; watch button text during load phase; ensure feedback is clear
  - Notes: Terminal aesthetic prefers understatement—avoid spinners or complex animations; ellipsis or simple pulse is sufficient

---

### Batch 3: Discoverability & Theme (Files: Sidebar only, with localStorage)

- [ ] **Add one-time inventory hint** — Guide new players to Tab and [INV] button
  - Files: `/components/Sidebar.tsx`
  - Changes:
    - Add state: `const [showHint, setShowHint] = useState(false)`
    - In `useEffect` (or add new one), on mount:
      ```typescript
      useEffect(() => {
        if (!player) return
        const hasSeenHint = localStorage.getItem('hasSeenInventoryHint')
        if (!hasSeenHint) {
          setShowHint(true)
          localStorage.setItem('hasSeenInventoryHint', 'true')
        }
      }, [player])
      ```
    - Render hint conditionally at the top of the sidebar panel (after the "INVENTORY & STATS" header, before stats section):
      ```tsx
      {showHint && (
        <div className="mb-4 p-2 border border-amber-700 bg-amber-950 text-amber-400 text-xs rounded">
          <strong>Tip:</strong> Press Tab or click [INV] to toggle inventory and stats.
        </div>
      )}
      ```
  - Tests: First time opening inventory in a new game (new localStorage), hint should appear; click "CLOSE" or press Tab to hide; reload game or clear localStorage and reopen—hint should appear again; on second visit without localStorage clear, hint should NOT appear
  - Notes: Trigger hint display after first room entry (when `player` exists and game has started); this avoids flashing during loading

- [ ] **Add theme picker to sidebar** — Let players change theme in-game
  - Files: `/components/Sidebar.tsx`
  - Changes:
    - Import: `import { THEMES } from '@/lib/theme'`
    - Below the save button and "Saved." feedback (around line 28), add a new section separated by a border:
      ```tsx
      <div className="border-t border-amber-900 mt-3 pt-3">
        <div className="text-amber-600 text-xs uppercase tracking-widest mb-2">Signal</div>
        <div className="flex gap-1">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent('remnant-theme-change', { detail: { themeId: theme.id } })
                )
              }}
              className="w-5 h-5 rounded border border-amber-700 hover:border-amber-500 transition-colors"
              style={{ backgroundColor: theme.sampleColor }}
              title={theme.name}
              aria-label={`Change to ${theme.name} theme`}
            />
          ))}
        </div>
      </div>
      ```
    - Each swatch is a small clickable square (5x5 or 6x6) with the theme's sample color
    - Clicking dispatches the existing `remnant-theme-change` event (ThemeLoader already listens for it)
  - Tests: Open sidebar during game; verify theme swatches appear below save section; click each swatch; verify theme changes (filter applied); reload page; verify chosen theme persists (should be stored via existing system)
  - Notes: Reuse existing theme system—no new logic needed, just UI to trigger existing events

---

## Pre-MR Pipeline

- [ ] **Code review & parallel quality gates**
  1. Spawn `code-reviewer` to check for blockers (branding consistency, contrast ratios, component integration, no console errors)
  2. Spawn `test-runner` in parallel to run test suite; verify no regressions; note coverage gaps
  3. When both pass: Spawn `git-agent` to open MR

---

## Definition of Done

Every task in this plan is complete when:
- [ ] Code written and self-reviewed
- [ ] Changes tested locally (visual verification on login, character creation, game screens, sidebar, landing, death screen)
- [ ] WCAG AA contrast verified (4.5:1 minimum for normal text) using contrast checker or browser DevTools
- [ ] No TypeScript errors (`npx tsc --noEmit` passes)
- [ ] No console errors or warnings during gameplay
- [ ] `code-reviewer` passes with zero blockers
- [ ] `test-runner` passes with no test failures (coverage gaps are warnings, not blockers)
- [ ] MR opened via `git-agent` with summary of UX improvements

---

## References
- WCAG 2.1 Level AA: https://www.w3.org/WAI/WCAG21/quickref/ (contrast minimum 4.5:1 normal text, 3:1 large text)
- Existing theme system: `/lib/theme.ts` (THEMES array, custom event `remnant-theme-change`)
- Tailwind color reference: amber-600 (#d97706), amber-700 (#b45309)
- Terminal width convention: 80 characters (standard)
- DOOM title screen reference: heavy pixel/block ASCII art



---

## Current State Summary

### What's Done (Strong Foundation)
- ✅ **Core engine:** time-of-day, probabilistic spawning, combat, movement, inventory, stash, death/rebirth cycle
- ✅ **DB schema:** players, player_inventory, player_stash, player_ledger, generated_rooms, faction_reputation, quest_flags
- ✅ **Gate system:** skill gates, reputation gates, cycle gates, quest gates — all checked in movement.ts
- ✅ **Faction reputation:** tracked, displayed via `rep` command, gates enforced
- ✅ **Quest flags:** set/read in DB, gates enforced on exits
- ✅ **Lore reader:** `use [item]` / `read [item]` display loreText for lore-type items
- ✅ **The Between:** death screen with cycle-aware memory fragment text fully implemented
- ✅ **Actions split:** lib/actions/ (movement, combat, items, social, system, examine)
- ✅ **170 rooms:** 12 of 13 zones have content (The Pens is the only missing zone)
- ✅ **Landing page:** /landing static marketing page

### Room Count vs Target

| Zone | Act | Target | Have | Gap |
|------|-----|--------|------|-----|
| Crossroads | I | 18 | 18 | ✅ Done |
| River Road | I | 22 | 23 | ✅ Done |
| Covenant | I-II | 28 | 18 | -10 |
| Salt Creek Stronghold | I-II | 20 | 14 | -6 |
| The Ember | I-II | 16 | 10 | -6 |
| The Breaks | I-II | 22 | 16 | -6 |
| The Dust | II | 18 | 12 | -6 |
| The Stacks | II | 14 | 10 | -4 |
| Duskhollow Manor | II | 18 | 12 | -6 |
| The Pens | II-III | 14 | 0 | -14 |
| The Deep | II-III | 20 | 14 | -6 |
| The Pine Sea | II-III | 12 | 8 | -4 |
| The Scar / MERIDIAN | III | 28 | 15 | -13 |
| **TOTAL** | | **250** | **170** | **-80** |

---

## Track 1 — Quick Wins (Wiring Gaps)

These are systems that are ~70% built. Each is a focused 2–8 hour task.

### W-1 — `examine_extra` / `look <keyword>` handler
**Files:** `lib/actions/examine.ts`, `lib/gameEngine.ts`
**Problem:** `handleExamineExtra` is imported in gameEngine.ts line 33 and dispatched at line 778 but the handler body is empty (or missing). The `extras` array on rooms is richly populated but untriggerable.
**Fix:**
1. Implement `handleExamineExtra(keyword: string, state, supabase)` in examine.ts.
2. Match keyword against `room.extras[].keywords` (case-insensitive, partial match OK).
3. If `extra.skillCheck` exists, roll check against player stat. On fail: show `failMessage`. On success: show `description` and set `questFlagOnSuccess` if defined.
4. If no match: "You don't see anything special about that."
**Done when:** `look sign`, `look wall`, `look ground` work in cr_01; skill-checked extras resolve correctly.

### W-2 — NPC activity & disposition at runtime
**Files:** `lib/spawn.ts`, `lib/actions/social.ts`, `lib/gameEngine.ts`
**Problem:** `activityPool` and `dispositionRoll` are defined on every NPC spawn entry but never rolled. All NPCs show a static `room_description` and always have `neutral` disposition.
**Fix:**
1. Add `rollNpcActivity(npcSpawn: NpcSpawnEntry, timeOfDay: TimeOfDay): string` to spawn.ts — weighted random from `activityPool` filtered by current time.
2. Add `rollNpcDisposition(npcSpawn: NpcSpawnEntry): NpcDisposition` to spawn.ts — weighted random from `dispositionRoll`.
3. In `_applyPopulation()` (gameEngine.ts), call both when building the spawned NPC object.
4. In `handleTalk()` (social.ts), gate responses by disposition: `wary` → terse/reluctant, `hostile` → refuses or threatens, `friendly` → extra info.
5. Replace static NPC room line with rolled activity string.
**Done when:** Gate guard at cr_01 shows varied activity on room entry; disposition affects `talk` response.

### W-3 — Item depletion tracking
**Files:** `lib/actions/items.ts`, `lib/world.ts`, `lib/gameEngine.ts`
**Problem:** `room_state` table exists (with `depleted_item_ids`) but `handleTake` never writes to it. Items respawn on every room re-entry.
**Fix:**
1. In `handleTake()`, after successful item removal, call `recordDepletion(playerId, roomId, itemId)`.
2. In `_applyPopulation()`, fetch `room_state.depleted_item_ids` for current room and pass to `populateRoom()`.
3. In `populateRoom()`, skip any item whose id is in `depleted_item_ids`.
4. Respawn: each `ItemSpawnEntry` has `depletion.cooldownMinutes`. Clear depletion when `actionsTaken` has advanced enough time periods.
**Done when:** Taking a bandage from cr_07 means it's gone on re-entry; it respawns after ~1 in-game day.

### W-4 — Enemy defeat persistence
**Files:** `lib/actions/combat.ts`, `lib/world.ts`
**Problem:** Enemy defeat clears enemy from in-memory state but enemy re-spawns on next room re-entry.
**Fix:** Extend `room_state` to include `defeated_enemy_ids TEXT[]`. On kill, record enemy type + instance. In `_applyPopulation()`, pass defeated ids to `populateRoom()` to suppress re-spawn for 8 time periods.
**Done when:** Killing the Shuffler in a room means it's gone for a meaningful duration.

### W-5 — Squirrel companion wiring
**Files:** `lib/spawn.ts`, `lib/actions/social.ts`, `lib/gameEngine.ts`
**Problem:** `player_ledger` has `squirrel_alive`, `squirrel_trust`, `squirrel_name` columns. Character creation asks for squirrel name. Zero spawn/interaction logic.
**Fix:**
1. After cycle 1 death, if `squirrel_alive: true`, spawn squirrel as special NPC in shelter zone rooms.
2. `feed squirrel` command: increment trust (max 10), consume 1 food item from inventory.
3. Trust tiers: 0–3 skittish (flees on approach), 4–6 curious (follows to adjacent rooms), 7–10 loyal (prints warning on room entry if enemies present).
4. Squirrel can be killed by Brute/Hive Mother in occupied rooms. Sets `squirrel_alive: false`.
5. `name squirrel <name>` sets `squirrel_name` (constrained to Chippy/Stumpy per existing DB constraint).
**Done when:** Squirrel appears in Crossroads from cycle 2; trust increments; warning fires at high trust; can be named.

---

## Track 2 — Content: Zone Completion

Write rooms using the existing zone file schema. Match quality of crossroads.ts and river_road.ts — four time-of-day descriptions, extras with 3–5 keywords each, npcSpawns with activityPool and dispositionRoll, richExits with gating.

### C-1 — Covenant (+10 rooms, target 28)
**Current:** 18 rooms
**Needed:** Marshal Cross's inner office, courthouse, garrison barracks, underground archives, council chamber, Accord clinic overflow, holding cells, the wall walk, refugee processing, Accord quartermaster
**Priority lore hooks:** CHARON-7 suppression evidence in archives (sets quest flag for Scar access), Cross's faction questline entry

### C-2 — Salt Creek Stronghold (+6 rooms, target 20)
**Current:** 14 rooms
**Needed:** Briggs's command bunker, firing range, weapon depot, outer patrol circuit, prisoner pen, underground water reserve
**Priority lore hooks:** Salter defection subplot, prisoner who knows The Pens location

### C-3 — The Ember (+6 rooms, target 16)
**Current:** 10 rooms
**Needed:** Deacon Harrow's sanctum, the pyre room (active ritual), underground catacombs, bell tower, penitent quarters, reliquary
**Priority lore hooks:** Broadcaster signal received here, Kindling's CHARON-7 theology

### C-4 — The Breaks (+6 rooms, target 22)
**Current:** 16 rooms
**Needed:** Box canyon dead end (cache room), rope bridge crossing, Drifter camp, canyon shelter overnight spot, ancient petroglyphs site, slot canyon shortcut
**Priority lore hooks:** Petroglyphs reference pre-Collapse MERIDIAN surveying

### C-5 — The Dust (+6 rooms, target 18)
**Current:** 12 rooms
**Needed:** Abandoned ranch house, dry creek bed ambush point, ruined gas station, dust storm shelter, burned vehicle graveyard, border post ruins
**Priority lore hooks:** Letters Home lore items concentrate here

### C-6 — The Stacks (+4 rooms, target 14)
**Current:** 10 rooms
**Needed:** Lev's private workshop, server room (Broadcaster origin hint), roof observatory, sub-basement archive
**Priority lore hooks:** Reclaimers have partial MERIDIAN schematics

### C-7 — Duskhollow Manor (+6 rooms, target 18)
**Current:** 12 rooms
**Needed:** Lord Vayne's receiving hall, the blood tithe chamber, servant quarters, greenhouse (silver plants — danger), wine cellar, manor roof
**Priority lore hooks:** Covenant of Dusk's offer to player, Sanguine faction entry point

### C-8 — The Pens (14 rooms, entirely new)
**Current:** 0 rooms
**Zone theme:** The Red Court's livestock operation. Horror and rescue. Humans kept for blood. Former hospital repurposed.
**Rooms:** Intake processing, holding ward A/B/C, feeding chamber, guard station, Warden's office, escape tunnel entrance, underground passage, extraction room, incinerator, loading dock, perimeter fence, rooftop escape
**Gate:** Quest (must have Pens intel from prisoner in Salt Creek) + combat skill ≥ 6
**Priority:** This zone unlocks Act II-III and introduces the Red Court as primary antagonist

### C-9 — The Deep (+6 rooms, target 20)
**Current:** 14 rooms
**Needed:** Collapsed tunnel bypass, underground river crossing, bioluminescent fungus chamber, old mine foreman office, sinkhole descent, pressure seal door
**Priority lore hooks:** CHARON-7 spread underground via water table

### C-10 — The Pine Sea (+4 rooms, target 12)
**Current:** 8 rooms
**Needed:** Mountain overlook (sight line to The Scar), alpine meadow, ruined ski lodge, hidden Lucid camp
**Priority lore hooks:** The Lucid faction's cure research

### C-11 — The Scar / MERIDIAN (+13 rooms, target 28)
**Current:** 15 rooms
**Needed:** Facility exterior perimeter, checkpoint ruins, blast crater, underground entry, decontamination corridor, lab wing A (failed experiments), lab wing B (Sanguine origin), control room, broadcast station, Director's office, specimen vault, final chamber (MERIDIAN choice room × 4 variants)
**Gate:** Cycle 3+ AND multiple quest flags
**Priority:** This is the endgame. The Scar rooms can be written as a single focused session.

---

## Track 3 — Systems: Medium Effort

### S-1 — Hidden exits discovery
**Files:** `lib/actions/movement.ts`, `types/game.ts`
**Problem:** `RoomExit.hidden`, `discoverSkill`, `discoverDc`, `discoverMessage` exist in types but movement.ts never surfaces hidden exits.
**Fix:** In `handleLook()` or `handleSearch()`, roll skill check for any exit where `hidden: true`. On success, add exit to player's known exits for that room (stored in room flags). Hidden exits then appear in subsequent `look` output.

### S-2 — Flavor lines and flavor rolls
**Files:** `lib/gameEngine.ts`, `data/rooms/*.ts`
**Problem:** `environmentalRolls.flavorLines` is defined on room type but never rolled or displayed.
**Fix:** In `_applyPopulation()` or `handleLook()`, roll each flavor line against its spawnChance. Append triggered lines to room description. Low-probability lines (0.01) create rare memorable moments.

### S-3 — Personal loss echoes (room-level)
**Files:** `data/rooms/*.ts`, `lib/actions/movement.ts`
**Problem:** `personalLossEchoes` is read in movement.ts but no rooms have this field populated.
**Fix:** Add `personalLossEchoes` to 3–4 rooms per zone (type-gated: `loss_of_child`, `loss_of_partner`, etc.). These fire based on `player.personalLossType` set during character creation.

### S-4 — Infection system
**Files:** `lib/combat.ts`, `lib/actions/combat.ts`, `types/game.ts`
**Design:** Hollow bites have `infectionChance` (0.0–0.3 by type). Player tracks `infectionLevel` (0–100). Every 10 actions while infected, level rises by `pressureLevel`. At 100: death. Antibiotics clear infection. Between 50–99: hallucination flavor lines, stat debuffs, Hollow don't immediately attack.
**Done when:** Bite from Remnant can infect; antibiotics cure; infection visible in StatusBar.

### S-5 — Barter economy
**Files:** `lib/actions/social.ts`, `data/npcs.ts`, `types/game.ts`
**Design:** `trade <npc>` opens barter prompt. NPCs with `tradeInventory` defined will swap items. Currencies: Pennies (9mm ammo), Clears (water), White (salt), Miracles (antibiotics). No universal currency — faction preference matters.
**Done when:** `trade patch` in cr_07 lets you swap ammo for medical supplies.

---

## Track 4 — Endgame (Large Effort, Do After Content Is Complete)

### E-1 — MERIDIAN endings (4 endings)
Requires The Scar rooms complete (C-11). Four choices in the final chamber:
- **Cure:** Destroy CHARON-7 origin data. Hollow slow and begin to degrade over years. Pyrrhic.
- **Weapon:** Weaponize CHARON-7 variant. One faction gains decisive military advantage. Ambiguous.
- **Seal:** Bury it. Nothing changes. The world keeps going. Honest.
- **Throne:** Become the host. The virus completes you. You're the next Hive Mother. Dark.

### E-2 — Faction questlines (2–3 per faction)
Accord, Salters, Drifters, Kindling, Reclaimers each need:
- Entry quest (given by faction leader NPC)
- Mid-game quest (reputation ≥ Recognized)
- Climax quest (unlocks The Scar access via that faction's path)

### E-3 — The Echo mechanic
Previous-cycle Hollow: a Hollow in The Breaks or The Dust that exhibits the player's previous-cycle motor patterns. First encounter triggers a unique recognition moment. Requires tracking `player_echo_seed` in ledger.

### E-4 — The Broadcaster
Radio fragments scattered across zones (The Ember gets the signal strongest, The Stacks can decode it, MERIDIAN is the source). Assembling all fragments reveals the true nature of the facility and unlocks alternate path to The Scar.

---

## Convoy Plan

### Wave 1 — Quick Wins (sequential, ~2 days)
- **W-1** (examine_extra) — solo, no dependencies
- **W-2** (NPC activity/disposition) — solo, no dependencies
- **W-3 + W-4** (depletion + enemy defeat) — sequential (shared room_state)

### Wave 2 — Content Sprint (parallel-safe, can convoy)
All zone files are independent. Safe to spawn parallel workers.

- **Worker A:** C-1 (Covenant +10 rooms)
- **Worker B:** C-8 (The Pens, 14 new rooms) — highest priority, unlocks Act II-III
- **Worker C:** C-11 (The Scar +13 rooms) — highest narrative priority
- **Worker D:** C-3 + C-5 (Ember +6, Dust +6)
- **Worker E:** C-4 + C-6 (Breaks +6, Stacks +4)

Workers F–H can do remaining zones (C-2, C-7, C-9, C-10) in a second content convoy after Wave 2 merges.

**File scope per worker:**
- Worker A: `data/rooms/covenant.ts` only
- Worker B: `data/rooms/the_pens.ts` (new file) + `data/rooms/index.ts`
- Worker C: `data/rooms/the_scar.ts` only
- Worker D: `data/rooms/the_ember.ts`, `data/rooms/the_dust.ts`
- Worker E: `data/rooms/the_breaks.ts`, `data/rooms/the_stacks.ts`

### Wave 3 — Medium Systems (after content lands)
- **W-5** (squirrel)
- **S-1** (hidden exits)
- **S-2** (flavor lines)
- **S-3** (personal loss echoes)

### Wave 4 — Endgame (after medium systems)
- **S-4** (infection system)
- **S-5** (barter economy)
- **E-1** (MERIDIAN endings)
- **E-2** (faction questlines)

---

## Definition of Done

- [ ] **250 rooms:** All 13 zones complete with target room counts
- [ ] **Examine_extra:** `look <keyword>` works in every room with extras defined
- [ ] **NPC behavior live:** Activity pools rolled; dispositions affect dialogue
- [ ] **Depletion wired:** Taken items don't re-spawn immediately; enemies stay dead
- [ ] **Squirrel functional:** Spawns cycle 2+, trust system works, warning mechanic
- [ ] **The Pens built:** All 14 rooms with Red Court horror tone
- [ ] **The Scar complete:** All 28 rooms; MERIDIAN accessible at cycle 3+
- [ ] **Hidden exits:** discoverable via search/skill checks
- [ ] **Infection system:** Bite exposure → degradation → death; antibiotic cure
- [ ] **Barter:** `trade <npc>` functional for at least 5 NPCs
- [ ] **At least 2 faction questlines:** Accord and one other complete end-to-end
- [ ] **MERIDIAN endings:** All 4 endings reachable; Cure/Seal/Weapon/Throne
- [ ] **Tests:** >80% coverage on lib/ files; vitest zero failures
- [ ] **Zero TypeScript errors:** `npx tsc --noEmit` clean at all times

---

## Reference

- Room schema: see `data/rooms/crossroads.ts` (canonical example — best quality)
- Zone targets + lore: `content/the-remnant-MASTER-GAME-BIBLE.md` §1.4
- Room display spec: `content/the-remnant-room-display-spec.md`
- RNG system: `content/the-remnant-rng-system.md`
- Zone A script: `content/zone_a_crossroads.md`
- Zone B script: `content/zone_b_river_road.md`
- TypeScript check: `npx tsc --noEmit`
- Migration: `supabase db push --yes`
- Tests: `pnpm vitest run`

---

# Plan: PipBoy-Style UI Redesign for MUD Game
_Created: 2026-03-27 | Type: New Feature_

## Goal
Replace the current overlay-based sidebar with a fixed PipBoy-style frame containing all game UI: tabbed interface (TERM/STAT/INV/MAP/DATA), status bar, and command input — all rendered inside a rounded bezel with CRT scanlines restricted to the inner screen area.

## Background
The current UI uses an absolute-positioned overlay (Sidebar.tsx) that toggles visibility, obscuring the terminal. The redesign consolidates all game information into a single, always-visible frame that mimics the Pip-Boy aesthetic from Fallout: a gray bezel surrounding an amber-on-black screen with distinct tab sections for different information categories.

## Scope
**In scope:**
- PipBoyFrame wrapper component with rounded corners and zinc/gray bezel
- TabBar component (TERM, STAT, INV, MAP, DATA) with active tab highlighting
- StatTab component (character stats from current Sidebar)
- InventoryTab component (inventory + stash from current Sidebar)
- MapTab component (discovered waypoints visualization)
- DataTab component (quest flags, lore items, faction reputation)
- Refactor app/page.tsx to wrap all content in PipBoyFrame
- Update globals.css to confine CRT scanlines to inner screen area only
- Move StatusBar inside the frame
- Move CommandInput inside the frame
- Hide/grey tab bar during non-game phases (character creation, prologue, death, ending)
- Remove Sidebar.tsx entirely (replaced by tab system)
- Update all modal screens to render inside PipBoyFrame

**Out of scope:**
- Mobile responsiveness (desktop-first)
- Animation enhancements beyond current CRT effects
- Theme picker redesign (keeps current behavior but renders inside frame)
- Game logic changes

## Technical Approach

### Architecture
1. **PipBoyFrame** — New container component that provides:
   - Outer bezel: `bg-zinc-800`, rounded-xl corners, centered on screen
   - Inner screen area: `bg-black`, contains all content
   - Border between bezel and screen: thin inset shadow
   - Scratch marks: CSS pseudo-elements with subtle diagonal lines (~10% opacity)
   - Fixed max-width (~1400px) centered on screen
   - Flex column layout: tab bar → status line → main content → command input

2. **TabBar** — New component with 5 tabs:
   - Active state: `border-b-2 border-amber-400`
   - Inactive state: `text-amber-600 border-b border-amber-900`
   - Tabs: TERM, STAT, INV, MAP, DATA
   - Keyboard support for Tab key (cycles tabs, not open/close)

3. **Tab Content Components** (new):
   - `StatTab.tsx` — Stats, HP bar, class info, equipment (from Sidebar)
   - `InventoryTab.tsx` — Inventory, stash, theme selector, save button (from Sidebar)
   - `MapTab.tsx` — Discovered waypoints by zone (new; use handleMap output)
   - `DataTab.tsx` — Quest flags, lore items, faction reputation (new)
   - Terminal remains in TERM tab via existing Terminal component

4. **Refactored page.tsx**:
   - Wraps all game-phase content in `<PipBoyFrame>`
   - Modal screens (CharacterCreation, Prologue, DeathScreen, etc.) render inside frame
   - Tab bar hidden/greyed during non-game phases
   - Status line hidden during non-game phases

5. **CSS updates** (globals.css):
   - Move CRT scanline overlay from fixed position to relative to inner screen area only
   - Scanlines use `clip-path` or positioned inside a `.pipboy-screen` container
   - Bezel scratches: use `::before`/`::after` pseudo-elements or inline SVG

### Key Design Decisions
- **Fixed frame, not full screen** — Frame is ~1400px max-width, centered, always visible
- **Tabs stay visible during game** — StatusBar remains at top of frame for continuous awareness
- **Tab bar hidden during modals** — Theme picker, character creation, prologue, death, ending render without tabs
- **Tab cycling with Tab key** — Tab key now cycles active tab (not open/close) when sidebar hidden
- **CRT overlay scoped** — Scanlines only apply inside frame, not bezel
- **Reuse existing components** — Terminal, StatusBar, CommandInput move inside frame with minimal changes
- **Sidebar fully removed** — All functionality migrated to tabs; Sidebar.tsx deleted

### Constraints & Conventions
- All components remain `'use client'`
- TypeScript strict mode
- Tailwind CSS (no new dependencies)
- Maintain amber-on-black aesthetic inside screen
- Bezel is zinc-800/zinc-900 (gray contrast)
- No mobile optimization this pass

### File References (from codebase reading)
- `app/page.tsx` — Main orchestrator; will wrap everything in PipBoyFrame
- `components/Terminal.tsx` — Scrolling log; moves to TERM tab
- `components/StatusBar.tsx` — Status line; moves inside frame
- `components/CommandInput.tsx` — Input line; moves inside frame
- `components/Sidebar.tsx` — To be deleted; functionality → tabs
- `app/globals.css` — CRT overlay; update to scope scanlines
- `components/CharacterCreation.tsx`, `Prologue.tsx`, `DeathScreen.tsx`, `TheBetween.tsx`, `EndingScreen.tsx` — Render inside frame with hidden tab bar
- `lib/gameContext.tsx` — Provides game state (read to understand Tab key binding conflicts)
- `lib/theme.ts` — Theme persistence (TabBar may need to handle theme UI instead of Sidebar)

## Open Questions
- [ ] Should the frame be 100vh on desktop? (Suggest: yes, centered within viewport)
- [ ] Tab key behavior when sidebar hidden — should it cycle tabs or move focus? (Suggest: cycle tabs only during game phase)
- [ ] Should MapTab show real-time waypoint list or a visual map? (Suggest: list for MVP, visual later)
- [ ] Should DataTab be comprehensive lore/quest tracking, or minimal? (Suggest: minimal MVP; flags, items read, faction rep)
- [ ] CRT scanlines — use `clip-path` or wrap frame in container with `overflow: hidden`? (Suggest: container wrapper for cleaner scoping)

---

## Tasks

- [ ] **Create branch** — invoke git-agent to start `feature/pipboy-ui-redesign`
  - Notes: This is a large feature spanning multiple components; clear branch naming helps

- [ ] **Create PipBoyFrame wrapper component** — Outer bezel, inner screen, flex layout
  - Files: `components/PipBoyFrame.tsx` (new)
  - Description:
    - Root element: fixed width (~1400px), centered, `bg-zinc-800` rounded-xl
    - Outer bezel with inset shadow ring
    - Inner screen container: `bg-black`, contains all content
    - Pseudo-element scratch marks (diagonal lines, ~10% opacity)
    - Children render inside inner screen
  - Tests: Visual test — component renders with correct structure and bezel styling

- [ ] **Create TabBar component** — 5 tabs with active state
  - Files: `components/TabBar.tsx` (new)
  - Description:
    - Accepts `activeTab: 'term' | 'stat' | 'inv' | 'map' | 'data'`
    - Accepts `onTabChange: (tab) => void` callback
    - Renders 5 buttons in a row: TERM, STAT, INV, MAP, DATA
    - Active tab: `border-b-2 border-amber-400` text-amber-300
    - Inactive tabs: `border-b border-amber-900` text-amber-600
    - Hidden when phase is not 'ready' (passed via prop)
  - Tests: Clicking tabs calls `onTabChange`; styling changes on active state

- [ ] **Create StatTab component** — Stats, HP, equipment (from Sidebar content)
  - Files: `components/StatTab.tsx` (new)
  - Depends on: PipBoyFrame, TabBar
  - Description:
    - Reuse stat rendering logic from Sidebar (vigor, grit, reflex, wits, presence, shadow)
    - Show modifiers, level, XP
    - Show equipped items (e.g., `[eq]` flag)
    - Clean layout: stats section, then equipped items section
  - Tests: Renders all stats correctly; updates when `state.player` changes

- [ ] **Create InventoryTab component** — Inventory, stash, theme selector, save button (from Sidebar)
  - Files: `components/InventoryTab.tsx` (new)
  - Depends on: PipBoyFrame, TabBar
  - Description:
    - Reuse inventory rendering logic from Sidebar
    - Show stash with count (N/20)
    - Theme color selector (circles from Sidebar, same logic)
    - Save button with "Saving..." state and "Saved." feedback
    - Close button not needed (tab switching replaces it)
  - Tests: Inventory renders correctly; save button works; theme selector fires event

- [ ] **Create MapTab component** — Discovered waypoints by zone
  - Files: `components/MapTab.tsx` (new)
  - Depends on: PipBoyFrame, TabBar
  - Description:
    - Queries game state for discovered waypoints (likely in `state.map` or similar; check gameContext)
    - Display as list grouped by zone (similar to how zones appear in StatusBar)
    - Show waypoint name and zone
    - MVP: plain text list; styling matches Sidebar inventory list
    - Consider: if no waypoints discovered, show "NO WAYPOINTS DISCOVERED"
  - Notes: Will need to inspect gameContext to find waypoint data structure
  - Tests: Renders waypoints grouped by zone; empty state message when none discovered

- [ ] **Create DataTab component** — Quest flags, lore items, faction reputation
  - Files: `components/DataTab.tsx` (new)
  - Depends on: PipBoyFrame, TabBar
  - Description:
    - MVP sections:
      - Quest flags: `state.questFlags` or similar (boolean flags that gate content)
      - Lore items read: items the player has examined (track via `state.lore` or similar)
      - Faction reputation: if faction system exists, show reputations
    - Layout: three collapsible sections or tabs within DataTab
    - Text styling matches other tabs (amber on black)
  - Notes: Will need to inspect gameContext to find quest/lore/faction data structures; if not present, create stub that shows "NO DATA"
  - Tests: Renders empty state if no data; shows data when present

- [ ] **Update globals.css — scope CRT scanlines to inner screen only**
  - Files: `app/globals.css`
  - Depends on: PipBoyFrame created
  - Description:
    - Remove CRT overlay from `body::after` fixed positioning
    - Create `.pipboy-screen::after` for scanlines inside PipBoyFrame
    - Scanlines apply only within inner screen area (not bezel)
    - Use `clip-path` or `overflow: hidden` to contain effect
  - Tests: Visual — scanlines visible on screen, not on bezel

- [ ] **Move StatusBar inside PipBoyFrame**
  - Files: `components/StatusBar.tsx` (minor update)
  - Depends on: PipBoyFrame created
  - Description:
    - StatusBar remains unchanged; just repositioned in DOM
    - In app/page.tsx, render StatusBar as direct child of PipBoyFrame (above TabBar)
    - Add prop `hidden?: boolean` to hide during non-game phases
  - Tests: StatusBar renders at top of frame; hidden during non-game phases

- [ ] **Move CommandInput inside PipBoyFrame**
  - Files: `components/CommandInput.tsx` (minor update)
  - Depends on: PipBoyFrame created
  - Description:
    - CommandInput remains unchanged; just repositioned in DOM
    - In app/page.tsx, render CommandInput as last child of PipBoyFrame
    - Add prop `hidden?: boolean` to hide during non-game phases
  - Tests: CommandInput renders at bottom of frame; hidden during non-game phases; focus and submit work

- [ ] **Refactor app/page.tsx — wrap everything in PipBoyFrame**
  - Files: `app/page.tsx`
  - Depends on: PipBoyFrame, TabBar, StatTab, InventoryTab, MapTab, DataTab, StatusBar + CommandInput updates
  - Description:
    - Add state: `activeTab: 'term' | 'stat' | 'inv' | 'map' | 'data'` (default 'term')
    - Update Tab key handler: cycle tabs instead of toggling sidebar (only during game phase)
    - Render PipBoyFrame wrapping the entire game phase UI
    - Inside PipBoyFrame:
      - StatusBar (with `hidden={authPhase !== 'ready'}`)
      - TabBar (with `hidden={authPhase !== 'ready'}`)
      - Conditional render: show Terminal, StatTab, InventoryTab, MapTab, or DataTab based on `activeTab`
      - CommandInput (with `hidden={authPhase !== 'ready'}`)
    - Modal screens (CharacterCreation, Prologue, etc.) render inside PipBoyFrame with TabBar hidden
    - Remove Sidebar import and usage
  - Tests: Tab switching works; keyboard Tab key cycles tabs; all phases render correctly; game state updates trigger tab content re-renders

- [ ] **Update modal screens to render inside PipBoyFrame**
  - Files: `components/CharacterCreation.tsx`, `components/Prologue.tsx`, `components/DeathScreen.tsx`, `components/TheBetween.tsx`, `components/EndingScreen.tsx`
  - Depends on: app/page.tsx refactored
  - Description:
    - Modals currently render full-screen; update to render as content inside PipBoyFrame
    - Modals should fill the main content area (center vertically within frame)
    - TabBar should be visible but greyed out or disabled during modal phases
    - Status line hidden during modals
    - CommandInput hidden during modals
    - No other changes needed to modal logic or styling
  - Tests: Modals render inside frame; tab bar greyed/disabled; can't switch tabs during modal

- [ ] **Delete Sidebar.tsx**
  - Files: `components/Sidebar.tsx` (delete)
  - Depends on: app/page.tsx refactored, Tab key handling updated
  - Description: Remove Sidebar.tsx; all functionality moved to TabBar + InventoryTab
  - Tests: No import errors in page.tsx or elsewhere

- [ ] **Keyboard binding audit** — Ensure Tab key doesn't conflict
  - Files: Audit `CommandInput.tsx`, `app/page.tsx`, any global listeners
  - Depends on: Tab key handling in page.tsx refactored
  - Description:
    - Confirm Tab key in CommandInput doesn't interfere with tab cycling in page.tsx
    - Tab key should cycle tabs ONLY when CommandInput is NOT focused
    - When CommandInput is focused, Tab should not cycle tabs (let input handle it if needed)
  - Notes: May need to adjust CommandInput to not prevent Tab key
  - Tests: Tab key cycles tabs when not in input; doesn't cycle when input focused

- [ ] **Test theme switching in InventoryTab**
  - Files: `components/InventoryTab.tsx`, `lib/theme.ts`
  - Depends on: InventoryTab created
  - Description:
    - Ensure theme selector in InventoryTab fires `remnant-theme-change` event
    - Verify no conflicts with existing theme logic
    - Test theme persists across page reload
  - Tests: Clicking theme circle changes theme; event fires; persists in localStorage

- [ ] **Visual polish — frame sizing and centering**
  - Files: `components/PipBoyFrame.tsx`, potentially `app/layout.tsx`
  - Depends on: PipBoyFrame created and integrated
  - Description:
    - Verify frame is centered on screen
    - Confirm max-width is appropriate (~1400px)
    - Check that frame fills viewport height (100vh)
    - Ensure inner content scrollable if exceeds frame height
    - Adjust padding/margin for bezel appearance
  - Tests: Visual inspection — frame centered, properly sized, content scrollable

- [ ] **Pre-MR pipeline**
  1. `code-reviewer` — resolve any blockers; check for missed Sidebar references, prop drilling issues, Tab key conflicts
  2. `test-runner` — run full test suite; ensure no regressions; coverage gaps noted in PR
  3. `git-agent` — open MR with description of changes, testing done, and any known gaps

---

## Definition of Done

Every task in this plan is complete when:
- [ ] Code written and self-reviewed (especially Tab key handling and frame layout)
- [ ] All imports/exports checked (Sidebar removed entirely)
- [ ] Tests written or updated for new components and refactored logic
- [ ] Visual inspection: frame renders correctly, tabs switch, all content visible, CRT scanlines scoped
- [ ] Keyboard navigation works (Tab cycles tabs, no conflicts with input)
- [ ] All modal phases render inside frame without breaking existing behavior
- [ ] `code-reviewer` passes with no blockers
- [ ] `test-runner` passes with no failures
- [ ] MR opened via `git-agent` with coverage gaps (if any) noted in the description

---

## References
- **Current Sidebar implementation**: `/Users/ryan/projects/mud-game/components/Sidebar.tsx` — contains inventory, stats, stash, theme selector, save logic to migrate
- **Current StatusBar**: `/Users/ryan/projects/mud-game/components/StatusBar.tsx` — move inside frame
- **Current Terminal**: `/Users/ryan/projects/mud-game/components/Terminal.tsx` — no changes, render in TERM tab
- **Current CommandInput**: `/Users/ryan/projects/mud-game/components/CommandInput.tsx` — move inside frame
- **App orchestrator**: `/Users/ryan/projects/mud-game/app/page.tsx` — main refactor point
- **Game context**: `/Users/ryan/projects/mud-game/lib/gameContext.tsx` — check for waypoint, quest, lore data structures
- **Global styles**: `/Users/ryan/projects/mud-game/app/globals.css` — update CRT overlay scoping
- **Theme system**: `/Users/ryan/projects/mud-game/lib/theme.ts` — ensure InventoryTab integrates correctly
- **Modal screens**: `components/CharacterCreation.tsx`, `Prologue.tsx`, `DeathScreen.tsx`, `TheBetween.tsx`, `EndingScreen.tsx` — update to render inside frame

---

# Plan: Echoes — Narrative Persistence System

_Created: 2026-03-27 | Type: New Feature_

## Goal

Implement an Echoes system where NPCs remember player decisions across death/rebirth cycles, creating persistent narrative threads that branch based on what happened in previous cycles. Players on cycle 2+ see dialogue options and NPC reactions that reference their prior choices.

## Background

The MUD has a death/rebirth cycle system (via `rebirthCharacter()` in gameEngine.ts). Currently, reputation resets each cycle, and dialogue trees have no awareness of prior cycles. This disconnects narrative consequence from player action. Echoes closes that loop: snapshots of key decisions (ending choice, faction alignments, NPC relationships, completed quests) persist in `player_ledger`, and dialogue branches visible on cycle 2+ reference them, creating the feeling that NPCs recognize the player's return.

## Scope

**In scope:**
- Extend `PlayerLedger` with `cycleHistory` array tracking cycle-end state
- Add cycle snapshot on death (via `_handlePlayerDeath`) and ending trigger (via `setQuestFlag`)
- Compute `npcRelationships` from quest flags → dialogue gate conditions
- Add DB migration to player_ledger schema
- Extend `DialogueBranch` type with `requiresCycleMin`, `requiresPreviousRelationship`, `requiresPreviousEnding`, `requiresPreviousQuest`
- Enhance `checkBranchGates()` to check echo conditions
- Add 2-3 echo dialogue branches to 10 story-critical NPCs (Lev, Cross, Vesper, Harrow, Vane, Rook, Avery, Thorne, Echo, Sorrow)
- Implement 50% reputation carryover on cycle 2+ start

**Out of scope:**
- Squirrel echo memory (separate system)
- Room-specific cycle-gated content (already exists via `cycleGate`)
- Faction/reputation evolution UI (meta-progression visible, but not a visual overhaul)
- Testing against live players (testing harness only)

## Technical Approach

### A. Ledger Extension (types/game.ts + DB migration)

Add to `PlayerLedger` interface:

```typescript
export interface CycleSnapshot {
  cycle: number
  endingChoice?: EndingChoice
  factionsAligned: FactionType[]        // rep >= 2
  factionsAntagonized: FactionType[]    // rep <= -2
  npcRelationships: Record<string, 'trusted' | 'distrusted' | 'betrayed' | 'allied'>
  questsCompleted: string[]             // key milestone flags
  deathRoom?: string                    // room_id where player died (if death, not ending)
}

export interface PlayerLedger {
  // ... existing fields
  cycleHistory: CycleSnapshot[]         // NEW
}
```

New migration: `20260328000001_echoes_cycle_history.sql` — add JSONB column `cycle_history` to `player_ledger` table, default `[]`.

### B. Dialogue Branch Gate Extension (types/game.ts)

Add to `DialogueBranch` interface:

```typescript
export interface DialogueBranch {
  // ... existing fields
  requiresCycleMin?: number                    // NEW: only visible on cycle N+
  requiresPreviousRelationship?: {              // NEW: check cycleHistory
    npcId: string
    relationship: 'trusted' | 'distrusted' | 'betrayed' | 'allied'
  }
  requiresPreviousEnding?: EndingChoice         // NEW: 'cure' | 'weapon' | 'seal' | 'throne'
  requiresPreviousQuest?: string                // NEW: quest flag that was true in a prior cycle
}
```

### C. Snapshot Creation (lib/gameEngine.ts)

Add new helper function `_createCycleSnapshot()`:

- Reads current player state (cycle, currentRoomId, faction rep, quest flags)
- Computes `npcRelationships` by matching quest flags to NPC relationship patterns (see Mapping Table below)
- Filters `questsCompleted` for key milestone flags (e.g., `found_cure_research`, `discovered_charon_truth`)
- Returns a `CycleSnapshot` object

Call this in two places:
1. **Death**: `_handlePlayerDeath()` — add `deathRoom` from `currentRoomId`
2. **Ending**: `setQuestFlag()` when `flag === 'charon_choice'` — no `deathRoom`

After snapshot is created, save it to `player_ledger.cycle_history` array (append, do NOT overwrite).

### D. Reputation Carryover (lib/gameEngine.ts)

In `rebirthCharacter()`, after computing echo stats, add reputation inheritance:

- If ledger.cycleHistory exists and has >= 1 entry, find best rep per faction from all prior cycles
- Start new cycle at `floor(bestRep * 0.5)` per faction, minimum `-2`, maximum `+2`
- Example: previous Accord +3 → start cycle 2 at +1; previous Kindling -2 → start cycle 2 at -1

Write inherited rep to player row during the rebirth update.

### E. Echo Gate Check (lib/actions/social.ts)

Enhance `checkBranchGates()` to handle new gate types:

1. `requiresCycleMin`: check `player.cycle >= requiresCycleMin`
2. `requiresPreviousRelationship`: search `ledger.cycleHistory` for an entry where `npcRelationships[npcId] === relationship`
3. `requiresPreviousEnding`: search `ledger.cycleHistory` for entry with matching `endingChoice`
4. `requiresPreviousQuest`: search `ledger.cycleHistory` for entry where quest flag exists in `questsCompleted`

Return `passable: true` if gate satisfied, `reason` with hint text.

### F. Echo Dialogue Branches (data/dialogueTrees.ts)

For each of 10 story NPCs, add 2-3 new nodes + branches reachable only on cycle 2+. Examples:

**Lev (cycle 2+):**
- If `cycleHistory[previous].npcRelationships.lev === 'trusted'`: "You're back. I remember the data you showed me. Let's skip the formalities."
- If `cycleHistory[previous].npcRelationships.lev === 'distrusted'`: "You're back. And still demanding. The keycard costs more this time."

**Vane (cycle 2+, devastating):**
- If `cycleHistory[previous].endingChoice` exists: "You've been here before. You chose [previous ending]. Was it the right choice?"

**Cross (cycle 2+):**
- If `cycleHistory[previous].questsCompleted` includes `'cross_expedition_sanctioned'`: "You've done this before. Permit's pre-approved."

Node IDs follow pattern: `{npcId}_echo_cycle2_trust`, `{npcId}_echo_cycle2_ending`, etc.

All branches gate with `requiresCycleMin: 2` at minimum.

---

## NPC Relationship Mapping

Quest flag → (npcId, relationship):

| Quest Flag | NPC | Relationship | Meaning |
|---|---|---|---|
| `lev_trusts_player` | lev | trusted | Lev accepted your research assistance |
| `lev_distrusts_player` | lev | distrusted | Lev rejected your help |
| `player_betrayed_vesper` | vesper | betrayed | You revealed Vesper's secret |
| `vesper_shared_origin` | vesper | trusted | Vesper confessed origin to you |
| `cross_expedition_sanctioned` | cross | allied | Cross endorsed your expedition |
| `rook_offered_deal` + `rook_deal_accepted` | rook | allied | Rook made pact with you |
| `avery_betrayed` | avery | betrayed | You turned against Avery |
| `harrow_recognized_truth` | harrow | trusted | Harrow saw you see through doctrine |
| `player_alignment_kindling` | harrow | allied | You aligned with Kindling |
| `thorne_protected_camp` | thorne | trusted | Thorne defended you |
| `echo_enabled_data_breach` | echo | allied | Echo helped you access secured data |
| `sorrow_revealed_self` | sorrow | trusted | Sorrow showed true form |

**Q: How to discover mapping?** Read dialogueTrees.ts for patterns showing quest flag setting. Each `onEnter.setFlag` or branch outcome shows the quest flag being set. Cross-reference with NPC dialogue to infer relationship type.

---

## Open Questions

- [ ] **Key quest flags to snapshot**: Which flags count as "milestone"? Proposal: Any flag with name containing `_trusts_`, `_betrayed`, `_offered_deal`, `_recognized_truth`, `_shared_origin`, `_aligned_`, `_enabled_` → automatically included. Confirm this list with narrative design.
- [ ] **NPC list for echo branches**: Confirmed 10 story NPCs (Lev, Cross, Vesper, Harrow, Vane, Rook, Avery, Thorne, Echo, Sorrow). Should Sorrow echo? Check if Sorrow appears in dialogue trees and has relationship flags.
- [ ] **Reputation inheritance cap**: Proposal is ±2. Should it be different (±3, ±1)? Current max/min in-game is ±3, so capping at ±2 prevents instant "Blooded" without work.

---

## Definition of Done

Every task in this plan is complete when:
- [ ] Code written and self-reviewed
- [ ] Tests written or updated for the changed logic
- [ ] `code-reviewer` passes with no blockers
- [ ] `test-runner` passes with no failures
- [ ] MR opened via `git-agent` with coverage gaps (if any) noted in the description

---

## Tasks

### Phase 1: Types & Database

- [ ] **1. Extend types (types/game.ts)**
  - Add `CycleSnapshot` interface with fields: cycle, endingChoice, factionsAligned, factionsAntagonized, npcRelationships, questsCompleted, deathRoom
  - Add to `PlayerLedger`: `cycleHistory: CycleSnapshot[]`
  - Extend `DialogueBranch`: add requiresCycleMin, requiresPreviousRelationship, requiresPreviousEnding, requiresPreviousQuest
  - Tests: TypeScript compile check only (types are not unit-tested directly)
  - Notes: No runtime logic yet; just signature validation

- [ ] **2. Create database migration**
  - File: `/Users/ryan/projects/mud-game/supabase/migrations/20260328000001_echoes_cycle_history.sql`
  - Add JSONB column `cycle_history` to `player_ledger` table, default `'[]'`
  - Add comment describing the column structure
  - Tests: Run migration against local Supabase dev instance; verify column exists with correct type
  - Notes: Reversible (drop column if needed); no RLS changes required (same row-level policy applies)

### Phase 2: Engine — Snapshot & Reputation

- [ ] **3. Implement cycle snapshot helper (lib/gameEngine.ts)**
  - Add `_createCycleSnapshot()` method:
    - Input: current player state, deathRoom (optional string)
    - Output: CycleSnapshot object
    - Logic: compute npcRelationships from questFlags using mapping table, filter questsCompleted for key flags (flags matching pattern `*_trusts_*`, `*_betrayed*`, etc.), collect factions with rep >= 2 or <= -2
    - Tests: Unit test with mock player (cycle 2, various quest flags, faction rep) → verify snapshot structure and NPC mapping correctness
  - Depends on: Task 1 (types)
  - Notes: Do not call from anywhere yet; will be called in Tasks 4 & 5

- [ ] **4. Add snapshot on death (lib/gameEngine.ts)**
  - Modify `_handlePlayerDeath()`:
    - Call `_createCycleSnapshot(deathRoom: currentRoomId)` after setting isDead = true
    - Append snapshot to ledger.cycleHistory in Supabase (use `.update(..., {cycle_history: [...ledger.cycle_history, snapshot]})`)
    - Tests: Integration test with mocked Supabase; mock a death at cycle 2 with known quest flags → verify snapshot persisted to DB with deathRoom set
  - Depends on: Tasks 1, 3
  - Notes: Timing: snapshot persisted BEFORE rebirth flow, so rebirth can read it

- [ ] **5. Add snapshot on ending choice (lib/gameEngine.ts)**
  - Modify `setQuestFlag()` where `flag === 'charon_choice'`:
    - Call `_createCycleSnapshot()` with no deathRoom (ending, not death)
    - Persist to ledger.cycleHistory the same way as Task 4
    - Tests: Integration test; mock setting charon_choice to 'cure' at cycle 1 → verify snapshot appended to ledger, endingChoice === 'cure'
  - Depends on: Tasks 1, 3
  - Notes: Call this BEFORE the setTimeout logic that triggers endingTriggered

- [ ] **6. Implement reputation carryover (lib/gameEngine.ts)**
  - Modify `rebirthCharacter()`:
    - After computing echo stats, before updating DB:
      - If ledger.cycleHistory.length > 0, iterate all prior cycles
      - For each faction in FactionType, find max(rep) across all prior cycles
      - Compute inherited rep: `floor(bestRep * 0.5)`, clamped to [-2, +2]
      - Add inherited rep to the player update query
    - Tests: Unit test with mock ledger containing 2 cycles (Accord +3 in cycle 1, Salters -2 in cycle 1) → verify cycle 2 inherits Accord +1, Salters -1
  - Depends on: Tasks 1, 4, 5
  - Notes: Inherited rep is INITIAL rep for new cycle; players can raise/lower it during the cycle as normal

### Phase 3: Dialogue — Gates & Branches

- [ ] **7. Enhance branch gate check (lib/actions/social.ts)**
  - Modify `checkBranchGates()`:
    - Add handler for `branch.requiresCycleMin`: return passable if player.cycle >= requiresCycleMin
    - Add handler for `branch.requiresPreviousRelationship`: search ledger.cycleHistory for entry with matching npcId/relationship, return passable if found
    - Add handler for `branch.requiresPreviousEnding`: search ledger.cycleHistory for entry with matching endingChoice, return passable if found
    - Add handler for `branch.requiresPreviousQuest`: search ledger.cycleHistory for entry with quest in questsCompleted, return passable if found
    - Return reason hints like "(locked: requires cycle 2)" or "(available: previous Lev trust detected)"
    - Tests: Unit test with mock player cycle 1 vs cycle 2, various ledger states → verify gates return correct passable/reason
  - Depends on: Tasks 1, 4, 5
  - Notes: All gates are optional — absent gate = no restriction

- [ ] **8. Add echo branches for story NPCs (data/dialogueTrees.ts)**
  - For each NPC in [Lev, Cross, Vesper, Harrow, Vane, Rook, Avery, Thorne, Echo, Sorrow]:
    - Add 2–3 new nodes with IDs like `{npcId}_echo_cycle2_relationship`
    - Add branches from root node that gate with `requiresCycleMin: 2` AND `requiresPreviousRelationship`/`requiresPreviousEnding`/`requiresPreviousQuest`
    - Examples:
      - Lev: `requiresCycleMin: 2 + requiresPreviousRelationship: { npcId: 'lev', relationship: 'trusted' }` → "You're back. I remember the data you showed me. Let's skip the formalities."
      - Vane: `requiresCycleMin: 2 + requiresPreviousEnding: 'cure'` → "You've been here before. You chose cure. Was it the right choice? You look haunted by it."
      - Cross: `requiresCycleMin: 2 + requiresPreviousQuest: 'cross_expedition_sanctioned'` → "You've done this before. Permit's pre-approved."
    - Tests: Dialogue tree parse check (TypeScript compile + visual spot-check); manual test in dev: cycle 1 → set flags → trigger ending → rebirth → cycle 2 → talk to NPC → verify echo branch visible and functional
  - Depends on: Tasks 1, 7
  - Notes: These are purely additive — existing branches unchanged. Can be split by NPC group for parallel work.

### Phase 4: Quality & MR

- [ ] **9. Pre-MR pipeline**
  1. TypeScript compile check: `npm run type-check`
  2. Run `code-reviewer` agent → resolve any blockers
  3. Run `test-runner` agent → fix failures, note coverage gaps
  4. Run `git-agent` → create PR with description noting cycle snapshot structure and echo examples

---

## Parallelization

Tasks can run in parallel once dependencies are met:

- **Phase 1 (Types & DB)**: Tasks 1–2 can run in parallel (no inter-dependency)
- **Phase 2 (Engine)**: Task 3 can run after Tasks 1–2; Tasks 4–5 can run in parallel after Task 3; Task 6 after Tasks 4–5
- **Phase 3 (Dialogue)**: Task 7 after Task 1; Task 8 after Tasks 1, 7

**Suggested execution order for single agent:**
1. Task 1 (types)
2. Task 2 (migration) in parallel with Task 3
3. Tasks 4 and 5 in parallel
4. Task 6
5. Task 7
6. Task 8 (can split by NPC if multiple agents available)
7. Task 9

## References

- **Types**: `/Users/ryan/projects/mud-game/types/game.ts` (PlayerLedger, DialogueBranch, EndingChoice)
- **Engine**: `/Users/ryan/projects/mud-game/lib/gameEngine.ts` (rebirthCharacter, _handlePlayerDeath, setQuestFlag)
- **Dialogue gates**: `/Users/ryan/projects/mud-game/lib/actions/social.ts` (checkBranchGates)
- **Dialogue trees**: `/Users/ryan/projects/mud-game/data/dialogueTrees.ts` (all 18 NPC trees)
- **DB schema**: `/Users/ryan/projects/mud-game/supabase/migrations/20260327000001_cycle_system.sql` (player_ledger table)
- **Existing cycle/rebirth**: `/Users/ryan/projects/mud-game/lib/gameEngine.ts` lines 698–777 (rebirthCharacter function)

---

# Plan: Enhanced Combat and Item Trait System
_Created: 2026-03-27 | Type: New Feature_

## Goal
Implement a rich, tactical combat system with weapon traits, armor traits, class abilities, status effects, and enemy weaknesses that create emergent depth without slowing combat—enabling 3–8 turn fights with meaningful build choices and moment-to-moment tactical decisions.

## Background
The current combat system (`lib/combat.ts`) is straightforward: d10 + vigor vs. defense, weapon damage + vigor bonus, armor %-reduction. While mechanically sound, it lacks:
- **Build differentiation**: players with identical stats play identically
- **Tactical variety**: every turn is "attack" or "flee"
- **Enemy asymmetry**: each enemy feels like the same fight with different numbers
- **Emergent interactions**: weapon traits should create unexpected synergies

This plan adds:
1. Weapon/armor traits that scale with stats and create class/item synergies
2. Class-unique once-per-fight combat abilities tied to character fantasy
3. Status effects (bleed, burning, stunned, etc.) that persist 1–3 turns
4. Enemy-specific weaknesses and resistances based on lore
5. New combat verbs (`ability`, `defend`, `wait`, `analyze`)
6. Item tiers for clear progression feedback

## Scope

**In scope:**
- 6 trait categories (Damage, Utility, Special) with 20+ total traits
- 7 class combat abilities (one per class)
- 6 status conditions with mechanics (bleed, burn, stun, fear, poison, weak)
- Enemy weakness/resistance table (all 15 enemies)
- 5 armor traits
- 5 combat tier levels
- New action handlers: `ability`, `defend`, `wait`, `analyze`
- Trait UI labels and combat flavor text

**Out of scope:**
- Equipment crafting or enchanting system
- Cross-combat persistent effects
- Trait stacking/combination rules (traits are additive, no cascades)
- PvP trait balancing (single-player focus)
- Damage type interactions beyond immunity (poison immunity on Shuffler; fear on Whisperer)

## Technical Approach

### File Structure
New files to create:
- `lib/traits/weapons.ts` — weapon trait definitions, scaling functions
- `lib/traits/armor.ts` — armor trait definitions
- `lib/traits/conditions.ts` — status condition logic (apply, tick, remove)
- `lib/traits/weaknesses.ts` — enemy weakness/resistance lookup
- `lib/abilities/class.ts` — class ability definitions, usage tracking
- `types/traits.ts` — trait types, condition enums

Existing files to modify:
- `types/game.ts` — extend `Item` with traits, `CombatState` with conditions + ability used flag
- `lib/combat.ts` — integrate traits into damage calculation, add condition application/ticking
- `data/items.ts` — add trait assignments to all 151 items
- `data/enemies.ts` — add weakness/resistance to all 15 enemies
- `lib/actions/combat.ts` — new action handlers for ability/defend/wait/analyze
- `lib/dice.ts` — condition-aware attack roll modifiers

### Design Philosophy
- **Traits are descriptions of mechanics, not hidden numbers**: when you hit with a Vicious weapon, the message says "Blood seeps from the wound" (bleed applied), not "Vicious trait triggered"
- **Conditions are temporary debuffs only, never buffs**: keeping combat push-forward momentum
- **Enemy weaknesses are narrative-rooted**: Brutes are armored (Heavy resist), Screamer's throat is fragile (Heavy weakness)
- **Class abilities are once-per-fight power spikes**, not tactical bombs—Enforcer's Overwhelm costs 2 HP, Scout's Mark is free but uses action economy
- **Tier progression is visible in UI**: players see "Scrap T1", "Salvage T2", etc. every time they equip

---

## Trait System Details

### 1. Weapon Traits (20 total)

Traits are applied at item definition time (`data/items.ts`). Each weapon gets 1–2 traits. Traits scale with specific stats or are always-on.

#### Damage Traits (5)
- **Keen** [Melee/Ranged]
  - +1 crit chance per 2 reflex (max +2)
  - Message: "You find an opening. The strike is precise." / "You carve a deep wound."
  - Scales with reflex (precision > brute force)
  - Weak against: Sanguine Feral (50% resist—too quick to crit)

- **Heavy** [Melee]
  - Damage +1 always. Crits stun enemy 1 turn (DC 11 STR save).
  - Message: "Weight and momentum converge. It staggers." / "The impact drives the air from its lungs."
  - Scales with vigor (only strong characters leverage it fully)
  - Strong against: Brutes (Heavy crit stun breaks their pattern)

- **Vicious** [Melee]
  - Hit applies Bleed (1 HP/turn for 2 turns).
  - Message: "Blood seeps from the wound."
  - Scales with nothing (always triggers on hit)
  - Weak against: Shuffler (immune to bleed—no circulation)

- **Scorching** [Melee/Ranged]
  - Hit applies Burning (2 HP/turn for 1 turn, then ends).
  - Message: "Flames engulf the target."
  - Scales with nothing (fixed damage)
  - Strong against: Shuffler (2x burning damage—decomposing tissue lights easy)

- **Draining** [Melee]
  - On hit: recover 1 HP (min 1, max 3 based on vigor bonus).
  - Message: "The weapon drinks. You feel strength return."
  - Scales with vigor (higher vigor = more healing)
  - Strong against: Whisperer (lifesteal resists psychic drain)

#### Utility Traits (5)
- **Quick** [Melee/Ranged]
  - +1 initiative per 2 reflex.
  - Message: "Your instincts are sharp. You strike first."
  - Scales with reflex
  - No weakness (initiative is universal)

- **Precise** [Ranged]
  - +1 to hit per 2 wits.
  - Message: "You line up the shot carefully. It lands true."
  - Scales with wits (smart aiming)
  - Weak against: Brutes (armor makes precision less effective, -1 damage)

- **Silenced** [Melee/Ranged]
  - Attacks do not trigger noise encounters (no Hollow drawn).
  - Message: "The attack is silent. No sound carries."
  - Scales with nothing (always on)
  - No weakness

- **Blessed** [Melee]
  - +1 damage per 2 presence (spiritual authority).
  - Against Hollow: +2 bonus (holy power). Against Sanguine: +3 bonus (their ancient enemy).
  - Message: "Divine authority courses through you." / "The blade glows faintly. The creature recoils."
  - Scales with presence
  - No weakness (always beneficial)

- **Disrupting** [Melee]
  - On crit: applies Weakened (1 turn, -50% damage output).
  - Message: "Your strike destabilizes its form."
  - Scales with nothing (crit-dependent)
  - Strong against: Hive Mother (disrupts pheromonal coordination)

#### Special Traits (3)
- **Cursed** [Melee]
  - +2 damage always. On hit: lose 1 HP (cost of using dark power).
  - Message: "Dark power surges. The blow lands hard. You feel it drain you."
  - Scales with nothing (fixed bonus and cost)
  - Weak against: Warden class (conviction resists curses, negate cost)

- **Sanguine-Forged** [Melee]
  - Damage x1.5 against Sanguine only. Against Hollow: x0.5 damage (weapon is attuned to Sanguine biology).
  - Message: "The blade resonates. The creature convulses." (vs Sanguine) / "The weapon feels inert against it." (vs Hollow)
  - Scales with nothing (fixed multipliers)
  - Weak against: Generic Hollow (half damage is a big miss)

- **Verdant** [Melee]
  - +1 max HP per hit (stacks up to +3 per fight).
  - Message: "Life flows into you. You feel renewed."
  - Scales with nothing (healing on hit)
  - No weakness

---

### 2. Armor Traits (5)

Armor traits modify damage intake, provide condition resistance, or grant special effects.

- **Fortified**
  - +1 flat damage reduction (in addition to % reduction).
  - Heavy armor. Example: "This vest has steel plates."
  - No weakness

- **Reactive**
  - 10% chance per turn to negate an incoming status condition.
  - Magical armor. Example: "Runes shimmer across the surface."
  - No weakness

- **Insulated**
  - 100% immunity to Burning condition.
  - Specialized armor. Example: "Fire-resistant weave."
  - No weakness

- **Warded**
  - -2 to any Fear/Psychic rolls (composure +2 bonus).
  - Protective magic. Example: "Protective sigils glow faintly."
  - No weakness

- **Reflective**
  - 5% chance per turn to reflect 1 attack back (attacker takes 1 damage).
  - Mirrors or shiny surfaces. Example: "Polished chrome panels."
  - No weakness

---

### 3. Status Conditions (6)

Conditions are applied during combat and tick down each round. All damage is reduced if the player is Weakened; accuracy is reduced if Poisoned or Frightened, etc.

| Condition | Duration | Effect | Application |
|-----------|----------|--------|-------------|
| **Bleed** | 2 turns | 1 HP/turn damage | Vicious trait, Brute claw attack |
| **Burning** | 1 turn | 2 HP/turn damage | Scorching trait, environmental fire |
| **Stunned** | 1 turn | Skip next action (pass turn) | Heavy crit, Brute charge (stun save), Enforcer Overwhelm |
| **Poisoned** | 3 turns | -1 attack roll, 1 HP/turn damage | Whisperer attack, environmental |
| **Frightened** | 2 turns | -2 to all rolls | Fear check failure (room entry), Whisperer scream |
| **Weakened** | 1 turn | -50% damage output (round down) | Disrupting crit, Hive Mother presence |

**Condition Interaction Rules:**
- Conditions stack independently (can have Bleed + Poisoned at once)
- Reactive armor can negate any condition on application (10% per application)
- Warded armor prevents Fear application (100%)
- Insulated armor prevents Burning application (100%)

---

### 4. Enemy Weaknesses & Resistances Table

Each enemy has:
- **1 weakness**: Trait or damage type that deals +2–5 damage
- **1 resistance**: Trait or condition that deals -50% or is immune

| Enemy | Weakness | Resistance | Rationale |
|-------|----------|-----------|-----------|
| Shuffler | Scorching (+2x) | Bleed (immune) | Shambling dead tissue; no circulation |
| Remnant | Disrupting (+3 dmg) | Stun (50% resist) | Retained cognition can suppress paralysis |
| Screamer | Heavy (+2 dmg) | Poison (immune) | Fragile vocal tissue; toxic biology |
| Brute | Keen (+1 crit) | Heavy (50% resist) | Slow but heavily muscled; thick hide absorbs blunt |
| Whisperer | Blessed (+3 dmg) | Fear (immunity) | Psychic entity; amplified by holy; causes fear itself |
| Stalker | Fire (2x DOT) | Keen (50% resist) | Fast predator; quick reflexes dodge precision strikes |
| Hive Mother | Disrupting (+4 dmg) | All DOT (50% resist) | Colony organism; bleeds spread; fire stops swarm coordination |
| Sanguine Feral | Sanguine-Forged (x1.5) | Stun (immune) | Supernatural reflex; Sanguine weapons resonate |
| Red Court Enforcer | Blessed (+2 dmg) | Poison (50% resist) | Corrupt Sanguine; holy power hurts; toxins adapted |
| Elder Sanguine | Blessed (+5 dmg), Silver (2x) | Disrupting (immune) | Ancient predator; only holy/silver hurt; too evolved to disrupt |

**Notes on Resistance:**
- Immunity: condition/trait has 0% effect
- 50% resist: condition half-damage (Bleed 0.5 HP/turn), halved duration (round down), or -1 accuracy modifier instead of -2
- Weakness: +X damage flat, or multiplier (x2, x1.5), or guaranteed condition application

---

### 5. Class Combat Abilities (7 total)

Each class gets ONE unique ability usable once per fight. Abilities are declared before the attack roll and resolve independently.

#### Enforcer: Overwhelm
- **Cost**: 2 HP
- **Effect**: Your next attack ignores armor (damage vs enemy defense, no % reduction).
- **Message**: "You drive through its defenses with raw power."
- **Scaling**: None (flat effect)
- **Lore**: Brute force combat mastery

#### Scout: Mark Target
- **Cost**: Free action (does not consume turn)
- **Effect**: Next 2 of your attacks gain +3 to hit.
- **Message**: "You sight the target. Weak points become clear."
- **Scaling**: None (flat effect)
- **Lore**: Tactical awareness

#### Wraith: Shadowstrike
- **Cost**: Free (requires you to be hidden/undetected)
- **Effect**: Attack from stealth. Guaranteed critical hit if enemy has not seen you. Ends stealth.
- **Message**: "You emerge from the dark. The strike finds the killing blow."
- **Scaling**: None (crit is fixed)
- **Lore**: Assassin's training

#### Shepherd: Mend
- **Cost**: Action (consumes turn)
- **Effect**: Heal 1d6 + (presence mod) HP. Requires a field_medicine check (DC 8) to succeed. On failure: no healing but you don't lose the ability (retry next turn).
- **Message**: "Hands steady. Focus shifts inward. Wounds knit."
- **Scaling**: Presence (determines healing amount)
- **Lore**: Field medicine mastery

#### Reclaimer: Analyze
- **Cost**: Free action (does not consume turn)
- **Effect**: Reveal enemy's current HP%, all weaknesses, all resistances, and remaining ability uses.
- **Message**: "You catalogue the thing's weaknesses. Knowledge is power."
- **Scaling**: None (information only)
- **Lore**: Encyclopedic understanding

#### Warden: Brace
- **Cost**: Action + initiative
- **Effect**: Skip this turn. Reduce all incoming damage by 50% for the next incoming enemy attack.
- **Message**: "You set your stance. The blow still lands, but glancing."
- **Scaling**: None (fixed reduction)
- **Lore**: Unwavering defense

#### Broker: Intimidate
- **Cost**: Action (consumes turn)
- **Effect**: Enemy must roll an intimidation check (DC = your presence + wits/2, max DC 18). On failure: enemy skips next turn. On success: attack proceeds normally.
- **Message**: "You bare teeth. Its resolve wavers." / "It hisses. Your bluff fails."
- **Scaling**: Presence + Wits (determines DC)
- **Lore**: Information broker's persuasion

---

### 6. New Combat Verbs

**ability** — Use your class ability (once per fight)
- Syntax: `ability` (no target needed; resolves against current enemy)
- Checks if ability is available. If already used, error.
- Executes ability (Overwhelm, Mark, Shadowstrike, Mend, Analyze, Brace, Intimidate)
- Consumes turn (except Scout Mark, Wraith Shadowstrike, Reclaimer Analyze)
- Follow-up turn is enemy's turn (if ability consumed action)

**defend** — Defensive stance (skip attack, reduce incoming damage)
- Syntax: `defend`
- Your turn is consumed
- Next incoming enemy attack: damage -30% (round down, min 1)
- Stacks with armor (% reduction applies first, then -30%)
- Message: "You brace for impact."

**wait** — Patience bonus (skip attack, gain +2 on next attack)
- Syntax: `wait`
- Your turn is consumed
- Next attack you make: +2 to hit (in addition to any trait bonuses)
- Bonus consumed on next attack (expires if you defend/wait/ability instead)
- Message: "You wait for the right moment."

**analyze** — Scan the enemy (if not Reclaimer, DC 11 Wits check required)
- Syntax: `analyze` or `scan`
- For Reclaimer: free action, no check, full info
- For others: consumes turn, needs Wits check; on success, reveal info; on failure, nothing
- Info revealed: HP%, weaknesses, resistances, active conditions
- Message: "You study its form." or "The details escape you."

---

### 7. Item Tier System

Items are categorized into 5 tiers based on lore and mechanical power. UI shows tier on equip.

| Tier | Name | Damage Range | Defense Range | Examples | When Found | Flavor |
|------|------|--------------|---------------|----------|-----------|--------|
| T1 | Scrap | 1–3 | 0–1 | Pipe wrench, scrap vest | Starting zones, surface | Salvaged junk |
| T2 | Salvage | 4–5 | 1–2 | Combat knife, leather jacket | Lower zones | Pre-Collapse consumer goods |
| T3 | Military | 6–8 | 2–3 | 9mm pistol, reinforced coat | Mid zones | Military/police stock |
| T4 | Pre-Collapse | 10–12 | 3–4 | Shotgun, kevlar vest | Late zones, rare drops | Advanced tech |
| T5 | MERIDIAN | Variable | Variable | Silver knife, hazmat suit | Quest reward only | Experimental/recovered artifacts |

**Tier Assignment Rules:**
- Weapons: damage stat determines tier
- Armor: defense stat determines tier
- Consumables: healing/stat bonus determines tier
- Rarity: higher tiers are rarer in loot tables

---

## Tasks

### Phase 1: Data Structures (2 tasks)
These must complete first; all other tasks depend on them.

- [ ] **Task 1: Create trait type definitions** (`types/traits.ts`)
  - Define `WeaponTrait` interface: { id, name, description, category, statScaling?, effect }
  - Define `ArmorTrait` interface: { id, name, description, effect }
  - Define `Condition` enum: Bleed, Burning, Stunned, Poisoned, Frightened, Weakened
  - Define `ConditionEffect` interface: { duration, damagePerTurn?, modifierPenalty?, skip? }
  - Define `ItemTier` type: 'T1' | 'T2' | 'T3' | 'T4' | 'T5'
  - Files: Create `/Users/ryan/projects/mud-game/types/traits.ts`
  - Tests: Type imports succeed; no runtime logic to test

- [ ] **Task 2: Extend game.ts with trait support**
  - Add `traits?: string[]` to `Item` interface
  - Add `conditions?: Partial<Record<Condition, number>>` to `CombatState` (duration remaining)
  - Add `abilityUsed?: boolean` to `CombatState` (track once-per-fight ability)
  - Add `braceDamageReduction?: number` to `CombatState` (Warden Brace defense bonus)
  - Add `markedAttacks?: number` to `CombatState` (Scout Mark remaining uses)
  - Add `waitBonus?: number` to `CombatState` (patience bonus, expires on attack)
  - Add `tier?: ItemTier` to `Item` interface
  - Files: Modify `/Users/ryan/projects/mud-game/types/game.ts`
  - Tests: Type-check all usages; build passes

---

### Phase 2: Trait Definitions (3 tasks)
Can run in parallel once Phase 1 is done.

- [ ] **Task 3: Define all weapon traits** (`lib/traits/weapons.ts`)
  - Export `WEAPON_TRAITS: Record<string, WeaponTrait>`
  - Include all 20 traits: Keen, Heavy, Vicious, Scorching, Draining, Quick, Precise, Silenced, Blessed, Disrupting, Cursed, Sanguine-Forged, Verdant, +7 more
  - Each trait: { id, name, description, category ('damage' | 'utility' | 'special'), statScaling? ('vigor' | 'reflex' | 'wits' | 'presence' | null) }
  - Export helper: `applyWeaponTrait(trait, player, enemy, damage) => { damage, messages, conditions }`
  - Files: Create `/Users/ryan/projects/mud-game/lib/traits/weapons.ts`
  - Notes: Do NOT implement condition application yet (Task 5 handles that)
  - Tests: Unit test each trait definition; verify scaling math

- [ ] **Task 4: Define all armor traits** (`lib/traits/armor.ts`)
  - Export `ARMOR_TRAITS: Record<string, ArmorTrait>`
  - Include all 5 traits: Fortified, Reactive, Insulated, Warded, Reflective
  - Each trait: { id, name, description, effect (function or string) }
  - Export helper: `applyArmorTrait(trait, incomingDamage, condition?) => { damage, conditionNegated }`
  - Files: Create `/Users/ryan/projects/mud-game/lib/traits/armor.ts`
  - Tests: Unit test damage reduction logic; verify condition interaction

- [ ] **Task 5: Define status conditions** (`lib/traits/conditions.ts`)
  - Export `CONDITIONS: Record<Condition, ConditionEffect>`
  - Include: Bleed (2 turns, 1 HP/turn), Burning (1 turn, 2 HP/turn), Stunned (1 turn, skip), Poisoned (3 turns, -1 roll, 1 HP/turn), Frightened (2 turns, -2 rolls), Weakened (1 turn, -50% dmg)
  - Export helper: `applyCondition(state, condition, duration) => newState`
  - Export helper: `tickConditions(state) => { newState, damageThisRound, messages }`
  - Export helper: `rollWithConditions(roll, state) => modifiedRoll`
  - Files: Create `/Users/ryan/projects/mud-game/lib/traits/conditions.ts`
  - Tests: Unit test condition ticking, modifier application, damage calc

---

### Phase 3: Enemy Traits & Item Data (2 tasks)
Can run in parallel once Phase 1 is done.

- [ ] **Task 6: Add weakness/resistance table** (`lib/traits/weaknesses.ts`)
  - Export `ENEMY_WEAKNESSES: Record<HollowType | string, { weakness: string, resistance: string }>`
  - Map all 15 enemies to weakness + resistance
  - Export helper: `getEnemyWeakness(enemy) => { trait, bonus }`
  - Export helper: `getEnemyResistance(enemy) => { trait, percent }`
  - Files: Create `/Users/ryan/projects/mud-game/lib/traits/weaknesses.ts`
  - Tests: Unit test lookup for all 15 enemies; verify bonus/percent values

- [ ] **Task 7: Assign traits and tiers to all items** (`data/items.ts`)
  - Iterate all 151 items in `ITEMS` object
  - Add `traits` array to each weapon (1–2 traits based on design)
  - Add `tier` field to each item based on damage/defense
  - Add `traits` array to each armor (0–1 traits)
  - Examples:
    - Pipe wrench: `traits: ['Heavy'], tier: 'T1'`
    - Combat knife: `traits: ['Quick', 'Vicious'], tier: 'T2'`
    - Silver knife: `traits: ['Blessed', 'Sanguine-Forged'], tier: 'T5'`
    - Scrap vest: `traits: [], tier: 'T1'`
    - Reinforced coat: `traits: ['Fortified'], tier: 'T3'`
  - Verify all trait IDs exist in WEAPON_TRAITS / ARMOR_TRAITS
  - Files: Modify `/Users/ryan/projects/mud-game/data/items.ts`
  - Tests: Verify all items have tier; no invalid trait IDs; linting passes

---

### Phase 4: Class Abilities (1 task)

- [ ] **Task 8: Define class combat abilities** (`lib/abilities/class.ts`)
  - Export `CLASS_ABILITIES: Record<CharacterClass, ClassAbility>`
  - ClassAbility interface: { id, name, description, cost ('free' | 'action' | 'hp'), effect (function) }
  - Implement all 7:
    - Enforcer Overwhelm: ignores armor on next attack
    - Scout Mark: +3 to hit for next 2 attacks
    - Wraith Shadowstrike: guaranteed crit if undetected
    - Shepherd Mend: heal 1d6 + pres mod, DC 8 field_medicine check
    - Reclaimer Analyze: free, reveal full enemy info
    - Warden Brace: reduce next dmg 50%
    - Broker Intimidate: DC = pres + wits/2, skip enemy turn on failure
  - Export helper: `executeAbility(abilityId, player, state) => { success, messages, newState }`
  - Files: Create `/Users/ryan/projects/mud-game/lib/abilities/class.ts`
  - Tests: Unit test each ability; verify stat scaling and effect application

---

### Phase 5: Combat Integration (3 tasks)
Can run in parallel once Phase 2 is done.

- [ ] **Task 9: Integrate traits into combat.ts** (`lib/combat.ts`)
  - Modify `playerAttack()` to:
    - Look up weapon traits from equipped weapon
    - Apply weapon trait effects after hit (damage mod, condition application)
    - Integrate condition ticking (Bleed/Poison damage per round)
    - Integrate condition modifiers (Poisoned/Frightened -1/-2 to rolls)
    - Output trait flavor text in messages
  - Modify `enemyAttack()` to:
    - Check weakness/resistance table for enemy
    - Apply weakness bonus or resistance reduction
    - Output resistance message if applicable
  - Modify `CombatState` management to:
    - Initialize conditions as empty object
    - Tick conditions each round (damage, decrement duration)
    - Apply condition modifiers to rolls
  - Files: Modify `/Users/ryan/projects/mud-game/lib/combat.ts`
  - Depends on: Task 3, 5, 6
  - Tests: Unit test trait application; integration test one full combat with traits; verify condition ticking

- [ ] **Task 10: Integrate armor traits into damage calc** (`lib/combat.ts`)
  - Modify damage reduction in `playerAttack()` and `enemyAttack()` to:
    - Look up armor traits from equipped armor
    - Apply armor trait effects (Fortified +1, Reactive 10% negate, Insulated immunity, Warded composure, Reflective reflect)
    - Output armor trait flavor if triggered
  - Files: Modify `/Users/ryan/projects/mud-game/lib/combat.ts`
  - Depends on: Task 4
  - Tests: Unit test each armor trait; verify damage reduction stacking

- [ ] **Task 11: Integrate weakness/resistance into enemy attacks** (`lib/combat.ts`)
  - Modify `enemyAttack()` to:
    - Check player's armor for resistances (if implemented)
    - Check if player has conditions that reduce defense
    - Apply weakness damage if player has weakness trait
    - Output weakness/resistance messages
  - Files: Modify `/Users/ryan/projects/mud-game/lib/combat.ts`
  - Depends on: Task 6
  - Tests: Unit test weakness bonus; integration test with condition defense interaction

---

### Phase 6: New Combat Verbs (2 tasks)
Can run in parallel once Phase 2 is done.

- [ ] **Task 12: Implement ability/defend/wait verbs** (`lib/actions/combat.ts`)
  - Add handler: `handleAbility(engine, player, state)` — call ClassAbility executor
  - Add handler: `handleDefend(engine, player, state)` — set `braceDamageReduction: 0.3`
  - Add handler: `handleWait(engine, player, state)` — set `waitBonus: 2`
  - Integrate into action parser: route 'ability', 'defend', 'wait' to handlers
  - Modify attack roll to check for `waitBonus` and apply it
  - Modify damage reduction to check for `braceDamageReduction` and apply it
  - Files: Modify `/Users/ryan/projects/mud-game/lib/actions/combat.ts`
  - Depends on: Task 8
  - Tests: Unit test each handler; integration test ability execution; verify wait/defend state transitions

- [ ] **Task 13: Implement analyze verb** (`lib/actions/combat.ts`)
  - Add handler: `handleAnalyze(engine, player, state)`
  - If Reclaimer: free action, return full enemy info
  - Else: DC 11 Wits check; on success, return full info; on failure, return nothing
  - Output: enemy HP %, weaknesses, resistances, active conditions
  - Files: Modify `/Users/ryan/projects/mud-game/lib/actions/combat.ts`
  - Depends on: Task 6
  - Tests: Unit test Reclaimer case; unit test other class cases (success/failure)

---

### Phase 7: UI & Messages (1 task)

- [ ] **Task 14: Add trait flavor and tier display to UI** (`lib/richText.ts` + terminal component)
  - Add trait descriptions to combat messages (already in handlers from earlier tasks)
  - Add tier badge to item equip messages: "You equip the [Combat Knife (T2 Salvage)]"
  - Add condition badges to combat state display: "[Bleed 1 turn] [Poisoned 2 turns]"
  - Add ability status to combat prompt: "Available: `ability`" or "Ability used this fight"
  - Add condition icons to enemy display (if UI supports)
  - Files: Modify `/Users/ryan/projects/mud-game/lib/richText.ts` + terminal display component
  - Tests: Visual regression test; verify all trait/tier/condition text appears correctly

---

### Phase 8: Testing & Polish (2 tasks)

- [ ] **Task 15: Write integration tests** (`__tests__/combat-traits.test.ts`)
  - Test a full combat loop with all trait categories (weapon damage, utility, special)
  - Test condition application and ticking (Bleed, Burning, Stun, Poison, Fear, Weakened)
  - Test armor trait interactions (Fortified, Reactive, Insulated)
  - Test enemy weakness/resistance application
  - Test each class ability in isolation
  - Test ability + trait stacking (e.g., Heavy crit + Enforcer Overwhelm)
  - Test condition resist (Warden Brace vs Burning, etc.)
  - Files: Create `/Users/ryan/projects/mud-game/__tests__/combat-traits.test.ts`
  - Depends on: All Phase 2–6 tasks
  - Tests: 30+ assertions covering all trait combinations

- [ ] **Task 16: Pre-MR pipeline**
  1. code-reviewer: self-review all trait files; check for bugs, missed edge cases, performance issues
  2. test-runner: `npm test` — all new tests pass; coverage > 85% for trait modules
  3. git-agent: commit and open MR with description of trait system, tiers, abilities

---

## Definition of Done

Every task in this plan is complete when:
- [ ] Code written and self-reviewed
- [ ] Tests written or updated for the changed logic
- [ ] `code-reviewer` passes with no blockers
- [ ] `test-runner` passes with no failures
- [ ] MR opened via `git-agent` with coverage gaps (if any) noted in the description

---

## Effort Breakdown by Phase

| Phase | Tasks | Estimated Effort | Parallelism |
|-------|-------|------------------|-------------|
| 1: Data Structures | 2 | 4–6 hours | Sequential (tasks 1→2) |
| 2: Trait Definitions | 3 | 8–10 hours | Parallel (3, 4, 5) |
| 3: Enemy & Item Data | 2 | 6–8 hours | Parallel (6, 7) |
| 4: Class Abilities | 1 | 4–6 hours | Sequential |
| 5: Combat Integration | 3 | 12–15 hours | Sequential (9→10→11) |
| 6: New Verbs | 2 | 6–8 hours | Parallel (12, 13) |
| 7: UI & Messages | 1 | 3–4 hours | Sequential |
| 8: Testing & Polish | 2 | 6–8 hours | Sequential (15→16) |
| **Total** | **16** | **50–65 hours** | |

**Estimated Duration**: 2–3 weeks for a single developer working part-time (20 hrs/week)

---

## References

- Current combat system: `/Users/ryan/projects/mud-game/lib/combat.ts`
- Current item data: `/Users/ryan/projects/mud-game/data/items.ts`
- Current enemy data: `/Users/ryan/projects/mud-game/data/enemies.ts`
- Type definitions: `/Users/ryan/projects/mud-game/types/game.ts`
- Skill bonuses: `/Users/ryan/projects/mud-game/lib/skillBonus.ts`
- Fear system: `/Users/ryan/projects/mud-game/lib/fear.ts`
- Combat actions: `/Users/ryan/projects/mud-game/lib/actions/combat.ts`

---

## Example Trait Assignments (Reference for Task 7)

**Melee Weapons:**
- Pipe wrench: Heavy, T1
- Combat knife: Quick + Vicious, T2
- Machete: Vicious, T2
- Silver knife: Blessed + Sanguine-Forged, T5
- Tomahawk: Heavy + Keen, T2

**Ranged Weapons:**
- Hunting rifle (any): Precise + Quick, T2–T3
- 9mm pistol: Quick, T2
- Shotgun: Heavy, T3–T4

**Armor:**
- Scrap vest: none, T1
- Leather jacket: none, T2
- Reinforced coat: Fortified, T3
- Kevlar vest: Warded, T3–T4
- Hazmat suit: Insulated, T5

**Consumables:**
- Bandages: Healing +3, T1
- Quiet drops: none, T2
- Sanguine blood vial: Special (quest item), T5

---

## Open Questions

- **Q1**: Should traits be visible in `examine weapon` output before equip?
  - **A** (assumption): Yes. Players should see "Combat Knife (Quick, Vicious)" in examine.

- **Q2**: Can conditions be cured with consumables mid-fight?
  - **A** (assumption): No (out of scope). Conditions are temporary; fight ends or you manage.

- **Q3**: Does Reactive armor trigger on every condition application, or once per turn?
  - **A** (assumption): Every condition application (up to 10% per condition type per turn).

- **Q4**: If an enemy has both weakness and player has trait that applies that weakness, does it stack?
  - **A** (assumption): No. Weakness is applied once (+2–5 damage), not multiplied. Condition still applies (Bleed, Burn).

- **Q5**: What happens if Warden uses Brace but Brute charges through?
  - **A** (assumption): Brace applies after all other calculations. Brute charge (2x) → armor % → Fortified → Brace (all stack in order).

---

## Migration & Rollout

**Backward compatibility**: This is a new system on top of existing combat. No existing data breaks—items without traits work fine (treat as empty array).

**Rollout strategy**:
1. Merge Phase 1–2 (data structures + trait definitions) with no gameplay changes
2. Merge Phase 3–4 (enemy/item data + abilities) with no gameplay changes
3. Merge Phase 5 (combat integration) — THIS IS THE FEATURE LAUNCH
4. Merge Phase 6–7 (verbs + UI) as refinement
5. Phase 8 (testing) is ongoing; tests should pass before each merge

---

## Appendix: Full Trait List for Implementation

**Damage Traits (5):**
1. Keen — +1 crit chance per 2 reflex
2. Heavy — +1 damage, crit stun
3. Vicious — bleed on hit
4. Scorching — burning on hit
5. Draining — lifesteal on hit

**Utility Traits (5):**
6. Quick — +1 initiative per 2 reflex
7. Precise — +1 to hit per 2 wits
8. Silenced — no noise encounter
9. Blessed — +1 damage per 2 presence, +2 vs Hollow, +3 vs Sanguine
10. Disrupting — weakened on crit

**Special Traits (3):**
11. Cursed — +2 damage, lose 1 HP
12. Sanguine-Forged — x1.5 vs Sanguine, x0.5 vs Hollow
13. Verdant — +1 max HP per hit (cap +3/fight)

**Additional Traits (optional, for full 20):**
14. Whirling — next attack hits multiple enemies if available
15. Dragonslayer — +4 damage vs dragons (future enemy type)
16. Life-Steal — on crit, drain 1d6 HP to self
17. Rending — apply Weakened on crit
18. Infectious — Poisoned applies instead of bleed (custom condition)
19. Soulbound — damage increases with kills this fight (+1 per kill, max +5)
20. Reforged — armor +1 on hit (scales off damage), capped

