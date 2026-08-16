import { useSyncExternalStore } from 'react'

// Where we remember which release the user already dismissed, so the modal
// stops asking about it on later launches.
const DISMISS_KEY = 'aka-nasu:dismissed-update'

let state = {
  release: null, // latest stable release worth offering, or null
  visible: false,
}
const listeners = new Set()

function emit() {
  for (const listener of listeners) listener()
}

function set(next) {
  state = { ...state, ...next }
  emit()
}

function readDismissed() {
  try {
    return window.localStorage.getItem(DISMISS_KEY)
  } catch {
    return null
  }
}

function writeDismissed(tag) {
  try {
    window.localStorage.setItem(DISMISS_KEY, tag)
  } catch {
    // Storage can be unavailable (private mode); the modal just reappears.
  }
}

export const updateStore = {
  getState: () => state,
  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  // Called once per launch with the release the check found. Skips a release
  // the user already dismissed on an earlier launch.
  setRelease(release) {
    if (!release || readDismissed() === release.tag) return
    set({ release, visible: true })
  },
  // "Not now": remember this release so we stop asking about it.
  dismiss() {
    if (state.release) writeDismissed(state.release.tag)
    set({ visible: false })
  },
  // Just close the modal for now; ask again next launch.
  close() {
    set({ visible: false })
  },
}

export function useUpdateStore(selector) {
  return useSyncExternalStore(updateStore.subscribe, () => selector(updateStore.getState()))
}
