import { useCallback, useRef } from 'react'
import { TIMER } from '../constants/timer.js'
import { pomodoroActions, usePomodoroStore } from '../state/pomodoroStore.js'

// Bridges the 3D dial to the pomodoro store.
// The scene *pulls* the target minute each frame via getDialMinute (smooth
// per-frame countdown), and reports manual dial changes via handleDialChange.
export function useDialRotation() {
  const status = usePomodoroStore((s) => s.status)
  const remainingMs = usePomodoroStore((s) => s.remainingMs)
  const focusMinutes = usePomodoroStore((s) => s.settings.focusMinutes)

  const statusRef = useRef(status)
  const remainingMsRef = useRef(remainingMs)
  const focusMinutesRef = useRef(focusMinutes)
  statusRef.current = status
  remainingMsRef.current = remainingMs
  focusMinutesRef.current = focusMinutes

  const getDialMinute = useCallback(() => {
    const s = statusRef.current
    // running / paused / finished: show the remaining time (fractional minutes
    // give a smooth sweep); idle: rest at the selected focus length.
    if (s === 'running' || s === 'paused' || s === 'finished') {
      return remainingMsRef.current / 60000
    }
    return focusMinutesRef.current
  }, [])

  const getInteractionEnabled = useCallback(() => statusRef.current === 'idle', [])

  const handleDialChange = useCallback((minutes) => {
    if (statusRef.current !== 'idle') return
    const clamped = Math.min(
      TIMER.maxFocusMinutes,
      Math.max(TIMER.minFocusMinutes, Math.round(minutes)),
    )
    pomodoroActions.setSettings({ focusMinutes: clamped })
  }, [])

  return { getDialMinute, getInteractionEnabled, handleDialChange }
}
