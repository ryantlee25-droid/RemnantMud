// ============================================================
// lib/actions/examine.ts — handleExamineExtra
// Handles "look <keyword>" — examines room extras by keyword.
// ============================================================

import type { EngineCore } from '@/lib/actions/types'
import type { Player } from '@/types/game'
import { weightedRoll } from '@/lib/spawn'
import { getStatForSkill } from '@/lib/skillBonus'
import { handleLook } from '@/lib/actions/movement'
import { msg, systemMsg, errorMsg } from '@/lib/messages'
import { getTimeOfDay } from '@/lib/gameEngine'

// ------------------------------------------------------------
// handleExamineExtra
// ------------------------------------------------------------

export async function handleExamineExtra(engine: EngineCore, keyword?: string): Promise<void> {
  const { currentRoom } = engine.getState()
  if (!currentRoom) return

  if (!keyword) {
    // No keyword — just do a regular look
    engine._appendMessages([msg(currentRoom.description)])
    return
  }

  const extras = currentRoom.extras ?? []
  const kw = keyword.toLowerCase().trim()

  // Find matching extra
  const match = extras.find(ex =>
    ex.keywords.some(k => k.toLowerCase().includes(kw) || kw.includes(k.toLowerCase()))
  )

  if (!match) {
    // No room extra matched — fall through to general look which checks
    // enemies, items, inventory, and NPCs by name
    await handleLook(engine, keyword)
    return
  }

  // Check if this extra sets charon_choice and the player already chose
  const { player } = engine.getState()
  if (match.questFlagOnSuccess) {
    const flags = Array.isArray(match.questFlagOnSuccess) ? match.questFlagOnSuccess : [match.questFlagOnSuccess]
    const setsCharonChoice = flags.some(f => f.flag === 'charon_choice')
    if (setsCharonChoice && player?.questFlags?.charon_choice) {
      engine._appendMessages([msg('The decision has been made. There is no going back.')])
      return
    }
  }

  // Check cycle gate
  if (match.cycleGate && (player?.cycle ?? 1) < match.cycleGate) {
    engine._appendMessages([msg(`You notice something about the ${keyword}, but can't make sense of it yet.`)])
    return
  }

  // Check quest gate
  if (match.questGate) {
    const flags = player?.questFlags ?? {}
    if (!flags[match.questGate]) {
      engine._appendMessages([msg(`You examine it closely, but you don't have enough context to understand what you're seeing.`)])
      return
    }
  }

  // Get description (pool or single)
  let description: string
  if (match.descriptionPool && match.descriptionPool.length > 0) {
    const available = match.descriptionPool.filter(
      e => !e.cycleGate || (player?.cycle ?? 1) >= e.cycleGate
    )
    if (available.length === 0) {
      description = match.description ?? `You examine the ${keyword} carefully.`
    } else {
      description = weightedRoll(available.map(e => ({ ...e, weight: e.weight }))).desc
    }
  } else {
    description = match.description ?? `You examine the ${keyword} carefully.`
  }

  engine._appendMessages([msg(description)])

  // Skill check bonus text
  if (match.skillCheck) {
    const { skill, dc, successAppend } = match.skillCheck
    const playerStat = getStatForSkill(skill, player)
    if (playerStat !== null) {
      const roll = Math.floor(Math.random() * 10) + 1 + playerStat
      const skillLabel = skill.replace(/_/g, ' ')
      const capitalizedSkill = skillLabel.charAt(0).toUpperCase() + skillLabel.slice(1)
      if (roll >= dc) {
        engine._appendMessages([systemMsg(`[${capitalizedSkill} check succeeded]`)])
        engine._appendMessages([msg(successAppend)])

        // Set quest flag(s) on successful skill check if configured
        if (match.questFlagOnSuccess) {
          const flags = Array.isArray(match.questFlagOnSuccess) ? match.questFlagOnSuccess : [match.questFlagOnSuccess]
          for (const { flag, value } of flags) {
            await engine.setQuestFlag(flag, value)
          }
        }
        // Grant reputation on successful skill check if configured
        if (match.reputationGrant) {
          await engine.adjustReputation(match.reputationGrant.faction, match.reputationGrant.delta)
        }
        // Grant narrative key on successful skill check if configured
        if (match.narrativeKeyOnExamine) {
          await engine.grantNarrativeKey(match.narrativeKeyOnExamine, 'examination')
        }
        // Deduction grant: only fires when all prereq flags are set. After any
        // quest flag updates above, check whether this examination completes a deduction.
        if (match.narrativeKeyOnDeduction) {
          const { keyId, requires } = match.narrativeKeyOnDeduction
          const currentFlags = engine.getState().player?.questFlags ?? {}
          if (requires.every(f => currentFlags[f])) {
            await engine.grantNarrativeKey(keyId, 'deduction')
          }
        }
      } else {
        // Failure feedback — close miss if within 2 of DC
        const diff = dc - roll
        if (diff <= 2) {
          engine._appendMessages([systemMsg(`[${capitalizedSkill} check failed (close) — you almost understood, but not quite]`)])
        } else {
          engine._appendMessages([systemMsg(`[${capitalizedSkill} check failed — you'd need more expertise to understand this]`)])
        }
      }
    }
  }

  // Set quest flag(s) on examine if no skill check required
  if (!match.skillCheck && match.questFlagOnSuccess) {
    const flags = Array.isArray(match.questFlagOnSuccess) ? match.questFlagOnSuccess : [match.questFlagOnSuccess]
    for (const { flag, value } of flags) {
      await engine.setQuestFlag(flag, value)
    }
  }

  // Grant narrative key on examine if no skill check required
  if (!match.skillCheck && match.narrativeKeyOnExamine) {
    await engine.grantNarrativeKey(match.narrativeKeyOnExamine, 'examination')
  }

  // Deduction grant on free examine: only fires when all prereq flags are set
  if (!match.skillCheck && match.narrativeKeyOnDeduction) {
    const { keyId, requires } = match.narrativeKeyOnDeduction
    const currentFlags = engine.getState().player?.questFlags ?? {}
    if (requires.every(f => currentFlags[f])) {
      await engine.grantNarrativeKey(keyId, 'deduction')
    }
  }
}

