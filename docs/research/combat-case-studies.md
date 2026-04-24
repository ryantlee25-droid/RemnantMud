# Combat Case Studies — What Battle MUDs and Indie Text RPGs Actually Did

**Audience:** Blue (planning), and downstream Howlers implementing combat for *The Remnant*.
**Scope:** 12 named systems. For each: one-line summary, what works, what failed, one transferable lesson, and sources.
**Filter:** *The Remnant* is single-player turn-based with 271 rooms / 13 zones / 7 classes / 15 enemies. PBP/multiplayer-only lessons are flagged as such.
**Confidence note:** `[low confidence]` is used where I could not find a primary or strong-secondary source.

---

## Part 1 — Case Studies

### 1. Aardwolf — Two-Prompt Combat with Spam Controls

**One-liner.** Long-running Diku-derivative (1996–) with a separate combat prompt, target health on the prompt itself, and explicit player-side commands (`NOSPAM`, `NOSTATUS`) for filtering combat noise.

**What works.**
- **Two prompts, not one.** A regular prompt for travel, a `bprompt` for combat. The combat prompt expands to include enemy-only variables like `%b` (enemy HP %) so the player never has to scan upward to find the target's status. (AardWiki — Prompts)
- **Player-tunable noise floor.** As skill scales, "you parry" / "you dodge" / "you blink" messages multiply. `NOSPAM` suppresses these; `NOSTATUS` lets the player remove the per-round target status block in favor of a `%b`-driven prompt token. The player decides what's signal. (AardWiki — Mud Messages)
- **Stacked commands.** A single input line can chain commands ( `kill rat;cast heal me;flee` ) so the player can pre-script a panic plan without an actual scripting client. (AardWiki — Stacked Commands)

**What doesn't / what they fixed.**
- The legacy single-prompt + always-on round status was so noisy that AardWiki's own help pages document the spam problem and the *workarounds* rather than fixing the messages at source. The fix was UI plumbing, not message redesign.
- Aardwolf's experience-per-level was rebalanced in 2014 because mid-tier leveling felt punishingly slow — a reminder that combat-feel is partly a pacing problem, not just a per-fight problem. (Aardwolf Blog — exp-level-reduction-setwanted)

**Transferable lesson for *The Remnant*.**
> Add a dedicated **battle prompt** that swaps in when an encounter starts (e.g. `[HP 87/100  EN 40/40  ENEMY: raider 'wounded']`) and swaps out when combat ends. Pair it with a single `terse on/off` toggle that suppresses miss/dodge/glance lines so a returning player can dial spam to taste in one command.

**Sources.**
- https://www.aardwolf.com/wiki/index.php/Help/Prompt
- https://www.aardwolf.com/wiki/index.php/Main/MudMessages
- https://www.aardwolf.com/wiki/index.php/Help/StackedCommands
- https://www.aardwolf.com/blog/2014/07/20/exp-level-reduction-setwanted/

---

### 2. Achaea (Iron Realms) — Affliction Stacking and the Curing Clock

**One-liner.** Real-time PvP-first MUD where combat is "rock-paper-scissors at 1 Hz": you push afflictions onto the opponent faster than their salves/herbs/elixirs can clear them, and "lock" them when their cure tree can't keep up.

**What works.**
- **Asymmetric clocks.** Affliction-curing salves and herbs can be eaten ~once per second. Health-restoring elixirs and the heal-mana herb (irid moss) are gated to ~once per 5 seconds. The mismatch is the entire game: you can fix what's wrong faster than you can fix being low on HP. (AchaeaWiki — Curing)
- **Locks as a win condition.** A "lock" is a combination of afflictions that prevents the victim from removing the conditions causing the lock — e.g. paralysis + anorexia + asthma can stop them from eating the cure for paralysis. Combat ends when the curer falls behind, not when HP hits zero. (50 Years of Text Games — 1997: Achaea)
- **Prompt as scoreboard.** `PROMPT STATS` adds `e` (equilibrium) and `x` (balance) glyphs to the prompt so the player can see at a glance whether their next action will fire. (AchaeaWiki — Combat Overview)

**What doesn't / what they fixed.**
- Achaea is famously hard to learn. Community curing systems (Svof, TReX, Overwatch) exist *because* the raw game requires a scripting client to play competitively — the affliction count (40+) outpaces human reaction time. The fact that "buy a curing system" is the standard onboarding step is itself the failure. (Svof docs; Achaea Forums — TReX thread)
- Iron Realms eventually added a **server-side queue** so players can queue actions without a client script — a partial fix for the "you can't play without coding" problem, debated for years on the forums. (Achaea Forums — Server-side Queue)

**Single-player filter.** PBP-specific ceilings (1-second / 5-second clocks) are sport-tuned and don't apply solo. The transferable idea is *asymmetric resource clocks*, not the literal timing.

**Transferable lesson for *The Remnant*.**
> Give status afflictions (bleed, blind, stagger, irradiated) **per-affliction cooldowns to clear** that are shorter than the cooldown to heal HP. This forces players to triage symptoms before topping up health — and creates "you got locked" failure modes where a stack of stacks ends the fight even though HP wasn't zero.

**Sources.**
- https://wiki.achaea.com/Combat:Overview
- https://wiki.achaea.com/Curing
- https://if50.substack.com/p/1997-achaea
- https://forums.achaea.com/discussion/968/server-side-queue

---

### 3. Discworld MUD — The Tactics Knob

**One-liner.** LPMud with a deep skill tree and a single live-mutable `tactics` command that lets the player retune attitude, response, and target-focus mid-fight.

