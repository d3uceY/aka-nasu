// Ambient types for the Wails bridge globals; feature-detected at runtime.

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
