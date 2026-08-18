import { useEffect } from 'react'
import { TIMER } from '../constants/timer.js'
import { pomodoroActions, usePomodoroStore } from '../state/pomodoroStore.js'

// Drives the countdown via a short interval; the 3D dial animates in its own rAF loop.
export function useTimer(): void {
  const status = usePomodoroStore((s) => s.status)

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => pomodoroActions.tick(), TIMER.tickMs)
    return () => clearInterval(id)
  }, [status])
}
