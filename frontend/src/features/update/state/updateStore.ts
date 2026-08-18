import { useSyncExternalStore } from 'react'
import type { ReleaseInfo, UpdateState } from '../types.js'

// Remember the dismissed release so the modal stops asking on later launches.
const DISMISS_KEY = 'aka-nasu:dismissed-update'

let state: UpdateState = {
  release: null, // latest stable release worth offering, or null
  visible: false,
}
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

function set(next: Partial<UpdateState>): void {
  state = { ...state, ...next }
  emit()
}

function readDismissed(): string | null {
  try {
    return window.localStorage.getItem(DISMISS_KEY)
  } catch {
    return null
  }
}

function writeDismissed(tag: string): void {
  try {
    window.localStorage.setItem(DISMISS_KEY, tag)
  } catch {
    // Storage can be unavailable (private mode); the modal just reappears.
  }
}

export const updateStore = {
  getState: (): UpdateState => state,
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  // Back to the fresh-launch state (mainly for tests).
  reset(): void {
    set({ release: null, visible: false })
  },
  // Called once per launch with the release the check found. Skips a release
  // the user already dismissed on an earlier launch.
  setRelease(release: ReleaseInfo): void {
    if (!release || readDismissed() === release.tag) return
    set({ release, visible: true })
  },
  // "Not now": remember this release so we stop asking about it.
  dismiss(): void {
    if (state.release) writeDismissed(state.release.tag)
    set({ visible: false })
  },
  // Just close the modal for now; ask again next launch.
  close(): void {
    set({ visible: false })
  },
}

export function useUpdateStore<T>(selector: (state: UpdateState) => T): T {
  return useSyncExternalStore(updateStore.subscribe, () => selector(updateStore.getState()))
}
