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

// Version is stamped into the binary at release via -ldflags "-X main.Version=vX.Y.Z".
var Version = "0.1.1"

//go:embed all:frontend/dist
var assets embed.FS

func main() {
// Load persisted config (creating defaults on first run); share the store across services.
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
			// Native OS notifications; best-effort and crash-proof (see backend/notify).
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
			// Fully clear so Mini Mode reveals the desktop around the rounded card.
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
			// Disable the native Aero shadow / rounded corners on frameless windows,
			// which would render as a black glow around the transparent mini card.
			DisableFramelessWindowDecorations: true,
		},
		URL: "/",
	})

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
