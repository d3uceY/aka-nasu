import { Screens, System, Window } from '@wailsio/runtime'

// Thin wrapper over the Wails v3 window runtime for the mini-timer mode.
//
// Every call is guarded so the app still runs in a plain browser (Vite dev
// preview), where the Wails bridge is absent. The native calls are skipped
// and the UI layout still swaps, so the feature stays testable in the browser.

// Wails v3 (beta.6) only supports per-pixel transparency as a window-creation
// option (`BackgroundType: BackgroundTypeTransparent`) — there is no runtime
// setter, so the native window is created transparent and Mini Mode just flips
// the page background (see App.tsx / globals.css).
//
// Native transparency is Windows + macOS only. Linux is excluded: the default
// GTK4 build no-ops `BackgroundTypeTransparent` (and Linux transparency needs a
// compositing WM even on GTK3), so on Linux the mini card keeps its opaque
// background as a graceful fallback instead of revealing the desktop.
export const supportsTransparentMini = !System.IsLinux()

export const MAX_SIZE_FOR_MINI = { width: 264, height: 325 }
export const MINI_SIZE_FOR_FULL = { width: 600, height: 600 }

// Gap between the mini window and the screen edge.
const EDGE_MARGIN = 20

interface SavedWindow {
  size: { width: number; height: number } | undefined
  position: { x: number; y: number } | undefined
}

// The window geometry captured on entering mini mode, so leaving it restores
// the exact size and position the user had before.
let savedWindow: SavedWindow | null = null

async function safe<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn()
  } catch (err) {
    console.warn('[window] operation skipped (no desktop runtime):', err)
    return undefined
  }
}

export async function enterMiniMode(): Promise<void> {
  await safe(() => Window.Restore())
  savedWindow = {
    size: await safe(() => Window.Size()),
    position: await safe(() => Window.Position()),
  }

  const screen = await safe(() => Screens.GetCurrent())
  let x: number | undefined
  let y: number | undefined
  if (screen) {
    const wa = screen.WorkArea
    x = wa.X + wa.Width - MAX_SIZE_FOR_MINI.width - EDGE_MARGIN
    y = wa.Y + wa.Height - MAX_SIZE_FOR_MINI.height - EDGE_MARGIN
  }
  await safe(() => Window.SetMinSize(0, 0))
  await safe(() => Window.SetMaxSize(MAX_SIZE_FOR_MINI.width, MAX_SIZE_FOR_MINI.height))
  if (x != null && y != null) await safe(() => Window.SetPosition(x, y))
  await safe(() => Window.SetFrameless(true))
  await safe(() => Window.SetAlwaysOnTop(true))
}

export async function exitMiniMode(): Promise<void> {
  await safe(() => Window.SetMaxSize(0, 0))
  await safe(() => Window.SetMinSize(MINI_SIZE_FOR_FULL.width, MINI_SIZE_FOR_FULL.height))
  await safe(() => Window.SetAlwaysOnTop(false))
  await safe(() => Window.SetFrameless(false))

  // Capture into locals so narrowing survives the closures passed to safe().
  const saved = savedWindow
  const size = saved?.size
  const position = saved?.position
  if (size) {
    if (size.width <= MINI_SIZE_FOR_FULL.width || size.height <= MINI_SIZE_FOR_FULL.height) {
      await safe(() => Window.SetSize(MINI_SIZE_FOR_FULL.width, MINI_SIZE_FOR_FULL.height))
    }
    await safe(() => Window.SetSize(size.width, size.height))
  } else {
    await safe(() => Window.SetSize(MINI_SIZE_FOR_FULL.width, MINI_SIZE_FOR_FULL.height))
  }
  if (position) {
    await safe(() => Window.SetPosition(position.x, position.y))
  }
  savedWindow = null
}
