import { Button } from '../../../components/ui/Button.jsx'
import { TomatoMark } from '../../../components/ui/TomatoMark.jsx'
import { openExternal } from '../../../lib/externalLink.js'
import { updateStore, useUpdateStore } from '../state/updateStore.js'

// Where a newer build can be grabbed — the site's download section always
// serves the latest release for the user's OS.
const DOWNLOAD_URL = 'https://d3ucey.github.io/aka-nasu/#download'

function displayVersion(tag: string): string {
  return String(tag).replace(/^v/i, '')
}

// Card over a scrim asking if the user wants the newer release (full mode only).
export function UpdateModal() {
  const release = useUpdateStore((s) => s.release)
  const visible = useUpdateStore((s) => s.visible)
  // Call store methods directly; reading them via the selector would be undefined.
  const dismiss = () => updateStore.dismiss()
  const close = () => updateStore.close()

  if (!visible || !release) return null

  const version = displayVersion(release.tag)

  return (
    <div className="update-modal" role="dialog" aria-modal="true" aria-labelledby="update-modal-title">
      <div className="update-modal__card">
        <div className="update-modal__mark" aria-hidden="true">
          <TomatoMark size={44} />
        </div>
        <p className="update-modal__eyebrow">New version available</p>
        <h2 id="update-modal-title" className="update-modal__title">
          {version}
        </h2>
        <p className="update-modal__body">
          A newer build is out. Grab the latest for your OS.
        </p>
        <div className="update-modal__actions">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              openExternal(DOWNLOAD_URL)
              dismiss()
            }}
          >
            Get {version}
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              openExternal(DOWNLOAD_URL)
              close()
            }}
          >
            Install guide
          </Button>
        </div>
        <button type="button" className="update-modal__later" onClick={dismiss}>
          Not now
        </button>
      </div>
    </div>
  )
}
