import { render, screen, act } from '@testing-library/react'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import App from './App.jsx'
import { uiStore } from './state/uiStore.js'
import { pomodoroStore } from './features/pomodoro/state/pomodoroStore.js'
import { todoStore } from './features/todo/state/todoStore.js'

vi.mock('./lib/backend.js', () => ({
  getAppVersion: vi.fn(() => Promise.resolve(null)),
  loadAppState: vi.fn(),
  saveSettings: vi.fn(() => Promise.resolve()),
  saveTimer: vi.fn(() => Promise.resolve()),
  saveStats: vi.fn(() => Promise.resolve()),
  addTodo: vi.fn(),
  toggleTodo: vi.fn(),
  removeTodo: vi.fn(),
  notifyPhaseComplete: vi.fn(),
}))
vi.mock('./lib/window.js', () => ({
  enterMiniMode: vi.fn(() => Promise.resolve()),
  exitMiniMode: vi.fn(() => Promise.resolve()),
}))
vi.mock('./features/pomodoro/three/TomatoTimerScene.js', () => ({
  TomatoTimerScene: class {
    dispose(): void {}
    pulse(): void {}
  },
}))
vi.mock('./components/AppIntro.jsx', () => ({
  AppIntro: () => <div data-testid="app-intro" />,
}))

beforeEach(() => {
  uiStore.setMode('full')
  pomodoroStore.reset()
  todoStore.load([])
})

describe('App', () => {
  it('renders the full layout with the intro', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Check list' })).toBeInTheDocument()
    expect(screen.getByTestId('app-intro')).toBeInTheDocument()
  })

  it('swaps to the mini layout', () => {
    render(<App />)
    act(() => uiStore.setMode('mini'))
    expect(screen.queryByTestId('app-intro')).toBeNull()
    expect(screen.queryByRole('tab', { name: 'Check list' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Expand window' })).toBeInTheDocument()
  })

  it('returns to full after expanding', () => {
    render(<App />)
    act(() => uiStore.setMode('mini'))
    act(() => uiStore.setMode('full'))
    expect(screen.getByRole('tab', { name: 'Check list' })).toBeInTheDocument()
  })
})
