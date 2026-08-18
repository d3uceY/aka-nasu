// Package todos owns the daily checklist; mutations return the full list.
// Todos are stored in SQLite (backend/store), not the JSON config.
package todos

import (
	"aka-nasu/backend/config"
	"aka-nasu/backend/store"
)

// Service exposes the SQLite-backed checklist to the frontend.
type Service struct{}

func NewService() *Service { return &Service{} }

func (s *Service) GetTodos() ([]config.Todo, error) {
	return store.Todos()
}

func (s *Service) list() ([]config.Todo, error) {
	return store.Todos()
}

func (s *Service) AddTodo(text string) ([]config.Todo, error) {
	if text == "" {
		return s.list()
	}
	if _, err := store.AddTodo(text); err != nil {
		return nil, err
	}
	return s.list()
}

func (s *Service) ToggleTodo(id string) ([]config.Todo, error) {
	if err := store.ToggleTodo(id); err != nil {
		return nil, err
	}
	return s.list()
}

func (s *Service) RemoveTodo(id string) ([]config.Todo, error) {
	if err := store.RemoveTodo(id); err != nil {
		return nil, err
	}
	return s.list()
}

// UpdateTodo edits a task's text and notes.
func (s *Service) UpdateTodo(id, text, notes string) ([]config.Todo, error) {
	if err := store.UpdateTodo(id, text, notes); err != nil {
		return nil, err
	}
	return s.list()
}

// SetActiveTodo pins id as the current task (empty id clears the pin).
func (s *Service) SetActiveTodo(id string) ([]config.Todo, error) {
	if err := store.SetActiveTodo(id); err != nil {
		return nil, err
	}
	return s.list()
}
