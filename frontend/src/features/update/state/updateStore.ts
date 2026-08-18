import { createStore, useStore } from '../../../lib/createStore.js'
import type { ReleaseInfo, UpdateState } from '../types.js'

// Remember the dismissed release so the modal stops asking on later launches.
const DISMISS_KEY = 'aka-nasu:dismissed-update'

const base = createStore<UpdateState>(() => ({
  release: null, // latest stable release worth offering, or null
  visible: false,
}))

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
  ...base,
  // Back to the fresh-launch state (mainly for tests).
  reset(): void {
    base.reset()
  },
  // Called once per launch with the release the check found. Skips a release
  // the user already dismissed on an earlier launch.
  setRelease(release: ReleaseInfo): void {
    if (!release || readDismissed() === release.tag) return
    base.set({ release, visible: true })
  },
  // "Not now": remember this release so we stop asking about it.
  dismiss(): void {
    const release = base.getState().release
    if (release) writeDismissed(release.tag)
    base.set({ visible: false })
  },
  // Just close the modal for now; ask again next launch.
  close(): void {
    base.set({ visible: false })
  },
}

export function useUpdateStore<T>(selector: (state: UpdateState) => T): T {
  return useStore(updateStore, selector)
}
