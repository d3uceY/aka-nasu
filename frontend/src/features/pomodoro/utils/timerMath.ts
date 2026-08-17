import { PHASES } from '../constants/timer.js'
import type { Phase, PomodoroSettings, TimerStatus } from '../types.js'

export function durationFor(phase: Phase, settings: PomodoroSettings): number {
  switch (phase) {
    case PHASES.SHORT_BREAK:
      return settings.shortBreakMinutes * 60_000
    case PHASES.LONG_BREAK:
      return settings.longBreakMinutes * 60_000
    default:
      return settings.focusMinutes * 60_000
  }
}

// The minute the 3D dial points at for a given store snapshot. Mirrors the
// dial's own logic (see useDialRotation.getDialMinute): running / paused /
// finished show the remaining time (fractional minutes give the smooth
// sweep); idle rests at the selected focus length.
export function dialMinuteFor(status: TimerStatus, remainingMs: number, focusMinutes: number): number {
  if (status === 'running' || status === 'paused' || status === 'finished') {
    return remainingMs / 60000
  }
  return focusMinutes
}
