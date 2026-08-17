import { getAppVersion } from '../../../lib/backend.js'
import { checkForUpdate } from './github.js'
import { updateStore } from '../state/updateStore.js'

// Query-param override for browser preview. Desktop gets the real version
// from the Go binding, but a plain browser has no binding, so ?version=x
// lets you demo the update modal without building the app.
function versionFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('version')
}

// Runs on app launch. Fetches the latest GitHub release, compares it to the
// running version, and surfaces the modal when a stable update exists.
export async function runUpdateCheck(): Promise<void> {
  const version = (await getAppVersion()) || versionFromUrl()
  if (!version) return
  const release = await checkForUpdate(version)
  if (release) updateStore.setRelease(release)
}
