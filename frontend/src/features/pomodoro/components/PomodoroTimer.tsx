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
import { MiniModeButton } from './MiniModeButton.jsx'
import type { TomatoTimerScene } from '../three/TomatoTimerScene.js'

gsap.registerPlugin(useGSAP)

export function PomodoroTimer() {
  const rootRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<TomatoTimerScene | null>(null)

  const phase = usePomodoroStore((s) => s.phase)
  const status = usePomodoroStore((s) => s.status)

  const dial = useDialRotation()
  usePomodoro({
    onComplete: () => sceneRef.current?.pulse(),
  })

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Staggered entrance: gear, tomato, number, then controls cascade.
        const tl = gsap.timeline()
        // Opacity only: a transform would become the scrim's containing block.
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
        <MiniModeButton />
        <TimerSettings />
      </div>
      <div className="tomato-halo">
        <TimerCanvas config={dial} onSceneReady={(s) => (sceneRef.current = s)} />
      </div>
      <TimerDisplay />
      <TimerControls status={status} />
    </div>
  )
}
