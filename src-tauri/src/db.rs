use chrono::Utc;
use rusqlite::{params, Connection, Result as SqlResult};
use serde::{Deserialize, Serialize};
use std::path::Path;
use tracing::info;
use uuid::Uuid;

use crate::error::{AppError, AppResult};

/// Transaction ledger record model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileTransaction {
    pub id: String,
    pub original_path: String,
    pub new_path: String,
    pub timestamp: String,
    pub summary: String,
    pub category_path: String,
    pub confidence: f64,
    pub undo_status: bool,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    /// Initialize or open the SQLite transaction ledger database
    pub fn new(db_path: &Path) -> AppResult<Self> {
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let conn = Connection::open(db_path)
            .map_err(|e| AppError::Database(format!("Failed to open SQLite database: {}", e)))?;

        // Enable Write-Ahead Logging (WAL) mode for concurrency
        conn.execute_batch("PRAGMA journal_mode=WAL;")
            .map_err(|e| AppError::Database(format!("Failed to enable WAL mode: {}", e)))?;

        let db = Self { conn };
        db.initialize_schema()?;
        Ok(db)
    }

    /// Create database tables if they do not exist
    fn initialize_schema(&self) -> AppResult<()> {
        self.conn
            .execute_batch(
                "CREATE TABLE IF NOT EXISTS transactions (
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
                    ON transactions(timestamp DESC);",
            )
            .map_err(|e| AppError::Database(format!("Failed to create transaction schema: {}", e)))?;
        Ok(())
    }

    /// Record a file move operation into the SQLite ledger
    pub fn record_transaction(
        &self,
        original_path: &str,
        new_path: &str,
        summary: &str,
        category_path: &str,
        confidence: f64,
    ) -> AppResult<FileTransaction> {
        let id = Uuid::new_v4().to_string();
        let timestamp = Utc::now().to_rfc3339();

        let tx = FileTransaction {
            id: id.clone(),
            original_path: original_path.to_string(),
            new_path: new_path.to_string(),
            timestamp: timestamp.clone(),
            summary: summary.to_string(),
            category_path: category_path.to_string(),
            confidence,
            undo_status: false,
        };

        self.conn
            .execute(
                "INSERT INTO transactions (id, original_path, new_path, timestamp, summary, category_path, confidence, undo_status)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0)",
                params![
                    tx.id,
                    tx.original_path,
                    tx.new_path,
                    tx.timestamp,
                    tx.summary,
                    tx.category_path,
                    tx.confidence
                ],
            )
            .map_err(|e| AppError::Database(format!("Failed to insert transaction record: {}", e)))?;

        info!(
            id = %tx.id,
            original = %tx.original_path,
            new = %tx.new_path,
            "Recorded file transaction into SQLite ledger"
        );

        Ok(tx)
    }

    /// Fetch all transaction history records ordered by timestamp DESC
    pub fn list_transactions(&self) -> AppResult<Vec<FileTransaction>> {
        let mut stmt = self
            .conn
            .prepare(
                "SELECT id, original_path, new_path, timestamp, summary, category_path, confidence, undo_status 
                 FROM transactions 
                 ORDER BY timestamp DESC 
                 LIMIT 200",
            )
            .map_err(|e| AppError::Database(format!("Failed to prepare query: {}", e)))?;

        let rows = stmt
            .query_map([], |row| {
                Ok(FileTransaction {
                    id: row.get(0)?,
                    original_path: row.get(1)?,
                    new_path: row.get(2)?,
                    timestamp: row.get(3)?,
                    summary: row.get::<_, Option<String>>(4)?.unwrap_or_default(),
                    category_path: row.get::<_, Option<String>>(5)?.unwrap_or_default(),
                    confidence: row.get::<_, Option<f64>>(6)?.unwrap_or(0.0),
                    undo_status: row.get::<_, i32>(7)? != 0,
                })
            })
            .map_err(|e| AppError::Database(format!("Query execution failed: {}", e)))?;

        let mut list = Vec::new();
        for r in rows {
            let tx = r.map_err(|e| AppError::Database(format!("Row parsing failed: {}", e)))?;
            list.push(tx);
        }
        Ok(list)
    }

    /// 1-Click Undo Move: restores the file to original_path and marks undo_status = 1
    pub fn undo_transaction(&self, id: &str) -> AppResult<FileTransaction> {
        let tx: SqlResult<FileTransaction> = self.conn.query_row(
            "SELECT id, original_path, new_path, timestamp, summary, category_path, confidence, undo_status
             FROM transactions WHERE id = ?1 AND undo_status = 0",
            params![id],
            |row| {
                Ok(FileTransaction {
                    id: row.get(0)?,
                    original_path: row.get(1)?,
                    new_path: row.get(2)?,
                    timestamp: row.get(3)?,
                    summary: row.get::<_, Option<String>>(4)?.unwrap_or_default(),
                    category_path: row.get::<_, Option<String>>(5)?.unwrap_or_default(),
                    confidence: row.get::<_, Option<f64>>(6)?.unwrap_or(0.0),
                    undo_status: row.get::<_, i32>(7)? != 0,
                })
            },
        );

        let mut tx = tx.map_err(|e| {
            AppError::Database(format!("Transaction {} not found or already undone: {}", id, e))
        })?;

        let current_file = Path::new(&tx.new_path);
        let original_target = Path::new(&tx.original_path);

        if current_file.exists() {
            if let Some(parent) = original_target.parent() {
                std::fs::create_dir_all(parent)?;
            }
            std::fs::rename(current_file, original_target)?;
        } else {
            return Err(AppError::Filesystem(format!(
                "File no longer exists at path: {}",
                tx.new_path
            )));
        }

        self.conn
            .execute(
                "UPDATE transactions SET undo_status = 1 WHERE id = ?1",
                params![id],
            )
            .map_err(|e| AppError::Database(format!("Failed to update undo status: {}", e)))?;

        tx.undo_status = true;
        info!(id = %id, original = %tx.original_path, "Undid file transaction successfully");

        Ok(tx)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_db_crud_and_undo() {
        let dir = tempdir().expect("Create tempdir");
        let db_path = dir.path().join("test_ledger.db");
        let db = Database::new(&db_path).expect("Create db");

        let src_file = dir.path().join("downloads").join("invoice.pdf");
        let dst_file = dir.path().join("organized").join("Invoices").join("invoice.pdf");

        std::fs::create_dir_all(src_file.parent().unwrap()).unwrap();
        std::fs::create_dir_all(dst_file.parent().unwrap()).unwrap();
        std::fs::write(&dst_file, "invoice content").unwrap();

        let tx = db
            .record_transaction(
                &src_file.to_string_lossy(),
                &dst_file.to_string_lossy(),
                "ACME Invoice",
                "Financials/Invoices",
                0.95,
            )
            .expect("Record transaction");

        let list = db.list_transactions().expect("List transactions");
        assert_eq!(list.len(), 1);

        let undone = db.undo_transaction(&tx.id).expect("Undo transaction");
        assert!(undone.undo_status);
        assert!(src_file.exists());
        assert!(!dst_file.exists());
    }
}
