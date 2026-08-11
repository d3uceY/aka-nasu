import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { usePomodoro } from '../hooks/usePomodoro.js'
import { useDialRotation } from '../hooks/useDialRotation.js'
import { usePomodoroStore } from '../state/pomodoroStore.js'
import { TimerCanvas } from './TimerCanvas.jsx'
import { TimerDisplay } from './TimerDisplay.jsx'
import { TimerControls } from './TimerControls.jsx'
import { TimerSettings } from './TimerSettings.jsx'

gsap.registerPlugin(useGSAP)

export function PomodoroTimer() {
  const rootRef = useRef(null)
  const sceneRef = useRef(null)

  const phase = usePomodoroStore((s) => s.phase)
  const status = usePomodoroStore((s) => s.status)

  const dial = useDialRotation()
  const { actions } = usePomodoro({
    onComplete: () => sceneRef.current?.pulse(),
  })

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Choreographed entrance — nothing appears at once:
        // the gear peeks in, the tomato rises and settles, the number pops,
        // then the controls cascade up.
        const tl = gsap.timeline()
        // opacity only — a transform here would become the containing block for
        // the settings scrim and break outside-click-to-close.
        tl.from('.timer-stage__tools', { opacity: 0, duration: 0.5, delay: 0.3 })
          .from(
            '.tomato-halo',
            { y: 64, scale: 0.92, autoAlpha: 0, duration: 1.15, ease: 'expo.out' },
            0.05,
          )
          .from(
            '.timer-display',
            { y: 34, autoAlpha: 0, duration: 0.7, ease: 'expo.out' },
            '-=0.5',
          )
          .from(
            '.timer-controls .btn',
            {
              y: 20,
              autoAlpha: 0,
              duration: 0.55,
              ease: 'back.out(1.7)',
              stagger: 0.07,
            },
            '-=0.38',
          )
      })
      return () => mm.revert()
    },
    { scope: rootRef },
  )

  return (
    <div
      className="pomodoro timer-stage"
      ref={rootRef}
      data-phase={phase}
      data-status={status}
    >
      <div className="timer-stage__tools">
        <TimerSettings actions={actions} />
      </div>
      <div className="tomato-halo">
        <TimerCanvas config={dial} onSceneReady={(s) => (sceneRef.current = s)} />
      </div>
      <TimerDisplay />
      <TimerControls status={status} actions={actions} />
    </div>
  )
}
