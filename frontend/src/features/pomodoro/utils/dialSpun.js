import { pomodoroStore } from '../state/pomodoroStore.js'
import { dialMinuteFor } from './timerMath.js'

// Only treat a dial change as a real "spin" when it moves more than a few
// degrees. Pause/resume freeze the dial exactly, so they won't qualify.
const SPIN_EPSILON_MIN = 0.05

// Applies an action and reports whether the 3D dial actually spun from its
// previous position to its new one (using the same dialMinuteFor logic the
// scene pulls from every frame).
export function dialSpun(apply) {
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
