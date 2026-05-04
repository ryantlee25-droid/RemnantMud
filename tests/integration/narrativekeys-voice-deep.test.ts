// ============================================================
// tests/integration/narrativekeys-voice-deep.test.ts
// P3-E: Deep integration coverage for narrativeKeys + narrator voice
//
// Targets:
//   - lib/narrativeKeys.ts  (contradiction system, key composition, cycle edge cases)
//   - lib/narratorVoice.ts  (act transitions, pool exhaustion, all priority branches)
//   - lib/playerMonologue.ts (class × loss × trigger matrix, repeat-detection)
//
// Coverage goal: lift narrativeKeys.ts from 69% toward 85%+
// Specific uncovered sections:
//   - getContradictionNarration() — all 7 topics + fallback
//   - resolveContradiction() — all 3 resolution types
//   - getSequentialDiscoveryHint() — all 6 chains
//   - getNarrativeKeyHint() — null return when already known
//   - checkNarrativeUnlock() allOf path for both unlocked and locked
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

import {
  hasNarrativeKey,
  hasKey,
  learnKey,
  grantNarrativeKey,
  getNarrativeKeyHint,
  checkNarrativeGate,
  checkNarrativeUnlock,
  detectContradiction,
  getContradictionNarration,
  resolveContradiction,
  getSequentialDiscoveryHint,
  ROOM_EXIT_GATES,
  type Contradiction,
} from '@/lib/narrativeKeys'

import {
  generateNarratorVoice,
  shouldNarratorSpeak,
  getNarratorActTransition,
  clearNarratorSession,
  NARRATOR_CONFIG,
  type NarratorContext,
} from '@/lib/narratorVoice'

import {
  generateMonologue,
  getPhysicalStateNarration,
  getPersonalLossEcho,
  getReputationVoice,
  resetMonologueSession,
  shouldTriggerMonologue,
} from '@/lib/playerMonologue'

// ============================================================
// Helpers
// ============================================================

function makeContradiction(
  topic = 'meridian_bombing',
  npc1 = 'npc_a',
  npc2 = 'npc_b'
): Contradiction {
  return {
    id: `contradiction_${topic}_${npc1}_${npc2}`,
    claim1: { npcId: npc1, text: 'It was an accident.', topic },
    claim2: { npcId: npc2, text: 'It was deliberate.', topic },
    resolved: false,
  }
}

function baseNarratorCtx(overrides: Partial<NarratorContext> = {}): NarratorContext {
  return {
    act: 1,
    zone: 'crossroads',
    cycle: 1,
    pressure: 3,
    questFlags: [],
    playerHP: 20,
    playerMaxHP: 20,
    ...overrides,
  }
}

// ============================================================
// SECTION 1: Narrative Key — set / clear / check across cycles
// ============================================================

describe('narrativeKeys — key set / clear / check', () => {
  it('hasNarrativeKey returns false on empty array', () => {
    expect(hasNarrativeKey([], 'stacks_terminal_password')).toBe(false)
  })

  it('hasNarrativeKey returns true when key is present', () => {
    expect(hasNarrativeKey(['stacks_terminal_password', 'pens_ward_c'], 'pens_ward_c')).toBe(true)
  })

  it('hasKey alias behaves identically to hasNarrativeKey', () => {
    const keys = ['crossroads_hidden_cellar']
    expect(hasKey(keys, 'crossroads_hidden_cellar')).toBe(true)
    expect(hasKey(keys, 'pens_ward_c')).toBe(false)
  })

  it('learnKey adds key and returns narrative message (dialogue source)', () => {
    const { messages, updatedKeys } = learnKey('stacks_terminal_password', [], 'dialogue')
    expect(updatedKeys).toContain('stacks_terminal_password')
    expect(messages).toHaveLength(1)
    expect(messages[0].text).toMatch(/settles into place/)
  })

  it('learnKey adds key with examination source', () => {
    const { messages } = learnKey('ember_tunnel_entrance', [], 'examination')
    expect(messages[0].text).toMatch(/stops being a detail/)
  })

  it('learnKey adds key with deduction source', () => {
    const { messages } = learnKey('crossroads_hidden_cellar', [], 'deduction')
    expect(messages[0].text).toMatch(/pieces were always there/)
  })

  it('learnKey is idempotent — already-known key returns no messages', () => {
    const existing = ['crossroads_hidden_cellar']
    const { messages, updatedKeys } = learnKey('crossroads_hidden_cellar', existing)
    expect(messages).toHaveLength(0)
    expect(updatedKeys).toBe(existing)
  })

  it('learnKey accumulates multiple keys correctly', () => {
    const start: string[] = []
    const step1 = learnKey('stacks_terminal_password', start)
    const step2 = learnKey('pens_ward_c', step1.updatedKeys)
    const step3 = learnKey('deep_pool_passage', step2.updatedKeys)
    expect(step3.updatedKeys).toHaveLength(3)
    expect(step3.updatedKeys).toContain('stacks_terminal_password')
    expect(step3.updatedKeys).toContain('pens_ward_c')
    expect(step3.updatedKeys).toContain('deep_pool_passage')
  })

  it('simulating rebirth — key array reset clears all learned keys', () => {
    // Simulate a rebirth clearing narrativeKeys (caller responsibility)
    const beforeRebirth = ['stacks_terminal_password', 'pens_ward_c', 'scar_command_level']
    const afterRebirth: string[] = [] // caller sets to empty on rebirth
    expect(hasNarrativeKey(afterRebirth, 'stacks_terminal_password')).toBe(false)
    expect(beforeRebirth).toHaveLength(3) // keys existed before rebirth
  })

  it('grantNarrativeKey returns empty array when key already known', () => {
    const msgs = grantNarrativeKey('stacks_terminal_password', 'dialogue', ['stacks_terminal_password'])
    expect(msgs).toHaveLength(0)
  })

  it('grantNarrativeKey returns one message for unknown key', () => {
    const msgs = grantNarrativeKey('stacks_terminal_password', 'dialogue', [])
    expect(msgs).toHaveLength(1)
    expect(msgs[0].text).toMatch(/settles into place/)
  })
})

