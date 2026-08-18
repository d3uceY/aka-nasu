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
  it('renders the three duration sliders plus the volume slider', () => {
    render(<TimerSettings />)
    expect(screen.getAllByRole('slider')).toHaveLength(4)
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

  it('renders the eight tomato color palettes', () => {
    render(<TimerSettings />)
    const swatches = screen.getAllByRole('radio', { name: /(Classic|Ember|Golden hour|Meadow|Lagoon|Grape|Berry|Cocoa)/ })
    expect(swatches).toHaveLength(8)
    expect(screen.getByRole('radio', { name: 'Classic' })).toHaveAttribute('aria-checked', 'true')
  })

  it('selects a palette through the store', () => {
    render(<TimerSettings />)
    fireEvent.click(screen.getByRole('radio', { name: 'Grape' }))
    expect(pomodoroStore.getState().settings.palette).toBe('grape')
    expect(screen.getByRole('radio', { name: 'Grape' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Classic' })).toHaveAttribute('aria-checked', 'false')
  })
})
