import { renderHook, act } from '@testing-library/react'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { useDialRotation } from './useDialRotation.js'
import { pomodoroStore } from '../state/pomodoroStore.js'

vi.mock('../../../lib/backend.js', () => ({
  saveSettings: vi.fn(() => Promise.resolve()),
  saveTimer: vi.fn(() => Promise.resolve()),
  saveStats: vi.fn(() => Promise.resolve()),
}))

beforeEach(() => {
  vi.useFakeTimers()
  pomodoroStore.reset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useDialRotation', () => {
  it('reports the focus length when idle', () => {
    const { result } = renderHook(() => useDialRotation())
    expect(result.current.getDialMinute()).toBe(25)
  })

  it('reports the remaining minutes while running', () => {
    pomodoroStore.set({ status: 'running', remainingMs: 10 * 60_000, endAt: 1 })
    const { result } = renderHook(() => useDialRotation())
    expect(result.current.getDialMinute()).toBe(10)
  })

  it('only allows interaction while idle', () => {
    const { result } = renderHook(() => useDialRotation())
    expect(result.current.getInteractionEnabled()).toBe(true)
    act(() => pomodoroStore.set({ status: 'running', endAt: 1 }))
    expect(result.current.getInteractionEnabled()).toBe(false)
  })

  it('clamps manual dial changes to the focus range', () => {
    const { result } = renderHook(() => useDialRotation())
    act(() => result.current.handleDialChange?.(70))
    expect(pomodoroStore.getState().settings.focusMinutes).toBe(60)
    act(() => result.current.handleDialChange?.(-3))
    expect(pomodoroStore.getState().settings.focusMinutes).toBe(1)
  })

  it('ignores manual dial changes while not idle', () => {
    pomodoroStore.set({ status: 'running', remainingMs: 10 * 60_000, endAt: 1 })
    const { result } = renderHook(() => useDialRotation())
    act(() => result.current.handleDialChange?.(40))
    expect(pomodoroStore.getState().settings.focusMinutes).toBe(25)
  })
})
