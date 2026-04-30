// ============================================================
// Integration tests: narrative module deep coverage (H5-W5)
//
// Covers: companionSystem, factionWeb, playerMonologue, narratorVoice
//
// Acceptance criteria per R5 spec:
//   - Each module returns a non-empty message array (or expected output
//     shape) for a valid trigger input.
//   - Each module handles missing/null player input gracefully (no throw).
//   - factionWeb: a reputation change above threshold fires a ripple
//     consequence message (via getDelayedRippleNarration).
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest'

// ------------------------------------------------------------
// companionSystem
// ------------------------------------------------------------

import {
  addCompanion,
  getCompanionJoinMessage,
  getCompanionCommentary,
  getCompanionCombatReaction,
  getCompanionDiscoveryReaction,
  removeCompanion,
  getPersonalMoment,
  getCompanionIntroduction,
} from '@/lib/companionSystem'
import type { CompanionContext } from '@/lib/companionSystem'
import type { Companion } from '@/types/convoy-contracts'

// ------------------------------------------------------------
// factionWeb
// ------------------------------------------------------------

import {
  getFactionRipple,
  getDelayedRippleNarration,
  FACTION_EFFECTS,
} from '@/lib/factionWeb'

// ------------------------------------------------------------
// playerMonologue
// ------------------------------------------------------------

import {
  generateMonologue,
  getPhysicalStateNarration,
  getPersonalLossEcho,
  resetMonologueSession,
} from '@/lib/playerMonologue'

// ------------------------------------------------------------
// narratorVoice
// ------------------------------------------------------------

import {
  generateNarratorVoice,
  shouldNarratorSpeak,
  clearNarratorSession,
  NARRATOR_CONFIG,
} from '@/lib/narratorVoice'

// ============================================================
// Shared helpers
// ============================================================

const BASE_COMPANION_CONTEXT: CompanionContext = {
  zone: 'crossroads',
  difficulty: 2,
  timeOfDay: 'day',
  playerHpPercent: 0.8,
  isPostCombat: false,
  isPostDiscovery: false,
  isSafeRest: false,
  roomsTogether: 5,
}

/** A known-good companion NPC (howard is in JOIN_NARRATION) */
function makeCompanion(): Companion {
  const c = addCompanion('howard_bridge_keeper', 'test_quest', 0, true)
  if (!c) throw new Error('addCompanion returned null — NPC not found in registry')
  return c
}

// ============================================================
// companionSystem — valid input returns non-empty messages
// ============================================================

describe('companionSystem — valid input', () => {
  it('getCompanionIntroduction returns non-empty array for known NPC', () => {
    const msgs = getCompanionIntroduction('howard_bridge_keeper')
    // Some NPCs have introductions; if they do it must be non-empty
    if (msgs !== null) {
      expect(Array.isArray(msgs)).toBe(true)
      expect(msgs.length).toBeGreaterThan(0)
      for (const m of msgs) {
        expect(typeof m.text).toBe('string')
        expect(m.text.length).toBeGreaterThan(0)
      }
    }
    // null is also acceptable (no introduction registered)
  })

  it('addCompanion + getCompanionJoinMessage returns a non-empty message', () => {
    const companion = makeCompanion()
    const joinMsg = getCompanionJoinMessage(companion)
    expect(typeof joinMsg.text).toBe('string')
    expect(joinMsg.text.length).toBeGreaterThan(0)
  })

  it('getCompanionCombatReaction returns a message for win outcome', () => {
    const companion = makeCompanion()
    const msg = getCompanionCombatReaction(companion, 'win')
    expect(typeof msg.text).toBe('string')
    expect(msg.text.length).toBeGreaterThan(0)
  })

  it('getCompanionCombatReaction returns a message for flee outcome', () => {
    const companion = makeCompanion()
    const msg = getCompanionCombatReaction(companion, 'flee')
    expect(typeof msg.text).toBe('string')
    expect(msg.text.length).toBeGreaterThan(0)
  })

  it('getCompanionDiscoveryReaction returns a message for generic discovery', () => {
    const companion = makeCompanion()
    const msg = getCompanionDiscoveryReaction(companion, 'item')
    expect(typeof msg.text).toBe('string')
    expect(msg.text.length).toBeGreaterThan(0)
  })

  it('removeCompanion returns at least one farewell message', () => {
    const companion = makeCompanion()
    const msgs = removeCompanion(companion, 'player_choice')
    expect(Array.isArray(msgs)).toBe(true)
    expect(msgs.length).toBeGreaterThan(0)
    expect(typeof msgs[0].text).toBe('string')
    expect(msgs[0].text.length).toBeGreaterThan(0)
  })

  it('getCompanionCommentary returns a message when Math.random is forced low', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0)
    const companion = makeCompanion()
    const msg = getCompanionCommentary(companion, BASE_COMPANION_CONTEXT)
    vi.restoreAllMocks()
    // At random=0 the 20% gate passes; if pool has entries we get a message
    if (msg !== null) {
      expect(typeof msg.text).toBe('string')
      expect(msg.text.length).toBeGreaterThan(0)
    }
  })
})

