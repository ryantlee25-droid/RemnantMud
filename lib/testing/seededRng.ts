// ============================================================
// lib/testing/seededRng.ts — Deterministic PRNG for tests
//
// TEST-ONLY utility. This file MUST NOT be imported by any
// production code. It exists solely to make combat simulations
// deterministic and reproducible across test runs.
//
// Usage:
//   import { mulberry32, withSeededRandom } from '@/lib/testing/seededRng'
//
//   const rng = mulberry32(42)
//   const x = rng()  // 0.0–1.0, deterministic
//
//   withSeededRandom(42, () => {
//     // Math.random() is deterministic here
//     combatFunction()
//   })
// ============================================================

/**
 * Mulberry32 — a fast, high-quality 32-bit PRNG by Tommy Ettinger.
 * Not crypto-grade. Suitable for game simulations and test reproducibility.
 *
 * @param seed - Integer seed. Different seeds produce independent sequences.
 * @returns A function that returns a float in [0, 1) each time it is called.
 */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0  // coerce to uint32
  return function () {
    s = (s + 0x6d2b79f5) >>> 0
    let z = s
    z = Math.imul(z ^ (z >>> 15), z | 1)
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61)
    z = (z ^ (z >>> 14)) >>> 0
    return z / 0x100000000
  }
}

/**
 * Vitest helper: run `fn` with Math.random replaced by a deterministic
 * mulberry32 generator seeded with `seed`. Restores Math.random afterwards,
 * even if `fn` throws.
 *
 * Supports synchronous callbacks only (combat engine is fully sync).
 *
 * @param seed - Deterministic seed for the RNG.
 * @param fn - Callback to run under the seeded RNG.
 * @returns The return value of `fn`.
 */
export function withSeededRandom<T>(seed: number, fn: () => T): T {
  const original = Math.random
  const rng = mulberry32(seed)
  Math.random = rng
  try {
    return fn()
  } finally {
    Math.random = original
  }
}
