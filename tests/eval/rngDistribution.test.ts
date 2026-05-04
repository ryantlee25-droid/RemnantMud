// ============================================================
// tests/eval/rngDistribution.test.ts
// T1-D + P2-E — RNG Distribution Test Suite
//
// Verifies that lib/dice.ts roll primitives produce statistically
// correct distributions over seeded runs. All rolls use
// withSeededRandom from lib/testing/seededRng.ts so results are
// deterministic — running this file 5× in a row always produces
// identical pass/fail outcomes.
//
// Spec authority: content/the-remnant-rng-system.md
// Functions under test: roll1d10, rollDamage, rollCheck
//
// Tolerance rationale (inline per assertion below):
// ============================================================

import { describe, it, expect } from 'vitest'
import { roll1d10, rollDamage, rollCheck, statModifier } from '@/lib/dice'
import { mulberry32, withSeededRandom } from '@/lib/testing/seededRng'

// ============================================================
// Constants
// ============================================================

// 10,000 iterations gives a standard error of ~0.22% per face on a d10
// (σ = sqrt(p*(1-p)/N) = sqrt(0.1*0.9/10000) ≈ 0.003). A ±2% window is
// ~6σ — essentially impossible to fail by chance while still catching
// pathological mis-implementations.
const N = 10_000

// Seed range: use sequential seeds 0..N-1 so each trial gets a fresh sequence
// and no single seed biases the distribution.

// ============================================================
// Seeded RNG determinism
// ============================================================

