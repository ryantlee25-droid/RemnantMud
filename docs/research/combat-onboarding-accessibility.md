# Combat Onboarding & Accessibility — Player-Experience Research

**Scope:** Onboarding new players into turn-based text combat, plus accessibility for a text-only combat UI, for *The Remnant* (single-player post-apocalyptic text MUD).

**Anchor requirement (from user):** "ensure we have a robust system that works well and *doesn't take extremely long to get into*."

**Sister streams:** (a) general MUD combat best practices, (b) named MUD combat case studies. This report covers (c) the player-experience layer.

**Confidence convention:** unmarked claims are well-sourced; `[low confidence]` flags single-source or thinly-sourced claims; `[inferred]` flags reasoned extrapolation from adjacent evidence.

---

## TL;DR — Top 5 Actionable Findings (prioritized for "fast to get into")

1. **Tutorial map with first three runs scaffolded.** Cogmind routes the first three lifetime runs through a special tutorial map specifically built around the order in which mechanics appear. The Remnant should do the same — first death, second death, third death all surface in a hand-tuned arena with predictable enemy spawns and triggered hint messages. After run 3, scaffolding falls away. (Cogmind sources `gridsagegames.com/blog/2016/07/tutorials-help/`.)

2. **Default difficulty must not be the hardest mode.** Cogmind shipped originally with "hardest" as default and only after rebranding to *Explorer / Adventurer / Rogue* (and prompting for the choice **before the title screen**) did new-player retention improve. Pick a name for "your first run won't be punishing" that reads as a real choice, not a cop-out.

3. **First fight in under 30 seconds, first kill in under 90.** The dominant FTUE finding across mobile/PC retention research is that D1 churn happens in the first session and the "power-fantasy" must be visible inside the first 30 seconds. For a text MUD that means: scripted enemy in the opening room, prompt visible, one-word `attack` works, narration confirms hit on the first turn.

4. **`role="log"` + `aria-live="polite"` on the combat scroll, with a "more verbose" toggle.** This is the WCAG/W3C-blessed pattern for sequential message logs and is the lowest-cost accessibility win available to a turn-based text game (see ARIA23 technique). Pair with redundant cues (`[!]`, `[+]`, `<enemy>`-style tags) so color is never the only carrier of meaning.

5. **Two combat verbs at start, expand to ~6 by fight 5.** Don't dump the verb list. Start with `attack` and `flee`. Surface `look`, `examine`, `target`, and a defensive verb only when triggered by an enemy state (e.g. an enemy winding up an attack reveals `defend`). Modern IF engines like IntFicPy ship ~80 verbs but interactive fiction's "guess-the-verb" syndrome shows that an opaque verb set is the #1 churn driver in text combat.

**Unresolved questions for Blue** are listed at the end.

---

## Section 1 — Onboarding Into Combat in Text/Turn-Based Games

### 1.1 First-fight scaffolding patterns

The dominant successful pattern across single-player text/turn-based games is the **dedicated tutorial arena** with predetermined enemy placement and triggered message hints — *not* a tooltip system over the live world.

#### Cogmind (Grid Sage Games)

Quoting the design blog: *"For new players the first three runs (most importantly the first) all start in a special tutorial map which is set up specifically to teach all the essential mechanics, consisting of four rooms in a particular order with objects and things that trigger tutorial messages in the expected order."* That map is non-procedural. Three runs of scaffolding then a clean handoff to the procedural game. (`https://www.gridsagegames.com/blog/2016/07/tutorials-help/`)

Cogmind also runs **two help screens** — one for beginners, one for experts — addressed via `?`. Help is opt-in for the curious but tutorial messages are pushed for the first-time encounter with each mechanic.

#### Caves of Qud (Freehold Games)

Caves of Qud ships with a tutorial mode that's selectable on character creation alongside Classic, Wander, and other modes. Multiple Steam guides and the official wiki agree it covers movement, basic combat, looting, and a single quest before turning the player loose. (`https://wiki.cavesofqud.com/wiki/Combat`, `https://steamcommunity.com/sharedfiles/filedetails/?id=1711493305`)

The early-game design also relies on **enemy difficulty signaling through naming** — Snapjaw scavengers and crocs are early-game predictable kills; Baboons, Irritable Tortoises, and Turrets are flagged in community guides as new-player traps. That predictability is what makes the procedural world tutorial-able even after the scripted intro ends.

#### Stoneshard

Stoneshard's prologue tutorial is "thorough and well-thought-out" per multiple reviewers, but it's also **the canonical example of a tutorial-to-game difficulty cliff**. After the prologue, the game ramps so steeply that "for most gamers, the difficulty spike from the prologue to the main adventure will be too much to handle and ultimately will prevent new players from getting in." (`https://godisageek.com/2020/02/stoneshard-is-one-of-the-hardest-games-ever-prologue-preview/`, `https://techraptor.net/gaming/previews/stoneshard-preview`)

**Lesson for The Remnant:** smooth the slope. The first 5 fights post-tutorial should feel like the tutorial — same enemy types, same damage scale, no surprise mechanics.

#### NEO Scavenger

NEO Scavenger inverts the pattern: combat is **explicitly framed as a thing you should usually avoid**. Most fights end with two losers. The tutorial doesn't teach combat verbs so much as it teaches the *fleeing* verb and the *inspect-before-engage* loop. (`https://steamcommunity.com/app/248860/discussions/1/490124466463420405/`)

For The Remnant, which sits closer to NEO Scavenger philosophically (post-apocalyptic, scarcity-driven), this is a usable pattern: **the first thing the game teaches is `flee`, not `attack`.** It changes the player's mental model of what combat is *for*.

