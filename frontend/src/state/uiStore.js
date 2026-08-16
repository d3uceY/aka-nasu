import { useSyncExternalStore } from 'react'

// App-level UI state: which window layout is showing and whether the intro
// brand animation has already played. The native window driver (resize,
// frameless, always-on-top) lives in lib/window.js. This store only tracks
// intent so components re-render when the layout swaps.
let state = {
  mode: 'full', // 'full' | 'mini'
  introDone: false,
}
const listeners = new Set()

function emit() {
  for (const listener of listeners) listener()
}

function set(next) {
  state = { ...state, ...next }
  emit()
}

export const uiStore = {
  getState: () => state,
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  setMode(mode) {
    set({ mode })
  },
  markIntroDone() {
    set({ introDone: true })
  },
}

export function useUIStore(selector) {
  return useSyncExternalStore(uiStore.subscribe, () => selector(uiStore.getState()))
}
