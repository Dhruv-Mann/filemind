---
name: sqlite-ledger-patterns
description: SQLite (rusqlite) transaction ledger patterns for this project. Use when modifying db.rs, adding new database queries, designing the schema, or implementing undo logic. Trigger for any SQLite, database, or rusqlite-related questions.
---

# SQLite Ledger Patterns (rusqlite)

## Schema Definition

The transaction ledger schema. Run at application startup:

```rust
// src-tauri/src/db.rs
use rusqlite::{Connection, Result, params};

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(db_path: &str) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        conn.execute_batch("PRAGMA journal_mode=WAL;")?; // Better concurrent performance
        let db = Self { conn };
        db.initialize_schema()?;
        Ok(db)
    }

    fn initialize_schema(&self) -> Result<()> {
        self.conn.execute_batch("
            CREATE TABLE IF NOT EXISTS transactions (
                id              TEXT PRIMARY KEY,
                original_path   TEXT NOT NULL,
                new_path        TEXT NOT NULL,
                timestamp       TEXT NOT NULL,
                summary         TEXT,
                category_path   TEXT,
                confidence      REAL,
                undo_status     INTEGER NOT NULL DEFAULT 0
            );

            CREATE INDEX IF NOT EXISTS idx_transactions_timestamp 
                ON transactions(timestamp DESC);
        ")?;
        Ok(())
    }
}
```

---

## CRUD Operations

```rust
impl Database {
    /// Record a new file move transaction
    pub fn insert_transaction(&self, tx: &FileTransaction) -> Result<()> {
        self.conn.execute(
            "INSERT INTO transactions 
             (id, original_path, new_path, timestamp, summary, category_path, confidence, undo_status)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0)",
            params![
                tx.id, tx.original_path, tx.new_path, tx.timestamp,
                tx.summary, tx.category_path, tx.confidence
            ],
        )?;
        Ok(())
    }

    /// List all transactions, most recent first
    pub fn list_transactions(&self) -> Result<Vec<FileTransaction>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, original_path, new_path, timestamp, summary, 
                    category_path, confidence, undo_status 
             FROM transactions 
             ORDER BY timestamp DESC 
             LIMIT 200"
        )?;
        let rows = stmt.query_map([], |row| {
            Ok(FileTransaction {
                id: row.get(0)?,
                original_path: row.get(1)?,
                new_path: row.get(2)?,
                timestamp: row.get(3)?,
                summary: row.get(4).unwrap_or_default(),
                category_path: row.get(5).unwrap_or_default(),
                confidence: row.get(6).unwrap_or(0.0),
                undo_status: row.get::<_, i32>(7)? != 0,
            })
        })?;
        rows.collect()
    }

    /// Undo a transaction: move file back to original_path
    pub fn undo_transaction(&self, id: &str) -> Result<Option<FileTransaction>> {
        let tx: Option<FileTransaction> = self.conn
            .query_row(
                "SELECT id, original_path, new_path, timestamp, summary, category_path, confidence, undo_status
                 FROM transactions WHERE id = ?1 AND undo_status = 0",
                params![id],
                |row| Ok(FileTransaction {
                    id: row.get(0)?,
                    original_path: row.get(1)?,
                    new_path: row.get(2)?,
                    timestamp: row.get(3)?,
                    summary: row.get(4).unwrap_or_default(),
                    category_path: row.get(5).unwrap_or_default(),
                    confidence: row.get(6).unwrap_or(0.0),
                    undo_status: row.get::<_, i32>(7)? != 0,
                }),
            )
            .ok();

        if let Some(ref tx) = tx {
            // Perform the filesystem move (back to original)
            if std::path::Path::new(&tx.new_path).exists() {
                std::fs::rename(&tx.new_path, &tx.original_path)?;
                self.conn.execute(
                    "UPDATE transactions SET undo_status = 1 WHERE id = ?1",
                    params![id],
                )?;
            }
        }
        Ok(tx)
    }
}
```

---

## DB Path Resolution

Resolve the database path relative to the app's data directory (not the bundle):

```rust
use tauri::Manager;

fn get_db_path(app: &tauri::AppHandle) -> std::path::PathBuf {
    app.path().app_data_dir()
        .expect("Failed to resolve app data dir")
        .join("ledger.db")
}
```

---

## Transaction IDs

Generate using `uuid::Uuid::new_v4()`:

```rust
use uuid::Uuid;
let id = Uuid::new_v4().to_string();
```

---

## Timestamp Format

Use ISO 8601 UTC:

```rust
use chrono::Utc;
let timestamp = Utc::now().to_rfc3339();
```

---

## Key Rules

- **Always use WAL mode** for SQLite to support concurrent reads.
- **No raw string formatting** for queries — always use `params![]` to prevent SQL injection.
- **Undo guard**: check `undo_status = 0` before allowing undo to prevent double-undo.
- **Error handling**: propagate `rusqlite::Error` up to `AppError::Database`, never `unwrap()`.
- **DB path**: use `app.path().app_data_dir()`, not hardcoded paths.

## References
- [rusqlite docs](https://docs.rs/rusqlite/latest/rusqlite/)
- [SQLite WAL Mode](https://www.sqlite.org/wal.html)
- [chrono crate](https://docs.rs/chrono)
- [uuid crate](https://docs.rs/uuid)
