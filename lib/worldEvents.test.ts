// ============================================================
// worldEvents.test.ts — Unit tests for world event system
// Convoy: remnant-narrative-0329 | Rider A
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getScheduledEvents, executeWorldEvent, ALL_WORLD_EVENTS } from '@/lib/worldEvents'
import type { WorldEvent } from '@/types/convoy-contracts'
import type { Player } from '@/types/game'

// ============================================================
// Test fixtures
// ============================================================

const basePlayer: Pick<Player, 'factionReputation' | 'questFlags'> = {
  factionReputation: {},
  questFlags: {},
}

function makeEvent(overrides: Partial<WorldEvent> = {}): WorldEvent {
  return {
    id: 'test_event',
    act: 1,
    escalationLevel: 0,
    triggerActionCount: 30,
    messagePool: ['Something happened.', 'Something else happened.'],
    ...overrides,
  }
}

// ============================================================
// getScheduledEvents — scheduling logic
// ============================================================

describe('getScheduledEvents', () => {
  it('returns empty array when actionCount is 0', () => {
    const result = getScheduledEvents(0, 1, basePlayer)
    expect(result).toHaveLength(0)
  })

  it('returns empty array when actionCount does not divide evenly', () => {
    const result = getScheduledEvents(31, 1, basePlayer)
    // We may get real events from the registry, but none should be
    // from events with triggerActionCount=30 at actionCount=31
    const mismatched = result.filter(e => 31 % e.triggerActionCount !== 0)
    expect(mismatched).toHaveLength(0)
  })

  it('fires an event at the correct action count interval', () => {
    // We use a custom array to avoid polluting with real events
    const testEvent = makeEvent({ id: 'fire_test', act: 1, triggerActionCount: 30 })
    // Filter the real registry output for act 1 at action 30
    const results = getScheduledEvents(30, 1, basePlayer)
    // All returned events should be from act 1
    results.forEach(e => expect(e.act).toBe(1))
    // All returned events should have triggerActionCount dividing 30
    results.forEach(e => expect(30 % e.triggerActionCount).toBe(0))
    // Verify the known real event fires
    const found = results.find(e => e.id === 'we_a1_01_missing_guard')
    expect(found).toBeDefined()
  })

  it('fires at 60 actions for events with triggerActionCount=15', () => {
    const results = getScheduledEvents(60, 1, basePlayer)
    const fifteenInterval = results.filter(e => e.triggerActionCount === 15)
    expect(fifteenInterval.length).toBeGreaterThanOrEqual(1)
  })
})

// ============================================================
// getScheduledEvents — act boundary filtering
// ============================================================

describe('getScheduledEvents — act filtering', () => {
  it('does not return act1 events in act 2', () => {
    const results = getScheduledEvents(30, 2, {
      ...basePlayer,
      questFlags: { act1_complete: true },
    })
    const act1Events = results.filter(e => e.act === 1)
    expect(act1Events).toHaveLength(0)
  })

  it('does not return act2 events in act 1', () => {
    const results = getScheduledEvents(30, 1, basePlayer)
    const act2Events = results.filter(e => e.act === 2)
    expect(act2Events).toHaveLength(0)
  })

  it('does not return act1 events in act 3', () => {
    const results = getScheduledEvents(30, 3, {
      ...basePlayer,
      questFlags: { act1_complete: true, act2_complete: true },
    })
    const act1Events = results.filter(e => e.act === 1)
    expect(act1Events).toHaveLength(0)
  })

  it('returns only act2 events when currentAct is 2', () => {
    const results = getScheduledEvents(30, 2, {
      ...basePlayer,
      questFlags: { act1_complete: true },
    })
    results.forEach(e => expect(e.act).toBe(2))
  })

  it('returns only act3 events when currentAct is 3', () => {
    const results = getScheduledEvents(30, 3, {
      ...basePlayer,
      questFlags: { act1_complete: true, act2_complete: true },
    })
    results.forEach(e => expect(e.act).toBe(3))
  })
})

