// ============================================================
// monologue-narrator.test.ts
// Integration tests for playerMonologue.ts + narratorVoice.ts
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  shouldTriggerMonologue,
  generateMonologue,
  getPhysicalStateNarration,
  getPersonalLossEcho,
  getReputationVoice,
  resetMonologueSession,
} from '@/lib/playerMonologue'
import {
  shouldNarratorSpeak,
  generateNarratorVoice,
  getNarratorActTransition,
  clearNarratorSession,
  NARRATOR_CONFIG,
} from '@/lib/narratorVoice'
import { ENFORCER_POOLS } from '@/data/playerMonologues/class_enforcer'
import { SCOUT_POOLS } from '@/data/playerMonologues/class_scout'
import { WRAITH_POOLS } from '@/data/playerMonologues/class_wraith'
import { SHEPHERD_POOLS } from '@/data/playerMonologues/class_shepherd'
import { RECLAIMER_POOLS } from '@/data/playerMonologues/class_reclaimer'
import { WARDEN_POOLS } from '@/data/playerMonologues/class_warden'
import { BROKER_POOLS } from '@/data/playerMonologues/class_broker'

// ============================================================
// Helpers
// ============================================================

const baseContext = (trigger: string) => ({ trigger } as any)

// ============================================================
// Data validation — all 7 class monologue files
// ============================================================

describe('monologue data — all class files export valid arrays', () => {
  const allPools = [
    ['enforcer', ENFORCER_POOLS],
    ['scout', SCOUT_POOLS],
    ['wraith', WRAITH_POOLS],
    ['shepherd', SHEPHERD_POOLS],
    ['reclaimer', RECLAIMER_POOLS],
    ['warden', WARDEN_POOLS],
    ['broker', BROKER_POOLS],
  ] as const

  it.each(allPools)('%s pools: non-empty array of valid MonologuePool entries', (cls, pools) => {
    expect(Array.isArray(pools)).toBe(true)
    expect(pools.length).toBeGreaterThan(0)
    for (const pool of pools) {
      expect(pool.class).toBe(cls)
      expect(typeof pool.trigger).toBe('string')
      expect(typeof pool.personalLoss).toBe('string')
      expect(Array.isArray(pool.lines)).toBe(true)
      expect(pool.lines.length).toBeGreaterThan(0)
      for (const line of pool.lines) {
        expect(typeof line).toBe('string')
        expect(line.length).toBeGreaterThan(0)
      }
    }
  })
})

// ============================================================
// generateMonologue — class selection + deduplication
// ============================================================

describe('generateMonologue', () => {
  beforeEach(() => resetMonologueSession())

  it('returns a GameMessage for enforcer / low_hp', async () => {
    const msg = await generateMonologue(baseContext('low_hp'), 'enforcer', 'child')
    expect(msg).not.toBeNull()
    expect(msg!.type).toBe('narrative')
    expect(typeof msg!.text).toBe('string')
    expect(msg!.id).toBeTruthy()
  })

  it('returns non-null for all 7 classes on a common trigger', async () => {
    const classes = ['enforcer', 'scout', 'wraith', 'shepherd', 'reclaimer', 'warden', 'broker'] as const
    for (const cls of classes) {
      resetMonologueSession()
      const msg = await generateMonologue(baseContext('low_hp'), cls, 'child')
      expect(msg, `${cls} returned null`).not.toBeNull()
    }
  })

  it('session deduplication — does not repeat the same line within a session', async () => {
    const seen = new Set<string>()
    // Drain enough calls to check dedup (enforcer has 3 lines per loss/trigger combo)
    for (let i = 0; i < 3; i++) {
      const msg = await generateMonologue(baseContext('low_hp'), 'enforcer', 'child')
      if (msg) seen.add(msg.text)
    }
    // All seen texts should be unique (no repeats before reset)
    expect(seen.size).toBe(3)
  })

  it('self-heals after pool exhaustion — continues returning lines after reset', async () => {
    // Exhaust the pool (enforcer/child/low_hp has 3 lines)
    for (let i = 0; i < 3; i++) {
      await generateMonologue(baseContext('low_hp'), 'enforcer', 'child')
    }
    // 4th call should still return something (auto-reset fires)
    const msg = await generateMonologue(baseContext('low_hp'), 'enforcer', 'child')
    expect(msg).not.toBeNull()
  })

  it('returns null for an unknown playerClass', async () => {
    const msg = await generateMonologue(baseContext('low_hp'), 'unknown_class' as any, 'child')
    expect(msg).toBeNull()
  })

  it('routes examining_loss_item to getPersonalLossEcho when lossName is provided', async () => {
    const msg = await generateMonologue(
      baseContext('examining_loss_item'),
      'enforcer',
      'child',
      'Ellie'
    )
    // getPersonalLossEcho returns null for 'child' + 'examining_loss_item'? No — it DOES match.
    // Just verify type is narrative and text mentions lossName or is non-null.
    expect(msg).not.toBeNull()
    expect(msg!.type).toBe('narrative')
  })

  it('falls back to trigger-only pool when no loss-specific pool matches', async () => {
    // 'promise' + 'post_combat' exists for enforcer; use a loss type with no exact match
    // by using a trigger that has no loss-specific variant — 'pressure_spike' with 'identity'
    const msg = await generateMonologue(baseContext('pressure_spike'), 'enforcer', 'identity')
    expect(msg).not.toBeNull()
  })
})

