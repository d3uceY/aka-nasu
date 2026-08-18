import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { PomodoroTimer } from './PomodoroTimer.jsx'
import { pomodoroStore } from '../state/pomodoroStore.js'

vi.mock('../../../lib/backend.js', () => ({
  saveSettings: vi.fn(() => Promise.resolve()),
  saveTimer: vi.fn(() => Promise.resolve()),
  saveStats: vi.fn(() => Promise.resolve()),
  notifyPhaseComplete: vi.fn(),
}))
vi.mock('../../../lib/window.js', () => ({
  enterMiniMode: vi.fn(() => Promise.resolve()),
  exitMiniMode: vi.fn(() => Promise.resolve()),
}))
vi.mock('../three/TomatoTimerScene.js', () => ({
  TomatoTimerScene: class {
    dispose(): void {}
    pulse(): void {}
    setPalette(): void {}
  },
}))

beforeEach(() => {
  pomodoroStore.reset()
})

describe('PomodoroTimer', () => {
  it('renders the full timer chrome', () => {
    render(<PomodoroTimer />)
    expect(screen.getByRole('button', { name: 'Timer settings' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enter mini timer' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByLabelText('25:00')).toBeInTheDocument()
  })

  it('starts the session from the transport', () => {
    render(<PomodoroTimer />)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(pomodoroStore.getState().status).toBe('running')
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
  })
})