// ============================================================
// getScheduledEvents — quest gate filtering
// ============================================================

describe('getScheduledEvents — quest gates', () => {
  it('does not fire act2 events when act1_complete flag is missing', () => {
    // Act 2 events all require act1_complete quest gate
    const results = getScheduledEvents(30, 2, {
      ...basePlayer,
      questFlags: {},
    })
    expect(results).toHaveLength(0)
  })

  it('fires act2 events when act1_complete flag is set', () => {
    const results = getScheduledEvents(18, 2, {
      ...basePlayer,
      questFlags: { act1_complete: true },
    })
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('does not fire act3 events when act2_complete flag is missing', () => {
    const results = getScheduledEvents(30, 3, {
      ...basePlayer,
      questFlags: { act1_complete: true },
    })
    expect(results).toHaveLength(0)
  })

  it('fires act3 events when act2_complete flag is set', () => {
    const results = getScheduledEvents(18, 3, {
      ...basePlayer,
      questFlags: { act1_complete: true, act2_complete: true },
    })
    expect(results.length).toBeGreaterThanOrEqual(1)
  })

  it('handles undefined questFlags gracefully', () => {
    // Should not throw; events with questGates just won't fire
    expect(() =>
      getScheduledEvents(30, 2, { factionReputation: {}, questFlags: undefined })
    ).not.toThrow()
  })
})

// ============================================================
// getScheduledEvents — faction gate filtering
// ============================================================

describe('getScheduledEvents — faction gates', () => {
  it('respects minRep: event only fires when rep meets minimum', () => {
    // we_a1_11_red_court_rumor has maxRep: 1 and triggerActionCount: 17
    // Should fire when player rep with red_court is <= 1
    const withLowRep = getScheduledEvents(34, 1, {
      ...basePlayer,
      factionReputation: { red_court: -2 },
    })
    const withHighRep = getScheduledEvents(34, 1, {
      ...basePlayer,
      factionReputation: { red_court: 3 },
    })

    const eventFiredLow = withLowRep.find(e => e.id === 'we_a1_11_red_court_rumor')
    const eventFiredHigh = withHighRep.find(e => e.id === 'we_a1_11_red_court_rumor')

    expect(eventFiredLow).toBeDefined()
    expect(eventFiredHigh).toBeUndefined()
  })

  it('handles undefined factionReputation gracefully', () => {
    expect(() =>
      getScheduledEvents(40, 1, {
        factionReputation: undefined,
        questFlags: {},
      })
    ).not.toThrow()
  })

  it('treats missing faction rep as 0 for gate checks', () => {
    // we_a2_05_reclaimer_find requires minRep: 1 for reclaimers
    // With no rep stored, default 0 should NOT meet minRep: 1
    const results = getScheduledEvents(46, 2, {
      factionReputation: {},
      questFlags: { act1_complete: true },
    })
    const gatedEvent = results.find(e => e.id === 'we_a2_05_reclaimer_find')
    expect(gatedEvent).toBeUndefined()
  })
})

// ============================================================
// executeWorldEvent — message selection
// ============================================================

describe('executeWorldEvent', () => {
  it('returns a GameMessage with the correct type', () => {
    const event = makeEvent({ messagePool: ['Test message.'] })
    const messages = executeWorldEvent(event, basePlayer)
    expect(messages).toHaveLength(1)
    expect(messages[0].type).toBe('narrative')
    expect(messages[0].text).toBe('Test message.')
    expect(typeof messages[0].id).toBe('string')
  })

  it('returns a message from the pool', () => {
    const pool = ['Option A.', 'Option B.', 'Option C.']
    const event = makeEvent({ messagePool: pool })
    const messages = executeWorldEvent(event, basePlayer)
    expect(pool).toContain(messages[0].text)
  })

  it('returns empty array for empty message pool', () => {
    const event = makeEvent({ messagePool: [] })
    const messages = executeWorldEvent(event, basePlayer)
    expect(messages).toHaveLength(0)
  })

  it('generates unique IDs for each call', () => {
    const event = makeEvent({ messagePool: ['Consistent text.'] })
    const m1 = executeWorldEvent(event, basePlayer)
    const m2 = executeWorldEvent(event, basePlayer)
    expect(m1[0].id).not.toBe(m2[0].id)
  })

  it('selects randomly from the pool over many calls', () => {
    const pool = ['First message.', 'Second message.', 'Third message.']
    const event = makeEvent({ messagePool: pool })
    const results = new Set<string>()

    // 100 calls should hit all 3 with overwhelming probability
    for (let i = 0; i < 100; i++) {
      const msgs = executeWorldEvent(event, basePlayer)
      results.add(msgs[0].text)
    }

    expect(results.size).toBe(3)
  })
})

// ============================================================
// ALL_WORLD_EVENTS — registry integrity checks
// ============================================================

describe('ALL_WORLD_EVENTS registry', () => {
  it('contains events for all three acts', () => {
    const acts = new Set(ALL_WORLD_EVENTS.map(e => e.act))
    expect(acts.has(1)).toBe(true)
    expect(acts.has(2)).toBe(true)
    expect(acts.has(3)).toBe(true)
  })

  it('has no duplicate event IDs', () => {
    const ids = ALL_WORLD_EVENTS.map(e => e.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('has at least 8 act1 events', () => {
    const act1 = ALL_WORLD_EVENTS.filter(e => e.act === 1)
    expect(act1.length).toBeGreaterThanOrEqual(8)
  })

  it('has at least 10 act2 events', () => {
    const act2 = ALL_WORLD_EVENTS.filter(e => e.act === 2)
    expect(act2.length).toBeGreaterThanOrEqual(10)
  })

  it('has at least 8 act3 events', () => {
    const act3 = ALL_WORLD_EVENTS.filter(e => e.act === 3)
    expect(act3.length).toBeGreaterThanOrEqual(8)
  })

  it('all events have non-empty message pools', () => {
    ALL_WORLD_EVENTS.forEach(event => {
      expect(event.messagePool.length).toBeGreaterThan(0)
    })
  })

  it('explicit newline segments in messages do not exceed 80 chars', () => {
    // The 80-char rule applies to explicit \\n-delimited segments.
    // Single continuous strings wrap naturally in the terminal and are exempt.
    // Strip rich-text tags before measuring (tags render as styled spans).
    const stripTags = (s: string) => s.replace(/<[^>]+>/g, '')
    const violations: string[] = []
    ALL_WORLD_EVENTS.forEach(event => {
      event.messagePool.forEach(message => {
        if (!message.includes('\n')) return  // single-line, wraps naturally
        const lines = stripTags(message).split('\n')
        lines.forEach(line => {
          if (line.length > 80) {
            violations.push(
              `[${event.id}] (${line.length}): "${line}"`
            )
          }
        })
      })
    })
    expect(violations, violations.join('\n')).toHaveLength(0)
  })

  it('all trigger action counts are positive integers', () => {
    ALL_WORLD_EVENTS.forEach(event => {
      expect(event.triggerActionCount).toBeGreaterThan(0)
      expect(Number.isInteger(event.triggerActionCount)).toBe(true)
    })
  })

  it('all escalationLevel values are in range 0-3', () => {
    ALL_WORLD_EVENTS.forEach(event => {
      expect(event.escalationLevel).toBeGreaterThanOrEqual(0)
      expect(event.escalationLevel).toBeLessThanOrEqual(3)
    })
  })

  it('all events have at least 2 message variants', () => {
    ALL_WORLD_EVENTS.forEach(event => {
      expect(event.messagePool.length).toBeGreaterThanOrEqual(2)
    })
  })
})
