import { Button } from '../../../components/ui/Button.jsx'
import { playSound } from '../../../utils/audio.js'
import { pomodoroStore } from '../state/pomodoroStore.js'
import { dialMinuteFor } from '../utils/timerMath.js'

// Only treat a dial change as a real "spin" when it moves more than a few
// degrees. Pause/resume freeze the dial exactly, so they won't qualify.
const SPIN_EPSILON_MIN = 0.05

// Applies an action and reports whether the 3D dial actually spun from its
// previous position to its new one (using the same dialMinuteFor logic the
// scene pulls from every frame).
function dialSpun(apply) {
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

export function TimerControls({ status, actions }) {
  const running = status === 'running'

  function handleTransport() {
    if (running) {
      // Pause freezes the dial in place: no spin, no sound.
      if (dialSpun(() => actions.pause())) playSound('gearClick')
    } else if (status === 'paused') {
      // Resume continues from the same spot: no spin, no sound.
      if (dialSpun(() => actions.start())) playSound('gearClick')
    } else {
      // Start: a fresh session doesn't move the dial, but the click confirms
      // the session is beginning.
      playSound('gearClick')
      actions.start()
    }
  }

  function handleReset() {
    playSound('resetSpring')
    actions.reset()
  }

  function handleSkip() {
    // Only sound off if the dial actually travels to the new phase's position.
    if (dialSpun(() => actions.skip())) playSound('resetSpring')
  }

  return (
    <div className="timer-controls">
      <Button variant="ghost" onClick={handleReset} disabled={status === 'idle'}>
        Reset
      </Button>
      <Button variant="primary" size="lg" onClick={handleTransport}>
        {running ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'}
      </Button>
      <Button variant="ghost" onClick={handleSkip}>
        Skip
      </Button>
    </div>
  )
}
