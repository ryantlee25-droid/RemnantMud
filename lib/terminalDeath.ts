// ============================================================
// terminalDeath.ts — Death, ending, between-cycles, and prologue
// narratives delivered as GameMessage[] arrays for the terminal.
//
// Replaces screen-takeover components:
//   DeathScreen.tsx, EndingScreen.tsx, TheBetween.tsx, Prologue.tsx
//
// No React imports. Pure TypeScript. Framework-agnostic.
// ============================================================

import type { GameMessage } from '@/types/game'
import { msg } from '@/lib/messages'
import { echoRetentionFactor } from '@/lib/fear'

// ------------------------------------------------------------
// Constants moved from deleted components
// ------------------------------------------------------------

const CAUSE_LABELS: Record<string, string> = {
  combat:        'KILLED IN COMBAT',
  infection:     'CONSUMED BY INFECTION',
  environmental: 'CLAIMED BY THE ENVIRONMENT',
}

function causeLabel(cause: string): string {
  return CAUSE_LABELS[cause] ?? cause.toUpperCase()
}

const DEATH_NARRATIVE =
  'The Revenant effect is not resurrection. That word implies ' +
  'something sacred. What happens to you is more like a document ' +
  'being restored from an older backup -- some edits lost, some ' +
  'corruptions introduced, the file a little smaller each time. ' +
  'CHARON-7 does not bring you back. It reconstructs something ' +
  'that can pass for you.\n\n' +
  'Each cycle you are a little less certain which memories are yours. ' +
  'Each cycle the violence comes a little more naturally. The virus ' +
  'is not keeping you alive out of mercy. It is keeping you alive ' +
  'because you are useful to it, and it has not finished deciding what for.'

const ENDING_TITLES: Record<string, string> = {
  cure:   'THE CURE',
  weapon: 'THE WEAPON',
  seal:   'THE SEAL',
  throne: 'THE THRONE',
}

const ENDING_NARRATIVES: Record<string, string[]> = {
  cure: [
    'The modified R-1 compound moves through the atmosphere like a rumor -- invisible, inevitable, touching everything it reaches. Within weeks, the Hollow begin to stir. Not violently. Slowly. Like sleepers surfacing from a dream they cannot name. They blink. They look at their hands. Some of them remember their names. Most do not.',
    'The Sanguine feel it first as a numbness in the extremities, then as a narrowing of the senses they had grown to trust. Night vision dims. The preternatural hearing flattens to merely human. The Covenant of Dusk holds an emergency conclave and the vote is split: half call it liberation, half call it murder by another name. The Red Court calls it war, but by the time they mobilize, the war is already over. You cannot fight a cure.',
    'The Accord deploys medical teams to the regions where the Hollow are waking -- thousands of people with seven years of absence behind their eyes, standing in a world that moved on without them. The Reclaimers build shelters. The Kindling hold vigils. The Salters, for once, open their gates.',
    'Years from now, someone will write the history of what you did. They will call it a mercy. You will call it something else. The name doesn\'t matter anymore. You made it because you believed it was right, and you will never be certain, and that uncertainty is the price of having been the one who decided. The world heals. The scars remain. The silence of consent never given settles over everything -- the Hollow waking into lives they did not choose to leave, the Sanguine diminished by a formula they never agreed to. The world wakes different. Whether it wakes better is not yours to say.',
  ],
  weapon: [
    'The pathogen is elegant in its cruelty. It finds CHARON-7 wherever it hides -- in the neural tissue of the Hollow, in the enhanced blood of the Sanguine, in the subclinical traces carried by sixty percent of the surviving human population. Thirty days. The timeline is precise. The dying is not.',
    'The Hollow go first, and no one mourns them because no one knew they were still in there. The Sanguine go next, and the Covenant of Dusk burns its own archives rather than let the Accord find them. The carriers -- the farmers, the traders, the children who played too close to the wrong water source -- they go last, and by then the world has stopped counting.',
    'The Accord inherits a continent emptied of its most dangerous elements and most of its people. Marshal Cross calls it "the hard peace." The Salters close their gates and do not open them for a year. The Kindling stop lighting their signal fires. The Drifters, who were everywhere and nowhere, are mostly nowhere now.',
    'You did the math. The math was correct. The weapon worked exactly as described, and the silence it left behind is the specific quiet of absence, not peace. Historians will call you a monster or a savior depending on which side of the population curve they stand on. You will call yourself nothing, because you do not owe the dead an explanation. The world survives. It is quieter than it should be. The quiet that follows is not the quiet of a wound healing. It is the quiet of a room where someone was, and then was not.',
  ],
  seal: [
    'The shaped charges fire in sequence -- a controlled cascade that turns MERIDIAN into calcium powder and slag in ninety seconds. The data dies. The samples die. The formula that could have cured or killed or ruled dies with them. The broadcaster stays inside. They do not run. They knew, when they gave you the choice, what SEAL meant for them.',
    'The crater fills with new rubble. The chemical haze thickens for a week, then thins. The Scar heals the way scars do -- slowly, imperfectly, leaving a mark that tells the story of what happened there. The factions learn, eventually, that MERIDIAN is gone. The Accord sends an expedition. They find nothing usable.',
    'The Hollow remain what they are. The Sanguine remain what they are. The world remains exactly as broken as it was the day you walked into the Scar, and must find its own way from here -- the slow, grinding, human way, without shortcuts or silver bullets or someone else\'s formula to solve it for them.',
    'You chose to trust the world with its own problems. Some will call it cowardice. Some will call it wisdom. The broadcaster called it "the quietest option" and they were right -- it is the choice that makes the least noise and changes the least, and asks the most of everyone who comes after. The world continues. It does not thank you. The rubble settles. The mountain closes its mouth. Somewhere beneath a thousand tons of calcium powder and silence, the formula that could have changed everything becomes geology.',
  ],
  throne: [
    'MERIDIAN locks around you like a second skin. The facility\'s systems recognize your biometrics, your neural pattern, the specific signature of your CHARON-7 strain. You are the gatekeeper now. The data is yours. The formula is yours. The leverage is absolute.',
    'The factions learn within weeks. The Accord sends diplomats first, then soldiers, then diplomats again when the soldiers do not return. The Salters offer trade agreements written in language so careful it takes three readings to find the threats. The Covenant of Dusk sends a single emissary -- an old Sanguine who looks at you for a long time and says nothing, then leaves.',
    'You hold the cure that could heal the Hollow and strip the Sanguine. You hold the weapon that could end CHARON-7 and most of its carriers. You hold the seal that could destroy it all. You hold all four options in your hands, and every day you do not choose is a choice in itself -- the choice to remain the gatekeeper, to keep the world balanced on the edge of your decision.',
    'Power is not what you expected. It is not dramatic. It is the specific weight of being the person everyone needs something from, and knowing that whatever you give them will be wrong in some way you cannot predict. The broadcaster watches from the next room and says nothing. They have seen this before. The world orbits you now, and you orbit the data, and the data does not care. You hold a key that opens everything. The room it locks you in is the loneliest in the world.',
  ],
}

