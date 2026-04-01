@AGENTS.md

# The Remnant — Project CLAUDE.md

## Overview

Single-player post-apocalyptic text MUD. Player is a Revenant — dies, sees echo stats from past life, rebirths with carried progress (cycle N+1). 271 rooms across 13 zones, 4 endings (Cure/Weapon/Seal/Throne), 18 NPCs, 15 enemy types, 7 character classes, faction reputation system. Currency is .22 LR rounds.

**The Revenant loop**: play -> die -> cycle snapshot saved -> "The Between" (echo stats shown) -> rebirth with inherited reputation + cycle number incremented -> play again. `rebirthWithStats()` handles rebirth; `createCharacter()` is only for brand-new players (cycle 1).

## Architecture

- **Next.js 16 App Router** + **Supabase** (Postgres + Auth + RLS) + **Tailwind 4**
- **Deployed on Vercel**, tested with **Vitest** (417+ tests, v8 coverage)
- Dev mode (`NEXT_PUBLIC_DEV_MODE=true`) uses in-memory Supabase mock — no DB needed

### Core Modules

| File | Role |
|------|------|
| `lib/gameEngine.ts` | Central dispatcher. State machine, save/load, death/rebirth, command routing. All action handlers are called from here. Pure class, no React. |
| `app/page.tsx` | UI + auth/game flow state machine. AuthPhase: `checking -> unauthenticated -> loading-player -> creating -> ready`. GameFlow: `prologue -> playing -> dead -> between -> rebirth -> ending`. |
| `lib/parser.ts` | Command parser. Maps user input to Action types. Register new commands here. |
| `lib/actions/*.ts` | Verb handlers: combat, movement, items, social, system, trade, travel, craft, examine, survival |
| `data/` | Static game data: rooms (13 zones), items, enemies, NPCs, dialogue trees, recipes, world events |
| `types/game.ts` | All game interfaces. No `any` allowed. |
| `types/convoy-contracts.d.ts` | Shared types from narrative overhaul (companions, effects) |
| `lib/supabaseMock.ts` | In-memory mock for dev mode + tests. `isDevMode()` is the gate. |

### Data Layer

- `data/rooms/` — 13 zone files (crossroads, river_road, covenant, salt_creek, the_ember, the_breaks, the_dust, the_stacks, duskhollow, the_deep, the_pine_sea, the_scar, the_pens). Each exports a `Room[]`.
- `data/items.ts` — all item definitions
- `data/enemies.ts` — enemy types and stats
- `data/npcs.ts` — NPC definitions
- `data/dialogueTrees.ts` — conversation nodes (~130 nodes)
- `data/recipes.ts` — crafting recipes

### Narrative Systems (convoy remnant-narrative-0329)

- `lib/hollowPressure.ts` — hollow pressure (threat escalation tracked in `narrative_progress` JSONB)
- `lib/worldEvents.ts` — scheduled world events
- `lib/companionSystem.ts` — companion commentary and personal moments
- `lib/factionWeb.ts` — faction ripple effects and delayed consequences
- `lib/npcInitiative.ts` — NPCs that act on their own
- `lib/playerMonologue.ts` — class-specific internal voice
- `lib/echoes.ts` — cross-cycle consequences, graffiti changes, cycle-aware dialogue

## Critical Rules

### 1. Save fields MUST have matching migrations

**Two production outages** were caused by adding fields to `_savePlayer()` payload without creating Supabase migrations (`active_buffs`, `narrative_progress`). Before adding ANY field to the save payload in `_savePlayer()`:
- Check `supabase/migrations/` for the column
- If missing, create a migration FIRST
- Test with `npx supabase db push`

### 2. Never call createCharacter() for returning players

`createCharacter()` sets cycle to 1 and creates a fresh row. For death/rebirth, use `rebirthWithStats()` which increments `player.cycle` and preserves cycle history. Calling `createCharacter()` on a returning player destroys their progression.

### 3. DB operations before state mutations

Always confirm Supabase writes succeed before mutating in-memory GameState. Learned from stash item loss bug — items were removed from memory but the DB write failed, losing them permanently.

### 4. isDevMode() guard on all dev overrides

All `NEXT_PUBLIC_DEV_*` environment variables must be gated behind `isDevMode()` from `lib/supabaseMock.ts`. Production must never read dev overrides.

## Commands

```bash
pnpm dev              # local dev server (uses in-memory mock)
pnpm build            # production build
pnpm test             # vitest run (417+ tests)
pnpm test:coverage    # with v8 coverage
npx tsc --noEmit      # type check
npx supabase db push  # apply migrations to Supabase
```

## Directory Structure

```
app/                  Next.js App Router pages
  page.tsx            Main game page (auth + game flow)
  landing/            Static marketing page
  login/              Auth flow
  auth/               Auth callback
components/           React UI (GameLayout, Terminal, CommandInput, Sidebar)
lib/                  Game engine + all logic
  gameEngine.ts       Central dispatcher
  parser.ts           Command parser
  actions/            Verb handlers (combat, movement, items, social, system, trade, travel, craft, examine, survival)
  supabase.ts         Real Supabase client
  supabaseMock.ts     Dev mode mock + isDevMode()
data/                 Static game data
  rooms/              13 zone directories
  items.ts, enemies.ts, npcs.ts, dialogueTrees.ts, recipes.ts
types/                TypeScript types (game.ts, traits.ts, convoy-contracts.d.ts)
tests/
  unit/               Parser, dice, NPCs, spawning, stats, themes
  integration/        Combat, dialogue, trade, inventory, etc.
  mocks/              Supabase client mock
supabase/migrations/  Database schema migrations
```

## Conventions

- **Adding a new command**: create handler in `lib/actions/`, register verb+aliases in `lib/parser.ts`, add case in `gameEngine.ts` dispatch switch
- **Adding a room**: add to the zone file in `data/rooms/<zone>.ts`, follow `Room` type from `types/game.ts`
- **Adding an item**: add to `data/items.ts` with a unique string ID, set type/stats/description
- **Adding an enemy**: add to `data/enemies.ts`, reference in room spawn tables
- **Tests**: use `tests/mocks/` Supabase mock. Integration tests in `tests/integration/`, unit in `tests/unit/`
- **No `any`**: enforced project-wide in `types/game.ts` header comment
- **ANSI colors**: use constants from `lib/ansiColors.ts` for terminal output

## Known Quirks

- `saw_prologue` uses **localStorage** (`remnant_saw_prologue` key), not DB — intentional for simplicity, but means prologue replays on new browsers
- `active_buffs` stored as **native JSONB** array (not `JSON.stringify`). Don't double-encode.
- `hollow_pressure` is tracked inside the `narrative_progress` JSONB column (not its own column)
- `world_state` table has RLS policies with no user-facing access — intentional; only service role writes
- `_savePlayer()` retries once on failure after refreshing the auth session (handles expired tokens)
- `squirrel_name` column exists — it's the player's pet squirrel (Chippy or Stumpy). Not a joke field.
- Player stats: vigor, grit, reflex, wits, presence, shadow. HP formula: `8 + (vigor - 2) * 2`
- Stat boosts happen at levels 3, 6, and 9 (player's choice via `boost` command)
- Faction reputation: -3 (Hunted) to +3 (Blooded), 9 factions total
