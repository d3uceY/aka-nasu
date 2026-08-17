import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { pomodoroStore, pomodoroActions } from './pomodoroStore.js'
import { saveSettings, saveTimer, saveStats } from '../../../lib/backend.js'
import { DEFAULT_SETTINGS, PHASES } from '../constants/timer.js'

vi.mock('../../../lib/backend.js', () => ({
  saveSettings: vi.fn(() => Promise.resolve()),
  saveTimer: vi.fn(() => Promise.resolve()),
  saveStats: vi.fn(() => Promise.resolve()),
}))

const T0 = new Date('2026-01-01T00:00:00.000Z').getTime()
const FOCUS_MS = DEFAULT_SETTINGS.focusMinutes * 60_000

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(T0)
  pomodoroStore.reset()
  vi.mocked(saveSettings).mockClear()
  vi.mocked(saveTimer).mockClear()
  vi.mocked(saveStats).mockClear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('initial state', () => {
  it('starts idle on focus with a full duration', () => {
    const s = pomodoroStore.getState()
    expect(s.phase).toBe(PHASES.FOCUS)
    expect(s.status).toBe('idle')
    expect(s.remainingMs).toBe(FOCUS_MS)
    expect(s.totalMs).toBe(FOCUS_MS)
    expect(s.endAt).toBeNull()
    expect(s.settings.soundEnabled).toBe(true)
    expect(s.sessionsCompleted).toBe(0)
    expect(s.round).toBe(1)
  })
})

describe('start / pause / reset', () => {
  it('start transitions idle → running and arms a wall-clock deadline', () => {
    pomodoroActions.start()
    const s = pomodoroStore.getState()
    expect(s.status).toBe('running')
    expect(s.endAt).toBe(T0 + FOCUS_MS)
    expect(s.remainingMs).toBe(FOCUS_MS)
    expect(saveTimer).toHaveBeenCalled()
  })

  it('start is a no-op while already running', () => {
    pomodoroActions.start()
    vi.mocked(saveTimer).mockClear()
    pomodoroActions.start()
    expect(saveTimer).not.toHaveBeenCalled()
  })

  it('start after finish resets to a fresh running session', () => {
    pomodoroStore.set({ status: 'finished', remainingMs: 0, endAt: null })
    pomodoroActions.start()
    const s = pomodoroStore.getState()
    expect(s.status).toBe('running')
    expect(s.remainingMs).toBe(FOCUS_MS)
    expect(s.endAt).toBe(T0 + FOCUS_MS)
  })

  it('pause snapshots the true remaining time from the deadline', () => {
    pomodoroActions.start()
    vi.setSystemTime(T0 + 30_000)
    pomodoroActions.pause()
    const s = pomodoroStore.getState()
    expect(s.status).toBe('paused')
    expect(s.remainingMs).toBe(FOCUS_MS - 30_000)
    expect(s.endAt).toBeNull()
  })

  it('pause is a no-op when not running', () => {
    pomodoroActions.pause()
    expect(pomodoroStore.getState().status).toBe('idle')
  })

  it('reset returns to idle with a full duration', () => {
    pomodoroActions.start()
    vi.setSystemTime(T0 + 60_000)
    pomodoroActions.reset()
    const s = pomodoroStore.getState()
    expect(s.status).toBe('idle')
    expect(s.remainingMs).toBe(FOCUS_MS)
    expect(s.endAt).toBeNull()
  })
})

describe('phase transitions', () => {
  it('skip toggles between focus and short break', () => {
    pomodoroActions.skip()
    expect(pomodoroStore.getState().phase).toBe(PHASES.SHORT_BREAK)
    pomodoroActions.skip()
    expect(pomodoroStore.getState().phase).toBe(PHASES.FOCUS)
  })

  it('setPhase switches phase and resets to idle', () => {
    pomodoroActions.setPhase(PHASES.LONG_BREAK)
    const s = pomodoroStore.getState()
    expect(s.phase).toBe(PHASES.LONG_BREAK)
    expect(s.status).toBe('idle')
    expect(s.remainingMs).toBe(DEFAULT_SETTINGS.longBreakMinutes * 60_000)
  })
})

describe('tick (wall-clock countdown)', () => {
  it('counts down from the deadline', () => {
    pomodoroActions.start()
    vi.setSystemTime(T0 + 5_000)
    pomodoroActions.tick()
    expect(pomodoroStore.getState().remainingMs).toBe(FOCUS_MS - 5_000)
  })

  it('finishes when the deadline passes', () => {
    pomodoroActions.start()
    vi.setSystemTime(T0 + FOCUS_MS + 1)
    pomodoroActions.tick()
    const s = pomodoroStore.getState()
    expect(s.status).toBe('finished')
    expect(s.remainingMs).toBe(0)
    expect(s.endAt).toBeNull()
  })

  it('ignores ticks while not running', () => {
    pomodoroActions.tick()
    expect(pomodoroStore.getState().remainingMs).toBe(FOCUS_MS)
  })
})