export const MEMORY_POOL: string[] = [
  'The smell of rust and rain through a cracked ventilation shaft.',
  'A voice saying your name, from someone whose face you can\'t keep.',
  'The weight of the pack on your shoulders. The specific ache of it.',
  'A door you meant to open. You never went back.',
  'Something small and three-eyed watching you from a wall.',
  'The sound of a child\'s shoe scraping concrete somewhere ahead.',
  'Your own handwriting on a wall, in a language you no longer speak.',
  'A moment of warmth that had no source.',
  'The exact shade of sky the morning before everything changed.',
  'Someone calling out a name that might be yours.',
  'The weight of a promise you made and the specific way you broke it.',
  'Blood that wasn\'t yours on your hands and the memory of how it got there.',
  'A radio still playing in an empty house. The song almost familiar.',
  'The last time you laughed. You can\'t recover what was funny.',
  'A staircase you descended in the dark, counting steps that weren\'t all there.',
  'Someone\'s handprint in dust on a window. Smaller than yours.',
  'The feeling of running toward something rather than away from it. Brief.',
  'A map you drew that was wrong in exactly one place. That was the place.',
]

const PROLOGUE_LINES: string[] = [
  "You don't remember the exact day the world ended. Nobody does.",
  "",
  "It wasn't a bomb. It wasn't a war. It wasn't the kind of catastrophe that announces itself with fire and thunder and gives you the dignity of knowing, in the moment, that everything has changed.",
  "",
  "It was a cough.",
  "",
  "Someone coughed in a hallway in a building that didn't officially exist, in a mountain range in southwestern Colorado, and within six weeks, sixty percent of the human race had stopped being human in any way that mattered.",
  "",
  "They called the pathogen CHARON-7. The ferryman. The thing that carries you across.",
  "",
  "Most of the infected became the Hollow -- stripped down to hunger and reflex, walking through the ruins of their own lives with just enough memory to make them terrible. Your neighbor fumbling with his car keys forever. A teacher still standing at a chalkboard in an empty school, writing the same word over and over. You can still see who they were.",
  "",
  "One in ten thousand didn't become Hollow. They became something faster, stronger, dependent on human blood to stay that way. People call them vampires. They call themselves the Sanguine.",
  "",
  "That was seven years ago. The highways are rivers of weeds. The cities are tombs. What's left is us -- the Unturned -- here in the Four Corners, where the mountains and the desert and the canyons gave us something to put our backs against.",
  "",
  "You have a pack. A knife. No faction, no reputation, no allegiance. No one owns you. No one is hunting you.",
  "",
  "Not yet.",
  "",
  "Somewhere in the mountains to the north, buried under rock and silence and seven years of secrets, there is a place called the Scar -- the place where CHARON-7 was born -- and someone, somewhere, believes that what was made there can be unmade.",
  "",
  "You don't know if that's true. Nobody does.",
  "",
  "But you're going to find out. Because that's what survivors do. They move forward. Even when forward is dark. Even when forward is teeth.",
  "",
  "Welcome to The Remnant.",
  "",
  "What's left is what matters.",
]

