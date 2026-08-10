import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { usePomodoro } from '../hooks/usePomodoro.js'
import { useDialRotation } from '../hooks/useDialRotation.js'
import { TimerCanvas } from './TimerCanvas.jsx'
import { TimerDisplay } from './TimerDisplay.jsx'
import { TimerControls } from './TimerControls.jsx'
import { FocusDuration } from './FocusDuration.jsx'
import { TimerSettings } from './TimerSettings.jsx'

gsap.registerPlugin(useGSAP)

export function PomodoroTimer() {
  const rootRef = useRef(null)
  const sceneRef = useRef(null)

  const dial = useDialRotation()
  const { status, actions } = usePomodoro({
    onComplete: () => sceneRef.current?.pulse(),
  })

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.pomodoro__reveal', {
          y: 26,
          autoAlpha: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.1,
          delay: 0.1,
        })
      })
      return () => mm.revert()
    },
    { scope: rootRef },
  )

  return (
    <div className="pomodoro timer-card" ref={rootRef}>
      <div className="pomodoro__reveal">
        <TimerCanvas config={dial} onSceneReady={(s) => (sceneRef.current = s)} />
        <TimerDisplay />
        <FocusDuration />
        <TimerControls status={status} actions={actions} />
      </div>
      <div className="pomodoro__reveal">
        <TimerSettings actions={actions} />
      </div>
    </div>
  )
}
