import { Browser } from '@wailsio/runtime'

// Opens a URL in the system browser. The Wails bridge handles this in the
// desktop app; plain-browser dev falls back to a new tab.
export function openExternal(url) {
  if (window.chrome?.webview?.postMessage || window.webkit?.messageHandlers?.['external']?.postMessage) {
    Browser.OpenURL(url).catch(() => window.open(url, '_blank', 'noopener'))
  } else {
    window.open(url, '_blank', 'noopener')
  }
}
