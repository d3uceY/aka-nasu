import { render, screen } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { TimerDisplay } from './TimerDisplay.jsx'
import { pomodoroStore } from '../state/pomodoroStore.js'

vi.mock('../../../lib/backend.js', () => ({
  saveSettings: vi.fn(() => Promise.resolve()),
  saveTimer: vi.fn(() => Promise.resolve()),
  saveStats: vi.fn(() => Promise.resolve()),
}))

beforeEach(() => {
  pomodoroStore.reset()
})

describe('TimerDisplay', () => {
  it('shows the focus phase, time, round, and hint when idle', () => {
    render(<TimerDisplay />)
    expect(screen.getByText('Focus')).toBeInTheDocument()
    expect(screen.getByLabelText('25:00')).toBeInTheDocument()
    expect(screen.getByText('Round 1')).toBeInTheDocument()
    expect(screen.getByText('25 min')).toBeInTheDocument()
    expect(screen.getByText('focus')).toBeInTheDocument()
    expect(screen.getByText('spin the tomato to set your focus')).toBeInTheDocument()
  })

  it('swaps the hint and time while running', () => {
    pomodoroStore.set({ status: 'running', remainingMs: 10 * 60_000, endAt: 1 })
    render(<TimerDisplay />)
    expect(screen.getByLabelText('10:00')).toBeInTheDocument()
    expect(screen.getByText('in session, keep the flow')).toBeInTheDocument()
  })

  it('shows the round count', () => {
    pomodoroStore.set({ round: 7 })
    render(<TimerDisplay />)
    expect(screen.getByText('Round 7')).toBeInTheDocument()
  })
})