#### Citizen Sleeper / Roadwarden — counterexamples

Citizen Sleeper has no combat as a player verb (action dice + clocks), so it's mostly relevant as a "barebones tutorial" cautionary tale per RPGFan: the ruleset feels abstruse at the start because nothing is highlighted as the load-bearing mechanic. Roadwarden de-emphasizes combat in favor of exploration and dialogue, with a sectioned UI: illustration pane, text pane, clickable choices. It avoids the parser problem entirely by shipping verbs as buttons. (`https://www.rpgfan.com/review/citizen-sleeper/`, `https://en.wikipedia.org/wiki/Roadwarden`)

The Remnant has chosen text-first input, so Roadwarden's pattern doesn't apply directly, but the **clickable-action-as-verb-discovery** pattern is worth borrowing as an *alternate mode* (see §2.3).

### 1.2 The 30-second rule

The strongest cross-domain finding from FTUE/retention research is that the first 30 seconds determine a large fraction of D1 churn, and the first session determines D7 retention.

- Industry guidance: *"Show them the power-fantasy they bought the game for within the first 30 seconds"* (`https://www.designthegame.com/learning/tutorial/what-first-time-user-experience-ftue`).
- D1 retention benchmark for a healthy game is 45%+; sub-30s churn is the single largest D1 contributor in mobile data (`https://www.devtodev.com/education/articles/en/348/main-metrics-ftue`). [low confidence — these benchmarks are mobile-F2P; PC indie text games likely have different baselines, but the directional signal is robust.]

**What to show in the first 30 seconds of first combat for a single-player text MUD:**

| Element | Why |
|---|---|
| An enemy named in the prompt (e.g. `> A bone-husk stalker watches from the alley.`) | Concrete target, not an abstract "you can fight things" |
| The combat prompt itself (HP, target, action hint) | Player must see *I am in combat* without having to infer it |
| A working one-word verb (`attack`) | Friction-free first action |
| Narrated outcome that confirms the hit and shows damage trajectory | Confirms agency; reinforces that text *is* the feedback channel |
| One discoverable second verb (e.g. `flee` or `look`) | Avoids "what else can I do?" panic |

Designer commentary across mobile-F2P, console, and indie roguelike sources converges on: minimize text walls, reward early, get to the core loop fast (`https://www.gameanalytics.com/blog/tips-for-a-great-first-time-user-experience-ftue-in-f2p-games`, `https://inworld.ai/blog/game-ux-best-practices-for-video-game-tutorial-design`).

### 1.3 Hint pacing — just-in-time vs upfront dump

The unanimous expert guidance is **just-in-time, contextual, after-action**.

- *"A contextual (or just-in-time) onboarding approach provides helpful information at the point of user action, where the guidance is specific to the user's point in the journey."* (`https://inworld.ai/blog/game-ux-best-practices-for-video-game-onboarding`)
- Northgard surfaces a "build a Training Camp" tip the moment the player discovers an enemy-protected area, rather than upfront — the canonical worked example in onboarding design literature.
- Cogmind triggers each tutorial message *the first time the relevant mechanic is encountered*, never before.
- Clash Royale splits onboarding into 5 short tutorials, each introducing one new mechanic that builds on prior ones.

**Read-rate data:** I could not find a published number for the % of players who actually read tutorial prompts in turn-based or text games. [low confidence]: anecdotal industry rule-of-thumb is "assume 30-50% of players skip text overlays," which is why successful designs make the *first action* the tutorial (do the thing, then get the message).

**Format guidance for The Remnant:**

- **Inline system message** in the combat log itself (same channel the player is already reading). Prefix with a distinct tag like `[hint]` or `(?)`. Cogmind's multi-channel feedback model suggests pairing this with an audio cue if audio is later added.
- **Avoid sidebar tooltips** for now — the player's eye is already on the prompt area; a separate sidebar adds saccade load.
- **NPC dialogue as carrier** for *narrative* hints (e.g. a survivor mentioning that "they don't see well in the dark") — works for world-building and combat hints simultaneously. This is the Roadwarden/Disco Elysium pattern of dialogue-as-tutorial.

### 1.4 Death and retry friction

The Remnant is a death/rebirth-cycle game (`docs/DEATH_REGENERATION.md` exists in this repo, suggesting this is a load-bearing mechanic). The literature is clear that **first death must be narratively meaningful but mechanically fast to recover from**.

#### Time-to-respawn budgets in real games

| Game | Approach | Time cost |
|---|---|---|
| Dark Age of Camelot | Respawn far from death; corpse run | 10–20 minutes back to fight (`https://forums.mmorpg.com/discussion/146682/respawn-penalty-concerns`) — widely cited as too punishing |
| Generic single-player suggestion (Dig or Die forum norm) | 15-second respawn delay, 20% HP penalty | ~15 seconds total |
| Stoneshard | Save only at taverns; up to 30 minutes lost on death | The game is widely flagged as too punishing for new players |
| Permadeath roguelikes (Caves of Qud Classic) | Full restart | Compensated by character variety, story permanence, run length 1-4 hours |

For The Remnant's first 5 deaths (the onboarding window): **respawn loop should be <30 seconds of real time** before the player is back at a combat-capable state. Death narration matters; punitive walking-back-to-the-fight does not.

#### Making first death meaningful

