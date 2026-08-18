import { useSyncExternalStore } from 'react'
import {
  addTodo,
  toggleTodo,
  removeTodo,
  updateTodo,
  setActiveTodo,
} from '../../../lib/backend.js'
import type { Todo } from '../types.js'

// Backend owns the list; every mutation is optimistic (applied locally now)
// and then reconciled with the authoritative list the backend returns.
let todos: Todo[] = []
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

// The bindings mark notes/active optional; normalize so components never
// have to guard against undefined.
function normalize(t: Todo): Todo {
  return { notes: '', active: false, ...t }
}

function apply(list: Todo[]): void {
  todos = list.map(normalize)
  emit()
}

// Optimistic update: apply the local change now, reconcile with the server's
// full list when it replies, and roll back to `prev` on failure.
// ponytail: single prev snapshot — if two ops fail out of order, the second
// rollback wins. Fine for a single-user local app; per-op snapshots if ever
// needed.
function mutate(optimistic: () => void, call: () => Promise<Todo[]>): void {
  const prev = todos
  optimistic()
  emit()
  call()
    .then(apply)
    .catch(() => {
      todos = prev
      emit()
    })
}

export const todoStore = {
  getTodos: (): Todo[] => todos,
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  load(list: Todo[]): void {
    apply(Array.isArray(list) ? list : [])
  },
  add(text: string): void {
    const value = text.trim()
    if (!value) return
    // The backend owns ids/timestamps, so a new task can't be optimistic.
    addTodo(value).then(apply).catch(() => {})
  },
  toggle(id: string): void {
    mutate(
      () => {
        todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
      },
      () => toggleTodo(id),
    )
  },
  remove(id: string): void {
    mutate(
      () => {
        todos = todos.filter((t) => t.id !== id)
      },
      () => removeTodo(id),
    )
  },
  update(id: string, text: string, notes: string): void {
    mutate(
      () => {
        todos = todos.map((t) => (t.id === id ? { ...t, text, notes } : t))
      },
      () => updateTodo(id, text, notes),
    )
  },
  setActive(id: string): void {
    // Clicking the current task clears the pin (backend: empty id = clear).
    const wasActive = todos.find((t) => t.id === id)?.active ?? false
    const next = wasActive ? '' : id
    mutate(
      () => {
        todos = todos.map((t) => ({ ...t, active: next !== '' && t.id === next }))
      },
      () => setActiveTodo(next),
    )
  },
}

export function useTodos(): Todo[] {
  return useSyncExternalStore(todoStore.subscribe, () => todoStore.getTodos())
}