// ------------------------------------------------------------
// handleSmell
// Handles "smell [noun]" — sensory impression of the room or a target.
// ------------------------------------------------------------

export async function handleSmell(engine: EngineCore, noun: string): Promise<void> {
  const { currentRoom } = engine.getState()
  if (!currentRoom) return

  const target = noun.toLowerCase().trim()

  if (target) {
    // Check room extras for a matching keyword
    const extras = currentRoom.extras ?? []
    const match = extras.find(ex =>
      ex.keywords.some(k => k.toLowerCase().includes(target) || target.includes(k.toLowerCase()))
    )
    if (match) {
      engine._appendMessages([msg(`You lean in and sniff. ${match.description ?? `Nothing remarkable about the smell of the ${target}.`}`)])
    } else {
      engine._appendMessages([msg(`You don't notice anything particular about that.`)])
    }
    return
  }

  // No target — generate atmospheric smell based on zone
  const zone = currentRoom.zone
  let scent: string
  if (zone === 'crossroads' || zone === 'river_road') {
    scent = 'Dust, rust, and the faint sweetness of decay.'
  } else if (zone === 'the_ember') {
    scent = 'Ash and burning chemicals. The air itself feels singed.'
  } else if (zone === 'the_deep') {
    scent = 'Wet rock and something organic. Cold, mineral air.'
  } else if (zone === 'the_scar') {
    scent = 'Sterile. Chemical. Like a hospital that forgot to die.'
  } else if (zone === 'salt_creek') {
    scent = 'Gun oil, sweat, and campfire smoke.'
  } else if (zone === 'covenant') {
    scent = 'Bread baking, soap, and the sharp tang of disinfectant.'
  } else {
    scent = 'The air carries the flat mineral smell of the wasteland.'
  }

  engine._appendMessages([msg(scent)])
}

// ------------------------------------------------------------
// handleListen
// Handles "listen [noun]" — ambient sounds of the room or a target.
// ------------------------------------------------------------

export async function handleListen(engine: EngineCore, noun: string): Promise<void> {
  const { currentRoom, player } = engine.getState()
  if (!currentRoom) return

  const target = noun.toLowerCase().trim()

  if (target) {
    const extras = currentRoom.extras ?? []
    const match = extras.find(ex =>
      ex.keywords.some(k => k.toLowerCase().includes(target) || target.includes(k.toLowerCase()))
    )
    if (match) {
      engine._appendMessages([msg(`You go still and listen. ${match.description ?? `The ${target} offers nothing distinct to the ear.`}`)])
    } else {
      engine._appendMessages([msg(`You don't notice anything particular about that.`)])
    }
    return
  }

  // No target — try ambient sound pool first
  const tod = getTimeOfDay(player?.actionsTaken ?? 0)
  const pool = currentRoom.environmentalRolls?.ambientSoundPool?.[tod]
  if (pool && pool.length > 0) {
    const nonNull = pool.filter(e => e.sound !== null)
    if (nonNull.length > 0) {
      const entry = weightedRoll(nonNull.map(e => ({ ...e, weight: e.weight })))
      if (entry.sound) {
        engine._appendMessages([msg(entry.sound)])
        return
      }
    }
  }

  // Fallback by zone
  const zone = currentRoom.zone
  let sound: string
  if (zone === 'the_deep') {
    sound = 'Dripping water. The creak of settling stone. Your own breathing.'
  } else if (zone === 'the_scar') {
    sound = 'Hum of dormant machinery. Ventilation cycling. Nothing alive.'
  } else {
    sound = 'Wind. Distance. The small sounds of a world continuing without you.'
  }

  engine._appendMessages([msg(sound)])
}

// ------------------------------------------------------------
// handleTouch
// Handles "touch [noun]" — tactile impression of the room or a target.
// ------------------------------------------------------------

