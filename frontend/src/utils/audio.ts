import { SOUNDS } from '../constants/sounds.js'
import type { SoundName } from '../constants/sounds.js'
import { pomodoroStore } from '../features/pomodoro/state/pomodoroStore.js'

// Reads the sound toggle on every call so non-React code stays in sync.
export function isSoundEnabled(): boolean {
  return pomodoroStore.getState().settings.soundEnabled !== false
}

// Tracks the last play time per sound so calls can be debounced.
const lastPlayedAt = new Map<string, number>()

export function playSound(name: SoundName, debounceMs?: number): void {
  const def = SOUNDS[name]
  if (!def || !isSoundEnabled()) return

  if (typeof debounceMs === 'number' && debounceMs > 0) {
    const now = Date.now()
    const last = lastPlayedAt.get(name)
    if (last !== undefined && now - last < debounceMs) return
    lastPlayedAt.set(name, now)
  }

  try {
    const audio = new Audio(def.file)
    audio.volume = def.volume
    audio.play().catch(() => {})
  } catch {
    /* audio not available */
  }
}
