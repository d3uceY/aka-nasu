import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '../../../components/ui/Button.jsx'
import { Input } from '../../../components/ui/Input.jsx'
import { todoStore, useTodos } from '../state/todoStore.js'
import { playSound } from '../../../utils/audio.js'
import type { Todo } from '../types.js'

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8 2.5v11M2.5 8h11" />
    </svg>
  )
}

export function CheckListTab() {
  const todos = useTodos()
  const [draft, setDraft] = useState('')

  const open = todos.filter((t) => !t.done)
  const done = todos.filter((t) => t.done)

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    todoStore.add(draft)
    setDraft('')
    playSound('pop')
  }

  return (
    <div className="checklist">
      <form className="checklist__add" onSubmit={submit}>
        <span className="checklist__add-icon" aria-hidden="true">
          <PlusIcon />
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
        <div className="checklist__stack">
          <p
            className={`checklist__empty${open.length === 0 ? '' : ' is-collapsed'}`}
            aria-hidden={open.length > 0}
          >
            Nothing planted yet. Add a seed above.
          </p>
          <ul className="todo-list">
            {open.map((t) => (
              <TodoRow key={t.id} todo={t} />
            ))}
          </ul>
        </div>
      </section>

      <section className="checklist__group checklist__group--done">
        <h3 className="checklist__heading">Done</h3>
        <div className="checklist__stack">
          <p
            className={`checklist__empty checklist__done-empty${done.length === 0 ? '' : ' is-collapsed'}`}
            aria-hidden={done.length > 0}
          >
            Nothing harvested yet.
          </p>
          <ul className="todo-list">
            {done.map((t) => (
              <TodoRow key={t.id} todo={t} />
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

function TodoRow({ todo }: { todo: Todo }) {
  return (
    <li className={`todo-item ${todo.done ? 'todo-item--done' : ''}`}>
      <button
        type="button"
        className="todo-item__check"
        aria-label={todo.done ? 'Mark as not done' : 'Mark as done'}
        onClick={() => {
          if (!todo.done) playSound('ding')
          todoStore.toggle(todo.id)
        }}
      >
        ✓
      </button>
      <span className="todo-item__text">{todo.text}</span>
      <button
        type="button"
        className="todo-item__remove"
        aria-label="Remove task"
        onClick={() => {
          playSound('swish')
          todoStore.remove(todo.id)
        }}
      >
        ×
      </button>
    </li>
  )
}
