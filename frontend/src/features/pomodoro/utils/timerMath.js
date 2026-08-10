import { PHASES } from '../constants/timer.js'

export function durationFor(phase, settings) {
  switch (phase) {
    case PHASES.SHORT_BREAK:
      return settings.shortBreakMinutes * 60_000
    case PHASES.LONG_BREAK:
      return settings.longBreakMinutes * 60_000
    default:
      return settings.focusMinutes * 60_000
  }
}

export function progress({ remainingMs, totalMs }) {
  if (!totalMs) return 0
  return Math.min(1, Math.max(0, remainingMs / totalMs))
}