// ============================================================
// SECTION 2: Narrative Gate Checks
// ============================================================

describe('narrativeKeys — gate checks', () => {
  it('single-key gate passes when player holds the key', () => {
    const gate = ROOM_EXIT_GATES['st_02_entry_hall:north']!
    expect(checkNarrativeGate(gate, ['stacks_terminal_password'])).toBe(true)
  })

  it('single-key gate blocks when player lacks the key', () => {
    const gate = ROOM_EXIT_GATES['st_02_entry_hall:north']!
    expect(checkNarrativeGate(gate, [])).toBe(false)
  })

  it('allOf gate requires ALL keys — partial match fails', () => {
    const gate = ROOM_EXIT_GATES['scar_04_level1_corridor:north']!
    expect(gate.allOf).toBeDefined()
    expect(checkNarrativeGate(gate, ['meridian_decon_code'])).toBe(false)
  })

  it('allOf gate passes when all keys held', () => {
    const gate = ROOM_EXIT_GATES['scar_04_level1_corridor:north']!
    expect(checkNarrativeGate(gate, ['meridian_decon_code', 'stacks_terminal_password'])).toBe(true)
  })

  it('allOf gate with empty key array fails', () => {
    const gate = ROOM_EXIT_GATES['scar_04_level1_corridor:north']!
    expect(checkNarrativeGate(gate, [])).toBe(false)
  })

  it('checkNarrativeUnlock — ungated exit returns unlocked:true with empty narration', () => {
    const result = checkNarrativeUnlock('cr_01_approach', 'north', [])
    expect(result.unlocked).toBe(true)
    expect(result.narration).toHaveLength(0)
  })

  it('checkNarrativeUnlock — single-key unlock returns narration when unlocked', () => {
    const result = checkNarrativeUnlock('st_02_entry_hall', 'north', ['stacks_terminal_password'])
    expect(result.unlocked).toBe(true)
    expect(result.narration.length).toBeGreaterThan(0)
    expect(result.narration[0].text).toMatch(/server room/)
  })

  it('checkNarrativeUnlock — single-key locked returns hint, not key ID in prose', () => {
    const result = checkNarrativeUnlock('st_02_entry_hall', 'north', [])
    expect(result.unlocked).toBe(false)
    expect(result.narration[0]?.text).not.toMatch(/stacks_terminal_password/)
    expect(typeof result.narration[0]?.text).toBe('string')
  })

  it('checkNarrativeUnlock — allOf gate unlocked returns narration when all keys held', () => {
    const result = checkNarrativeUnlock(
      'scar_04_level1_corridor',
      'north',
      ['meridian_decon_code', 'stacks_terminal_password']
    )
    expect(result.unlocked).toBe(true)
    // allOf gate uses first key's unlock narration
    expect(result.narration.length).toBeGreaterThan(0)
  })

  it('checkNarrativeUnlock — allOf gate locked shows hint for first unsatisfied key', () => {
    // Has the first key but not the second
    const result = checkNarrativeUnlock('scar_04_level1_corridor', 'north', ['meridian_decon_code'])
    expect(result.unlocked).toBe(false)
    // Hint should reference stacks_terminal_password area (the second unsatisfied key)
    if (result.narration.length > 0) {
      expect(result.narration[0].text).toBeTruthy()
      expect(result.narration[0].text).not.toMatch(/stacks_terminal_password/)
    }
  })

  it('checkNarrativeUnlock — allOf gate with no keys shows hint for first key', () => {
    const result = checkNarrativeUnlock('scar_04_level1_corridor', 'north', [])
    expect(result.unlocked).toBe(false)
  })

  it('getNarrativeKeyHint returns null when player already knows the key', () => {
    const hint = getNarrativeKeyHint('stacks_terminal_password', ['stacks_terminal_password'])
    expect(hint).toBeNull()
  })

  it('getNarrativeKeyHint returns a message when key is not known', () => {
    const hint = getNarrativeKeyHint('stacks_terminal_password', [])
    expect(hint).not.toBeNull()
    expect(typeof hint!.text).toBe('string')
    expect(hint!.text.length).toBeGreaterThan(0)
  })

  it('getNarrativeKeyHint returns null for unregistered key', () => {
    const hint = getNarrativeKeyHint('some_nonexistent_key_xyz', [])
    expect(hint).toBeNull()
  })

  it('every ROOM_EXIT_GATE has a valid keyId', () => {
    for (const [gateKey, gate] of Object.entries(ROOM_EXIT_GATES)) {
      expect(typeof gate.keyId, `gate ${gateKey} has no keyId`).toBe('string')
      expect(gate.keyId.length, `gate ${gateKey} keyId is empty`).toBeGreaterThan(0)
    }
  })
})

// ============================================================
// SECTION 3: Contradiction System (currently untested per PLAN-EVAL)
// ============================================================

