import { useTodos } from '../state/todoStore.js'
import { usePomodoroStore } from '../../pomodoro/state/pomodoroStore.js'
import { TomatoMark } from '../../../components/ui/TomatoMark.jsx'

export function DailyReportTab() {
  const todos = useTodos()
  const done = todos.filter((t) => t.done)
  const sessionsCompleted = usePomodoroStore((s) => s.sessionsCompleted)

  return (
    <div className="report">
      <div className="report__stats">
        <div className="report__stat report__stat--tasks">
          <strong>{done.length}</strong>
          <span>tasks done</span>
        </div>
        <div className="report__stat report__stat--focus">
          <strong>{sessionsCompleted}</strong>
          <span>pomodoros</span>
        </div>
      </div>
      <p className="report__line">
        {sessionsCompleted > 0 ? (
          <>
            <span className="report__tomato" aria-hidden="true">
              <TomatoMark size={18} />
            </span>
            {sessionsCompleted} {sessionsCompleted > 1 ? 'tomatoes' : 'tomato'} of focus today —
            lovely and ripe.
          </>
        ) : (
          'Nothing ripe yet — let a focus run finish.'
        )}
      </p>
      {done.length > 0 && (
        <ul className="report__list">
          {done.map((t) => (
            <li key={t.id} className="report__item">
              {t.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
