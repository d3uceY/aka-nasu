package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestStoreCreatesAndPersists(t *testing.T) {
	path := filepath.Join(t.TempDir(), "config.json")

	s, err := newStore(path)
	if err != nil {
		t.Fatal(err)
	}
	// First run creates the file with defaults.
	if _, err := os.Stat(path); err != nil {
		t.Fatalf("config file not created: %v", err)
	}
	if got := s.Snapshot().Settings.FocusMinutes; got != 25 {
		t.Fatalf("default settings not loaded, focusMinutes=%d", got)
	}
	if s.Snapshot().Stats.Round != 1 {
		t.Fatalf("default stats not loaded: %+v", s.Snapshot().Stats)
	}

	// Update persists across a fresh load.
	if err := s.Update(func(c *Config) { c.Settings.FocusMinutes = 50 }); err != nil {
		t.Fatal(err)
	}
	reloaded, err := newStore(path)
	if err != nil {
		t.Fatal(err)
	}
	if got := reloaded.Snapshot().Settings.FocusMinutes; got != 50 {
		t.Fatalf("change did not persist, focusMinutes=%d", got)
	}
}

func TestOldConfigDefaultsSoundVolumeToOne(t *testing.T) {
	path := filepath.Join(t.TempDir(), "config.json")
	// A config written before soundVolume existed has no such key.
	if err := os.WriteFile(path, []byte(`{"settings":{"focusMinutes":25,"soundEnabled":true}}`), 0o644); err != nil {
		t.Fatal(err)
	}
	s, err := newStore(path)
	if err != nil {
		t.Fatal(err)
	}
	if got := s.Snapshot().Settings.SoundVolume; got != 1 {
		t.Fatalf("old config should load at full volume, soundVolume=%v", got)
	}
}