- Show what was lost in narrative terms (memory, item, faction trust) — not "you lost 100 XP."
- Respawn into a *changed* world, even if subtly — the world acknowledges your death. This is what Caves of Qud's procedural history accomplishes structurally.
- After the first death, surface a *retry-and-learn* prompt: "Try a different approach? `[1] Re-engage` `[2] Avoid that fight`." Lets the player opt into immediate retry without manually re-tracing steps.

### 1.5 Verb discoverability without screen-spam

This is the load-bearing UX problem for text combat. The interactive fiction community has been grinding on this since the 80s and the consensus pattern is:

#### The "guess-the-verb" pathology

*"After initial learning of basic commands, new players often get stuck because they don't know how to express themselves in a way the game understands. This common obstacle is known as 'guess the verb' syndrome because games were strict in recognizing synonyms."* (`https://en.wikipedia.org/wiki/Interactive_fiction`)

#### Modern mitigations from IF research

| Mitigation | Examples / Source |
|---|---|
| Comprehensive synonym tables (e.g. `get/take`, `examine/inspect/look at`) | IntFicPy ships ~80 standard verbs with extensive synonyms (`https://github.com/RALWORKS/intficpy`) |
| `>VERBS` command that lists usable verbs in current context | Inform 7 community discussion (`https://intfiction.org/t/automated-verbs-command-plus-explanation-of-allowed-usages-of-verbs/79023`) |
| "77 Verbs" tutorial game model | A widely-cited IF tutorial game that systematically introduces each common verb (`https://ifdb.org/viewgame?id=p3rd5133qm5cwfd`) |
| Andrew Plotkin's postcard verb list | Industry reference printed on a postcard for IF newcomers |
| Forgiving parser (Bartle, "Command Parsers: a Modest Proposal") | `https://mud.co.uk/richard/commpars.htm` — abbreviation acceptance (`G` for `GET`), partial-match fallbacks |

#### What works for combat specifically

1. **Combat-context verb hints in the prompt itself.** Successful MUD prompts double as a verb cheat sheet during combat: `> [HP 80/100] [target: stalker] (attack/flee/look) >` is more onboarding-friendly than a blank `>`.
2. **`?` or `help` is always one keypress.** Cogmind, MUD norm. Don't gate help behind a menu.
3. **Verb introduction matched to enemy state.** When a wind-up animation/text appears, surface `defend` as a hint that turn only.
4. **Parser feedback when a verb fails.** "I don't know `dodge` — try `defend`." This is more helpful than `Huh?` and dramatically reduces churn at the parser-friction layer (Bartle).

### 1.6 The 5-encounter milestone

After 5 fights, a new player should reasonably understand:

