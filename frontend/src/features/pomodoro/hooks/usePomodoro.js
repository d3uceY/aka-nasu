import { useEffect, useRef } from 'react'
import { pomodoroActions, usePomodoroStore } from '../state/pomodoroStore.js'
import { useTimer } from './useTimer.js'
import { playSound } from '../../../utils/audio.js'

export function usePomodoro({ onComplete } = {}) {
  useTimer()
  const status = usePomodoroStore((s) => s.status)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const prevStatus = useRef(status)
  useEffect(() => {
    if (prevStatus.current === 'running' && status === 'finished') {
      pomodoroActions.completePhase()
      playSound('complete')
      onCompleteRef.current?.()
    }
    prevStatus.current = status
  }, [status])

  const actions = {
    start: () => pomodoroActions.start(),
    pause: () => pomodoroActions.pause(),
    reset: () => pomodoroActions.reset(),
    skip: () => pomodoroActions.skip(),
    setPhase: (phase) => pomodoroActions.setPhase(phase),
    setSettings: (patch) => pomodoroActions.setSettings(patch),
  }

  return { status, actions }
}