// ------------------------------------------------------------
// Utility
// ------------------------------------------------------------

function pickFragments(count: number): string[] {
  const shuffled = [...MEMORY_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

const RULE = '\u2550'.repeat(38)  // ══════════════════════════════════════

// ------------------------------------------------------------
// deathMessages
// ------------------------------------------------------------

export function deathMessages(opts: {
  cycle: number
  xpGained: number
  roomsExplored: number
  causeOfDeath: string
  echoStats?: Record<string, unknown>
  stashCount?: number
  questMilestones?: string[]
}): GameMessage[] {
  const messages: GameMessage[] = []

  // Header block
  messages.push(msg(
    `${RULE}\n  YOU ARE DEAD\n${RULE}`,
    'death'
  ))

  // Cause of death
  messages.push(msg(causeLabel(opts.causeOfDeath), 'death'))

  // Narrative
  messages.push(msg(DEATH_NARRATIVE, 'death'))

  // Stats
  const statsLines = [
    `Cycle: ${opts.cycle}  |  Rooms: ${opts.roomsExplored}  |  XP: ${opts.xpGained.toLocaleString()}`,
  ]
  messages.push(msg(statsLines.join('\n'), 'death'))

  // What carries forward
  const carryLines: string[] = []

  if (opts.echoStats) {
    const es = opts.echoStats as Record<string, number>
    const parts: string[] = []
    if (es.vigor)   parts.push(`VIG +${es.vigor}`)
    if (es.grit)    parts.push(`GRT +${es.grit}`)
    if (es.reflex)  parts.push(`REF +${es.reflex}`)
    if (es.wits)    parts.push(`WIT +${es.wits}`)
    if (es.presence) parts.push(`PRS +${es.presence}`)
    if (es.shadow)  parts.push(`SHD +${es.shadow}`)
    if (parts.length > 0) {
      carryLines.push(`  Echo stats: ${parts.join(', ')}`)
    }
  }

  if (opts.stashCount != null && opts.stashCount > 0) {
    carryLines.push(`  Stash: ${opts.stashCount} item${opts.stashCount !== 1 ? 's' : ''} preserved`)
  }

  if (opts.questMilestones && opts.questMilestones.length > 0) {
    carryLines.push(`  ${opts.questMilestones.length} milestone${opts.questMilestones.length !== 1 ? 's' : ''} remembered`)
  }

  if (carryLines.length > 0) {
    messages.push(msg(
      'What carries forward:\n' + carryLines.join('\n'),
      'death'
    ))
  }

  // Echo mechanic explainer — only on first death (cycle 1 -> 2)
  if (opts.cycle === 1) {
    const retentionPct = Math.round(echoRetentionFactor(3) * 100) // grit 3 = base case, roughly 70%
    messages.push(msg(
      `Your stats become echoes. A fraction of every stat you ended this cycle with carries forward — roughly ${retentionPct}% by default, more if your Grit was high. When you create your next character, you will have those echoes pre-allocated, plus fresh points to spend. Each cycle you live longer, you start stronger. The world remembers what you did. So do you.`,
      'death'
    ))
  }

  // Closing
  messages.push(msg('The world is not finished with you.', 'death'))

  // Prompt
  messages.push(msg(
    `Type BEGIN to start a new cycle.\n${RULE}`,
    'death'
  ))

  return messages
}

// ------------------------------------------------------------
// theBetweenMessages
// ------------------------------------------------------------

export function theBetweenMessages(opts: {
  cycle: number
  inheritedFactions?: Record<string, number>
  discoveredRooms?: string[]
  stashItems?: unknown[]
}): GameMessage[] {
  const messages: GameMessage[] = []

  // Header
  messages.push(msg(
    `CYCLE ${opts.cycle}\nTHE BETWEEN`,
    'system'
  ))

  // Intro narrative
  messages.push(msg(
    'You are not dead. You are not alive. CHARON-7 is rebuilding the scaffolding ' +
    'it calls you -- threading proteins back through collapsed tissue, rerouting signals ' +
    'around the damage, reconstructing the shape of your face from whatever record ' +
    'it keeps. It takes time. While it works, you drift.\n' +
    'Some things surface. Most don\'t stay.',
    'system'
  ))

  // Memory fragments
  const fragments = pickFragments(3)
  for (const fragment of fragments) {
    messages.push(msg(`  "${fragment}"`, 'system'))
  }

  // Echo mechanic explainer — only on first rebirth (entering cycle 2)
  if (opts.cycle === 2) {
    const retentionPct = Math.round(echoRetentionFactor(3) * 100) // grit 3 = base case
    messages.push(msg(
      `Your stats become echoes. A fraction of every stat you ended that cycle with carries forward — roughly ${retentionPct}% by default, more if your Grit was high. When you create your next character, you will have those echoes pre-allocated, plus fresh points to spend. Each cycle you live longer, you start stronger. The world remembers what you did. So do you.`,
      'system'
    ))
  }

  // Echoes -- what carries forward
  const echoLines: string[] = []

  if (opts.discoveredRooms && opts.discoveredRooms.length > 0) {
    const count = opts.discoveredRooms.length
    echoLines.push(`${count} room${count !== 1 ? 's' : ''} mapped`)
  }

  if (opts.stashItems && opts.stashItems.length > 0) {
    const count = opts.stashItems.length
    echoLines.push(`${count} item${count !== 1 ? 's' : ''} stashed`)
  }

  if (opts.inheritedFactions) {
    const factionNames = Object.keys(opts.inheritedFactions).filter(
      (f) => opts.inheritedFactions![f] !== 0
    )
    if (factionNames.length > 0) {
      echoLines.push(`Factions remember you: ${factionNames.join(', ')}`)
    }
  }

  if (echoLines.length > 0) {
    messages.push(msg(
      'Echoes:\n' + echoLines.map((l) => `  ${l}`).join('\n'),
      'system'
    ))
  }

  // Wake
  messages.push(msg('You wake.', 'system'))

  // Tip on cycle 2
  if (opts.cycle === 2) {
    messages.push(msg(
      'Tip: Use \'stash [item]\' to preserve items across death. Stashed items survive the cycle.',
      'system'
    ))
  }

  return messages
}

// ------------------------------------------------------------
// endingMessages
// ------------------------------------------------------------

export function endingMessages(opts: {
  choice: string
  cycle: number
  totalDeaths: number
  roomsExplored: number
  xpEarned: number
}): GameMessage[] {
  const messages: GameMessage[] = []
  const title = ENDING_TITLES[opts.choice] ?? opts.choice.toUpperCase()
  const paragraphs = ENDING_NARRATIVES[opts.choice]

  // Header
  messages.push(msg(
    `${RULE}\n  ${title}\n${RULE}`,
    'ending'
  ))

  messages.push(msg(
    'The choice is made. The world responds.',
    'ending'
  ))

  // Narrative paragraphs
  if (paragraphs) {
    for (const paragraph of paragraphs) {
      messages.push(msg(paragraph, 'ending'))
    }
  }

  // Stats
  messages.push(msg(
    [
      `CYCLES: ${opts.cycle}`,
      `DEATHS: ${opts.totalDeaths}`,
      `ROOMS: ${opts.roomsExplored}`,
      `XP: ${opts.xpEarned.toLocaleString()}`,
    ].join('  |  '),
    'ending'
  ))

  // Closing
  messages.push(msg('THE END', 'ending'))
  messages.push(msg('Thank you for playing The Remnant.', 'ending'))
  messages.push(msg('What\'s left is what matters.', 'ending'))

  messages.push(msg(
    `Type BEGIN to initialize a new session.\n${RULE}\nEach ending tells a different story. There are four.`,
    'ending'
  ))

  return messages
}

// ------------------------------------------------------------
// prologueMessages
// ------------------------------------------------------------

export function prologueMessages(): GameMessage[] {
  const messages: GameMessage[] = []

  messages.push(msg('THE REMNANT -- Transmission Log', 'narrative'))

  // Build the prologue as a sequence of messages, grouping
  // non-empty lines into paragraphs separated by blank lines.
  let paragraph: string[] = []

  for (const line of PROLOGUE_LINES) {
    if (line === '') {
      if (paragraph.length > 0) {
        messages.push(msg(paragraph.join('\n'), 'narrative'))
        paragraph = []
      }
    } else {
      paragraph.push(line)
    }
  }
  // Flush remaining
  if (paragraph.length > 0) {
    messages.push(msg(paragraph.join('\n'), 'narrative'))
  }

  // Final prompt — visually separated so it doesn't get lost in the wall of text
  messages.push(msg(
    `${RULE}\n   TYPE SKIP TO BEGIN -- OR PRESS ENTER\n${RULE}`,
    'narrative'
  ))

  return messages
}