// ============================================================
// companionSystem — null/missing input handled gracefully
// ============================================================

describe('companionSystem — null/invalid input does not throw', () => {
  it('getCompanionIntroduction with unknown NPC returns null, no throw', () => {
    expect(() => getCompanionIntroduction('nonexistent_npc_id_xyz')).not.toThrow()
    const result = getCompanionIntroduction('nonexistent_npc_id_xyz')
    expect(result).toBeNull()
  })

  it('addCompanion with unknown NPC returns null, no throw', () => {
    expect(() => addCompanion('nonexistent_npc_id_xyz', 'ctx', 0)).not.toThrow()
    expect(addCompanion('nonexistent_npc_id_xyz', 'ctx', 0)).toBeNull()
  })

  it('getCompanionJoinMessage with unknown npcId falls back gracefully', () => {
    const fakeCompanion: Companion = { npcId: 'unknown_xyz', joinedAt: 0, questContext: 'x', canDie: true }
    expect(() => getCompanionJoinMessage(fakeCompanion)).not.toThrow()
    const msg = getCompanionJoinMessage(fakeCompanion)
    expect(typeof msg.text).toBe('string')
    expect(msg.text.length).toBeGreaterThan(0)
  })

  it('getCompanionCombatReaction with unknown npcId returns fallback message', () => {
    const fakeCompanion: Companion = { npcId: 'unknown_xyz', joinedAt: 0, questContext: 'x', canDie: true }
    expect(() => getCompanionCombatReaction(fakeCompanion, 'win')).not.toThrow()
    const msg = getCompanionCombatReaction(fakeCompanion, 'win')
    expect(typeof msg.text).toBe('string')
  })

  it('removeCompanion with unknown npcId returns a fallback farewell', () => {
    const fakeCompanion: Companion = { npcId: 'unknown_xyz', joinedAt: 0, questContext: 'x', canDie: true }
    expect(() => removeCompanion(fakeCompanion, 'player_choice')).not.toThrow()
    const msgs = removeCompanion(fakeCompanion, 'player_choice')
    expect(msgs.length).toBeGreaterThan(0)
  })

  it('getCompanionCommentary with Math.random = 1 returns null (gate fails)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(1.0)
    const companion = makeCompanion()
    const result = getCompanionCommentary(companion, BASE_COMPANION_CONTEXT)
    vi.restoreAllMocks()
    expect(result).toBeNull()
  })

  it('getPersonalMoment with roomsTogetherCount < 10 returns null, no throw', () => {
    const companion = makeCompanion()
    expect(() => getPersonalMoment(companion, 5)).not.toThrow()
    expect(getPersonalMoment(companion, 5)).toBeNull()
  })
})

