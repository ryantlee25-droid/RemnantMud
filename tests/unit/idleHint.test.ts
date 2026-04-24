import { describe, it, expect } from 'vitest'
import {
  shouldFireIdleHint,
  markIdleHintFired,
  IDLE_HINT_CONFIG,
  IDLE_HINT_MESSAGE,
} from '@/lib/idleHint'

// ---------------------------------------------------------------------------
// In-memory Storage mock — satisfies Pick<Storage, 'getItem' | 'setItem'>
// ---------------------------------------------------------------------------
function makeStorage() {
  const store = new Map<string, string>()
  return {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v) },
  }
}

// ---------------------------------------------------------------------------
// shouldFireIdleHint
// ---------------------------------------------------------------------------
describe('shouldFireIdleHint', () => {
  it('returns false when noCombatActions is below threshold', () => {
    const storage = makeStorage()
    expect(shouldFireIdleHint(IDLE_HINT_CONFIG.threshold - 1, 1, storage)).toBe(false)
  })

  it('returns false when noCombatActions is 0', () => {
    const storage = makeStorage()
    expect(shouldFireIdleHint(0, 1, storage)).toBe(false)
  })

  it('returns true at threshold when localStorage has no flag for this cycle', () => {
    const storage = makeStorage()
    expect(shouldFireIdleHint(IDLE_HINT_CONFIG.threshold, 1, storage)).toBe(true)
  })

  it('returns true above threshold when localStorage has no flag for this cycle', () => {
    const storage = makeStorage()
    expect(shouldFireIdleHint(IDLE_HINT_CONFIG.threshold + 10, 1, storage)).toBe(true)
  })

  it('returns false at threshold when flag IS set for this cycle', () => {
    const storage = makeStorage()
    markIdleHintFired(1, storage)
    expect(shouldFireIdleHint(IDLE_HINT_CONFIG.threshold, 1, storage)).toBe(false)
  })

  it('returns true at threshold when flag is set for a DIFFERENT cycle', () => {
    const storage = makeStorage()
    markIdleHintFired(1, storage)
    // Cycle 2 has not been flagged — should fire
    expect(shouldFireIdleHint(IDLE_HINT_CONFIG.threshold, 2, storage)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// markIdleHintFired
// ---------------------------------------------------------------------------
describe('markIdleHintFired', () => {
  it('writes the cycle-specific key to storage', () => {
    const storage = makeStorage()
    markIdleHintFired(3, storage)
    expect(storage.getItem(IDLE_HINT_CONFIG.cycleKeyPrefix + 3)).toBe('1')
  })

  it('does not affect other cycle keys', () => {
    const storage = makeStorage()
    markIdleHintFired(3, storage)
    expect(storage.getItem(IDLE_HINT_CONFIG.cycleKeyPrefix + 4)).toBeNull()
  })

  it('is idempotent — calling twice does not throw', () => {
    const storage = makeStorage()
    markIdleHintFired(1, storage)
    markIdleHintFired(1, storage)
    expect(storage.getItem(IDLE_HINT_CONFIG.cycleKeyPrefix + 1)).toBe('1')
  })
})

// ---------------------------------------------------------------------------
// IDLE_HINT_MESSAGE
// ---------------------------------------------------------------------------
describe('IDLE_HINT_MESSAGE', () => {
  it('is a non-empty string', () => {
    expect(typeof IDLE_HINT_MESSAGE).toBe('string')
    expect(IDLE_HINT_MESSAGE.length).toBeGreaterThan(0)
  })
})
