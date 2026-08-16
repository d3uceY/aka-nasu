import { useSyncExternalStore } from 'react'
import { addTodo, toggleTodo, removeTodo } from '../../../lib/backend.js'

// The backend owns the list; every mutation replaces local state with the
// returned list so the store always mirrors the config file.
let todos = []
const listeners = new Set()

function emit() {
  for (const listener of listeners) listener()
}

export const todoStore = {
  getTodos: () => todos,
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  load(list) {
    todos = Array.isArray(list) ? list : []
    emit()
  },
  add(text) {
    const value = text.trim()
    if (!value) return
    addTodo(value)
      .then((list) => {
        todos = list
        emit()
      })
      .catch(() => {})
  },
  toggle(id) {
    toggleTodo(id)
      .then((list) => {
        todos = list
        emit()
      })
      .catch(() => {})
  },
  remove(id) {
    removeTodo(id)
      .then((list) => {
        todos = list
        emit()
      })
      .catch(() => {})
  },
}

export function useTodos() {
  return useSyncExternalStore(todoStore.subscribe, () => todoStore.getTodos())
}