**What works.**
- **Five-step attitude axis.** `attitude insane | offensive | neutral | defensive | wimp` — each step trades attack bonus for dodge/parry bonus. One command, instantly reversible, even mid-round. (Discworld Wiki — Tactics)
- **Response = which defense skill activates.** `response dodge | parry | block` decides which subtree of the defence tree gets used. Players who specced into parry actually parry; players who specced into dodge actually dodge. The setting *and the skill spend* both have to agree. (Discworld docs — /helpdir/tactics)
- **Body-part focus.** `focus head | chest | legs` etc. lets the player aim attacks at specific locations. Combined with the wound system, this gives "I am cutting his sword arm so he drops his weapon" emergent play. (Discworld Wiki — Tactics)
- **Stat × skill weighting is published.** Players can read the stat weights for each skill (e.g. `fighting.melee.dagger` is heavily Dex). Build planning becomes legible. (Discworld Wiki — Skills)

**What doesn't / what they fixed.**
- The skill tree's depth (>200 fighting skills across melee/range/unarmed/defence/special) requires a "fighting skills" guide to make sense of for new players (Adventurers' Guide to Discworld MUD — Fighting Skills). Discworld is loved for this depth but is not "fast to get into" — exactly the failure mode *The Remnant* must avoid.

**Transferable lesson for *The Remnant*.**
> Add one command — `stance offensive|balanced|defensive|wary` — that mutates a small set of derived stats per round (to-hit, dodge chance, AC, threat). One axis, four steps, settable mid-fight, surfaced in the prompt. Resist the urge to ship Discworld's full matrix; ship the one knob that gives the *feeling* of tactical agency without the homework.

**Sources.**
- https://dwwiki.mooo.com/wiki/Tactics
- https://dwwiki.mooo.com/wiki/Skills
- https://discworld.starturtle.net/lpc/playing/documentation.c?path=/helpdir/tactics
- https://herebefootnotes.wordpress.com/fighting-skills/

---

### 4. BatMUD — Formations and the 9-Player Wall

**One-liner.** LPMud with 20+ guilds, 50+ races, formation-based group combat (front / middle / back rows), and explicit tank / DPS / healer roles.

**What works.**
- **Formation as combat geometry.** Parties slot into front/middle/back rows; melee in front absorbs hits, casters in back are protected unless front collapses. The geometry is a visible part of the prompt and party state. (Wikipedia — BatMUD)
- **Build legibility through guilds.** Each guild has a known role and skill set. New players are given role-tagged recommendations ("good newbie tanks: nun, tarmalen") rather than dumped into a 1000-skill open shop. (Nepos's BatMUD guide)
- **Combine roles, but admit it's hard.** Multi-role builds are possible but explicitly labeled "out of reach for new players" in player-written guides — the difficulty curve is documented up-front instead of hidden. (Nepos's BatMUD guide)

**What doesn't.**
- "Caster guilds, with one exception, don't work well for soloing" is a player-handbook line, not a marketing line — soloable balance is a known gap. For *The Remnant* (single-player), this is the central warning.
- Combat depth assumes a 9-person party; mob HP and reset cycles in big zones are tuned around that. Solo, the geometry collapses to "one row, one slot."

**Single-player filter.** Formation-as-multiplayer-geometry doesn't apply. *Formation-as-positioning-against-an-enemy-group* does — see lesson.

**Transferable lesson for *The Remnant*.**
> When the player encounters a multi-mob room (e.g. 3 raiders), expose a **stance/position axis** — `engage front | flank | hold back` — that decides which enemies can hit the player on their turn. Solo positioning gives the same "row" feel as BatMUD's formations without requiring party members.

**Sources.**
- https://en.wikipedia.org/wiki/BatMUD
- https://nepos.batmudder.com/guilds/ch02s01.html
- https://nepos.batmudder.com/guilds/ch03s02.html

---

### 5. Realms of Despair (SMAUG / Diku derivative) — What Not to Inherit

**One-liner.** Long-running 1994 SMAUG MUD whose combat is a textbook case of Diku-style class imbalance, flat fight-or-flight loops, and risk/reward inversions.

**What works.**
- The four core classes (cleric, mage, thief, warrior) are still recognizable mechanical archetypes — i.e. the *categories* are sound even when the balance isn't. (Muds Wiki — Realms of Despair)
- Avatar (max-level) endgame is a real tier with its own gear loop, not just a number plateau, which keeps long-term players engaged. (TopMudSites — Realms of Despair reviews)

**What doesn't (the anti-patterns).**
- **Class supremacy.** "The base classes are just too powerful compared to their counterparts" — non-core classes rarely get played because the core four eclipse them mechanically. (TopMudSites review thread)
- **Bimodal difficulty.** "Most of the leveling process isn't remotely difficult unless playing a class not designed for fighting … fights generally being either a pushover or a suicide mission." (TopMudSites review thread)
- **Reward inversion.** "A lot of the newer equipment is plain straight out crap for the effort involved." High-effort fights pay out below low-effort fights — combat economy upside-down.
- These three patterns recur across the wider Diku family (Realms of Despair, ROM 2.4 derivatives, many SMAUG forks). They are the things to consciously *not* port.

**Transferable lesson for *The Remnant*.**
> Audit each of the 7 classes against the 15 enemy types and tag each pairing as `pushover / fair / dangerous / lethal`. If any class has > 50% pushovers across the table, it's the Diku failure mode and needs a tuning pass. Track the same audit on loot/XP per minute by zone — if zone reward goes *down* as zone difficulty goes up, that's the reward-inversion bug Realms shipped with.

