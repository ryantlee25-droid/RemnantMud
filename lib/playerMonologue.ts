// ============================================================
// playerMonologue.ts — Player Identity & Voice
// Convoy: remnant-narrative-0329 | Rider F
//
// Exports:
//   shouldTriggerMonologue(context)  — 15% gate
//   generateMonologue(context, playerClass, personalLoss, lossName?)
//   getPhysicalStateNarration(playerState)
//   getPersonalLossEcho(trigger, personalLoss, lossName)
//   getReputationVoice(playerRep, currentZone)
// ============================================================

import type { GameMessage, CharacterClass, PersonalLossType, FactionType, ZoneType } from '@/types/game'
import type { MonologueContext, MonologueTrigger, MonologuePool } from '@/types/convoy-contracts'

// Re-export MonologuePool for consumers
export type { MonologuePool }

// ------------------------------------------------------------
// Session-level deduplication — never repeat a line per session
// ------------------------------------------------------------

const _usedLines = new Set<string>()

/** Reset session dedup (call on new game / rebirth). */
export function resetMonologueSession(): void {
  _usedLines.clear()
}

// ------------------------------------------------------------
// Lazy pool loader — avoids circular imports at module load time
// ------------------------------------------------------------

type PoolMap = Map<CharacterClass, MonologuePool[]>

let _poolCache: PoolMap | null = null

async function getPoolCache(): Promise<PoolMap> {
  if (_poolCache) return _poolCache
  const [
    { ENFORCER_POOLS },
    { SCOUT_POOLS },
    { WRAITH_POOLS },
    { SHEPHERD_POOLS },
    { RECLAIMER_POOLS },
    { WARDEN_POOLS },
    { BROKER_POOLS },
  ] = await Promise.all([
    import('@/data/playerMonologues/class_enforcer'),
    import('@/data/playerMonologues/class_scout'),
    import('@/data/playerMonologues/class_wraith'),
    import('@/data/playerMonologues/class_shepherd'),
    import('@/data/playerMonologues/class_reclaimer'),
    import('@/data/playerMonologues/class_warden'),
    import('@/data/playerMonologues/class_broker'),
  ])
  _poolCache = new Map<CharacterClass, MonologuePool[]>([
    ['enforcer', ENFORCER_POOLS],
    ['scout', SCOUT_POOLS],
    ['wraith', WRAITH_POOLS],
    ['shepherd', SHEPHERD_POOLS],
    ['reclaimer', RECLAIMER_POOLS],
    ['warden', WARDEN_POOLS],
    ['broker', BROKER_POOLS],
  ])
  return _poolCache
}

// ------------------------------------------------------------
// shouldTriggerMonologue — 15% base rate gate
// Returns false during combat (combat context has no roomData.hasEnemies gate
// — caller/Rider H gates on combatState per contract §4.4)
// ------------------------------------------------------------

export function shouldTriggerMonologue(): boolean {
  return Math.random() < 0.15
}

// ------------------------------------------------------------
// generateMonologue — main entry point for Rider H
// Returns null if no matching pool / all lines exhausted
// ------------------------------------------------------------

export async function generateMonologue(
  context: MonologueContext,
  playerClass: CharacterClass,
  personalLoss: PersonalLossType,
  lossName?: string
): Promise<GameMessage | null> {
  // Personal-loss triggers take priority and route to getPersonalLossEcho
  if (context.trigger === 'examining_loss_item' && lossName) {
    return getPersonalLossEcho(context.trigger, personalLoss, lossName)
  }

  const pools = await getPoolCache()
  const classPools = pools.get(playerClass)
  if (!classPools) return null

  // Find a pool matching trigger + loss
  const candidates = classPools.filter(
    (p) => p.trigger === context.trigger && p.personalLoss === personalLoss
  )

  // Fall back to any pool for this trigger if no loss-specific one exists
  const pool =
    candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : classPools.find((p) => p.trigger === context.trigger) ?? null

  if (!pool || pool.lines.length === 0) return null

  // Filter out already-used lines (session dedup)
  let available = pool.lines.filter((l) => !_usedLines.has(l))

  // Pool exhausted — reset and retry once so the system is self-healing
  // rather than going silent when all lines have been seen this session.
  if (available.length === 0) {
    _usedLines.clear()
    available = pool.lines.filter((l) => !_usedLines.has(l))
  }

  if (available.length === 0) return null

  const line = available[Math.floor(Math.random() * available.length)]
  _usedLines.add(line)

  return {
    id: crypto.randomUUID(),
    text: line,
    type: 'narrative',
  }
}

