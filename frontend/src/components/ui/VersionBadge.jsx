import { useEffect, useState } from 'react'
import { getAppVersion } from '../../lib/backend.js'

// A quiet version readout pinned to the bottom corner of the app. It asks the
// Go side for the build version once on mount, and renders nothing when
// there's no bridge (plain browser preview has no binding to ask).
export function VersionBadge() {
  const [version, setVersion] = useState(null)

  useEffect(() => {
    let alive = true
    getAppVersion()
      .then((v) => {
        if (alive) setVersion(v)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  if (!version) return null
  return <span className="version-badge">v{version}</span>
}
