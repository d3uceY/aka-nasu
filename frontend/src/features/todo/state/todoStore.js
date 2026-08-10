import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'tomato-clock.todos.v1'

function uid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    /* ignore corrupted storage */
  }
  return []
}

let todos = load()
const listeners = new Set()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  } catch {
    /* storage unavailable */
  }
}

function emit() {
  for (const listener of listeners) listener()
}

export const todoStore = {
  getTodos: () => todos,
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  add(text) {
    const value = text.trim()
    if (!value) return
    todos = [{ id: uid(), text: value, done: false, createdAt: Date.now() }, ...todos]
    persist()
    emit()
  },
  toggle(id) {
    todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    persist()
    emit()
  },
  remove(id) {
    todos = todos.filter((t) => t.id !== id)
    persist()
    emit()
  },
}

export function useTodos() {
  return useSyncExternalStore(todoStore.subscribe, () => todoStore.getTodos())
}
