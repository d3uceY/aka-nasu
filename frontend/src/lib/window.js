import { Screens, Window } from '@wailsio/runtime'


// Thin wrapper over the Wails v3 window runtime for the mini-timer mode.
//
// Every call is guarded so the app still runs in a plain browser (Vite dev
// preview), where the Wails bridge is absent. The native calls are skipped
// and the UI layout still swaps, so the feature stays testable in the browser.

export const MAX_SIZE_FOR_MINI = { width: 264, height: 325 }
export const MINI_SIZE_FOR_FULL = { width: 600, height: 600 }

// Gap between the mini window and the screen edge.
const EDGE_MARGIN = 20

// The window geometry captured on entering mini mode, so leaving it restores
// the exact size and position the user had before.
let savedWindow = null

async function safe(fn) {
  try {
    return await fn()
  } catch (err) {
    console.warn('[window] operation skipped (no desktop runtime):', err)
    return undefined
  }
}

export async function enterMiniMode() {

  await safe(() => Window.Restore())
  savedWindow = {
    size: await safe(() => Window.Size()),
    position: await safe(() => Window.Position()),
  }


  const screen = await safe(() => Screens.GetCurrent())
  let x
  let y
  if (screen) {
    const wa = screen.WorkArea
    x = wa.X + wa.Width - MAX_SIZE_FOR_MINI.width - EDGE_MARGIN
    y = wa.Y + wa.Height - MAX_SIZE_FOR_MINI.height - EDGE_MARGIN
  }
  await safe(() => Window.SetMinSize(0, 0))
  await safe(() => Window.SetMaxSize(MAX_SIZE_FOR_MINI.width, MAX_SIZE_FOR_MINI.height))
  if (x != null) await safe(() => Window.SetPosition(x, y))
  await safe(() => Window.SetFrameless(true))
  await safe(() => Window.SetAlwaysOnTop(true))
}

export async function exitMiniMode() {
  await safe(() => Window.SetMaxSize(0, 0))
  await safe(() => Window.SetMinSize(MINI_SIZE_FOR_FULL.width, MINI_SIZE_FOR_FULL.height))
  await safe(() => Window.SetAlwaysOnTop(false))
  await safe(() => Window.SetFrameless(false))

  if (savedWindow?.size) {
    if (savedWindow.size.width <= MINI_SIZE_FOR_FULL.width || savedWindow.size.height <= MINI_SIZE_FOR_FULL.height) {
      await safe(() => Window.SetSize(MINI_SIZE_FOR_FULL.width, MINI_SIZE_FOR_FULL.height))
    }
    await safe(() => Window.SetSize(savedWindow.size.width, savedWindow.size.height))
  } else {
    await safe(() => Window.SetSize(MINI_SIZE_FOR_FULL.width, MINI_SIZE_FOR_FULL.height))
  }
  if (savedWindow?.position) {
    await safe(() => Window.SetPosition(savedWindow.position.x, savedWindow.position.y))
  }
  savedWindow = null
}
