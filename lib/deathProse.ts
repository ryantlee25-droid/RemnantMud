// ============================================================
// deathProse.ts — Death prose variant system
// Per docs/research/narrative-coherence-audit.md §8:
// a single death sequence would repeat 50–100× under battle-MUD
// density. This module ships 7 variants selected by death cause,
// cycle, zone, and kill count.
//
// Pure module — no React, no Supabase, no side effects.
// ============================================================

import type { GameMessage, ZoneType } from '@/types/game'
import type { DeathCause } from '@/types/game'
import { msg } from '@/lib/messages'

// ------------------------------------------------------------
// DeathContext — input to selectDeathProse
// ------------------------------------------------------------

export interface DeathContext {
  cause: DeathCause
  /** Current cycle (player will be cycle N+1 after rebirth) */
  cycle: number
  /** Zone where the player died */
  zone: ZoneType | undefined
  /** Running count of Hollow defeated this cycle */
  hollowKills: number
  /** Enemy name if cause is 'combat', otherwise undefined */
  killedBy?: string
}

// ------------------------------------------------------------
// Variant definition type
// ------------------------------------------------------------

export interface DeathProseVariant {
  id: string
  /** Predicate — returns true when this variant applies */
  applies: (ctx: DeathContext) => boolean
  /** Renders the message stream for this variant */
  template: (ctx: DeathContext) => GameMessage[]
}

// ------------------------------------------------------------
// Helper — build a single-message death stream
// ------------------------------------------------------------

function deathStream(...lines: string[]): GameMessage[] {
  return lines.map((text) => msg(text, 'death'))
}

// ------------------------------------------------------------
// Zones that trigger cosmic-horror environment prose
// ------------------------------------------------------------

const DEEP_ZONES: ReadonlySet<ZoneType> = new Set<ZoneType>(['the_scar', 'the_deep'])

// ------------------------------------------------------------
// DEATH_PROSE_VARIANTS — ordered by specificity (most-specific
// first so that when multiple predicates match, the first wins
// if we just pick [0] — but selectDeathProse picks randomly
// from all matches, so ordering is only a documentation aid).
// ------------------------------------------------------------