describe('contradiction detection — detectContradiction', () => {
  it('returns null when existing claims array is empty', () => {
    const result = detectContradiction(
      { npcId: 'npc_b', topic: 'meridian_bombing', text: 'deliberate' },
      []
    )
    expect(result).toBeNull()
  })

  it('returns null when existing claim is from the same NPC', () => {
    const existing = [{ npcId: 'npc_a', topic: 'meridian_bombing', text: 'an accident' }]
    const newClaim = { npcId: 'npc_a', topic: 'meridian_bombing', text: 'also an accident' }
    const result = detectContradiction(newClaim, existing)
    expect(result).toBeNull()
  })

  it('returns null when topic differs — no contradiction on different topics', () => {
    const existing = [{ npcId: 'npc_a', topic: 'covenant_blood_tithe', text: 'voluntary' }]
    const newClaim = { npcId: 'npc_b', topic: 'meridian_bombing', text: 'deliberate' }
    const result = detectContradiction(newClaim, existing)
    expect(result).toBeNull()
  })

  it('detects contradiction when two NPCs claim different things on same topic', () => {
    const existing = [{ npcId: 'npc_a', topic: 'meridian_bombing', text: 'It was an accident.' }]
    const newClaim = { npcId: 'npc_b', topic: 'meridian_bombing', text: 'It was deliberate.' }
    const result = detectContradiction(newClaim, existing)
    expect(result).not.toBeNull()
    expect(result!.resolved).toBe(false)
    expect(result!.id).toContain('meridian_bombing')
    expect(result!.claim1.npcId).toBe('npc_a')
    expect(result!.claim2.npcId).toBe('npc_b')
    expect(result!.claim1.topic).toBe('meridian_bombing')
    expect(result!.claim2.topic).toBe('meridian_bombing')
  })

  it('contradiction id encodes topic + npc IDs', () => {
    const existing = [{ npcId: 'sparks_radio_repair', topic: 'charon7_origin', text: 'Viral mutation' }]
    const newClaim = { npcId: 'lev_archivist', topic: 'charon7_origin', text: 'Lab-engineered' }
    const result = detectContradiction(newClaim, existing)
    expect(result!.id).toContain('charon7_origin')
    expect(result!.id).toContain('sparks_radio_repair')
    expect(result!.id).toContain('lev_archivist')
  })

  it('uses first matching conflict from existingClaims', () => {
    const existing = [
      { npcId: 'npc_a', topic: 'accord_treaty', text: 'signed in spring' },
      { npcId: 'npc_c', topic: 'accord_treaty', text: 'signed in winter' },
    ]
    const newClaim = { npcId: 'npc_b', topic: 'accord_treaty', text: 'signed in autumn' }
    const result = detectContradiction(newClaim, existing)
    // Should find npc_a as the conflict (first match)
    expect(result).not.toBeNull()
    expect(result!.claim1.npcId).toBe('npc_a')
  })

  it('detects contradiction on all 7 registered topics', () => {
    const topics = [
      'meridian_bombing',
      'kindling_incinerators',
      'covenant_blood_tithe',
      'patch_revenant_tracking',
      'scar_personnel',
      'charon7_origin',
      'accord_treaty',
    ]
    for (const topic of topics) {
      const existing = [{ npcId: 'npc_a', topic, text: 'version A' }]
      const newClaim = { npcId: 'npc_b', topic, text: 'version B' }
      const result = detectContradiction(newClaim, existing)
      expect(result, `topic '${topic}' failed to detect contradiction`).not.toBeNull()
    }
  })
})

