import type { Phase, PomodoroSettings } from '../types.js'

export const PHASES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
} as const

export const PHASE_LABELS: Record<Phase, string> = {
  [PHASES.FOCUS]: 'Focus',
  [PHASES.SHORT_BREAK]: 'Short break',
  [PHASES.LONG_BREAK]: 'Long break',
}

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4, // long break every N completed focus sessions
  autoStartBreaks: true,
  autoStartFocus: false,
  soundEnabled: true,
}

export const TIMER = {
  minFocusMinutes: 1,
  maxFocusMinutes: 60,
  tickMs: 250,
} as const
