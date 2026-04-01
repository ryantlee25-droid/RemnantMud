// ============================================================
// hollowPressure.ts — Dread & Tension System
// Convoy: remnant-narrative-0329 | Rider B
//
// The pressure meter. 0 = quiet. 10 = swarm.
// Sound design through text: silence is the horror.
// ============================================================

import { msg } from '@/lib/messages'
import type { GameMessage } from '@/types/game'
import type { PressureLevel } from '@/types/convoy-contracts'

// ------------------------------------------------------------
// Pressure computation
// ------------------------------------------------------------

/**
 * Recompute pressure based on how many actions have been taken
 * since the last pressure tick. Returns the new pressure value.
 *
 * Called by Rider H on every action. Does NOT write to player state.
 */
export function computePressure(
  currentPressure: number,
  actionCount: number,
  lastPressureTick: number,
): number {
  const actionsSinceTick = actionCount - lastPressureTick
  const increments = Math.floor(actionsSinceTick / 10)
  if (increments <= 0) return currentPressure
  return applyPressureDelta(currentPressure, increments)
}

/**
 * Apply a positive or negative delta to pressure.
 * Always clamps result to [0, 10].
 */
export function applyPressureDelta(currentPressure: number, delta: number): number {
  return Math.max(0, Math.min(10, currentPressure + delta))
}

// ------------------------------------------------------------
// Pressure narration
// ------------------------------------------------------------

/**
 * Returns ambient narrative messages matching the current
 * pressure level. Covers all 11 levels (0–10).
 *
 * Called by Rider H when it needs to show pressure state to player.
 */
export function getPressureNarration(level: number): GameMessage[] {
  const clamped = Math.max(0, Math.min(10, Math.round(level))) as PressureLevel
  return PRESSURE_NARRATION[clamped].map(text => msg(text))
}

const PRESSURE_NARRATION: Record<PressureLevel, string[]> = {
  0: [
    'Quiet. The ordinary quiet of a world that still works.',
    'Birds somewhere. Wind. Nothing watching.',
  ],
  1: [
    'Stillness. Almost peaceful. Almost.',
    'The light is good. The air tastes like nothing at all.',
  ],
  2: [
    'Distant sounds carry where they shouldn\'t.',
    'Wind from the east, and something riding it you can\'t name.',
  ],
  3: [
    'A sound from the wrong direction. You stop. It stops.',
    'Somewhere behind you, something shifted. You did not see it.',
  ],
  4: [
    'Something at the edge of hearing. Movement where there shouldn\'t be.',
    'The hairs on your arms have been standing for two minutes.',
    'You keep almost hearing your name.',
  ],
  5: [
    'The quality of the silence has changed. It has weight now.',
    'Your footsteps sound too loud. Everything else sounds too quiet.',
    'You count the shadows out of habit. One of them is wrong.',
  ],
  6: [
    'Your heartbeat fills the silence. Every shadow has weight.',
    'You realize you\'ve been holding your breath. You don\'t remember starting.',
    'The dark between things looks back.',
  ],
  7: [
    'The air is thick with it. Waiting. Something is waiting.',
    'Your hands have found weapons without you asking them to.',
    'You hear your own pulse in your ears. It is faster than it should be.',
  ],
  8: [
    'Breathing is difficult. The air tastes like copper and something older.',
    'Your vision has narrowed to a tunnel. The edges are moving.',
    'Your mouth is dry. Your hands are shaking. Your body is already running.',
  ],
  9: [
    'Fear has become a physical thing, a pressure behind your eyes.',
    'Every breath is a decision. Every step is a choice not to run.',
    'The dark is full and the full dark is full of sound you almost recognize.',
  ],
  10: [
    'The world holds its breath.',
    'Then screams.',
  ],
}

// ------------------------------------------------------------
// Encounter modifier
// ------------------------------------------------------------

/**
 * Returns a multiplier for Hollow encounter chance.
 * 1.0 at pressure 0. Scales up to 3.0 at pressure 10.
 */
export function getPressureEncounterModifier(level: number): number {
  const clamped = Math.max(0, Math.min(10, level))
  // Linear scale: 1.0 at 0, 3.0 at 10
  return 1.0 + (clamped / 10) * 2.0
}

// ------------------------------------------------------------
// Swarm trigger
// ------------------------------------------------------------

/**
 * Returns true when pressure has reached the swarm threshold (10).
 * Rider H fires the swarm event when this returns true.
 */
export function shouldTriggerSwarm(level: number): boolean {
  return level >= 10
}

// ------------------------------------------------------------
// Sound design: silence narration
// ------------------------------------------------------------

/**
 * "The insects go quiet. All of them. At once."
 *
 * Call when ambient sounds stop — signaling incoming danger.
 * More frightening than any loud sound.
 */
export function getSilenceNarration(): GameMessage {
  const lines = [
    'The insects go quiet. All of them. At once.',
    'The birds stop mid-call. You hear the last note cut short.',
    'Everything stops making noise at the same moment.',
    'The ambient world switches off. The silence is absolute.',
    'Something you were not aware of hearing goes silent.',
    'The world holds very still, the way it does before something breaks.',
  ]
  const text = lines[Math.floor(Math.random() * lines.length)]
  return msg(text)
}

// ------------------------------------------------------------
// Mundane horror layer
// ------------------------------------------------------------

/**
 * 3% chance in "safe" rooms of wrongness.
 * Returns null most of the time. When it fires, returns a
 * GameMessage describing something subtly wrong.
 *
 * @param roomContext - A string hint about the room (e.g. room id or zone)
 */
export function getMundaneHorrorNarration(roomContext: string): GameMessage | null {
  if (Math.random() > 0.03) return null

  const horrorPool: string[] = [
    // Count that's wrong
    'The guard by the gate is counting people. He has been counting' +
      ' for a while. He counts again. The number is the same. It' +
      ' shouldn\'t be.',
    // Food that shouldn\'t be fresh
    'The bread at the food stall is fresh. It has been fresh every' +
      ' time you\'ve come. No one talks about this.',
    // The door
    'You locked that door behind you. You are certain of it.' +
      ' The door is unlocked.',
    // Sound that stops
    'Someone is crying somewhere in the building. You turn to look.' +
      ' The crying stops. Exactly when you turn.',
    // One too many
    'You count the people in the room out of habit. You count again.' +
      ' The second count is higher than the first by one.',
    // The fresh grave
    'There is fresh soil by the east wall. There is always fresh soil' +
      ' by the east wall. No one plants anything.',
    // The fire
    'The fire has been burning since you arrived. No one has added wood.',
    // The dog
    'The dog in the corner has been sitting in exactly that position' +
      ' since you arrived. It has not moved. It is watching the wall.',
    // The child
    'A child is drawing in the dirt by the entrance.' +
      ' You look at the drawing. The drawing is of this room.' +
      ' You are in it.',
    // The window
    'You pass the window. There is a reflection.' +
      ' The reflection does not look away when you do.',
  ]

  // Mix room identity with temporal variation so the same room
  // doesn't always surface the same horror line. The room hash
  // provides a base offset; Date.now() in ~10-minute buckets and
  // a random nudge ensure variety across visits.
  let roomHash = 0
  for (let i = 0; i < roomContext.length; i++) {
    roomHash = (roomHash + roomContext.charCodeAt(i)) % horrorPool.length
  }
  const timeBucket = Math.floor(Date.now() / 600_000) // ~10-minute windows
  const finalIndex = (roomHash + timeBucket + Math.floor(Math.random() * horrorPool.length)) % horrorPool.length
  return msg(horrorPool[finalIndex])
}
