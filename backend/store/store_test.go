package store

import (
	"database/sql"
	"path/filepath"
	"testing"

	"aka-nasu/backend/config"
)

// newTestDB points DB at a throwaway database and creates the schema.
func newTestDB(t *testing.T) {
	t.Helper()
	if err := InitDB(filepath.Join(t.TempDir(), "test.db")); err != nil {
		t.Fatal(err)
	}
	CreateTables()
	t.Cleanup(func() {
		if DB != nil {
			_ = DB.Close()
			DB = nil
		}
	})
}

func TestTodosCRUD(t *testing.T) {
	newTestDB(t)

	// The frontend owns the pin: the first task is added active.
	added, err := AddTodo("first", true)
	if err != nil {
		t.Fatal(err)
	}
	second, err := AddTodo("second", false)
	if err != nil {
		t.Fatal(err)
	}

	// Newest first (matches the old JSON prepend order).
	list, err := Todos()
	if err != nil {
		t.Fatal(err)
	}
	if len(list) != 2 || list[0].ID != second.ID || list[1].ID != added.ID {
		t.Fatalf("unexpected order: %+v", list)
	}
	if activeID(t) != added.ID || countActive(t) != 1 {
		t.Fatalf("only the frontend-told active task is pinned: %+v", list)
	}

	// Completing a non-current task with no next keeps the pin.
	if err := ToggleTodo(second.ID, ""); err != nil {
		t.Fatal(err)
	}
	if err := UpdateTodo(second.ID, "second (edited)", "take notes"); err != nil {
		t.Fatal(err)
	}
	if err := SetActiveTodo(second.ID); err != nil {
		t.Fatal(err)
	}
	list, _ = Todos()
	var got config.Todo
	for _, item := range list {
		if item.ID == second.ID {
			got = item
		}
	}
	if !got.Done || got.Text != "second (edited)" || got.Notes != "take notes" || !got.Active {
		t.Fatalf("update did not land: %+v", got)
	}
	if !list[0].Active || list[1].Active {
		t.Fatalf("exactly one active expected: %+v", list)
	}

	// Removing a non-current task leaves the pin alone.
	if err := RemoveTodo(added.ID, ""); err != nil {
		t.Fatal(err)
	}
	list, _ = Todos()
	if len(list) != 1 || list[0].ID != second.ID {
		t.Fatalf("remove failed: %+v", list)
	}
	if activeID(t) != second.ID {
		t.Fatalf("pin should be unchanged after removing a non-current task: %+v", list)
	}
}

func TestAddActive(t *testing.T) {
	newTestDB(t)

	// First task added active becomes current.
	a, err := AddTodo("a", true)
	if err != nil {
		t.Fatal(err)
	}
	list, _ := Todos()
	if activeID(t) != a.ID || countActive(t) != 1 {
		t.Fatalf("first task should be pinned: %+v", list)
	}

	// Later adds with active=false never steal the pin.
	if _, err := AddTodo("b", false); err != nil {
		t.Fatal(err)
	}
	list, _ = Todos()
	if activeID(t) != a.ID || countActive(t) != 1 {
		t.Fatalf("a non-active add must not steal the pin: %+v", list)
	}

	// An active add clears any other pin (the frontend's "make this current").
	c, err := AddTodo("c", true)
	if err != nil {
		t.Fatal(err)
	}
	list, _ = Todos()
	if activeID(t) != c.ID || countActive(t) != 1 {
		t.Fatalf("an active add should take the pin and clear others: %+v", list)
	}
}

func TestToggleHandsPin(t *testing.T) {
	newTestDB(t)

	a, _ := AddTodo("a", true)
	b, _ := AddTodo("b", false)
	if _, err := AddTodo("c", false); err != nil {
		t.Fatal(err)
	}

	// Completing a task hands the pin to the id the frontend asked for.
	if err := ToggleTodo(a.ID, b.ID); err != nil {
		t.Fatal(err)
	}
	list, _ := Todos()
	if activeID(t) != b.ID {
		t.Fatalf("completing a should pin b: %+v", list)
	}

	// nextActive="" leaves the pin unchanged.
	if err := ToggleTodo(b.ID, ""); err != nil {
		t.Fatal(err)
	}
	list, _ = Todos()
	if activeID(t) != b.ID {
		t.Fatalf("empty nextActive should keep the pin: %+v", list)
	}
}

func TestRemoveHandsPin(t *testing.T) {
	newTestDB(t)

	a, _ := AddTodo("a", true)
	b, _ := AddTodo("b", false)
	c, _ := AddTodo("c", false)

	// Removing the pinned task hands the pin to the id the frontend asked for.
	if err := RemoveTodo(a.ID, b.ID); err != nil {
		t.Fatal(err)
	}
	list, _ := Todos()
	if activeID(t) != b.ID {
		t.Fatalf("removing the pinned task should pin b: %+v", list)
	}

	// Removing a non-current task with nextActive="" keeps the pin.
	if err := RemoveTodo(c.ID, ""); err != nil {
		t.Fatal(err)
	}
	list, _ = Todos()
	if activeID(t) != b.ID {
		t.Fatalf("removing a non-current task should keep the pin: %+v", list)
	}

	// Removing the last task leaves nothing pinned.
	if err := RemoveTodo(b.ID, ""); err != nil {
		t.Fatal(err)
	}
	list, _ = Todos()
	if countActive(t) != 0 {
		t.Fatalf("empty list should have no pin: %+v", list)
	}
}

func TestSetActiveClearsOthers(t *testing.T) {
	newTestDB(t)

	a, _ := AddTodo("a", true)
	if _, err := AddTodo("b", false); err != nil {
		t.Fatal(err)
	}
	if err := SetActiveTodo(a.ID); err != nil {
		t.Fatal(err)
	}
	list, _ := Todos()
	if countActive(t) != 1 || activeID(t) != a.ID {
		t.Fatalf("setting active should leave exactly one pinned: %+v", list)
	}
}

func activeID(t *testing.T) string {
	t.Helper()
	var id string
	err := DB.QueryRow(`SELECT id FROM todos WHERE active = 1`).Scan(&id)
	if err == sql.ErrNoRows {
		return ""
	}
	if err != nil {
		t.Fatal(err)
	}
	return id
}

func countActive(t *testing.T) int {
	t.Helper()
	var n int
	if err := DB.QueryRow(`SELECT COUNT(*) FROM todos WHERE active = 1`).Scan(&n); err != nil {
		t.Fatal(err)
	}
	return n
}

func TestMigrateFromJson(t *testing.T) {
	newTestDB(t)

	in := []config.Todo{
		{ID: "a", Text: "legacy one", Done: true, Notes: "note", CreatedAt: 1},
		{ID: "b", Text: "legacy two", CreatedAt: 2},
	}
	if err := MigrateFromJson(in); err != nil {
		t.Fatal(err)
	}
	list, err := Todos()
	if err != nil {
		t.Fatal(err)
	}
	if len(list) != 2 || list[0].Text != "legacy two" || list[1].Text != "legacy one" || !list[1].Done || list[1].Notes != "note" {
		t.Fatalf("migration did not round-trip: %+v", list)
	}
	// Legacy rows have no pin; the frontend restores the "one current task" rule.
	if countActive(t) != 0 {
		t.Fatalf("migrated data should have no pin: %+v", list)
	}
}