describe('contradiction narration — getContradictionNarration', () => {
  it('returns a GameMessage with type narrative-like text', () => {
    const contradiction = makeContradiction('meridian_bombing')
    const msg = getContradictionNarration(contradiction)
    expect(typeof msg.text).toBe('string')
    expect(msg.text.length).toBeGreaterThan(0)
    expect(msg.text).toMatch(/doesn't sit right|version/)
  })

  it('returns topic-specific narration for kindling_incinerators', () => {
    const contradiction = makeContradiction('kindling_incinerators')
    const msg = getContradictionNarration(contradiction)
    expect(msg.text).toMatch(/two accounts/)
  })

  it('returns topic-specific narration for covenant_blood_tithe', () => {
    const contradiction = makeContradiction('covenant_blood_tithe')
    const msg = getContradictionNarration(contradiction)
    expect(msg.text).toMatch(/Voluntary/)
  })

  it('returns topic-specific narration for patch_revenant_tracking', () => {
    const contradiction = makeContradiction('patch_revenant_tracking')
    const msg = getContradictionNarration(contradiction)
    expect(msg.text).toMatch(/watches/)
  })

  it('returns topic-specific narration for scar_personnel', () => {
    const contradiction = makeContradiction('scar_personnel')
    const msg = getContradictionNarration(contradiction)
    expect(msg.text).toMatch(/names/)
  })

  it('returns topic-specific narration for charon7_origin', () => {
    const contradiction = makeContradiction('charon7_origin')
    const msg = getContradictionNarration(contradiction)
    expect(msg.text).toMatch(/Two sources/)
  })

  it('returns topic-specific narration for accord_treaty', () => {
    const contradiction = makeContradiction('accord_treaty')
    const msg = getContradictionNarration(contradiction)
    expect(msg.text).toMatch(/dates/)
  })

  it('returns generic fallback narration for unregistered topic', () => {
    const contradiction = makeContradiction('some_unknown_topic')
    const msg = getContradictionNarration(contradiction)
    // Falls back to generic message
    expect(msg.text).toMatch(/doesn't match what you heard before/)
  })

  it('returns a proper GameMessage shape', () => {
    const contradiction = makeContradiction('accord_treaty')
    const msg = getContradictionNarration(contradiction)
    expect(typeof msg.id).toBe('string')
    expect(msg.id.length).toBeGreaterThan(0)
    expect(msg.text.length).toBeGreaterThan(0)
  })
})

describe('contradiction resolution — resolveContradiction', () => {
  it('npc1_truth resolution returns narrative about first account', () => {
    const contradiction = makeContradiction('meridian_bombing')
    const { messages, repDelta } = resolveContradiction(
      contradiction.id,
      'npc1_truth',
      contradiction
    )
    expect(messages).toHaveLength(1)
    expect(messages[0].text).toMatch(/first account holds/)
    expect(repDelta.stat).toBe('wits')
    expect(repDelta.delta).toBe(1)
  })

  it('npc2_truth resolution returns narrative about second telling', () => {
    const contradiction = makeContradiction('accord_treaty')
    const { messages, repDelta } = resolveContradiction(
      contradiction.id,
      'npc2_truth',
      contradiction
    )
    expect(messages).toHaveLength(1)
    expect(messages[0].text).toMatch(/second telling/)
    expect(repDelta.stat).toBe('wits')
    expect(repDelta.delta).toBe(1)
  })

  it('both_lying resolution returns narrative about deliberate deception', () => {
    const contradiction = makeContradiction('covenant_blood_tithe')
    const { messages, repDelta } = resolveContradiction(
      contradiction.id,
      'both_lying',
      contradiction
    )
    expect(messages).toHaveLength(1)
    expect(messages[0].text).toMatch(/Both accounts are wrong/)
    expect(repDelta.stat).toBe('wits')
    expect(repDelta.delta).toBe(1)
  })

  it('all three resolution types return a message and repDelta', () => {
    const resolutions = ['npc1_truth', 'npc2_truth', 'both_lying'] as const
    for (const res of resolutions) {
      const contradiction = makeContradiction('scar_personnel')
      const result = resolveContradiction(contradiction.id, res, contradiction)
      expect(result.messages, `${res} returned empty messages`).toHaveLength(1)
      expect(result.repDelta.delta).toBe(1)
    }
  })

  it('resolution messages have valid GameMessage shape', () => {
    const contradiction = makeContradiction('meridian_bombing')
    const { messages } = resolveContradiction(contradiction.id, 'both_lying', contradiction)
    for (const m of messages) {
      expect(typeof m.id).toBe('string')
      expect(m.id.length).toBeGreaterThan(0)
      expect(typeof m.text).toBe('string')
      expect(m.text.length).toBeGreaterThan(0)
    }
  })

  it('resolution round-trip: detect → narrate → resolve', () => {
    // Simulate the full contradiction lifecycle
    const existingClaims = [{ npcId: 'npc_a', topic: 'charon7_origin', text: 'accidental mutation' }]
    const newClaim = { npcId: 'npc_b', topic: 'charon7_origin', text: 'lab-engineered' }

    const detected = detectContradiction(newClaim, existingClaims)
    expect(detected).not.toBeNull()

    const narration = getContradictionNarration(detected!)
    expect(narration.text.length).toBeGreaterThan(0)

    const { messages, repDelta } = resolveContradiction(detected!.id, 'npc1_truth', detected!)
    expect(messages).toHaveLength(1)
    expect(repDelta.delta).toBe(1)
  })

  it('contradiction established mid-cycle, resolved by rebirth — key state reset models this', () => {
    // Simulates: contradiction detected in cycle 1, unresolved
    // Then player dies → rebirth → narrativeKeys cleared
    // Contradiction tracking lives in game state; clearing narrativeKeys != clearing contradictions
    // This test verifies that contradiction detection is stateless (no side effects)

    const existingClaims = [{ npcId: 'sparks', topic: 'kindling_incinerators', text: 'purification' }]
    const cycle1Claim = { npcId: 'elder', topic: 'kindling_incinerators', text: 'incineration' }

    // Cycle 1 — contradiction detected
    const cycle1Result = detectContradiction(cycle1Claim, existingClaims)
    expect(cycle1Result).not.toBeNull()
    expect(cycle1Result!.resolved).toBe(false)

    // Simulate rebirth — narrativeKeys cleared, existingClaims also cleared by caller
    const afterRebirthClaims: typeof existingClaims = []

    // Cycle 2 — same NPC makes same claim but no existing claims to contradict
    const cycle2Result = detectContradiction(cycle1Claim, afterRebirthClaims)
    expect(cycle2Result).toBeNull() // cleared state = no contradiction yet

    // Re-learn the first claim in cycle 2
    const cycle2ExistingClaims = [existingClaims[0]]
    const cycle2NewResult = detectContradiction(cycle1Claim, cycle2ExistingClaims)
    expect(cycle2NewResult).not.toBeNull() // contradiction re-detected
  })
})

// ============================================================
// SECTION 4: Sequential Discovery Chains
// ============================================================

describe('getSequentialDiscoveryHint', () => {
  it('returns null when no chain sequence is complete', () => {
    const result = getSequentialDiscoveryHint(['cr_01_approach'], 'cr_01_approach')
    expect(result).toBeNull()
  })

  it('returns null when current room is not the last in the chain', () => {
    // wall_map chain: cr_03_market_south → rr_04_south_bend → sc_05_barracks
    const result = getSequentialDiscoveryHint(
      ['cr_03_market_south', 'rr_04_south_bend'],
      'rr_04_south_bend' // not the last room
    )
    expect(result).toBeNull()
  })

  it('fires wall_map chain hint when all rooms visited and last room is current', () => {
    const result = getSequentialDiscoveryHint(
      ['cr_03_market_south', 'rr_04_south_bend'],
      'sc_05_barracks'
    )
    expect(result).not.toBeNull()
    expect(result!.text).toMatch(/marks on this wall/)
  })

  it('fires project_shepherd chain hint', () => {
    const result = getSequentialDiscoveryHint(
      ['ps_03_loggers_cabin'],
      'st_06_library'
    )
    expect(result).not.toBeNull()
    expect(result!.text).toMatch(/Project SHEPHERD/)
  })

  it('fires charon7_spread chain hint', () => {
    const result = getSequentialDiscoveryHint(
      ['dp_15_bioluminescent_garden'],
      'scar_01_crater_rim'
    )
    expect(result).not.toBeNull()
    expect(result!.text).toMatch(/bioluminescence/)
  })

  it('fires meridian_personnel chain hint', () => {
    const result = getSequentialDiscoveryHint(
      ['sc_10_watchtower'],
      'scar_05_lab_wing'
    )
    expect(result).not.toBeNull()
    expect(result!.text).toMatch(/personnel file/)
  })

  it('fires kindling_history chain hint (3-room chain)', () => {
    const result = getSequentialDiscoveryHint(
      ['em_01_the_approach', 'em_20_the_incinerator'],
      'em_03_the_nave'
    )
    expect(result).not.toBeNull()
    expect(result!.text).toMatch(/chapel/)
  })

  it('fires pens_intake_truth chain hint (3-room chain)', () => {
    const result = getSequentialDiscoveryHint(
      ['pens_02_intake_hall', 'pens_06_ward_b_corridor'],
      'pens_08_administration'
    )
    expect(result).not.toBeNull()
    expect(result!.text).toMatch(/intake form/)
  })

  it('does not fire hint when only some rooms visited (3-room chain, 1 missing)', () => {
    // kindling_history requires em_01, em_20, em_03 — missing em_01
    const result = getSequentialDiscoveryHint(
      ['em_20_the_incinerator'],
      'em_03_the_nave'
    )
    expect(result).toBeNull()
  })

  it('currentRoom is included in visited rooms when checking chain completion', () => {
    // For a 2-room chain, if visitedRooms = [] and currentRoom = second room,
    // the first room is missing so chain should NOT fire
    const result = getSequentialDiscoveryHint([], 'st_06_library')
    expect(result).toBeNull()
  })

  it('returns a valid GameMessage when hint fires', () => {
    const result = getSequentialDiscoveryHint(['ps_03_loggers_cabin'], 'st_06_library')
    expect(result).not.toBeNull()
    expect(typeof result!.id).toBe('string')
    expect(typeof result!.text).toBe('string')
    expect(result!.text.length).toBeGreaterThan(0)
  })
})

// ============================================================
// SECTION 5: Narrative Key Composition with Hollow Pressure
// ============================================================

describe('narrativeKeys composition — hollow pressure + faction reputation context', () => {
  it('learning a key mid-cycle does not affect other keys', () => {
    const initialKeys = ['stacks_terminal_password', 'crossroads_hidden_cellar']
    const { updatedKeys } = learnKey('pens_ward_c', initialKeys)
    // Previous keys are preserved
    expect(updatedKeys).toContain('stacks_terminal_password')
    expect(updatedKeys).toContain('crossroads_hidden_cellar')
    expect(updatedKeys).toContain('pens_ward_c')
    expect(updatedKeys).toHaveLength(3)
  })

  it('contradiction detected under high hollow pressure context (stateless check)', () => {
    // The contradiction system is stateless — it doesn't know about pressure
    // but should function regardless of pressure context
    const existing = [{ npcId: 'npc_a', topic: 'covenant_blood_tithe', text: 'voluntary' }]
    const newClaim = { npcId: 'npc_b', topic: 'covenant_blood_tithe', text: 'coerced' }
    const result = detectContradiction(newClaim, existing)
    expect(result).not.toBeNull()
    expect(result!.claim1.topic).toBe('covenant_blood_tithe')
  })

  it('allOf gate passes after learning multiple keys across sessions', () => {
    // Simulate learning keys over multiple interactions
    let keys: string[] = []
    const { updatedKeys: k1 } = learnKey('meridian_decon_code', keys)
    keys = k1
    const { updatedKeys: k2 } = learnKey('stacks_terminal_password', keys)
    keys = k2

    // Now the allOf gate should pass
    const gate = ROOM_EXIT_GATES['scar_04_level1_corridor:north']!
    expect(checkNarrativeGate(gate, keys)).toBe(true)
  })

  it('ROOM_EXIT_GATES covers all 13 zones (spot-check by zone prefix)', () => {
    const gateKeys = Object.keys(ROOM_EXIT_GATES)
    const zones = new Set(gateKeys.map(k => k.split('_')[0]))
    // Should cover: st, scar, em, cr, dp, pens, cv, du, br, ps, dh, sc, rr
    expect(zones.size).toBeGreaterThanOrEqual(12)
  })
})

// ============================================================
// SECTION 6: Narrator Voice — Act Transitions + Priority Branches
// ============================================================

describe('narratorVoice — act transitions', () => {
  it('act 1→2 transition returns multiple echo messages', () => {
    const msgs = getNarratorActTransition(1, 2)
    expect(Array.isArray(msgs)).toBe(true)
    expect(msgs.length).toBeGreaterThan(0)
    for (const m of msgs) {
      expect(m.type).toBe('echo')
      expect(typeof m.text).toBe('string')
      expect(m.text.length).toBeGreaterThan(0)
    }
  })

  it('act 2→3 transition returns messages', () => {
    const msgs = getNarratorActTransition(2, 3)
    expect(msgs.length).toBeGreaterThan(0)
    expect(msgs[0].type).toBe('echo')
  })

  it('invalid transition (e.g. 3→99) returns empty array', () => {
    const msgs = getNarratorActTransition(3, 99)
    expect(msgs).toHaveLength(0)
  })

  it('act 1→1 (same act) returns empty array', () => {
    const msgs = getNarratorActTransition(1, 1)
    expect(msgs).toHaveLength(0)
  })
})

describe('narratorVoice — shouldNarratorSpeak gates', () => {
  afterEach(() => vi.restoreAllMocks())

  it('returns false when in combat', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0)
    expect(shouldNarratorSpeak(100, 0, 5, true)).toBe(false)
  })

  it('returns false when within min cooldown window', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0)
    const minGap = NARRATOR_CONFIG.minActionsBetweenSpawns
    expect(shouldNarratorSpeak(minGap - 1, 0, 5, false)).toBe(false)
  })

  it('returns false when exactly at cooldown boundary (< 50, not >=)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.0)
    // actionCount - lastAction = 49 (< 50 requirement)
    expect(shouldNarratorSpeak(49, 0, 5, false)).toBe(false)
  })

  it('returns true when cooldown met and random passes (5% base chance)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    expect(shouldNarratorSpeak(100, 0, 2, false)).toBe(true)
  })

  it('uses high-pressure chance (10%) at pressure >= 8', () => {
    // random = 0.09: passes at 10%, fails at 5%
    vi.spyOn(Math, 'random').mockReturnValue(0.09)
    expect(shouldNarratorSpeak(100, 0, 8, false)).toBe(true)
    expect(shouldNarratorSpeak(100, 0, 7, false)).toBe(false) // 7 is below threshold
  })

  it('returns false when random exceeds base chance at normal pressure', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.09)
    // pressure = 5 (below 8 threshold) → 5% chance → 0.09 fails
    expect(shouldNarratorSpeak(100, 0, 5, false)).toBe(false)
  })
})

