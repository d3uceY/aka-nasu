import { useState } from 'react'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { todoStore, useTodos } from '../state/todoStore.js'

export function CheckListTab() {
  const todos = useTodos()
  const [draft, setDraft] = useState('')

  const open = todos.filter((t) => !t.done)
  const done = todos.filter((t) => t.done)

  function submit(e) {
    e.preventDefault()
    todoStore.add(draft)
    setDraft('')
  }

  return (
    <div className="checklist">
      <form className="checklist__add" onSubmit={submit}>
        <span className="checklist__add-icon" aria-hidden="true">
          ⊕
        </span>
        <Input
          aria-label="What are you going to do today?"
          placeholder="What are you going to do today?"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" variant="primary" size="sm" disabled={!draft.trim()}>
          Add
        </Button>
      </form>

      <section className="checklist__group">
        <h3 className="checklist__heading">To-do</h3>
        {open.length === 0 && (
          <p className="checklist__empty">Nothing here — add a task above 🍅</p>
        )}
        <ul className="todo-list">
          {open.map((t) => (
            <TodoRow key={t.id} todo={t} />
          ))}
        </ul>
      </section>

      {done.length > 0 && (
        <section className="checklist__group">
          <h3 className="checklist__heading">Done</h3>
          <ul className="todo-list">
            {done.map((t) => (
              <TodoRow key={t.id} todo={t} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function TodoRow({ todo }) {
  return (
    <li className={`todo-item ${todo.done ? 'todo-item--done' : ''}`}>
      <button
        type="button"
        className="todo-item__check"
        aria-label={todo.done ? 'Mark as not done' : 'Mark as done'}
        onClick={() => todoStore.toggle(todo.id)}
      >
        {todo.done ? '✓' : ''}
      </button>
      <span className="todo-item__text">{todo.text}</span>
      <button
        type="button"
        className="todo-item__remove"
        aria-label="Remove task"
        onClick={() => todoStore.remove(todo.id)}
      >
        —
      </button>
    </li>
  )
}
