// Pomodoro feature types. The feature owns its types here (modular, imported
// per-feature); the generated Go bindings are the source for the persisted
// model shapes, extended with frontend-only fields where needed.
import type { Settings, Stats, TimerState } from '../../../bindings/aka-nasu/backend/config/models.js'

// Frontend-only setting: `soundEnabled` lives in the frontend (see
// utils/audio.ts) and is NOT part of the Go Settings model, so it's added
// here on top of the persisted settings.
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
  // Absolute wall-clock deadline for the current running segment. Null unless
  // status === 'running'.
  endAt: number | null
  settings: PomodoroSettings
  sessionsCompleted: number
  round: number
  lastCompletedAt: number | null
}

// Shape accepted by pomodoroStore.load(); every field is optional so a partial
// persisted config (or the browser-preview shell) merges over defaults.
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

// The user-facing action set returned by usePomodoro and passed to controls.
export interface PomodoroActions {
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  setPhase: (phase: Phase) => void
  setSettings: (patch: Partial<PomodoroSettings>) => void
}

// The full store action set, adding the internals components never call.
export interface StorePomodoroActions extends PomodoroActions {
  tick: () => void
  completePhase: () => void
}
