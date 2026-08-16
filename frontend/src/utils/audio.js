import { SOUNDS } from '../constants/sounds.js'
import { pomodoroStore } from '../features/pomodoro/state/pomodoroStore.js'

// Reads the "Play sounds" toggle from the pomodoro settings on every call so
// it stays in sync even in non-React code (e.g. the 3D dial).
export function isSoundEnabled() {
  return pomodoroStore.getState().settings.soundEnabled !== false
}

export function playSound(name) {
  const def = SOUNDS[name]
  if (!def || !isSoundEnabled()) return
  try {
    const audio = new Audio(def.file)
    audio.volume = def.volume
    audio.play().catch(() => {})
  } catch {
    /* audio not available */
  }
}