describe('setSettings', () => {
  it('merges a patch and resets to idle with the new duration', () => {
    pomodoroActions.setSettings({ focusMinutes: 30 })
    const s = pomodoroStore.getState()
    expect(s.settings.focusMinutes).toBe(30)
    expect(s.status).toBe('idle')
    expect(s.remainingMs).toBe(30 * 60_000)
    expect(s.totalMs).toBe(30 * 60_000)
  })

  it('debounces the settings flush (trailing)', () => {
    pomodoroActions.setSettings({ focusMinutes: 30 })
    pomodoroActions.setSettings({ shortBreakMinutes: 8 })
    expect(saveSettings).not.toHaveBeenCalled()
    vi.advanceTimersByTime(250)
    expect(saveSettings).toHaveBeenCalledTimes(1)
    expect(saveSettings).toHaveBeenCalledWith(expect.objectContaining({ focusMinutes: 30, shortBreakMinutes: 8 }))
    expect(saveTimer).toHaveBeenCalledTimes(1)
  })
})

describe('completePhase', () => {
  it('completes a focus session and advances to a break', () => {
    pomodoroActions.completePhase()
    const s = pomodoroStore.getState()
    expect(s.sessionsCompleted).toBe(1)
    expect(s.round).toBe(2)
    expect(s.phase).toBe(PHASES.SHORT_BREAK)
    expect(s.lastCompletedAt).toBe(T0)
    // autoStartBreaks is on by default.
    expect(s.status).toBe('running')
    expect(s.endAt).toBe(T0 + DEFAULT_SETTINGS.shortBreakMinutes * 60_000)
    expect(saveStats).toHaveBeenCalledWith({
      sessionsCompleted: 1,
      round: 2,
      lastCompletedAt: T0,
    })
  })

  it('triggers a long break at the interval', () => {
    pomodoroStore.set({ settings: { ...DEFAULT_SETTINGS, longBreakInterval: 2 } })
    // Focus session 1 -> short break.
    pomodoroActions.completePhase()
    // Break ends -> focus.
    pomodoroActions.completePhase()
    // Focus session 2 -> long break (2 % 2 === 0).
    pomodoroActions.completePhase()
    expect(pomodoroStore.getState().phase).toBe(PHASES.LONG_BREAK)
    expect(pomodoroStore.getState().sessionsCompleted).toBe(2)
  })

  it('a completed break returns to focus without counting a session', () => {
    pomodoroStore.set({ phase: PHASES.SHORT_BREAK })
    pomodoroActions.completePhase()
    const s = pomodoroStore.getState()
    expect(s.phase).toBe(PHASES.FOCUS)
    expect(s.sessionsCompleted).toBe(0)
    // autoStartFocus is off by default.
    expect(s.status).toBe('idle')
  })
})

describe('load', () => {
  it('restores persisted settings, stats, and a paused timer', () => {
    pomodoroStore.load({
      settings: { focusMinutes: 40 },
      timer: { phase: 'shortBreak', status: 'paused', remainingMs: 60_000, totalMs: 300_000 },
      stats: { sessionsCompleted: 7, round: 8, lastCompletedAt: 12345 },
    })
    const s = pomodoroStore.getState()
    expect(s.settings.focusMinutes).toBe(40)
    expect(s.phase).toBe(PHASES.SHORT_BREAK)
    expect(s.status).toBe('paused')
    expect(s.remainingMs).toBe(60_000)
    expect(s.sessionsCompleted).toBe(7)
    expect(s.round).toBe(8)
    expect(s.lastCompletedAt).toBe(12345)
    expect(s.endAt).toBeNull()
  })

  it('normalizes a finished timer to idle', () => {
    pomodoroStore.load({ timer: { phase: 'focus', status: 'finished', remainingMs: 0, totalMs: FOCUS_MS } })
    expect(pomodoroStore.getState().status).toBe('idle')
  })

  it('rebuilds a fresh deadline for a restored running timer', () => {
    pomodoroStore.load({
      timer: { phase: 'focus', status: 'running', remainingMs: 300_000, totalMs: FOCUS_MS },
    })
    const s = pomodoroStore.getState()
    expect(s.status).toBe('running')
    expect(s.endAt).toBe(T0 + 300_000)
  })

  it('falls back to defaults for a malformed timer', () => {
    pomodoroStore.load({ timer: { phase: 'weird', status: 'weird' } })
    const s = pomodoroStore.getState()
    expect(s.phase).toBe(PHASES.FOCUS)
    expect(s.status).toBe('idle')
  })
})