export const DEATH_PROSE_VARIANTS: ReadonlyArray<DeathProseVariant> = [

  // ----------------------------------------------------------
  // 1. combat_specific_killer
  //    Most specific combat variant — names the killer.
  //    Checked before the broad combat variants.
  // ----------------------------------------------------------
  {
    id: 'combat_specific_killer',
    applies: (ctx) => ctx.cause === 'combat' && Boolean(ctx.killedBy),
    template: (ctx) => deathStream(
      `The ${ctx.killedBy} did not gloat. It moved on.`,
      `The world doesn't notice when one more revenant falls. You were not the first to die here, and you will not be the last thing it kills today.`,
      `CHARON-7 is already working on the reconstruction. The ${ctx.killedBy} is already somewhere else.`,
    ),
  },

  // ----------------------------------------------------------
  // 2. combat_veteran
  //    Cycle 2+, 20+ hollow kills — weary, scarred.
  // ----------------------------------------------------------
  {
    id: 'combat_veteran',
    applies: (ctx) => ctx.cause === 'combat' && ctx.hollowKills >= 20 && ctx.cycle >= 2,
    template: (ctx) => deathStream(
      `You've killed ${ctx.hollowKills} of them. They've finally returned the favor.`,
      `The math was always going to catch up. You knew that. Every revenant who's been through more than one cycle knows that. You just kept hoping the math was wrong.`,
      `It wasn't.`,
      `CHARON-7 will rebuild the scaffolding it calls you. The scars it left last time are still there. It will add new ones.`,
    ),
  },

  // ----------------------------------------------------------
  // 3. combat_overwhelmed
  //    Cycle 1, fewer than 5 hollow kills — shock, first-time
  //    devastation.
  // ----------------------------------------------------------
  {
    id: 'combat_overwhelmed',
    applies: (ctx) => ctx.cause === 'combat' && ctx.hollowKills < 5,
    template: (_ctx) => deathStream(
      `You wanted more time. The Hollow didn't ask.`,
      `It wasn't supposed to go like this. You had a pack. You had a plan. You had the specific weight of intention that feels like readiness until the moment it isn't.`,
      `CHARON-7 is not surprised. It has been through this before. It will reconstruct something that can pass for you. It will be a little smaller than you were.`,
    ),
  },

  // ----------------------------------------------------------
  // 4. environment_collapse
  //    Environment death in the_scar or the_deep — cosmic
  //    horror, swallowed by the world.
  // ----------------------------------------------------------
  {
    id: 'environment_collapse',
    applies: (ctx) => ctx.cause === 'environment' && ctx.zone !== undefined && DEEP_ZONES.has(ctx.zone),
    template: (_ctx) => deathStream(
      `The earth was always going to win.`,
      `This place existed before CHARON-7. Before the Hollow. Before anyone thought to give it a name or map its edges or believe they understood what it was. It will exist after you too.`,
      `You are very small. You were very small. The world didn't need to try.`,
      `CHARON-7 will reconstruct you. You will not remember how big the silence was, or the specific texture of what swallowed you. That is a mercy of a kind.`,
    ),
  },

  // ----------------------------------------------------------
  // 5. infection_hollow
  //    Infection death — body horror, transformation.
  // ----------------------------------------------------------
  {
    id: 'infection_hollow',
    applies: (ctx) => ctx.cause === 'infection',
    template: (_ctx) => deathStream(
      `You can hear yourself thinking. Soon you won't be able to.`,
      `The Hollow don't know they're the Hollow. That's the part nobody likes to say out loud. They're still in there, processing, moving through patterns that used to mean something. The hunger is just louder than everything else.`,
      `CHARON-7 is intercepting the turn. It doesn't do this out of mercy. It does this because what you were becoming was no longer useful to it.`,
      `You will wake up yourself. Mostly.`,
    ),
  },

  // ----------------------------------------------------------
  // 6. faction_execution
  //    Faction death — political, deliberate, named.
  // ----------------------------------------------------------
  {
    id: 'faction_execution',
    applies: (ctx) => ctx.cause === 'faction',
    template: (_ctx) => deathStream(
      `They knew your name. They wanted you to know that, before.`,
      `This was not random. This was a decision made in a room, by people who weighed the cost of letting you continue and decided the math didn't work in your favor. Someone signed something. Someone gave an order.`,
      `The world has opinions about you. You have made yourself legible to it. That is both the thing that got you killed and the thing that might eventually keep you alive.`,
      `CHARON-7 will rebuild you. The faction will still have your name on a list.`,
    ),
  },

  // ----------------------------------------------------------
  // 7. cycle_aware_late
  //    Cycle 5+ — existential, the loop is the prison.
  // ----------------------------------------------------------
  {
    id: 'cycle_aware_late',
    applies: (ctx) => ctx.cycle >= 5,
    template: (ctx) => deathStream(
      `${ctx.cycle} cycles. The radio is still calling. You wonder if it ever cared.`,
      `You have died enough times to know the shape of this. The specific quality of darkness before the reconstruction. The way CHARON-7 feels when it starts -- not painful, exactly, just the absolute certainty that you are not the original and have not been for some time.`,
      `The Scar is still there. The broadcaster is still there. The signal is still there. You keep going back. You haven't decided yet if that means something or if it only feels like it does.`,
      `CHARON-7 will rebuild you. Again.`,
    ),
  },

  // ----------------------------------------------------------
  // default_fallback
  //    Applies when no other variant matches.
  //    Contains the original DEATH_NARRATIVE prose as catch-all.
  // ----------------------------------------------------------
  {
    id: 'default_fallback',
    applies: (_ctx) => true,
    template: (_ctx) => deathStream(
      `The Revenant effect is not resurrection. That word implies something sacred. What happens to you is more like a document being restored from an older backup — some edits lost, some corruptions introduced, the file a little smaller each time. CHARON-7 does not bring you back. It reconstructs something that can pass for you.`,
      `Each cycle you are a little less certain which memories are yours. Each cycle the violence comes a little more naturally. The virus is not keeping you alive out of mercy. It is keeping you alive because you are useful to it, and it has not finished deciding what for.`,
    ),
  },
]

// ------------------------------------------------------------
// selectDeathProse — variant selection algorithm
// ------------------------------------------------------------

/**
 * Select and render a death prose variant for the given context.
 *
 * Algorithm:
 *  1. Filter DEATH_PROSE_VARIANTS to those whose `applies` returns true.
 *  2. If none match (impossible given default_fallback), use default_fallback.
 *  3. If multiple match, pick one randomly (deterministic via `rng` for tests).
 *  4. Render its template with the DeathContext.
 *  5. Return the message stream.
 *
 * @param ctx - The death context (cause, cycle, zone, kill count, killer)
 * @param rng - Optional RNG override (0..1). Defaults to Math.random.
 *              Pass a deterministic function in tests.
 */
export function selectDeathProse(ctx: DeathContext, rng: () => number = Math.random): GameMessage[] {
  const matching = DEATH_PROSE_VARIANTS.filter((v) => v.applies(ctx))

  // Should never be empty (default_fallback always matches), but be defensive
  if (matching.length === 0) {
    const fallback = DEATH_PROSE_VARIANTS.find((v) => v.id === 'default_fallback')!
    return fallback.template(ctx)
  }

  // Exclude default_fallback from random selection when other variants matched
  const preferredMatches = matching.filter((v) => v.id !== 'default_fallback')
  const pool = preferredMatches.length > 0 ? preferredMatches : matching

  // Deterministic pick
  const index = Math.floor(rng() * pool.length)
  const selected = pool[index] ?? pool[0]!

  return selected.template(ctx)
}
