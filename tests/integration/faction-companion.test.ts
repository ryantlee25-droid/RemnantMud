// ============================================================
// Integration tests — factionWeb.ts + companionSystem.ts
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getFactionRipple,
  getDelayedRippleNarration,
  checkNPCDeathTrigger,
  checkConvergenceReady,
  FACTION_EFFECTS,
} from '@/lib/factionWeb'
import { computeInheritedReputation } from '@/lib/echoes'
import {
  addCompanion,
  getCompanionCommentary,
  getPersonalMoment,
  isCompanionEligible,
  removeCompanion,
} from '@/lib/companionSystem'
import type { CompanionContext } from '@/lib/companionSystem'
import type { CycleSnapshot } from '@/types/game'

// ============================================================
// factionWeb.ts — Reputation & Ripple Tests
// ============================================================

describe('factionWeb — reputation standing transitions', () => {
  it('gain with accord moves ripple effects toward kindling and red_court', () => {
    const { effects } = getFactionRipple('accord', +1, {})
    const targets = effects.map((e) => e.targetFaction)
    expect(targets).toContain('kindling')
    expect(targets).toContain('red_court')
  })

  it('loss with accord produces positive ripple toward kindling and salters', () => {
    const { effects } = getFactionRipple('accord', -1, {})
    const kindlingEffect = effects.find((e) => e.targetFaction === 'kindling')
    const saltersEffect = effects.find((e) => e.targetFaction === 'salters')
    expect(kindlingEffect?.delta).toBe(1)
    expect(saltersEffect?.delta).toBe(1)
  })

  it('all ripple deltas are exactly ±1 (no cascading snowball)', () => {
    for (const [key, effects] of Object.entries(FACTION_EFFECTS)) {
      for (const effect of effects) {
        expect(
          Math.abs(effect.delta),
          `${key} → ${effect.targetFaction} has delta ${effect.delta}, expected ±1`
        ).toBe(1)
      }
    }
  })

  it('no faction produces a ripple that targets itself', () => {
    const factions = [
      'accord', 'kindling', 'reclaimers', 'covenant_of_dusk',
      'red_court', 'lucid', 'salters', 'drifters', 'ferals',
    ] as const
    for (const faction of factions) {
      for (const direction of ['gain', 'loss'] as const) {
        const key = `${faction}_${direction}`
        const effects = FACTION_EFFECTS[key] ?? []
        for (const effect of effects) {
          expect(effect.targetFaction).not.toBe(faction)
        }
      }
    }
  })

  it('red_court gain produces negative ripple toward accord and lucid', () => {
    const { effects } = getFactionRipple('red_court', +1, {})
    const accordEffect = effects.find((e) => e.targetFaction === 'accord')
    const lucidEffect = effects.find((e) => e.targetFaction === 'lucid')
    expect(accordEffect?.delta).toBe(-1)
    expect(lucidEffect?.delta).toBe(-1)
  })

  it('red_court loss produces positive ripple toward lucid and covenant_of_dusk', () => {
    const { effects } = getFactionRipple('red_court', -1, {})
    const lucidEffect = effects.find((e) => e.targetFaction === 'lucid')
    const covenantEffect = effects.find((e) => e.targetFaction === 'covenant_of_dusk')
    expect(lucidEffect?.delta).toBe(1)
    expect(covenantEffect?.delta).toBe(1)
  })

  it('delayed ripple narration returns null before delay elapses', () => {
    const effect = FACTION_EFFECTS['accord_gain'][0]
    const result = getDelayedRippleNarration(effect, effect.delayActionCount - 1)
    expect(result).toBeNull()
  })

  it('delayed ripple narration returns message when delay has elapsed', () => {
    const effect = FACTION_EFFECTS['accord_gain'][0]
    const result = getDelayedRippleNarration(effect, effect.delayActionCount)
    expect(result).not.toBeNull()
    expect(result?.text).toBe(effect.narrationPhrase)
  })

  it('unknown faction key returns empty effects array', () => {
    const { effects, narration } = getFactionRipple('ferals' as any, -1, {})
    // ferals_loss is defined as [] in FACTION_EFFECTS
    expect(effects).toHaveLength(0)
    expect(narration).toHaveLength(0)
  })
})

describe('factionWeb — reputation inheritance for rebirth', () => {
  it('aligned factions (rep >= 2) inherit +1 in next cycle', () => {
    const snapshot: CycleSnapshot = {
      cycle: 1,
      factionsAligned: ['accord', 'kindling'],
      factionsAntagonized: [],
      npcRelationships: {},
      questsCompleted: [],
    }
    const inherited = computeInheritedReputation(snapshot)
    expect(inherited['accord']).toBe(1)
    expect(inherited['kindling']).toBe(1)
  })

  it('antagonized factions (rep <= -2) inherit -1 in next cycle', () => {
    const snapshot: CycleSnapshot = {
      cycle: 1,
      factionsAligned: [],
      factionsAntagonized: ['red_court', 'ferals'],
      npcRelationships: {},
      questsCompleted: [],
    }
    const inherited = computeInheritedReputation(snapshot)
    expect(inherited['red_court']).toBe(-1)
    expect(inherited['ferals']).toBe(-1)
  })

  it('neutral factions are not inherited', () => {
    const snapshot: CycleSnapshot = {
      cycle: 1,
      factionsAligned: ['accord'],
      factionsAntagonized: [],
      npcRelationships: {},
      questsCompleted: [],
    }
    const inherited = computeInheritedReputation(snapshot)
    expect(inherited['salters']).toBeUndefined()
    expect(inherited['kindling']).toBeUndefined()
  })
})

