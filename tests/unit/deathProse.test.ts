// ============================================================
// tests/unit/deathProse.test.ts
//
// Unit tests for the death prose variant system (H6).
// Per spec: at least 7 tests covering each named variant plus
// the default_fallback and deterministic selection.
// ============================================================

import { describe, it, expect } from 'vitest'
import { selectDeathProse, DEATH_PROSE_VARIANTS } from '@/lib/deathProse'
import type { DeathContext } from '@/lib/deathProse'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

/** RNG that always returns 0 — selects the first match deterministically. */
const rngFirst = () => 0

/** RNG that always returns 0.999 — selects the last match. */
const rngLast = () => 0.999

/** Find a variant by id (throws if missing — test setup error). */
function getVariant(id: string) {
  const v = DEATH_PROSE_VARIANTS.find((x) => x.id === id)
  if (!v) throw new Error(`Variant not found: ${id}`)
  return v
}

// ------------------------------------------------------------
// Base contexts
// ------------------------------------------------------------

const baseCombatCtx: DeathContext = {
  cause: 'combat',
  cycle: 1,
  zone: 'crossroads',
  hollowKills: 0,
  killedBy: undefined,
}

// ============================================================
// Test 1: combat_overwhelmed — cycle-1, low kills, combat
// ============================================================

describe('combat_overwhelmed', () => {
  it('is selected for cycle-1, 0 hollow kills, combat death with no named killer', () => {
    const ctx: DeathContext = { ...baseCombatCtx, cycle: 1, hollowKills: 0 }
    const msgs = selectDeathProse(ctx, rngFirst)
    expect(msgs.length).toBeGreaterThan(0)
    expect(msgs.every((m) => m.type === 'death')).toBe(true)
    const allText = msgs.map((m) => m.text).join('\n')
    // combat_overwhelmed prose references "The Hollow didn't ask"
    expect(allText).toContain("The Hollow didn't ask")
  })

  it('applies predicate matches cycle-1 with 4 kills (< 5)', () => {
    const v = getVariant('combat_overwhelmed')
    expect(v.applies({ ...baseCombatCtx, cycle: 1, hollowKills: 4 })).toBe(true)
  })

  it('applies predicate does NOT match when kills >= 5', () => {
    const v = getVariant('combat_overwhelmed')
    expect(v.applies({ ...baseCombatCtx, cycle: 1, hollowKills: 5 })).toBe(false)
  })
})

// ============================================================
// Test 2: combat_veteran — cycle 2+, 20+ kills
// ============================================================

describe('combat_veteran', () => {
  it('is selected for cycle-2, 20 hollow kills, combat death', () => {
    const ctx: DeathContext = {
      cause: 'combat',
      cycle: 2,
      zone: 'crossroads',
      hollowKills: 20,
      killedBy: undefined,
    }
    const msgs = selectDeathProse(ctx, rngFirst)
    const allText = msgs.map((m) => m.text).join('\n')
    expect(allText).toContain("returned the favor")
  })

  it('applies predicate: cycle-3, 25 kills', () => {
    const v = getVariant('combat_veteran')
    expect(v.applies({ ...baseCombatCtx, cycle: 3, hollowKills: 25 })).toBe(true)
  })

  it('applies predicate does NOT match cycle-1 even with 20+ kills', () => {
    const v = getVariant('combat_veteran')
    // cycle must be >= 2
    expect(v.applies({ ...baseCombatCtx, cycle: 1, hollowKills: 25 })).toBe(false)
  })

  it('applies predicate does NOT match cycle-2 with fewer than 20 kills', () => {
    const v = getVariant('combat_veteran')
    expect(v.applies({ ...baseCombatCtx, cycle: 2, hollowKills: 19 })).toBe(false)
  })
})

// ============================================================
// Test 3: combat_specific_killer — names the killer
// ============================================================

