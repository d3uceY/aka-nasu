import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { MiniTimer } from './MiniTimer.jsx'
import { pomodoroStore } from '../state/pomodoroStore.js'
import { uiStore } from '../../../state/uiStore.js'
import { todoStore } from '../../todo/state/todoStore.js'

vi.mock('../../../lib/backend.js', () => ({
  saveSettings: vi.fn(() => Promise.resolve()),
  saveTimer: vi.fn(() => Promise.resolve()),
  saveStats: vi.fn(() => Promise.resolve()),
  notifyPhaseComplete: vi.fn(),
  addTodo: vi.fn(() => Promise.resolve([])),
  toggleTodo: vi.fn(() => Promise.resolve([])),
  removeTodo: vi.fn(() => Promise.resolve([])),
  updateTodo: vi.fn(() => Promise.resolve([])),
  setActiveTodo: vi.fn(() => Promise.resolve([])),
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
  uiStore.setMode('mini')
  todoStore.load([])
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

  it('shows a quiet hint when there is no current task', () => {
    render(<MiniTimer />)
    expect(screen.getByText('No current task')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'No current task' })).toBeDisabled()
  })

  it('shows the current task with a done toggle', () => {
    todoStore.load([{ id: '1', text: 'water the basil', done: false, active: true, createdAt: 1 }])
    render(<MiniTimer />)
    expect(screen.getByText('water the basil')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mark current task as done' })).toBeEnabled()
  })

  it('marks the current task done from the mini window', () => {
    todoStore.load([{ id: '1', text: 'water the basil', done: false, active: true, createdAt: 1 }])
    render(<MiniTimer />)
    fireEvent.click(screen.getByRole('button', { name: 'Mark current task as done' }))
    // The optimistic update flips the pin synchronously.
    expect(todoStore.getTodos().find((t) => t.id === '1')?.done).toBe(true)
    expect(screen.getByRole('button', { name: 'Mark current task as not done' })).toBeInTheDocument()
  })
})
