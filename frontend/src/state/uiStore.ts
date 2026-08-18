import { useSyncExternalStore } from 'react'

export type UIMode = 'full' | 'mini'

export interface UIState {
  mode: UIMode
  introDone: boolean
}

// App-level UI state: window layout (full/mini) and whether the intro has played.
let state: UIState = {
  mode: 'full',
  introDone: false,
}
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function set(next: Partial<UIState>): void {
  state = { ...state, ...next }
  emit()
}

export const uiStore = {
  getState: (): UIState => state,
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  setMode(mode: UIMode): void {
    set({ mode })
  },
  markIntroDone(): void {
    set({ introDone: true })
  },
}

export function useUIStore<T>(selector: (state: UIState) => T): T {
  return useSyncExternalStore(uiStore.subscribe, () => selector(uiStore.getState()))
}
