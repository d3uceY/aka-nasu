package main

import (
	"embed"
	"log"

	"aka-nasu/backend/config"
	"aka-nasu/backend/settings"
	"aka-nasu/backend/stats"
	"aka-nasu/backend/timer"
	"aka-nasu/backend/todos"

	"github.com/wailsapp/wails/v3/pkg/application"
)

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
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGB(6, 7, 15),
		URL:              "/",
	})

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
