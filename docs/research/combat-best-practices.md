# Combat System Best Practices for Single-Player Text MUDs

**Audience:** input to a project plan for **The Remnant** — a single-player post-apocalyptic text MUD (271 rooms, 13 zones, 7 classes, 15 enemy types, 5 armor tiers, stats vigor/grit/reflex/wits/presence/shadow, Next.js + TypeScript + Supabase, terminal-output styled). Combat is currently turn-based with `attack` / `flee`.

**Two design objectives this report addresses:**
1. **Robustness** — combat that holds up over a 271-room playthrough across multiple death/rebirth cycles, without becoming shallow, repetitive, or boring.
2. **Time-to-engagement** — letting the player enter combat fluently without a wall of input, a learning cliff, or a `help combat` page they have to memorize.

**Method.** Web research (WebSearch) across canonical MUD design references (Discworld MUD docs, Aardwolf blog, Evennia docs, mud.fandom, MudConnector, Gammon Forum, mud-dev archives, Top MUD Sites), single-player roguelike design (NetHack Wiki, Caves of Qud Wiki, RogueBasin, Brogue/Hacker News), TTRPG combat pacing, and game-developer post-mortems. Where evidence is anecdotal or from forum posts only, bullets are tagged `[low confidence]`. WebFetch was unavailable in this environment, so primary-source quotations are summaries from search results rather than full-text reads.

---

## 1. Turn structure (initiative, action economy, round length)

