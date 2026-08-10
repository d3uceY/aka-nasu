import { useState } from 'react'
import { CheckListTab } from './CheckListTab.jsx'
import { DailyReportTab } from './DailyReportTab.jsx'

const TABS = [
  { id: 'checklist', label: 'Check list' },
  { id: 'report', label: 'Daily report' },
]

export function TodoPanel() {
  const [tab, setTab] = useState('checklist')

  return (
    <div className="todo-card">
      <div className="todo-tabs" role="tablist" aria-label="Plan tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            className={`todo-tab ${tab === t.id ? 'todo-tab--active' : ''}`}
            onClick={() => setTab(t.id)}
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
