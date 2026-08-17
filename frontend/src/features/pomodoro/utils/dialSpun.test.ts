import { beforeEach, describe, it, expect } from 'vitest'
import { dialSpun } from './dialSpun.js'
import { pomodoroStore } from '../state/pomodoroStore.js'

beforeEach(() => {
  pomodoroStore.reset()
})

describe('dialSpun', () => {
  it('returns true when the dial position changes', () => {
    // idle at 25 min -> running with 12 min remaining.
    const spun = dialSpun(() =>
      pomodoroStore.set({ status: 'running', remainingMs: 12 * 60_000, endAt: 1 }),
    )
    expect(spun).toBe(true)
  })

  it('returns false when the dial stays put', () => {
    // pause/resume keep the same position.
    const spun = dialSpun(() => pomodoroStore.set({ status: 'paused' }))
    expect(spun).toBe(false)
  })

  it('ignores sub-epsilon movement', () => {
    const spun = dialSpun(() => pomodoroStore.set({ remainingMs: 25 * 60_000 - 1 }))
    expect(spun).toBe(false)
  })

  it('detects a skip that travels to a new phase position', () => {
    // short break (5 min, running) vs focus (25 min, idle) -> big travel.
    const spun = dialSpun(() =>
      pomodoroStore.set({
        phase: 'shortBreak',
        status: 'running',
        remainingMs: 5 * 60_000,
        totalMs: 5 * 60_000,
        endAt: 1,
      }),
    )
    expect(spun).toBe(true)
  })
})
