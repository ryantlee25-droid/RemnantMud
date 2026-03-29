// ============================================================
// narratorVoice.ts — Unreliable narrator whisper system
// Convoy: remnant-narrative-0329 | Rider G
//
// The narrator is an occasional, rare, intimate voice that speaks
// TO the player. Not a game system. Something that watches.
// Something that knows more than it should.
//
// Integration: Rider H calls shouldNarratorSpeak() on each action,
// then generateNarratorVoice() if it returns true.
// Never call during combat. Cannot fire same action as monologue.
// ============================================================

import type { GameMessage, ZoneType } from '@/types/game'
import type { NarratorConfig, NarratorVoice } from '@/types/convoy-contracts'
import {
  NARRATOR_WHISPER_POOL,
  ACT_TRANSITION_LINES,
  CYCLE_WHISPERS,
  PRESSURE_WHISPERS,
  PERSONAL_LOSS_WHISPERS,
} from '@/data/narratorVoices'

// ============================================================
// Config — matches NarratorConfig from convoy-contracts.d.ts
// ============================================================

export const NARRATOR_CONFIG: NarratorConfig = {
  baseSpawnChance: 0.05,
  highPressureSpawnChance: 0.10,
  highPressureThreshold: 8,
  minActionsBetweenSpawns: 50,
  neverInCombat: true,
}

// ============================================================
// NarratorContext — the call-site context shape
// Not in convoy-contracts (it's a local convenience type).
// ============================================================

export interface NarratorContext {
  act: 1 | 2 | 3
  zone: ZoneType
  cycle: number
  pressure: number
  questFlags: string[]
  playerHP: number
  playerMaxHP: number
  personalLoss?: string
  recentDiscovery?: string
  recentDeath?: boolean
}

// ============================================================
// Session deduplication — tracks IDs used this session.
// Module-level Set; cleared on new game by clearNarratorSession().
// ============================================================

const _usedIds = new Set<string>()

export function clearNarratorSession(): void {
  _usedIds.clear()
}

// ============================================================
// shouldNarratorSpeak
//
// Returns true when the narrator may speak this action.
//
// Rules:
// - Never during combat (caller must check; neverInCombat enforced here
//   as a safety net via the inCombat parameter)
// - Never within minActionsBetweenSpawns (50) actions of last speak
// - Base chance: 5%
// - High pressure (>= 8): chance doubles to 10%
// ============================================================

export function shouldNarratorSpeak(
  actionCount: number,
  lastNarratorAction: number,
  pressure: number,
  inCombat: boolean
): boolean {
  // Hard gate: never in combat
  if (inCombat) return false

  // Hard gate: must be >= 50 actions since last narrator whisper
  if (actionCount - lastNarratorAction < NARRATOR_CONFIG.minActionsBetweenSpawns) {
    return false
  }

  // Probability gate
  const chance =
    pressure >= NARRATOR_CONFIG.highPressureThreshold
      ? NARRATOR_CONFIG.highPressureSpawnChance
      : NARRATOR_CONFIG.baseSpawnChance

  return Math.random() < chance
}

// ============================================================
// buildNarratorMessage
// Constructs a GameMessage from narrator text.
// Type 'echo' renders in amber-600, distinct from narrative.
// ============================================================

function buildNarratorMessage(text: string): GameMessage {
  return {
    id: crypto.randomUUID(),
    text,
    type: 'echo',
  }
}

// ============================================================
// selectFromPool
// Selects a NarratorVoice from the pool, filtering by context
// and excluding already-used IDs.
// Falls back to a broader pool if the filtered pool is exhausted.
// ============================================================

function selectFromPool(
  pool: NarratorVoice[],
  usedIds: Set<string>
): NarratorVoice | null {
  const available = pool.filter((v) => !usedIds.has(v.id))
  if (available.length === 0) return null
  return available[Math.floor(Math.random() * available.length)]
}

// ============================================================
// generateNarratorVoice
//
// Returns a GameMessage containing the narrator whisper for
// the current context.
//
// Selection priority:
// 1. If recentDeath or high-pressure: pressure pool (>= 7)
// 2. If personalLoss present: occasionally draw from loss pool
// 3. If cycle >= 2: occasionally draw from cycle pool
// 4. Act-specific pool filtered by current act
// 5. General pool as fallback
//
// All selected voices are deduplicated within the session.
// ============================================================

export function generateNarratorVoice(
  context: NarratorContext
): GameMessage | null {
  const { act, cycle, pressure, personalLoss, recentDeath } = context

  // --- Priority 1: Pressure / recent death ---
  const usePressurePool =
    recentDeath || pressure >= 7

  if (usePressurePool) {
    const voice = selectFromPool(PRESSURE_WHISPERS, _usedIds)
    if (voice) {
      _usedIds.add(voice.id)
      return buildNarratorMessage(voice.text)
    }
  }

  // --- Priority 2: Personal loss (30% chance when loss is present) ---
  if (personalLoss && Math.random() < 0.30) {
    const voice = selectFromPool(PERSONAL_LOSS_WHISPERS, _usedIds)
    if (voice) {
      _usedIds.add(voice.id)
      return buildNarratorMessage(voice.text)
    }
  }

  // --- Priority 3: Cycle awareness (40% chance on cycle >= 2) ---
  if (cycle >= 2 && Math.random() < 0.40) {
    const voice = selectFromPool(CYCLE_WHISPERS, _usedIds)
    if (voice) {
      _usedIds.add(voice.id)
      return buildNarratorMessage(voice.text)
    }
  }

  // --- Priority 4: Act-specific pool ---
  const actPool = NARRATOR_WHISPER_POOL.filter((v) => v.act === act)
  if (actPool.length > 0) {
    const voice = selectFromPool(actPool, _usedIds)
    if (voice) {
      _usedIds.add(voice.id)
      return buildNarratorMessage(voice.text)
    }
  }

  // --- Priority 5: General pool (no act restriction) ---
  const generalPool = NARRATOR_WHISPER_POOL.filter((v) => v.act === undefined)
  const voice = selectFromPool(generalPool, _usedIds)
  if (voice) {
    _usedIds.add(voice.id)
    return buildNarratorMessage(voice.text)
  }

  // Pool fully exhausted for this session
  return null
}

// ============================================================
// getNarratorActTransition
//
// Returns narrator messages for act boundary transitions.
// Always fires at act transitions (not probabilistic).
// Called by Rider H when questFlags 'act1_complete' or
// 'act2_complete' are set.
// ============================================================

export function getNarratorActTransition(
  fromAct: number,
  toAct: number
): GameMessage[] {
  const key = `${fromAct}_to_${toAct}`
  const lines = ACT_TRANSITION_LINES[key]
  if (!lines || lines.length === 0) return []

  return lines.map((text) => buildNarratorMessage(text))
}
