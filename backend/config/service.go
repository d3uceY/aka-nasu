// Package config holds the persisted application state and the JSON file store.
package config

// Service exposes the persisted settings, timer state, and stats to the
// frontend. One service for the whole JSON config file (previously three
// separate settings/stats/timer services that each wrapped the same store).
type Service struct {
	store *Store
}

func NewService(store *Store) *Service {
	return &Service{store: store}
}

func (s *Service) GetSettings() (Settings, error) {
	return s.store.Snapshot().Settings, nil
}

func (s *Service) UpdateSettings(settings Settings) (Settings, error) {
	err := s.store.Update(func(c *Config) { c.Settings = settings })
	return settings, err
}

func (s *Service) GetTimerState() (TimerState, error) {
	return s.store.Snapshot().Timer, nil
}

func (s *Service) UpdateTimerState(state TimerState) (TimerState, error) {
	err := s.store.Update(func(c *Config) { c.Timer = state })
	return state, err
}

func (s *Service) GetStats() (Stats, error) {
	return s.store.Snapshot().Stats, nil
}

func (s *Service) UpdateStats(stats Stats) (Stats, error) {
	err := s.store.Update(func(c *Config) { c.Stats = stats })
	return stats, err
}
