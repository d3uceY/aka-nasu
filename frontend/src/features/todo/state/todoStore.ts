import { createStore, useStore } from '../../../lib/createStore.js'
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
const base = createStore<{ todos: Todo[] }>(() => ({ todos: [] }))

// The bindings mark notes/active optional; normalize so components never
// have to guard against undefined.
function normalize(t: Todo): Todo {
  return { notes: '', active: false, ...t }
}

// The frontend owns the "one current task" rule. Every list that lands here is
// normalized, and the pin is repaired to point at an open (not done) task: a
// missing pin — or a stale pin left on a done task — goes to the newest open
// task, and when nothing is open nothing can be current. The backend is a dumb
// store — it only does what we tell it to.
function apply(list: Todo[]): void {
  let next = (Array.isArray(list) ? list : []).map(normalize)
  const open = next.filter((t) => !t.done)
  if (open.length === 0) {
    // No open task -> nothing can be current.
    next = next.map((t) => ({ ...t, active: false }))
  } else {
    const pinned = next.find((t) => t.active)
    if (!pinned || pinned.done) {
      const fallback = open[0] // newest open task
      next = next.map((t) => ({ ...t, active: t.id === fallback.id }))
    }
  }
  base.set({ todos: next })
}

// Optimistic update: apply the local change now, reconcile with the server's
// full list when it replies, and roll back to `prev` on failure.
// ponytail: single prev snapshot — if two ops fail out of order, the second
// rollback wins. Fine for a single-user local app; per-op snapshots if ever
// needed.
function mutate(optimistic: () => void, call: () => Promise<Todo[]>): void {
  const prev = base.getState().todos
  optimistic()
  call()
    .then(apply)
    .catch(() => {
      base.set({ todos: prev })
    })
}

// The list is newest-first; "next" means the first open todo at or after
// `fromIndex` (where the completed/removed task sat). Returns "" when there is
// no next — the caller keeps the current pin in that case.
function nextOpenAfter(list: Todo[], fromIndex: number): string {
  return list.slice(fromIndex).find((t) => !t.done)?.id ?? ''
}

// The list is newest-first; the topmost open (not done) todo is the first item
// of the "To-do" list — where the current pin moves when its task is done.
// Returns "" when nothing is open.
function topOfOpen(list: Todo[]): string {
  return list.find((t) => !t.done)?.id ?? ''
}

// The id the backend should pin after removing the current task: the next open
// todo at/after `fromIndex`, else the newest open task (or the newest if all
// are done), else "" when nothing is left to pin.
function nextActiveFor(list: Todo[], fromIndex: number): string {
  const next = nextOpenAfter(list, fromIndex)
  if (next) return next
  // Only done tasks remain -> nothing to pin (a done task is never current).
  return list.find((t) => !t.done)?.id ?? ''
}

export const todoStore = {
  getTodos: (): Todo[] => base.getState().todos,
  subscribe: base.subscribe,
  load(list: Todo[]): void {
    apply(list)
  },
  add(text: string): void {
    const value = text.trim()
    if (!value) return
    // The very first task is made current by the backend; later adds never steal
    // the pin. The backend owns ids/timestamps, so a new task can't be optimistic.
    addTodo(value, base.getState().todos.length === 0).then(apply).catch(() => {})
  },
  toggle(id: string): void {
    const todos = base.getState().todos
    const target = todos.find((t) => t.id === id)
    if (!target) return
    const becomingDone = !target.done
    // Completing the current task hands the pin to the top open todo — the
    // first item of the "To-do" list — so the pin never lands on a done task.
    // With no open task left there is nothing to pin, so the pin clears.
    const nextActive =
      becomingDone && target.active ? topOfOpen(todos.filter((t) => t.id !== id)) : ''
    mutate(
      () => {
        let next = todos.map((t) => (t.id === id ? { ...t, done: becomingDone } : t))
        if (becomingDone && target.active) {
          // Pin the next open task, or clear the pin when none is left.
          next = next.map((t) => ({ ...t, active: t.id === nextActive }))
        }
        base.set({ todos: next })
      },
      () => toggleTodo(id, nextActive),
    )
  },
  remove(id: string): void {
    const todos = base.getState().todos
    const indexBefore = todos.findIndex((t) => t.id === id)
    const wasActive = todos[indexBefore]?.active ?? false
    const remaining = todos.filter((t) => t.id !== id)
    // Removing the current task hands the pin to the next open one; with none
    // and tasks still left, the newest open (or newest) takes over; with
    // nothing left there's nothing to pin.
    const nextActive = wasActive ? nextActiveFor(remaining, indexBefore) : ''
    mutate(
      () => {
        let next = remaining
        if (nextActive) {
          next = next.map((t) => ({ ...t, active: t.id === nextActive }))
        }
        base.set({ todos: next })
      },
      () => removeTodo(id, nextActive),
    )
  },
  update(id: string, text: string, notes: string): void {
    mutate(
      () => {
        const todos = base.getState().todos.map((t) => (t.id === id ? { ...t, text, notes } : t))
        base.set({ todos })
      },
      () => updateTodo(id, text, notes),
    )
  },
  setActive(id: string): void {
    // Exactly one task is always active while tasks exist, so there is no
    // "unpin": tapping the current task is a no-op.
    if (base.getState().todos.find((t) => t.id === id)?.active) return
    mutate(
      () => {
        const todos = base.getState().todos.map((t) => ({ ...t, active: t.id === id }))
        base.set({ todos })
      },
      () => setActiveTodo(id),
    )
  },
}

export function useTodos(): Todo[] {
  return useStore(base, (s) => s.todos)
}
