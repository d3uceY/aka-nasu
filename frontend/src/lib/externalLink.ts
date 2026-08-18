import { Browser } from '@wailsio/runtime'
import { hasBridge } from './backend.js'

// Open a URL in the system browser; plain-browser dev falls back to a new tab.
export function openExternal(url: string): void {
  if (hasBridge()) {
    Browser.OpenURL(url).catch(() => window.open(url, '_blank', 'noopener'))
  } else {
    window.open(url, '_blank', 'noopener')
  }
}
