import { useEffect, useRef } from 'react'
import { pomodoroActions, usePomodoroStore } from '../state/pomodoroStore.js'
import { useTimer } from './useTimer.js'
import { playSound } from '../../../utils/audio.js'
import { notifyPhaseComplete } from '../../../lib/backend.js'
import type { Phase } from '../types.js'

export function usePomodoro({ onComplete }: { onComplete?: () => void } = {}): void {
  useTimer()
  const status = usePomodoroStore((s) => s.status)
  const phase = usePomodoroStore((s) => s.phase)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Mirror phase in a ref so the completion effect can read it before
  // completePhase() advances it.
  const phaseRef = useRef<Phase>(phase)
  phaseRef.current = phase

  const prevStatus = useRef(status)
  useEffect(() => {
    if (prevStatus.current === 'running' && status === 'finished') {
      const completed = phaseRef.current
      // Commit the phase advance first...
      pomodoroActions.completePhase()
      playSound('complete')
      onCompleteRef.current?.()
      // ...then fire the notification, deferred out of the render tick.
      setTimeout(() => notifyPhaseComplete(completed), 0)
    }
    prevStatus.current = status
  }, [status])
}
