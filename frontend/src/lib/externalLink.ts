import { Browser } from '@wailsio/runtime'

// Open a URL in the system browser; plain-browser dev falls back to a new tab.
export function openExternal(url: string): void {
  if (window.chrome?.webview?.postMessage || window.webkit?.messageHandlers?.['external']?.postMessage) {
    Browser.OpenURL(url).catch(() => window.open(url, '_blank', 'noopener'))
  } else {
    window.open(url, '_blank', 'noopener')
  }
}
