import { AppLayout } from './components/layout/AppLayout.jsx'
import { PomodoroTimer } from './features/pomodoro/components/PomodoroTimer.jsx'
import { TodoPanel } from './features/todo/components/TodoPanel.jsx'

export default function App() {
  return (
    <AppLayout>
      <section className="timer-column">
        <PomodoroTimer />
      </section>
      <section className="content-column">
        <TodoPanel />
      </section>
    </AppLayout>
  )
}
