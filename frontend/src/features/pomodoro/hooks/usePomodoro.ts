import { useEffect, useRef } from 'react'
import { pomodoroActions, usePomodoroStore } from '../state/pomodoroStore.js'
import { useTimer } from './useTimer.js'
import { playSound } from '../../../utils/audio.js'
import { notifyPhaseComplete } from '../../../lib/backend.js'
import type { Phase, PomodoroActions, TimerStatus } from '../types.js'

export function usePomodoro({ onComplete }: { onComplete?: () => void } = {}): {
  status: TimerStatus
  actions: PomodoroActions
} {
  useTimer()
  const status = usePomodoroStore((s) => s.status)
  const phase = usePomodoroStore((s) => s.phase)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  // Mirror the current phase so the completion effect can capture which phase
  // just ran out (it must be read BEFORE completePhase() advances it) without
  // adding `phase` to the effect's dependencies.
  const phaseRef = useRef<Phase>(phase)
  phaseRef.current = phase

  const prevStatus = useRef(status)
  useEffect(() => {
    if (prevStatus.current === 'running' && status === 'finished') {
      const completed = phaseRef.current
      // Commit the phase advance + persistence first...
      pomodoroActions.completePhase()
      playSound('complete')
      onCompleteRef.current?.()
      // ...then fire the native notification, deferred so it never runs in
      // the same tick as the store mutation/render and can't block or crash
      // the UI. Best-effort on both sides (see notifyPhaseComplete).
      setTimeout(() => notifyPhaseComplete(completed), 0)
    }
    prevStatus.current = status
  }, [status])

  const actions: PomodoroActions = {
    start: () => pomodoroActions.start(),
    pause: () => pomodoroActions.pause(),
    reset: () => pomodoroActions.reset(),
    skip: () => pomodoroActions.skip(),
    setPhase: (phase) => pomodoroActions.setPhase(phase),
    setSettings: (patch) => pomodoroActions.setSettings(patch),
  }

  return { status, actions }
}