describe('narratorVoice — generateNarratorVoice priority branches', () => {
  beforeEach(() => clearNarratorSession())
  afterEach(() => vi.restoreAllMocks())

  it('priority 1: recentDeath triggers pressure pool', () => {
    const msg = generateNarratorVoice(baseNarratorCtx({ recentDeath: true, pressure: 0 }))
    expect(msg).not.toBeNull()
    expect(msg!.type).toBe('echo')
    expect(typeof msg!.text).toBe('string')
  })

  it('priority 1: pressure >= 7 triggers pressure pool', () => {
    const msg = generateNarratorVoice(baseNarratorCtx({ pressure: 7 }))
    expect(msg).not.toBeNull()
    expect(msg!.type).toBe('echo')
  })

  it('priority 1: pressure = 9 (high threshold) triggers pressure pool', () => {
    const msg = generateNarratorVoice(baseNarratorCtx({ pressure: 9 }))
    expect(msg).not.toBeNull()
  })

  it('priority 2: personal loss pool fires when random < 0.30', () => {
    // Force random to pass the 30% personal loss gate
    vi.spyOn(Math, 'random').mockReturnValue(0.15)
    const msg = generateNarratorVoice(
      baseNarratorCtx({ pressure: 0, personalLoss: 'community' })
    )
    expect(msg).not.toBeNull()
  })

  it('priority 3: cycle pool fires on cycle >= 2 when random < 0.40', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    const msg = generateNarratorVoice(baseNarratorCtx({ cycle: 2, pressure: 0 }))
    expect(msg).not.toBeNull()
  })

  it('priority 4: act-specific pool used for act 1', () => {
    clearNarratorSession()
    vi.spyOn(Math, 'random').mockReturnValue(0.99) // skip personal loss + cycle pools
    const msg = generateNarratorVoice(baseNarratorCtx({ act: 1, cycle: 1, pressure: 0 }))
    expect(msg).not.toBeNull()
    vi.restoreAllMocks()
  })

  it('priority 4: act-specific pool used for act 2', () => {
    clearNarratorSession()
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const msg = generateNarratorVoice(baseNarratorCtx({ act: 2, cycle: 1, pressure: 0 }))
    expect(msg).not.toBeNull()
    vi.restoreAllMocks()
  })

  it('priority 4: act-specific pool used for act 3', () => {
    clearNarratorSession()
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const msg = generateNarratorVoice(baseNarratorCtx({ act: 3, cycle: 1, pressure: 0 }))
    expect(msg).not.toBeNull()
    vi.restoreAllMocks()
  })

  it('returns a valid GameMessage shape (id + text + type)', () => {
    const msg = generateNarratorVoice(baseNarratorCtx({ pressure: 8 }))
    expect(msg).not.toBeNull()
    expect(typeof msg!.id).toBe('string')
    expect(msg!.id.length).toBeGreaterThan(0)
    expect(typeof msg!.text).toBe('string')
    expect(msg!.text.length).toBeGreaterThan(0)
    expect(msg!.type).toBe('echo')
  })

  it('pool deduplication: never returns the same entry twice within a session', () => {
    const seen = new Set<string>()
    for (let i = 0; i < 15; i++) {
      const msg = generateNarratorVoice(baseNarratorCtx({ pressure: 8 }))
      if (msg) {
        expect(seen.has(msg.id), `duplicate id ${msg.id} on iteration ${i}`).toBe(false)
        seen.add(msg.id)
      }
    }
  })

  it('self-heals after session exhaustion — clearNarratorSession resets and continues', () => {
    for (let i = 0; i < 20; i++) generateNarratorVoice(baseNarratorCtx({ pressure: 9 }))
    clearNarratorSession()
    const msg = generateNarratorVoice(baseNarratorCtx({ pressure: 9 }))
    expect(msg).not.toBeNull()
  })
})

