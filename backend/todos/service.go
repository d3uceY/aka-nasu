// Package todos owns the daily checklist; mutations return the full list so
// the frontend always mirrors the backend (single source of truth).
package todos

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"aka-nasu/backend/config"
)

// Service persists the todo list slice of the config.
type Service struct {
	store *config.Store
}

func NewService(store *config.Store) *Service {
	return &Service{store: store}
}

func (s *Service) GetTodos() ([]config.Todo, error) {
	return s.store.Snapshot().Todos, nil
}

func (s *Service) list() []config.Todo {
	return s.store.Snapshot().Todos
}

func (s *Service) AddTodo(text string) ([]config.Todo, error) {
	if text == "" {
		return s.list(), nil
	}
	todo := config.Todo{ID: newID(), Text: text, CreatedAt: time.Now().UnixMilli()}
	err := s.store.Update(func(c *config.Config) {
		c.Todos = append([]config.Todo{todo}, c.Todos...)
	})
	return s.list(), err
}

func (s *Service) ToggleTodo(id string) ([]config.Todo, error) {
	err := s.store.Update(func(c *config.Config) {
		for i := range c.Todos {
			if c.Todos[i].ID == id {
				c.Todos[i].Done = !c.Todos[i].Done
				break
			}
		}
	})
	return s.list(), err
}

func (s *Service) RemoveTodo(id string) ([]config.Todo, error) {
	err := s.store.Update(func(c *config.Config) {
		for i := range c.Todos {
			if c.Todos[i].ID == id {
				c.Todos = append(c.Todos[:i], c.Todos[i+1:]...)
				break
			}
		}
	})
	return s.list(), err
}

func newID() string {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("t%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)
}
