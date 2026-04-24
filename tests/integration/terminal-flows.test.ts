// ============================================================
// Integration tests for terminalCreation.ts and terminalDeath.ts
// ============================================================

import { describe, it, expect } from 'vitest'
import {
  initialCreationState,
  creationPrompt,
  handleCreationInput,
} from '@/lib/terminalCreation'
import {
  deathMessages,
  theBetweenMessages,
  endingMessages,
  prologueMessages,
  MEMORY_POOL,
} from '@/lib/terminalDeath'

// ============================================================
// terminalCreation.ts
// ============================================================

describe('initialCreationState', () => {
  it('starts at the name step', () => {
    const state = initialCreationState()
    expect(state.step).toBe('name')
  })
})

describe('creationPrompt', () => {
  it('returns name prompts on step=name', () => {
    const msgs = creationPrompt({ step: 'name' })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('Enter your name')
  })

  it('returns class list on step=class', () => {
    const msgs = creationPrompt({ step: 'class', name: 'Ada' })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('Select your class')
    expect(text).toContain('[1]')
    expect(text).toContain('[7]')
  })

  it('returns stat allocation UI on step=stats', () => {
    const { nextState } = handleCreationInput({ step: 'class', name: 'Ada' }, '1')
    const msgs = creationPrompt(nextState)
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('Allocate')
    expect(text).toContain('Points remaining')
  })

  it('returns loss options on step=loss_type', () => {
    const msgs = creationPrompt({ step: 'loss_type', name: 'Ada' })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('CHARON-7')
    expect(text).toContain('[1]')
    expect(text).toContain('[5]')
  })

  it('returns confirm summary on step=loss_confirm', () => {
    const state = {
      step: 'loss_confirm' as const,
      name: 'Ada',
      characterClass: 'enforcer' as const,
      stats: { vigor: 4, grit: 2, reflex: 2, wits: 2, presence: 2, shadow: 2 },
      personalLoss: { type: 'child' as const, detail: 'Eli' },
    }
    const msgs = creationPrompt(state)
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('Ada')
    expect(text).toContain('CONFIRM')
  })
})

describe('handleCreationInput — name step', () => {
  it('rejects empty input', () => {
    const { nextState, messages } = handleCreationInput({ step: 'name' }, '')
    expect(nextState.step).toBe('name')
    expect(messages[0].text).toContain('Enter a name')
  })

  it('rejects name longer than 32 characters', () => {
    const { nextState, messages } = handleCreationInput({ step: 'name' }, 'A'.repeat(33))
    expect(nextState.step).toBe('name')
    expect(messages[0].text).toContain('32 characters')
  })

  it('accepts a valid name and advances to class step', () => {
    const { nextState } = handleCreationInput({ step: 'name' }, 'Ada')
    expect(nextState.step).toBe('class')
    expect(nextState.name).toBe('Ada')
  })
})

describe('handleCreationInput — class step', () => {
  const nameState = { step: 'class' as const, name: 'Ada' }

  it('rejects non-numeric input', () => {
    const { nextState, messages } = handleCreationInput(nameState, 'warrior')
    expect(nextState.step).toBe('class')
    expect(messages[0].text).toContain('1 to 7')
  })

  it('rejects out-of-range number', () => {
    const { nextState, messages } = handleCreationInput(nameState, '8')
    expect(nextState.step).toBe('class')
    expect(messages[0].text).toContain('1 to 7')
  })

  it('accepts valid class number and advances to stats step', () => {
    const { nextState } = handleCreationInput(nameState, '1')
    expect(nextState.step).toBe('stats')
    expect(nextState.characterClass).toBe('enforcer')
    expect(nextState.stats).toBeDefined()
  })

  it('initialises stats and freePoints from class definition', () => {
    const { nextState } = handleCreationInput(nameState, '4') // shepherd
    expect(nextState.characterClass).toBe('shepherd')
    expect(nextState.freePoints).toBeGreaterThan(0)
    expect(nextState.stats).toBeDefined()
  })
})

