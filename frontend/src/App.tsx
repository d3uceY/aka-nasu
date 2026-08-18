import { useEffect } from 'react'
import { AppIntro } from './components/AppIntro.jsx'
import { PomodoroTimer } from './features/pomodoro/components/PomodoroTimer.jsx'
import { MiniTimer } from './features/pomodoro/components/MiniTimer.jsx'
import { TodoPanel } from './features/todo/components/TodoPanel.jsx'
import { UpdateModal } from './features/update/components/UpdateModal.jsx'
import { VersionBadge } from './components/ui/VersionBadge.jsx'
import { useUIStore } from './state/uiStore.js'
import { supportsTransparentMini } from './lib/window.js'

export default function App() {
  const mode = useUIStore((s) => s.mode)
  const introDone = useUIStore((s) => s.introDone)

  // The native window is transparent from creation; Mini Mode flips the page
  // background to transparent (skipped on Linux, where it's a no-op).
  useEffect(() => {
    const miniTransparent = mode === 'mini' && supportsTransparentMini
    document.body.classList.toggle('body--mini', miniTransparent)
    return () => document.body.classList.remove('body--mini')
  }, [mode])

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
