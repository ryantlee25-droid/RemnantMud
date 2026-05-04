// ============================================================
// narrativeSnapshotRegistry.test.ts — Prose Snapshot Suite
// T1-C + P2-D (eval-convoy-0503)
//
// Captures prose output from all narrative trigger systems.
// Granularity: one snapshot per (trigger-type × class × zone).
// For triggers that don't vary by class or zone, those axes
// are dropped.
//
// OQ-1 default: one snapshot per trigger-type × class × zone.
// RNG-dependent functions are seeded via lib/testing/seededRng.ts.
// ============================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// ── Lib under test ───────────────────────────────────────────
import { selectDeathProse, DEATH_PROSE_VARIANTS } from '@/lib/deathProse'
import type { DeathContext } from '@/lib/deathProse'
import {
  getPressureNarration,
  getSilenceNarration,
} from '@/lib/hollowPressure'
import {
  creationPrompt,
} from '@/lib/terminalCreation'
import type { CreationState } from '@/lib/terminalCreation'
import {
  deathMessages,
  theBetweenMessages,
  endingMessages,
  prologueMessages,
  MEMORY_POOL,
} from '@/lib/terminalDeath'
import {
  generateNarratorVoice,
  getNarratorActTransition,
  clearNarratorSession,
} from '@/lib/narratorVoice'
import type { NarratorContext } from '@/lib/narratorVoice'
import {
  getPhysicalStateNarration,
  getPersonalLossEcho,
  getReputationVoice,
  resetMonologueSession,
} from '@/lib/playerMonologue'
import type { PhysicalStateInput } from '@/lib/playerMonologue'

// ── Data imports (for pool-level snapshots) ──────────────────
import {
  NARRATOR_WHISPER_POOL,
  ACT_TRANSITION_LINES,
  CYCLE_WHISPERS,
  PRESSURE_WHISPERS,
  PERSONAL_LOSS_WHISPERS,
} from '@/data/narratorVoices'
import { ENFORCER_POOLS } from '@/data/playerMonologues/class_enforcer'
import { SCOUT_POOLS } from '@/data/playerMonologues/class_scout'
import { WRAITH_POOLS } from '@/data/playerMonologues/class_wraith'
import { SHEPHERD_POOLS } from '@/data/playerMonologues/class_shepherd'
import { RECLAIMER_POOLS } from '@/data/playerMonologues/class_reclaimer'
import { WARDEN_POOLS } from '@/data/playerMonologues/class_warden'
import { BROKER_POOLS } from '@/data/playerMonologues/class_broker'

// ── Seeded RNG ────────────────────────────────────────────────
import { mulberry32, withSeededRandom } from '@/lib/testing/seededRng'

// ── Types ─────────────────────────────────────────────────────
import type { CharacterClass, PersonalLossType, ZoneType } from '@/types/game'
import type { MonologueTrigger } from '@/types/convoy-contracts'

// ============================================================
// Helpers
// ============================================================

/** Strip message IDs (UUIDs and timestamp-based) so snapshots
 * are deterministic. The prose text is what we're snapshotting. */
function stripIds(messages: { id: string; text: string; type: string }[]) {
  return messages.map(({ text, type }) => ({ text, type }))
}

/** Single-message variant of stripIds */
function stripId(msg: { id: string; text: string; type: string } | null) {
  if (!msg) return null
  const { text, type } = msg
  return { text, type }
}

// Seed used across all seeded-random calls in this suite
const TEST_SEED = 42

// ============================================================
// SECTION 1: Death Prose (lib/deathProse.ts)
// ── Each variant is triggered by the minimal context that
//    satisfies its `applies` predicate.
// ── Granularity: one snapshot per named variant.
//    No class/zone axes (deathProse is not class-specific).
// ============================================================