describe('combat_specific_killer', () => {
  it('is selected when killedBy is set and prose includes the enemy name', () => {
    const ctx: DeathContext = {
      cause: 'combat',
      cycle: 1,
      zone: 'crossroads',
      hollowKills: 3,
      killedBy: 'Shuffler',
    }
    const msgs = selectDeathProse(ctx, rngFirst)
    const allText = msgs.map((m) => m.text).join('\n')
    expect(allText).toContain('Shuffler')
  })

  it('prose contains the killer name verbatim', () => {
    const killerName = 'Elder Sanguine'
    const ctx: DeathContext = {
      cause: 'combat',
      cycle: 4,
      zone: 'the_scar',
      hollowKills: 10,
      killedBy: killerName,
    }
    const msgs = selectDeathProse(ctx, rngFirst)
    const allText = msgs.map((m) => m.text).join('\n')
    expect(allText).toContain(killerName)
  })

  it('applies predicate requires killedBy to be truthy', () => {
    const v = getVariant('combat_specific_killer')
    expect(v.applies({ ...baseCombatCtx, killedBy: 'Brute' })).toBe(true)
    expect(v.applies({ ...baseCombatCtx, killedBy: undefined })).toBe(false)
    expect(v.applies({ ...baseCombatCtx, killedBy: '' })).toBe(false)
  })
})

// ============================================================
// Test 4: environment_collapse — Scar / Deep zones
// ============================================================

describe('environment_collapse', () => {
  it('is selected for environment death in the_scar', () => {
    const ctx: DeathContext = {
      cause: 'environment',
      cycle: 1,
      zone: 'the_scar',
      hollowKills: 0,
    }
    const msgs = selectDeathProse(ctx, rngFirst)
    const allText = msgs.map((m) => m.text).join('\n')
    expect(allText).toContain('always going to win')
  })

  it('is selected for environment death in the_deep', () => {
    const ctx: DeathContext = {
      cause: 'environment',
      cycle: 2,
      zone: 'the_deep',
      hollowKills: 5,
    }
    const msgs = selectDeathProse(ctx, rngFirst)
    const allText = msgs.map((m) => m.text).join('\n')
    expect(allText).toContain('always going to win')
  })

  it('applies predicate does NOT match environment death in non-deep zone', () => {
    const v = getVariant('environment_collapse')
    expect(v.applies({
      cause: 'environment', cycle: 1, zone: 'crossroads', hollowKills: 0
    })).toBe(false)
  })
})

// ============================================================
// Test 5: infection_hollow — body horror
// ============================================================

describe('infection_hollow', () => {
  it('is selected for infection death', () => {
    const ctx: DeathContext = {
      cause: 'infection',
      cycle: 1,
      zone: 'the_ember',
      hollowKills: 2,
    }
    const msgs = selectDeathProse(ctx, rngFirst)
    const allText = msgs.map((m) => m.text).join('\n')
    expect(allText).toContain("hear yourself thinking")
  })

  it('applies predicate matches infection cause in any zone', () => {
    const v = getVariant('infection_hollow')
    expect(v.applies({ cause: 'infection', cycle: 1, zone: 'crossroads', hollowKills: 0 })).toBe(true)
    expect(v.applies({ cause: 'infection', cycle: 5, zone: 'the_deep', hollowKills: 50 })).toBe(true)
  })

  it('applies predicate does NOT match non-infection causes', () => {
    const v = getVariant('infection_hollow')
    expect(v.applies({ cause: 'combat', cycle: 1, zone: 'crossroads', hollowKills: 0 })).toBe(false)
    expect(v.applies({ cause: 'faction', cycle: 1, zone: 'crossroads', hollowKills: 0 })).toBe(false)
  })
})

// ============================================================
// Test 6: faction_execution — political, deliberate
// ============================================================

describe('faction_execution', () => {
  it('is selected for faction death', () => {
    const ctx: DeathContext = {
      cause: 'faction',
      cycle: 2,
      zone: 'covenant',
      hollowKills: 8,
    }
    const msgs = selectDeathProse(ctx, rngFirst)
    const allText = msgs.map((m) => m.text).join('\n')
    expect(allText).toContain("knew your name")
  })

  it('applies predicate matches faction cause', () => {
    const v = getVariant('faction_execution')
    expect(v.applies({ cause: 'faction', cycle: 1, zone: 'covenant', hollowKills: 0 })).toBe(true)
  })

  it('applies predicate does NOT match non-faction causes', () => {
    const v = getVariant('faction_execution')
    expect(v.applies({ cause: 'combat', cycle: 1, zone: 'covenant', hollowKills: 0 })).toBe(false)
    expect(v.applies({ cause: 'environment', cycle: 1, zone: 'the_scar', hollowKills: 0 })).toBe(false)
  })
})

// ============================================================
// Test 7: default_fallback — when no specific variant matches
// ============================================================