// ------------------------------------------------------------
// getPhysicalStateNarration
// Called post-action to surface embodied physical state.
// playerState shape: subset of Player + NarrativePlayerFields
// ------------------------------------------------------------

export interface PhysicalStateInput {
  hp: number
  maxHp: number
  cycle: number
  actionsTaken: number
  lastRestAt?: number             // actionsTaken when player last rested
  inCombat?: boolean
  conditions?: string[]           // active condition IDs
}

export function getPhysicalStateNarration(
  playerState: PhysicalStateInput
): GameMessage | null {
  const { hp, maxHp, cycle, actionsTaken, lastRestAt, inCombat, conditions } = playerState

  if (inCombat) return null

  const hpPercent = maxHp > 0 ? hp / maxHp : 1
  const actionsSinceRest = lastRestAt != null ? actionsTaken - lastRestAt : 0

  // Priority order: critical state first

  // Low HP (<25%)
  if (hpPercent < 0.25) {
    const lines = [
      `*"The corridor stretches ahead. It looks longer than it should. Everything looks longer when you're bleeding."*`,
      `*"You blink. The world swims. Stay moving."*`,
      `*"Your hand leaves a print on the wall. You don't stop to look at it."*`,
    ]
    return _physLine(lines)
  }

  // Poisoned
  if (conditions?.includes('poisoned')) {
    const lines = [
      `*"The room smells like copper. That might be the room. That might be you."*`,
      `*"Your fingers are numb. You need to think about that. Later."*`,
      `*"The edges of things are soft. Poison does that. You know what else it does."*`,
    ]
    return _physLine(lines)
  }

  // Post-rebirth — first 20 actions of cycle > 1
  if (cycle > 1 && actionsTaken <= 20) {
    const lines = [
      `*"You know this room. Your body knows it before you do. Your hands remember the door handle."*`,
      `*"You've been here. The exact quality of the light. You've been here."*`,
      `*"Your feet find the path without looking. That should comfort you. It doesn't."*`,
    ]
    return _physLine(lines)
  }

  // High cycle (5+)
  if (cycle >= 5) {
    const lines = [
      `*"You've done this before. All of it. The déjà vu isn't déjà vu. It's memory."*`,
      `*"The fifth time changes you. You're not sure if it's refinement or erosion."*`,
      `*"You stopped being surprised somewhere around the third time. That was its own kind of loss."*`,
    ]
    return _physLine(lines)
  }

  // Exhausted (no rest for 50+ actions)
  if (actionsSinceRest >= 50) {
    const lines = [
      `*"The words on the sign blur. You blink. They blur again."*`,
      `*"You've been moving too long. Your body is sending messages you keep ignoring."*`,
      `*"Rest. The word sits in your head. You keep walking anyway."*`,
    ]
    return _physLine(lines)
  }

  // After combat (checked by trigger context in generateMonologue; this catches
  // the embodied version for low-hp post-combat specifically)
  if (hpPercent < 0.5 && hpPercent >= 0.25) {
    const lines = [
      `*"Your hands are shaking. They always shake after. You don't think about what that means."*`,
      `*"Count the damage later. Keep moving now."*`,
    ]
    // Only 30% chance for this mild state — less urgent
    if (Math.random() < 0.30) return _physLine(lines)
  }

  return null
}

function _physLine(lines: string[]): GameMessage {
  return {
    id: crypto.randomUUID(),
    text: lines[Math.floor(Math.random() * lines.length)],
    type: 'narrative',
  }
}

// ------------------------------------------------------------
// getPersonalLossEcho
// Surfaces personal loss when the world echoes it back.
// trigger: the triggering event type (room tag, item examination, etc.)
// ------------------------------------------------------------

