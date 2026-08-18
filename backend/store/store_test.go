package store

import (
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

	added, err := AddTodo("first")
	if err != nil {
		t.Fatal(err)
	}
	second, err := AddTodo("second")
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

	if err := ToggleTodo(second.ID); err != nil {
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

	// Clear the active pin.
	if err := SetActiveTodo(""); err != nil {
		t.Fatal(err)
	}
	list, _ = Todos()
	for _, item := range list {
		if item.Active {
			t.Fatalf("active should be cleared: %+v", list)
		}
	}

	if err := RemoveTodo(added.ID); err != nil {
		t.Fatal(err)
	}
	list, _ = Todos()
	if len(list) != 1 || list[0].ID != second.ID {
		t.Fatalf("remove failed: %+v", list)
	}
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
}
