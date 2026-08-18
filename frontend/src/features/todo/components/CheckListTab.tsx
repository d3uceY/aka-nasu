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

function PencilIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11.3 2.2l2.5 2.5L5.5 13l-3.2.7.7-3.2 8.3-8.3z" />
      <path d="M9.8 3.7l2.5 2.5" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 4.5h11" />
      <path d="M6 4.5V3h4v1.5" />
      <path d="M4 4.5l.6 8a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9l.6-8" />
    </svg>
  )
}

export function CheckListTab() {
  const todos = useTodos()
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const active = todos.find((t) => t.active)
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
      {/* Always-rendered slot so the card never jumps; swaps hint <-> task. */}
      <div className="todo-active" aria-live="polite">
        {active ? (
          <>
            <span className="todo-active__label">Now working on</span>
            <button
              type="button"
              className="todo-active__text"
              title="Clear the current task"
              onClick={() => {
                playSound('pop')
                todoStore.setActive(active.id)
              }}
            >
              {active.text}
            </button>
          </>
        ) : (
          <span className="todo-active__hint">Tap a task to make it current</span>
        )}
      </div>

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
              <TodoRow
                key={t.id}
                todo={t}
                editing={editingId === t.id}
                onEdit={() => setEditingId(t.id)}
                onEndEdit={() => setEditingId(null)}
              />
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
              <TodoRow
                key={t.id}
                todo={t}
                editing={editingId === t.id}
                onEdit={() => setEditingId(t.id)}
                onEndEdit={() => setEditingId(null)}
              />
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}

function TodoRow({
  todo,
  editing,
  onEdit,
  onEndEdit,
}: {
  todo: Todo
  editing: boolean
  onEdit: () => void
  onEndEdit: () => void
}) {
  const cls = ['todo-item', todo.done ? 'todo-item--done' : '', todo.active ? 'todo-item--active' : '']
    .filter(Boolean)
    .join(' ')

  if (editing) {
    return (
      <li className={cls}>
        <TodoEditForm todo={todo} onDone={onEndEdit} />
      </li>
    )
  }

  return (
    <li className={cls}>
      <div className="todo-item__main">
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
        {todo.done ? (
          <span className="todo-item__text">{todo.text}</span>
        ) : (
          <button
            type="button"
            className="todo-item__text"
            aria-label={`Make current: ${todo.text}`}
            onClick={() => {
              playSound('pop')
              todoStore.setActive(todo.id)
            }}
          >
            {todo.text}
          </button>
        )}
        <button
          type="button"
          className="todo-item__edit"
          aria-label="Edit task"
          onClick={() => {
            playSound('pop')
            onEdit()
          }}
        >
          <PencilIcon />
        </button>
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
      </div>
      {todo.notes && <p className="todo-item__notes">{todo.notes}</p>}
    </li>
  )
}

function TodoEditForm({ todo, onDone }: { todo: Todo; onDone: () => void }) {
  const [text, setText] = useState(todo.text)
  const [notes, setNotes] = useState(todo.notes ?? '')

  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = text.trim()
    if (value) {
      todoStore.update(todo.id, value, notes.trim())
      playSound('pop')
    }
    onDone()
  }

  return (
    <form className="todo-edit" onSubmit={save}>
      <Input
        aria-label="Task text"
        placeholder="What needs doing?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
      />
      <textarea
        className="todo-edit__notes"
        aria-label="Notes"
        placeholder="Notes for this task…"
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="todo-edit__actions">
        <button
          type="button"
          className="todo-edit__trash"
          aria-label="Delete task"
          title="Delete task"
          onClick={() => {
            playSound('swish')
            todoStore.remove(todo.id)
            onDone()
          }}
        >
          <TrashIcon />
        </button>
        <span className="todo-edit__spacer" aria-hidden="true" />
        <button type="button" className="todo-edit__cancel" onClick={onDone}>
          Cancel
        </button>
        <Button type="submit" variant="primary" size="sm" disabled={!text.trim()}>
          Save
        </Button>
      </div>
    </form>
  )
}
