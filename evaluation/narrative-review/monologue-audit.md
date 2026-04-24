# Monologue Audit — All 7 Character Classes
**Convoy**: remnant-narrative-0329 | **Date**: 2026-03-31
**Scope**: class_enforcer, class_scout, class_wraith, class_shepherd, class_reclaimer, class_warden, class_broker

---

## Audit Methodology

Each class assessed for:
1. **Generic voice** — lines any class could say
2. **Repeated sentiment** — same emotional beat across triggers
3. **Tone mismatch** — lines that break class fantasy
4. **Thin pools** — triggers with fewer than 3 lines
5. **Personal loss integration** — whether loss personalLoss bleeds into line texture

**Blind test**: Could you identify the class without seeing the class name?

---

## Summary Scorecard

| Class | Voice Distinctiveness | Worst Trigger | Personal Loss Integration | Thin Pools |
|---|---|---|---|---|
| Enforcer | STRONG | act_transition | Good | act_transition, pressure_spike |
| Scout | MODERATE — blurs with Reclaimer | pressure_spike | Moderate | act_transition, pressure_spike |
| Wraith | STRONG | pressure_spike | Strong | act_transition, pressure_spike |
| Shepherd | STRONG | pressure_spike | Strong | act_transition, pressure_spike |
| Reclaimer | WEAK — nearly identical to Scout | all triggers | Moderate | act_transition, pressure_spike |
| Warden | STRONG | pressure_spike | Strong | act_transition, pressure_spike |
| Broker | STRONG | in_danger | Strong | act_transition, pressure_spike |

---

## ENFORCER

**Voice assessment**: Highly distinctive. Compressed, tactical, second-person imperative. The "Pain is information" anchor and round-counting idiom mark this class immediately. You would know this is the Enforcer.

**Blind test result**: PASS

### Flag 1 — Generic voice

`low_hp / partner`: `"Not here. You don't stop here."` — this is almost word-for-word identical to the `child` variant (`"Not here. You don't get to stop here."`). Both versions read as universal post-apocalyptic grit rather than Enforcer-specific voice.

`safe_rest / identity`: `"Safe enough. You take what the moment offers."` — this is the most un-Enforcer line in the file. It reads pastoral and accepting, not tactical. An Enforcer resting does not "take what the moment offers" — they audit the perimeter and assign themselves a shift schedule.

`pressure_spike / community`: `"Threat density. The air has weight. Move carefully."` — "Move carefully" is nearly identical to Scout and Reclaimer pressure spikes in tone. Enforcer would say "Move efficiently" or assign a sector.

### Flag 2 — Repeated sentiment

`low_hp` across all personalLoss variants: Line 1 is always "Pain is information. It says: you're still alive. [loss-specific tag]." This is intentional anchoring and works well. However, lines 2 and 3 across the `child` and `partner` variants are nearly identical in structure — both use "You've taken worse. Think about when." The emotional differentiation is present but thin for someone reading both quickly.

`act_transition`: All 5 personalLoss variants express "situation changed, you adapt." The loss-specific tags (the promise, whoever you are, etc.) do the minimal work. These are the weakest lines in the file — no loss-specific texture bleeds into how the Enforcer frames the transition.

### Flag 3 — Tone mismatch

`examining_loss_item / identity`: `"Intel. Or maybe not. Keep it. Figure it out later."` — the "Or maybe not" hesitation is more Broker or Scout than Enforcer. An Enforcer with identity loss would be more tightly disciplined even in confusion: something like "Unknown provenance. Tactical value: unknown. Carry it anyway."

### Flag 4 — Thin pools

`act_transition`: 2 lines per personalLoss. **THIN.** Players will see repeats immediately at every act break.

`pressure_spike`: 2 lines per personalLoss. **THIN.** Same problem.

### Flag 5 — Personal loss integration

- `child`: "Think about when you took worse" — good, vague-specific
- `partner`: "You hesitated at second four. You know why." — excellent, the most distinctive Enforcer-partner line in the file. This is the standard to aim for.
- `community`: "No one standing watch. You stand watch anyway." — strong
- `identity`: "The counting is automatic. Some things survive." — strong
- `promise`: "The debt isn't paid." / "The promise isn't kept yet." — works but reads formulaic by repetition across triggers

**Gap**: The `child` personalLoss rarely achieves the specificity of `partner`. "You were supposed to protect them" (examining_loss_item/child) is the best child-specific line. Most child lines are interchangeable with partner or community.

### Suggested improvements