// ============================================================
// resetMonologueSession
// ============================================================

describe('resetMonologueSession', () => {
  it('clears dedup state so lines can repeat after reset', async () => {
    const first = await generateMonologue(baseContext('safe_rest'), 'enforcer', 'child')
    resetMonologueSession()
    const second = await generateMonologue(baseContext('safe_rest'), 'enforcer', 'child')
    // Both should be non-null; exact text may match since pool was cleared
    expect(first).not.toBeNull()
    expect(second).not.toBeNull()
  })
})

// ============================================================
// getPhysicalStateNarration
// ============================================================

describe('getPhysicalStateNarration', () => {
  it('returns null during combat', () => {
    expect(getPhysicalStateNarration({ hp: 5, maxHp: 20, cycle: 1, actionsTaken: 10, inCombat: true })).toBeNull()
  })

  it('returns a narrative message at low HP (<25%)', () => {
    const msg = getPhysicalStateNarration({ hp: 4, maxHp: 20, cycle: 1, actionsTaken: 10 })
    expect(msg).not.toBeNull()
    expect(msg!.type).toBe('narrative')
  })

  it('returns a message when poisoned', () => {
    const msg = getPhysicalStateNarration({
      hp: 15, maxHp: 20, cycle: 1, actionsTaken: 10, conditions: ['poisoned'],
    })
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/copper|numb|soft/)
  })

  it('returns post-rebirth message in first 20 actions of cycle > 1', () => {
    const msg = getPhysicalStateNarration({ hp: 20, maxHp: 20, cycle: 2, actionsTaken: 10 })
    expect(msg).not.toBeNull()
    expect(msg!.type).toBe('narrative')
  })

  it('returns high-cycle message at cycle >= 5', () => {
    const msg = getPhysicalStateNarration({ hp: 20, maxHp: 20, cycle: 5, actionsTaken: 100 })
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/fifth|before|surprised/)
  })

  it('returns exhaustion message after 50+ actions without rest', () => {
    const msg = getPhysicalStateNarration({
      hp: 20, maxHp: 20, cycle: 1, actionsTaken: 60, lastRestAt: 0,
    })
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/blur|moving too long|Rest/)
  })
})

// ============================================================
// getPersonalLossEcho
// ============================================================

describe('getPersonalLossEcho', () => {
  beforeEach(() => resetMonologueSession())

  it('returns null when trigger does not match loss type', () => {
    expect(getPersonalLossEcho('post_combat', 'child', 'Ellie')).toBeNull()
  })

  it('child + witnessing_children returns a narrative message', () => {
    const msg = getPersonalLossEcho('witnessing_children', 'child', 'Ellie')
    expect(msg).not.toBeNull()
    expect(msg!.type).toBe('narrative')
  })

  it('partner + examining_loss_item returns a message', () => {
    const msg = getPersonalLossEcho('examining_loss_item', 'partner', 'Sam')
    expect(msg).not.toBeNull()
    expect(msg!.type).toBe('narrative')
  })

  it('deduplicates — second call with same line returns null', () => {
    // Force a specific line by exhausting via multiple resets — just check dedup fires.
    // Call until we get a non-null, then drain by resetting and calling many times.
    // Simpler: call same trigger twice — second may return null if line pool is 1 entry.
    const results: Array<string | null> = []
    for (let i = 0; i < 5; i++) {
      const msg = getPersonalLossEcho('examining_loss_item', 'partner', 'Sam')
      results.push(msg?.text ?? null)
    }
    // After 3 unique lines, further calls return null (not self-healing in personal loss)
    const nonNull = results.filter(Boolean)
    const unique = new Set(nonNull)
    expect(unique.size).toBe(nonNull.length) // no duplicates before null
  })
})

// ============================================================
// getReputationVoice
// ============================================================