describe('handleCreationInput — stats step', () => {
  function statsState() {
    // Build a valid stats state using class selection
    const { nextState } = handleCreationInput({ step: 'class', name: 'Ada' }, '1')
    return nextState
  }

  it('rejects unknown commands', () => {
    const { nextState, messages } = handleCreationInput(statsState(), 'BOOST VIG')
    expect(nextState.step).toBe('stats')
    expect(messages[0].text).toContain('ADD <stat>')
  })

  it('rejects unknown stat abbreviation', () => {
    const { nextState, messages } = handleCreationInput(statsState(), 'ADD ZZZ')
    expect(nextState.step).toBe('stats')
    expect(messages[0].text).toContain('Unknown stat')
  })

  it('adds a point to a stat', () => {
    const state = statsState()
    const before = state.stats!.vigor
    const { nextState } = handleCreationInput(state, 'ADD VIG')
    expect(nextState.stats!.vigor).toBe(before + 1)
  })

  it('removes a point from a stat above floor', () => {
    const state = statsState()
    // First add one so we have room to remove
    const { nextState: afterAdd } = handleCreationInput(state, 'ADD VIG')
    const { nextState: afterRem } = handleCreationInput(afterAdd, 'REM VIG')
    expect(afterRem.stats!.vigor).toBe(state.stats!.vigor)
  })

  it('rejects DONE when points remain unspent', () => {
    const state = statsState()
    // freePoints > 0 initially for enforcer
    if (state.freePoints! > 0) {
      const { nextState, messages } = handleCreationInput(state, 'DONE')
      expect(nextState.step).toBe('stats')
      expect(messages[0].text).toContain('remaining')
    }
  })

  it('advances to loss_type when all points are spent', () => {
    let state = statsState()
    // Spread points across stats to avoid hitting MAX_STAT cap
    const statCycle: string[] = ['ADD GRT', 'ADD REF', 'ADD WIT', 'ADD PRE', 'ADD SHD']
    let i = 0
    while (true) {
      // Check current remaining via a DONE attempt
      const check = handleCreationInput(state, 'DONE')
      if (check.nextState.step === 'loss_type') {
        state = check.nextState
        break
      }
      // Still points to spend — add to next stat in cycle
      const cmd = statCycle[i % statCycle.length]
      const result = handleCreationInput(state, cmd)
      state = result.nextState
      i++
      if (i > 20) break // safety guard
    }
    expect(state.step).toBe('loss_type')
  })
})

describe('handleCreationInput — loss_type step', () => {
  const lossState = { step: 'loss_type' as const, name: 'Ada', characterClass: 'enforcer' as const }

  it('rejects invalid loss number', () => {
    const { nextState, messages } = handleCreationInput(lossState, '6')
    expect(nextState.step).toBe('loss_type')
    expect(messages[0].text).toContain('1 to 5')
  })

  it('accepts valid loss and advances to loss_detail', () => {
    const { nextState } = handleCreationInput(lossState, '1')
    expect(nextState.step).toBe('loss_detail')
    expect(nextState.personalLoss?.type).toBe('child')
  })
})

describe('handleCreationInput — loss_detail step', () => {
  const detailState = {
    step: 'loss_detail' as const,
    name: 'Ada',
    characterClass: 'enforcer' as const,
    stats: { vigor: 4, grit: 2, reflex: 2, wits: 2, presence: 2, shadow: 2 },
    personalLoss: { type: 'child' as const, detail: '' },
  }

  it('accepts empty detail and advances to loss_confirm', () => {
    const { nextState } = handleCreationInput(detailState, '')
    expect(nextState.step).toBe('loss_confirm')
    expect(nextState.personalLoss?.detail).toBe('')
  })

  it('captures detail text up to 64 characters', () => {
    const { nextState } = handleCreationInput(detailState, 'Eli')
    expect(nextState.personalLoss?.detail).toBe('Eli')
  })
})

describe('handleCreationInput — loss_confirm step', () => {
  const confirmState = {
    step: 'loss_confirm' as const,
    name: 'Ada',
    characterClass: 'enforcer' as const,
    stats: { vigor: 4, grit: 2, reflex: 2, wits: 2, presence: 2, shadow: 2 },
    personalLoss: { type: 'child' as const, detail: 'Eli' },
  }

  it('rejects unrecognised input', () => {
    const { nextState, messages } = handleCreationInput(confirmState, 'yes please')
    expect(nextState.step).toBe('loss_confirm')
    expect(messages[0].text).toContain('CONFIRM')
  })

  it('RESTART resets to name step', () => {
    const { nextState } = handleCreationInput(confirmState, 'RESTART')
    expect(nextState.step).toBe('name')
    expect(nextState.name).toBeUndefined()
  })

  it('CONFIRM completes creation with done flag and valid result', () => {
    const { nextState, done, result } = handleCreationInput(confirmState, 'CONFIRM')
    expect(nextState.step).toBe('done')
    expect(done).toBe(true)
    expect(result).toBeDefined()
    expect(result?.name).toBe('Ada')
    expect(result?.characterClass).toBe('enforcer')
    expect(result?.personalLoss.type).toBe('child')
    expect(result?.stats).toBeDefined()
  })
})

// ============================================================
// terminalDeath.ts
// ============================================================

