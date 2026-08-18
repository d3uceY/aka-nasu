package main

import (
	"embed"
	"log"

	"aka-nasu/backend/config"
	"aka-nasu/backend/notify"
	"aka-nasu/backend/settings"
	"aka-nasu/backend/stats"
	"aka-nasu/backend/timer"
	"aka-nasu/backend/todos"
	"aka-nasu/backend/version"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// Version is the current release of the app. It's exposed to the frontend
// through the version service bindings so the UI can check GitHub for newer
// releases and offer to download them.
//
// It's a var (not a const) so the release pipeline can stamp the tagged
// version into the binary with `-ldflags "-X main.Version=vX.Y.Z"`.
var Version = "0.1.1"

// Wails uses Go's `embed` package to embed the built frontend into the binary.
// See https://pkg.go.dev/embed for more information.

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Load the persisted config (creating the file with defaults on first run)
	// before anything else, then share the store across all services.
	store, err := config.NewStore()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	app := application.New(application.Options{
		Name:        "aka-nasu",
		Description: "A minimal 3D tomato focus timer.",
		Services: []application.Service{
			application.NewService(settings.NewService(store)),
			application.NewService(todos.NewService(store)),
			application.NewService(stats.NewService(store)),
			application.NewService(timer.NewService(store)),
			application.NewService(version.NewService(Version)),
			// Native OS notifications for phase completion. Best-effort and
			// crash-proof: sends are queued to a contained worker goroutine
			// (see backend/notify) so the toast library can never stall or
			// kill the app.
			application.NewService(notify.NewService()),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title: "Aka Nasu",
		// Window sized to the golden ratio (1000 / 618 ≈ 1.618).
		Width:  1000,
		Height: 618,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			// Fully clear (not frosted) so Mini Mode can reveal the desktop
			// around the rounded card. Normal Mode is unaffected: the page
			// paints an opaque background there.
			Backdrop: application.MacBackdropTransparent,
			TitleBar: application.MacTitleBarHiddenInset,
		},
		// The native window is created per-pixel transparent (DirectComposition
		// on Windows, RGBA visual on macOS / Linux GTK3) because Wails v3 has
		// no runtime API to toggle the background type after creation. Normal
		// Mode still looks opaque because the page background is opaque; Mini
		// Mode flips the page background to transparent from the frontend
		// instead of recreating the window.
		BackgroundType:   application.BackgroundTypeTransparent,
		BackgroundColour: application.NewRGBA(6, 7, 15, 0),
		Windows: application.WindowsWindow{
			// Mini Mode runs the window frameless + transparent. Wails extends
			// the DWM frame into the client area for frameless windows by
			// default, which draws the native "Aero shadow" (and Win11 rounded
			// corners) around the window — over a per-pixel transparent window
			// that renders as a black glow around the mini card. Disabling it
			// lets the card's own CSS border-radius define the shape. Only
			// affects the frameless state; normal (framed) mode is unchanged.
			DisableFramelessWindowDecorations: true,
		},
		URL: "/",
	})

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
