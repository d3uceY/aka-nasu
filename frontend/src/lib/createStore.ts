import { useSyncExternalStore } from 'react'

// Minimal external store: one value, a Set of listeners, and a shallow-merge
// set. The four app stores (ui, pomodoro, todo, update) share this skeleton.
export interface Store<T> {
  getState: () => T
  subscribe: (listener: () => void) => () => void
}

export interface WritableStore<T> extends Store<T> {
  set: (next: Partial<T>) => void
  reset: () => void
}

export function createStore<T extends object>(init: () => T): WritableStore<T> {
  let state = init()
  const listeners = new Set<() => void>()

  return {
    getState: () => state,
    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    set(next: Partial<T>): void {
      state = { ...state, ...next }
      for (const listener of listeners) listener()
    },
    reset(): void {
      state = init()
      for (const listener of listeners) listener()
    },
  }
}

export function useStore<T, S>(store: Store<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(store.subscribe, () => selector(store.getState()))
}
