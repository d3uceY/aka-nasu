import { useSyncExternalStore } from 'react'
import { DEFAULT_SETTINGS, PHASES, TIMER } from '../constants/timer.js'
import { durationFor } from '../utils/timerMath.js'

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

function set(next) {
  state = { ...state, ...next }
  emit()
}

function emit() {
  for (const listener of listeners) listener()
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
      return
    }
    set({ status: 'running' })
  },

  pause() {
    set({ status: 'paused' })
  },

  reset() {
    const totalMs = durationFor(state.phase, state.settings)
    set({ status: 'idle', remainingMs: totalMs, totalMs })
  },

  skip() {
    const nextPhase = state.phase === PHASES.FOCUS ? PHASES.SHORT_BREAK : PHASES.FOCUS
    const totalMs = durationFor(nextPhase, state.settings)
    set({ phase: nextPhase, remainingMs: totalMs, totalMs, status: 'idle' })
  },

  setPhase(phase) {
    const totalMs = durationFor(phase, state.settings)
    set({ phase, remainingMs: totalMs, totalMs, status: 'idle' })
  },

  setSettings(patch) {
    const settings = { ...state.settings, ...patch }
    const totalMs = durationFor(state.phase, settings)
    set({ settings, remainingMs: totalMs, totalMs, status: 'idle' })
  },

  tick() {
    if (state.status !== 'running') return
    const remainingMs = Math.max(0, state.remainingMs - TIMER.tickMs)
    set(remainingMs <= 0 ? { remainingMs: 0, status: 'finished' } : { remainingMs })
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
  },
}
