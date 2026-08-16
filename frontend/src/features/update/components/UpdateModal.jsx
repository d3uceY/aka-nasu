import { Button } from '../../../components/ui/Button.jsx'
import { TomatoMark } from '../../../components/ui/TomatoMark.jsx'
import { openExternal } from '../../../lib/externalLink.js'
import { useUpdateStore } from '../state/updateStore.js'

// Where the README explains how to install a build.
const INSTALL_GUIDE_URL = 'https://github.com/d3uceY/aka-nasu#download'

function displayVersion(tag) {
  return String(tag).replace(/^v/i, '')
}

// A paper card over a soft scrim, asking whether the user wants the newer
// release. Rendered only in full mode after the intro has played.
export function UpdateModal() {
  const release = useUpdateStore((s) => s.release)
  const visible = useUpdateStore((s) => s.visible)
  const dismiss = useUpdateStore((s) => s.dismiss)
  const close = useUpdateStore((s) => s.close)

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
          A newer build is out. Grab it from the release page, or follow the install guide in the
          README.
        </p>
        <div className="update-modal__actions">
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              openExternal(release.url)
              dismiss()
            }}
          >
            Get {version}
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              openExternal(INSTALL_GUIDE_URL)
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
