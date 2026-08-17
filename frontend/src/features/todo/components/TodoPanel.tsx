import { useState } from 'react'
import { CheckListTab } from './CheckListTab.jsx'
import { DailyReportTab } from './DailyReportTab.jsx'

type TabId = 'checklist' | 'report'

const TABS: { id: TabId; label: string }[] = [
  { id: 'checklist', label: 'Check list' },
  { id: 'report', label: 'Daily report' },
]

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export function TodoPanel() {
  const [tab, setTab] = useState<TabId>('checklist')

  return (
    <div className="todo-card">
      <div className="todo-card__head">
        <h2 className="todo-card__title">Today</h2>
        <span className="todo-card__date">{todayLabel()}</span>
      </div>
      <div className="todo-tabs" role="tablist" aria-label="Plan tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            className={`todo-tab ${tab === t.id ? 'todo-tab--active' : ''}`}
            onClick={() => {
              setTab(t.id)
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="todo-tab__content">
        {tab === 'checklist' ? <CheckListTab /> : <DailyReportTab />}
      </div>
    </div>
  )
}