describe('deathProse — DEATH_PROSE_VARIANTS', () => {

  it('variant: combat_specific_killer', () => {
    const ctx: DeathContext = {
      cause: 'combat',
      cycle: 1,
      zone: 'crossroads',
      hollowKills: 0,
      killedBy: 'Stalker',
    }
    const rng = mulberry32(TEST_SEED)
    const messages = selectDeathProse(ctx, rng)
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('variant: combat_veteran (cycle 2, 20+ kills)', () => {
    const ctx: DeathContext = {
      cause: 'combat',
      cycle: 2,
      zone: 'river_road',
      hollowKills: 20,
      killedBy: undefined, // no specific killer → falls to veteran/overwhelmed
    }
    const rng = mulberry32(TEST_SEED)
    const messages = selectDeathProse(ctx, rng)
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('variant: combat_overwhelmed (cycle 1, <5 kills)', () => {
    const ctx: DeathContext = {
      cause: 'combat',
      cycle: 1,
      zone: 'crossroads',
      hollowKills: 2,
    }
    const rng = mulberry32(TEST_SEED)
    const messages = selectDeathProse(ctx, rng)
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('variant: environment_collapse (the_scar zone)', () => {
    const ctx: DeathContext = {
      cause: 'environment',
      cycle: 1,
      zone: 'the_scar',
      hollowKills: 0,
    }
    const rng = mulberry32(TEST_SEED)
    const messages = selectDeathProse(ctx, rng)
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('variant: environment_collapse (the_deep zone)', () => {
    const ctx: DeathContext = {
      cause: 'environment',
      cycle: 1,
      zone: 'the_deep',
      hollowKills: 0,
    }
    const rng = mulberry32(TEST_SEED)
    const messages = selectDeathProse(ctx, rng)
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('variant: infection_hollow', () => {
    const ctx: DeathContext = {
      cause: 'infection',
      cycle: 1,
      zone: 'salt_creek',
      hollowKills: 0,
    }
    const rng = mulberry32(TEST_SEED)
    const messages = selectDeathProse(ctx, rng)
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('variant: faction_execution', () => {
    const ctx: DeathContext = {
      cause: 'faction',
      cycle: 1,
      zone: 'the_pens',
      hollowKills: 0,
    }
    const rng = mulberry32(TEST_SEED)
    const messages = selectDeathProse(ctx, rng)
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('variant: cycle_aware_late (cycle 5+)', () => {
    const ctx: DeathContext = {
      cause: 'combat',
      cycle: 5,
      zone: 'crossroads',
      hollowKills: 5,
      killedBy: undefined,
    }
    // cycle_aware_late applies when cycle >= 5. With no killedBy and
    // hollowKills=5 (not < 5 threshold), only cycle_aware_late matches.
    const rng = mulberry32(TEST_SEED)
    const messages = selectDeathProse(ctx, rng)
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('variant: default_fallback (unknown cause, no other matches)', () => {
    const ctx: DeathContext = {
      cause: 'unknown',
      cycle: 1,
      zone: undefined,
      hollowKills: 5,
    }
    const rng = mulberry32(TEST_SEED)
    const messages = selectDeathProse(ctx, rng)
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('all variants — template renders match their IDs', () => {
    // Structural snapshot: every variant's ID and line count
    const summary = DEATH_PROSE_VARIANTS.map((v) => ({
      id: v.id,
      lineCount: v.template({
        cause: 'combat',
        cycle: 1,
        zone: 'crossroads',
        hollowKills: 0,
        killedBy: 'test',
      }).length,
    }))
    expect(summary).toMatchSnapshot()
  })
})

// ============================================================
// SECTION 2: Hollow Pressure (lib/hollowPressure.ts)
// ── One snapshot per pressure level (0–10).
// ── No class/zone axes — pressure narration is universal.
// ============================================================

describe('hollowPressure — getPressureNarration', () => {

  for (let level = 0; level <= 10; level++) {
    it(`pressure level ${level}`, () => {
      const messages = getPressureNarration(level)
      expect(stripIds(messages)).toMatchSnapshot()
    })
  }

  it('clamps below 0 to level 0', () => {
    const messages = getPressureNarration(-1)
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('clamps above 10 to level 10', () => {
    const messages = getPressureNarration(11)
    expect(stripIds(messages)).toMatchSnapshot()
  })
})

describe('hollowPressure — getSilenceNarration', () => {
  it('returns one of the known silence lines (seeded)', () => {
    // getSilenceNarration uses Math.random internally — seed it.
    const msg = withSeededRandom(TEST_SEED, () => getSilenceNarration())
    expect(stripId(msg)).toMatchSnapshot()
  })
})

// ============================================================
// SECTION 3: Terminal Creation (lib/terminalCreation.ts)
// ── One snapshot per creation step (name, class, loss_type, etc.)
// ── Stats step requires a class selection first.
// ── "class" axis: we snapshot one representative class (enforcer)
//    for stats step since the stats display varies per class.
// ============================================================

describe('terminalCreation — creationPrompt', () => {

  it('step: name', () => {
    const state: CreationState = { step: 'name' }
    expect(stripIds(creationPrompt(state))).toMatchSnapshot()
  })

  it('step: class', () => {
    const state: CreationState = { step: 'class', name: 'TestPlayer' }
    expect(stripIds(creationPrompt(state))).toMatchSnapshot()
  })

  it('step: stats (enforcer class, default allocation)', () => {
    const state: CreationState = {
      step: 'stats',
      name: 'TestPlayer',
      characterClass: 'enforcer',
      stats: { vigor: 4, grit: 2, reflex: 2, wits: 2, presence: 2, shadow: 2 },
      freePoints: 6,
    }
    expect(stripIds(creationPrompt(state))).toMatchSnapshot()
  })

  it('step: stats (wraith class — shadow-boosted)', () => {
    const state: CreationState = {
      step: 'stats',
      name: 'TestPlayer',
      characterClass: 'wraith',
      stats: { vigor: 2, grit: 2, reflex: 2, wits: 2, presence: 2, shadow: 4 },
      freePoints: 6,
    }
    expect(stripIds(creationPrompt(state))).toMatchSnapshot()
  })

  it('step: loss_type', () => {
    const state: CreationState = {
      step: 'loss_type',
      name: 'TestPlayer',
      characterClass: 'enforcer',
      stats: { vigor: 4, grit: 2, reflex: 2, wits: 2, presence: 2, shadow: 2 },
    }
    expect(stripIds(creationPrompt(state))).toMatchSnapshot()
  })

  it('step: loss_detail (child loss)', () => {
    const state: CreationState = {
      step: 'loss_detail',
      name: 'TestPlayer',
      characterClass: 'enforcer',
      stats: { vigor: 4, grit: 2, reflex: 2, wits: 2, presence: 2, shadow: 2 },
      personalLoss: { type: 'child', detail: '' },
    }
    expect(stripIds(creationPrompt(state))).toMatchSnapshot()
  })

  it('step: loss_confirm', () => {
    const state: CreationState = {
      step: 'loss_confirm',
      name: 'TestPlayer',
      characterClass: 'enforcer',
      stats: { vigor: 4, grit: 2, reflex: 2, wits: 2, presence: 2, shadow: 2 },
      personalLoss: { type: 'child', detail: 'Alice' },
    }
    expect(stripIds(creationPrompt(state))).toMatchSnapshot()
  })

  it('step: done (returns empty array)', () => {
    const state: CreationState = { step: 'done' }
    expect(creationPrompt(state)).toMatchSnapshot()
  })
})

// ============================================================
// SECTION 4: Terminal Death (lib/terminalDeath.ts)
// ── Snapshots: deathMessages, theBetweenMessages,
//    endingMessages (all 4 endings), prologueMessages
// ── Memory fragments in theBetweenMessages are RNG-dependent —
//    seeded via withSeededRandom.
// ── deathMessages includes selectDeathProse internally — seeded
//    via the rng option.
// ============================================================

describe('terminalDeath — deathMessages', () => {

  it('cause: combat, cycle 1, first death', () => {
    const rng = mulberry32(TEST_SEED)
    const messages = deathMessages({
      cycle: 1,
      xpGained: 450,
      roomsExplored: 12,
      causeOfDeath: 'combat',
      hollowKills: 3,
      killedBy: 'Shuffler',
      zone: 'crossroads',
      rng,
    })
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('cause: infection, cycle 2, with echo stats', () => {
    const rng = mulberry32(TEST_SEED)
    const messages = deathMessages({
      cycle: 2,
      xpGained: 1200,
      roomsExplored: 30,
      causeOfDeath: 'infection',
      echoStats: { vigor: 1, grit: 2 },
      stashCount: 3,
      questMilestones: ['found_radio', 'met_accord'],
      hollowKills: 10,
      zone: 'salt_creek',
      rng,
    })
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('cause: environment, cycle 1, the_scar zone', () => {
    const rng = mulberry32(TEST_SEED)
    const messages = deathMessages({
      cycle: 1,
      xpGained: 200,
      roomsExplored: 5,
      causeOfDeath: 'environment',
      hollowKills: 0,
      zone: 'the_scar',
      rng,
    })
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('cause: faction, cycle 3', () => {
    const rng = mulberry32(TEST_SEED)
    const messages = deathMessages({
      cycle: 3,
      xpGained: 3000,
      roomsExplored: 60,
      causeOfDeath: 'faction',
      hollowKills: 25,
      zone: 'the_pens',
      rng,
    })
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('cause: unknown, cycle 5+ (cycle_aware_late variant)', () => {
    const rng = mulberry32(TEST_SEED)
    const messages = deathMessages({
      cycle: 5,
      xpGained: 5000,
      roomsExplored: 100,
      causeOfDeath: 'unknown',
      hollowKills: 0,
      rng,
    })
    expect(stripIds(messages)).toMatchSnapshot()
  })
})

describe('terminalDeath — theBetweenMessages', () => {

  it('cycle 2 (entering between for first time)', () => {
    // pickFragments uses Math.random — seed it
    const messages = withSeededRandom(TEST_SEED, () =>
      theBetweenMessages({
        cycle: 2,
        inheritedFactions: { accord: 1, salters: -1 },
        discoveredRooms: ['cr_01', 'cr_02', 'rr_01'],
        stashItems: [{ id: 'knife' }, { id: 'bandage' }],
      })
    )
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('cycle 3 (no factions, no stash)', () => {
    const messages = withSeededRandom(TEST_SEED, () =>
      theBetweenMessages({
        cycle: 3,
      })
    )
    expect(stripIds(messages)).toMatchSnapshot()
  })
})

describe('terminalDeath — endingMessages', () => {

  const endingCases: Array<{ choice: string }> = [
    { choice: 'cure' },
    { choice: 'weapon' },
    { choice: 'seal' },
    { choice: 'throne' },
  ]

  for (const { choice } of endingCases) {
    it(`ending: ${choice}`, () => {
      const messages = endingMessages({
        choice,
        cycle: 3,
        totalDeaths: 2,
        roomsExplored: 75,
        xpEarned: 8500,
      })
      expect(stripIds(messages)).toMatchSnapshot()
    })
  }
})

describe('terminalDeath — prologueMessages', () => {

  it('prologue (deterministic — no RNG)', () => {
    const messages = prologueMessages()
    // Filter out timestamp-based IDs, keep text + type
    expect(stripIds(messages)).toMatchSnapshot()
  })
})

describe('terminalDeath — MEMORY_POOL', () => {

  it('memory pool is stable (all 18 fragments)', () => {
    // Snapshot the raw pool so any editorial changes surface in CI
    expect(MEMORY_POOL).toMatchSnapshot()
  })
})

// ============================================================
// SECTION 5: Narrator Voice (lib/narratorVoice.ts)
// ── generateNarratorVoice selects randomly from pools.
// ── We snapshot the pool content directly (deterministic),
//    plus act transitions (fully deterministic).
// ── For generateNarratorVoice: we snapshot one seeded call
//    per priority path (pressure, loss, cycle, act, general).
// ============================================================

describe('narratorVoice — act transition lines (deterministic)', () => {

  it('act 1 → 2 transition', () => {
    const messages = getNarratorActTransition(1, 2)
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('act 2 → 3 transition', () => {
    const messages = getNarratorActTransition(2, 3)
    expect(stripIds(messages)).toMatchSnapshot()
  })

  it('invalid transition returns empty array', () => {
    const messages = getNarratorActTransition(3, 4)
    expect(messages).toMatchSnapshot()
  })
})

describe('narratorVoice — pool content snapshots (deterministic)', () => {

  it('CYCLE_WHISPERS pool — all IDs and texts', () => {
    const summary = CYCLE_WHISPERS.map(({ id, text }) => ({ id, text }))
    expect(summary).toMatchSnapshot()
  })

  it('PRESSURE_WHISPERS pool — all IDs and texts', () => {
    const summary = PRESSURE_WHISPERS.map(({ id, text }) => ({ id, text }))
    expect(summary).toMatchSnapshot()
  })

  it('PERSONAL_LOSS_WHISPERS pool — all IDs and texts', () => {
    const summary = PERSONAL_LOSS_WHISPERS.map(({ id, text }) => ({ id, text }))
    expect(summary).toMatchSnapshot()
  })

  it('NARRATOR_WHISPER_POOL — total count and all IDs', () => {
    const ids = NARRATOR_WHISPER_POOL.map((v) => v.id)
    expect({ count: ids.length, ids }).toMatchSnapshot()
  })
})

describe('narratorVoice — generateNarratorVoice (seeded)', () => {

  beforeEach(() => {
    clearNarratorSession()
  })

  afterEach(() => {
    clearNarratorSession()
  })

  it('priority 1: pressure pool (pressure >= 7)', () => {
    const ctx: NarratorContext = {
      act: 1,
      zone: 'crossroads',
      cycle: 1,
      pressure: 8,
      questFlags: [],
      playerHP: 10,
      playerMaxHP: 14,
    }
    const msg = withSeededRandom(TEST_SEED, () => generateNarratorVoice(ctx))
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('priority 1: recent death (pressure=0 but recentDeath=true)', () => {
    const ctx: NarratorContext = {
      act: 1,
      zone: 'crossroads',
      cycle: 1,
      pressure: 0,
      questFlags: [],
      playerHP: 10,
      playerMaxHP: 14,
      recentDeath: true,
    }
    const msg = withSeededRandom(TEST_SEED, () => generateNarratorVoice(ctx))
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('priority 2: personal loss pool (pressure < 7, loss present)', () => {
    // Use a seed that makes Math.random() < 0.30 for the loss branch
    // mulberry32(99) first call is ~0.11, which is < 0.30
    const ctx: NarratorContext = {
      act: 1,
      zone: 'crossroads',
      cycle: 1,
      pressure: 3,
      questFlags: [],
      playerHP: 14,
      playerMaxHP: 14,
      personalLoss: 'child',
    }
    const msg = withSeededRandom(99, () => generateNarratorVoice(ctx))
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('priority 3: cycle pool (cycle >= 2)', () => {
    // seed 77: first call ~0.63 (> 0.30 loss skip), second ~0.22 (< 0.40 cycle)
    const ctx: NarratorContext = {
      act: 1,
      zone: 'river_road',
      cycle: 2,
      pressure: 3,
      questFlags: [],
      playerHP: 14,
      playerMaxHP: 14,
    }
    const msg = withSeededRandom(77, () => generateNarratorVoice(ctx))
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('priority 4: act-specific pool (act 2)', () => {
    const ctx: NarratorContext = {
      act: 2,
      zone: 'covenant',
      cycle: 1,
      pressure: 2,
      questFlags: [],
      playerHP: 14,
      playerMaxHP: 14,
    }
    const msg = withSeededRandom(TEST_SEED, () => generateNarratorVoice(ctx))
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('priority 5: general pool fallback (act 1, no specials)', () => {
    const ctx: NarratorContext = {
      act: 1,
      zone: 'crossroads',
      cycle: 1,
      pressure: 2,
      questFlags: [],
      playerHP: 14,
      playerMaxHP: 14,
    }
    const msg = withSeededRandom(TEST_SEED, () => generateNarratorVoice(ctx))
    expect(stripId(msg)).toMatchSnapshot()
  })
})

// ============================================================
// SECTION 6: Player Monologue (lib/playerMonologue.ts)
// ── Pool-level snapshots per class × trigger (7 classes × 7
//    triggers = 49). Each pool snapshot captures all lines for
//    one representative personal-loss type ('child') to bound
//    the snapshot count per OQ-1.
// ── Physical-state narration: one snapshot per state branch.
// ── Personal-loss echo: one per loss-type × trigger.
// ── Reputation voice: seeded.
// ============================================================

describe('playerMonologue — pool-level snapshots (class × trigger)', () => {

  const CLASS_POOLS: Record<CharacterClass, typeof ENFORCER_POOLS> = {
    enforcer: ENFORCER_POOLS,
    scout: SCOUT_POOLS,
    wraith: WRAITH_POOLS,
    shepherd: SHEPHERD_POOLS,
    reclaimer: RECLAIMER_POOLS,
    warden: WARDEN_POOLS,
    broker: BROKER_POOLS,
  }

  const CLASSES: CharacterClass[] = [
    'enforcer', 'scout', 'wraith', 'shepherd', 'reclaimer', 'warden', 'broker',
  ]

  const TRIGGERS: MonologueTrigger[] = [
    'low_hp', 'post_combat', 'in_danger', 'examining_loss_item',
    'safe_rest', 'act_transition', 'pressure_spike',
  ]

  // Representative loss: 'child' for all class×trigger snapshots (OQ-1 bound)
  const REPRESENTATIVE_LOSS: PersonalLossType = 'child'

  for (const cls of CLASSES) {
    for (const trigger of TRIGGERS) {
      it(`${cls} × ${trigger} (loss: child)`, () => {
        const pools = CLASS_POOLS[cls]
        const pool = pools.find(
          (p) => p.trigger === trigger && p.personalLoss === REPRESENTATIVE_LOSS
        )
        // Must exist — all class files define all triggers × all losses
        expect(pool).toBeDefined()
        expect(pool?.lines).toMatchSnapshot()
      })
    }
  }
})

describe('playerMonologue — getPhysicalStateNarration', () => {

  beforeEach(() => {
    resetMonologueSession()
  })

  it('low HP (<25%)', () => {
    const state: PhysicalStateInput = {
      hp: 2,
      maxHp: 14,
      cycle: 1,
      actionsTaken: 30,
    }
    const msg = withSeededRandom(TEST_SEED, () => getPhysicalStateNarration(state))
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('poisoned condition', () => {
    const state: PhysicalStateInput = {
      hp: 8,
      maxHp: 14,
      cycle: 1,
      actionsTaken: 30,
      conditions: ['poisoned'],
    }
    const msg = withSeededRandom(TEST_SEED, () => getPhysicalStateNarration(state))
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('post-rebirth (cycle 2, actionsTaken <= 20)', () => {
    const state: PhysicalStateInput = {
      hp: 14,
      maxHp: 14,
      cycle: 2,
      actionsTaken: 10,
    }
    const msg = withSeededRandom(TEST_SEED, () => getPhysicalStateNarration(state))
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('high cycle (cycle 5+)', () => {
    const state: PhysicalStateInput = {
      hp: 14,
      maxHp: 14,
      cycle: 5,
      actionsTaken: 25,
    }
    const msg = withSeededRandom(TEST_SEED, () => getPhysicalStateNarration(state))
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('exhausted (50+ actions since rest)', () => {
    const state: PhysicalStateInput = {
      hp: 14,
      maxHp: 14,
      cycle: 1,
      actionsTaken: 100,
      lastRestAt: 40,
    }
    const msg = withSeededRandom(TEST_SEED, () => getPhysicalStateNarration(state))
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('in combat — returns null', () => {
    const state: PhysicalStateInput = {
      hp: 8,
      maxHp: 14,
      cycle: 1,
      actionsTaken: 30,
      inCombat: true,
    }
    const msg = getPhysicalStateNarration(state)
    expect(msg).toBeNull()
  })
})

describe('playerMonologue — getPersonalLossEcho', () => {

  beforeEach(() => {
    resetMonologueSession()
  })

  afterEach(() => {
    resetMonologueSession()
  })

  // One snapshot per (loss × trigger) for triggers that each loss responds to
  it('child × witnessing_children', () => {
    const msg = withSeededRandom(TEST_SEED, () =>
      getPersonalLossEcho('witnessing_children', 'child', 'Alice')
    )
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('partner × witnessing_community', () => {
    const msg = withSeededRandom(TEST_SEED, () =>
      getPersonalLossEcho('witnessing_community', 'partner', 'Jordan')
    )
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('community × safe_rest', () => {
    const msg = withSeededRandom(TEST_SEED, () =>
      getPersonalLossEcho('safe_rest', 'community', 'Old Creek')
    )
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('identity × discovery', () => {
    const msg = withSeededRandom(TEST_SEED, () =>
      getPersonalLossEcho('discovery', 'identity', 'Maren')
    )
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('promise × safe_rest', () => {
    const msg = withSeededRandom(TEST_SEED, () =>
      getPersonalLossEcho('safe_rest', 'promise', 'I will come back for you')
    )
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('child × examining_loss_item', () => {
    const msg = withSeededRandom(TEST_SEED, () =>
      getPersonalLossEcho('examining_loss_item', 'child', 'Alice')
    )
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('partner × examining_loss_item', () => {
    const msg = withSeededRandom(TEST_SEED, () =>
      getPersonalLossEcho('examining_loss_item', 'partner', 'Jordan')
    )
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('identity × examining_loss_item', () => {
    const msg = withSeededRandom(TEST_SEED, () =>
      getPersonalLossEcho('examining_loss_item', 'identity', 'Maren')
    )
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('promise × examining_loss_item', () => {
    const msg = withSeededRandom(TEST_SEED, () =>
      getPersonalLossEcho('examining_loss_item', 'promise', 'I will come back for you')
    )
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('non-matching trigger returns null', () => {
    const msg = getPersonalLossEcho('safe_rest', 'child', 'Alice')
    expect(msg).toBeNull()
  })
})

describe('playerMonologue — getReputationVoice', () => {

  beforeEach(() => {
    resetMonologueSession()
  })

  afterEach(() => {
    resetMonologueSession()
  })

  it('accord rep >= 2 (seeded to fire)', () => {
    // mulberry32(5) first value: 0.22 < 0.30 so the function fires
    const zone: ZoneType = 'crossroads'
    const msg = withSeededRandom(5, () =>
      getReputationVoice({ accord: 2 }, zone, 1)
    )
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('salters rep <= -2 (seeded to fire)', () => {
    const zone: ZoneType = 'salt_creek'
    const msg = withSeededRandom(5, () =>
      getReputationVoice({ salters: -2 }, zone, 1)
    )
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('kindling rep >= 2 (seeded to fire)', () => {
    const zone: ZoneType = 'the_ember'
    const msg = withSeededRandom(5, () =>
      getReputationVoice({ kindling: 2 }, zone, 1)
    )
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('cycle >= 3 reputation line (seeded to fire)', () => {
    const zone: ZoneType = 'crossroads'
    const msg = withSeededRandom(5, () =>
      getReputationVoice({}, zone, 3)
    )
    expect(stripId(msg)).toMatchSnapshot()
  })

  it('no reputation triggers — returns null', () => {
    // mulberry32(1) first value is ~0.80, so > 0.30, function returns null
    const zone: ZoneType = 'crossroads'
    const msg = withSeededRandom(1, () =>
      getReputationVoice({}, zone, 1)
    )
    expect(msg).toBeNull()
  })
})