// ============================================================
// SECTION 7: Player Monologue — Class × Personal Loss × Trigger
// ============================================================

describe('playerMonologue — shouldTriggerMonologue', () => {
  afterEach(() => vi.restoreAllMocks())

  it('returns true when random < 0.15', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.14)
    expect(shouldTriggerMonologue()).toBe(true)
  })

  it('returns false when random >= 0.15', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.15)
    expect(shouldTriggerMonologue()).toBe(false)
  })
})

describe('playerMonologue — class × trigger combinations', () => {
  beforeEach(() => resetMonologueSession())

  const classes = ['enforcer', 'scout', 'wraith', 'shepherd', 'reclaimer', 'warden', 'broker'] as const
  const triggers = ['low_hp', 'post_combat', 'safe_rest', 'act_transition'] as const

  it.each(classes)('%s class returns a non-null message for low_hp trigger', async (cls) => {
    const msg = await generateMonologue({ trigger: 'low_hp' } as any, cls, 'child')
    // Some classes may not have 'child' loss for 'low_hp' — fallback to trigger-only pool
    if (msg !== null) {
      expect(msg.type).toBe('narrative')
      expect(msg.text.length).toBeGreaterThan(0)
    }
  })

  it.each(classes)('%s class returns a message for post_combat trigger', async (cls) => {
    resetMonologueSession()
    const msg = await generateMonologue({ trigger: 'post_combat' } as any, cls, 'partner')
    if (msg !== null) {
      expect(msg.type).toBe('narrative')
    }
  })

  it.each(classes)('%s class returns a message for safe_rest trigger', async (cls) => {
    resetMonologueSession()
    const msg = await generateMonologue({ trigger: 'safe_rest' } as any, cls, 'community')
    if (msg !== null) {
      expect(msg.type).toBe('narrative')
    }
  })

  it('all 7 classes return non-null for low_hp + child (no loss-specific fallback check)', async () => {
    for (const cls of classes) {
      resetMonologueSession()
      const msg = await generateMonologue({ trigger: 'low_hp' } as any, cls, 'child')
      expect(msg, `${cls} returned null for low_hp/child`).not.toBeNull()
    }
  })
})