export function getPersonalLossEcho(
  trigger: string,
  personalLoss: PersonalLossType,
  lossName: string
): GameMessage | null {
  let line: string | null = null

  switch (personalLoss) {
    case 'child':
      if (trigger === 'witnessing_children' || trigger === 'examining_loss_item') {
        const lines = [
          `*"The kid has ${lossName}'s hair. The exact shade. You look away."*`,
          `*"For a second, in the bad light, you almost called out. You didn't. You never do."*`,
          `*"Children shouldn't be here. Neither should you. You keep moving."*`,
        ]
        line = lines[Math.floor(Math.random() * lines.length)]
      }
      break

    case 'partner':
      if (trigger === 'witnessing_community' || trigger === 'examining_loss_item') {
        const lines = [
          `*"The wedding ring on the skeleton is the wrong hand. You check. You always check."*`,
          `*"Two cups set out on the table. Someone is still setting two cups. You understand that."*`,
          `*"You reach for someone who isn't there. Your hand finds air. That's become familiar."*`,
        ]
        line = lines[Math.floor(Math.random() * lines.length)]
      }
      break

    case 'community':
      if (trigger === 'witnessing_community' || trigger === 'safe_rest') {
        const lines = [
          `*"They've built something here. The shape of it — the market, the walls, the shared meals — is so familiar your throat closes."*`,
          `*"You sit at the edge of their fire. You're not part of it. But you remember being part of one."*`,
          `*"The sound of people organizing. Working together. You didn't know you'd missed it this much."*`,
        ]
        line = lines[Math.floor(Math.random() * lines.length)]
      }
      break

    case 'identity':
      if (trigger === 'discovery' || trigger === 'examining_loss_item') {
        const lines = [
          `*"The name on the document. Not yours. Or maybe it was, once."*`,
          `*"You find a photograph. You study it for too long, looking for evidence of yourself."*`,
          `*"Someone lived a life here. You piece it together like you used to piece together yours."*`,
        ]
        line = lines[Math.floor(Math.random() * lines.length)]
      }
      break

    case 'promise':
      if (trigger === 'safe_rest' || trigger === 'examining_loss_item') {
        const lines = [
          `*"You made a promise. You're keeping it. That's all this is."*`,
          `*"${lossName} would say you've gone too far. You think about that. You keep going."*`,
          `*"Some promises shouldn't be kept. That's never stopped you."*`,
        ]
        line = lines[Math.floor(Math.random() * lines.length)]
      }
      break
  }

  if (!line) return null
  if (_usedLines.has(line)) return null
  _usedLines.add(line)

  return {
    id: crypto.randomUUID(),
    text: line,
    type: 'narrative',
  }
}

// ------------------------------------------------------------
// getReputationVoice
// 30% chance on zone entry — surfaces how the world sees the player.
// playerRep: Record<FactionType, number>
// currentZone: ZoneType
// ------------------------------------------------------------

export function getReputationVoice(
  playerRep: Partial<Record<FactionType, number>>,
  currentZone: ZoneType,
  cycle: number
): GameMessage | null {
  if (Math.random() >= 0.30) return null

  const accordRep = playerRep['accord'] ?? 0
  const saltersRep = playerRep['salters'] ?? 0
  const kindlingRep = playerRep['kindling'] ?? 0

  const candidates: string[] = []

  if (accordRep >= 2) {
    candidates.push(
      `*"Cross's people told us about you. They said you could be trusted. I'm reserving judgment."*`
    )
  }

  if (saltersRep <= -2) {
    candidates.push(
      `*"The Salters put a name on the list. Your name. I'd stay off the eastern highway."*`
    )
  }

  if (kindlingRep >= 2) {
    candidates.push(
      `*"The fire has been in you. Harrow's people recognize their own."*`
    )
  }

  if (cycle >= 3) {
    candidates.push(
      `*"You're the one who keeps coming back. People talk about that. Not kindly."*`
    )
  }

  if (candidates.length === 0) return null

  const line = candidates[Math.floor(Math.random() * candidates.length)]
  if (_usedLines.has(line)) return null
  _usedLines.add(line)

  return {
    id: crypto.randomUUID(),
    text: line,
    type: 'narrative',
  }
}
