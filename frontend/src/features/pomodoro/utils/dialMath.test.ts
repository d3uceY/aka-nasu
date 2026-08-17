import { describe, it, expect } from 'vitest'
import { DEGREES_PER_MINUTE, normalizeDegrees, minutesToDegrees, shortestAngleDeg } from './dialMath.js'

describe('dialMath', () => {
  it('exposes six degrees per minute', () => {
    expect(DEGREES_PER_MINUTE).toBe(6)
  })

  it('converts minutes to degrees', () => {
    expect(minutesToDegrees(0)).toBe(0)
    expect(minutesToDegrees(25)).toBe(150)
    expect(minutesToDegrees(60)).toBe(360)
  })

  it('normalizes degrees into [0, 360)', () => {
    expect(normalizeDegrees(0)).toBe(0)
    expect(normalizeDegrees(360)).toBe(0)
    expect(normalizeDegrees(-90)).toBe(270)
    expect(normalizeDegrees(450)).toBe(90)
    expect(normalizeDegrees(720)).toBe(0)
  })

  it('computes the shortest signed angle between two headings', () => {
    expect(shortestAngleDeg(0, 0)).toBe(0)
    expect(shortestAngleDeg(0, 90)).toBe(90)
    expect(shortestAngleDeg(0, 270)).toBe(-90)
    expect(shortestAngleDeg(350, 10)).toBe(20)
    expect(shortestAngleDeg(10, 350)).toBe(-20)
    expect(shortestAngleDeg(180, 180)).toBe(0)
  })
})
