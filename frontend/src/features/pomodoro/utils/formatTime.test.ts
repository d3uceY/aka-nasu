import { describe, it, expect } from 'vitest'
import { pad, formatTime } from './formatTime.js'

describe('formatTime', () => {
  it('pads single digits', () => {
    expect(pad(0)).toBe('00')
    expect(pad(5)).toBe('05')
    expect(pad(12)).toBe('12')
  })

  it('formats zero as 00:00', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('rounds partial seconds up (ceil)', () => {
    expect(formatTime(1)).toBe('00:01')
    expect(formatTime(999)).toBe('00:01')
    expect(formatTime(1000)).toBe('00:01')
    expect(formatTime(1001)).toBe('00:02')
  })

  it('handles negative input as zero', () => {
    expect(formatTime(-500)).toBe('00:00')
  })

  it('formats minutes and seconds', () => {
    expect(formatTime(90_000)).toBe('01:30')
    expect(formatTime(25 * 60_000)).toBe('25:00')
  })

  it('formats over an hour without wrapping minutes', () => {
    expect(formatTime(61 * 60_000)).toBe('61:00')
  })
})
