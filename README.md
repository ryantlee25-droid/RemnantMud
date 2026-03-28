# The Remnant

A post-apocalyptic single-player text MUD built with Next.js and Supabase.

## The World

Seven years after the CHARON-7 bioweapon escaped the MERIDIAN facility, humanity fractured into three species: the Hollow, the Sanguine, and baseline survivors. You are a Revenant -- an impossibly rare mutation that restarts the dead. A radio signal is calling you north.

## Features

- 271 hand-crafted rooms across 13 zones
- 4 distinct endings (Cure, Weapon, Seal, Throne)
- Branching dialogue with 18 NPCs (~130 conversation nodes)
- Turn-based combat with 15 enemy types and 5 armor tiers
- 7 character classes with unique stat distributions
- Faction reputation system (9 factions)
- Trading economy using .22 LR rounds as currency
- Death/rebirth cycle with stat echo retention
- Personal loss system that haunts the world
- PipBoy-style terminal UI with CRT aesthetic

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (Postgres + Auth + RLS)
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest (263+ tests)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Local Development (No Supabase Required)

1. Clone the repo
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. The dev mode flag is already set in `.env.local`:
   ```
   NEXT_PUBLIC_DEV_MODE=true
   ```
4. Start the dev server:
   ```bash
   pnpm dev
   ```
5. Open http://localhost:3000

Dev mode uses an in-memory mock -- no Supabase account needed.

### Production Setup (With Supabase)

1. Create a Supabase project
2. Run migrations:
   ```bash
   npx supabase db push
   ```
3. Set environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   SUPABASE_SERVICE_ROLE_KEY=your-key
   NEXT_PUBLIC_DEV_MODE=false
   ```
4. Deploy to Vercel:
   ```bash
   vercel deploy
   ```

### Running Tests

```bash
npx vitest run
```

## Commands

### Movement

| Command | Aliases | Description |
|---------|---------|-------------|
| `go <direction>` | `move`, `walk`, `head` | Move in a direction |
| `north` | `n` | Go north |
| `south` | `s` | Go south |
| `east` | `e` | Go east |
| `west` | `w` | Go west |
| `up` | | Go up |
| `down` | | Go down |
| `travel <zone>` | `warp` | Fast travel to a discovered zone |
| `map` | | Show the zone map |

### Looking & Exploration

| Command | Aliases | Description |
|---------|---------|-------------|
| `look` | `l` | Describe the current room |
| `examine <target>` | `x`, `inspect`, `check`, `describe` | Examine something closely |
| `search` | `look around` | Search the room for hidden items |
| `read <target>` | | Read a note, sign, or document |
| `open <target>` | | Open a door, container, or lock |

### Inventory & Equipment

| Command | Aliases | Description |
|---------|---------|-------------|
| `inventory` | `i`, `inv` | List carried items |
| `take <item>` | `get`, `pick up` | Pick up an item |
| `drop <item>` | `put down` | Drop an item |
| `use <item>` | `eat` | Use or consume an item |
| `equip <item>` | `wear`, `wield` | Equip a weapon or armor |
| `unequip <item>` | `remove`, `take off` | Unequip an item |

### Combat & Survival

| Command | Aliases | Description |
|---------|---------|-------------|
| `attack <target>` | `kill`, `hit`, `fight`, `strike` | Attack an enemy |
| `flee` | `run`, `escape`, `retreat` | Flee from combat |
| `rest` | `sleep` | Rest to recover health |
| `camp` | | Make camp (safe zones only) |
| `drink` | `fill` | Drink or fill a water container |

### Social & Trade

| Command | Aliases | Description |
|---------|---------|-------------|
| `talk <npc>` | `speak`, `ask`, `greet` | Start a conversation |
| `buy <item>` | `purchase` | Buy from a trader |
| `sell <item>` | | Sell to a trader |
| `trade` | `barter` | Open trade with a trader |

### Information & System

| Command | Aliases | Description |
|---------|---------|-------------|
| `stats` | `status`, `character`, `char` | View character stats |
| `rep` | `reputation`, `standing` | View faction standings |
| `quests` | `quest` | View active quests |
| `journal` | `codex`, `notes` | Open the journal |
| `help` | `?` | Show available commands |
| `save` | | Save the game |
| `quit` | `exit` | Quit the game |

## Architecture

```
app/            Next.js pages and layouts (App Router)
  landing/      Static marketing / landing page
  login/        Authentication flow
  auth/         Auth callback handler
components/     React UI (PipBoy frame, tabs, terminal, modals)
lib/            Game engine, parser, action handlers, combat, dialogue
  actions/      Individual verb handlers
data/           Rooms, NPCs, items, enemies, dialogue trees
  rooms/        Room definitions organized by zone (13 zones)
types/          TypeScript type definitions
tests/          Vitest test suite
  unit/         Unit tests (parser, dice, NPCs, spawning, stats, themes)
  integration/  Integration tests (combat, dialogue, trade, inventory, etc.)
  mocks/        Test mocks (Supabase client)
```
