export const DEGREES_PER_MINUTE = 6

export function normalizeDegrees(deg: number): number {
  return ((deg % 360) + 360) % 360
}

export function minutesToDegrees(minutes: number): number {
  return minutes * DEGREES_PER_MINUTE
}

export function shortestAngleDeg(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180
}
