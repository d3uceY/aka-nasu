// Package stats persists the daily focus-session counters.
package stats

import "aka-nasu/backend/config"

// Service persists the stats slice of the config (frontend computes the counters).
type Service struct {
	store *config.Store
}

func NewService(store *config.Store) *Service {
	return &Service{store: store}
}

func (s *Service) GetStats() (config.Stats, error) {
	return s.store.Snapshot().Stats, nil
}

func (s *Service) UpdateStats(stats config.Stats) (config.Stats, error) {
	err := s.store.Update(func(c *config.Config) { c.Stats = stats })
	return stats, err
}
