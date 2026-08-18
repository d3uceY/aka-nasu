import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { TimerControls } from './TimerControls.jsx'
import { pomodoroActions } from '../state/pomodoroStore.js'

vi.mock('../../../lib/backend.js', () => ({
  saveSettings: vi.fn(() => Promise.resolve()),
  saveTimer: vi.fn(() => Promise.resolve()),
  saveStats: vi.fn(() => Promise.resolve()),
}))

vi.mock('../state/pomodoroStore.js', async () => {
  const actual = await vi.importActual<typeof import('../state/pomodoroStore.js')>(
    '../state/pomodoroStore.js',
  )
  return {
    ...actual,
    pomodoroActions: {
      start: vi.fn(),
      pause: vi.fn(),
      reset: vi.fn(),
      skip: vi.fn(),
      setPhase: vi.fn(),
      setSettings: vi.fn(),
      tick: vi.fn(),
      completePhase: vi.fn(),
    },
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TimerControls', () => {
  it('shows Start and disables Reset when idle', () => {
    render(<TimerControls status="idle" />)
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
  })

  it('shows Pause and calls pause while running', () => {
    render(<TimerControls status="running" />)
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(pomodoroActions.pause).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeEnabled()
  })

  it('shows Resume and calls start while paused', () => {
    render(<TimerControls status="paused" />)
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }))
    expect(pomodoroActions.start).toHaveBeenCalled()
  })

  it('calls reset and skip', () => {
    render(<TimerControls status="running" />)
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
    expect(pomodoroActions.reset).toHaveBeenCalled()
    expect(pomodoroActions.skip).toHaveBeenCalled()
  })
})
