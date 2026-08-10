import { usePomodoroStore } from '../state/pomodoroStore.js'
import { formatTime } from '../utils/formatTime.js'
import { PHASE_LABELS } from '../constants/timer.js'

export function TimerDisplay() {
  const phase = usePomodoroStore((s) => s.phase)
  const remainingMs = usePomodoroStore((s) => s.remainingMs)
  const status = usePomodoroStore((s) => s.status)
  const round = usePomodoroStore((s) => s.round)

  return (
    <div className="timer-display">
      <span className={`timer-display__phase timer-display__phase--${phase}`}>
        {PHASE_LABELS[phase]}
      </span>
      <time className="timer-display__time">{formatTime(remainingMs)}</time>
      <span className="timer-display__round">Round {round}</span>
      <span className="timer-display__status">{status}</span>
    </div>
  )
}
