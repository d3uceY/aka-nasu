import { useEffect } from 'react'
import { AppIntro } from './components/AppIntro.jsx'
import { PomodoroTimer } from './features/pomodoro/components/PomodoroTimer.jsx'
import { MiniTimer } from './features/pomodoro/components/MiniTimer.jsx'
import { TodoPanel } from './features/todo/components/TodoPanel.jsx'
import { UpdateModal } from './features/update/components/UpdateModal.jsx'
import { VersionBadge } from './components/ui/VersionBadge.jsx'
import { useUIStore } from './state/uiStore.js'
import { supportsTransparentMini } from './lib/window.js'
import { usePomodoroStore } from './features/pomodoro/state/pomodoroStore.js'
import { getPalette } from './features/pomodoro/constants/palettes.js'

export default function App() {
  const mode = useUIStore((s) => s.mode)
  const introDone = useUIStore((s) => s.introDone)
  const phase = usePomodoroStore((s) => s.phase)
  const paletteId = usePomodoroStore((s) => s.settings.palette)

  // The native window is transparent from creation; Mini Mode flips the page
  // background to transparent (skipped on Linux, where it's a no-op).
  useEffect(() => {
    const miniTransparent = mode === 'mini' && supportsTransparentMini
    document.body.classList.toggle('body--mini', miniTransparent)
    return () => document.body.classList.remove('body--mini')
  }, [mode])

  // Mirror the timer phase onto <body> so the phase accent (focus red,
  // short-break green, long-break gold) can wash the whole page background.
  useEffect(() => {
    document.body.dataset.phase = phase
    return () => {
      delete document.body.dataset.phase
    }
  }, [phase])

  // The selected palette re-tunes the whole focus atmosphere: the tomato
  // accent tokens drive --phase-accent (via var()), so swapping color
  // cross-fades the buttons, dots, sliders and glow in place. The break
  // phases still override to leaf / golden hour.
  useEffect(() => {
    const p = getPalette(paletteId)
    const root = document.documentElement
    root.style.setProperty('--tomato', p.accent)
    root.style.setProperty('--tomato-deep', p.accentDeep)
    root.style.setProperty('--tomato-wash', p.wash)
    root.style.setProperty('--tomato-glow', p.glow)
  }, [paletteId])

  return (
    <>
      <div className="app-shell" data-mode={mode}>
        {mode === 'mini' ? (
          <MiniTimer />
        ) : (
          <>
            <main className="app-main">
              <section className="timer-column">
                <PomodoroTimer />
              </section>
              <section className="content-column">
                <TodoPanel />
              </section>
            </main>
            <VersionBadge />
          </>
        )}
      </div>
      {mode === 'full' && !introDone && <AppIntro />}
      {mode === 'full' && introDone && <UpdateModal />}
    </>
  )
}
