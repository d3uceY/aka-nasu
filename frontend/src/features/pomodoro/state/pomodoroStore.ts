import { createStore, useStore } from '../../../lib/createStore.js'
import { DEFAULT_SETTINGS, PHASES } from '../constants/timer.js'
import { DEFAULT_PALETTE_ID, isPaletteId } from '../constants/palettes.js'
import { durationFor } from '../utils/timerMath.js'
import { saveSettings, saveTimer, saveStats } from '../../../lib/backend.js'
import type {
  PersistedPomodoroState,
  Phase,
  PomodoroSettings,
  PomodoroState,
  TimerStatus,
} from '../types.js'

function initialState(): PomodoroState {
  return {
    phase: PHASES.FOCUS,
    status: 'idle', // idle | running | paused | finished
    remainingMs: durationFor(PHASES.FOCUS, DEFAULT_SETTINGS),
    totalMs: durationFor(PHASES.FOCUS, DEFAULT_SETTINGS),
    // Absolute wall-clock deadline; countdown reads Date.now() so background
    // timer throttling can't slow the timer. Null unless running.
    endAt: null,
    settings: { ...DEFAULT_SETTINGS },
    sessionsCompleted: 0,
    round: 1,
    lastCompletedAt: null,
  }
}

const base = createStore<PomodoroState>(initialState)

// A running timer ticks every 250ms; throttle config writes to ~1/sec.
let lastTimerSave = 0
const TIMER_SAVE_MS = 1000

// Coalesce rapid settings writes (sliders + dial) into one flush.
let settingsSaveTimer: number | undefined
const SETTINGS_SAVE_MS = 250

function persistTimer(immediate = false): void {
  const now = Date.now()
  if (!immediate && now - lastTimerSave < TIMER_SAVE_MS) return
  lastTimerSave = now
  const { phase, status, remainingMs, totalMs } = base.getState()
  saveTimer({ phase, status, remainingMs, totalMs }).catch(() => {})
}

// Trailing debounce; reads latest state so a pending flush never writes stale values.
function scheduleSettingsSave(): void {
  clearTimeout(settingsSaveTimer)
  settingsSaveTimer = setTimeout(() => {
    const { settings, phase, status, remainingMs, totalMs } = base.getState()
    saveSettings(settings).catch(() => {})
    saveTimer({ phase, status, remainingMs, totalMs }).catch(() => {})
  }, SETTINGS_SAVE_MS)
}

export const pomodoroStore = {
  ...base,
  load({ settings, timer, stats }: PersistedPomodoroState): void {
    const mergedSettings: PomodoroSettings = { ...DEFAULT_SETTINGS, ...settings }
    // A persisted palette may be empty (older configs / browser defaults) or
    // point at a removed palette — always fall back to a known id.
    mergedSettings.palette = isPaletteId(mergedSettings.palette)
      ? mergedSettings.palette
      : DEFAULT_PALETTE_ID
    const phase: Phase =
      timer?.phase === PHASES.FOCUS ||
      timer?.phase === PHASES.SHORT_BREAK ||
      timer?.phase === PHASES.LONG_BREAK
        ? timer.phase
        : PHASES.FOCUS
    const totalMs = timer?.totalMs && timer.totalMs > 0 ? timer.totalMs : durationFor(phase, mergedSettings)
    const remainingMs = Math.max(0, Math.min(timer?.remainingMs ?? totalMs, totalMs))
    // A finished phase can't be resumed; anything else is restored.
    const status: TimerStatus =
      timer?.status === 'running' || timer?.status === 'paused' ? timer.status : 'idle'
    base.set({
      settings: mergedSettings,
      phase,
      status,
      remainingMs,
      totalMs,
      // Restored runs get a fresh wall-clock deadline (the absolute one isn't persisted).
      endAt: status === 'running' ? Date.now() + remainingMs : null,
      sessionsCompleted: stats?.sessionsCompleted ?? 0,
      round: stats?.round ?? 1,
      lastCompletedAt: stats?.lastCompletedAt ?? null,
    })
  },
}

export function usePomodoroStore<T>(selector: (state: PomodoroState) => T): T {
  return useStore(pomodoroStore, selector)
}