- `act_transition`: Expand to 3 lines. Add a line that uses Enforcer's round-counting or exit-mapping idiom: e.g., `"New parameters. You count the exits again. The number changed."` (child), `"The situation escalated. You would have told them to stay low. Old habit."` (partner)
- `safe_rest / identity`: Replace `"Safe enough. You take what the moment offers."` with something like `"Safe enough. You note it. You don't trust it. Proceed."` — maintains Enforcer skepticism
- `pressure_spike`: All variants need a third line. The Enforcer's signature is specificity (counting, measuring, naming sectors). Current 2-line pools leave the trigger feeling thin and most lines could be said by any class.

---

## SCOUT

**Voice assessment**: Moderately distinctive. The data/pattern/map lexicon is consistent. However, this voice overlaps significantly with Reclaimer (see Reclaimer notes). If both classes are in play, players may not hear a difference. The Scout's distinguishing feature should be *environmental reading and physical terrain* vs. Reclaimer's *systems and technical data* — but this distinction collapses in several triggers.

**Blind test result**: CONDITIONAL PASS — recognizable alone, but confused alongside Reclaimer

### Flag 1 — Generic voice

`in_danger / child`: `"The pattern is wrong. You feel it before you see it. That's worth something."` — this line is equally home in Wraith, Reclaimer, or Warden. No Scout-specific texture (terrain, exits, tracking).

`post_combat / promise`: `"You note what you could have done better. You'll be better. There's time."` — "There's time" reads hopeful in a way that isn't Scout. The Scout is analytical and self-critical; hopefulness is not their mode.

`pressure_spike / community`: `"The pattern broke. Something is different. Find what changed."` — could be said by Reclaimer, Broker, Enforcer. No Scout-specific vocabulary.

`pressure_spike / identity`: `"Something shifted. Your body caught it before you did. Listen to it."` — this is nearly identical to Enforcer's `"Something in the air. Your body logged it before you did."` Same idea, same structure.

### Flag 2 — Repeated sentiment

`in_danger`: Every personalLoss variant references "you map exits" plus "the pattern is wrong." These are Scout's two signature gestures — fine as anchors — but lines 3 across variants (`"You've read this terrain..."`, `"You've seen this before..."`, `"You've tracked enough threats..."`) are all the same sentiment: "your experience applies here." They're not differentiated by loss.

`safe_rest`: All variants open with mapping exits, close with sleeping efficiently. The personalLoss differentiators are present (`"You used to listen to something else"` for partner, `"Old habit from places with more people to protect"` for community) but the middle lines are soft.

`pressure_spike`: All 10 lines (2 per personalLoss) essentially say "something is wrong in the data/pattern, read it." No variant breaks from this to show the Scout's emotional state or loss-specific framing. This trigger is the thinnest in the file.

### Flag 3 — Tone mismatch

`examining_loss_item / promise`: `"The data confirms what you already knew. The mission continues."` — this is Reclaimer voice, not Scout. A Scout processes grief through pattern recognition and reconstruction; "the mission continues" is a Reclaimer's data-as-mission framing.

`safe_rest / promise`: `"Rest is tactical. You take it efficiently and without regret."` — again, this reads as Reclaimer. Scout's rest should have the observation-mode quality (`"The silence is informative"` appears in child and is excellent). Efficient, regret-free rest is Reclaimer's idiom.

### Flag 4 — Thin pools

`act_transition`: 2 lines per personalLoss. **THIN.**
`pressure_spike`: 2 lines per personalLoss. **THIN.** This trigger is the weakest for Scout and needs the most work.

### Flag 5 — Personal loss integration

- `partner`: `"It's a longer list than it used to be."` (post_combat) — excellent understatement. `"You used to listen to something else."` (safe_rest) — strong.
- `community`: `"Old habit from places with more people to protect."` (safe_rest) — strong.
- `identity`: `"Building yourself backward from evidence."` (examining_loss_item) — the best loss-integration line in the file. Precise and specific to both class and loss.
- `promise`: The promise variants frequently feel transposed from Enforcer or Reclaimer. The Scout's promise voice needs to read as *a navigator who found a waypoint and is refusing to deviate.*
- `child`: The child loss is underdeveloped across all Scout triggers. Most child lines are interchangeable with other losses.

### Suggested improvements

- Differentiate Scout from Reclaimer explicitly: Scout reads *terrain, bodies, weather, rooms*; Reclaimer reads *systems, logs, data structures*. Audit every "data" reference in Scout — replace with "terrain," "pattern," "track," or "read."
- `pressure_spike`: Expand to 3 lines with Scout-specific texture, e.g., `"Footfall pattern changed. Someone knows this space. You need to know it better."` (community), `"The exits you mapped are no longer the exits you'd trust."` (child)
- `examining_loss_item / promise`: Replace with something like `"You catalogued it the first time you found it. The data hasn't changed. The weight of it has."` — Scout-specific grief framing.