- Their own HP and resource pool — what depletes, what regenerates between fights, what regenerates only at rest.
- The damage trajectory of `attack` versus enemy attack — i.e. roughly how many turns to down a basic enemy.
- That `flee` exists and works.
- That different enemies want different responses (range vs melee, fragile vs armored).
- That the world persists across deaths in some way (their next run isn't identical to the first).

**Reasonably deferred to fights 10-20:**

- Conditions/status effects (bleeding, blinded, fear).
- Equipment loadout and weapon switching mid-combat.
- Environmental interactions (terrain, cover, light).
- Multi-target or AOE mechanics.
- Faction/reputation effects on combat encounters.
- Crafting-derived combat consumables.

This pacing is consistent with Clash Royale's 5-tutorial model and Cogmind's 3-run scaffolded intro followed by gradual depth reveal.

---

## Section 2 — Accessibility for a Terminal/Text Combat UI

A turn-based text MUD has a **structural advantage** for accessibility: the entire game state is text, the pacing is player-controlled, and there's no spatial/timing/dexterity skill requirement at the platform layer. Squandering that advantage would be a self-own.

### 2.1 Screen reader compatibility

#### The bar to "actually usable" with NVDA/JAWS/VoiceOver

The W3C-recommended pattern for sequential message logs (chat, game log, error log) is `role="log"` with implicit `aria-live="polite"` and `aria-atomic="false"` (`https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA23`).

For a web-based MUD client (the assumed delivery for The Remnant — confirm with Blue), the bare-minimum implementation:

```html
<div role="log" aria-live="polite" aria-relevant="additions" aria-atomic="false">
  <!-- combat narration appended here, one message per <div> or <p> -->
</div>
```

Important nuances from screen-reader implementer guidance:

- **`polite` vs `assertive`:** `polite` is correct for combat narration (announces when the user is idle, doesn't interrupt them mid-typing). Reserve `assertive` for life-threatening alerts ("You are about to die.") (`https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions`).
- **Inconsistent SR support:** *"Despite the accessibility benefits that live regions bring, screen reader support is disappointingly inconsistent. For optimal support, the most widely supported combination is to use aria-live='assertive' with role='status'"* (`https://www.tpgi.com/screen-reader-support-aria-live-regions/`). Worth testing across NVDA, JAWS, VoiceOver during development.
- **Granularity:** announce *one combat resolution at a time*, not a 6-line block. SRs read live regions linearly — multi-line atomic announcements are exhausting.
- **Don't announce the prompt repeatedly.** If `[HP 80/100] >` redraws every turn, mark it `aria-live="off"` and announce only the *changes* (HP delta).

#### Caves of Qud's screen reader gap

Caves of Qud is widely loved by accessibility-focused players for being text-heavy, but the official answer on screen reader support is essentially "we don't ship that, the engine doesn't expose text in a way SRs can read" (Steam community thread `https://steamcommunity.com/app/333640/discussions/0/4209245440575246500/`). **Caves of Qud is not actually screen-reader accessible.** The Remnant can do better cheaply, *if* we choose web/HTML delivery. [low confidence on the phrasing, but the gap is real.]

#### Cogmind's accessibility design (for reference)

Cogmind isn't fully screen-reader compatible either, but Grid Sage Games has done significant work on **multi-channel feedback**. Quoting the audio accessibility blog post: low core integrity triggers a warning sound, red ALERT text, and oscillating window frames — three channels for one signal (`https://www.gridsagegames.com/blog/2020/06/audio-accessibility-features-roguelikes/`). This is the *redundant cues* principle (§2.2).

### 2.2 Color blindness / monochromatic fallback

The Remnant currently uses ANSI-style amber for narration, cyan for interactive entities, red for enemies, green for HP-healthy. **Red/green is the single highest-risk pairing for the most common color blindness types** (deuteranopia, protanopia). (`https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103`)

#### Mitigation patterns

| Pattern | Example |
|---|---|
| Symbol prefixes | `[!]` for danger, `[+]` for buffs, `[-]` for debuffs, `[=]` for status |
| Entity tag wrappers | `<enemy>stalker</enemy>` rendered as red+bracketed, color-off mode keeps brackets |
| Severity prefixes in narration | `CRITICAL:`, `WARN:`, `INFO:` — the Cogmind ALERT pattern |
| Monochrome mode toggle | Caves of Qud has a "Disable full-screen color effects" option in UI settings |
| HP labels alongside bars | `HP: 80/100 (HEALTHY)` rather than just a green bar |

The unifying principle from Game Accessibility Guidelines, Microsoft Xbox guidelines, and Can I Play That: *"Do not rely solely on color to communicate or distinguish game objects — use shapes and patterns as well."* (`https://gameaccessibilityguidelines.com/full-list/`, `https://caniplaythat.com/2020/01/29/color-blindness-accessibility-guide/`)

#### Specific recommendations for The Remnant

- HP states get **textual labels** (`HEALTHY`, `WOUNDED`, `BLOODIED`, `DYING`) in addition to color, ideally driven by HP % thresholds.
- Enemy mention in narration gets a **bracket prefix** (`[hostile]` or symbol) on first mention per turn — color is decoration, brackets are semantics.
- A **`monochrome` setting** that strips all ANSI color codes and relies on the textual/symbol cues alone. This is a one-day implementation if combat narration is template-based.
- Test the rendered output with `colorblindly` or similar simulators (deuteranopia + protanopia + tritanopia).

### 2.3 Cognitive load and motor accessibility

#### Typing-load and key-mash anti-patterns

The classic MUD "spam attack" anti-pattern — pressing `attack` repeatedly each round — is widely recognized as both fatiguing and exclusionary. IRE games (Achaea, Lusternia) sidestep this with **command aliases**: a 2-char alias expands into a multi-step combat routine (`https://forums.mudlet.org/viewtopic.php?t=21998`, `https://dwwiki.mooo.com/wiki/Combat_aliases`). They also use **balance/equilibrium** — server-side cooldowns that prevent action spam at the engine level rather than relying on player discipline.

For a single-player text MUD aimed at "doesn't take long to get into," the prescriptions are:

| Feature | Value |
|---|---|
| **Up-arrow recall + tab autocomplete** | Standard terminal behavior; a parser MUD that lacks these is doing harm |
| **Single-keystroke verb shortcuts** | `a` → `attack`, `f` → `flee`, `l` → `look`. Cogmind made the case that mouse-only-playable interfaces lower the barrier dramatically, and the equivalent for terminal is single-key actions during combat |
| **Last-action repeat (`.` or `r`)** | Don't make the player retype `attack stalker` 6 times. One-key repeat |
| **Player-defined aliases stored in a profile** | Borrow from MUD client tradition; even a minimal `alias as attack stalker` is a meaningful accessibility win |
| **Toggle-mode for held actions** | Not directly applicable to turn-based text, but: a `defend` posture that *persists* across turns until canceled is the equivalent (one keystroke, not one per turn) |

The Game Accessibility Guidelines emphasize remappable controls as one of the highest-value/lowest-cost accessibility wins (`https://gameaccessibilityguidelines.com/allow-controls-to-be-remapped-reconfigured/`). For a text game, "remappable controls" = "user-definable command aliases."

#### Cognitive-load mitigations

- **Don't gate combat on memorizing 20 verbs.** Onboarding should teach 2 verbs, then introduce more by trigger.
- **Confirmation for irreversible actions.** "Attack the merchant? `[y/N]`" is a cognitive safety net.
- **No timing pressure during onboarding turns.** Turn-based text gives you this for free; don't add a "decide in 5 seconds" mode by default.
- **Plain language defaults.** Reserve in-world jargon for flavor, not load-bearing combat actions.

### 2.4 Photosensitivity

For a terminal-style text UI, photosensitivity risk is **structurally low** but not zero. Triggers per the Game Accessibility Guidelines and Epilepsy Foundation:

- **Flashing >3 Hz over >25% of screen for >5 seconds** is the WCAG/PEAT trigger threshold (`https://gameaccessibilityguidelines.com/avoid-flickering-images-and-repetitive-patterns/`, `https://www.epilepsy.com/what-is-epilepsy/seizure-triggers/photosensitivity`).
- **Bright red flashes are the highest-risk color** for photosensitive seizures.

#### What in The Remnant might trip this

- Critical-damage flash effects (red flash on take-damage).
- Boss reveal animations that strobe.
- Cursor blink at unusually high rates, though normal blink is below threshold.
- Color cycling during status effects (rapid red/green oscillation, like Cogmind's low-integrity warning at fast speeds).

#### Mitigations

- No effect should flash >3 times per second.
- Provide a **"reduce motion / reduce flash"** setting that disables damage flashes and replaces with static red text or a `[!]` prefix.
- Avoid full-screen red flash on damage; localize to the HP bar.
- If we ever add an "incoming attack" warning that strobes the prompt, gate it behind a setting and provide a non-strobing alternative.

### 2.5 Reading load

#### Line length

The widely-cited typography optimum is **50–80 characters per line** for body text (`https://playgama.com/blog/unity/how-can-i-properly-format-multiline-text-in-my-games-dialogue-or-ui-for-readability/`). Combat narration should auto-wrap at this range, *not* fill an arbitrarily wide terminal.

#### Density

The WoW/MMO addon community has a long-running argument with itself about "combat text bloat" — too much information at once is a readability tax even for sighted, attentive players (`https://xp4t.com/wow-ui-readability-guide-reduce-clutter-and-improve-reaction-time/`). The mitigation is selective filtering by default and a verbose toggle.

For The Remnant:

- **Default combat narration: 1-2 lines per turn resolution.** "You strike the stalker for 8 damage. It snarls and lunges back."
- **Verbose mode: full damage breakdown, dice, modifiers, resist calculations.** Off by default.
- **Filter toggles** for environmental ambient text during combat (bird calls, weather flavor) — useful flavor outside combat, noise during.

#### Pagination / "more"

If combat output exceeds a screen, traditional MUDs use a `--more--` pager. For a web client, an auto-scrolling log is fine *if* the user can pause scrolling and review. **Always scroll on user action, never auto-jump on system event** — this kills SR compatibility and frustrates slow readers.

#### Cogmind's guidance

Cogmind's audio accessibility post argues for **audio logs of recent sounds** as a parallel channel — a reviewable buffer of "what just happened" rather than relying on the player to catch ephemeral effects. The text equivalent: `last` or `replay` command that re-prints the last N combat events. Cheap and high-value for cognitive accessibility.

### 2.6 Localization-ready combat text

English-only is fine for v1, but the cost difference between *easy-to-localize* and *impossible-to-localize* combat strings is paid at write-time, not at translate-time. A few rules from i18n best practices (`https://www.i18next.com/principles/best-practices`, `https://lingoport.com/i18n-term/ui-strings/`, `https://www.juliadiezlopez.com/blog/avoid-string-concatenation-a-must-for-i18n-friendly-code`):

1. **Never concatenate sentence fragments.**
   - Bad: `"You hit the " + enemyName + " for " + dmg + " damage."`
   - Good: `t("combat.hit", {enemy: enemyName, damage: dmg})` → `"You hit the {{enemy}} for {{damage}} damage."`
2. **Full sentences in templates, with named placeholders.** Translators need word order freedom.
3. **Keep grammatical agreement out of code.** If "the {enemy}" works for English but breaks for languages with grammatical gender, leave the template per-language; don't hard-code "the" in code.
4. **Plurals via plural rules, not branching.** `{count, plural, one {# wound} other {# wounds}}` (ICU MessageFormat) is the standard.
5. **No sprintf-style positional `%s`/`%d` if avoidable** — they encode position into the source string. Named placeholders are forward-compatible.
6. **One sentence per template.** `"You hit. The enemy snarls."` should be two templates, not one — translators can re-order narrative beats.

For The Remnant, adopting an i18n-aware narration template engine on day one is essentially free if combat narration is built as a templating layer over the action resolver. Retrofitting later is painful (`https://github.com/WordPress/gutenberg/issues/1927` documents the typical retrofit pain).

---

## Section 3 — Speed-to-Engage

### 3.1 Command friction: keystrokes from "I see an enemy" to "I attacked them"

Established baselines across genres:

| Game / system | Friction baseline | Per-attack keystrokes |
|---|---|---|
| IRE MUDs (Achaea, Lusternia) experienced player | Aliases compress multi-step routines into 2 chars | `kc<Enter>` = ~3 keystrokes |
| MajorMUD / classic MUD | `kill <target>` | 5+ chars + Enter |
| Caves of Qud melee | Move into adjacent enemy + bump-attack | 1 directional keypress |
| Cogmind ranged combat | `f` (fire) + target | 2 keystrokes |
| Interactive fiction | `attack <target>` full-form | 8+ keystrokes |

For The Remnant's hardcore-leaning audience, the **bump-attack (single key) plus full-form (`attack <target>`) parity** is the industry sweet spot:

- New players type `attack stalker`.
- Returning players type `a` (resolves to last target) or `a stalker`.
- Power players bind `at` to `attack stalker; defend` macros.

Citing Bartle's "modest proposal": the parser should accept **abbreviation + partial match** for any verb. `att` should resolve to `attack` if it's unambiguous in context (`https://mud.co.uk/richard/commpars.htm`).

### 3.2 Prompt design — what does a great "you are in combat" prompt look like?

The combat prompt is the load-bearing UX surface during combat. It must communicate, in one line if possible:

1. The player's action budget for this turn (HP, stamina/AP if relevant)
2. The current target (and target's state)
3. What actions are immediately available

#### Examples from named games

**Achaea (IRE MUD norm):** customizable; common community example: `4286h, 4515m, 17820e, 13150w cexkdb-` — health, mana, endurance, willpower, status flags. Dense, but every character is mapped to one mechanic. (`https://wiki.achaea.com/Combat:Overview`)

**Discworld MUD:** highly configurable prompts via the `prompt` command; players can define `[$hp_percent$%hp $mp_percent$%mp]` style. (`https://discworld.starturtle.net/lpc/playing/documentation.c?path=/helpdir/prompt`)

**Cogmind (visual but informational analogy):** status sidebar shows core integrity, heat, energy, matter. The HUD distinguishes "current action affordances" from "long-term state" by spatial grouping.

#### A proposed Remnant combat prompt

```
[HP 80/100 BLOODIED] [enemy: bone-husk stalker, wounded] (attack/flee/look)
> _
```

What this gets right per the research:

- Current HP and HP-state-label (not color-only — §2.2).
- Target named and its rough state.
- Three highest-utility verbs as a hint, parenthesized so they read as "available, not required."
- A clear input cursor.

What it must support but doesn't show:

- `?` / `help` always one keypress for full verb list.
- `look` for full description; prompt is the summary.
- `i`/`inventory`, `examine <thing>` for retrievable detail.

### 3.3 Pre-combat preparation

The buff/equip/inspect ritual is a known double-edged sword in combat-heavy games. It enriches strategy in long-form play (Stoneshard, Caves of Qud expert play) and becomes tedious in onboarding.

**Industry-norm time budget for "check then engage" loop:** 5-15 seconds of real time for a simple inspect-then-attack. More than 30 seconds and the player is doing work that should have been done at the menu/inventory screen, not in-combat. [low confidence — no published benchmark; this is reasoned from MUD/RPG playtester commentary on tedium thresholds.]

**Prescriptions for The Remnant:**

- **No mandatory pre-combat ritual in the first 5 fights.** The player engages directly. Buff/prep mechanics surface gradually.
- **`look` and `examine` should be optional in the first 5 fights**, not required to land a hit. They reward engagement; they don't gate it.
- **Equipment loadout is set outside combat**, not switched mid-turn (until a much later mechanic surfaces it).

### 3.4 Mid-combat decision time: how long per turn?

I could not find a published *millisecond-level* sweet spot for turn-based RPG decision time. The literature acknowledges this is highly player-dependent:

> *"Players vary greatly in habits, playing styles, and personal circumstances, and perfect limits are hard to pinpoint."* (`https://gameworldobserver.com/2022/12/02/how-to-design-turn-based-combat-system-untamed-tactics`)

What is documented:

- Untamed Tactics reduced *full-turn* planning time from ~8 minutes to ~1-2 minutes through playtesting iteration. [low confidence on direct read-across — this is a tactics game with multiple units.]
- IRE MUD server-side curing standardizes on **100ms latency** as the floor for fairness in PvP combat, suggesting that sub-100ms response time is the technical bar above which players perceive "instant." (`https://forums.lusternia.com/discussion/3015/server-side-curing`)

**Working hypothesis for The Remnant** [inferred]:

| Scenario | Recommended turn pacing |
|---|---|
| Onboarding (first 5 fights) | **No turn timer.** Player drives the clock entirely. |
| Standard combat | No turn timer; let the player pause and read. |
| Tense scripted moments | Optional "press any key to commit" with a soft visual countdown — *opt-in*, not default. |
| Server-side response budget | Resolve a turn submission in <100ms of perceived latency; full narration in <250ms. |

For accessibility (motor and cognitive), **default to no turn timer ever**. Add an "increased pace" mode for players who want it; never inflict it.

### 3.5 Synthesis: speed-to-engage scorecard for The Remnant

| Metric | Target |
|---|---|
| Time from game start to first enemy in narration | <30s |
| Time from first enemy to first successful attack | <90s |
| Keystrokes for first attack (verb-first form) | <10 |
| Keystrokes for repeat attack | 1 (last-action repeat) |
| Time-to-respawn after first death | <30s |
| Verbs the player must know after fight 1 | 2 (`attack`, `flee`) |
| Verbs the player should know after fight 5 | ~6 |
| Combat narration per turn | 1-2 lines default, verbose toggle |
| Turn timer in onboarding | None |

---

## Recommendations Summary

### Onboarding (Section 1)

1. Build a hand-tuned tutorial arena that scaffolds the first 3 deaths/runs (Cogmind pattern). After run 3, scaffolding falls away.
2. Difficulty mode is chosen *before the title screen*, with names that don't shame the easier choice (Cogmind rebranding finding).
3. First fight is visible inside 30 seconds; first kill inside 90.
4. Hints arrive just-in-time, after-action, in the combat log channel itself — not in a sidebar. `[hint]` prefix.
5. Start with 2 verbs (`attack`, `flee`). Surface more by enemy-state trigger or `?` discovery. Reach ~6 verbs by fight 5.
6. Death-to-respawn loop under 30 seconds for the first 5 deaths. Narrative weight from the world's reaction, not from making the player walk back.
7. Parser must accept abbreviations and provide useful failure feedback ("I don't know `dodge` — try `defend`").
8. `?` and `help` are always one keystroke, with separate beginner and expert help screens (Cogmind).

### Accessibility (Section 2)

9. `role="log"` + `aria-live="polite"` on the combat scroll. Reserve `assertive` for life-or-death alerts. Test against NVDA/JAWS/VoiceOver.
10. Symbol prefixes for state classes (`[!]`, `[+]`, `[-]`, `<enemy>`-style tags) so meaning survives a `monochrome` mode.
11. HP states get textual labels (`HEALTHY`/`WOUNDED`/`BLOODIED`/`DYING`) — never color-only.
12. User-definable command aliases on day one. Single-key shortcuts for the top 5 combat verbs. Last-action repeat key.
13. No flash above 3 Hz, ever. No full-screen red flash on damage. "Reduce motion" setting that disables flashes entirely.
14. Combat lines wrap at 50-80 characters. Default to 1-2 lines per turn; verbose toggle for the curious.
15. `last` / `replay` command to re-print the last N combat events.
16. Combat narration written through a templating engine with named placeholders from day one. No string concatenation in user-facing combat text.

### Speed-to-engage (Section 3)

17. Combat prompt example: `[HP 80/100 BLOODIED] [enemy: bone-husk stalker, wounded] (attack/flee/look) >`. One line, all load-bearing info, three verb hints.
18. Bump-attack-equivalent (single-key `a` for attack) parity with full-form (`attack stalker`). Both must work.
19. No turn timer in onboarding. No turn timer by default ever. Optional "increased pace" mode for power players, never default.
20. Server-side turn resolution under 100ms perceived latency, narration under 250ms. Faster than that is invisible; slower than that drags.

---

## Unresolved Questions for Blue

1. **Delivery surface — terminal, web, or both?** Most accessibility recommendations (ARIA live regions, `role="log"`, semantic markup) assume a web/HTML client. If The Remnant ships as a raw terminal/SSH MUD, the SR story is materially worse and we'd need to weigh terminal-emulator-level SR support (`brltty`, NVDA terminal mode) — much weaker. **This decision precedes most §2 recommendations.**
2. **Permadeath posture.** The repo has a `DEATH_REGENERATION.md` file I didn't read. Whether deaths in The Remnant are permadeath, partial-loss, or narrative-respawn changes the §1.4 friction budget significantly. The 30-second-respawn recommendation assumes partial-loss-with-narrative-weight; permadeath fundamentally changes the calculus.
3. **Turn structure granularity.** Is a "turn" one player action, or a full exchange (player attacks, enemy attacks)? §3.4's pacing recommendations differ.
4. **Combat verb taxonomy commitment.** I assumed `attack`, `flee`, `look`, `examine`, `target`, `defend`. Some of these may not exist in The Remnant's design or may have different names. The §1.5 scaffolding plan needs to be re-mapped to the actual verb set.
5. **Companion / NPC-in-combat presence.** Some §1.3 hint patterns rely on NPC dialogue as a tutorial-delivery channel. If The Remnant's first combat is truly solo, that channel is unavailable for at least the first few fights.
6. **Read-rate data for text-game tutorials specifically.** I could not find published numbers on what % of text-game players actually read prompt text vs. skip. If we have any internal playtest data, it should override the generic mobile FTUE benchmarks I cited. [low confidence flag stays on the relevant claims until we have our own data.]

---

## Sources

### Onboarding & tutorial design

- Grid Sage Games, *Tutorials and Help: Easing Players into the Game* — `https://www.gridsagegames.com/blog/2016/07/tutorials-help/`
- Grid Sage Games, *Rebranding Difficulty Modes* — `https://www.gridsagegames.com/blog/2019/09/rebranding-difficulty-modes/`
- Grid Sage Games, *How to Make a Roguelike* — `https://www.gridsagegames.com/blog/2018/10/how-to-make-a-roguelike/`
- Caves of Qud Wiki, *Combat* — `https://wiki.cavesofqud.com/wiki/Combat`
- Caves of Qud Wiki, *Early Game Checklist* — `https://wiki.cavesofqud.com/wiki/Early_Game_Checklist`
- Caves of Qud Steam guide, *Basic Qud Gameplay FAQ for Beginners* — `https://steamcommunity.com/sharedfiles/filedetails/?id=1711493305`
- TechRaptor, *Stoneshard is Promising, but Too Brutal for Its Own Good* — `https://techraptor.net/gaming/previews/stoneshard-preview`
- God is a Geek, *Stoneshard is one of the hardest games ever* — `https://godisageek.com/2020/02/stoneshard-is-one-of-the-hardest-games-ever-prologue-preview/`
- NEO Scavenger Steam discussion on combat avoidance — `https://steamcommunity.com/app/248860/discussions/1/490124466463420405/`
- RPGFan, *Citizen Sleeper Review* — `https://www.rpgfan.com/review/citizen-sleeper/`
- Wikipedia, *Roadwarden* — `https://en.wikipedia.org/wiki/Roadwarden`
- Inworld AI, *Game UX: Best practices for video game onboarding* — `https://inworld.ai/blog/game-ux-best-practices-for-video-game-onboarding`
- Inworld AI, *Best practices in video game UI design for game onboarding* — `https://inworld.ai/blog/best-practices-in-video-game-ui-for-game-onboarding`
- Inworld AI, *Best practices for video game tutorial design* — `https://inworld.ai/blog/game-ux-best-practices-for-video-game-tutorial-design`
- Design The Game, *What is the First-Time User Experience (FTUE)?* — `https://www.designthegame.com/learning/tutorial/what-first-time-user-experience-ftue`
- devtodev, *FTUE or First Time User Experience* — `https://www.devtodev.com/education/articles/en/348/main-metrics-ftue`
- GameAnalytics, *10 Tips For A Great FTUE In F2P Games* — `https://www.gameanalytics.com/blog/tips-for-a-great-first-time-user-experience-ftue-in-f2p-games`
- Game Developer, *Encouraging player creativity in Caves of Qud* — `https://www.gamedeveloper.com/design/encouraging-player-creativity-in-caves-of-qud`

### Verb discoverability & parser design

- Wikipedia, *Interactive fiction* — `https://en.wikipedia.org/wiki/Interactive_fiction`
- Richard Bartle, *Command Parsers: a Modest Proposal* — `https://mud.co.uk/richard/commpars.htm`
- Inform 7 community, *Automated >VERBS command* — `https://intfiction.org/t/automated-verbs-command-plus-explanation-of-allowed-usages-of-verbs/79023`
- IFDB, *77 Verbs* tutorial game — `https://ifdb.org/viewgame?id=p3rd5133qm5cwfd`
- IntFicPy, parser engine — `https://github.com/RALWORKS/intficpy`
- Discworld MUD, prompt customization — `https://discworld.starturtle.net/lpc/playing/documentation.c?path=/helpdir/prompt`
- Achaea Wiki, *Combat:Overview* — `https://wiki.achaea.com/Combat:Overview`
- Discworld MUD Wiki, *Combat aliases* — `https://dwwiki.mooo.com/wiki/Combat_aliases`
- Lusternia forums, *Server-side Curing* — `https://forums.lusternia.com/discussion/3015/server-side-curing`
- Mudlet forums, scripting and aliases — `https://forums.mudlet.org/viewtopic.php?t=21998`

### Accessibility — screen reader, ARIA, color, motor, photosensitivity

- W3C WCAG, *ARIA23: Using role=log to identify sequential information updates* — `https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA23`
- MDN, *ARIA live regions* — `https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions`
- TPGi, *Screen reader support for ARIA live regions* — `https://www.tpgi.com/screen-reader-support-aria-live-regions/`
- Sara Soueidan, *Accessible notifications with ARIA Live Regions* — `https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1/`
- Game Accessibility Guidelines, full list — `https://gameaccessibilityguidelines.com/full-list/`
- Game Accessibility Guidelines, *Ensure screen reader support* — `https://gameaccessibilityguidelines.com/ensure-screenreader-support-including-menus-installers/`
- Game Accessibility Guidelines, *Avoid flickering images and repetitive patterns* — `https://gameaccessibilityguidelines.com/avoid-flickering-images-and-repetitive-patterns/`
- Game Accessibility Guidelines, *Allow controls to be remapped/reconfigured* — `https://gameaccessibilityguidelines.com/allow-controls-to-be-remapped-reconfigured/`
- Game Accessibility Guidelines, *Use simple clear text formatting* — `https://gameaccessibilityguidelines.com/use-simple-clear-text-formatting/`
- Game Accessibility Guidelines, *Use an easily readable default font size* — `https://gameaccessibilityguidelines.com/use-an-easily-readable-default-font-size/`
- Microsoft, *Xbox Accessibility Guideline 103 (color)* — `https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/103`
- Microsoft, *Xbox Accessibility Guideline 102 (multiple sensory channels)* — `https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/102`
- Microsoft, *Xbox Accessibility Guideline 107 (remappable controls)* — `https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/107`
- Microsoft, *Xbox Accessibility Guideline 118 (photosensitivity)* — `https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/118`
- MDN, *Web accessibility for seizures and physical reactions* — `https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Seizure_disorders`
- Epilepsy Foundation, *Photosensitivity and Seizures* — `https://www.epilepsy.com/what-is-epilepsy/seizure-triggers/photosensitivity`
- Trace RERC, *Photosensitive Epilepsy Analysis Tool (PEAT)* — `https://trace.umd.edu/peat/`
- Can I Play That, *Color-Blindness Accessibility Guide* — `https://caniplaythat.com/2020/01/29/color-blindness-accessibility-guide/`
- Grid Sage Games, *Audio Accessibility Features for Roguelikes* — `https://www.gridsagegames.com/blog/2020/06/audio-accessibility-features-roguelikes/`
- Caves of Qud Steam discussion on screen reader compatibility — `https://steamcommunity.com/app/333640/discussions/0/4209245440575246500/`
- Caves of Qud Wiki, *Monochrome* — `https://wiki.cavesofqud.com/wiki/Monochrome`

### Localization

- i18next best practices — `https://www.i18next.com/principles/best-practices`
- Lingoport, *Localization of UI Strings* — `https://lingoport.com/i18n-term/ui-strings/`
- Julia Diez, *Avoid String Concatenation: A Must for i18n-Friendly Code* — `https://www.juliadiezlopez.com/blog/avoid-string-concatenation-a-must-for-i18n-friendly-code`
- WordPress Gutenberg issue tracker, i18n concatenation pain — `https://github.com/WordPress/gutenberg/issues/1927`

### Death penalty & respawn

- MMORPG.com forums, *Respawn/Penalty concerns* — `https://forums.mmorpg.com/discussion/146682/respawn-penalty-concerns`
- Wikipedia, *Permadeath* — `https://en.wikipedia.org/wiki/Permadeath`
- MUDs Wiki, *Permanent death* — `https://muds.fandom.com/wiki/Permanent_death`

### Turn pace, line length, density

- Game World Observer, *How to design turn-based combat system: Untamed Tactics* — `https://gameworldobserver.com/2022/12/02/how-to-design-turn-based-combat-system-untamed-tactics`
- Wikipedia, *Timekeeping in games (turns and rounds)* — `https://en.wikipedia.org/wiki/Timekeeping_in_games`
- Playgama, *How can I properly format multiline text* — `https://playgama.com/blog/unity/how-can-i-properly-format-multiline-text-in-my-games-dialogue-or-ui-for-readability/`
- xp4t, *WoW UI Readability: Cut Clutter Fast* — `https://xp4t.com/wow-ui-readability-guide-reduce-clutter-and-improve-reaction-time/`

---

*Document built for The Remnant by the player-experience research stream, 2026-04-24. ~720 lines. Ready for Blue handoff.*
