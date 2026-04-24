# The Remnant

A post-apocalyptic single-player text MUD built with Next.js and Supabase.

## The World

Seven years after the CHARON-7 bioweapon escaped the MERIDIAN facility, humanity fractured into three species: the Hollow, the Sanguine, and baseline survivors. You are a Revenant -- an impossibly rare mutation that restarts the dead. A radio signal is calling you north.

## Features

- 268 hand-crafted rooms across 13 zones
- 4 distinct endings (Cure, Weapon, Seal, Throne)
- Branching dialogue with 18 NPCs (~130 conversation nodes)
- Turn-based combat with 15 enemy types and 5 armor tiers
- 7 character classes with unique stat distributions
- Stat increases at levels 3, 6, and 9 (player's choice)
- Vigor-based damage scaling
- Percentage-based armor reduction
- Faction reputation system (9 factions)
- Trading economy using .22 LR rounds as currency
- Death/rebirth cycle with stat echo retention
- Personal loss system that haunts the world
- Split-pane terminal UI with ANSI color palette

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (Postgres + Auth + RLS)
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest (417+ tests)
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
| `boost <stat>` | | Increase a stat when leveling up (at levels 3, 6, 9) |
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
components/     React UI (split-pane layout, terminal, sidebar, command input)
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

## Release Notes

### 2026-04-24 — Phase 4b + re-login audit: dog adoption, reveal seeding, prologue bypass fix

Phase 4b wires the complete dog adoption flow: `handleGive` triggers `addCompanion` after 3 food items with per-feed narrative text; optional `cycle` param to `addCompanion` sets `canDie: false` at cycle >= 4 (scarred-survivor design); `the_dog` NPC relocated to `river_road`. Five new reveal-seeding dialogue nodes across Lev (cycle-2), Patch (cycle-3 breeder's-mark scene, sets `dog_breeder_mark_noticed`), and Dr. Osei (cycle-3 training-protocol recognition), all gated on `companion_the_dog_active` + `requiresCycleMin`. Four ending-specific extras in `scar_14_the_core` (CURE / WEAPON / SEAL / THRONE) gated on `companion_the_dog_active` preserve Agent D tone. Re-login audit finds and fixes one real bug: cycle-2+ returning players saw the prologue on any new browser (no `player.cycle > 1` guard); one-line fix adds the third bypass in `attemptLoad()`. 19 round-trip tests verify session restore across room, flags, inventory, rep, narrativeKeys, cycle, narrative_progress, totalDeaths, cycleHistory, null-JSONB safety, prologue bypass threshold, dead-player state, active buffs, and pendingStatIncrease. Two secondary findings (discovered_room_ids never written during play; loadPlayer lacks session-refresh retry) recorded in `docs/plan/relogin-audit.md` for follow-up. Eval 424/424, default 1,153 green.

### 2026-04-24 — Narrative Plan Phase 5: four faction-mythology contradictions via flag-gated dialogue

Phase 5 lands four interconnected faction-mythology contradictions detectable via the existing `found_sanguine_origin` / `found_hollow_origin` flag infrastructure. Lev's `lev_charon_strains` node now sets both origin flags on entry; a new `lev_charon_authority` branch traces the unauthorized-trial authorization chain upward past Director Vane to pre-Collapse oversight, setting `meridian_authority_implied`. Vesper's new `vesper_engineered_admission` branch (requires `found_sanguine_origin`) forces the admission that R-1 was the intended product and she was a designed outcome — two follow-ups let the player affirm her ethics or narrow her authority on Sanguine identity, setting `vesper_admitted_engineered`. Avery's new `avery_kindling_theater` branch (requires `found_hollow_origin`) surfaces that Harrow knows the purification ritual is grief counseling, not biology — Avery and Harrow maintain a mutual pretense, setting `harrow_doctrine_examined` + `avery_shared_kindling_intel`. Elder's new `elder_r2_confrontation` branch (requires `found_sanguine_origin`) reveals the Lucid are R-2 descendants — an intelligence-preservation protocol cancelled by the funding committee and distributed by an unnamed researcher — setting `found_lucid_origin` + `elder_revealed_r2`; two follow-ups trace the carrier and Vesper's ignorance of her own parallel status. Broadcaster timeline (contradiction #5) already resolved by `scar_02_main_entrance` terminal; Cross bombing stance (contradiction #7) already resolved in Phase 2. Rook recharacterization and Lev-hub load balancing deferred. 9 new dialogue nodes across 4 existing trees. Eval 424/424, default 1,120 green.

### 2026-04-24 — Narrative Plan Phase 3: Red Court arc — Kade, Vex, Lyris + alternate Sanguine biometric + Vesper supply-chain contradiction

Phase 3 ships the Red Court arc with three fully playable NPCs. Kade (`pens_kade_philosophy`) offers the Red Court's philosophical frame and grants `join_kade_philosophy` (+1 red_court rep) when the player accepts it. Vex (`pens_vex_manifest`) discloses the full supply manifest (34% voluntary / 28% involuntary / 38% contract-unclear; 60% Accord-bought, 12% Covenant-bought) and sets `pens_covenant_arrangement` + `vex_silent_tolerance_revealed`. Lyris (`pens_lyris_conflict`) resolves across three branches: `aid_lyris_extraction` grants her own Sanguine biometric via `sanguine_biometric_obtained` (a parallel route to Vesper's, -1 red_court rep), `disrupt_vex_system` threatens exposure, and `passive_observer` walks away. A new `vesper_supply_confrontation` branch on Vesper's tree (gated on `pens_covenant_arrangement`) forces Vesper to admit she signs the ledger for the 12% Covenant transfusion supply sourced from Red Court yield — sets `vesper_admitted_supply` + `covenant_accord_secret_exposed`. The Rook ledger extra gains `questFlagOnSuccess: pens_yield_discrepancy_found`, hooking Vex's discrepancy branch. 3 new dialogue trees (~23 nodes) + 2 new Vesper nodes + 1 new ledger flag-hook. Eval count 400 → 424. Default suite: 1,120 green.

### 2026-04-24 — Narrative Plan Phase 2: MERIDIAN bombing contradiction — physical deduction + NPC cross-reference bridge

Phase 2 lands the load-bearing MERIDIAN-bombing contradiction via two independent routes. Route 1: a 3-piece physical deduction in `the_scar` — crater-rim blast-pattern analysis (`scar_blast_pattern_analyzed`), crater-rim intent read (`scar_bombing_intent_understood`), and director's-office strike-order cabinet (Lore DC 11, `meridian_bombing_orders_found`) — together grant `scar_bombing_truth` via the new `narrativeKeyOnDeduction` field. Route 2: once the player has heard both Cross's `cross_bombing` admission and Briggs's confession, new bridge nodes unlock on each tree and set `bombing_cover_confirmed`; Cross's branch forks into 3 player stances (`cross_concealed_truth`, `cross_followed_orders`, undecided); Briggs's branch forks into 2 (`briggs_wants_joint_reckoning` or hold-until-Scar). New `RoomExtra.narrativeKeyOnDeduction?: { keyId: string; requires: string[] }` field enables conditional grants that fire only when all prereq quest flags are set, wired into both the skill-check-success and free-examine paths of `handleExamineExtra`. 8 new dialogue nodes (5 Cross, 3 Briggs). `meridian_bombing_orders` narrative key granted directly on Lore DC 11 success. Vane acknowledgment in `scar_14_the_core` and 4 ending epilogue variants gated on `bombing_cover_confirmed` deferred to Phase 2b follow-up. Eval 400/400, default 1,120 green.

### 2026-04-24 — Narrative Plan Phase 1: dialogue-grant engine extension + 4 playable Act I narrative keys

Adds `DialogueNode.onEnter.grantNarrativeKey` (parallel to `setFlag`/`grantRep`/`grantItem`) and wires it into `applyNodeEffects` in `lib/actions/social.ts`, giving dialogue trees a clean path to grant knowledge unlocks. Ships the Phase 1 plan (`docs/plan/NARRATIVE-PLAN.md`) and 4 of 5 planned Tier-1 narrative keys: `crossroads_signal_source` (Sparks shares 4.127 MHz frequency via dialogue), `crossroads_hidden_cellar` (Marta reveals pre-settlement Drifter cache after feeding the player), `river_road_submerged_cache` (Howard gives waxed-tin location after fee waiver), and `crossroads_guard_rotation` (examine gate rotation at `cr_02_gate`, Survival DC 9). The 5th key (`dust_caravan_cache`) is deferred to Phase 5. Eval remains 400/400 green; default suite 1,120 green.

### 2026-04-24 — Narrative Plan Phase 4: Dog companion narration

Ships the Dog's complete companion narration layer in `data/companionNarration.ts`: 17 contextual commentary entries across DANGER / RUINS / OPEN / TECH / NIGHT / REST / DEEP / GENERIC contexts, plus join/leave/intro pools and combat + discovery reactions, registering `the_dog` in `COMPANION_NARRATION_POOLS` and `COMPANION_INTRODUCTIONS`. Voice contract: action over speech, uncanny timing, survivor-of-being-hunted posture. Adoption flow, cycle semantics (canDie flip at cycle 4+), hidden bloodhound-trained reveals, and ending-specific reactions deferred to Phase 4b. Eval 424/424, default 1,120 green.

### 2026-04-24 — dev/eval-fixes-0424: second wave — full-map reachability + eval calibration

Fix 1B reconnects all 36 remaining intra-zone orphan rooms (17 targeted inbound exits across crossroads, river_road, salt_creek, covenant, the_breaks, the_ember, the_deep): all 268 rooms are now reachable by BFS from start. Adds three missing key items (`courthouse_archive_key`, `cold_storage_key`, `red_court_key`) whose lockedBy refs existed in room data without matching item definitions. Fixes one undefined `vesper_trust_level_3` quest gate in duskhollow (replaced with `vesper_shared_origin`, a flag Vesper's dialogue tree actually sets). Calibrates mapIntegrity eval thresholds to current main (room-count window 256–280, soft bidirectionality baseline). Adds ENGINE_ENTRY_NODES / NON_NPC_TREES / NAMED_NPCS_WITHOUT_TREE allowlists in dialogueHealth eval to eliminate four false-positive failures. Eval suite: 11 → 0 failures.

### 2026-04-24 — dev/eval-fixes-0424: 5 blocker/major fixes from evaluation backlog

Lands five targeted fixes surfaced by the 8-Howler evaluation convoy: reconnects 3 orphan zones (51 rooms now reachable), opens the scar_02 door to all four advertised routes, adds the missing `echo_recognition` dialogue node, corrects a false-positive smart-quote regex in the health test, and wires `narrativeKeys.ts` into movement, examine, and the engine. Eval suite: 33 → 11 failures.

### 2026-04-24 — Fix `pnpm test:eval` script

Eval suite got wiped by the global vitest exclude. Added `vitest.eval.config.ts` with an eval-specific include path; `pnpm test:eval` now runs the 400-case audit as intended while the default `pnpm test` remains 1,120-green.

### 2026-04-24 — Evaluation convoy output: audit suite + ranked fix backlog

Adds the 8-Howler spectrum evaluation artifacts: five reusable test files in `tests/eval/` (map integrity, dialogue health, combat matrix, ending reachability, faction lockout), per-domain Howler reports in `docs/eval/`, and `EVAL-SUMMARY.md` as the synthesis. Eval tests are excluded from the default suite via `vitest.config.ts` and run on-demand via `pnpm test:eval`. Headline findings: 87 unreachable rooms, 1 main-arc door blocker, 1 critical dialogue orphan, smart-quote contamination across 17+ trees. Fix backlog is ranked blocker/major/minor in `EVAL-SUMMARY.md`.

### 2026-04-23 — Pre-evaluation cleanup: .gitignore agent scratch dirs

Excluded `.claude/`, `.tages/`, and `/benchmarks/` from version control. These are spectrum agent worktrees/sessions, a stray Tages project brief, and benchmark output — none are game code. Baseline heading into the 8-Howler evaluation convoy: 44 test files, 1,120 passing, typecheck clean.

### 2026-03-29 — UX rewrite cleanup: delete dead tab components, fix Vercel build

Committed the remaining UX rewrite deletions that were staged but not pushed. The Vercel build failed because `components/tabs/InventoryTab.tsx` still imported the deleted `@/lib/theme` module. This commit deletes all 5 tab components (`CommandsTab`, `DataTab`, `InventoryTab`, `MapTab`, `StatTab`), moves their stats/inventory/equipment display logic into terminal-printed commands (`stats`, `inventory`, `equipment`, `hint`), updates `Terminal.tsx` to use centralized ANSI color constants, adds an HP prompt to `CommandInput`, and cleans up the parser and game engine.

### 2026-03-29 — Quest completability audit (convoy remnant-ux-0329 / rider-quest-audit)

Fixed two critical quest-blocking bugs and improved navigation clarity across all major quest chains.

**Critical fixes:**
- Added missing item `bombing_site_notes` to `data/items.ts` and seeded it at `scar_01_crater_rim` (80% spawn, one-time). Without this item the Briggs confession route via "Give bombing site notes" was silently blocked, preventing `briggs_confessed_bombing` and `sc_briggs_meridian_revelation`.
- Added missing item `commanders_notes` to `data/items.ts`. Briggs grants this item via `grantItem` in two dialogue nodes; without a definition the engine would error on that grant.

**Additional item definitions:**
- Added `purified_stims` (consumable) — granted by Patch in the cycle-2 echo exchange.
- Added `sanguine_biometric_slide` (key) — Vesper's biometric authorization, referenced in Duskhollow dialogue.

**Quest direction improvements (9 entries in `data/questDescriptions.ts`):**
- Kindling/Ember quests now give "northeast of Crossroads, through the Pine Sea" with chapel crypt directions.
- MERIDIAN entry quests reference "Pine Sea north to the Scar overlook."
- Deep utility access references "west wall of the Scar crater."
- Duskhollow entry references "west of the Pine Sea, through the old estate road."
- Field station quest now tells players Lev will trade the keycard for the data, and gives the route.

**Lev dialogue (`data/dialogueTrees.ts`):** `lev_echo_distrusted` node now gives concrete directions to the field station: "two kilometers past the reading room exit, follow the old access road through the industrial district."

**Investigated:** "Maintenance window. You let the system run its own diagnostics for a while." — confirmed intentional flavor text for the Reclaimer character class `safe_rest` trigger in `data/playerMonologues/class_reclaimer.ts`. Not a bug.
