import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { CSSProperties } from 'react'
import { TomatoMark } from './ui/TomatoMark.jsx'
import { TimerCanvas } from '../features/pomodoro/components/TimerCanvas.jsx'
import { useDialRotation } from '../features/pomodoro/hooks/useDialRotation.js'
import { uiStore } from '../state/uiStore.js'

gsap.registerPlugin(useGSAP)

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Opening beat: lockup + tomato arrive centre-screen, the tomato then flies
// to its resting seat in the app.
export function AppIntro() {
  const rootRef = useRef<HTMLDivElement>(null)
  const tomatoRef = useRef<HTMLDivElement>(null)

  const dial = useDialRotation()
  // The intro tomato is only for show; it's never draggable.
  const introDial = { ...dial, getInteractionEnabled: () => false }

  // Size the tomato to the viewport, never larger than the app halo.
  const [size] = useState(() =>
    Math.max(220, Math.min(window.innerWidth * 0.5, window.innerHeight * 0.5, 440)),
  )

  useGSAP(
    () => {
      const tomato = tomatoRef.current

      // Reduced motion: quick fade, no tomato/flight.
      if (reducedMotion()) {
        const root = rootRef.current
        if (!root) return
        const tl = gsap.timeline()
        tl.to(root, { autoAlpha: 0, duration: 0.35, ease: 'power2.out' }).add(() =>
          uiStore.markIntroDone(),
        )
        return () => tl.kill()
      }

      if (!tomato) return

      // The tomato's resting spot (full layout), measured at flight time.
      const measure = () => {
        const el = tomato.getBoundingClientRect()
        const halo = document.querySelector('.timer-column .tomato-halo')
        const target = halo?.getBoundingClientRect()
        if (!target) return { dx: 0, dy: 0, scale: 1 }
        return {
          dx: target.left + target.width / 2 - (el.left + el.width / 2),
          dy: target.top + target.height / 2 - (el.top + el.height / 2),
          scale: target.width / el.width,
        }
      }

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.intro__mark', { scale: 0, rotation: -140, autoAlpha: 0, duration: 1.0, ease: 'back.out(1.6)' }, 0.1)
        .from('.intro__wordmark', { y: 46, autoAlpha: 0, duration: 0.95, ease: 'power3.out' }, 0.38)
        .from('.intro__sub', { y: 18, autoAlpha: 0, duration: 0.7 }, 0.66)
        .from(tomato, { y: 70, scale: 0.7, autoAlpha: 0, duration: 1.25, ease: 'expo.out' }, 0.5)
        // The wordmark floats up and softens into blur as it leaves.
        .to('.intro__lockup', { y: -64, autoAlpha: 0, filter: 'blur(10px)', duration: 0.7, ease: 'power2.in' }, 1.5)
        // The tomato flies from centre to its seat, settling with a spring.
        .to(tomato, { x: () => measure().dx, y: () => measure().dy, scale: () => measure().scale * 1.03, duration: 1.05, ease: 'expo.inOut' }, 1.7)
        .to(tomato, { scale: () => measure().scale, duration: 0.45, ease: 'back.out(1.6)' }, 2.75)
        // The room fades in beneath; the tomato hands off cleanly.
        .to('.intro__backdrop', { autoAlpha: 0, duration: 0.85, ease: 'power2.inOut' }, 2.6)
        .to(tomato, { autoAlpha: 0, duration: 0.65, ease: 'power2.inOut' }, 2.75)
        .add(() => uiStore.markIntroDone(), 3.45)

      return () => tl.kill()
    },
    { scope: rootRef },
  )

  const introSizeStyle = { '--intro-size': `${size}px` } as CSSProperties

  if (reducedMotion()) {
    return (
      <div className="intro" ref={rootRef} aria-hidden="true">
        <div className="intro__backdrop" />
        <div className="intro__center">
          <div className="intro__lockup">
            <TomatoMark className="intro__mark" size={64} />
            <h1 className="intro__wordmark">
              Aka <em>Nasu</em>
            </h1>
            <p className="intro__sub">トマトの時計</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="intro" ref={rootRef} aria-hidden="true">
      <div className="intro__backdrop" />
      <div className="intro__center">
        <div className="intro__lockup">
          <TomatoMark className="intro__mark" size={64} />
          <h1 className="intro__wordmark">
            Aka <em>Nasu</em>
          </h1>
          <p className="intro__sub">トマトの時計</p>
        </div>
        <div className="intro__tomato" ref={tomatoRef} style={introSizeStyle}>
          <TimerCanvas config={introDial} />
        </div>
      </div>
    </div>
  )
}
