import { renderHook, act } from '@testing-library/react'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { usePomodoro } from './usePomodoro.js'
import { pomodoroStore } from '../state/pomodoroStore.js'
import { notifyPhaseComplete } from '../../../lib/backend.js'

vi.mock('../../../lib/backend.js', () => ({
  saveSettings: vi.fn(() => Promise.resolve()),
  saveTimer: vi.fn(() => Promise.resolve()),
  saveStats: vi.fn(() => Promise.resolve()),
  notifyPhaseComplete: vi.fn(),
}))

const T0 = new Date('2026-01-01T00:00:00.000Z').getTime()

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(T0)
  pomodoroStore.reset()
  vi.mocked(notifyPhaseComplete).mockClear()
})

afterEach(() => {
  vi.useRealTimers()
})

function finishRunningSession(): void {
  act(() => pomodoroStore.set({ status: 'running', endAt: T0 + 1_000 }))
  act(() => pomodoroStore.set({ status: 'finished', endAt: null }))
}

describe('usePomodoro', () => {
  it('commits the phase advance when a run finishes', () => {
    renderHook(() => usePomodoro())
    finishRunningSession()
    const s = pomodoroStore.getState()
    expect(s.sessionsCompleted).toBe(1)
    expect(s.phase).toBe('shortBreak')
  })

  it('fires onComplete when a run finishes', () => {
    const onComplete = vi.fn()
    renderHook(() => usePomodoro({ onComplete }))
    finishRunningSession()
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('defers the native notification to the next tick', () => {
    renderHook(() => usePomodoro())
    finishRunningSession()
    expect(notifyPhaseComplete).not.toHaveBeenCalled()
    vi.advanceTimersByTime(0)
    expect(notifyPhaseComplete).toHaveBeenCalledWith('focus')
  })

  it('exposes actions that drive the store', () => {
    const { result } = renderHook(() => usePomodoro())
    act(() => result.current.actions.start())
    expect(pomodoroStore.getState().status).toBe('running')
    act(() => result.current.actions.pause())
    expect(pomodoroStore.getState().status).toBe('paused')
  })
})
