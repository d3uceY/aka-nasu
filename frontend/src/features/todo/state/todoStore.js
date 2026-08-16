import { useSyncExternalStore } from 'react'
import { addTodo, toggleTodo, removeTodo } from '../../../lib/backend.js'

// The backend owns the list; every mutation replaces local state with the
// returned list so the store always mirrors the config file.
let todos = []
const listeners = new Set()

function emit() {
  for (const listener of listeners) listener()
}

function apply(list) {
  todos = list
  emit()
}

export const todoStore = {
  getTodos: () => todos,
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  load(list) {
    apply(Array.isArray(list) ? list : [])
  },
  add(text) {
    const value = text.trim()
    if (!value) return
    addTodo(value).then(apply).catch(() => {})
  },
  toggle(id) {
    toggleTodo(id).then(apply).catch(() => {})
  },
  remove(id) {
    removeTodo(id).then(apply).catch(() => {})
  },
}

export function useTodos() {
  return useSyncExternalStore(todoStore.subscribe, () => todoStore.getTodos())
}
