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

// AddTodo inserts a new task. The frontend passes active=true when this is the
// only task, so it becomes the current task immediately.
func (s *Service) AddTodo(text string, active bool) ([]config.Todo, error) {
	if text == "" {
		return store.Todos()
	}
	if _, err := store.AddTodo(text, active); err != nil {
		return nil, err
	}
	return store.Todos()
}

// ToggleTodo flips done. The frontend passes the id to make active next ("" =
// leave the current pin unchanged).
func (s *Service) ToggleTodo(id, nextActive string) ([]config.Todo, error) {
	if err := store.ToggleTodo(id, nextActive); err != nil {
		return nil, err
	}
	return store.Todos()
}

// RemoveTodo deletes a task. The frontend passes the id to make active next
// ("" = leave the current pin unchanged).
func (s *Service) RemoveTodo(id, nextActive string) ([]config.Todo, error) {
	if err := store.RemoveTodo(id, nextActive); err != nil {
		return nil, err
	}
	return store.Todos()
}

// UpdateTodo edits a task's text and notes.
func (s *Service) UpdateTodo(id, text, notes string) ([]config.Todo, error) {
	if err := store.UpdateTodo(id, text, notes); err != nil {
		return nil, err
	}
	return store.Todos()
}

// SetActiveTodo pins id as the current task (empty id clears the pin).
func (s *Service) SetActiveTodo(id string) ([]config.Todo, error) {
	if err := store.SetActiveTodo(id); err != nil {
		return nil, err
	}
	return store.Todos()
}