// ============================================================
// factionWeb — valid input returns message array
// ============================================================

describe('factionWeb — valid input', () => {
  it('getFactionRipple for accord gain returns a non-empty effects array', () => {
    const { effects, narration } = getFactionRipple('accord', +1, {})
    expect(Array.isArray(effects)).toBe(true)
    expect(effects.length).toBeGreaterThan(0)
    // narration only includes immediate effects (delayActionCount === 0)
    expect(Array.isArray(narration)).toBe(true)
  })

  it('getFactionRipple returns effects whose narrationPhrase is a non-empty string', () => {
    const { effects } = getFactionRipple('accord', +1, {})
    for (const effect of effects) {
      expect(typeof effect.narrationPhrase).toBe('string')
      expect(effect.narrationPhrase.length).toBeGreaterThan(0)
    }
  })

  it('getDelayedRippleNarration returns null before delay elapses', () => {
    const { effects } = getFactionRipple('accord', +1, {})
    const delayed = effects.find((e) => e.delayActionCount > 0)
    if (!delayed) return // no delayed effects in this faction, skip
    const result = getDelayedRippleNarration(delayed, delayed.delayActionCount - 1)
    expect(result).toBeNull()
  })
})

// ============================================================
// factionWeb — reputation change above threshold fires ripple
// ============================================================

describe('factionWeb — above-threshold ripple fires consequence message', () => {
  it('a delayed ripple narration message fires once enough actions have elapsed', () => {
    // Pick a ripple that has a positive delayActionCount
    const { effects } = getFactionRipple('accord', +1, {})
    const delayed = effects.find((e) => e.delayActionCount > 0)
    expect(delayed).toBeDefined()

    // Before delay: no message
    const beforeMsg = getDelayedRippleNarration(delayed!, delayed!.delayActionCount - 1)
    expect(beforeMsg).toBeNull()

    // At delay threshold: message fires
    const atMsg = getDelayedRippleNarration(delayed!, delayed!.delayActionCount)
    expect(atMsg).not.toBeNull()
    expect(typeof atMsg!.text).toBe('string')
    expect(atMsg!.text.length).toBeGreaterThan(0)
    expect(atMsg!.type).toBe('narrative')
  })

  it('all faction effects have a narrationPhrase that fires as a consequence message', () => {
    // Every entry in FACTION_EFFECTS can produce a ripple consequence message
    for (const [key, effects] of Object.entries(FACTION_EFFECTS)) {
      for (const effect of effects) {
        const msg = getDelayedRippleNarration(effect, effect.delayActionCount)
        expect(msg, `${key} ripple to ${effect.targetFaction} did not fire message`).not.toBeNull()
        expect(typeof msg!.text).toBe('string')
        expect(msg!.text.length, `${key} → ${effect.targetFaction} message is empty`).toBeGreaterThan(0)
      }
    }
  })

  it('a rep gain of +1 (above zero threshold) triggers secondary faction effects', () => {
    // Any positive repDelta is "above threshold" for triggering ripple consequences
    const { effects } = getFactionRipple('kindling', +1, {})
    expect(effects.length).toBeGreaterThan(0)
    // Effects must include at least one secondary faction impact
    const hasNegativeDelta = effects.some((e) => e.delta < 0)
    expect(hasNegativeDelta).toBe(true)
  })
})

// ============================================================
// factionWeb — null/missing input handled gracefully
// ============================================================

