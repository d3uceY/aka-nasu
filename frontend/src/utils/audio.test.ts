import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { playSound, isSoundEnabled } from './audio.js'
import { pomodoroStore } from '../features/pomodoro/state/pomodoroStore.js'
import type { SoundName } from '../constants/sounds.js'

// Capture every Audio instance constructed so we can assert file + volume.
const created: Array<{ src: string; volume: number }> = []

class AudioStub {
  volume = 0
  src: string
  constructor(src: string) {
    this.src = src
    created.push(this)
  }
  play = () => Promise.resolve()
}

vi.stubGlobal('Audio', AudioStub)

function setSoundEnabled(value: boolean): void {
  const settings = { ...pomodoroStore.getState().settings, soundEnabled: value }
  pomodoroStore.set({ settings })
}

beforeEach(() => {
  created.length = 0
  pomodoroStore.reset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('audio', () => {
  it('reports the sound toggle from the store', () => {
    expect(isSoundEnabled()).toBe(true)
    setSoundEnabled(false)
    expect(isSoundEnabled()).toBe(false)
  })

  it('plays a sound with its configured file and volume', () => {
    playSound('complete')
    expect(created).toHaveLength(1)
    expect(created[0].src).toBe('/sounds/complete.mp3')
    expect(created[0].volume).toBe(1)
  })

  it('honours per-sound volume', () => {
    playSound('clickIntoPlace')
    expect(created[0].volume).toBe(0.3)
  })

  it('does nothing when the toggle is off', () => {
    setSoundEnabled(false)
    playSound('complete')
    expect(created).toHaveLength(0)
  })

  it('does nothing for an unknown sound name', () => {
    playSound('nope' as SoundName)
    expect(created).toHaveLength(0)
  })

  it('debounces repeated plays within the window', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    playSound('ding', 100)
    vi.setSystemTime(50)
    playSound('ding', 100)
    expect(created).toHaveLength(1)
    // After the window elapses, it plays again.
    vi.setSystemTime(100)
    playSound('ding', 100)
    expect(created).toHaveLength(2)
  })
})
