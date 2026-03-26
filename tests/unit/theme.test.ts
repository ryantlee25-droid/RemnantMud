import { describe, it, expect, vi, beforeEach } from 'vitest'
import { THEMES, THEME_KEY, loadTheme, saveTheme, getTheme } from '@/lib/theme'

describe('THEMES constant', () => {
  it('has exactly 3 themes', () => expect(THEMES).toHaveLength(3))

  it('contains amber, green, blue ids', () => {
    const ids = THEMES.map(t => t.id)
    expect(ids).toContain('amber')
    expect(ids).toContain('green')
    expect(ids).toContain('blue')
  })

  it('each theme has required fields', () => {
    for (const t of THEMES) {
      expect(t.id).toBeTruthy()
      expect(t.name).toBeTruthy()
      expect(t.tagline).toBeTruthy()
      expect(typeof t.filter).toBe('string')
      expect(t.sampleColor).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('amber theme has filter: none (no CSS transform)', () => {
    const amber = THEMES.find(t => t.id === 'amber')!
    expect(amber.filter).toBe('none')
  })

  it('green theme has hue-rotate filter', () => {
    const green = THEMES.find(t => t.id === 'green')!
    expect(green.filter).toContain('hue-rotate')
  })

  it('blue theme has hue-rotate filter', () => {
    const blue = THEMES.find(t => t.id === 'blue')!
    expect(blue.filter).toContain('hue-rotate')
  })
})

describe('getTheme', () => {
  it('returns amber theme for amber id', () => {
    const t = getTheme('amber')
    expect(t.id).toBe('amber')
  })

  it('returns green theme for green id', () => {
    expect(getTheme('green').id).toBe('green')
  })

  it('returns blue theme for blue id', () => {
    expect(getTheme('blue').id).toBe('blue')
  })
})

describe('loadTheme', () => {
  it('returns amber when localStorage is empty', () => {
    expect(loadTheme()).toBe('amber')
  })

  it('returns stored valid theme id', () => {
    localStorage.setItem(THEME_KEY, 'green')
    expect(loadTheme()).toBe('green')
  })

  it('returns amber for invalid stored value', () => {
    localStorage.setItem(THEME_KEY, 'purple')
    expect(loadTheme()).toBe('amber')
  })

  it('returns blue when blue is stored', () => {
    localStorage.setItem(THEME_KEY, 'blue')
    expect(loadTheme()).toBe('blue')
  })
})

describe('saveTheme', () => {
  it('writes theme id to localStorage', () => {
    saveTheme('green')
    expect(localStorage.getItem(THEME_KEY)).toBe('green')
  })

  it('overwrites previous value', () => {
    saveTheme('green')
    saveTheme('blue')
    expect(localStorage.getItem(THEME_KEY)).toBe('blue')
  })

  it('round-trips with loadTheme', () => {
    saveTheme('blue')
    expect(loadTheme()).toBe('blue')
  })
})
