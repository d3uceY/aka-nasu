import { usePomodoroStore } from '../state/pomodoroStore.js'
import { formatTime } from '../utils/formatTime.js'
import { PHASE_LABELS } from '../constants/timer.js'
import { FocusDuration } from './FocusDuration.jsx'

export function TimerDisplay() {
  const phase = usePomodoroStore((s) => s.phase)
  const remainingMs = usePomodoroStore((s) => s.remainingMs)
  const status = usePomodoroStore((s) => s.status)
  const round = usePomodoroStore((s) => s.round)

  return (
    <div className="timer-display">
      <span className="timer-display__phase">{PHASE_LABELS[phase]}</span>
      <time className="timer-display__time">{formatTime(remainingMs)}</time>
      <div className="timer-display__meta">
        <span className="timer-display__round">Round {round}</span>
        <span className="dot" aria-hidden="true" />
        <FocusDuration />
      </div>
      {status === 'idle' && (
        <p className="timer-display__hint">spin the tomato to set your focus</p>
      )}
    </div>
  )
}
