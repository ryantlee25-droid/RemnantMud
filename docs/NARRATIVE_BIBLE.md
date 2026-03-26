# THE REMNANT — Narrative Bible

> Canonical reference. Do not modify without updating PLAN.md.
> Connects to: World Bible, Room Display Spec, RNG System.

See full document in project inception notes. Key mechanical implications for implementation:

## Arc Characters Already Built
- Wren Calloway (wren_shelter → wren_ruins → wren_wastes → wren_underground) — in data/npcs.ts
  - Carries suppressed CHARON-7 Theta cylinder = Layer 3 of central mystery
- Dr. Ama Osei — The Last Doctor thread (TODO: add to npcs.ts)

## Zones Required
- Zones 1-5: shelter, ruins, wastes, outpost, underground (BUILT)
- Zone 6: The Scar (surface approach) (TODO: Act III)
- Zone 7: MERIDIAN facility (underground, multi-level) (TODO: Act III)

## Endgame States
- The Cure, The Weapon, The Seal, The Throne (TODO: Act III)

## Personal Loss Types (stored in players.personal_loss_type)
- 'child' | 'partner' | 'community' | 'identity' | 'promise'
- players.personal_loss_detail = player-written or selected text

## Prologue
- Shown once per account before character creation
- Tracked via players.saw_prologue (set after character creation begins)
- Pre-auth: tracked via localStorage key 'remnant_saw_prologue'

## The Squirrel
- A mutant squirrel. Three eyes. Moves wrong. Disturbingly aware for a rodent.
- Behaves like a dog — follows if fed, disappears if mistreated, does something that matters late game
- No stats, no combat utility. Tracks kindness via players.squirrel_trust (0-100)
- Appears in shelter zone on first visit, sitting on a collapsed wall, staring
- Does not talk. Makes sounds that are almost words. Probably coincidence.
- TODO: implement after core systems stable

## Letters Home
- Collectible items (type: 'letter') with no mechanical value
- TODO: add to items.ts after NPC/room system stable

## Radio Signal Fragments
- Collectible items (type: 'document') that assemble the broadcaster's story
- Order of discovery changes interpretation
- TODO: implement with The Scar zone

## The Final Line
"What's left is what matters." — delivered as closing narrative message in all endgame states
