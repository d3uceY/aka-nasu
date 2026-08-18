import { describe, it, expect } from 'vitest'
import {
  DEFAULT_PALETTE_ID,
  TOMATO_PALETTES,
  getPalette,
  isPaletteId,
  hexColor,
} from './palettes.js'

describe('TOMATO_PALETTES', () => {
  it('offers exactly eight palettes with unique ids', () => {
    expect(TOMATO_PALETTES).toHaveLength(8)
    const ids = TOMATO_PALETTES.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('the default palette is a known id', () => {
    expect(isPaletteId(DEFAULT_PALETTE_ID)).toBe(true)
  })

  it('every palette distinguishes body, groove, and stem for contrast', () => {
    for (const p of TOMATO_PALETTES) {
      expect(p.body).not.toBe(p.groove)
      expect(p.body).not.toBe(p.seam)
      expect(p.body).not.toBe(p.stem)
      expect(p.accent).toBeTruthy()
      expect(p.accentDeep).toBeTruthy()
      expect(p.wash).toBeTruthy()
      expect(p.glow).toBeTruthy()
    }
  })

  it('every palette carries the UI accent tokens it claims', () => {
    for (const p of TOMATO_PALETTES) {
      expect(p.accent.startsWith('#')).toBe(true)
      expect(p.accentDeep.startsWith('#')).toBe(true)
      expect(p.wash.startsWith('#')).toBe(true)
      expect(p.glow.startsWith('rgba(')).toBe(true)
    }
  })
})

describe('getPalette / isPaletteId', () => {
  it('returns the requested palette by id', () => {
    expect(getPalette('grape').id).toBe('grape')
  })

  it('falls back to the default for an unknown id', () => {
    expect(getPalette('nope').id).toBe(DEFAULT_PALETTE_ID)
    expect(getPalette('').id).toBe(DEFAULT_PALETTE_ID)
  })
})

describe('hexColor', () => {
  it('formats a number as a lowercase hex string', () => {
    expect(hexColor(0xe8442e)).toBe('#e8442e')
    expect(hexColor(0xffffff)).toBe('#ffffff')
  })
})
