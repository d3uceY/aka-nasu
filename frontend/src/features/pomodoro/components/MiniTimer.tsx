import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { CSSProperties } from 'react'
import { TomatoMark } from '../../../components/ui/TomatoMark.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { playSound } from '../../../utils/audio.js'
import { exitMiniMode } from '../../../lib/window.js'
import { uiStore } from '../../../state/uiStore.js'
import { usePomodoro } from '../hooks/usePomodoro.js'
import { useDialRotation } from '../hooks/useDialRotation.js'
import { usePomodoroStore, pomodoroActions } from '../state/pomodoroStore.js'
import { PHASE_LABELS } from '../constants/timer.js'
import { formatTime } from '../utils/formatTime.js'
import { dialSpun } from '../utils/dialSpun.js'
import { TimeSlots } from './TimerDisplay.jsx'
import { TimerCanvas } from './TimerCanvas.jsx'
import type { TomatoTimerScene } from '../three/TomatoTimerScene.js'

gsap.registerPlugin(useGSAP)

const DRAG_STYLE = { '--wails-draggable': 'drag' } as CSSProperties
const NO_DRAG_STYLE = { '--wails-draggable': 'no-drag' } as CSSProperties

function ExpandIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M16 3h3a2 2 0 0 1 2 2v3" />
      <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v4h4" />
    </svg>
  )
}

function SkipIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 6l9 6-9 6V6z" fill="currentColor" stroke="none" />
      <path d="M19 6v12" />
    </svg>
  )
}

// Compact always-on-top timer: frameless drag rail plus start/pause, reset,
// skip, and the tomato to wind the focus length.
export function MiniTimer() {
  const rootRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<TomatoTimerScene | null>(null)

  const phase = usePomodoroStore((s) => s.phase)
  const status = usePomodoroStore((s) => s.status)
  const remainingMs = usePomodoroStore((s) => s.remainingMs)
  const dial = useDialRotation()
  usePomodoro({ onComplete: () => sceneRef.current?.pulse() })

  const running = status === 'running'

  useGSAP(
    () => {
      const root = rootRef.current
      if (!root) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline()
          .from(root, { y: 18, scale: 0.94, autoAlpha: 0, duration: 0.5, ease: 'expo.out' })
          .from('.mini-window__bar', { y: -8, autoAlpha: 0, duration: 0.4, ease: 'power3.out' }, '-=0.25')
          .from('.mini-window__time', { y: 10, autoAlpha: 0, duration: 0.4, ease: 'expo.out' }, '-=0.2')
          .from(
            '.mini-window__controls .btn',
            { y: 12, autoAlpha: 0, duration: 0.4, ease: 'back.out(1.7)', stagger: 0.06 },
            '-=0.25',
          )
      })
      return () => mm.revert()
    },
    { scope: rootRef },
  )

  function handleExit() {
    playSound('gearClick')
    const shell = document.querySelector('.app-shell')
    shell?.classList.add('app-shell--switching')
    exitMiniMode().finally(() => {
      uiStore.setMode('full')
      requestAnimationFrame(() => shell?.classList.remove('app-shell--switching'))
    })
  }

  function handleTransport() {
    // Only sound off if the dial actually travels: pause/resume freeze the
    // dial, and a fresh idle start parks it where it already is.
    if (dialSpun(() => (running ? pomodoroActions.pause() : pomodoroActions.start()))) {
      playSound('gearClick')
    }
  }

  function handleSkip() {
    if (dialSpun(() => pomodoroActions.skip())) playSound('resetSpring')
  }

  return (
    <div className="mini-window" ref={rootRef} data-phase={phase} data-status={status}>
      <header
        className="mini-window__bar"
        style={DRAG_STYLE}
        aria-label="Drag to move"
      >
        <span className="mini-window__brand" style={NO_DRAG_STYLE}>
          <TomatoMark size={16} />
          <span className="mini-window__phase">{PHASE_LABELS[phase]}</span>
        </span>
        <button
          type="button"
          className="mini-window__exit"
          style={NO_DRAG_STYLE}
          onClick={handleExit}
          aria-label="Expand window"
          title="Expand"
        >
          <ExpandIcon />
        </button>
      </header>
      <div className="mini-window__body">
        <div className="mini-window__tomato">
          <TimerCanvas config={dial} onSceneReady={(s) => (sceneRef.current = s)} />
        </div>
        <time className="mini-window__time" aria-label={formatTime(remainingMs)}>
          <TimeSlots text={formatTime(remainingMs)} />
        </time>
        <div className="mini-window__controls">
          <Button
            variant="ghost"
            size="sm"
            className="mini-window__ctl"
            onClick={() => {
              playSound('resetSpring')
              pomodoroActions.reset()
            }}
            disabled={status === 'idle'}
            aria-label="Reset timer"
            title="Reset"
          >
            <ResetIcon />
          </Button>
          <Button variant="primary" className="mini-window__start" onClick={handleTransport}>
            {running ? 'Pause' : 'Start'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="mini-window__ctl"
            onClick={handleSkip}
            aria-label="Skip phase"
            title="Skip"
          >
            <SkipIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}