describe('deathMessages', () => {
  it('returns messages with YOU ARE DEAD header', () => {
    const msgs = deathMessages({ cycle: 1, xpGained: 100, roomsExplored: 5, causeOfDeath: 'combat' })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('YOU ARE DEAD')
  })

  it('displays known cause label', () => {
    const msgs = deathMessages({ cycle: 1, xpGained: 0, roomsExplored: 0, causeOfDeath: 'infection' })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('CONSUMED BY INFECTION')
  })

  it('uppercases unknown cause of death', () => {
    const msgs = deathMessages({ cycle: 2, xpGained: 0, roomsExplored: 0, causeOfDeath: 'drowning' })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('DROWNING')
  })

  it('includes cycle, rooms, and XP stats', () => {
    const msgs = deathMessages({ cycle: 3, xpGained: 1500, roomsExplored: 12, causeOfDeath: 'combat' })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('Cycle: 3')
    expect(text).toContain('Rooms: 12')
  })

  it('shows echo stats when provided', () => {
    const msgs = deathMessages({
      cycle: 1, xpGained: 0, roomsExplored: 0, causeOfDeath: 'combat',
      echoStats: { vigor: 1, wits: 2 },
    })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('VIG +1')
    expect(text).toContain('WIT +2')
  })

  it('shows stash count when provided', () => {
    const msgs = deathMessages({
      cycle: 1, xpGained: 0, roomsExplored: 0, causeOfDeath: 'combat',
      stashCount: 3,
    })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('3 items preserved')
  })

  it('all messages have type "death"', () => {
    const msgs = deathMessages({ cycle: 1, xpGained: 0, roomsExplored: 0, causeOfDeath: 'combat' })
    expect(msgs.every(m => m.type === 'death')).toBe(true)
  })
})

describe('theBetweenMessages', () => {
  it('includes THE BETWEEN header', () => {
    const msgs = theBetweenMessages({ cycle: 2 })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('THE BETWEEN')
    expect(text).toContain('CYCLE 2')
  })

  it('picks 3 memory fragments from the pool', () => {
    const msgs = theBetweenMessages({ cycle: 2 })
    const fragments = msgs.filter(m => m.text.startsWith('  "'))
    expect(fragments).toHaveLength(3)
    // Each fragment should be from the pool
    fragments.forEach(f => {
      const inner = f.text.slice(3, -1) // strip leading '  "' and trailing '"'
      expect(MEMORY_POOL).toContain(inner)
    })
  })

  it('shows discovered rooms count', () => {
    const msgs = theBetweenMessages({ cycle: 2, discoveredRooms: ['r1', 'r2', 'r3'] })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('3 rooms mapped')
  })

  it('shows stash item count', () => {
    const msgs = theBetweenMessages({ cycle: 2, stashItems: ['knife', 'bandage'] })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('2 items stashed')
  })

  it('shows faction names with non-zero standing', () => {
    const msgs = theBetweenMessages({
      cycle: 2,
      inheritedFactions: { Accord: 1, Salters: 0, Kindling: -1 },
    })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('Accord')
    expect(text).toContain('Kindling')
    expect(text).not.toContain('Salters')
  })

  it('shows stash tip on cycle 2', () => {
    const msgs = theBetweenMessages({ cycle: 2 })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('stash')
  })

  it('does not show stash tip on other cycles', () => {
    const msgs = theBetweenMessages({ cycle: 3 })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).not.toContain('Tip:')
  })
})

describe('endingMessages', () => {
  it('includes the ending title for a known choice', () => {
    const msgs = endingMessages({ choice: 'cure', cycle: 3, totalDeaths: 2, roomsExplored: 40, xpEarned: 5000 })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('THE CURE')
  })

  it('uppercases unknown ending choice', () => {
    const msgs = endingMessages({ choice: 'unknown', cycle: 1, totalDeaths: 0, roomsExplored: 5, xpEarned: 0 })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('UNKNOWN')
  })

  it('includes run statistics', () => {
    const msgs = endingMessages({ choice: 'seal', cycle: 4, totalDeaths: 3, roomsExplored: 55, xpEarned: 8000 })
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('CYCLES: 4')
    expect(text).toContain('DEATHS: 3')
  })

  it('all messages have type "ending"', () => {
    const msgs = endingMessages({ choice: 'weapon', cycle: 2, totalDeaths: 1, roomsExplored: 20, xpEarned: 2000 })
    expect(msgs.every(m => m.type === 'ending')).toBe(true)
  })
})

describe('prologueMessages', () => {
  it('includes the transmission log header', () => {
    const msgs = prologueMessages()
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('THE REMNANT')
  })

  it('includes CHARON-7 lore', () => {
    const msgs = prologueMessages()
    const text = msgs.map(m => m.text).join('\n')
    expect(text).toContain('CHARON-7')
  })

  it('ends with a skip prompt', () => {
    const msgs = prologueMessages()
    const last = msgs[msgs.length - 1]
    expect(last.text).toContain('SKIP')
  })

  it('all messages have type "narrative"', () => {
    const msgs = prologueMessages()
    expect(msgs.every(m => m.type === 'narrative')).toBe(true)
  })
})
