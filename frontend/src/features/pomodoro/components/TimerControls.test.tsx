import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TimerControls } from './TimerControls.jsx'
import type { PomodoroActions } from '../types.js'

vi.mock('../../../lib/backend.js', () => ({
  saveSettings: vi.fn(() => Promise.resolve()),
  saveTimer: vi.fn(() => Promise.resolve()),
  saveStats: vi.fn(() => Promise.resolve()),
}))

function makeActions(): PomodoroActions {
  return {
    start: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    skip: vi.fn(),
    setPhase: vi.fn(),
    setSettings: vi.fn(),
  }
}

describe('TimerControls', () => {
  it('shows Start and disables Reset when idle', () => {
    render(<TimerControls status="idle" actions={makeActions()} />)
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeDisabled()
  })

  it('shows Pause and calls pause while running', () => {
    const actions = makeActions()
    render(<TimerControls status="running" actions={actions} />)
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(actions.pause).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Reset' })).toBeEnabled()
  })

  it('shows Resume and calls start while paused', () => {
    const actions = makeActions()
    render(<TimerControls status="paused" actions={actions} />)
    fireEvent.click(screen.getByRole('button', { name: 'Resume' }))
    expect(actions.start).toHaveBeenCalled()
  })

  it('calls reset and skip', () => {
    const actions = makeActions()
    render(<TimerControls status="running" actions={actions} />)
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
    expect(actions.reset).toHaveBeenCalled()
    expect(actions.skip).toHaveBeenCalled()
  })
})