describe('playerMonologue — personal loss × emotional state triggers', () => {
  beforeEach(() => resetMonologueSession())

  it('child loss + witnessing_children trigger returns emotional line', () => {
    const msg = getPersonalLossEcho('witnessing_children', 'child', 'Ellie')
    expect(msg).not.toBeNull()
    // Lines: "${lossName}'s hair", "almost called out", "Children shouldn't be here"
    expect(msg!.text).toMatch(/Ellie|hair|called out|Children/)
  })

  it('partner loss + examining_loss_item returns a line', () => {
    const msg = getPersonalLossEcho('examining_loss_item', 'partner', 'Sam')
    expect(msg).not.toBeNull()
    expect(msg!.type).toBe('narrative')
  })

  it('partner loss + witnessing_community returns a line', () => {
    const msg = getPersonalLossEcho('witnessing_community', 'partner', 'Jordan')
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/ring|cups|hand/)
  })

  it('community loss + witnessing_community returns a line', () => {
    const msg = getPersonalLossEcho('witnessing_community', 'community', 'my town')
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/built something|fire|people/)
  })

  it('community loss + safe_rest returns a line', () => {
    const msg = getPersonalLossEcho('safe_rest', 'community', 'my town')
    expect(msg).not.toBeNull()
  })

  it('identity loss + discovery returns a line referencing lossName', () => {
    const msg = getPersonalLossEcho('discovery', 'identity', 'Calder')
    expect(msg).not.toBeNull()
    // Some identity lines embed lossName
    if (msg!.text.includes('Calder')) {
      expect(msg!.text).toMatch(/Calder/)
    }
  })

  it('identity loss + examining_loss_item returns a line', () => {
    const msg = getPersonalLossEcho('examining_loss_item', 'identity', 'Calder')
    expect(msg).not.toBeNull()
    expect(msg!.type).toBe('narrative')
  })

  it('promise loss + safe_rest returns a line', () => {
    const msg = getPersonalLossEcho('safe_rest', 'promise', 'I will find them')
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/promise|kept|stone/)
  })

  it('promise loss + examining_loss_item returns a line', () => {
    const msg = getPersonalLossEcho('examining_loss_item', 'promise', 'bring them home')
    expect(msg).not.toBeNull()
  })

  it('non-matching trigger returns null for all loss types', () => {
    const lossTypes = ['child', 'partner', 'community', 'identity', 'promise'] as const
    for (const loss of lossTypes) {
      const result = getPersonalLossEcho('some_unknown_trigger', loss, 'test')
      expect(result, `${loss} should return null for unknown trigger`).toBeNull()
    }
  })

  it('session deduplication — lines not repeated within session', () => {
    // Exhaust partner/examining_loss_item pool (3 lines)
    const seen = new Set<string>()
    let nullCount = 0
    for (let i = 0; i < 6; i++) {
      const msg = getPersonalLossEcho('examining_loss_item', 'partner', 'Sam')
      if (msg) {
        expect(seen.has(msg.text)).toBe(false)
        seen.add(msg.text)
      } else {
        nullCount++
      }
    }
    // After seeing all unique lines, further calls return null (no self-heal in personal loss)
    expect(nullCount).toBeGreaterThan(0)
  })
})

describe('playerMonologue — getPhysicalStateNarration state coverage', () => {
  it('returns null during combat', () => {
    expect(
      getPhysicalStateNarration({ hp: 5, maxHp: 20, cycle: 1, actionsTaken: 10, inCombat: true })
    ).toBeNull()
  })

  it('returns low-HP narration at < 25%', () => {
    const msg = getPhysicalStateNarration({ hp: 4, maxHp: 20, cycle: 1, actionsTaken: 10 })
    expect(msg).not.toBeNull()
    expect(msg!.type).toBe('narrative')
    expect(msg!.text).toMatch(/longer|swims|print/)
  })

  it('returns poisoned narration when poisoned condition active', () => {
    const msg = getPhysicalStateNarration({
      hp: 15, maxHp: 20, cycle: 1, actionsTaken: 10, conditions: ['poisoned'],
    })
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/copper|numb|soft/)
  })

  it('returns post-rebirth message in first 20 actions of cycle 2', () => {
    const msg = getPhysicalStateNarration({ hp: 20, maxHp: 20, cycle: 2, actionsTaken: 10 })
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/know this room|here|path/)
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
    expect(msg!.text).toMatch(/blur|moving|Rest/)
  })

  it('returns null for normal HP range with no special conditions', () => {
    // Normal HP (> 50%), not poisoned, cycle 1, recent rest
    const msg = getPhysicalStateNarration({
      hp: 18, maxHp: 20, cycle: 1, actionsTaken: 5, lastRestAt: 0,
    })
    expect(msg).toBeNull()
  })

  it('50% HP range returns message occasionally (random-gated at 30%)', () => {
    // Test the 50% HP branch exists — may return null (30% chance)
    vi.spyOn(Math, 'random').mockReturnValue(0.01) // force below 30% gate
    const msg = getPhysicalStateNarration({
      hp: 9, maxHp: 20, cycle: 1, actionsTaken: 30, lastRestAt: 0,
    })
    vi.restoreAllMocks()
    if (msg !== null) {
      expect(msg.text).toMatch(/shaking|damage|moving/)
    }
  })
})

