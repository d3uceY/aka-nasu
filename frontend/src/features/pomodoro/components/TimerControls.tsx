import { Button } from '../../../components/ui/Button.jsx'
import { playSound } from '../../../utils/audio.js'
import { dialSpun } from '../utils/dialSpun.js'
import type { PomodoroActions, TimerStatus } from '../types.js'

export interface TimerControlsProps {
  status: TimerStatus
  actions: PomodoroActions
}

export function TimerControls({ status, actions }: TimerControlsProps) {
  const running = status === 'running'

  function handleTransport() {
    if (running) {
      // Pause freezes the dial: no spin, no sound.
      if (dialSpun(() => actions.pause())) playSound('gearClick')
    } else if (status === 'paused') {
      // Resume continues from the same spot: no spin, no sound.
      if (dialSpun(() => actions.start())) playSound('gearClick')
    } else {
      // Start: only sound off if the dial travels to the running position.
      if (dialSpun(() => actions.start())) playSound('gearClick')
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
