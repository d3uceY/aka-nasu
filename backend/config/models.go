// Package config holds the persisted application state and the JSON file store.
package config

// Config is the persisted app state.
type Config struct {
	Settings Settings `json:"settings"`
	Timer    TimerState `json:"timer"`
	// Todos is legacy: the checklist now lives in SQLite (backend/store).
	// Kept so a first launch after the switch can migrate it in, then it is
	// cleared.
	Todos []Todo `json:"todos"`
	// MigrateFromJson is true once the JSON todos have been copied to SQLite
	MigrateFromJson bool `json:"migrateFromJson"`
	Stats Stats       `json:"stats"`
}

// Settings are the timer durations, automation toggles, sound volume, and the
// selected tomato color palette.
type Settings struct {
	FocusMinutes      int     `json:"focusMinutes"`
	ShortBreakMinutes int     `json:"shortBreakMinutes"`
	LongBreakMinutes  int     `json:"longBreakMinutes"`
	LongBreakInterval int     `json:"longBreakInterval"`
	AutoStartBreaks   bool    `json:"autoStartBreaks"`
	AutoStartFocus    bool    `json:"autoStartFocus"`
	SoundVolume       float64 `json:"soundVolume"`
	Palette           string  `json:"palette"`
}

// TimerState is the live timer position.
type TimerState struct {
	Phase       string `json:"phase"`       // focus | shortBreak | longBreak
	Status      string `json:"status"`      // idle | running | paused | finished
	RemainingMs int64  `json:"remainingMs"`
	TotalMs     int64  `json:"totalMs"`
}

// Todo is a single daily checklist item, persisted in SQLite.
type Todo struct {
	ID        string `json:"id"`
	Text      string `json:"text"`
	Done      bool   `json:"done"`
	Notes     string `json:"notes,omitempty"`
	Active    bool   `json:"active,omitempty"`
	CreatedAt int64  `json:"createdAt"`
}

// Stats feed the daily report (pomodoros completed, round number).
type Stats struct {
	SessionsCompleted int   `json:"sessionsCompleted"`
	Round             int   `json:"round"`
	LastCompletedAt   int64 `json:"lastCompletedAt"`
}

// DefaultConfig is what a brand-new install starts with.
func DefaultConfig() Config {
	const focus = int64(25 * 60 * 1000)
	return Config{
		Settings: Settings{
			FocusMinutes:      25,
			ShortBreakMinutes: 5,
			LongBreakMinutes:  15,
			LongBreakInterval: 4,
			AutoStartBreaks:   true,
			AutoStartFocus:    false,
			SoundVolume:       0.8,
			Palette:           "classic",
		},
		Timer: TimerState{Phase: "focus", Status: "idle", RemainingMs: focus, TotalMs: focus},
		Todos: []Todo{},
		Stats: Stats{Round: 1},
	}
}
