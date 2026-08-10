export const PHASES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
}

export const PHASE_LABELS = {
  [PHASES.FOCUS]: 'Focus',
  [PHASES.SHORT_BREAK]: 'Short break',
  [PHASES.LONG_BREAK]: 'Long break',
}

export const DEFAULT_SETTINGS = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4, // long break every N completed focus sessions
  autoStartBreaks: true,
  autoStartFocus: false,
}

export const TIMER = {
  minFocusMinutes: 1,
  maxFocusMinutes: 60,
  tickMs: 250,
}
