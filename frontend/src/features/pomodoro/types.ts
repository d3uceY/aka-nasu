// Pomodoro feature types; persisted shapes come from the Go bindings.
import type { Settings, Stats, TimerState } from '../../../bindings/aka-nasu/backend/config/models.js'

// soundEnabled is frontend-only (see utils/audio.ts); not in the Go model.
export interface PomodoroSettings extends Settings {
  soundEnabled: boolean
}

export type Phase = 'focus' | 'shortBreak' | 'longBreak'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished'

export interface PomodoroState {
  phase: Phase
  status: TimerStatus
  remainingMs: number
  totalMs: number
  // Wall-clock deadline for the running segment; null unless running.
  endAt: number | null
  settings: PomodoroSettings
  sessionsCompleted: number
  round: number
  lastCompletedAt: number | null
}

// Accepted by load(); partial so a partial config merges over defaults.
export interface PersistedPomodoroState {
  settings?: Partial<Settings>
  timer?: Partial<TimerState>
  stats?: Partial<Stats>
}

// The stable set of callbacks the 3D dial consumes (see useDialRotation).
export interface DialCallbacks {
  getDialMinute: () => number
  handleDialChange?: (minutes: number) => void
  getInteractionEnabled: () => boolean
}

// Actions returned by usePomodoro and passed to the controls.
export interface PomodoroActions {
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  setPhase: (phase: Phase) => void
  setSettings: (patch: Partial<PomodoroSettings>) => void
}

// Full store actions, incl. the internals components never call.
export interface StorePomodoroActions extends PomodoroActions {
  tick: () => void
  completePhase: () => void
}
