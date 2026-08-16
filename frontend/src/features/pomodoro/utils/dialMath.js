export const DEGREES_PER_MINUTE = 6

export function normalizeDegrees(deg) {
  return ((deg % 360) + 360) % 360
}

export function minutesToDegrees(minutes) {
  return minutes * DEGREES_PER_MINUTE
}

export function shortestAngleDeg(from, to) {
  return ((to - from + 540) % 360) - 180
}