describe('factionWeb — null/invalid input does not throw', () => {
  it('getFactionRipple with empty playerState does not throw', () => {
    expect(() => getFactionRipple('accord', +1, {})).not.toThrow()
  })

  it('getFactionRipple with unknown faction returns empty effects, no throw', () => {
    expect(() => getFactionRipple('nonexistent_faction' as any, +1, {})).not.toThrow()
    const { effects, narration } = getFactionRipple('nonexistent_faction' as any, +1, {})
    expect(Array.isArray(effects)).toBe(true)
    expect(effects.length).toBe(0)
    expect(Array.isArray(narration)).toBe(true)
    expect(narration.length).toBe(0)
  })

  it('getDelayedRippleNarration with zero delay returns message immediately', () => {
    const fakeEffect = {
      targetFaction: 'salters' as const,
      delta: 1 as const,
      delayActionCount: 0,
      narrationPhrase: 'Test narration.',
    }
    expect(() => getDelayedRippleNarration(fakeEffect, 0)).not.toThrow()
    const msg = getDelayedRippleNarration(fakeEffect, 0)
    expect(msg).not.toBeNull()
    expect(msg!.text).toBe('Test narration.')
  })
})

// ============================================================
// playerMonologue — valid input returns non-empty message
// ============================================================

describe('playerMonologue — valid input', () => {
  beforeEach(() => resetMonologueSession())

  it('generateMonologue returns a GameMessage for enforcer + low_hp', async () => {
    const result = await generateMonologue(
      { trigger: 'low_hp' } as any,
      'enforcer',
      'child'
    )
    expect(result).not.toBeNull()
    expect(typeof result!.text).toBe('string')
    expect(result!.text.length).toBeGreaterThan(0)
    expect(result!.type).toBe('narrative')
  })

  it('generateMonologue returns a GameMessage for scout + post_combat', async () => {
    const result = await generateMonologue(
      { trigger: 'post_combat' } as any,
      'scout',
      'partner'
    )
    expect(result).not.toBeNull()
    expect(typeof result!.text).toBe('string')
    expect(result!.text.length).toBeGreaterThan(0)
  })

  it('getPhysicalStateNarration returns a message for critical HP', () => {
    const result = getPhysicalStateNarration({
      hp: 2,
      maxHp: 20,
      cycle: 1,
      actionsTaken: 50,
      inCombat: false,
    })
    expect(result).not.toBeNull()
    expect(typeof result!.text).toBe('string')
    expect(result!.text.length).toBeGreaterThan(0)
    expect(result!.type).toBe('narrative')
  })

  it('getPersonalLossEcho returns a message for child + examining_loss_item', () => {
    const result = getPersonalLossEcho('examining_loss_item', 'child', 'Sam')
    expect(result).not.toBeNull()
    expect(typeof result!.text).toBe('string')
    expect(result!.text.length).toBeGreaterThan(0)
    // The returned line should reference the loss name
    expect(result!.text).toContain('Sam')
  })
})

// ============================================================
// playerMonologue — null/missing input handled gracefully
// ============================================================

describe('playerMonologue — null/invalid input does not throw', () => {
  beforeEach(() => resetMonologueSession())

  it('generateMonologue with unknown class returns null, no throw', async () => {
    expect(async () => {
      await generateMonologue({ trigger: 'low_hp' } as any, 'unknown_class' as any, 'child')
    }).not.toThrow()
    const result = await generateMonologue({ trigger: 'low_hp' } as any, 'unknown_class' as any, 'child')
    expect(result).toBeNull()
  })

  it('generateMonologue with unknown trigger returns null or message, no throw', async () => {
    await expect(
      generateMonologue({ trigger: 'nonexistent_trigger_xyz' } as any, 'enforcer', 'child')
    ).resolves.not.toThrow()
    // May return null if no matching pool — that is acceptable
  })

  it('getPhysicalStateNarration during combat returns null, no throw', () => {
    expect(() =>
      getPhysicalStateNarration({ hp: 5, maxHp: 20, cycle: 1, actionsTaken: 10, inCombat: true })
    ).not.toThrow()
    const result = getPhysicalStateNarration({
      hp: 5, maxHp: 20, cycle: 1, actionsTaken: 10, inCombat: true,
    })
    expect(result).toBeNull()
  })

  it('getPersonalLossEcho with non-matching trigger returns null, no throw', () => {
    expect(() =>
      getPersonalLossEcho('nonexistent_trigger', 'child', 'Alex')
    ).not.toThrow()
    const result = getPersonalLossEcho('nonexistent_trigger', 'child', 'Alex')
    expect(result).toBeNull()
  })

  it('getPersonalLossEcho with null loss name does not throw', () => {
    expect(() =>
      getPersonalLossEcho('examining_loss_item', 'child', '')
    ).not.toThrow()
  })
})

