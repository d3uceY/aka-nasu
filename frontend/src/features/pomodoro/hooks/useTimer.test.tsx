import { renderHook, act } from '@testing-library/react'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { useTimer } from './useTimer.js'
import { pomodoroStore } from '../state/pomodoroStore.js'

vi.mock('../../../lib/backend.js', () => ({
  saveSettings: vi.fn(() => Promise.resolve()),
  saveTimer: vi.fn(() => Promise.resolve()),
  saveStats: vi.fn(() => Promise.resolve()),
}))

const T0 = new Date('2026-01-01T00:00:00.000Z').getTime()

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(T0)
  pomodoroStore.reset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useTimer', () => {
  it('does not tick while idle', () => {
    renderHook(() => useTimer())
    vi.advanceTimersByTime(5_000)
    expect(pomodoroStore.getState().remainingMs).toBe(25 * 60_000)
  })

  it('ticks every TIMER.tickMs while running', () => {
    pomodoroStore.set({ status: 'running', remainingMs: 25 * 60_000, endAt: T0 + 25 * 60_000 })
    renderHook(() => useTimer())
    vi.advanceTimersByTime(250)
    expect(pomodoroStore.getState().remainingMs).toBe(25 * 60_000 - 250)
  })

  it('clears the interval once no longer running', () => {
    pomodoroStore.set({ status: 'running', remainingMs: 25 * 60_000, endAt: T0 + 25 * 60_000 })
    const { rerender } = renderHook(() => useTimer())
    act(() => pomodoroStore.set({ status: 'idle' }))
    rerender()
    const remaining = pomodoroStore.getState().remainingMs
    vi.advanceTimersByTime(1_000)
    expect(pomodoroStore.getState().remainingMs).toBe(remaining)
  })
})
