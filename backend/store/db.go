// Package store owns the SQLite database shared by the feature services.
package store

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

// DefaultPath is the app database, sitting next to config.json in the user
// config dir.
func DefaultPath() string {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "aka-nasu.db"
	}
	return filepath.Join(dir, "aka-nasu", "aka-nasu.db")
}

// InitDB opens (creating) the SQLite database at path.
func InitDB(path string) error {
	var err error
	DB, err = sql.Open("sqlite", path)
	if err != nil {
		return err
	}

	// SQLite is single-writer; a single connection avoids contention
	// and keeps the memory footprint minimal.
	DB.SetMaxOpenConns(1)
	DB.SetMaxIdleConns(1)

	return DB.Ping()
}

// CreateTables ensures the schema exists. Fatal on error: a broken schema
// means the checklist cannot work at all.
func CreateTables() {
	query := `
CREATE TABLE IF NOT EXISTS todos (
	id         TEXT PRIMARY KEY,
	text       TEXT NOT NULL,
	done       INTEGER NOT NULL DEFAULT 0,
	notes      TEXT NOT NULL DEFAULT '',
	active     INTEGER NOT NULL DEFAULT 0,
	created_at INTEGER NOT NULL
);
`
	if _, err := DB.Exec(query); err != nil {
		fmt.Printf("SQL Error: %v\nQuery: %s\n", err, query)
		panic(err)
	}
}