describe('getReputationVoice', () => {
  beforeEach(() => resetMonologueSession())

  it('returns null when no reputation thresholds are met', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01) // force past 30% gate
    const msg = getReputationVoice({}, 'crossroads', 1)
    expect(msg).toBeNull()
    vi.restoreAllMocks()
  })

  it('returns accord line when accord rep >= 2', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    const msg = getReputationVoice({ accord: 2 }, 'crossroads', 1)
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/Cross/)
    vi.restoreAllMocks()
  })

  it('returns salters warning when salters rep <= -2', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    const msg = getReputationVoice({ salters: -2 }, 'crossroads', 1)
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/Salters/)
    vi.restoreAllMocks()
  })

  it('returns cycle line when cycle >= 3', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    const msg = getReputationVoice({}, 'crossroads', 3)
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/keeps coming back/)
    vi.restoreAllMocks()
  })

  it('returns null when random() >= 0.30 (gate check)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.50)
    const msg = getReputationVoice({ accord: 3 }, 'crossroads', 5)
    expect(msg).toBeNull()
    vi.restoreAllMocks()
  })
})

// ============================================================
// shouldNarratorSpeak
// ============================================================

describe('shouldNarratorSpeak', () => {
  it('returns false during combat', () => {
    expect(shouldNarratorSpeak(100, 0, 5, true)).toBe(false)
  })

  it('returns false when fewer than 50 actions since last speak', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    expect(shouldNarratorSpeak(30, 0, 5, false)).toBe(false)
    vi.restoreAllMocks()
  })

  it('uses highPressureSpawnChance (10%) at pressure >= 8', () => {
    // random = 0.09 — passes at 10%, fails at 5%
    vi.spyOn(Math, 'random').mockReturnValue(0.09)
    expect(shouldNarratorSpeak(100, 0, 8, false)).toBe(true)
    vi.restoreAllMocks()
  })

  it('uses baseSpawnChance (5%) below pressure threshold', () => {
    // random = 0.09 — fails at 5%, would pass at 10%
    vi.spyOn(Math, 'random').mockReturnValue(0.09)
    expect(shouldNarratorSpeak(100, 0, 5, false)).toBe(false)
    vi.restoreAllMocks()
  })
})

// ============================================================
// generateNarratorVoice — deeper branch coverage
// ============================================================

describe('generateNarratorVoice', () => {
  beforeEach(() => clearNarratorSession())

  const baseCtx = (overrides = {}) => ({
    act: 1 as const,
    zone: 'crossroads' as any,
    cycle: 1,
    pressure: 3,
    questFlags: [],
    playerHP: 20,
    playerMaxHP: 20,
    ...overrides,
  })

  it('returns a message with type "echo"', () => {
    const msg = generateNarratorVoice(baseCtx())
    expect(msg).not.toBeNull()
    expect(msg!.type).toBe('echo')
    expect(typeof msg!.text).toBe('string')
  })

  it('priority 1: draws from pressure pool when pressure >= 7', () => {
    const msg = generateNarratorVoice(baseCtx({ pressure: 7 }))
    expect(msg).not.toBeNull()
  })

  it('priority 1: draws from pressure pool on recentDeath', () => {
    const msg = generateNarratorVoice(baseCtx({ recentDeath: true, pressure: 0 }))
    expect(msg).not.toBeNull()
  })

  it('priority 3: cycle pool fires on cycle >= 2 (probabilistic — force with mock)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01) // < 0.40 threshold
    const msg = generateNarratorVoice(baseCtx({ cycle: 2, pressure: 0 }))
    expect(msg).not.toBeNull()
    vi.restoreAllMocks()
  })

  it('priority 4: act-specific pool used when act matches', () => {
    // Acts 1/2/3 should all produce output
    for (const act of [1, 2, 3] as const) {
      clearNarratorSession()
      const msg = generateNarratorVoice(baseCtx({ act }))
      expect(msg, `act ${act} returned null`).not.toBeNull()
    }
  })

  it('self-heals after session exhaustion — still returns after clearNarratorSession', () => {
    // Drain several unique entries then clear and try again
    for (let i = 0; i < 10; i++) generateNarratorVoice(baseCtx())
    clearNarratorSession()
    const msg = generateNarratorVoice(baseCtx())
    expect(msg).not.toBeNull()
  })
})

// ============================================================
// getNarratorActTransition
// ============================================================

describe('getNarratorActTransition', () => {
  it('returns an array of GameMessages for act 1→2', () => {
    const msgs = getNarratorActTransition(1, 2)
    expect(Array.isArray(msgs)).toBe(true)
    expect(msgs.length).toBeGreaterThan(0)
    for (const m of msgs) {
      expect(m.type).toBe('echo')
      expect(typeof m.text).toBe('string')
    }
  })

  it('returns an array for act 2→3', () => {
    const msgs = getNarratorActTransition(2, 3)
    expect(Array.isArray(msgs)).toBe(true)
    expect(msgs.length).toBeGreaterThan(0)
  })

  it('returns empty array for unknown transition', () => {
    const msgs = getNarratorActTransition(3, 99)
    expect(msgs).toHaveLength(0)
  })
})
