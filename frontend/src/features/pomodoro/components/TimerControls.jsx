import { Button } from '../../../components/ui/Button.jsx'

export function TimerControls({ status, actions }) {
  const running = status === 'running'
  return (
    <div className="timer-controls">
      <Button variant="ghost" onClick={() => actions.reset()} disabled={status === 'idle'}>
        Reset
      </Button>
      <Button
        variant="primary"
        size="lg"
        onClick={() => (running ? actions.pause() : actions.start())}
      >
        {running ? 'Pause' : status === 'paused' ? 'Resume' : 'Start'}
      </Button>
      <Button variant="ghost" onClick={() => actions.skip()}>
        Skip
      </Button>
    </div>
  )
}
