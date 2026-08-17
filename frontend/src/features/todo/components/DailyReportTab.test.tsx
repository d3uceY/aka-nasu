import { render, screen } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { DailyReportTab } from './DailyReportTab.jsx'
import { todoStore } from '../state/todoStore.js'
import { pomodoroStore } from '../../pomodoro/state/pomodoroStore.js'

vi.mock('../../../lib/backend.js', () => ({
  saveSettings: vi.fn(() => Promise.resolve()),
  saveTimer: vi.fn(() => Promise.resolve()),
  saveStats: vi.fn(() => Promise.resolve()),
}))

beforeEach(() => {
  todoStore.load([])
  pomodoroStore.reset()
})

describe('DailyReportTab', () => {
  it('shows empty copy before anything is done', () => {
    render(<DailyReportTab />)
    expect(screen.getByText('Nothing ripe yet. Let a focus run finish.')).toBeInTheDocument()
    expect(screen.getAllByText('0')).toHaveLength(2)
    expect(screen.getByText('tasks done')).toBeInTheDocument()
  })

  it('counts completed tasks and pomodoros', () => {
    todoStore.load([
      { id: '1', text: 'done task', done: true, createdAt: 1 },
      { id: '2', text: 'open task', done: false, createdAt: 2 },
    ])
    pomodoroStore.set({ sessionsCompleted: 3 })
    render(<DailyReportTab />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('tasks done')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('pomodoros')).toBeInTheDocument()
  })

  it('lists the completed tasks', () => {
    todoStore.load([{ id: '1', text: 'shipped feature', done: true, createdAt: 1 }])
    pomodoroStore.set({ sessionsCompleted: 1 })
    render(<DailyReportTab />)
    expect(screen.getByText('shipped feature')).toBeInTheDocument()
    expect(screen.getByText(/tomato of focus today/)).toBeInTheDocument()
  })
})