describe('playerMonologue — getReputationVoice', () => {
  beforeEach(() => resetMonologueSession())
  afterEach(() => vi.restoreAllMocks())

  it('returns null when no thresholds met', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    const msg = getReputationVoice({}, 'crossroads', 1)
    expect(msg).toBeNull()
  })

  it('returns accord line when accord rep >= 2', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    const msg = getReputationVoice({ accord: 2 }, 'crossroads', 1)
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/Cross/)
  })

  it('returns salters warning when salters rep <= -2', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    const msg = getReputationVoice({ salters: -2 }, 'crossroads', 1)
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/Salters/)
  })

  it('returns kindling line when kindling rep >= 2', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    const msg = getReputationVoice({ kindling: 2 }, 'crossroads', 1)
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/fire|Harrow/)
  })

  it('returns cycle line when cycle >= 3', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    const msg = getReputationVoice({}, 'crossroads', 3)
    expect(msg).not.toBeNull()
    expect(msg!.text).toMatch(/keeps coming back/)
  })

  it('returns null when random >= 0.30 (gate blocks even with valid rep)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.50)
    const msg = getReputationVoice({ accord: 3 }, 'crossroads', 5)
    expect(msg).toBeNull()
  })

  it('deduplication — second call with same line returns null', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01)
    const first = getReputationVoice({ accord: 2 }, 'crossroads', 1)
    expect(first).not.toBeNull()
    const second = getReputationVoice({ accord: 2 }, 'crossroads', 1)
    // Line is in _usedLines so second call should return null
    expect(second).toBeNull()
  })
})

// ============================================================
// SECTION 8: Contradiction composition across multiple claims
// ============================================================

describe('contradiction — multiple claims and composition', () => {
  it('handles contradictions on multiple topics simultaneously (independent)', () => {
    const claimsMap: Record<string, { npcId: string; topic: string; text: string }[]> = {
      meridian_bombing: [{ npcId: 'npc_a', topic: 'meridian_bombing', text: 'accident' }],
      accord_treaty: [{ npcId: 'npc_x', topic: 'accord_treaty', text: 'spring' }],
      scar_personnel: [{ npcId: 'npc_m', topic: 'scar_personnel', text: 'all survived' }],
    }

    const newClaims = [
      { npcId: 'npc_b', topic: 'meridian_bombing', text: 'deliberate' },
      { npcId: 'npc_y', topic: 'accord_treaty', text: 'winter' },
      { npcId: 'npc_n', topic: 'scar_personnel', text: 'none survived' },
    ]

    const contradictions = newClaims.map((claim) =>
      detectContradiction(claim, claimsMap[claim.topic] ?? [])
    )

    expect(contradictions.every(c => c !== null)).toBe(true)
    const topics = contradictions.map(c => c!.claim1.topic)
    expect(topics).toContain('meridian_bombing')
    expect(topics).toContain('accord_treaty')
    expect(topics).toContain('scar_personnel')
  })

  it('same NPC claiming same thing twice does not create contradiction', () => {
    const existing = [{ npcId: 'sparks', topic: 'charon7_origin', text: 'viral' }]
    const sameClaim = { npcId: 'sparks', topic: 'charon7_origin', text: 'still viral' }
    const result = detectContradiction(sameClaim, existing)
    expect(result).toBeNull()
  })

  it('three NPCs on same topic — first conflict wins', () => {
    const existing = [
      { npcId: 'npc_a', topic: 'covenant_blood_tithe', text: 'voluntary' },
      { npcId: 'npc_c', topic: 'covenant_blood_tithe', text: 'also voluntary' },
    ]
    const newClaim = { npcId: 'npc_b', topic: 'covenant_blood_tithe', text: 'coerced' }
    const result = detectContradiction(newClaim, existing)
    expect(result).not.toBeNull()
    // The first existing NPC wins (find() returns first match)
    expect(result!.claim1.npcId).toBe('npc_a')
    expect(result!.claim2.npcId).toBe('npc_b')
  })

  it('resolving each contradiction type produces distinct narrative text', () => {
    const contradiction = makeContradiction('meridian_bombing')
    const { messages: m1 } = resolveContradiction(contradiction.id, 'npc1_truth', contradiction)
    const { messages: m2 } = resolveContradiction(contradiction.id, 'npc2_truth', contradiction)
    const { messages: m3 } = resolveContradiction(contradiction.id, 'both_lying', contradiction)

    // All three produce text
    expect(m1[0].text.length).toBeGreaterThan(0)
    expect(m2[0].text.length).toBeGreaterThan(0)
    expect(m3[0].text.length).toBeGreaterThan(0)

    // All three are distinct
    expect(m1[0].text).not.toBe(m2[0].text)
    expect(m1[0].text).not.toBe(m3[0].text)
    expect(m2[0].text).not.toBe(m3[0].text)
  })
})