**Sources.**
- https://muds.fandom.com/wiki/Realms_of_Despair
- https://www.topmudsites.com/forums/muddisplay.php?mudid=thoric
- https://www.mudconnect.com/reviews/muds/Realms_of_Despair.html

---

### 6. ZombieMUD — Tank-as-Identity

**One-liner.** Long-running LPMud (1994–) with 15 guilds and 41 races, where tanking is treated as a *role and a craft*, not a stat block — to the point of seven community-written essays.

**What works.**
- **Role respect as a culture artifact.** "To be known as a good Tank ranks you as one of the most respected individuals on the game." Seven player-authored tanking essays exist on the official site. The game has built status around being good at one role. (zombiemud.org — leadership essays)
- **Leadership as a learnable skill.** Separate "how to assemble a party" / "how to lead a party" guides — group combat itself is treated as a skill the *player* (not the character) learns. (zombiemud.org — Amorphist's leadership guide)
- **Composability.** "Limitless combos selectable from 15 guilds and 41 races" — character identity is a recipe, not a preset.

**What doesn't.**
- ZombieMUD's structure is unapologetically multiplayer; soloing is a fringe activity. None of the tanking essays apply unmodified to a single-player game.

**Single-player filter.** The cultural lesson — "make the player feel like they are *getting better at the role*, not just the stats" — does port. The mechanical lesson (tank-healer-DPS triangle) does not, since *The Remnant* has no healer NPC.

**Transferable lesson for *The Remnant*.**
> Track and surface a "role mastery" stat per class (`Hits taken without dying`, `Crits landed on flanked enemies`, etc.) so a returning player can see they are *playing the role better*, not just leveled higher. Show this on death/level screens.

**Sources.**
- http://zombiemud.org/newbie_combat.php
- http://zombiemud.org/leadership1.php
- https://muds.fandom.com/wiki/ZombieMUD

---

### 7. Caves of Qud — The Roguelike *The Remnant* Is Closest To

**One-liner.** Turn-based post-apocalyptic roguelike with rich text combat output, a stable starting village (Joppa) for onboarding, and a deep status-effect system surfaced via an `ACTIVE EFFECTS` panel and a character-sheet drilldown.

**What works.**
- **Joppa as a fixed onboarding zone.** Joppa is the *only* starting village that is hand-built and identical between saves; every other start is procedurally generated. New players get a stable map with named NPCs and the same first quest ("What's Eating the Watervine"), which lets returning players anchor and new players follow community guides. (Caves of Qud Wiki — Joppa)
- **Move-to-attack.** "You attack by pressing the move key in the direction of an adjacent enemy." Zero combat verbs to learn for the first encounter — bumping into a snapjaw *is* the attack tutorial. (Caves of Qud Wiki — Melee combat)
- **Active Effects panel.** A dedicated UI line in the bottom-left of the screen lists current conditions (poisoned, bleeding, frozen, glotrot). The character sheet has a deeper drilldown. The combat log doesn't have to carry status state — it's surfaced spatially. (Steam community — Status effects discussion)
- **Strength × Agility split.** Strength → Penetration Value (ability to bypass armor); Agility → to-hit. Two stats, two roles, very clean. (Caves of Qud Wiki — Melee combat)

**What doesn't / what they fixed.**
- **Combat log readability is a long-running complaint.** "It's hard to determine what happened during some turns … impossible to tell which log was for the last turn or not." Players ship modded log layouts. The freeze status effect was missing from the message log entirely at one point. (Steam community — combat log threads)
- Early Qud combat was raw bump-attack with very little mid-fight feedback; the team eventually added per-action damage breakdown popups and a separate status-effect panel because the message log alone wasn't carrying the load.

**Transferable lesson for *The Remnant*.**
> Don't make the combat log do everything. Add a 1-3 line **"status strip"** above the prompt that shows only currently-active conditions on the player and the target (e.g. `YOU: bleeding(2t) staggered  |  RAIDER: blinded(1t) wounded`). The combat log scrolls; the status strip persists. This solves Qud's #1 user complaint before you ever ship it.

**Sources.**
- https://wiki.cavesofqud.com/wiki/Joppa
- https://wiki.cavesofqud.com/wiki/Melee_combat
- https://steamcommunity.com/app/333640/discussions/0/1621724915789620513/
- https://steamcommunity.com/app/333640/discussions/0/3269057884702617381/

---

### 8. Cogmind — The Map *Is* the Combat Log

**One-liner.** Sci-fi roguelike that *deliberately deemphasizes* the message log and pushes combat feedback into the map itself via animations, floating numbers, and a side panel of attack calculations.

**What works.**
- **Log → map.** "The message log has been deemphasized … the map provides you with all the important information." Animations on the tactical map carry combat events; the log is a backup, not the primary surface. (Grid Sage Games blog — Message Log)
- **Multi-window, mode-switchable side panel.** The original log spanned the whole top edge; it was cut in half and the freed space became a *configurable* secondary window — combat math, extended log, or detailed status. The player chooses what's pinned. (Grid Sage Games blog — Message Log)
- **Core hits popups.** Damage numbers only pop on the map for *significant* hits (core integrity) — the popup is a tell that something meaningful happened, not a constant noise. (Grid Sage Games blog — Message Log)
- **Untimed turns.** "You can spend as long as you like thinking about what to do … the game waits for you." Removes any pretense of reaction-test combat — the player owns the clock. (leiavoia — Cogmind combat guide)

**What doesn't.**
- Cogmind is graphical-tile-friendly; *The Remnant* is text-only and cannot lean as hard on map animations. The principle (don't dump everything in the log) ports; the implementation (animated map sprites) does not.
- Cogmind's player community has flagged combat as repetitive in long runs (Steam — "Feedback: Combat is repetitive" thread). Even excellent UI doesn't save you from sameness if the underlying tactical choices don't expand.

**Transferable lesson for *The Remnant*.**
> Build the combat output as **two streams**, not one: a high-noise log (every miss, every glance) the player can collapse, and a low-noise event line that *only* fires on significant events (`The raider's leg snaps. He drops to one knee.`). The eye anchors on the low-noise line; the log is for forensic review.

**Sources.**
- https://www.gridsagegames.com/blog/2014/02/message-log/
- https://leiavoia.net/cogmind/guides/combat.html
- https://en.wikipedia.org/wiki/Cogmind
- https://steamcommunity.com/app/722730/discussions/0/3166568651718250272/

---

### 9. NetHack — Items as the Combat System

**One-liner.** 1987-derived ASCII roguelike where the combat system is deliberately thin — most depth comes from how items, materials, BUC (blessed/uncursed/cursed) state, and monster types interact.

**What works.**
- **Material × monster.** Silver weapons hurt undead and demons more. Iron is rusted by rust monsters. Wood burns. The interaction matrix is the strategy layer — combat-as-loadout-puzzle. (Campbell & Verbrugge, *Learning Combat in NetHack*, AAAI 2017; NetHack Wiki — BUC)
- **BUC states.** Every consumable and item is blessed / uncursed / cursed; blessed scrolls and potions get a stronger effect, cursed get worse or harmful. Items become *information puzzles* — identifying a potion is itself a combat action. (NetHack Wiki — Identification)
- **Emergent solutions.** The famous "ascension kit" loops are pure emergent combat: digging through a wall to escape a vault, using a wand of polymorph on a chameleon, pet-stealing a shopkeeper's wares. Designers didn't script these; the item-interaction matrix produced them.

**What doesn't.**
- The pure attack roll is genuinely unsatisfying in isolation. Combat without items is "press direction repeatedly." Modern players coming from richer combat systems often bounce off NetHack's bare melee.
- Identification is "considered by some to be the heart of NetHack" — but it is also famously punishing. Reading a scroll of amnesia or drinking a potion of paralysis at the wrong time is a classic ascend-killer. The depth comes with brutal feedback. (NetHack Wiki — Identification)

**Transferable lesson for *The Remnant*.**
> Each weapon trait should change how the *narrative* of the strike reads, not just its damage number. A silver knife against a ghoul reads `The blade hisses where it bites — the ghoul recoils` even if the damage is the same as iron. Players remember tells, not numbers; the trait surfaces *as text*, every swing.

**Sources.**
- https://nethackwiki.com/wiki/BUC
- https://nethackwiki.com/wiki/Identification
- https://cdn.aaai.org/ojs/12923/12923-52-16440-1-2-20201228.pdf

---

### 10. Sil-Q — Stealth as a First-Class Combat Verb

**One-liner.** Tolkien-themed Angband variant where stealth, perception, and morale are tracked and rolled every turn, and a sleeping/unwary monster is a fundamentally different combat encounter than an alert one.

**What works.**
- **Per-monster Alertness score.** Alertness ≥ 0 = aware; -1 to -10 = unwary; ≤ -11 = asleep. Three regimes, not a binary. The same enemy is three different fights depending on how you approach. (Sil-Q Manual; RogueBasin — Sil)
- **Stealth roll vs Perception roll, every round.** `(player Stealth + 1d10) vs (monster Perception + 1d10)` is rolled continuously while moving. Movement is its own resolved action, not free. (Sil-Q Manual)
- **Depth-modulated stealth.** Stealth modifier scales by dungeon depth: +2 shallow, neutral mid-depth, -1 at the bottom — the world physically gets more aware of you. (Sil-Q Manual)
- **Assassination skill.** Hits on unwary/asleep enemies get a melee bonus equal to *the player's stealth score*. Stealth and combat are the same skill expressed two ways. (Sil-Q Manual)

**What doesn't.**
- **Discoverability.** Sil's stealth subsystem is only narratively surfaced through manual reading and the morale flavor lines on monster wakeup — players miss it entirely on first run. (Roguelike Radio — Episode 59: Sil)
- The math is exposed (`Stealth + 1d10`), which some players love and others find clinical. Sil leans hard toward "show the dice."

**Transferable lesson for *The Remnant*.**
> Give each enemy three states — `unaware`, `alert`, `engaged` — and a `move quietly` / `creep` verb that resolves a stealth check per room transition. First strikes against unaware enemies bypass armor or auto-crit. This single mechanic doubles the verb count of combat without doubling the system's complexity.

**Sources.**
- https://www.roguebasin.com/index.php/Sil
- http://www.amirrorclear.net/flowers/game/sil/v101/Sil-Manual.pdf
- http://www.roguelikeradio.com/2013/01/episode-59-sil.html

---

### 11. Dungeon Crawl Stone Soup — Color, Force-More, and Autoexplore Safety

**One-liner.** Long-running open-source roguelike obsessed with combat *legibility*: monsters are color-coded by danger, automation halts when the world becomes interesting, and the player can configure pause-prompts on any message pattern.

**What works.**
- **Threat color borders.** Monsters are wrapped in a red border when they are dangerous *for the current XL*; purple flags unique threats. The danger assessment is computed by the game and shown spatially — no math needed. (Crawl manual; CrawlWiki — Tutorial)
- **Color-by-strength within type.** Weak orc = different color than strong orc; same letter, different hue. Players learn the threat alphabet by playing. (Crawl manual)
- **Spell danger gradient.** Miscast probability is colored yellow → light red → red → magenta as the consequences scale. The player sees the color before they ever see the consequence. (CrawlWiki — Spells)
- **Autoexplore with built-in guard.** `o` autoexplores until *something interesting* appears (monster, item, feature) and stops. The fix here is the "manual movement causes wasted opportunities" failure mode: autoexplore *interrupts safely* in a way manual fingering doesn't. (CrawlWiki — Autoexplore)
- **`force_more_message` config.** Players can register regex patterns that inject a `--more--` prompt — "I want to be paused whenever a hydra appears" — without a script. (Crawl options guide)

**What doesn't.**
- The color system is dense; new players don't know a yellow `o` from a green `o` without manual reference. Crawl's onboarding leans on a tutorial mode, but the cognitive load of "memorize the threat alphabet" is real.
- Auto-pickup and autoexplore can themselves over-trigger and stop on harmless plants, prompting community fixes (mantis bug 691). Even the safety net needs tuning.

**Transferable lesson for *The Remnant*.**
> Wrap enemy names in **threat-tier color tags** computed against the player's current build (`<dangerous>raider chief</dangerous>` renders red). Add a `:pause-on <pattern>` config that auto-injects a `[press enter]` prompt the next time `<pattern>` appears in output. This is one regex away from being a 50-line feature, and it converts player-tuned safety into a real system.

**Sources.**
- https://crawl.akrasiac.org/docs/crawl_manual.txt
- http://crawl.chaosforge.org/Autoexplore
- https://crawl.akrasiac.org/docs/options_guide.txt
- http://crawl.chaosforge.org/Tutorial

---

### 12. Disco Elysium — Combat as Conversation

**One-liner.** Narrative RPG with literally no combat system in the trad sense: every "combat" encounter resolves through dialogue, skill checks (Red = one-shot, White = retryable), and a Thought Cabinet that grants long-running dialogue/skill modifiers.

**What works.**
- **Red checks vs White checks.** Red checks are one-shot; success or failure cements the story. White checks can be retried after gaining a skill point or meeting a condition. The player knows up-front which kind of decision they are making. (Disco Elysium Wiki — Skills)
- **Critical successes/fails fixed at 2.** Double-1 always fails, double-6 always succeeds — there's always hope and always doom. (Disco Elysium Wiki — Skills)
- **Passive checks shape what dialogue options appear.** A high Empathy passive *reveals* an option a low-Empathy character never sees. Build *creates* what looks possible. (Disco Elysium Wiki — Skills)
- **Thought Cabinet.** 53 thoughts; only 12 internalized at once; researching a thought gives a *temporary* skill penalty/bonus; finalized thoughts give long-term effects. The build evolves through play, not just at level-up. (Disco Elysium Wiki — Thought Cabinet)

**What doesn't.**
- A traditional MUD audience expects swing-and-damage. Disco Elysium's wholesale removal of trad combat is famously polarizing — many players who don't bond with the talky resolution mode bounce off entirely. (Multiple Steam reviews; Vice review)
- Single-shot Red checks can permanently lock content. Some players find that punishing rather than meaningful.

**Single-player filter.** The whole pattern is single-player; this is the strongest *direct* analogue to *The Remnant*'s context.

**Transferable lesson for *The Remnant*.**
> Mark *some* combat encounters (especially boss / faction-leader fights) as having **non-violence resolution paths** behind skill checks: a charisma roll to talk down a raider, an intelligence roll to spot the bomb on his belt, a lore roll to invoke pre-collapse military code. Combat is one of three exits, not the only one. Tag the check as Red (one-shot) or White (retry on level-up).

**Sources.**
- https://discoelysium.fandom.com/wiki/Skills
- https://discoelysium.fandom.com/wiki/Thought_Cabinet
- https://www.gabrielchauri.com/disco-elysium-rpg-system-analysis/

---

### 13. Roadwarden — Narrative Combat With Ecosystem Awareness

**One-liner.** Indie illustrated text RPG (Moral Anxiety Studio, 2022) where combat is one of several decision modes, and *every* hostile encounter has a non-fight or fight-light path tied to the world's ecosystem.

**What works.**
- **Ecosystem tactics.** "Every pack of animals, giant predator, and sneaky hunter requires a different tactic, and that tactic isn't always about fighting head-on." The world has rules and the rules are how combat is solved. (Game Developer — Deep Dive: Roadwarden; Adventure Game Hotspot review)
- **Class × equipment × prior choices funnel into outcomes.** Combat resolves by text and choice; the *option set* on the choice screen is shaped by what the player already did and is. The same encounter has different verbs for a Warrior than for a Scholar. (RPG Fan review)
- **Time-pressure layered on top.** The 40-day time limit means *every* fight has a real cost (HP, time, item attrition) — combat is never free. (Roadwarden official site; Nintendo Life review)

**What doesn't.**
- Some "occasional immersion-breaking stumbles" — terms used inconsistently with the journal, breaking the world rules combat depends on. (Adventure Game Hotspot review)
- Combat can feel *under-mechanical* for trad-RPG players — the resolution is text and dice, not visible HP bars and turn queues.

**Transferable lesson for *The Remnant*.**
> Encode each enemy's "reaction template" — what they fear, what they want, what calms them. A cornered ghoul behaves differently than an alpha ghoul leading a pack. Combat verbs change based on the template (`offer meat | brandish flame | shout faction shibboleth`). Cheap to author per enemy type; massive perceived depth.

**Sources.**
- https://www.gamedeveloper.com/design/deep-dive-roadwarden
- https://adventuregamehotspot.com/review/516/roadwarden
- https://www.rpgfan.com/review/roadwarden/

---

### 14. Suzerain — Turns as Pressure, Choices as Currency

**One-liner.** Text-driven political RPG (Torpor Games, 2020) structured as 14 turns — prologue + 12 normal + epilogue — where every turn forces decisions inside a fixed budget. Not "combat" in the trad sense, but turn-based confrontation under pressure.

**What works.**
- **Turn = a closed budget.** Each turn covers ~4 in-fiction months, has fixed events, and a fixed budget (`-4` to `+4`). You can't do everything; choosing where to spend is the game. (Wikipedia — Suzerain; Suzerain Wiki — Turn)
- **Multiple-choice prompts after read-text.** The structure is read → choose → consequence. There is no real-time element; the player owns the clock. (Suzerain official site)
- **Optional war chapter.** The Rizia DLC adds an interactive war that uses the same turn structure for tactical decisions — proving the turn-pressure model scales from cabinet meetings to battlefield commands without changing the UI.

**What doesn't.**
- Approval rating + multi-axis stats can drift below visibility — players late-game discover they passed a "point of no return" they didn't know existed. (Game Critix review; Vice review)
- Pure-text gameplay has the same onboarding problem all text RPGs share: 5 minutes of read before the first decision. Some players bounce.

**Transferable lesson for *The Remnant*.**
> For every fight, give the player a **3-decision-per-turn budget** (e.g. `attack | defend | use item` and any one of them costs 1 of 3 action points) — not a "free actions until you run out of cooldowns" loop. Constraint-as-game produces tactics; freedom-as-game produces button-spam.

**Sources.**
- https://en.wikipedia.org/wiki/Suzerain_(video_game)
- https://www.suzeraingame.com/
- https://suzerain.fandom.com/wiki/Turn

---

## Part 2 — Cross-Cutting Takeaways

### Top 10 design choices that recur (worth adopting in *The Remnant*)

1. **Two-prompt pattern** — separate combat prompt with target HP/condition baked in; swap automatically on engage/disengage. (Aardwolf, Achaea)
2. **Persistent status strip above the log** — show current player + target conditions on a sticky line; the log scrolls, the strip persists. (Caves of Qud, Cogmind, Achaea)
3. **Asymmetric resource cooldowns** — symptom-cures clear faster than HP heals; this pushes triage as the central skill. (Achaea)
4. **One-axis, mid-fight tactical knob** — `stance` / `attitude` with 3-5 steps, settable per round, surfaced in the prompt. (Discworld, BatMUD)
5. **Threat coloring on enemy names** — color tier computed against player build, not absolute. (Crawl)
6. **Per-message pause hooks** — let players register `:pause-on <regex>` so safety is configurable, not hard-coded. (Crawl `force_more_message`)
7. **Multi-state monster awareness** — at minimum `unaware / alert / engaged`, with a stealth verb that depends on it. (Sil-Q)
8. **Material/trait tells in the strike text** — same damage number, different narrative line based on weapon trait vs enemy type. (NetHack)
9. **Non-violence resolution path on bosses** — at least one charisma/intelligence/lore exit gated by a Red or White check. (Disco Elysium, Roadwarden)
10. **Closed action budget per turn** — small fixed action-point pool, not "unlimited until cooldown." (Suzerain; corroborated by the explicit balance/equilibrium gating in Achaea)

### Top 5 anti-patterns (with the games that suffered)

1. **Combat-log-as-everything.** The log is a stream; status state needs a separate non-scrolling surface. *Suffered by:* Caves of Qud (multiple Steam threads requesting log fixes), early Aardwolf (which then bolted on `NOSPAM`/`NOSTATUS`).
2. **Class supremacy / build inversion.** A subset of classes is just better; everything else is RP-only. *Suffered by:* Realms of Despair, most Diku derivatives.
3. **Bimodal difficulty (pushover or suicide).** No middle band of "fair fights." *Suffered by:* Realms of Despair, BatMUD soloing for caster guilds, Caves of Qud at depth jumps.
4. **Reward inversion.** High-effort fights pay out below low-effort fights, so optimal play is grind safe content. *Suffered by:* Realms of Despair (player-cited equipment problem).
5. **Mandatory client scripting.** The game's combat is too fast or too verbose to be played without external automation, so onboarding requires installing a script. *Suffered by:* Achaea (the entire `Svof`/`TReX`/`Overwatch` ecosystem exists because of this).

### 5 "wow" moments — and the design pattern behind them

1. **"I locked them."** A player in Achaea stacks afflictions until the opponent can't physically clear the affliction blocking the cure for the affliction blocking the cure. *Pattern:* status interaction graph where some statuses gate the removal of others. (Achaea — Locks)
2. **"I cut his sword arm and he dropped his weapon."** A Discworld player focuses attacks on the right arm; the enemy's weapon hits the floor mid-fight. *Pattern:* body-part-targeted attacks that have *mechanical* not just descriptive consequences. (Discworld — focus)
3. **"The ghoul flinched at the silver."** A NetHack-style material-vs-monster moment that produces unique flavor text on the strike. *Pattern:* trait × enemy-tag matrix in the strike message resolver. (NetHack — materials)
4. **"They never knew I was there."** A Sil-Q player creeps past two sleeping Easterlings, assassinates a third for triple damage, slips out unseen. *Pattern:* per-monster Alertness state + stealth-as-melee-bonus. (Sil-Q — Assassination)
5. **"I talked him down."** A Disco Elysium / Roadwarden moment where the boss fight is resolved by a single passed Empathy or charisma roll because the player invested in the right thought. *Pattern:* skill-check exits on combat encounters, gated by build choices. (Disco Elysium — Red/White checks; Roadwarden — ecosystem tactics)

---

## Part 3 — Single-Player Filter Summary

What ports cleanly to a single-player MUD, what doesn't, what needs adaptation:

| Pattern | Solo? | Notes |
|---|---|---|
| Two-prompt (combat / non-combat) | Yes | Direct port. |
| Status strip above log | Yes | Direct port. Solves Qud's #1 complaint. |
| Affliction stacking with asymmetric clocks | Yes (adapted) | In a turn-based solo game, "clocks" become "turns to clear vs turns to heal." Same shape, different units. |
| Stance / tactics knob | Yes | Direct port. |
| Threat color borders | Yes | Direct port; needs a build-aware threat function. |
| `force_more_message` pause hooks | Yes | Direct port. |
| Multi-state enemy awareness + stealth | Yes | Direct port. |
| Material × monster strike text | Yes | Direct port. |
| Non-violence resolution paths | Yes | Direct port; this is the Disco/Roadwarden strength. |
| Closed action-point budget | Yes | Direct port. |
| Formation rows (BatMUD) | **No / adapt** | Reframe as multi-mob positioning rather than party composition. |
| Tank-healer-DPS culture (Zombie) | **No / adapt** | Use as "role mastery" stats per class instead of party roles. |
| 1-second affliction clocks (Achaea) | **No** | Requires real-time; replace with turn-counted equivalent. |
| Mandatory scripting (Achaea anti-pattern) | **N/A** | Don't ship the disease. |

---

## Part 4 — Onboarding-Specific Notes

User said: "doesn't take extremely long to get into." Concrete benchmarks observed:

- **Caves of Qud:** First combat verb (`bump-to-attack`) is taught implicitly by movement. Joppa's static layout means a player can be in their first fight within ~60-90 seconds of starting a new character. There is no separate "combat tutorial." [low confidence on exact time — sourced from beginner guides, not a stopwatched run]
- **Cogmind:** First few floors are deliberately low-pressure with simple bots; the combat log → map transition is taught by *seeing animations on the map* before the player reads the manual. (Grid Sage Games blog)
- **Crawl Stone Soup:** Has an opt-in tutorial mode (`tutorial`) with stepped lessons; threat-color borders are the "you didn't read the manual" safety net. (CrawlWiki — Tutorial)
- **Discworld MUD:** Has explicit Helpers and Advisors as a player class — onboarding-as-staffing. (Adventurers' Guide)
- **Aardwolf:** Helpers and Advisors via the Newbie channel, plus an Academy. (AardWiki — General)
- **Achaea:** Acknowledged hard onboarding; community curing systems are the de facto tutorial. *Anti-example.*
- **NetHack / Sil:** No tutorial. High bounce. *Anti-examples for "fast to get into."*

**Implication for *The Remnant*:** the Caves of Qud / Cogmind axis is the right model. Stable starting room + bump-to-attack first combat + status strip + threat-color names + a one-paragraph in-game pinned tutorial that fires on the first encounter only. No separate tutorial mode required.

---

## Part 5 — The Three Case Studies Blue Should Lean On

If Blue plans combat from these notes, prioritize:

1. **Caves of Qud** — closest genre match (single-player turn-based post-apoc roguelike). Steal: Joppa-style static onboarding zone, bump-to-attack default, ACTIVE EFFECTS panel, Strength-PV / Agility-to-hit split, *and* learn from its log-readability failure mode.
2. **Achaea** — even though PBP, the affliction-stacking and curing-clock patterns are the single biggest "depth multiplier per line of code" in the survey. Adapted to turn-based, this gives *The Remnant* a tactical vocabulary that scales beyond `attack/flee` without adding a new system per enemy type.
3. **Crawl Stone Soup** — UI/legibility and player-configurable safety. Threat-color borders, autoexplore-with-guard, and `force_more_message` are mature, tested patterns that solve real combat-feel problems cheaply.

---

## Part 6 — The One Lesson That Surprised Me Most

**That Achaea's actual win condition is not damage — it's overflowing the opponent's *cure queue*.** I went into this expecting Achaea to be famous for its affliction count or its prompt design. What it is actually famous for is the *meta* it created: the moment-to-moment of high-level Achaea is two players cure-juggling against each other under tight per-cure cooldowns until one falls behind. HP is the loss-condition trigger, but cure-throughput is the actual game.

This is portable to single-player turn-based: if monsters apply afflictions, and afflictions tick down, and cures cost actions, then *every monster encounter has an implicit second economy* (action-economy: your actions vs your symptom backlog) on top of the damage exchange. That second economy is what makes the same `attack` command feel different in fight 1 vs fight 50, without needing 50 unique combat verbs.

I expected the headline lesson from the survey to be a UI thing (it nearly was — Cogmind's log-to-map shift is a strong contender). The Achaea cure-clock insight is the one that changes the *system* the most for the smallest implementation cost.

---

## Part 7 — Implementation Cost / Impact Heatmap

Rough estimate of what each top recurring pattern costs to implement in *The Remnant*'s existing engine vs the combat-feel impact. Use this if Blue needs to slice the work into Howler-sized tasks.

| Pattern | Engineering cost | Combat-feel impact | Notes |
|---|---|---|---|
| Two-prompt swap (combat / non-combat) | Low | Medium | One prompt-renderer branch on `in_combat` flag. |
| Status strip above prompt | Low | High | Render persistent line; reuse existing status-effect data. |
| Threat-color enemy names | Low | High | Function: `threat_tier(player, enemy) -> color`. Wrap names in renderer. |
| Stance / tactics knob (4 steps) | Low-Medium | High | Adds 4 derived-stat profiles + one verb. |
| Multi-state awareness + stealth verb | Medium | High | Per-mob `awareness` field, stealth check on transition, first-strike bonus path. |
| Trait × enemy strike text | Medium | Medium | Per-trait × per-enemy-tag message table. Authoring cost > code cost. |
| Affliction stacking + asymmetric cure clocks | Medium | Very High | New status registry with per-status `cure_turns` and `apply_turns`. Biggest depth-per-LOC win. |
| `:pause-on <pattern>` config | Low | Medium | Regex match in output pipeline. |
| Non-violence resolution paths on bosses | Medium | High | Per-boss authoring; gate dialog branches on stat checks. |
| Closed action-point budget per turn | Medium | High | Refactor turn loop to `points = N; spend_per_action`. Touches every combat verb. |
| Formation / multi-mob positioning | Medium-High | Medium | Adds positional axis to encounter state; UI surfacing cost is real. |

**Recommended slice for first combat-overhaul Howler convoy:**
- Howler A: two-prompt swap + status strip + threat-color names *(all UI plumbing, one owner)*
- Howler B: stance knob + closed action-point budget *(turn-loop refactor, one owner)*
- Howler C: affliction stacking + asymmetric cure clocks *(new status registry, one owner)*
- Howler D: multi-state awareness + stealth verb *(per-mob state + new verb, one owner)*

Each is independently mergeable behind a feature flag; the affliction work (C) is the biggest combat-feel multiplier per LOC and should be prioritized if budget is tight.

---

## Part 8 — Notes on Sources and Confidence

- Most case studies have at least one primary source (game wiki, dev blog, or game manual) and one secondary (review or community thread). Where only secondary sources existed (e.g. Aardwolf "smartmob" / "quickslay" — neither term resolved in search), the case study leans on adjacent primary sources (AardWiki main pages) and avoids citing the unresolved terms.
- WebFetch was denied for this session; everything in this document is sourced from search-result snippets, not full-page reads. Where snippets were thin (BatMUD formations, ZombieMUD role mechanics, Cogmind `force_more` configuration), the bullets lean on the strongest snippet and the lesson is generalized rather than over-specified.
- `[low confidence]` is used inline only on the Caves of Qud onboarding-time figure, which is sourced from beginner guides rather than a measured run.
- All URLs in the Sources sections were returned by WebSearch in this session and were live as of 2026-04-24. They have not been re-checked individually post-write.

### What was searched but excluded from case studies

- **Lost Souls / Genesis LPMud** — surfaced in adjacent searches but no battle-system-distinctive primary source emerged within session budget. Likely worth a follow-up if Blue wants more LPMud diversity beyond Discworld and BatMUD.
- **Armageddon MUD** — appeared in MUD-design forum results (armageddonmud.boards.net combat thread); RP-heavy, possibly relevant for narrative combat but no dedicated case study built here.
- **Tales of Maj'Eyal (ToME4)** — referenced in the Crawl autoexplore search (te4.org forum thread). Modern roguelike with mature combat UX; would be a strong 13th case study if budget allowed. Recommend a future follow-up search focused on its talent-tree-driven combat verbs.
- **Armageddon, Threshold, Materia Magica, Lusternia, Imperian** — known battle-MUDs or IRE siblings excluded due to overlap with Achaea (IRE shares an engine across Achaea/Aetolia/Imperian/Lusternia, so the affliction-stacking lesson covers all of them).

### Cross-reference for the parallel research stream

The user mentioned a separate research stream covering general MUD combat best practices (turn structure, verbs, status effects). This document deliberately avoids restating those generic patterns and stays in the *case study* lane — concrete games, concrete patches, concrete community complaints. Where a generic pattern is mentioned (e.g. "turn-based"), it is in service of contextualizing a specific case study, not as a recommendation in its own right. The two streams should read as complementary: this one is "here's what shipped and what happened," the other is "here's the design space."

---

## Part 9 — Quick-Reference Cheat Sheet

For Blue's planning doc, the one-line takeaways:

- **Aardwolf** → ship `bprompt`; let players opt into `NOSPAM`/`NOSTATUS`.
- **Achaea** → asymmetric cure vs heal cooldowns; afflictions are the combat depth, not damage.
- **Discworld** → one `stance` knob, four steps, mid-fight settable.
- **BatMUD** → solo positioning axis for multi-mob rooms (no parties needed).
- **Realms of Despair** → audit class × enemy and zone effort × reward; fail-fast on Diku inversions.
- **ZombieMUD** → role-mastery stats per class shown on death/level screens.
- **Caves of Qud** → static onboarding zone + bump-attack + ACTIVE EFFECTS strip.
- **Cogmind** → two output streams (high-noise log, low-noise event line).
- **NetHack** → trait × enemy = unique strike text, even at same damage.
- **Sil-Q** → enemy `unaware/alert/engaged` + stealth verb + first-strike bonus.
- **Crawl** → threat-color enemy names + configurable pause regex.
- **Disco Elysium** → Red/White skill checks for non-violence boss exits.
- **Roadwarden** → per-enemy reaction templates (fear/want/calm) for non-fight verbs.
- **Suzerain** → fixed action-point budget per turn; constraint-as-game.

Hand this list to Blue alongside Parts 1-7 and you have everything needed to draft a `PLAN.md` for combat overhaul.
