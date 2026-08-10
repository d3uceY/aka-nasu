import { AppLayout } from './components/layout/AppLayout.jsx'
import { PomodoroTimer } from './features/pomodoro/index.js'
import { TodoPanel } from './features/todo/index.js'

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
