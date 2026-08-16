package config

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

// Store is the JSON config file on disk. One mutex guards every
// read-modify-write so the frontend services never clobber each other.
type Store struct {
	mu   sync.Mutex
	path string
	cfg  Config
}

// NewStore resolves the config path under the OS user-config dir and loads it,
// creating the file with defaults on first run.
func NewStore() (*Store, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return nil, err
	}
	return newStore(filepath.Join(dir, "aka-nasu", "config.json"))
}

func newStore(path string) (*Store, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}
	s := &Store{path: path}
	return s, s.load()
}

func (s *Store) load() error {
	data, err := os.ReadFile(s.path)
	if os.IsNotExist(err) {
		s.cfg = DefaultConfig()
		return s.write(s.cfg)
	}
	if err != nil {
		return err
	}
	return json.Unmarshal(data, &s.cfg)
}

// write persists cfg atomically (temp file + rename) so a crash can't leave a
// half-written config that loses the todos.
func (s *Store) write(cfg Config) error {
	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return err
	}
	tmp := s.path + ".tmp"
	if err := os.WriteFile(tmp, data, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, s.path)
}

// Update applies mutate to the stored config and persists it.
func (s *Store) Update(mutate func(*Config)) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	mutate(&s.cfg)
	return s.write(s.cfg)
}

// Snapshot returns a copy of the current config.
func (s *Store) Snapshot() Config {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.cfg
}
