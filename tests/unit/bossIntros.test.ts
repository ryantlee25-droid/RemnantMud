import { describe, it, expect } from 'vitest'
import { ENEMIES } from '@/data/enemies'

const REQUIRED_BOSS_IDS = [
  'elder_sanguine',
  'elder_sanguine_deep',
  'hive_mother_the_deep',
  'meridian_automated_turret',
  'meridian_ancient_hollow',
  'frenzy',
  'drifter_road_warden',
  'lucid_thrall',
]

describe('Boss Intros — H12', () => {
  it('all required boss IDs exist in ENEMIES', () => {
    for (const id of REQUIRED_BOSS_IDS) {
      expect(ENEMIES[id], `ENEMIES["${id}"] should exist`).toBeDefined()
    }
  })

  it('all required bosses have a non-empty bossIntro', () => {
    for (const id of REQUIRED_BOSS_IDS) {
      const enemy = ENEMIES[id]
      expect(enemy.bossIntro, `${id} should have bossIntro`).toBeDefined()
      expect(enemy.bossIntro!.trim().length, `${id} bossIntro should not be empty`).toBeGreaterThan(0)
    }
  })

  it('all required bosses have a non-empty combatIntro', () => {
    for (const id of REQUIRED_BOSS_IDS) {
      const enemy = ENEMIES[id]
      expect(enemy.combatIntro, `${id} should have combatIntro`).toBeDefined()
      expect(enemy.combatIntro!.trim().length, `${id} combatIntro should not be empty`).toBeGreaterThan(0)
    }
  })

  it('bossIntro is 3–6 lines (newline-separated segments)', () => {
    for (const id of REQUIRED_BOSS_IDS) {
      const intro = ENEMIES[id].bossIntro!
      const lines = intro.split('\n').filter((l) => l.trim().length > 0)
      expect(lines.length, `${id} bossIntro should have 3–6 lines, got ${lines.length}`).toBeGreaterThanOrEqual(3)
      expect(lines.length, `${id} bossIntro should have 3–6 lines, got ${lines.length}`).toBeLessThanOrEqual(6)
    }
  })

  it('combatIntro is a single sentence (no internal newlines)', () => {
    for (const id of REQUIRED_BOSS_IDS) {
      const intro = ENEMIES[id].combatIntro!
      expect(intro.includes('\n'), `${id} combatIntro should be a single sentence`).toBe(false)
    }
  })
})
