// Ambient declarations for the non-standard globals the Wails bridge uses.
// In a plain browser these are all undefined; hasBridge() in lib/backend.ts
// and openExternal() in lib/externalLink.ts feature-detect them at runtime.

declare global {
  interface Window {
    chrome?: { webview?: { postMessage?: (message: unknown) => void } }
    webkit?: {
      messageHandlers?: Record<string, { postMessage?: (message: unknown) => void }>
    }
    wails?: { invoke?: (...args: unknown[]) => Promise<unknown> }
  }
}

export {}