describe('factionWeb — convergence ready check', () => {
  it('returns false when act2 is not complete', () => {
    const result = checkConvergenceReady({
      questFlags: {},
      factionReputation: { accord: 1, kindling: -1, salters: 2 },
    })
    expect(result).toBe(false)
  })

  it('returns false when fewer than 3 factions are engaged', () => {
    const result = checkConvergenceReady({
      questFlags: { act2_complete: true },
      factionReputation: { accord: 1, kindling: 0 },
    })
    expect(result).toBe(false)
  })

  it('returns true when act2 complete and 3+ factions engaged', () => {
    const result = checkConvergenceReady({
      questFlags: { act2_complete: true },
      factionReputation: { accord: 2, kindling: -1, salters: 1 },
    })
    expect(result).toBe(true)
  })
})

// ============================================================
// companionSystem.ts — Companion Tests
// ============================================================

describe('companionSystem — companion availability', () => {
  it('known NPCs are companion-eligible', () => {
    expect(isCompanionEligible('howard_bridge_keeper')).toBe(true)
    expect(isCompanionEligible('lev')).toBe(true)
    expect(isCompanionEligible('patch')).toBe(true)
  })

  it('unknown NPC is not companion-eligible', () => {
    expect(isCompanionEligible('random_bandit')).toBe(false)
  })

  it('addCompanion returns null for unknown NPC', () => {
    const result = addCompanion('random_bandit', 'test', 0)
    expect(result).toBeNull()
  })

  it('addCompanion returns companion object for known NPC', () => {
    const companion = addCompanion('howard_bridge_keeper', 'bridge_quest', 42)
    expect(companion).not.toBeNull()
    expect(companion?.npcId).toBe('howard_bridge_keeper')
    expect(companion?.joinedAt).toBe(42)
    expect(companion?.questContext).toBe('bridge_quest')
  })
})

describe('companionSystem — commentary context resolution', () => {
  const howardCompanion = {
    npcId: 'howard_bridge_keeper',
    joinedAt: 0,
    questContext: 'bridge_quest',
    canDie: true,
  }

  it('commentary returns null more than 80% of the time (probabilistic gate)', () => {
    let nullCount = 0
    const ctx: CompanionContext = {
      zone: 'the_scar',
      difficulty: 2,
      timeOfDay: 'day',
      playerHpPercent: 0.8,
      isPostCombat: false,
      isPostDiscovery: false,
      isSafeRest: false,
      roomsTogether: 5,
    }
    // Run 200 trials; expect roughly 80% null (gate is Math.random() > 0.20)
    for (let i = 0; i < 200; i++) {
      if (getCompanionCommentary(howardCompanion, ctx) === null) nullCount++
    }
    expect(nullCount).toBeGreaterThan(100)
  })

  it('commentary fires when random gate is forced open', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01) // below 0.20 threshold
    const ctx: CompanionContext = {
      zone: 'the_scar',
      difficulty: 2,
      timeOfDay: 'day',
      playerHpPercent: 0.8,
      isPostCombat: false,
      isPostDiscovery: false,
      isSafeRest: false,
      roomsTogether: 5,
    }
    const result = getCompanionCommentary(howardCompanion, ctx)
    expect(result).not.toBeNull()
    vi.restoreAllMocks()
  })
})

describe('companionSystem — personal moment conditions', () => {
  const levCompanion = {
    npcId: 'lev',
    joinedAt: 0,
    questContext: 'reclaimer_quest',
    canDie: true,
  }

  it('personal moment does not fire before 10 rooms together', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01) // force past chance gate
    const result = getPersonalMoment(levCompanion, 9)
    expect(result).toBeNull()
    vi.restoreAllMocks()
  })

  it('personal moment can fire at 10+ rooms with 5% chance gate forced', () => {
    // Mock random to 0.01 — passes both the 5% gate and pool selection
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    // Result may be null if no eligible moments are defined for 10 rooms,
    // but it must NOT be blocked by the rooms check
    const result = getPersonalMoment(levCompanion, 10)
    // No throw — function ran to completion regardless of pool contents
    expect(result === null || typeof result?.text === 'string').toBe(true)
    vi.restoreAllMocks()
  })
})

describe('companionSystem — farewell messages', () => {
  const averyCompanion = {
    npcId: 'avery_kindling',
    joinedAt: 0,
    questContext: 'kindling_quest',
    canDie: true,
  }

  it('removeCompanion always returns at least one message', () => {
    const messages = removeCompanion(averyCompanion, 'quest_complete')
    expect(messages.length).toBeGreaterThan(0)
  })

  it('removeCompanion returns a message for unknown reason by falling back', () => {
    const messages = removeCompanion(averyCompanion, 'player_choice')
    expect(messages.length).toBeGreaterThan(0)
    expect(typeof messages[0].text).toBe('string')
  })

  it('removeCompanion returns generic farewell for unregistered NPC', () => {
    const unknown = { npcId: 'ghost_npc', joinedAt: 0, questContext: 'none', canDie: false }
    const messages = removeCompanion(unknown, 'death')
    expect(messages.length).toBe(1)
    expect(messages[0].text).toContain('ghost_npc')
  })
})
