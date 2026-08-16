// Package timer persists the live timer position so it resumes after restart.
package timer

import "aka-nasu/backend/config"

// Service persists the timer slice of the config.
type Service struct {
	store *config.Store
}

func NewService(store *config.Store) *Service {
	return &Service{store: store}
}

func (s *Service) GetTimerState() (config.TimerState, error) {
	return s.store.Snapshot().Timer, nil
}

func (s *Service) UpdateTimerState(state config.TimerState) (config.TimerState, error) {
	err := s.store.Update(func(c *config.Config) { c.Timer = state })
	return state, err
}
