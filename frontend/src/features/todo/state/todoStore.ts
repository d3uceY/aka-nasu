import { useSyncExternalStore } from 'react'
import { addTodo, toggleTodo, removeTodo } from '../../../lib/backend.js'
import type { Todo } from '../types.js'

// Backend owns the list; every mutation replaces local state with the returned list.
let todos: Todo[] = []
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function apply(list: Todo[]): void {
  todos = list
  emit()
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
    addTodo(value).then(apply).catch(() => {})
  },
  toggle(id: string): void {
    toggleTodo(id).then(apply).catch(() => {})
  },
  remove(id: string): void {
    removeTodo(id).then(apply).catch(() => {})
  },
}

export function useTodos(): Todo[] {
  return useSyncExternalStore(todoStore.subscribe, () => todoStore.getTodos())
}