describe('mulberry32 — deterministic PRNG', () => {
  it('same seed produces the same sequence', () => {
    const rng1 = mulberry32(42)
    const rng2 = mulberry32(42)
    for (let i = 0; i < 100; i++) {
      expect(rng1()).toBe(rng2())
    }
  })

  it('different seeds produce different sequences', () => {
    const rng1 = mulberry32(1)
    const rng2 = mulberry32(2)
    const seq1 = Array.from({ length: 20 }, () => rng1())
    const seq2 = Array.from({ length: 20 }, () => rng2())
    // Two independent sequences should not be identical
    const allMatch = seq1.every((v, i) => v === seq2[i])
    expect(allMatch).toBe(false)
  })

  it('output is in [0, 1)', () => {
    const rng = mulberry32(999)
    for (let i = 0; i < 1_000; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('seed 0 is valid and produces a finite sequence', () => {
    const rng = mulberry32(0)
    for (let i = 0; i < 10; i++) {
      const v = rng()
      expect(Number.isFinite(v)).toBe(true)
    }
  })
})

describe('withSeededRandom — Math.random replacement', () => {
  it('same seed + same function = same result (determinism)', () => {
    const result1 = withSeededRandom(7, () => roll1d10())
    const result2 = withSeededRandom(7, () => roll1d10())
    expect(result1).toBe(result2)
  })

  it('restores Math.random after the callback', () => {
    const original = Math.random
    withSeededRandom(1, () => { /* do nothing */ })
    expect(Math.random).toBe(original)
  })

  it('restores Math.random even when the callback throws', () => {
    const original = Math.random
    expect(() => withSeededRandom(1, () => { throw new Error('test') })).toThrow('test')
    expect(Math.random).toBe(original)
  })

  it('callback return value is preserved', () => {
    const val = withSeededRandom(42, () => 'hello')
    expect(val).toBe('hello')
  })
})

// ============================================================
// roll1d10 — uniform d10 distribution
// ============================================================

describe('roll1d10 — range and uniformity', () => {
  // Collect N rolls using seed-per-roll so the aggregate is seed-stable.
  const d10Results: number[] = []
  for (let i = 0; i < N; i++) {
    withSeededRandom(i, () => { d10Results.push(roll1d10()) })
  }

  it('all values fall in [1, 10]', () => {
    for (const r of d10Results) {
      expect(r).toBeGreaterThanOrEqual(1)
      expect(r).toBeLessThanOrEqual(10)
      expect(Number.isInteger(r)).toBe(true)
    }
  })

  it('all 10 faces appear at least once', () => {
    const seen = new Set(d10Results)
    for (let face = 1; face <= 10; face++) {
      expect(seen.has(face)).toBe(true)
    }
  })

  it('each face appears within ±2% of the expected 10% frequency over 10,000 rolls', () => {
    // Expected per face: 10%. Tolerance: ±2% absolute (see file header for σ analysis).
    // This bounds false-positive rate to effectively zero while detecting a 2-face bias.
    for (let face = 1; face <= 10; face++) {
      const pct = d10Results.filter(r => r === face).length / N
      expect(pct).toBeGreaterThan(0.08)  // 10% - 2%
      expect(pct).toBeLessThan(0.12)     // 10% + 2%
    }
  })

  it('min is 1 and max is 10 across 10,000 rolls', () => {
    expect(Math.min(...d10Results)).toBe(1)
    expect(Math.max(...d10Results)).toBe(10)
  })
})

// ============================================================
// rollDamage — range property tests for multiple die sizes
// ============================================================

describe('rollDamage — min/max bounds and distribution', () => {
  const DIE_SIZES = [3, 6, 8, 10, 12] as const

  for (const n of DIE_SIZES) {
    describe(`rollDamage([1, ${n}])`, () => {
      const results: number[] = []
      for (let i = 0; i < N; i++) {
        withSeededRandom(i, () => { results.push(rollDamage([1, n])) })
      }

      it('min is always 1', () => {
        expect(Math.min(...results)).toBe(1)
      })

      it(`max is always ${n}`, () => {
        expect(Math.max(...results)).toBe(n)
      })

      it(`all values fall in [1, ${n}]`, () => {
        for (const r of results) {
          expect(r).toBeGreaterThanOrEqual(1)
          expect(r).toBeLessThanOrEqual(n)
          expect(Number.isInteger(r)).toBe(true)
        }
      })

      it(`each face appears within ±15% of expected uniform frequency over 10,000 rolls`, () => {
        // Expected per face: 100%/n. Tolerance ±15% relative is generous enough to
        // accommodate small-die variance (d3 faces ~33% each, ±5pp is still statistical).
        // PLAN-EVAL.md T1-D spec: "within ±15% of expected uniform".
        const expected = 1 / n
        for (let face = 1; face <= n; face++) {
          const pct = results.filter(r => r === face).length / N
          // ±15% relative: expected * 0.85 < pct < expected * 1.15
          expect(pct).toBeGreaterThan(expected * 0.85)
          expect(pct).toBeLessThan(expected * 1.15)
        }
      })
    })
  }
})

describe('rollDamage — arbitrary [min, max] ranges', () => {
  it('returns min when range is [min, min]', () => {
    const result = withSeededRandom(1, () => rollDamage([5, 5]))
    expect(result).toBe(5)
  })

  it('respects non-1 min values', () => {
    const results: number[] = []
    for (let i = 0; i < N; i++) {
      withSeededRandom(i, () => { results.push(rollDamage([3, 8])) })
    }
    expect(Math.min(...results)).toBe(3)
    expect(Math.max(...results)).toBe(8)
    for (const r of results) {
      expect(r).toBeGreaterThanOrEqual(3)
      expect(r).toBeLessThanOrEqual(8)
    }
  })
})

// ============================================================
// rollCheck — pass rate vs. theoretical binomial
// ============================================================

// rollCheck(stat, dc) uses a d10 internally.
// statModifier(stat) = stat - 5.
// Pass condition: roll + modifier >= dc, OR roll === 10 (critical).
// Fail condition: roll === 1 (fumble), regardless of total.
//
// Theoretical pass rate formula (d10, faces 1-10):
//   P(pass) = P(critical) + P(normal_pass) - overlap
// Where:
//   P(critical) = 0.10 (roll = 10, always passes)
//   P(fumble)   = 0.10 (roll = 1, always fails)
//   P(normal_pass) = count of rolls in [2..9] where roll + modifier >= dc

function theoreticalPassRate(stat: number, dc: number): number {
  const mod = statModifier(stat)
  let passCount = 0
  for (let roll = 1; roll <= 10; roll++) {
    if (roll === 10) {
      passCount += 1  // critical — always passes
    } else if (roll === 1) {
      // fumble — always fails
    } else {
      if (roll + mod >= dc) passCount += 1
    }
  }
  return passCount / 10
}

describe('rollCheck — pass rates match theoretical binomial within 5%', () => {
  // PLAN-EVAL.md T1-D: "assert pass rate matches theoretical binomial within 5% tolerance"
  // tolerance of ±5% absolute on a pass rate is very conservative at N=10,000.
  const TOLERANCE = 0.05  // ±5 percentage points

  const scenarios: Array<{ stat: number; dc: number }> = [
    // stat=5 (modifier=0): baseline — 40% natural DC5 pass rate
    { stat: 5, dc: 5 },
    { stat: 5, dc: 8 },
    { stat: 5, dc: 10 },
    { stat: 5, dc: 12 },
    { stat: 5, dc: 15 },
    // stat=3 (modifier=-2): below average
    { stat: 3, dc: 5 },
    { stat: 3, dc: 8 },
    // stat=7 (modifier=+2): above average
    { stat: 7, dc: 5 },
    { stat: 7, dc: 8 },
    { stat: 7, dc: 12 },
    // stat=9 (modifier=+4): high stat
    { stat: 9, dc: 8 },
    { stat: 9, dc: 14 },
  ]

  for (const { stat, dc } of scenarios) {
    it(`stat=${stat} dc=${dc}: observed pass rate within ±5% of theoretical`, () => {
      const theoretical = theoreticalPassRate(stat, dc)

      let passes = 0
      for (let i = 0; i < N; i++) {
        withSeededRandom(i, () => {
          const result = rollCheck(stat, dc)
          if (result.success) passes++
        })
      }
      const observed = passes / N

      expect(observed).toBeGreaterThan(theoretical - TOLERANCE)
      expect(observed).toBeLessThan(theoretical + TOLERANCE)
    })
  }
})

// ============================================================
// rollCheck — critical hit and fumble rates
// ============================================================

describe('rollCheck — critical and fumble rates match spec', () => {
  // Spec (the-remnant-rng-system.md + lib/dice.ts):
  // - Natural 10 (roll === 10) → critical, always success. Rate: exactly 10%.
  // - Natural 1  (roll === 1)  → fumble, always failure.  Rate: exactly 10%.
  // Over 10,000 seeded rolls we expect ~10% ± 2% for both.
  // Using the same ±2% absolute window as roll1d10 (see file header).

  const critResults: Array<{ critical: boolean; fumble: boolean; roll: number }> = []
  for (let i = 0; i < N; i++) {
    withSeededRandom(i, () => {
      const r = rollCheck(5, 8)  // neutral stat/dc so we can use simple seeding
      critResults.push({ critical: r.critical, fumble: r.fumble, roll: r.roll })
    })
  }

  it('critical rate is ~10% (roll===10)', () => {
    const critRate = critResults.filter(r => r.critical).length / N
    // ±2% absolute — see file header for σ analysis
    expect(critRate).toBeGreaterThan(0.08)
    expect(critRate).toBeLessThan(0.12)
  })

  it('fumble rate is ~10% (roll===1)', () => {
    const fumbleRate = critResults.filter(r => r.fumble).length / N
    expect(fumbleRate).toBeGreaterThan(0.08)
    expect(fumbleRate).toBeLessThan(0.12)
  })

  it('critical and fumble are mutually exclusive', () => {
    const overlap = critResults.filter(r => r.critical && r.fumble)
    expect(overlap).toHaveLength(0)
  })

  it('critical implies roll === 10', () => {
    for (const r of critResults) {
      if (r.critical) expect(r.roll).toBe(10)
    }
  })

  it('fumble implies roll === 1', () => {
    for (const r of critResults) {
      if (r.fumble) expect(r.roll).toBe(1)
    }
  })

  it('critical always produces success regardless of dc', () => {
    // With dc=17 (NEARLY_IMPOSSIBLE) and stat=1 (mod=-4), only a natural 10 passes
    for (let i = 0; i < N; i++) {
      withSeededRandom(i, () => {
        const r = rollCheck(1, 17)
        if (r.critical) expect(r.success).toBe(true)
      })
    }
  })

  it('fumble always produces failure regardless of stat', () => {
    // With stat=10 (mod=+5) and dc=3 (TRIVIAL), only a natural 1 forces failure
    for (let i = 0; i < N; i++) {
      withSeededRandom(i, () => {
        const r = rollCheck(10, 3)
        if (r.fumble) expect(r.success).toBe(false)
      })
    }
  })
})

// ============================================================
// Advantage / Disadvantage — distribution shape
// ============================================================
//
// The RNG spec (the-remnant-rng-system.md §DICE ROLL REFERENCE) defines:
//   advantage    = roll twice, take better result → skews high
//   disadvantage = roll twice, take worse result  → skews low
//
// lib/dice.ts implements roll1d10 as a single-roll primitive. Advantage
// and disadvantage are applied by callers (e.g. lib/actions/combat.ts)
// by calling roll1d10 twice and taking max/min. We test the statistical
// shape of that mechanic here using roll1d10 directly.

describe('advantage (roll twice, take max) skews high vs. single roll', () => {
  const singleResults: number[] = []
  const advantageResults: number[] = []

  for (let i = 0; i < N; i++) {
    withSeededRandom(i * 2, () => { singleResults.push(roll1d10()) })
    // Advantage: two calls inside the same seeded context
    withSeededRandom(i * 2 + 1, () => {
      const r1 = roll1d10()
      const r2 = roll1d10()
      advantageResults.push(Math.max(r1, r2))
    })
  }

  it('advantage mean is higher than single-roll mean', () => {
    const singleMean = singleResults.reduce((a, b) => a + b, 0) / N
    const advMean = advantageResults.reduce((a, b) => a + b, 0) / N
    // Theoretical: E[d10] = 5.5; E[max(d10,d10)] = 7.15
    expect(advMean).toBeGreaterThan(singleMean)
  })

  it('advantage mean is approximately 7 (theoretical 7.15)', () => {
    const advMean = advantageResults.reduce((a, b) => a + b, 0) / N
    // Allow ±0.5 around 7.15 — comfortably within 3σ
    expect(advMean).toBeGreaterThan(6.5)
    expect(advMean).toBeLessThan(7.8)
  })

  it('advantage produces high values (8-10) more than 50% of the time', () => {
    // P(max(d10,d10) >= 8) = 1 - P(both < 8) = 1 - (7/10)^2 = 1 - 0.49 = 0.51
    const highPct = advantageResults.filter(r => r >= 8).length / N
    expect(highPct).toBeGreaterThan(0.45)
  })
})

describe('disadvantage (roll twice, take min) skews low vs. single roll', () => {
  const disadvResults: number[] = []

  for (let i = 0; i < N; i++) {
    withSeededRandom(i, () => {
      const r1 = roll1d10()
      const r2 = roll1d10()
      disadvResults.push(Math.min(r1, r2))
    })
  }

  it('disadvantage mean is below 5.5 (theoretical 3.85)', () => {
    const mean = disadvResults.reduce((a, b) => a + b, 0) / N
    expect(mean).toBeLessThan(5.5)
  })

  it('disadvantage mean is approximately 4 (theoretical 3.85)', () => {
    const mean = disadvResults.reduce((a, b) => a + b, 0) / N
    // Allow ±0.5 around 3.85
    expect(mean).toBeGreaterThan(3.3)
    expect(mean).toBeLessThan(4.4)
  })

  it('disadvantage produces low values (1-3) more than 40% of the time', () => {
    // P(min(d10,d10) <= 3) = 1 - P(both > 3) = 1 - (7/10)^2 = 0.51
    const lowPct = disadvResults.filter(r => r <= 3).length / N
    expect(lowPct).toBeGreaterThan(0.40)
  })
})

describe('advantage vs disadvantage — asymmetry', () => {
  const advResults: number[] = []
  const disadvResults: number[] = []

  for (let i = 0; i < N; i++) {
    withSeededRandom(i, () => {
      const r1 = roll1d10()
      const r2 = roll1d10()
      advResults.push(Math.max(r1, r2))
      disadvResults.push(Math.min(r1, r2))
    })
  }

  it('advantage mean is greater than disadvantage mean', () => {
    const advMean = advResults.reduce((a, b) => a + b, 0) / N
    const disadvMean = disadvResults.reduce((a, b) => a + b, 0) / N
    expect(advMean).toBeGreaterThan(disadvMean)
  })
})

// ============================================================
// Seeded RNG across multiple roll types — reproducibility
// ============================================================

describe('seeded RNG reproducibility — same seed = same roll sequence', () => {
  it('roll1d10 gives identical sequence on re-run with same seed', () => {
    const run1: number[] = []
    const run2: number[] = []
    withSeededRandom(123, () => {
      for (let i = 0; i < 50; i++) run1.push(roll1d10())
    })
    withSeededRandom(123, () => {
      for (let i = 0; i < 50; i++) run2.push(roll1d10())
    })
    expect(run1).toEqual(run2)
  })

  it('rollDamage gives identical sequence on re-run with same seed', () => {
    const run1: number[] = []
    const run2: number[] = []
    withSeededRandom(456, () => {
      for (let i = 0; i < 50; i++) run1.push(rollDamage([1, 8]))
    })
    withSeededRandom(456, () => {
      for (let i = 0; i < 50; i++) run2.push(rollDamage([1, 8]))
    })
    expect(run1).toEqual(run2)
  })

  it('rollCheck gives identical CheckResult sequence on re-run with same seed', () => {
    const run1: boolean[] = []
    const run2: boolean[] = []
    withSeededRandom(789, () => {
      for (let i = 0; i < 50; i++) run1.push(rollCheck(6, 8).success)
    })
    withSeededRandom(789, () => {
      for (let i = 0; i < 50; i++) run2.push(rollCheck(6, 8).success)
    })
    expect(run1).toEqual(run2)
  })

  it('consecutive seed values produce independent sequences', () => {
    const seq1: number[] = []
    const seq2: number[] = []
    withSeededRandom(1, () => { for (let i = 0; i < 20; i++) seq1.push(roll1d10()) })
    withSeededRandom(2, () => { for (let i = 0; i < 20; i++) seq2.push(roll1d10()) })
    // Independent sequences should differ in at least some positions
    const diffs = seq1.filter((v, i) => v !== seq2[i]).length
    expect(diffs).toBeGreaterThan(0)
  })
})