export const pomodoroActions = {
  start(): void {
    const state = base.getState()
    if (state.status === 'running') return
    if (state.remainingMs <= 0) {
      const totalMs = durationFor(state.phase, state.settings)
      base.set({ remainingMs: totalMs, totalMs, status: 'running', endAt: Date.now() + totalMs })
      persistTimer(true)
      return
    }
    // Resume counts down from the current remaining time with a fresh deadline.
    base.set({ status: 'running', endAt: Date.now() + state.remainingMs })
    persistTimer(true)
  },

  pause(): void {
    const state = base.getState()
    if (state.status !== 'running' || state.endAt == null) return
    // Snapshot true remaining time so pausing is correct even if ticks were throttled.
    const remainingMs = Math.max(0, state.endAt - Date.now())
    base.set({ status: 'paused', remainingMs, endAt: null })
    persistTimer(true)
  },

  reset(): void {
    const state = base.getState()
    const totalMs = durationFor(state.phase, state.settings)
    base.set({ status: 'idle', remainingMs: totalMs, totalMs, endAt: null })
    persistTimer(true)
  },

  skip(): void {
    const state = base.getState()
    const nextPhase: Phase = state.phase === PHASES.FOCUS ? PHASES.SHORT_BREAK : PHASES.FOCUS
    const totalMs = durationFor(nextPhase, state.settings)
    base.set({ phase: nextPhase, remainingMs: totalMs, totalMs, status: 'idle', endAt: null })
    persistTimer(true)
  },

  setPhase(phase: Phase): void {
    const state = base.getState()
    const totalMs = durationFor(phase, state.settings)
    base.set({ phase, remainingMs: totalMs, totalMs, status: 'idle', endAt: null })
    persistTimer(true)
  },

  setSettings(patch: Partial<PomodoroSettings>): void {
    const state = base.getState()
    const settings = { ...state.settings, ...patch }
    // Only a duration change needs to reset the countdown; visual/behavior
    // settings (palette, sound) must not disturb a running timer.
    const durationChanged =
      settings.focusMinutes !== state.settings.focusMinutes ||
      settings.shortBreakMinutes !== state.settings.shortBreakMinutes ||
      settings.longBreakMinutes !== state.settings.longBreakMinutes ||
      settings.longBreakInterval !== state.settings.longBreakInterval
    if (durationChanged) {
      const totalMs = durationFor(state.phase, settings)
      base.set({ settings, remainingMs: totalMs, totalMs, status: 'idle', endAt: null })
    } else {
      base.set({ settings })
    }
    scheduleSettingsSave()
  },

  tick(): void {
    // Wall-clock countdown: WebView2 throttles setInterval in the background,
    // so remaining is derived from the absolute deadline.
    const state = base.getState()
    if (state.status !== 'running' || state.endAt == null) return
    const remainingMs = Math.max(0, state.endAt - Date.now())
    base.set(
      remainingMs <= 0
        ? { remainingMs: 0, status: 'finished', endAt: null }
        : { remainingMs },
    )
    persistTimer()
  },

  completePhase(): void {
    const { phase, settings, sessionsCompleted, round } = base.getState()
    let nextPhase: Phase = PHASES.FOCUS
    let nextSessions = sessionsCompleted
    let nextRound = round

    if (phase === PHASES.FOCUS) {
      nextSessions = sessionsCompleted + 1
      nextRound = round + 1
      nextPhase =
        nextSessions % settings.longBreakInterval === 0 ? PHASES.LONG_BREAK : PHASES.SHORT_BREAK
    } else {
      nextPhase = PHASES.FOCUS
    }

    const totalMs = durationFor(nextPhase, settings)
    const autoStart =
      (nextPhase === PHASES.FOCUS && settings.autoStartFocus) ||
      (nextPhase !== PHASES.FOCUS && settings.autoStartBreaks)

    const completedAt = Date.now()
    base.set({
      phase: nextPhase,
      sessionsCompleted: nextSessions,
      round: nextRound,
      remainingMs: totalMs,
      totalMs,
      status: autoStart ? 'running' : 'idle',
      // An auto-started phase needs a fresh deadline; otherwise clear it.
      endAt: autoStart ? Date.now() + totalMs : null,
      lastCompletedAt: completedAt,
    })
    persistTimer(true)
    saveStats({
      sessionsCompleted: nextSessions,
      round: nextRound,
      lastCompletedAt: completedAt,
    }).catch(() => {})
  },
}
