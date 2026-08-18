import { useEffect } from 'react'
import { AppLayout } from './components/layout/AppLayout.jsx'
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

  // The native window is per-pixel transparent from creation (see main.go).
  // Normal Mode stays opaque because the page paints an opaque background; in
  // Mini Mode we flip `html/body/#root` to transparent so the desktop shows
  // through the rounded card's corners. Skipped on Linux, where native window
  // transparency is a no-op and the card keeps its opaque background instead.
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
            <AppLayout>
              <section className="timer-column">
                <PomodoroTimer />
              </section>
              <section className="content-column">
                <TodoPanel />
              </section>
            </AppLayout>
            <VersionBadge />
          </>
        )}
      </div>
      {mode === 'full' && !introDone && <AppIntro />}
      {mode === 'full' && introDone && <UpdateModal />}
    </>
  )
}
