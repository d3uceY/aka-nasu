const REPO = 'd3uceY/aka-nasu'
const LATEST_RELEASE_URL = `https://api.github.com/repos/${REPO}/releases/latest`

// Tags carrying any of these markers are pre-releases. Never offer one.
const PRE_RELEASE_MARKERS = ['beta', 'alpha', 'test', 'rc', 'pre', 'dev']

// Fetches the latest published release. Returns null when the repo has no
// releases yet (the /releases/latest endpoint 404s) or GitHub is unreachable,
// so a network hiccup never surfaces an error in the UI.
export async function fetchLatestRelease() {
  try {
    const res = await fetch(LATEST_RELEASE_URL, {
      headers: { Accept: 'application/vnd.github+json' },
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      tag: data.tag_name ?? '',
      name: data.name ?? data.tag_name ?? '',
      url: data.html_url ?? '',
      notes: data.body ?? '',
    }
  } catch {
    return null
  }
}

// "v1.2.3" or "1.2.3" -> [1, 2, 3]; anything else -> null.
export function parseVersion(tag) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(String(tag).trim())
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

export function isStable(tag) {
  const lower = String(tag).toLowerCase()
  return !PRE_RELEASE_MARKERS.some((marker) => lower.includes(marker))
}

function isNewerThan(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] > b[i]
  }
  return false
}

// Decides whether the latest release is worth offering for the running
// version. Returns the release, or null when there's nothing to offer.
export async function checkForUpdate(currentVersion) {
  if (!currentVersion) return null
  const release = await fetchLatestRelease()
  if (!release || !isStable(release.tag)) return null
  const latest = parseVersion(release.tag)
  const current = parseVersion(currentVersion)
  if (!latest || !current || !isNewerThan(latest, current)) return null
  return release
}
