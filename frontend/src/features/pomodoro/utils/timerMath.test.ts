import { describe, it, expect } from 'vitest'
import { DEFAULT_SETTINGS } from '../constants/timer.js'
import { durationFor, dialMinuteFor } from './timerMath.js'

describe('durationFor', () => {
  it('uses focus minutes by default', () => {
    expect(durationFor('focus', DEFAULT_SETTINGS)).toBe(25 * 60_000)
  })

  it('uses short break minutes', () => {
    expect(durationFor('shortBreak', DEFAULT_SETTINGS)).toBe(5 * 60_000)
  })

  it('uses long break minutes', () => {
    expect(durationFor('longBreak', DEFAULT_SETTINGS)).toBe(15 * 60_000)
  })

  it('respects custom settings', () => {
    const settings = { ...DEFAULT_SETTINGS, focusMinutes: 40, shortBreakMinutes: 7, longBreakMinutes: 20 }
    expect(durationFor('focus', settings)).toBe(40 * 60_000)
    expect(durationFor('shortBreak', settings)).toBe(7 * 60_000)
    expect(durationFor('longBreak', settings)).toBe(20 * 60_000)
  })
})

describe('dialMinuteFor', () => {
  it('returns focusMinutes when idle', () => {
    expect(dialMinuteFor('idle', 0, 25)).toBe(25)
  })

  it('returns remaining minutes when running', () => {
    expect(dialMinuteFor('running', 15 * 60_000, 25)).toBe(15)
  })

  it('returns fractional remaining minutes (smooth sweep)', () => {
    expect(dialMinuteFor('running', 12.5 * 60_000, 25)).toBeCloseTo(12.5)
  })

  it('returns remaining minutes when paused', () => {
    expect(dialMinuteFor('paused', 3 * 60_000, 25)).toBe(3)
  })

  it('returns remaining minutes when finished', () => {
    expect(dialMinuteFor('finished', 0, 25)).toBe(0)
  })
})
