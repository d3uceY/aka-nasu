// Package settings exposes the timer settings to the frontend.
package settings

import "aka-nasu/backend/config"

// Service persists the timer settings slice of the config.
type Service struct {
	store *config.Store
}

func NewService(store *config.Store) *Service {
	return &Service{store: store}
}

func (s *Service) GetSettings() (config.Settings, error) {
	return s.store.Snapshot().Settings, nil
}

func (s *Service) UpdateSettings(settings config.Settings) (config.Settings, error) {
	err := s.store.Update(func(c *config.Config) { c.Settings = settings })
	return settings, err
}
