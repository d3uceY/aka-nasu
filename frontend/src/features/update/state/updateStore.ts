import { createStore, useStore } from '../../../lib/createStore.js'
import type { ReleaseInfo, UpdateState } from '../types.js'

// Each release gets its own dismissal key so a newer update always re-prompts;
// only the same tag stays suppressed after the user dismisses it. Dismissing a
// new release prunes the older tags so localStorage doesn't accumulate them.
const DISMISS_KEY_PREFIX = 'aka-nasu:dismissed-update'

const base = createStore<UpdateState>(() => ({
  release: null, // latest stable release worth offering, or null
  visible: false,
}))

function dismissedKey(tag: string): string {
  return `${DISMISS_KEY_PREFIX}:${tag}`
}

function readDismissed(tag: string): boolean {
  try {
    return window.localStorage.getItem(dismissedKey(tag)) !== null
  } catch {
    return false
  }
}

// Forget every dismissed release except the one just dismissed, so old tags
// don't pile up in localStorage.
function pruneDismissed(keepTag: string): void {
  try {
    const keep = dismissedKey(keepTag)
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const key = window.localStorage.key(i)
      if (key && key.startsWith(`${DISMISS_KEY_PREFIX}:`) && key !== keep) {
        window.localStorage.removeItem(key)
      }
    }
  } catch {
    // Storage can be unavailable (private mode); just skip cleanup.
  }
}

function writeDismissed(tag: string): void {
  try {
    window.localStorage.setItem(dismissedKey(tag), '1')
    pruneDismissed(tag)
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
  // Called once per launch with the release the check found. The release is
  // always remembered so settings can flag the update, but the modal only
  // pops when this version hasn't already been dismissed.
  setRelease(release: ReleaseInfo): void {
    if (!release) return
    base.set({ release, visible: !readDismissed(release.tag) })
  },
  // "Not now": stop auto-popping this release, but keep it flagged in settings.
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