---

## WRAITH

**Voice assessment**: Very distinctive. The shadow/cold/stillness lexicon is consistent and evocative. The Wraith's signature move — framing emotional absence as a feature, then cracking on it — is executed well across triggers. You would know this is the Wraith.

**Blind test result**: STRONG PASS

### Flag 1 — Generic voice

`low_hp / promise`: `"Not yet. The debt isn't cleared."` — "the debt" framing is more Broker than Wraith. The Wraith's version of a promise is something colder: an obligation that has no ledger, just weight.

`in_danger / community`: `"Threat registered. You're already repositioning."` — the word "repositioning" could belong to Enforcer or Scout. Wraith's threat response has a specific quality: *dissolution*, not repositioning. Compare to the much stronger `"Something is wrong. You become nothing. Nothing is safe."` (partner variant).

`act_transition / partner`: `"Escalation. You adjust your definition of necessary."` — this is strong Wraith voice, but it's isolated in act_transition where most other variants are thin.

### Flag 2 — Repeated sentiment

`post_combat`: All 5 personalLoss variants open with `"It was over before they knew you were there."` This is an anchor line and works as one, but the emotional differentiation in lines 2-3 is almost entirely through the loss tag. The underlying beat — "I feel nothing, I used to" — repeats with minimal variation:
- child: "You used to feel something about that. You note it. You move on."
- partner: "You used to feel something about that."
- community: "You don't feel anything. You used to, around other people."
- identity: "You're not sure if that's the loss talking or the training."
- promise: "You stopped checking if that was a problem."

Lines 2-3 across these variants could be shuffled without readers noticing.

`examining_loss_item`: "Secrets recognize their own" appears verbatim across `child`, `partner`, `community`, `identity`, and `promise`. This is a distinctive anchor line — but using it as line 1 for every single personalLoss removes its impact. It reads like a pool header that leaked into the lines. Either make it the sole line 1 for one loss (the most fitting, probably `identity`) or rework it as a structural variation across losses.

### Flag 3 — Tone mismatch

`safe_rest / community`: `"The absence of other people's noise. You tell yourself you prefer it. Mostly true."` — this is good Wraith voice, but "Mostly true" has a slight Broker quality (the qualified admission). Wraith would not qualify; they would either be in denial or past denial.

`pressure_spike / identity`: `"The dark is different here. You're very good in the dark. You'll need to be."` — "You'll need to be" is a Scout or Enforcer assurance. Wraith's pressure spike would be something stranger: *the dark recognizing them back*, not a practical self-reminder.

### Flag 4 — Thin pools

`act_transition`: 2 lines per personalLoss. **THIN.** The Wraith's act_transition lines are actually some of the most distinctive in all 7 files — `"The world changed. You were already in the shadow when it did."` is excellent — but 2 lines is too thin for a trigger that fires at each act break.

`pressure_spike`: 2 lines per personalLoss. **THIN.** These are the weakest Wraith lines: they're functional but lack the strange, self-aware dread that makes the Wraith voice work.

### Flag 5 — Personal loss integration

- `partner`: `"The ice has one thin place. You found it. You put the thing down carefully."` (examining_loss_item) — the best line in the Wraith file. Precise, strange, emotionally exact.
- `partner`: `"You face the wall. You used to face someone else. The wall is easier."` (safe_rest) — strong.
- `community`: `"The absence isn't emptiness. It's how you move through the world now."` (post_combat) — strong.
- `identity`: `"You don't know who you are. But whatever it is bleeds. Keep it bleeding forward."` (low_hp) — the phrase "bleeding forward" is viscerally Wraith.
- `promise`: The promise Wraith lines are consistently the weakest — they often read as Enforcer-with-shadow-vocabulary rather than the Wraith's specific quality of *moral ambiguity and emotional flatness*.

**Gap**: `"Secrets recognize their own."` is overused. Appears in every personalLoss for examining_loss_item. It should be a signature line for ONE variant, not a universal anchor.

### Suggested improvements

