import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { TodoPanel } from './TodoPanel.jsx'
import { todoStore } from '../state/todoStore.js'
import { pomodoroStore } from '../../pomodoro/state/pomodoroStore.js'

vi.mock('../../../lib/backend.js', () => ({
  addTodo: vi.fn(),
  toggleTodo: vi.fn(),
  removeTodo: vi.fn(),
  updateTodo: vi.fn(),
  setActiveTodo: vi.fn(),
  saveSettings: vi.fn(() => Promise.resolve()),
  saveTimer: vi.fn(() => Promise.resolve()),
  saveStats: vi.fn(() => Promise.resolve()),
}))

beforeEach(() => {
  todoStore.load([])
  pomodoroStore.reset()
})

describe('TodoPanel', () => {
  it('shows the checklist tab by default', () => {
    render(<TodoPanel />)
    expect(screen.getByText('Nothing planted yet. Add a seed above.')).toBeInTheDocument()
    const checklistTab = screen.getByRole('tab', { name: 'Check list' })
    expect(checklistTab).toHaveAttribute('aria-selected', 'true')
  })

  it('switches to the daily report tab', () => {
    render(<TodoPanel />)
    fireEvent.click(screen.getByRole('tab', { name: 'Daily report' }))
    expect(screen.getByText('Nothing ripe yet. Let a focus run finish.')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Daily report' })).toHaveAttribute('aria-selected', 'true')
  })
})
