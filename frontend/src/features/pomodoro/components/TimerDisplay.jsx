import { usePomodoroStore } from '../state/pomodoroStore.js'
import { formatTime } from '../utils/formatTime.js'
import { PHASE_LABELS } from '../constants/timer.js'
import { FocusDuration } from './FocusDuration.jsx'

/** Each glyph sits in a fixed 1ch slot (ch = width of "0") so the monumental
 *  serif number stays perfectly still while it ticks — true tabular behaviour
 *  without needing tabular figures in the font. */
function TimeSlots({ text }) {
  return text.split('').map((ch, i) =>
    ch === ':' ? (
      <span className="timer-glyph timer-glyph--colon" key={i}>
        {ch}
      </span>
    ) : (
      <span className="timer-glyph" key={i}>
        {ch}
      </span>
    ),
  )
}

export function TimerDisplay() {
  const phase = usePomodoroStore((s) => s.phase)
  const remainingMs = usePomodoroStore((s) => s.remainingMs)
  const status = usePomodoroStore((s) => s.status)
  const round = usePomodoroStore((s) => s.round)

  return (
    <div className="timer-display">
      <span className="timer-display__phase">{PHASE_LABELS[phase]}</span>
      <time className="timer-display__time" aria-label={formatTime(remainingMs)}>
        <TimeSlots text={formatTime(remainingMs)} />
      </time>
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
