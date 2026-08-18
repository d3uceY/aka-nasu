import { Button } from '../../../components/ui/Button.jsx'
import { playSound } from '../../../utils/audio.js'
import { dialSpun } from '../utils/dialSpun.js'
import { pomodoroActions } from '../state/pomodoroStore.js'
import type { TimerStatus } from '../types.js'

export interface TimerControlsProps {
  status: TimerStatus
}

export function TimerControls({ status }: TimerControlsProps) {
  const running = status === 'running'

  function handleTransport() {
    if (running) {
      // Pause freezes the dial: no spin, no sound.
      if (dialSpun(() => pomodoroActions.pause())) playSound('gearClick')
    } else if (status === 'paused') {
      // Resume continues from the same spot: no spin, no sound.
      if (dialSpun(() => pomodoroActions.start())) playSound('gearClick')
    } else {
      // Start: only sound off if the dial travels to the running position.
      if (dialSpun(() => pomodoroActions.start())) playSound('gearClick')
    }
  }

  function handleReset() {
    playSound('resetSpring')
    pomodoroActions.reset()
  }

  function handleSkip() {
    // Only sound off if the dial actually travels to the new phase's position.
    if (dialSpun(() => pomodoroActions.skip())) playSound('resetSpring')
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
