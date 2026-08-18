import { Screens, System, Window } from '@wailsio/runtime'

// Wails window runtime for Mini Mode; every call is guarded so it also works in a plain browser.

// Transparent window = Windows + macOS only; the GTK4 Linux build no-ops it,
// so the mini card keeps its opaque background there.
export const supportsTransparentMini = !System.IsLinux()

export const MAX_SIZE_FOR_MINI = { width: 264, height: 325 }
export const MINI_SIZE_FOR_FULL = { width: 600, height: 600 }

// Gap between the mini window and the screen edge.
const EDGE_MARGIN = 20

interface SavedWindow {
  size: { width: number; height: number } | undefined
  position: { x: number; y: number } | undefined
}

// Window geometry captured on entering mini, restored on exit.
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
