import { useSyncExternalStore } from 'react'
import { DEFAULT_SETTINGS, PHASES } from '../constants/timer.js'
import { durationFor } from '../utils/timerMath.js'
import { saveSettings, saveTimer, saveStats } from '../../../lib/backend.js'

function initialState() {
  return {
    phase: PHASES.FOCUS,
    status: 'idle', // idle | running | paused | finished
    remainingMs: durationFor(PHASES.FOCUS, DEFAULT_SETTINGS),
    totalMs: durationFor(PHASES.FOCUS, DEFAULT_SETTINGS),
    // Absolute wall-clock deadline for the current running segment. The
    // countdown reads this (via Date.now()) instead of decrementing a fixed
    // amount per tick, so webview timer throttling in the background can't
    // make the timer run slow. Null unless status === 'running'.
    endAt: null,
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
    // A finished phase can't be resumed; anything else (incl. running)
    // is restored so the timer picks up where it left off.
    const status = timer?.status === 'finished' ? 'idle' : timer?.status || 'idle'
    set({
      settings: mergedSettings,
      phase,
      status,
      remainingMs,
      totalMs,
      // A restored run counts down from the persisted remaining time with a
      // fresh wall-clock deadline (we don't persist the absolute deadline).
      endAt: status === 'running' ? Date.now() + remainingMs : null,
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
      set({ remainingMs: totalMs, totalMs, status: 'running', endAt: Date.now() + totalMs })
      persistTimer(true)
      return
    }
    // Resume counts down from the current remaining time with a fresh deadline.
    set({ status: 'running', endAt: Date.now() + state.remainingMs })
    persistTimer(true)
  },

  pause() {
    if (state.status !== 'running' || state.endAt == null) return
    // Snapshot the true remaining time; this is what makes pausing correct even
    // if ticks were throttled while the app was backgrounded.
    const remainingMs = Math.max(0, state.endAt - Date.now())
    set({ status: 'paused', remainingMs, endAt: null })
    persistTimer(true)
  },

  reset() {
    const totalMs = durationFor(state.phase, state.settings)
    set({ status: 'idle', remainingMs: totalMs, totalMs, endAt: null })
    persistTimer(true)
  },

  skip() {
    const nextPhase = state.phase === PHASES.FOCUS ? PHASES.SHORT_BREAK : PHASES.FOCUS
    const totalMs = durationFor(nextPhase, state.settings)
    set({ phase: nextPhase, remainingMs: totalMs, totalMs, status: 'idle', endAt: null })
    persistTimer(true)
  },

  setPhase(phase) {
    const totalMs = durationFor(phase, state.settings)
    set({ phase, remainingMs: totalMs, totalMs, status: 'idle', endAt: null })
    persistTimer(true)
  },

  setSettings(patch) {
    const settings = { ...state.settings, ...patch }
    const totalMs = durationFor(state.phase, settings)
    set({ settings, remainingMs: totalMs, totalMs, status: 'idle', endAt: null })
    scheduleSettingsSave()
  },

  tick() {
    // Wall-clock countdown. WebView2 throttles setInterval when the window is
    // minimized or occluded, so decrementing a fixed amount per tick drifts
    // slow in the background. Computing remaining from the absolute deadline
    // keeps it accurate no matter how rarely a tick actually fires.
    if (state.status !== 'running' || state.endAt == null) return
    const remainingMs = Math.max(0, state.endAt - Date.now())
    set(
      remainingMs <= 0
        ? { remainingMs: 0, status: 'finished', endAt: null }
        : { remainingMs },
    )
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
      // An auto-started phase needs a fresh deadline; otherwise clear it.
      endAt: autoStart ? Date.now() + totalMs : null,
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
