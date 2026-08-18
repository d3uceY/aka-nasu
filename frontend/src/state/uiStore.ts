import { createStore, useStore } from '../lib/createStore.js'

export type UIMode = 'full' | 'mini'

export interface UIState {
  mode: UIMode
  introDone: boolean
}

// App-level UI state: window layout (full/mini) and whether the intro has played.
const base = createStore<UIState>(() => ({
  mode: 'full',
  introDone: false,
}))

export const uiStore = {
  ...base,
  setMode(mode: UIMode): void {
    base.set({ mode })
  },
  markIntroDone(): void {
    base.set({ introDone: true })
  },
}

export function useUIStore<T>(selector: (state: UIState) => T): T {
  return useStore(uiStore, selector)
}