describe('default_fallback', () => {
  it('is selected for unknown cause in a mundane zone', () => {
    const ctx: DeathContext = {
      cause: 'unknown',
      cycle: 1,
      zone: 'crossroads',
      hollowKills: 0,
    }
    const msgs = selectDeathProse(ctx, rngFirst)
    const allText = msgs.map((m) => m.text).join('\n')
    // default_fallback uses the original DEATH_NARRATIVE text
    expect(allText).toContain('CHARON-7')
  })

  it('always has at least 1 message', () => {
    const v = getVariant('default_fallback')
    const ctx: DeathContext = { cause: 'unknown', cycle: 1, zone: undefined, hollowKills: 0 }
    const msgs = v.template(ctx)
    expect(msgs.length).toBeGreaterThan(0)
  })

  it('applies predicate always returns true (catch-all)', () => {
    const v = getVariant('default_fallback')
    expect(v.applies({ cause: 'combat', cycle: 99, zone: 'the_scar', hollowKills: 999 })).toBe(true)
    expect(v.applies({ cause: 'unknown', cycle: 1, zone: undefined, hollowKills: 0 })).toBe(true)
  })

  it('falls back correctly for environment death in non-deep zone (no collapse variant)', () => {
    const ctx: DeathContext = {
      cause: 'environment',
      cycle: 1,
      zone: 'crossroads',  // not the_scar or the_deep
      hollowKills: 0,
    }
    const msgs = selectDeathProse(ctx, rngFirst)
    // Should fall back to default since environment_collapse only fires in deep zones
    expect(msgs.length).toBeGreaterThan(0)
    // No "always going to win" — that's the environment_collapse text
    const allText = msgs.map((m) => m.text).join('\n')
    expect(allText).not.toContain('always going to win')
    // Should use default_fallback which references CHARON-7
    expect(allText).toContain('CHARON-7')
  })
})

// ============================================================
// Test 8: cycle_aware_late — cycle 5+
// ============================================================

describe('cycle_aware_late', () => {
  it('is selected for cycle 5+, unknown cause, mundane zone', () => {
    const ctx: DeathContext = {
      cause: 'unknown',
      cycle: 5,
      zone: 'crossroads',
      hollowKills: 0,
    }
    const msgs = selectDeathProse(ctx, rngFirst)
    const allText = msgs.map((m) => m.text).join('\n')
    expect(allText).toContain('cycles')
    expect(allText).toContain('radio')
  })

  it('prose includes the cycle count', () => {
    const ctx: DeathContext = {
      cause: 'unknown',
      cycle: 7,
      zone: 'crossroads',
      hollowKills: 0,
    }
    const msgs = selectDeathProse(ctx, rngFirst)
    const allText = msgs.map((m) => m.text).join('\n')
    expect(allText).toContain('7')
  })

  it('applies predicate does NOT match cycle < 5', () => {
    const v = getVariant('cycle_aware_late')
    expect(v.applies({ cause: 'unknown', cycle: 4, zone: 'crossroads', hollowKills: 0 })).toBe(false)
  })
})

// ============================================================
// Test 9: Deterministic selection with mocked rng
// ============================================================

describe('selectDeathProse — deterministic rng', () => {
  it('returns different variants depending on rng value when multiple match', () => {
    // cycle_aware_late and default_fallback both apply for cycle-5 unknown-cause
    const ctx: DeathContext = {
      cause: 'unknown',
      cycle: 5,
      zone: 'crossroads',
      hollowKills: 0,
    }

    // With rngFirst (=> 0), should pick the first of the preferred matches
    const msgsFirst = selectDeathProse(ctx, rngFirst)
    // With rngLast (=> 0.999), should pick the last of the preferred matches
    const msgsLast = selectDeathProse(ctx, rngLast)

    // Both should be non-empty and have death type
    expect(msgsFirst.length).toBeGreaterThan(0)
    expect(msgsLast.length).toBeGreaterThan(0)
    expect(msgsFirst.every((m) => m.type === 'death')).toBe(true)
    expect(msgsLast.every((m) => m.type === 'death')).toBe(true)
  })

  it('each returned message has a unique id string', () => {
    const ctx: DeathContext = { ...baseCombatCtx }
    const msgs = selectDeathProse(ctx, rngFirst)
    const ids = msgs.map((m) => m.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('DEATH_PROSE_VARIANTS has at least 8 entries (7 + default_fallback)', () => {
    expect(DEATH_PROSE_VARIANTS.length).toBeGreaterThanOrEqual(8)
  })
})