export async function handleTouch(engine: EngineCore, noun: string): Promise<void> {
  const { currentRoom } = engine.getState()
  if (!currentRoom) return

  const target = noun.toLowerCase().trim()

  if (target) {
    const extras = currentRoom.extras ?? []
    const match = extras.find(ex =>
      ex.keywords.some(k => k.toLowerCase().includes(target) || target.includes(k.toLowerCase()))
    )
    if (match) {
      engine._appendMessages([msg(`You reach out and touch it. ${match.description ?? `The ${target} is unremarkable under your fingers.`}`)])
    } else {
      engine._appendMessages([msg(`You don't notice anything particular about that.`)])
    }
    return
  }

  // No target — describe surfaces by zone
  const zone = currentRoom.zone
  let feel: string
  if (zone === 'the_deep') {
    feel = 'The walls are cold and damp to the touch. Condensation beads under your fingers.'
  } else if (zone === 'the_scar') {
    feel = 'The walls are smooth and slightly warm. Whatever built this place ran hot.'
  } else if (zone === 'covenant') {
    feel = 'Rough-cut timber and planed boards, sanded smooth by many hands.'
  } else if (zone === 'the_ember') {
    feel = 'Surfaces are gritty with ash. Everything carries a faint residual warmth.'
  } else if (zone === 'salt_creek') {
    feel = 'Rough concrete and corrugated metal. The edges are sharp if you press too hard.'
  } else {
    feel = 'Cracked asphalt and weather-scoured stone. The texture of a world left to its own devices.'
  }

  engine._appendMessages([msg(feel)])
}

// ------------------------------------------------------------
// handleExamineSpatial
// Handles "look under/behind/inside <target>" — spatial examination.
// ------------------------------------------------------------

export async function handleExamineSpatial(engine: EngineCore, noun: string): Promise<void> {
  const { currentRoom } = engine.getState()
  if (!currentRoom) return

  const parts = noun.toLowerCase().trim().split(/\s+/)
  const [preposition, ...targetWords] = parts
  const target = targetWords.join(' ')

  if (!target) {
    engine._appendMessages([msg(`${preposition} what?`)])
    return
  }

  // Check room extras for the target object
  const extras = currentRoom.extras ?? []
  const match = extras.find(ex =>
    ex.keywords.some(k => k.toLowerCase().includes(target) || target.includes(k.toLowerCase()))
  )

  if (match && match.description) {
    // Room has specific content for this object — prefix with spatial framing
    const prefix =
      preposition === 'under' ? `You crouch and look under the ${target}.` :
      preposition === 'behind' ? `You peer behind the ${target}.` :
      preposition === 'inside' ? `You look inside the ${target}.` :
      `You examine ${preposition} the ${target}.`
    engine._appendMessages([msg(`${prefix} ${match.description}`)])
    return
  }

  // Atmospheric fallbacks for well-known features
  const richTargets: Record<string, Partial<Record<string, string>>> = {
    under: {
      table: 'You crouch and look under the table. Boot scuffs on the floor. A dried ring where someone spilled something long ago.',
      desk: 'You crouch and look under the desk. Dust and a single shell casing.',
      bed: 'You look under the bed. Dust, a folded scrap of cloth, and the dark.',
      crate: 'You crouch and look under the crate. The floor is stained where it\'s sat for years.',
      corpse: 'You crouch and check under the body. Nothing hidden beneath it but blood and dirt.',
      vehicle: 'You drop low and check under the vehicle. Dried oil pooled on the concrete.',
    },
    behind: {
      door: 'You peer behind the door. A hook, bare. A streak of rust where something used to hang.',
      desk: 'You look behind the desk. Scuff marks on the wall where it\'s been pushed back and forth.',
      crate: 'You peer behind the crate. Dust and a faded spray-paint mark — a crude arrow pointing at nothing.',
      cabinet: 'You look behind the cabinet. Decades of settled dust and a dead spider.',
      corpse: 'You check behind the body. Nothing there.',
    },
    inside: {
      cabinet: 'You open the cabinet. Empty shelves. The smell of old wood and something chemical.',
      crate: 'You look inside the crate. Empty. Whatever was here has been picked clean.',
      locker: 'You check inside the locker. A wire hanger, a torn scrap of paper, nothing else.',
      desk: 'You check inside the desk drawer. Empty.',
      vehicle: 'You peer inside. Stripped to the frame. Someone got here first.',
    },
  }

  const prepMap = richTargets[preposition]
  if (prepMap) {
    // Try each target word against known rich targets
    for (const word of targetWords) {
      if (prepMap[word]) {
        engine._appendMessages([msg(prepMap[word]!)])
        return
      }
    }
  }

  // Generic fallbacks by preposition
  if (preposition === 'under') {
    engine._appendMessages([msg(`You crouch and look under the ${target}. Nothing but dust and shadows.`)])
  } else if (preposition === 'behind') {
    engine._appendMessages([msg(`You peer behind the ${target}. Nothing hidden.`)])
  } else if (preposition === 'inside') {
    engine._appendMessages([msg(`You look inside the ${target}. Empty.`)])
  } else {
    engine._appendMessages([msg(`You examine ${preposition} the ${target}. Nothing of note.`)])
  }
}
