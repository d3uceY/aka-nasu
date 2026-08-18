import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { TimerSettings } from './TimerSettings.jsx'
import { pomodoroStore } from '../state/pomodoroStore.js'
import { updateStore } from '../../update/state/updateStore.js'
import { openExternal } from '../../../lib/externalLink.js'

vi.mock('../../../lib/backend.js', () => ({
  saveSettings: vi.fn(() => Promise.resolve()),
  saveTimer: vi.fn(() => Promise.resolve()),
  saveStats: vi.fn(() => Promise.resolve()),
}))

vi.mock('../../../lib/externalLink.js', () => ({
  openExternal: vi.fn(),
}))

const mockOpenExternal = vi.mocked(openExternal)
const release = { tag: 'v1.2.3', name: 'v1.2.3', url: 'https://x', notes: '' }

beforeEach(() => {
  vi.useFakeTimers()
  pomodoroStore.reset()
  updateStore.reset()
  window.localStorage.clear()
  mockOpenExternal.mockClear()
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

  it('shows an update badge on the gear when a release is set', () => {
    updateStore.setRelease(release)
    render(<TimerSettings />)
    expect(document.querySelector('.settings__update-badge')).not.toBeNull()
  })

  it('hides the update badge without a release', () => {
    render(<TimerSettings />)
    expect(document.querySelector('.settings__update-badge')).toBeNull()
  })

  it('shows the update section inside the popover when a release is set', () => {
    updateStore.setRelease(release)
    render(<TimerSettings />)
    fireEvent.click(screen.getByRole('button', { name: 'Timer settings' }))
    expect(screen.getByText('Version 1.2.3 is available.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to website' })).toBeInTheDocument()
  })

  it('opens the download site from the update section', () => {
    updateStore.setRelease(release)
    render(<TimerSettings />)
    fireEvent.click(screen.getByRole('button', { name: 'Timer settings' }))
    fireEvent.click(screen.getByRole('button', { name: 'Go to website' }))
    expect(mockOpenExternal).toHaveBeenCalledWith('https://d3ucey.github.io/aka-nasu/#download')
  })
})
