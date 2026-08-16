import { usePomodoroStore } from '../state/pomodoroStore.js'
import { formatTime } from '../utils/formatTime.js'
import { PHASE_LABELS, PHASES } from '../constants/timer.js'
import { FocusDuration } from './FocusDuration.jsx'

/** The caption under the number never unmounts. It swaps copy in place per
 *  state (nowrap + centred in CSS), so the controls below never jump when
 *  text shows up or disappears on start / pause / skip. Each copy is kept
 *  short enough to always sit on a single line. */
const STATUS_HINTS = {
  [PHASES.FOCUS]: {
    idle: 'spin the tomato to set your focus',
    running: 'in session, keep the flow',
    paused: 'paused, take a breath',
    finished: 'session complete',
  },
  [PHASES.SHORT_BREAK]: {
    idle: 'the tomato is resting',
    running: 'in session, enjoy the rest',
    paused: 'paused, take a breath',
    finished: 'break complete',
  },
  [PHASES.LONG_BREAK]: {
    idle: 'the tomato is resting',
    running: 'in session, enjoy the rest',
    paused: 'paused, take a breath',
    finished: 'break complete',
  },
}

/** Each glyph sits in a fixed 1ch slot (ch = width of "0") so the monumental
 *  serif number stays perfectly still while it ticks. True tabular behaviour
 *  without needing tabular figures in the font. Shared with the mini timer. */
export function TimeSlots({ text }) {
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
  const hint = STATUS_HINTS[phase]?.[status] ?? STATUS_HINTS[phase]?.idle

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
      <p key={hint} className="timer-display__hint" aria-live="polite">
        {hint}
      </p>
    </div>
  )
}