- `examining_loss_item`: Differentiate line 1 across personalLoss variants. Only use "Secrets recognize their own" for `identity` (where it's most fitting). Write distinct openers for the other four.
- `pressure_spike`: Expand to 3 lines. The Wraith's pressure spike should lean into the existential: the threat outside as a mirror of the threat inside. e.g., `"Something in the dark has patience. You have more."` (child)
- `post_combat`: Lines 2-3 across the 5 variants need more differentiation. The emotional texture of not-feeling should be loss-specific: the partner Wraith has tried not to feel since a specific rupture; the community Wraith lost feeling gradually; the promise Wraith uses feeling-nothing as fuel.

---

## SHEPHERD

**Voice assessment**: Very distinctive. The healer-as-lens is consistent and well-executed. Diagnostic language, hands-as-actor, treating everything including threats as clinical phenomena. You would know this is the Shepherd.

**Blind test result**: STRONG PASS

### Flag 1 — Generic voice

`in_danger / identity`: `"Something is very wrong. Your hands are already moving."` — the first clause is generic (every class says some version of "something is wrong"). The second clause is Shepherd-specific. Trim the first half or make it medical: `"Vital signs wrong. Your hands are already moving."`

`safe_rest / promise`: `"Rest. The promise needs you functional. This is functional maintenance."` — "functional maintenance" is Reclaimer voice, not Shepherd. A Shepherd's rest would be framed through the body's needs, not a system's requirements.

`pressure_spike / identity`: `"Wrong. Everything here is wrong. Your body signals it clearly."` — two consecutive generic danger signals. No healer-specific framing.

### Flag 2 — Repeated sentiment

`low_hp`: The "you could treat this, if it were anyone else" structure repeats across all personalLoss variants. This is an effective anchor — the healer who can't self-heal is a strong irony — but variants `partner`, `community`, and `promise` all resolve to the same beat ("your training kicks in, follow it"). The `child` and `identity` variants are stronger because they add a second layer: "They would have said the same" (child) and "your hands remember how" (identity).

`post_combat / promise`: `"The promise is still intact. Keep moving."` appears here AND in Enforcer, Warden, and Reclaimer post_combat/promise. This exact formulation is becoming a cross-class refrain that erodes distinctiveness.

`act_transition`: All variants express "the scope grew, you respond to scope." The healer-specific angle (triage under mass-casualty conditions) is only present in the `partner` variant (`"More people are going to die. You focus on the ones who don't have to."`) — which is the strongest act_transition line in the Shepherd file. The other four variants miss this opportunity.

### Flag 3 — Tone mismatch

`in_danger / promise`: `"Threat. You need to be alive to keep the promise. Protect the asset."` — "Protect the asset" is Enforcer or Reclaimer mission-speak. A Shepherd's clinical framing would use a body metaphor: `"Threat. You are the only instrument that can complete this procedure. Protect the instrument."`

`pressure_spike / promise`: `"The tension here is clinical. You treat it as a variable. You proceed."` — "You treat it as a variable" is Reclaimer, not Shepherd. A Shepherd doesn't treat variables; they read symptoms and dose responses.

### Flag 4 — Thin pools

`act_transition`: 2 lines per personalLoss. **THIN.** Given that the Shepherd has the strongest unique framing for this trigger (mass-casualty triage logic), the thin pool wastes the opportunity.

`pressure_spike`: 2 lines per personalLoss. **THIN.** The two available lines per variant do not establish the Shepherd's specific mode of threat-reading (reading the room as a patient in crisis) consistently.

### Flag 5 — Personal loss integration

- `child`: `"You were supposed to protect them. You know exactly where the failure point was."` — excellent precision. The Shepherd frames their grief as a diagnostic error.
- `partner`: `"You dress the wound with the same hands that — you're very good at this. It shouldn't feel wrong."` — the interrupted sentence is the best stylistic choice in the Shepherd file. Deliberate truncation shows what the Shepherd can't say.
- `community`: `"You rest and you count. The people you've helped against the ones you couldn't."` — strong.
- `identity`: `"Whatever you were, you were a healer."` (post_combat) — simple and effective.
- `promise`: Promise Shepherd lines are functional but rarely use the healer's specific vocabulary. "Healers make promises they can't always keep. You promised anyway." (examining_loss_item/promise) is the strongest promise variant.

**Gap**: The `child` loss has one exceptional line (examining_loss_item) but otherwise reads as interchangeable with community. The specific grief of losing a child — as a healer, as someone whose hands should have been able to do something — needs more texture in low_hp and post_combat.

### Suggested improvements

- `act_transition`: Expand to 3 lines for all variants. Lean into mass-casualty triage framing for community, and the contrast of healing-as-futility for child.
- `in_danger / promise`: Replace "Protect the asset" with body/instrument metaphor: `"Threat. The procedure requires a functioning surgeon. Keep the surgeon functioning."`
- `pressure_spike`: Add a third line per variant using the room-as-patient metaphor: e.g., `"Something here is septic. You've treated septic rooms before. Move carefully."` (community), `"The atmosphere here is wrong in the way a patient is wrong before they code."` (child)

---

## RECLAIMER

**Voice assessment**: Weakest distinctiveness of the 7 classes. The systems/data/diagnostic vocabulary overlaps substantially with Scout. Without seeing the class name, a player who has been exposed to Scout would not reliably distinguish Reclaimer voice. The difference in the header comments — Scout: "the world is a pattern"; Reclaimer: "emotions are subroutines" — is not executed consistently in the lines.

**Blind test result**: FAIL — would frequently be read as Scout or generic tactical

### Flag 1 — Generic voice (extensive)

`low_hp / child` and `low_hp / partner`: Both open with `"Systems failing. Core functionality compromised."` — this is the anchor line, which is fine. But line 3 for child is `"Critical failure is not an option. Reconfigure. Continue."` and for community is `"Critical warning. Logged. Addressed. Moving."` These are structurally the same as Enforcer's compressed imperatives and Scout's "trust the data, move."

`in_danger / child`: `"The data says: not good here. The data is usually right. Trust the data."` — this is almost word-for-word Scout's `"The data says: still viable. Trust the data."` (low_hp/child).

`post_combat / community`: `"Post-action: resources depleted at acceptable rate. Keep moving."` — Enforcer says nearly this with "Threat neutralized" + efficiency critique. No Reclaimer-specific character.

`pressure_spike`: Most lines across all 5 personalLoss variants are interchangeable with Scout's pressure_spike lines. `"The data is signaling. You've learned not to ignore the data."` (community) and Scout's `"The data says you need to find cover. The data is usually right."` (low_hp/community) are the same voice pattern.

### Flag 2 — Repeated sentiment

`in_danger`: "threat detected / run assessment / respond" appears in all 5 variants with only lexical variation. No variant shows the Reclaimer's specific mode: *treating threat like a failing system to be diagnosed, not a tactical problem to be solved.*

`act_transition`: All 5 variants say "system changed, recalculate." The Reclaimer's unique framing — reverse-engineering, reading documentation, finding legacy code in their own muscle memory — is only present in the `partner` variant (`"You reverse-engineer the new structure"`). This is the one Reclaimer-specific act_transition line; it needs to appear in every variant.

### Flag 3 — Tone mismatch

`safe_rest / partner`: `"You used to have someone to debug with. You debug alone now. It's slower."` — this is the single most distinctive line in the Reclaimer file. "Debug alone" is Reclaimer-specific, not Scout-usable. This line sets the standard for what the file should be doing throughout.

By contrast:

`safe_rest / child`: `"The quiet is good for processing. You have a lot to process."` — this is generic. "A lot to process" is a common idiom with no class-specific meaning.

`examining_loss_item / identity`: `"Something in you recognizes this. The recognition doesn't come with a data label. Frustrating."` — "Frustrating" is the right emotional register for Reclaimer, but it's understated to the point of disappearing.

### Flag 4 — Thin pools

`act_transition`: 2 lines per personalLoss. **THIN.**
`pressure_spike`: 2 lines per personalLoss. **THIN.** These are the triggers where Reclaimer is least distinguishable.

### Flag 5 — Personal loss integration

- `partner`: `"You used to have someone to debug with. You debug alone now. It's slower."` — excellent. This is the model for the whole file.
- `identity`: `"You don't know what you're rebuilding toward. You know how to rebuild. Start there."` — strong.
- `community`: Lines are the weakest — "mission," "resource," and "efficiency" appear but the community-specific texture (a network of people the Reclaimer was part of, now offline) is absent.
- `child` and `promise`: Both blend into generic functional language. The child-Reclaimer's grief should have something to do with data they couldn't interpret in time, or a system that failed in a way they could have predicted. That specificity is missing.

**Core problem**: The Reclaimer's stated voice distinction — "emotions are subroutines that keep interrupting the main process" — only appears explicitly in one line: `"Some things don't resolve into data. This is one of them. That's new for you."` (examining_loss_item/partner). This is the best concept in the file; it needs to appear across more triggers. Every time the Reclaimer feels something, they should be logging it as an anomalous subroutine. Currently they just say "data" and move on, which is indistinguishable from Scout.

### Suggested improvements

**Critical**: The Reclaimer needs a vocabulary split from Scout:
- Scout reads *terrain, patterns, physical environments, tracks*
- Reclaimer reads *systems, logs, architectures, error states, subroutines*

Audit every line: if a Scout could say it verbatim, it needs rewriting.

Specific fixes:
- `in_danger`: Replace all "data says: not good / run assessment" with Reclaimer-specific framing: `"System failure in progress. Locate the breach. Isolate it."` (community), `"The environment is throwing errors. Read the error log before it crashes."` (identity)
- `pressure_spike`: Add a third line per variant. Use error/crash/anomaly vocabulary, not generic "data shifted."
- `safe_rest / child`: Replace with something that isolates the Reclaimer's specific loneliness: `"The quiet used to have more in it. The archive is smaller now."` 
- `post_combat`: The Reclaimer should catalog encounters like bug reports, not like after-action reviews. e.g., `"Encounter closed. Bug report: you took more damage than the threat profile suggested. Update the threat model."` (child)

---

## WARDEN

**Voice assessment**: Highly distinctive. "Hold the line" as both literal and metaphysical frame is consistent, the protector-without-a-charge tension is well-executed, and the "math" recurring motif (`"That's not wisdom. That's math."`) is a strong class-specific anchor. You would know this is the Warden.

**Blind test result**: STRONG PASS

### Flag 1 — Generic voice

`post_combat / community`: `"You held the line. That's what you do. That's what you've always done."` — the weakest line in the file. No loss-specific texture, no distinctive Warden framing beyond the "hold the line" repeat.

`pressure_spike / community`: `"Something is wrong here. You widen your stance and meet it."` — "widen your stance" is Warden-specific but the surrounding line is generic enough to appear in any file.

`act_transition / community`: `"More to protect. The list just got longer. The work just got harder."` — could be Shepherd, could be generic. The Warden's version of escalation should be expressed as a line they *hold*, not a list that grows.

### Flag 2 — Repeated sentiment

`in_danger`: All 5 variants express "step forward / body already in defensive posture." This is appropriate for the Warden but lines 2-3 blur together. The most distinctive variants are `partner` (`"You put yourself between it and the space where someone used to be."`) and `child` (`"You stand between it and — you stand between it."` — the truncation is excellent). The other three variants don't achieve this level of specificity.

`low_hp`: `"You can't protect anyone if you're dead. That's not wisdom. That's math."` is an excellent anchor line. However, the phrasing recurs across `child`, `partner`, `community`, and `promise` with only the last clause changed. Four out of five low_hp pools open with near-identical first lines. The differentiation needs to be stronger in lines 2-3.

### Flag 3 — Tone mismatch

`in_danger / promise`: `"Threat. You protect the mission by being alive. Standard procedure."` — "standard procedure" is Reclaimer or Enforcer, not Warden. The Warden's idiom is conviction and line-holding, not procedure. Replace with: `"Threat. Wardens don't retreat from threats. They don't retreat from promises either."`

`examining_loss_item / partner`: `"A guardian's failure isn't the threat. It's that the line was there. And you were on the wrong side."` — this is the most philosophically dense line in the Warden file and the most powerful. It also risks Broker territory (analytical self-accounting). For the Warden, this works because it's framed as tactical failure, not moral accounting. Keep it.

### Flag 4 — Thin pools

`act_transition`: 2 lines per personalLoss. **THIN.** Given that act_transition is a major narrative moment, the Warden's 2-line response feels meager. The Warden expanding their line in response to escalating threat is a natural dramatic beat — it should have 3 lines.

`pressure_spike`: 2 lines per personalLoss. **THIN.** Current lines are functional but the Warden's specific mode of reading threat (as something they've already planted their feet against) isn't consistently present.