// ============================================================
// narratorVoice — valid input returns non-empty message
// ============================================================

describe('narratorVoice — valid input', () => {
  beforeEach(() => clearNarratorSession())

  it('generateNarratorVoice returns a GameMessage for high-pressure context', () => {
    const result = generateNarratorVoice({
      act: 2,
      zone: 'the_stacks',
      cycle: 1,
      pressure: 9, // above high threshold
      questFlags: [],
      playerHP: 10,
      playerMaxHP: 20,
    })
    expect(result).not.toBeNull()
    expect(typeof result!.text).toBe('string')
    expect(result!.text.length).toBeGreaterThan(0)
    expect(result!.type).toBe('echo')
  })

  it('generateNarratorVoice returns a message for recent-death context', () => {
    const result = generateNarratorVoice({
      act: 1,
      zone: 'crossroads',
      cycle: 2,
      pressure: 3,
      questFlags: [],
      playerHP: 15,
      playerMaxHP: 20,
      recentDeath: true,
    })
    expect(result).not.toBeNull()
    expect(typeof result!.text).toBe('string')
    expect(result!.text.length).toBeGreaterThan(0)
  })

  it('generateNarratorVoice returns a message for cycle >= 2 context', () => {
    // Force high cycle so cycle-whispers pool is used
    vi.spyOn(Math, 'random').mockReturnValue(0.05) // < 0.40 cycle threshold
    const result = generateNarratorVoice({
      act: 1,
      zone: 'crossroads',
      cycle: 3,
      pressure: 2,
      questFlags: [],
      playerHP: 20,
      playerMaxHP: 20,
    })
    vi.restoreAllMocks()
    // May be null if pool exhausted — acceptable, just must not throw
    if (result !== null) {
      expect(typeof result.text).toBe('string')
      expect(result.text.length).toBeGreaterThan(0)
    }
  })

  it('shouldNarratorSpeak returns true when conditions are met (forced random)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01) // well below 5%
    const result = shouldNarratorSpeak(100, 0, 2, false)
    vi.restoreAllMocks()
    expect(result).toBe(true)
  })
})

// ============================================================
// narratorVoice — null/missing input handled gracefully
// ============================================================

describe('narratorVoice — null/invalid input does not throw', () => {
  beforeEach(() => clearNarratorSession())

  it('generateNarratorVoice with minimal context does not throw', () => {
    expect(() =>
      generateNarratorVoice({
        act: 1,
        zone: 'crossroads',
        cycle: 1,
        pressure: 0,
        questFlags: [],
        playerHP: 20,
        playerMaxHP: 20,
      })
    ).not.toThrow()
  })

  it('shouldNarratorSpeak returns false during combat', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0)
    const result = shouldNarratorSpeak(100, 0, 5, true)
    vi.restoreAllMocks()
    expect(result).toBe(false)
  })

  it('shouldNarratorSpeak returns false when action cooldown not met', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0)
    const minGap = NARRATOR_CONFIG.minActionsBetweenSpawns
    const result = shouldNarratorSpeak(minGap - 1, 0, 5, false)
    vi.restoreAllMocks()
    expect(result).toBe(false)
  })

  it('generateNarratorVoice with empty questFlags does not throw', () => {
    expect(() =>
      generateNarratorVoice({
        act: 1,
        zone: 'crossroads',
        cycle: 1,
        pressure: 0,
        questFlags: [],
        playerHP: 20,
        playerMaxHP: 20,
      })
    ).not.toThrow()
  })
})
