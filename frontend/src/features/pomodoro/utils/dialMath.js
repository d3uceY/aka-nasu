export const DEGREES_PER_MINUTE = 6

export function normalizeDegrees(deg) {
  return ((deg % 360) + 360) % 360
}

export function minutesToDegrees(minutes) {
  return minutes * DEGREES_PER_MINUTE
}

export function degreesToMinutes(deg) {
  return normalizeDegrees(deg) / DEGREES_PER_MINUTE
}

export function minutesToRadians(minutes) {
  return (minutes * DEGREES_PER_MINUTE * Math.PI) / 180
}

export function radiansToDegrees(rad) {
  return (rad * 180) / Math.PI
}

export function shortestAngleDeg(from, to) {
  return ((to - from + 540) % 360) - 180
}

export function clampMinutes(minutes, min = 0, max = 60) {
  return Math.min(max, Math.max(min, minutes))
}

export function snapToMinute(minutes) {
  return Math.round(minutes)
}
