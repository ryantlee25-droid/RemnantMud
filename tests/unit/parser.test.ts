import { describe, it, expect } from 'vitest'
import { parseCommand } from '@/lib/parser'

describe('parseCommand — empty / whitespace', () => {
  it('empty string → unknown', () => {
    const r = parseCommand('')
    expect(r.verb).toBe('unknown')
    expect(r.noun).toBe('')
  })

  it('whitespace only → unknown', () => {
    expect(parseCommand('   ').verb).toBe('unknown')
  })

  it('preserves raw input', () => {
    const raw = '  Go North  '
    expect(parseCommand(raw).raw).toBe(raw)
  })
})

describe('parseCommand — bare directions', () => {
  const dirs = [
    ['n', 'north'], ['north', 'north'],
    ['s', 'south'], ['south', 'south'],
    ['e', 'east'],  ['east', 'east'],
    ['w', 'west'],  ['west', 'west'],
    ['up', 'up'],   ['down', 'down'],
  ]
  for (const [input, expected] of dirs) {
    it(`"${input}" → go ${expected}`, () => {
      const r = parseCommand(input)
      expect(r.verb).toBe('go')
      expect(r.noun).toBe(expected)
    })
  }

  it('case-insensitive direction', () => {
    expect(parseCommand('NORTH').verb).toBe('go')
    expect(parseCommand('NORTH').noun).toBe('north')
  })
})

describe('parseCommand — movement verbs', () => {
  const verbs = ['go', 'move', 'walk', 'head']
  for (const v of verbs) {
    it(`"${v} north" → go north`, () => {
      const r = parseCommand(`${v} north`)
      expect(r.verb).toBe('go')
      expect(r.noun).toBe('north')
    })
  }

  it('"go n" → go north', () => {
    const r = parseCommand('go n')
    expect(r.verb).toBe('go')
    expect(r.noun).toBe('north')
  })

  it('"go" alone → go with no noun', () => {
    const r = parseCommand('go')
    expect(r.verb).toBe('go')
    expect(r.noun).toBeUndefined()
  })
})

describe('parseCommand — look verbs', () => {
  const verbs = ['look', 'l', 'examine', 'x', 'inspect', 'check', 'describe']
  for (const v of verbs) {
    it(`"${v}" → look`, () => {
      expect(parseCommand(v).verb).toBe('look')
    })
  }

  it('"look sword" → examine_extra with noun sword', () => {
    const r = parseCommand('look sword')
    expect(r.verb).toBe('examine_extra')
    expect(r.noun).toBe('sword')
  })
})

describe('parseCommand — inventory verbs', () => {
  it('"i" → inventory', () => expect(parseCommand('i').verb).toBe('inventory'))
  it('"inv" → inventory', () => expect(parseCommand('inv').verb).toBe('inventory'))
  it('"inventory" → inventory', () => expect(parseCommand('inventory').verb).toBe('inventory'))

  const takeSynonyms = ['take', 'get']
  for (const v of takeSynonyms) {
    it(`"${v} item" → take item`, () => {
      const r = parseCommand(`${v} apple`)
      expect(r.verb).toBe('take')
      expect(r.noun).toBe('apple')
    })
  }

  it('"drop sword" → drop sword', () => {
    const r = parseCommand('drop sword')
    expect(r.verb).toBe('drop')
    expect(r.noun).toBe('sword')
  })

  it('"use medkit" → use medkit', () => {
    const r = parseCommand('use medkit')
    expect(r.verb).toBe('use')
    expect(r.noun).toBe('medkit')
  })

  it(`"eat" → use verb`, () => {
    expect(parseCommand('eat food').verb).toBe('use')
  })

  it(`"drink" → drink verb`, () => {
    expect(parseCommand('drink water').verb).toBe('drink')
  })

  const equipSynonyms = ['equip', 'wear', 'wield']
  for (const v of equipSynonyms) {
    it(`"${v}" → equip`, () => {
      expect(parseCommand(`${v} armor`).verb).toBe('equip')
    })
  }

  const unequipSynonyms = ['unequip', 'remove']
  for (const v of unequipSynonyms) {
    it(`"${v}" → unequip`, () => {
      expect(parseCommand(`${v} armor`).verb).toBe('unequip')
    })
  }
})

describe('parseCommand — combat verbs', () => {
  const attackSynonyms = ['attack', 'kill', 'hit', 'fight', 'strike']
  for (const v of attackSynonyms) {
    it(`"${v} enemy" → attack`, () => {
      expect(parseCommand(`${v} shuffler`).verb).toBe('attack')
    })
  }

  const fleeSynonyms = ['flee', 'run', 'escape', 'retreat']
  for (const v of fleeSynonyms) {
    it(`"${v}" → flee`, () => {
      expect(parseCommand(v).verb).toBe('flee')
    })
  }
})

describe('parseCommand — interaction verbs', () => {
  const talkSynonyms = ['talk', 'speak', 'ask', 'greet']
  for (const v of talkSynonyms) {
    it(`"${v}" → talk`, () => {
      expect(parseCommand(`${v} wren`).verb).toBe('talk')
    })
  }

  it('"open door" → open', () => {
    const r = parseCommand('open door')
    expect(r.verb).toBe('open')
    expect(r.noun).toBe('door')
  })

  it('"search" → search', () => {
    expect(parseCommand('search').verb).toBe('search')
  })
})

describe('parseCommand — system verbs', () => {
  const statsSynonyms = ['stats', 'status', 'character', 'char']
  for (const v of statsSynonyms) {
    it(`"${v}" → stats`, () => {
      expect(parseCommand(v).verb).toBe('stats')
    })
  }

  it('"help" → help', () => expect(parseCommand('help').verb).toBe('help'))
  it('"?" → help', () => expect(parseCommand('?').verb).toBe('help'))
  it('"save" → save', () => expect(parseCommand('save').verb).toBe('save'))

  const quitSynonyms = ['quit', 'exit']
  for (const v of quitSynonyms) {
    it(`"${v}" → quit`, () => {
      expect(parseCommand(v).verb).toBe('quit')
    })
  }
})

describe('parseCommand — multi-word forms', () => {
  it('"pick up" → take', () => {
    expect(parseCommand('pick up').verb).toBe('take')
  })

  it('"pick up sword" → take (multi-word prefix)', () => {
    const r = parseCommand('pick up sword')
    expect(r.verb).toBe('take')
  })

  it('"put down" → drop', () => {
    expect(parseCommand('put down').verb).toBe('drop')
  })

  it('"take off armor" → unequip', () => {
    expect(parseCommand('take off armor').verb).toBe('unequip')
  })

  it('"search room" → search', () => {
    expect(parseCommand('search room').verb).toBe('search')
  })

  it('"look around" → search', () => {
    expect(parseCommand('look around').verb).toBe('search')
  })
})

describe('parseCommand — unknown commands', () => {
  it('completely unknown → unknown verb with trimmed noun', () => {
    const r = parseCommand('xyzzy')
    expect(r.verb).toBe('unknown')
    expect(r.noun).toBe('xyzzy')
  })

  it('unknown preserves trimmed input as noun', () => {
    const r = parseCommand('  dance wildly  ')
    expect(r.verb).toBe('unknown')
    expect(r.noun).toBe('dance wildly')
  })
})
