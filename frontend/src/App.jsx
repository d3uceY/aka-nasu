import { AppLayout } from './components/layout/AppLayout.jsx'
import { AppIntro } from './components/AppIntro.jsx'
import { PomodoroTimer } from './features/pomodoro/components/PomodoroTimer.jsx'
import { MiniTimer } from './features/pomodoro/components/MiniTimer.jsx'
import { TodoPanel } from './features/todo/components/TodoPanel.jsx'
import { UpdateModal } from './features/update/components/UpdateModal.jsx'
import { useUIStore } from './state/uiStore.js'

export default function App() {
  const mode = useUIStore((s) => s.mode)
  const introDone = useUIStore((s) => s.introDone)

  return (
    <>
      <div className="app-shell" data-mode={mode}>
        {mode === 'mini' ? (
          <MiniTimer />
        ) : (
          <AppLayout>
            <section className="timer-column">
              <PomodoroTimer />
            </section>
            <section className="content-column">
              <TodoPanel />
            </section>
          </AppLayout>
        )}
      </div>
      {mode === 'full' && !introDone && <AppIntro />}
      {mode === 'full' && introDone && <UpdateModal />}
    </>
  )
}
