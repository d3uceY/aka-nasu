import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { TimerSettings } from './TimerSettings.jsx'
import { pomodoroStore } from '../state/pomodoroStore.js'

vi.mock('../../../lib/backend.js', () => ({
  saveSettings: vi.fn(() => Promise.resolve()),
  saveTimer: vi.fn(() => Promise.resolve()),
  saveStats: vi.fn(() => Promise.resolve()),
}))

beforeEach(() => {
  vi.useFakeTimers()
  pomodoroStore.reset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('TimerSettings', () => {
  it('renders the three duration sliders', () => {
    render(<TimerSettings />)
    expect(screen.getAllByRole('slider')).toHaveLength(3)
  })

  it('toggles the popover via the gear', () => {
    render(<TimerSettings />)
    const gear = screen.getByRole('button', { name: 'Timer settings' })
    expect(gear).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(gear)
    expect(gear).toHaveAttribute('aria-expanded', 'true')
  })

  it('updates the store when a slider changes', () => {
    render(<TimerSettings />)
    fireEvent.change(screen.getAllByRole('slider')[0], { target: { value: '40' } })
    expect(pomodoroStore.getState().settings.focusMinutes).toBe(40)
  })

  it('toggles sound through the store', () => {
    render(<TimerSettings />)
    const soundToggle = screen.getByRole('checkbox', { name: /Play sounds/i })
    expect(soundToggle).toBeChecked()
    fireEvent.click(soundToggle)
    expect(pomodoroStore.getState().settings.soundEnabled).toBe(false)
  })
})
