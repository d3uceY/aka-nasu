import { getAppVersion } from '../../../lib/backend.js'
import { checkForUpdate } from './github.js'
import { updateStore } from '../state/updateStore.js'

// Browser-preview override (?version=x) since a plain browser has no binding.
function versionFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get('version')
}

// On launch: fetch the latest release; show the modal if it's a stable update.
export async function runUpdateCheck(): Promise<void> {
  const version = (await getAppVersion()) || versionFromUrl()
  if (!version) return
  const release = await checkForUpdate(version)
  if (release) updateStore.setRelease(release)
}
