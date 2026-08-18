// Shared update-feature constants, used by the modal and the settings notice.

// Where a newer build can be grabbed — the site's download section always
// serves the latest release for the user's OS.
export const DOWNLOAD_URL = 'https://d3ucey.github.io/aka-nasu/#download'

// "v1.2.3" -> "1.2.3" for display.
export function displayVersion(tag: string): string {
  return String(tag).replace(/^v/i, '')
}
