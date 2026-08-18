package store

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"aka-nasu/backend/config"
)

// Todos returns every todo, newest first (matches the old JSON prepend order).
func Todos() ([]config.Todo, error) {
	rows, err := DB.Query(`
		SELECT id, text, done, notes, active, created_at
		FROM todos
		ORDER BY created_at DESC, rowid DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []config.Todo{}
	for rows.Next() {
		var t config.Todo
		if err := rows.Scan(&t.ID, &t.Text, &t.Done, &t.Notes, &t.Active, &t.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, t)
	}
	return out, rows.Err()
}

// AddTodo inserts a new open todo and returns it.
func AddTodo(text string) (config.Todo, error) {
	t := config.Todo{ID: newID(), Text: text, CreatedAt: time.Now().UnixMilli()}
	_, err := DB.Exec(`
		INSERT INTO todos (id, text, done, notes, active, created_at)
		VALUES (?, ?, 0, '', 0, ?)`, t.ID, t.Text, t.CreatedAt)
	return t, err
}

// ToggleTodo flips the done flag in one statement.
func ToggleTodo(id string) error {
	_, err := DB.Exec(`UPDATE todos SET done = 1 - done WHERE id = ?`, id)
	return err
}

// RemoveTodo deletes the todo (and clears it as the active task).
func RemoveTodo(id string) error {
	_, err := DB.Exec(`DELETE FROM todos WHERE id = ?`, id)
	return err
}

// UpdateTodo replaces the text and notes.
func UpdateTodo(id, text, notes string) error {
	_, err := DB.Exec(`UPDATE todos SET text = ?, notes = ? WHERE id = ?`, text, notes, id)
	return err
}

// SetActiveTodo makes id the current task; an empty id clears the selection.
func SetActiveTodo(id string) error {
	if _, err := DB.Exec(`UPDATE todos SET active = 0`); err != nil {
		return err
	}
	if id == "" {
		return nil
	}
	_, err := DB.Exec(`UPDATE todos SET active = 1 WHERE id = ?`, id)
	return err
}

// MigrateFromJson imports the legacy JSON list once, before config.MigrateFromJson flips.
func MigrateFromJson(list []config.Todo) error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	stmt, err := tx.Prepare(`
		INSERT INTO todos (id, text, done, notes, active, created_at)
		VALUES (?, ?, ?, ?, 0, ?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, t := range list {
		if _, err := stmt.Exec(t.ID, t.Text, t.Done, t.Notes, t.CreatedAt); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func newID() string {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("t%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)
}
