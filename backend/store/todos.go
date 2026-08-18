package store

import (
	"crypto/rand"
	"database/sql"
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

// AddTodo inserts a new open todo and returns it. The frontend owns the
// current-task pin: pass active=true when this is the only task (it becomes the
// current task automatically); active=false never steals the pin.
func AddTodo(text string, active bool) (config.Todo, error) {
	t := config.Todo{ID: newID(), Text: text, CreatedAt: time.Now().UnixMilli(), Active: active}
	tx, err := DB.Begin()
	if err != nil {
		return t, err
	}
	defer tx.Rollback()
	if active {
		// "Make this the current task" — no other task may stay pinned.
		if _, err := tx.Exec(`UPDATE todos SET active = 0`); err != nil {
			return t, err
		}
	}
	if _, err := tx.Exec(`
		INSERT INTO todos (id, text, done, notes, active, created_at)
		VALUES (?, ?, 0, '', ?, ?)`, t.ID, t.Text, boolInt(active), t.CreatedAt); err != nil {
		return t, err
	}
	return t, tx.Commit()
}

// ToggleTodo flips the done flag. The frontend owns the current-task pin: pass
// the id of the task to make active next, or "" to leave the pin unchanged
// (completing the current task with no next keeps it pinned).
func ToggleTodo(id, nextActive string) error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err := tx.Exec(`UPDATE todos SET done = 1 - done WHERE id = ?`, id); err != nil {
		return err
	}
	if nextActive != "" {
		if err := setActive(tx, nextActive); err != nil {
			return err
		}
	}
	return tx.Commit()
}

// RemoveTodo deletes the todo. The frontend owns the current-task pin: pass the
// id of the task to make active next, or "" to leave the pin unchanged (the
// removed task wasn't current, or the list is now empty).
func RemoveTodo(id, nextActive string) error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err := tx.Exec(`DELETE FROM todos WHERE id = ?`, id); err != nil {
		return err
	}
	if nextActive != "" {
		if err := setActive(tx, nextActive); err != nil {
			return err
		}
	}
	return tx.Commit()
}

// UpdateTodo replaces the text and notes.
func UpdateTodo(id, text, notes string) error {
	_, err := DB.Exec(`UPDATE todos SET text = ?, notes = ? WHERE id = ?`, text, notes, id)
	return err
}

// SetActiveTodo makes id the current task.
func SetActiveTodo(id string) error {
	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if err := setActive(tx, id); err != nil {
		return err
	}
	return tx.Commit()
}

// setActive clears every pin and pins id.
func setActive(tx *sql.Tx, id string) error {
	if _, err := tx.Exec(`UPDATE todos SET active = 0`); err != nil {
		return err
	}
	_, err := tx.Exec(`UPDATE todos SET active = 1 WHERE id = ?`, id)
	return err
}

// boolInt converts a boolean to 0/1 for SQLite.
func boolInt(b bool) int {
	if b {
		return 1
	}
	return 0
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
	// Legacy rows have no pin; the frontend restores the "one current task"
	// rule when it loads the list.
	return tx.Commit()
}

func newID() string {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return fmt.Sprintf("t%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)
}
