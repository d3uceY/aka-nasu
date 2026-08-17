import { useCallback, useRef } from 'react'
import { TIMER } from '../constants/timer.js'
import { pomodoroActions, usePomodoroStore } from '../state/pomodoroStore.js'
import { dialMinuteFor } from '../utils/timerMath.js'
import type { DialCallbacks, TimerStatus } from '../types.js'

// Bridges the 3D dial to the pomodoro store.
// The scene *pulls* the target minute each frame via getDialMinute (smooth
// per-frame countdown), and reports manual dial changes via handleDialChange.
export function useDialRotation(): DialCallbacks {
  const status = usePomodoroStore((s) => s.status)
  const remainingMs = usePomodoroStore((s) => s.remainingMs)
  const focusMinutes = usePomodoroStore((s) => s.settings.focusMinutes)

  const statusRef = useRef<TimerStatus>(status)
  const remainingMsRef = useRef(remainingMs)
  const focusMinutesRef = useRef(focusMinutes)
  statusRef.current = status
  remainingMsRef.current = remainingMs
  focusMinutesRef.current = focusMinutes

  const getDialMinute = useCallback(() => {
    return dialMinuteFor(statusRef.current, remainingMsRef.current, focusMinutesRef.current)
  }, [])

  const getInteractionEnabled = useCallback(() => statusRef.current === 'idle', [])

  const handleDialChange = useCallback((minutes: number) => {
    if (statusRef.current !== 'idle') return
    const clamped = Math.min(
      TIMER.maxFocusMinutes,
      Math.max(TIMER.minFocusMinutes, Math.round(minutes)),
    )
    pomodoroActions.setSettings({ focusMinutes: clamped })
  }, [])

  return { getDialMinute, getInteractionEnabled, handleDialChange }
}
