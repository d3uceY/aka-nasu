import { useEffect } from 'react'
import { TIMER } from '../constants/timer.js'
import { pomodoroActions, usePomodoroStore } from '../state/pomodoroStore.js'

// Drives the countdown. Uses a short interval that decrements the store;
// the 3D dial animates smoothly in its own requestAnimationFrame loop.
export function useTimer(): void {
  const status = usePomodoroStore((s) => s.status)

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => pomodoroActions.tick(), TIMER.tickMs)
    return () => clearInterval(id)
  }, [status])
}