**Synthesis.** Successful single-player text RPGs converge on one of two models: (a) a **discrete turn** model (one player action triggers one world tick — used by NetHack, Caves of Qud, Brogue) where the player implicitly has all the time in the world; or (b) a **clocked round** model (every N seconds the round resolves — DikuMUD/CircleMUD lineage, Aardwolf, Achaea) where speed mattered for multiplayer fairness. **For a single-player text MUD, the discrete-turn model is strictly better:** it removes the WAIT_STATE anti-pattern (Diku's main combat-pacing complaint) and lets the player think without time pressure. Initiative should be derived from a stat (reflex) + a small variance, with status effects able to delay or skip turns.

**Recommendations**
- Use a **per-action world tick**: when the player issues a combat command, advance the world by 1 tick; enemies act on their own schedule modulated by reflex/agility analogues. This is the NetHack/Qud model and maps cleanly to a request/response web architecture.
- Prefer a **simple action-points budget** (e.g., 1 AP per turn baseline; quick attacks = 1 AP, heavy attacks = 2 AP, abilities = 2-3 AP) over a strict "1 action per round" rule. It opens up tactical choices (two quick stabs vs. one heavy swing) without the complexity of full Final Fantasy ATB or Shadowrun's pass system.
- Compute initiative as `reflex + d6`, recomputed at the start of each combat encounter (not per round) — static-per-encounter ordering is easier for a player to predict than dynamic-per-round and reduces UI churn. The Evennia turn-based combat docs note dynamic order increases complexity but adds depth; static-on-init is the conservative default.
- **Never use Diku-style WAIT_STATE.** A "your kick made you unable to type for 3 rounds of violence" interaction is universally unloved (mudbytes, mud-dev archives). Instead, model heavy actions as costing more AP within the player's own turn — the player still controls the input cadence.
- Status effects can grant or remove AP (stun = lose 1 AP next turn) — this folds debuffs into the same currency as actions and avoids parallel timing systems.

**Sources**
- [Turn based Combat System — Evennia 2.x](https://www.evennia.com/docs/2.x/Howtos/Turn-based-Combat-System.html)
- [Manual:Game Mechanics/Combat — DikuMUD Wiki](https://wiki.dikumud.net/wiki/Manual:Game_Mechanics/Combat)
- [Combat — NetHack Wiki](https://nethackwiki.com/wiki/Combat)
- [Combat — Caves of Qud Wiki](https://wiki.cavesofqud.com/wiki/Combat)
- [MudBytes: combat systems / wait_state discussion](https://www.mudbytes.net/forum/topic/2396/)

---

## 2. Combat verbs / commands (minimum verb set)

**Synthesis.** MUDs follow a verb-first parser pattern (`look`, `get gold`, `kick bandit`). The minimum verb set for fluent combat is small — roughly **6-9 verbs** — but the depth comes from how those verbs combine with targets, modifiers, and tactics. Discworld's `consider` / `tactics` / `protect` / `wimpy` / `kill` / `stop` set is illustrative: 5-7 combat verbs covers a deep system because tactics is a noun-driven configuration command. The single biggest friction source is **target ambiguity** ("two bandits — which one?") — explicit numeric prefixes (`attack 2.bandit`) and last-target memory are both well-established solutions.

**Recommendations**
- **Floor verb set (must-have for first combat):** `attack <target>` (alias `kill`, `k`), `flee` (alias `run`), `look <target>` (alias `examine`, `consider`), `status` (alias `hp`, `score`). Four verbs, one target slot. The player can fight a complete encounter knowing only these.
- **Tactical verb set (introduce by zone 2 or once a class ability unlocks):** `use <ability> [on <target>]`, `target <enemy>` (sticky last-target), `wield <weapon>`, `wear <armor>`, `wimpy <hp%>` (auto-flee threshold).
- **Disambiguation rules.** Implement: (1) **last-target memory** — bare `attack` re-targets the last enemy hit; (2) **ordinal prefix** — `attack 2.bandit`; (3) **partial-name match** — `attack ban` works if unambiguous. The Discworld and Aardwolf communities settled on these as the standard set.
- **Avoid verb overlap that punishes typos.** `kil` should resolve to `kill`, `att` to `attack`. Most Diku derivatives auto-prefix-match commands, but mudcoders.com explicitly notes the `kill`/`kil` typo case as a perennial new-player frustration. Implement prefix matching with a **tie-break to the most-common verb**, and add `attack` as the canonical name (less culturally violent / more transparent than `kill` for narrative tone).
- **Don't add verbs the player doesn't need yet.** The Discworld manual page is a wall of options — that's fine for a 20-year-old MUD with a wiki, fatal for a single-player game. Ship 4 verbs, unlock the rest.
- Reserve `flee` semantics: `flee` should always **try to leave the room**, not just disengage. Disengage-without-leaving is a separate verb (`disengage`, `stop`) and only needed in multi-target group combat.

**Sources**
- [Combat — Discworld MUD Wiki](https://dwwiki.mooo.com/wiki/Combat)
- [Discworld MUD docs: /doc/concepts/combat](http://discworld.atuin.net/lpc/playing/documentation.c?path=/concepts/combat)
- [How MUD Games Work: Commands, Worlds, and the Engine — Iron Realms](https://www.ironrealms.com/mud-games/how-mud-games-work/)
- [Combat… It Still Isn't Very Simple — mudcoders.com](https://mudcoders.com/combat-4155bdb31e0a/)

---

## 3. Onboarding into first combat

**Synthesis.** The single biggest text-MUD onboarding sin is the **wall of `help combat`** — newcomers are dropped at the start with documentation and no scaffolding. Best practice across modern text RPGs and parser games is **playable, in-narrative tutorialization**: the first encounter is hard-scripted to teach 1-3 verbs, the system surfaces hints at the input prompt, and new mechanics are introduced **one per encounter**, not all at once. Highlighting nouns/verbs in tutorial text (color or `<bracketed>` cues) reduces cognitive load measurably (Chris Ainsley, "Text Adventure Game Design in 2020"). The "first kill" should happen in <5 minutes from character creation — ideally with one verb (`attack`).

**Recommendations**
- **Scripted first encounter.** Place a guaranteed-winnable "rusted scout" or equivalent in room 1-2. The room description ends with: `> A rusted scout lurches at you. Type \`attack scout\` to fight.` Highlight the verb and noun in color. Player types it, hits, kills it. Done — they have fought.
- **One mechanic per encounter for the next 3-5 encounters.** Encounter 2 introduces `flee` (the enemy is too strong and the room exit is signposted). Encounter 3 introduces `look` / `consider` (the enemy has a weakness in its description). Encounter 4 introduces a status effect (a poison spider; the prompt now shows `[poisoned]`). Encounter 5 introduces an ability or weapon trait.
- **Contextual prompt hints.** When HP drops below 30%, the prompt should suggest `(low health — try \`flee\` or \`use bandage\`)`. Inform 7 / Inworld and Portal-2-style hints are the canonical reference for this pattern; don't lock the hints behind a `help` command.
- **Tutorial scaffolding fades.** After the first kill, hints downgrade from "type X" to brief reminders. After a zone, hints disappear except for new mechanics. RogueBasin's "Designing for Mastery" articles describe this as the ideal scaffolding curve.
- **`help combat` should still exist** — but as a reference, not an introduction. Structure it as a 1-screen cheat sheet (verbs grouped by frequency), not a chapter. NetHack and Qud both have manual pages, but neither expects a player to read them first.
- **No character-creation wall.** The 7 classes can be picked at the rusted-scout prompt or right after with one paragraph each, not via a stat-allocation form. Any class-defining ability should auto-equip; no opening inventory ritual.

**Sources**
- [Game UX: Best practices for video game tutorial design — Inworld](https://inworld.ai/blog/game-ux-best-practices-for-video-game-tutorial-design)
- [Text Adventure Game Design in 2020 — Chris Ainsley, Medium](https://medium.com/@model_train/text-adventure-game-design-in-2020-608528ac8bda)
- [Designing for Mastery in Roguelikes — Grid Sage Games](https://www.gridsagegames.com/blog/2025/08/designing-for-mastery-in-roguelikes-w-roguelike-radio/)

---

## 4. Hit/miss, damage variance, crits

**Synthesis.** Two dominant formula families: (a) **D20-style** (NetHack — `1d20 + tohit_mods` vs. AC) and (b) **percentile/stat-driven** (Discworld, Achaea — skill check modified by stats). Caves of Qud uses a **layered** model: roll to-hit, then roll penetration vs. armor (3 sub-rolls of 1d6 vs. AV), then damage. Variance that "feels rewarding" sits in the **±15-25%** range on damage; below 10% feels deterministic-but-fine, above 40% feels swingy and frustrating. Misses must convey *why* they missed (dodged, blocked, glanced off armor) — a flat "You miss." is the worst outcome (NetHack's combat-overhaul draft explicitly cites this). Crits are best as **multiplier + flavor** (1.5x-2x damage with a distinct message), not extra-roll lottery.

**Recommendations**
- **Adopt a Qud-flavored 3-step roll:** (1) `to_hit = d20 + accuracy_mods` vs. `dodge = 10 + reflex + armor_dodge_penalty`; (2) on hit, `penetration = weapon_pv + d6` vs. `armor_av` — if penetration fails, glancing/blocked message and reduced damage; (3) `damage = base_die + str_mod` with ±20% variance via `floor(base * (0.8 + 0.4 * random()))`.
- **Crits = nat-20 to-hit, deal 1.5x-2x damage with a flavor line.** Avoid extra rolls. NetHack's "Splat!" / "Splash!" style of encounter-specific messaging is a good reference for variety without mechanic creep.
- **Always tell the player *why* the miss happened.** Three message buckets: `dodged` (target's reflex won), `blocked` (target had a shield/parry skill), `glanced off armor` (penetration failed). One line each. A player who reads "You stab the raider — your knife glances off their plating." learns an armor lesson; one who reads "You miss." learns nothing.
- **Cap variance.** Total damage variance from all sources (roll + crit + ±20%) should keep an average attack inside ~50%-200% of nominal damage. Beyond that, encounters become unpredictable in a frustrating way (per Stern's "12 Ways to Improve Turn-Based RPGs").
- **Show the math under the hood for one combat trait.** "Critical hit (+50% damage)" appearing in the log teaches the player without forcing a wiki dive. Achaea-class MUDs publish their formulas; that transparency is universally praised in r/MUD threads.
- For the post-apoc tone, consider a **damage-threshold** (DT) variant from Fallout-lineage games (Tale of Two Wastelands): damage below DT is reduced to 1, encouraging players to upgrade weapons and seek armor-piercing. This adds tactical layering without an extra stat. `[low confidence — TTW formulas come from forum posts; corroborate before committing]`

**Sources**
- [Combat — Caves of Qud Wiki](https://wiki.cavesofqud.com/wiki/Combat)
- [Penetration (PV) — Caves of Qud Wiki](https://wiki.cavesofqud.com/wiki/Penetration_(PV))
- [Critical hit — Caves of Qud Wiki](https://wiki.cavesofqud.com/wiki/Critical_hit)
- [To-hit — NetHack Wiki](https://nethackwiki.com/wiki/To-hit)
- [Combat System Overhaul Draft 1 — NetHack Wiki](https://nethackwiki.com/wiki/User:Phol_ende_wodan/Combat_System_Overhaul_Draft_1)
- [12 ways to improve turn-based RPG combat systems — Game Developer (Craig Stern)](https://www.gamedeveloper.com/design/12-ways-to-improve-turn-based-rpg-combat-systems)

---

## 5. Status effects (the canonical 5-8)

**Synthesis.** Across NetHack, Qud, Achaea, Diku-derivatives, and broader RPG/roguelike status-effect taxonomies, a small core set recurs: **Bleed, Poison, Stun, Burn, Slow, Weakness, Blind, Fear**. Achaea famously goes further (hundreds of "afflictions") but that's a design endpoint of a 25-year curing-meta game — for a new single-player MUD, **5-7 effects** is the right starting target. The killer UX problem is *communication*: when a status starts, when it ticks, when it ends, and what its cumulative state is. The Aardwolf community converged on prompt-bar indicators (`[Pois][Bleed][Stun]`) and **two-tier message control** (`NOSPAM` for parry/dodge clutter; status changes always shown). A common roguelike solution is colored short tags on the entity (`raider [bleeding]`).

**Recommendations**
- **Ship with 6 status effects mapped to existing stats**: `Bleed` (DoT, physical), `Poison` (DoT, biological — countered by vigor), `Stun` (lose AP — countered by grit), `Burn` (DoT, fire/radiation), `Weak` (-damage — flavor for shadow/wits debuff), `Blind` (-accuracy — flavor for presence/shadow). Keep `Fear` and `Slow` as tier-2 unlocks once an enemy type uses them.
- **Persistent prompt indicator.** The default prompt should show active effects: `[HP 84/120 | AP 2 | Pois Bleed]>`. This is the Aardwolf model and matches the player's mental load — they shouldn't have to type `affs` to remember they're poisoned.
- **Three messages per effect: onset, tick, expire.** Onset: `Black blood seeps from the wound — you are bleeding.` Tick (every turn while active): `You bleed (-3 hp).` Expire: `The bleeding stops.` Color-code so the player can scan: red for damage-in, yellow for warnings, gray for expirations.
- **Cumulative (stacking) effects need a magnitude shown.** `[Pois x2]` for two stacks; only stack if the design uses it tactically. Most RPGs cap stacks at 3-5 to prevent runaway DoT — adopt that.
- **One verb to inspect status:** `affs` or `status` lists active effects with remaining duration. NetHack uses single-line abbreviations on the status bar; Qud uses a tooltip on the entity. For a text MUD, prefer a verb.
- **Don't pile on flavor lines per turn.** A poisoned character who already knows they're poisoned does not need "you feel sick" every turn. Aardwolf's `NOSPAM` exists because this anti-pattern was rampant — only show effect lines on state change, plus the numeric tick on the affected entity.

**Sources**
- [Stun, Regen, Poison, and Mute — OHRRPGCE Wiki](https://rpg.hamsterrepublic.com/ohrrpgce/Stun,_Regen,_Poison,_and_Mute)
- [Standard Status Effects — All The Tropes](https://allthetropes.org/wiki/Standard_Status_Effects)
- [Mud Messages — AardWiki](https://www.aardwolf.com/wiki/index.php/Main/MudMessages)
- [Combat — Achaea overview](https://wiki.achaea.com/Combat:Overview)

---

## 6. Combat log readability

**Synthesis.** The "scroll well" combat log has 4 properties: (1) **dense per turn but not per action** — one screen of output per round, not per attack-step; (2) **stable structure** — the same lines in the same positions so the player's eye lands on damage numbers the same way every turn; (3) **color-coded but with restraint** — typically 4-5 colors, not 12; (4) **a stable status footer** with HP/AP/effects. Mudlet's color-trigger documentation and the Aardwolf MUD community settled on these conventions. Accessibility (screen-reader users) drives the same recommendations: short, structured lines, no ASCII art mid-combat, predictable verb order.

**Recommendations**
- **Ideal post-attack readout (1 screen):**
  ```
  > attack raider
  You lunge at the raider with your shock-baton.
    [hit] You strike the raider for 14 damage. (raider: 32/60)
    [bleed] The raider is bleeding.
  The raider swings a rusted pipe at you.
    [block] Your plating absorbs the blow. (you: 84/120)

  [HP 84/120 | AP 2 | Pois] >
  ```
  6-8 lines per round. Player damage-out first, status changes second, enemy action third, status footer last.
- **Color palette (4 buckets):** red (damage to player), green (damage to enemy / your hits), yellow (status / warnings), gray (flavor / misses / glances). Avoid blue for damage (low contrast on dark terminals). Don't introduce more colors per status — use bracketed tags `[bleed]` for those.
- **Group multi-action turns.** If your action economy lets the player attack twice in one turn, render it as one block, not two flush-left messages. Aardwolf explicitly cites multi-hit per round as a spam source.
- **Provide `combatlog` / `verbose` toggles** with sensible defaults: `terse` (just damage numbers and status changes), `normal` (default — flavor included), `verbose` (every roll shown — for tinkerers).
- **Stable status footer.** A bracketed line at the bottom of every output that always shows: HP, AP, active effects, current target. The player's scan path becomes muscle memory.
- **No mid-combat ASCII art.** Save banners and art for room descriptions and menus. Combat output is content the player reads 100s of times — keep it clean.
- **Screen-reader fallback.** Accept a `--accessible` flag (or per-account setting) that strips color and uses text indicators. This is a legitimate market and several MUDs (Aardwolf, Alter Aeon) report substantial blind player communities.

**Sources**
- [Building a better MUD for screen reader users — Writing Games](https://writing-games.com/building-a-better-mud)
- [Mud Messages — AardWiki](https://www.aardwolf.com/wiki/index.php/Main/MudMessages)
- [Manual:Basic Essentials — Mudlet Wiki](https://wiki.mudlet.org/w/Manual:Basic_Essentials)
- [Combat / Grouping changes — Aardwolf MUD Blog](https://www.aardwolf.com/blog/2011/07/30/combat-grouping/)

---

## 7. Time-to-kill (TTK) and pacing

**Synthesis.** No single canonical TTK exists, but **3-7 player actions per encounter** is the well-paced range across single-player roguelikes (NetHack, Qud, Brogue) and turn-based RPGs (Stern's "12 Ways" article advocates ~5). Below 3 (one-shots) the game becomes a damage-spike puzzle and combat verbs are wasted. Above ~10 actions you hit the **Diku spam ceiling** ("just spam your highest-level kick"), and players reach for autobattle/macros to skip it — both signals that combat has lost its tactical content. Boss/elite encounters can stretch to 10-15 actions if there are phase changes.

**Recommendations**
- **Target average encounter: 4-5 player actions.** Pick base HP and damage so a level-appropriate enemy dies in ~5 attacks at average rolls. Variance can take it to 3 or 7; that's fine.
- **Enemy archetypes by TTK.**
  - `Trash` (1-2 actions) — used for area-clear feel, low XP, minimal interrupt.
  - `Standard` (3-5 actions) — bulk of the bestiary; tactical mid-encounter decisions.
  - `Elite` (6-9 actions) — has a mechanic (telegraphed heavy attack, status), worth examining.
  - `Boss` (10-15 actions, phase changes) — once per zone, narrative beat.
- **Watch for "spam your best move" emergence.** If the optimal player loop in testing is `attack` 5 times in a row, combat is shallow. Cure: (a) status interactions that reward switching verbs; (b) cooldowns or AP costs that push variety; (c) enemy phases that require response (telegraphs).
- **Keep encounter density modest.** 271 rooms × ~3-5 hostile rooms per zone × ~5 turns × 6-10 lines per turn = readable scroll volume. Cite Stern: "If the average encounter takes longer than 5-10 minutes of real time, players start to skip combat-heavy paths." Aim for ~30s-2min real time per encounter.
- **Telegraph long encounters.** If a boss takes 12+ turns, chunk it into 3 phases of 4 turns with visible state changes ("the warlord's plating cracks; he draws a second blade"). Players accept long fights when they see progress.

**Sources**
- [12 ways to improve turn-based RPG combat systems — Game Developer](https://www.gamedeveloper.com/design/12-ways-to-improve-turn-based-rpg-combat-systems)
- [Ultimate Guide To Combat Pacing In TTRPGs — ttrpg-games](https://www.ttrpg-games.com/blog/ultimate-guide-to-combat-pacing-in-ttrpgs/)
- [Combat Pacing and Time to Kill — MMORPG.com Forums](https://forums.mmorpg.com/discussion/380612/combat-pacing-and-time-to-kill-prime-importance-in-pvp-rvr)

---

## 8. Multi-enemy / area combat

**Synthesis.** A 2-5 enemy fight breaks naive single-target combat: targeting becomes confusing, the combat log balloons, and the player loses agency. The proven solutions are **sticky last-target**, **rollover hits** (Aardwolf's 2011 redesign — extra hits flow to next enemy when the current one dies), **area abilities with diminishing returns**, and **enemy "stance" displays** so the player can see threat order at a glance. Brogue's heat-map AI gives multi-enemy fights coherence — enemies don't just swarm, they pathfind around the player's threat. For a MUD, simpler conditional-AI suffices.

**Recommendations**
- **Sticky last-target with explicit override.** `attack` on its own re-targets the last enemy hit; `attack 2.bandit` overrides; `target raider` sets sticky target without attacking. Default to sticky to remove the "two bandits — which?" friction.
- **Rollover damage on kill.** If `attack` is a multi-strike turn (heavy + quick) and the first strike kills, roll the second to the next-highest-threat enemy. Aardwolf explicitly cites this as the biggest QoL improvement they made to multi-mob fights.
- **One enemy block per turn.** Render all enemy actions in one block, not interleaved with status footer. Order by initiative, prefix each line with the enemy's name. Don't let 5 enemies create 25 lines.
- **Area abilities with hard cap.** A grenade/cleave hits up to 3 targets at full damage, then half damage. Without a cap, AoE trivializes group fights; without diminishing returns, AoE becomes the only ability used.
- **Threat ordering in room description.** When entering a room with 3 enemies, describe them in threat order: `A scarred warlord, two raiders, and a wounded scout face you.` The player then knows by default which enemy `attack` will target.
- **Group AI: simple FSM with shared state.** Each enemy runs an idle/aggro/flee/dying FSM; a shared "group morale" timer triggers flee at 30% group HP. Brogue-style heatmaps are overkill for a text MUD; an FSM with 4 states + 2 conditions is the bar.

**Sources**
- [Combat / Grouping changes — Aardwolf MUD Blog](https://www.aardwolf.com/blog/2011/07/30/combat-grouping/)
- [A fascinating AI technique — Brogue (Hacker News)](https://news.ycombinator.com/item?id=22848888)
- [Enemy design — The Level Design Book](https://book.leveldesignbook.com/process/combat/enemy)

---

## 9. Flee / retreat / escape

**Synthesis.** The two failure modes are well-documented: **always-flee** (escape is trivial, so combat has no risk) and **never-flee** (escape is impossible, so failure feels arbitrary). Pokemon, Darkest Dungeon, and most JRPGs converged on the same shape: **base 70-75% chance**, modified by speed/level differences, with an **escalating chance on retry** (+5%/attempt) and a **non-zero cost** (lose initiative, drop items, take stress damage, lose XP). Cost design matters more than the chance design — flee should always be possible, but the player should pay a price proportional to what they're escaping from.

**Recommendations**
- **`flee` formula:** `base 70% + 5%/retry, modified by reflex_player - reflex_enemy_max`. Failed flee costs the player's turn (they take a hit). This matches Pokemon-lineage design and reads as fair to most playtesters.
- **Cost on success.** Successful flee always: (a) drops sticky-target, (b) leaves the room (random adjacent valid exit), (c) takes one parting shot from a random enemy at -50% damage. The parting-shot is the key anti-always-flee lever.
- **Direction-aware flee.** `flee north` attempts to leave via the named exit (slightly higher chance); bare `flee` picks a random exit. This adds player agency without complicating the verb.
- **No "you cannot flee from this fight" without explicit narrative cause.** Boss/scripted encounters can lock flee, but only when the room description and pre-fight beat made that obvious. Arbitrary "you can't run" in normal encounters is universally hated (mud-dev archives).
- **Escape consequences scale to severity.** Fleeing from a faction patrol you provoked = -10 reputation with that faction. Fleeing from wildlife = no reputation cost, just the parting shot. This is a rep-system hook, not a combat-system hook, but flee should expose it.
- **`wimpy <hp%>` auto-flee.** Players who don't want to die typing should be able to set an auto-flee threshold (Diku/Aardwolf standard). Default off; opt-in.

**Sources**
- [Run Away! Escape Mechanics in RPG's — Game Developer](https://www.gamedeveloper.com/design/run-away-escape-mechanics-in-rpg-s-)
- [Retreating — Darkest Dungeon Wiki](https://darkestdungeon.fandom.com/wiki/Retreating)
- [Escape — Bulbapedia (Pokemon)](https://bulbapedia.bulbagarden.net/wiki/Escape)

---

## 10. Death and recovery (death/rebirth cycle)

**Synthesis.** For The Remnant's stated death-rebirth-cycle design, the relevant references are **Hades, Rogue Legacy, Tales of Maj'Eyal Adventurer mode**, and **roguelite alternatives to permadeath** generally (RogueBasin's catalog). The key insight from the Hades/Rogue-Legacy lineage: **make death productive, not merely tolerable.** The player should return from death with: (1) a small permanent advancement (currency, unlock, narrative reveal), (2) a story beat that contextualizes the death, and (3) a slightly different starting state (random seed, different starter zone, new NPC dialogue). Penalty design is a balancing act — too soft and death is meaningless, too harsh and the player rage-quits.

**Recommendations**
- **Two currencies — temporary (lost on death) and permanent (kept).** Caps and remnants, or vigor-points and shards. Permanent currency funds meta-progression: stat upgrades, unlocked classes, faction reputations preserved. Temporary currency funds the current run.
- **Lose 50-80% of inventory on death; keep "soulbound" gear.** A fixed slot for "anchor" items survives death (one weapon + one trinket). Forces decisions on what to bind (Hades-style heirlooms).
- **Death → narrative beat.** Each death triggers a short scene: the rebirth altar, a recurring NPC who comments, a faction status update. Even 3-5 lines of text framing the death prevents the "ugh, restart" feeling. Hades' "every death is content" insight.
- **Resurrection scaling.** First death: minimal penalty (currency only). Death 5+: lose a level. Death 20+: the world reconfigures (different enemies, new NPCs, mutated zones). This staircase keeps long-run players engaged without punishing first-timers.
- **Save state at zone boundaries, not just on death.** Players who walk away mid-run should not lose progress; only true death triggers the cycle. ToME and Hades both have this.
- **Reveal lore through death.** Some narrative content is locked behind dying — a faction that only opens up to characters who have "tasted the dirt." Death becomes a key, not a wall.
- **Avoid pure-permadeath unless that's the explicit pitch.** True permadeath (NetHack-style) is a niche; the cycle pitch is a roguelite, and roguelites have a much wider audience. Don't half-commit.

**Sources**
- [Alternatives to Permadeath — RogueBasin](https://www.roguebasin.com/index.php/Alternatives_to_Permadeath)
- [Hades and the Dance of Death in Roguelikes — KeenGamer](https://www.keengamer.com/articles/features/opinion-pieces/hades-and-the-dance-of-death-in-roguelikes/)
- [Death in Gaming: Roguelikes and "Rogue Legacy" — Game Developer](https://www.gamedeveloper.com/design/death-in-gaming-roguelikes-and-quot-rogue-legacy-quot-)
- [Reverse Roguelikes: Embracing Death as Progression — Wayline](https://www.wayline.io/blog/reverse-roguelikes-embracing-death-as-progression)

---

## 11. Class / build differentiation in combat (7 classes)

**Synthesis.** With 7 classes, the differentiation challenge is keeping each class **mechanically distinct without ballooning content** (you can't write 7 unique combat systems). The proven approach across MUDs and TTRPGs is **shared verb set, divergent stat priorities, and 2-3 unique class abilities**. Achaea has 19+ classes that all use the same basic combat loop — the differences are in the unique skill trees, balance/equilibrium economy, and afflictions each class can apply. For a 7-class single-player MUD, aim for: every class uses `attack`, `flee`, `look`; each class has one **signature passive** (warrior's plating absorbs, rogue auto-targets weak point) and 2-3 **signature actives** (rogue's `backstab`, mage's `bolt`, tank's `taunt`).

**Recommendations**
- **Three differentiation axes:** (1) stat priority (each class has one star stat — warrior=vigor, rogue=reflex, mage=wits, etc.); (2) signature passive that always applies; (3) 2-3 signature active abilities that scale with the star stat.
- **Reuse the underlying combat math.** Don't write a separate combat resolver for "magic" vs "melee" — both go through the same to-hit/penetration/damage pipeline. Mages just have abilities that bypass armor (high PV) or apply a status effect on hit. This is the Qud approach.
- **Signature ability should be available from level 1.** A rogue without `backstab` is a worse warrior; a mage without `bolt` has no class identity. Don't gate the class fantasy behind 5 levels of gray combat.
- **Differentiate by status-effect specialty.** Warrior applies stun reliably; rogue applies bleed; mage applies burn; medic applies regen on self/allies. The status taxonomy from §5 doubles as class differentiation.
- **Avoid "warrior is the boring class" trap.** Give the warrior an active interrupt (`shield bash` to break a telegraphed attack), not just a passive damage bonus. Players who pick the heavy/tank class deserve interesting buttons.
- **One class slot for a "weird" class.** Of 7 classes, at least one should break the rules — a class whose combat works fundamentally differently (e.g., the `shadow` class fights via stealth and never engages directly; combat for them is positional/avoidance). This is a content multiplier and a press hook.
- **Ability count budget:** ~3 actives + 1 passive per class = 28 abilities total to design and balance. That's manageable. Don't ship with 7+ abilities per class; that's 50+ abilities you have to balance and document.

**Sources**
- [Combat:Overview — AchaeaWiki](https://wiki.achaea.com/Combat:Overview)
- [Help for Game Commands | Sindome (combat skills)](https://www.sindome.org/help/game/combat%20skills/)
- [Analysis / Character Class System — TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Analysis/CharacterClassSystem)
- [The Free RPG Blog: Warrior, Rogue & Mage](http://www.thefreerpgblog.com/2010/09/warrior-rogue-mage-so-good-i-nearly-proposed-to-michael-wolf.html)

---

## 12. AI for enemies

**Synthesis.** The bar for "tolerable AI" in a single-player text MUD is **low and specific**: enemies must (a) react to player state changes (low HP, certain status), (b) telegraph dangerous attacks, (c) have varied behavior across enemy types so 15 enemy archetypes feel like 15 things. A simple **finite state machine** (idle / aggressive / cautious / fleeing) with **conditional triggers** (low HP → flee; player low HP → press) hits this bar. Brogue's heat-map AI is the gold standard but overkill; the more impactful investment is **per-enemy-type behavior trees** so enemies feel different. Telegraphed wind-up attacks ("the warlord raises his cleaver — your next turn matters") are the single biggest player-experience win.

**Recommendations**
- **FSM with 4-5 states per enemy type.** `idle`, `aggressive` (default in combat), `cautious` (low HP, distance/defend), `fleeing` (very low HP, leaves room), `enraged` (some enemies — boss-level only). State transitions on HP thresholds and player actions.
- **Telegraphed heavy attacks.** Each elite/boss has 1-2 heavy attacks that take 2 turns: turn 1 = wind-up message ("the warlord coils for a leaping strike"), turn 2 = strike resolves. The player has 1 turn to react: dodge, interrupt, brace. This is the single most-praised mechanic in Souls-like and roguelike literature.
- **Enemy "personality" via overrides.** Each of the 15 enemy types has a small JSON-style override on the base FSM (raider: aggressive longer; scout: more likely to flee; warlord: enrages at 50%; ghoul: never flees). Doesn't require behavior trees — just a config table.
- **Faction-driven behavior.** Faction NPCs check faction reputation before engaging. A neutral faction member becomes hostile only on provocation; a hostile faction member attacks on sight. This is a hook into the existing 9-faction system.
- **Don't overinvest.** Brogue heatmaps, full behavior trees, GOAP planners — all overkill for a single-player text MUD. The variance from "this raider acts differently than that scout" is more important than depth on any single AI.
- **Show enemy intent in the combat log.** "The raider eyes the door, weighing escape." (precursor to flee state) "The warlord glares at you, nostrils flaring." (precursor to enrage). One line per state change, never per turn. This makes the AI legible — players love legible AI.

**Sources**
- [Enemy Attacks and Telegraphing — Game Developer](https://www.gamedeveloper.com/design/enemy-attacks-and-telegraphing)
- [Enemy design — The Level Design Book](https://book.leveldesignbook.com/process/combat/enemy)
- [A fascinating AI technique — Brogue (Hacker News)](https://news.ycombinator.com/item?id=22848888)
- [Roguelike intelligence series — RogueBasin](https://chizaruu.github.io/roguebasin/roguelike_intelligence_series_of_articles)
- [Designing for Mastery in Roguelikes — Grid Sage Games](https://www.gridsagegames.com/blog/2025/08/designing-for-mastery-in-roguelikes-w-roguelike-radio/)

---

## 13. QA / testing methodology for combat

**Synthesis.** What MUD authors actually do (per mud-dev archives, Top MUD Sites threads, mudcoders.com) is **less rigorous than commercial games but more focused**: scenario tests for the combat loop ("can a level-1 X kill a level-1 Y in 3-7 turns?"), balance tables (DPS by class/level), and live playtesting with developers logging in as low-level alts. **Monte Carlo simulation** is the most-cited "modern" technique — scripts that run 1,000 simulated combats with random rolls and graph the outcome distribution (Stern, Machinations). Property-based tests (fixed invariants — "no encounter ever results in negative HP", "player can always flee a non-boss room") are highly effective for catching edge cases in turn-based logic. **Heatmap-style balance dashboards** (X axis: enemy level, Y axis: player class, color: win rate or avg turns) are the killer artifact for tuning.

**Recommendations**
- **Three-tier test pyramid.**
  1. **Unit tests on the combat resolver.** Given a fixed seed and inputs, the math should be deterministic. Property tests: HP never negative; AP regenerates correctly; status durations decrement.
  2. **Scenario tests on encounters.** "Class W vs Enemy X with default loadout: avg 4-7 turns to kill, win rate >70%." One scenario per (class × enemy_type) cell = 7 × 15 = 105 scenarios. Run on every PR.
  3. **Monte Carlo balance sweep.** Run each scenario 1,000 times with random seeds; produce a heatmap of (turns-to-kill × win rate) per cell. Outliers are tuning targets. Cite Stern/Machinations.
- **Replay logs.** Every test combat saves a deterministic replay (input seq + seed). Bug reports become "play this replay" — huge dev velocity win.
- **Player-facing "training dummy" room.** A no-XP room with 5 dummies of different levels. Internal QA tool that ships to players for free — they help find imbalances.
- **Fuzz the combat parser.** Random verb/target/modifier strings shouldn't crash. Easy property test, catches a class of bugs that always exists in MUDs.
- **Track 4 metrics in production telemetry** (cycle 2+, when there's a player base): avg-TTK by encounter, flee-success rate, death-cause distribution, prompt-input latency. The first three drive balance; the last drives UX.

**Sources**
- [Monte Carlo Simulations for Game Design — Boards and Barley](https://boardsandbarley.com/2013/09/17/monte-carlo-simulations-for-game-design/)
- [What are game simulations and why should you care? — Machinations.io](https://machinations.io/articles/what-are-game-simulations-and-why-should-you-care)
- [12 ways to improve turn-based RPG combat systems — Game Developer](https://www.gamedeveloper.com/design/12-ways-to-improve-turn-based-rpg-combat-systems)
- [MUD Combat systems — Top Mud Sites Forum thread](https://www.topmudsites.com/forums/showthread.php?t=133)

---

## 14. Failure patterns to avoid (anti-patterns from real games)

**Synthesis.** Distilled from mud-dev archives, mudcoders.com post-mortems, NetHack design discussions, Aardwolf design notes, and Diku-derivative critiques. These are the recurring patterns that have killed combat experiences across the genre.

**Anti-patterns**
1. **The Diku WAIT_STATE.** Player types `kick`, can't input anything for 3 rounds. Universally hated. Source: mudbytes coding-and-design archives, mud-dev list. **Cure:** advance the world tick on player input, never lock player input.
2. **Spam-the-best-move combat.** "Just spam your highest-level kick while cycling a heal" (mudcoders.com on Diku combat). **Cure:** AP costs, status interactions, telegraphed enemy attacks that demand response — anything that breaks the single-verb optimum.
3. **Wall-of-`help combat`.** New player connects, types `help combat`, gets 200 lines of mechanics. They quit. **Cure:** scripted first encounter, in-prompt hints, mechanics introduced one per encounter (§3).
4. **Verb typo lockout.** `kil` doesn't match `kill`; player frustrated. Sneeped in Discworld and Diku. **Cure:** prefix matching with tie-break to canonical verb.
5. **Always-flee or never-flee.** Either escape is trivial (no combat risk) or impossible (forced TPK). Documented in Darkest Dungeon and Pokemon design retrospectives. **Cure:** §9 — 70% base, parting shot, never lock except in scripted bosses.
6. **The "you miss." line.** Bare miss messages with no reason. NetHack's combat-overhaul draft explicitly cites this. **Cure:** dodged/blocked/glanced with a one-line reason every miss.
7. **Combat-log spam from passive abilities.** "You feel the rhythm of combat" every turn because you have a +1 passive. Aardwolf's `NOSPAM` exists because of this. **Cure:** show passives once on engage, not per-turn.
8. **Status-effect overload (Achaea trap).** 100+ afflictions, no UI for tracking. Achaea built an entire client ecosystem (Mudlet, SVOF) just to manage it. For a single-player, this is an endgame design where new players bounce. **Cure:** ship 6-8 effects max, prompt indicators, scale up only with content.
9. **No telegraphed attacks.** Boss does 80% of player HP with no warning. Feels arbitrary. Souls-like, modern roguelike, and TTRPG design all converge on "telegraph or it's a bug." **Cure:** §12 — 2-turn wind-up on heavy attacks.
10. **Class differentiation by raw stats only.** "The warrior has +2 HP per level." Players can't feel a +2 HP/level; they feel `backstab`, `taunt`, `bolt`. **Cure:** §11 — every class ships with a signature active ability at level 1.

**Sources**
- [MudBytes coding/design forum (combat threads)](https://www.mudbytes.net/forum/topic/2396/)
- [Combat… It Still Isn't Very Simple — mudcoders.com](https://mudcoders.com/combat-4155bdb31e0a/)
- [Combat System Overhaul Draft 1 — NetHack Wiki](https://nethackwiki.com/wiki/User:Phol_ende_wodan/Combat_System_Overhaul_Draft_1)
- [Mud Messages / NOSPAM — AardWiki](https://www.aardwolf.com/wiki/index.php/Main/MudMessages)
- [Run Away! Escape Mechanics in RPG's — Game Developer](https://www.gamedeveloper.com/design/run-away-escape-mechanics-in-rpg-s-)
- [Enemy Attacks and Telegraphing — Game Developer](https://www.gamedeveloper.com/design/enemy-attacks-and-telegraphing)

---

## Top 10 Recommendations (distilled, actionable)

Each is phrased for a code-planning agent (Blue) to translate into file-level work.

1. **Adopt a per-action world tick (no WAIT_STATE).** Every player command advances the world by 1 tick; enemies act on their own schedule modulated by `reflex`. Implement a `CombatHandler` class that owns the encounter, mediates turn order from `reflex + d6` initiative, and resolves one player action per request. Reject any design that locks player input. *Maps to: combat handler module, request handler hook.*

2. **Ship a 4-verb floor (`attack`, `flee`, `look`, `status`) and gate everything else.** First combat must be playable with these. Implement sticky last-target on bare `attack`; ordinal-prefix and partial-name disambiguation; prefix matching with a tie-break to canonical verb. *Maps to: parser module, target-resolver utility.*

3. **Scripted first encounter at room 1-2 with a guaranteed-winnable enemy and inline hint text.** End the room description with `Type \`attack scout\` to fight.` Color-code the verb. After the kill, introduce one new mechanic per encounter for the next 4 fights. *Maps to: zone 1 content, hint system.*

4. **3-step combat resolver: to-hit → penetration → damage.** D20 to-hit vs (10 + reflex), 3×d6 penetration vs armor AV, base damage with ±20% variance. Crit = nat-20 = 1.5x damage with flavor message. Every miss has a reason: `dodged` / `blocked` / `glanced off armor`. *Maps to: combat math module, message generator.*

5. **Six status effects (`Bleed`, `Poison`, `Stun`, `Burn`, `Weak`, `Blind`) with prompt indicators and 3-message lifecycle.** Persistent footer shows `[Pois Bleed]`. Onset/tick/expire messages, color-coded. Suppress redundant per-turn flavor (Aardwolf NOSPAM lesson). *Maps to: status-effect engine, prompt renderer.*

6. **Standardized 6-8-line per-round combat log with stable layout and 4-color palette** (red=damage-in, green=damage-out, yellow=status, gray=miss/flavor). Status footer always last. Implement `terse` / `normal` / `verbose` toggles. Accessible mode strips color. *Maps to: combat log renderer, settings module.*

7. **Target avg encounter = 4-5 turns; classify enemies into trash/standard/elite/boss TTK bands; telegraph all 2-turn heavy attacks.** Tune base HP/damage per band. Each elite/boss has at least one telegraphed wind-up ability. *Maps to: enemy stats config, ability system.*

8. **Flee = 70% + 5%/retry, modified by reflex delta; success always costs a parting shot at -50% damage; failed flee costs the turn.** `wimpy <hp%>` opt-in auto-flee. Never lock flee outside narrative-justified boss rooms. *Maps to: flee command handler, wimpy setting.*

9. **Death/rebirth: dual currencies (temp lost on death, permanent kept), one anchor weapon + trinket survives, every death triggers a ≥3-line narrative beat.** Death penalty staircase scales after death 5 and 20. Save state at zone boundaries. *Maps to: death handler, persistence model, currency system.*

10. **Each of the 7 classes ships with 1 signature passive + 2-3 signature actives at level 1**, sharing the underlying combat math but differentiated by stat priority and which status effects they specialize in applying. Keep total ability count to ~28 across all classes. *Maps to: class definitions, ability registry, balance heatmap test harness.*

**Bonus 11 (testing).** Build a Monte Carlo balance harness that runs every (class × enemy_type) pair 1,000 times and produces a heatmap of avg-TTK and win rate. This is the highest-leverage piece of internal infrastructure for combat tuning — without it, balance is guessed; with it, balance is observed.

---

## Confidence notes and gaps

- **High confidence** on §1, §2, §6, §7, §9, §14 — well-documented in MUD design archives and primary sources.
- **Medium confidence** on §4 (Caves of Qud formulas summarized from wiki search snippets, not full-text reads), §11 (Achaea overview searched, full skill-tree analysis not retrieved).
- **Low confidence** explicitly tagged: damage-threshold from Tale of Two Wastelands (§4); some specific TTK numbers (§7) are practitioner-rule-of-thumb rather than published research.
- **Gaps not addressable from web research alone.** Specific TypeScript / Next.js implementation patterns for combat handlers, Supabase row-level security implications of combat state, real-time vs polling tradeoffs for the prompt UX. These are project-specific and belong in the Blue plan.
- **WebFetch was unavailable** in this environment, so where a search snippet was thin (Caves of Qud combat formula details, the SinisterDesign "12 Ways" full text, the RogueBasin permadeath alternatives catalog), recommendations rely on multiple corroborating search results rather than a deep read of any one source. Before locking implementation details, a follow-up pass with full-text fetch or manual review of the cited URLs is recommended.
