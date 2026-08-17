import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { MiniTimer } from './MiniTimer.jsx'
import { pomodoroStore } from '../state/pomodoroStore.js'
import { uiStore } from '../../../state/uiStore.js'

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
  },
}))

beforeEach(() => {
  pomodoroStore.reset()
  uiStore.setMode('mini')
})

describe('MiniTimer', () => {
  it('renders the phase, time, and controls', () => {
    render(<MiniTimer />)
    expect(screen.getByText('Focus')).toBeInTheDocument()
    expect(screen.getByLabelText('25:00')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset timer' })).toBeDisabled()
  })

  it('starts and pauses via the transport', () => {
    render(<MiniTimer />)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(pomodoroStore.getState().status).toBe('running')
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    expect(pomodoroStore.getState().status).toBe('paused')
  })

  it('expands back to full mode', async () => {
    render(<MiniTimer />)
    fireEvent.click(screen.getByRole('button', { name: 'Expand window' }))
    await waitFor(() => expect(uiStore.getState().mode).toBe('full'))
  })

  it('skips to the next phase', () => {
    render(<MiniTimer />)
    fireEvent.click(screen.getByRole('button', { name: 'Skip phase' }))
    expect(pomodoroStore.getState().phase).toBe('shortBreak')
  })
})