### Flag 5 — Personal loss integration

- `partner`: `"You put yourself between it and the space where someone used to be."` (in_danger) — the best line in the Warden file. This is exactly the right way to integrate partner loss into Warden class fantasy.
- `partner`: `"You used to face someone. You face the door now."` (safe_rest) — strong. Pairs well with the in_danger line.
- `community`: `"The community used to sleep behind you. You guard the absence."` (safe_rest) — strong. "Guard the absence" is a precise phrase.
- `child`: Lines are the thinnest. The Warden-child fantasy — a protector who failed their child, now holding every other line with that specific wound — is only present in `"You know the weight of what you couldn't protect."` (examining_loss_item). Most other child lines read as interchangeable with partner or community.
- `identity`: `"Defender. That's what every instinct says. You follow the instincts."` (in_danger) — economical and correct.
- `promise`: `"Wardens don't take oaths lightly."` (examining_loss_item) — the word "oath" is good Warden-specific vocabulary. It could be used more.

### Suggested improvements

- `act_transition`: Expand to 3 lines. Lean into the "widening line" metaphor with loss-specific texture, especially for `child` (the line they couldn't hold) and `partner` (the line they now hold alone).
- `low_hp`: Diversify the anchor line across personalLoss variants. All four "That's not wisdom. That's math." uses dilute the phrase. Reserve it for one variant (probably `community`, where the math of protecting vs. not-protecting is most concrete) and write distinct anchors for the others.
- `pressure_spike`: Add a third line per variant. The Warden's pressure spike should feel like a sentinel response: weight, set of feet, eyes front. e.g., `"The threat increased. You set your feet. That's the whole preparation."` (promise)

---

## BROKER

**Voice assessment**: Highly distinctive. The ledger/leverage/negotiation lexicon is consistent and well-deployed. The moral ambiguity — *is this leverage or is this care?* — is threaded through examining_loss_item particularly well. You would know this is the Broker.

**Blind test result**: STRONG PASS

### Flag 1 — Generic voice

`in_danger / community`: `"Danger. You assess the power balance. You find where you have the edge. You use it."` — the three-clause imperative structure is more Enforcer than Broker. The Broker finds leverage, but they do it through reading people and situations, not through tactical sequencing.

`in_danger / identity`: `"Something's wrong. Your body catalogued it. Your mind is catching up."` — this is Scout or Reclaimer voice, not Broker. The Broker reads *people* and *power dynamics*, not their own proprioception.

`pressure_spike / community`: `"The intelligence is bad here. You read bad intelligence. Adjust accordingly."` — "intelligence" as a military/tactical term is Enforcer. The Broker reads *tells*, *dynamics*, *leverage shifts*, not intelligence.

### Flag 2 — Repeated sentiment

`post_combat`: All 5 variants open with `"You read the fear in their eyes before the end."` This is a strong anchor line. However, the follow-up structure across all variants is: "you catalogued it / filed it / used it." The difference between losing a child vs. a partner vs. a community in how a Broker reads a dying person's fear is more interesting than what's currently there.

`in_danger`: All variants say "you read the room, it's bad, find the leverage/exit." The Broker's specific texture — *reading people before reading rooms*, noticing body language, micro-tells — is underrepresented in in_danger, which ironically is the trigger most suited to it.

`examining_loss_item`: `"Leverage. Everything is leverage if you know how to hold it."` appears as line 1 for `child`, `partner`, `community`, `identity`, and `promise`. Like Wraith's "Secrets recognize their own," this anchor is overused. The variants that subvert it (`"Leverage. Everything is leverage. Except this. Not this."` for partner, `"Leverage. This is leverage. You've known that from the beginning."` for promise) are the strongest — but only because they break from the pattern. If the line opens every pool, the break lands flat.

### Flag 3 — Tone mismatch

`safe_rest / partner`: `"The ledger is never balanced. You used to be okay with that."` — good Broker voice. The loss of okayness is the emotional texture.

`safe_rest / community`: `"Safe. You let yourself believe it. You run the accounts while you do."` — "run the accounts" is the right idiom. Slightly undermined by the generic "You let yourself believe it" opener (every class says some version of this).

`pressure_spike / promise`: `"Elevated threat. New variables in the deal. The promise is still the floor."` — "Elevated threat" is Reclaimer/Enforcer vocabulary. The Broker would frame rising danger in negotiating terms: *the price just went up*, *the counterparty changed*, *the room shifted*.

### Flag 4 — Thin pools

`act_transition`: 2 lines per personalLoss. **THIN.**
`pressure_spike`: 2 lines per personalLoss. **THIN.** Both triggers need a third line that uses the Broker's people-reading rather than generic threat-awareness.

### Flag 5 — Personal loss integration

- `partner`: `"The deal you didn't make. The price you didn't pay. You've thought about that trade for a long time."` (examining_loss_item) — excellent. The Broker's regret as an unmade deal is the exact right framing.
- `partner`: `"You note what worked. There are things you don't note. You give yourself that."` (post_combat) — strong. The deliberate non-cataloguing is more emotionally present than cataloguing would be.
- `community`: `"The community entries are the longest column."` (safe_rest) — precise and good.
- `identity`: `"Some of the accounts have no names yet."` (safe_rest) — excellent. The Broker framing applied to unknown identity is one of the more inventive loss-integration moments across all 7 files.
- `child`: The child-Broker is underdeveloped. The framing of "I didn't know I was trading until I'd already traded" (examining_loss_item/child) is the strongest child line, but it's the only one that achieves real specificity. Low_hp and post_combat child lines read generically.
- `promise`: Promise Broker lines treat the promise as a contract with a clear counterparty, which is appropriate. `"The deal isn't closed. You don't die before the deal closes."` is strong.

### Suggested improvements

- `examining_loss_item`: Differentiate line 1 across personalLoss variants. Only the partner and promise variants earn the `"Leverage. Everything is leverage..."` subversion. Write distinct openers for child, community, and identity.
- `in_danger / identity`: Replace the Scout-voiced proprioceptive line with something people-reading: e.g., `"Something's wrong. You'd need to know whose tell this is. Find out fast."` 
- `pressure_spike`: Expand to 3 lines using negotiation vocabulary: *counterparty*, *price*, *room temperature*, *tells*, *leverage shifting*. e.g., `"The room's temperature dropped. Someone just gained power in here. Find out who."` (community), `"The tells changed. Someone is about to make a move they've been planning for a while."` (child)
- `act_transition`: Add a third line framed as a new negotiating environment: e.g., `"The deal structure changed. You read the new power map. You find the new edge."` — but loss-specific.

---

## Cross-Class Findings

### 1. The act_transition problem

Every single class has 2-line pools for act_transition and pressure_spike. This is a structural problem: these are recurring triggers (act_transition fires at every major story beat) and players will hear these lines repeatedly. All 14 act_transition pools across 7 classes need a third line.

**Priority order for expansion**: Shepherd (strongest unique framing, most wasted), Warden (clearest dramatic opportunity), Broker (most room for people-reading texture), Enforcer (needs loss-specific variation), Scout/Reclaimer (need differentiation from each other), Wraith (current 2-liners are already good; least urgent).

### 2. The promise personalLoss is the thinnest across all classes

The `promise` personalLoss consistently produces the least differentiated lines. Across most triggers, promise variants resolve to: "[class-specific idiom] + the promise still matters + keep moving." This formula is structurally identical across Enforcer, Scout, Reclaimer, Warden, and Shepherd. 

The promise personalLoss needs a more specific emotional texture: *what was the promise*, *who was it made to*, *what has keeping it cost*. Currently it reads as motivation rather than loss. The player chose "promise" as their personal loss — that means the promise itself is broken or broken-adjacent. The lines should feel like someone living with a vow they took in a moment of desperation that now defines every action they take, often against their own interest.

### 3. The "something's wrong" opening

More than 30 lines across all 7 classes open with "Something's wrong" or "Something is wrong." This is the most generic possible in_danger or pressure_spike opener. Every class needs at least one variant that opens differently — with their specific mode of reading danger. For Shepherd, danger smells like infection. For Wraith, danger has weight. For Broker, danger has a tell. The generic opener flattens these distinctions.

### 4. Scout-Reclaimer bleed

The two most analytically-voiced classes are not sufficiently differentiated. Players who encounter both will not consistently hear distinct internal voices. This requires more than line-level fixes; the underlying vocabulary split needs to be enforced:

| Domain | Scout | Reclaimer |
|---|---|---|
| Primary metaphor | terrain, pattern, track, read | system, log, subroutine, error, archive |
| Self-reference | body, instinct, training | process, operational status, maintenance |
| Threat reading | "the pattern is wrong" | "the system is failing" |
| Rest | calibrated sleep, internal clock | maintenance window, diagnostic |
| Grief | evidence reconstruction | corrupted data, unprocessable input |

Every line that crosses this boundary should be rewritten.

### 5. "The promise is still intact. Keep moving."

This exact formulation (or near-identical variants) appears in post_combat/promise for Enforcer, Shepherd, Reclaimer, and Warden. It should appear in at most one class — whichever one it fits best (Warden or Enforcer). The other three need class-specific post_combat/promise lines.

---

## Priority Fixes (Ranked)

1. **CRITICAL**: Differentiate Reclaimer from Scout — full vocabulary audit, rewrite all lines that could be said by either class
2. **HIGH**: Expand all act_transition and pressure_spike pools from 2 lines to 3 lines (all 7 classes)
3. **HIGH**: Differentiate "Leverage." / "Secrets recognize their own." anchor lines — each should appear in at most 2 personalLoss variants, not all 5
4. **HIGH**: Audit all `promise` personalLoss lines for emotional specificity — "promise still intact, keep moving" is not a loss
5. **MEDIUM**: Replace all generic "something's wrong" openers with class-specific threat-reading idioms
6. **MEDIUM**: Deepen `child` personalLoss across Enforcer, Scout, and Broker — currently the least differentiated loss
7. **LOW**: Remove cross-class phrase contamination ("The promise is still intact. Keep moving." in 4 class files, "standard procedure" in Shepherd and Warden, "the data" in Scout and Reclaimer)

---

*Audit complete. 7 files reviewed, 8 triggers per class, 5 personalLoss variants per trigger.*
