import { useTodos } from '../state/todoStore.js'
import { usePomodoroStore } from '../../pomodoro/state/pomodoroStore.js'

export function DailyReportTab() {
  const todos = useTodos()
  const done = todos.filter((t) => t.done)
  const sessionsCompleted = usePomodoroStore((s) => s.sessionsCompleted)

  return (
    <div className="report">
      <div className="report__stats">
        <div className="report__stat">
          <strong>{done.length}</strong>
          <span>tasks done</span>
        </div>
        <div className="report__stat">
          <strong>{sessionsCompleted}</strong>
          <span>pomodoros</span>
        </div>
      </div>
      <p className="report__line">
        {sessionsCompleted > 0
          ? `🍅 ${sessionsCompleted} tomato${sessionsCompleted > 1 ? 's' : ''} worth of focus today!`
          : 'No pomodoros finished yet — let one run!'}
      </p>
      {done.length > 0 && (
        <ul className="report__list">
          {done.map((t) => (
            <li key={t.id} className="report__item">
              ✓ {t.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
