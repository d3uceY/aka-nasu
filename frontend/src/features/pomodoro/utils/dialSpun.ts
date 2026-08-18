import { pomodoroStore } from '../state/pomodoroStore.js'
import { dialMinuteFor } from './timerMath.js'

// A "spin" requires more than a few minutes of travel (pause/resume freeze the dial).
const SPIN_EPSILON_MIN = 0.05

// Apply an action; report whether the dial actually moved (per dialMinuteFor).
export function dialSpun(apply: () => void): boolean {
  const before = pomodoroStore.getState()
  const beforeMinute = dialMinuteFor(
    before.status,
    before.remainingMs,
    before.settings.focusMinutes,
  )
  apply()
  const after = pomodoroStore.getState()
  const afterMinute = dialMinuteFor(
    after.status,
    after.remainingMs,
    after.settings.focusMinutes,
  )
  return Math.abs(afterMinute - beforeMinute) >= SPIN_EPSILON_MIN
}
