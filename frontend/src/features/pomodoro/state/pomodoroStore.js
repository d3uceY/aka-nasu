import { useSyncExternalStore } from 'react'
import { DEFAULT_SETTINGS, PHASES, TIMER } from '../constants/timer.js'
import { durationFor } from '../utils/timerMath.js'
import { saveSettings, saveTimer, saveStats } from '../../../lib/backend.js'

function initialState() {
  return {
    phase: PHASES.FOCUS,
    status: 'idle', // idle | running | paused | finished
    remainingMs: durationFor(PHASES.FOCUS, DEFAULT_SETTINGS),
    totalMs: durationFor(PHASES.FOCUS, DEFAULT_SETTINGS),
    settings: { ...DEFAULT_SETTINGS },
    sessionsCompleted: 0,
    round: 1,
    lastCompletedAt: null,
  }
}

let state = initialState()
const listeners = new Set()

// A running timer ticks every 250ms; throttle config writes to ~1/sec.
let lastTimerSave = 0
const TIMER_SAVE_MS = 1000

// Settings writes (sliders + dial) fire continuously while dragging; coalesce
// them into one flush shortly after the last change.
let settingsSaveTimer = null
const SETTINGS_SAVE_MS = 250

function set(next) {
  state = { ...state, ...next }
  emit()
}

function emit() {
  for (const listener of listeners) listener()
}

function persistTimer(immediate = false) {
  const now = Date.now()
  if (!immediate && now - lastTimerSave < TIMER_SAVE_MS) return
  lastTimerSave = now
  const { phase, status, remainingMs, totalMs } = state
  saveTimer({ phase, status, remainingMs, totalMs }).catch(() => {})
}

// Trailing debounce for settings + idle-timer writes. Reads the latest state
// when it fires, so a pending flush never writes stale values.
function scheduleSettingsSave() {
  clearTimeout(settingsSaveTimer)
  settingsSaveTimer = setTimeout(() => {
    const { settings, phase, status, remainingMs, totalMs } = state
    saveSettings(settings).catch(() => {})
    saveTimer({ phase, status, remainingMs, totalMs }).catch(() => {})
    // ponytail: a setting changed <250ms before quitting can be lost; flush
    // on app-close instead if that ever matters.
  }, SETTINGS_SAVE_MS)
}

export const pomodoroStore = {
  getState: () => state,
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  set,
  reset() {
    state = initialState()
    emit()
  },
  load({ settings, timer, stats }) {
    const mergedSettings = { ...DEFAULT_SETTINGS, ...settings }
    const phase = PHASES[timer?.phase] ? timer.phase : PHASES.FOCUS
    const totalMs = timer?.totalMs > 0 ? timer.totalMs : durationFor(phase, mergedSettings)
    const remainingMs = Math.max(0, Math.min(timer?.remainingMs ?? totalMs, totalMs))
    set({
      settings: mergedSettings,
      phase,
      // A finished phase can't be resumed; anything else (incl. running)
      // is restored so the timer picks up where it left off.
      status: timer?.status === 'finished' ? 'idle' : timer?.status || 'idle',
      remainingMs,
      totalMs,
      sessionsCompleted: stats?.sessionsCompleted ?? 0,
      round: stats?.round ?? 1,
      lastCompletedAt: stats?.lastCompletedAt ?? null,
    })
  },
}

export function usePomodoroStore(selector) {
  return useSyncExternalStore(pomodoroStore.subscribe, () => selector(pomodoroStore.getState()))
}

export const pomodoroActions = {
  start() {
    if (state.status === 'running') return
    if (state.remainingMs <= 0) {
      const totalMs = durationFor(state.phase, state.settings)
      set({ remainingMs: totalMs, totalMs, status: 'running' })
      persistTimer(true)
      return
    }
    set({ status: 'running' })
    persistTimer(true)
  },

  pause() {
    set({ status: 'paused' })
    persistTimer(true)
  },

  reset() {
    const totalMs = durationFor(state.phase, state.settings)
    set({ status: 'idle', remainingMs: totalMs, totalMs })
    persistTimer(true)
  },

  skip() {
    const nextPhase = state.phase === PHASES.FOCUS ? PHASES.SHORT_BREAK : PHASES.FOCUS
    const totalMs = durationFor(nextPhase, state.settings)
    set({ phase: nextPhase, remainingMs: totalMs, totalMs, status: 'idle' })
    persistTimer(true)
  },

  setPhase(phase) {
    const totalMs = durationFor(phase, state.settings)
    set({ phase, remainingMs: totalMs, totalMs, status: 'idle' })
    persistTimer(true)
  },

  setSettings(patch) {
    const settings = { ...state.settings, ...patch }
    const totalMs = durationFor(state.phase, settings)
    set({ settings, remainingMs: totalMs, totalMs, status: 'idle' })
    scheduleSettingsSave()
  },

  tick() {
    if (state.status !== 'running') return
    const remainingMs = Math.max(0, state.remainingMs - TIMER.tickMs)
    set(remainingMs <= 0 ? { remainingMs: 0, status: 'finished' } : { remainingMs })
    persistTimer()
  },

  completePhase() {
    const { phase, settings, sessionsCompleted, round } = state
    let nextPhase
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

    set({
      phase: nextPhase,
      sessionsCompleted: nextSessions,
      round: nextRound,
      remainingMs: totalMs,
      totalMs,
      status: autoStart ? 'running' : 'idle',
      lastCompletedAt: Date.now(),
    })
    persistTimer(true)
    saveStats({
      sessionsCompleted: state.sessionsCompleted,
      round: state.round,
      lastCompletedAt: state.lastCompletedAt,
    }).catch(() => {})
  },
}
