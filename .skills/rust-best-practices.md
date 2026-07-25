---
name: rust-best-practices
description: Idiomatic Rust coding guidelines for this project. Use when writing or reviewing any Rust code in src-tauri/, including error handling, async patterns, crate conventions, and memory safety. Trigger for any .rs file modifications, cargo.toml changes, or Rust architecture questions.
---

# Rust Best Practices

## Core Philosophy
Write Rust that is safe, idiomatic, and correct. Prefer the compiler over runtime checks. Leverage Rust's ownership model rather than fighting it.

## Error Handling

**Never use `unwrap()` or `expect()` in production code paths.** Only acceptable in tests or `main()` startup initialization with a clear rationale.

```rust
// ❌ Bad
let conn = Connection::open("db.sqlite").unwrap();

// ✅ Good
let conn = Connection::open("db.sqlite")
    .map_err(|e| AppError::Database(format!("Failed to open db: {e}")))?;
```

Define a unified error type for the application:

```rust
#[derive(Debug, thiserror::Error, serde::Serialize)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(String),
    #[error("File system error: {0}")]
    Filesystem(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Classification error: {0}")]
    Classification(String),
}

// Tauri commands must return Result<T, String> for serialization
pub type TauriResult<T> = Result<T, String>;
impl From<AppError> for String {
    fn from(e: AppError) -> Self { e.to_string() }
}
```

## Async & Tokio

- Use `tokio::spawn` for background tasks (file watcher, batch processor).
- Use `tokio::sync::Mutex` (not `std::sync::Mutex`) for shared state accessed across async tasks.
- Avoid blocking operations inside async functions. Use `tokio::task::spawn_blocking` for CPU-bound or sync filesystem work.

```rust
// ✅ Wrap sync I/O in spawn_blocking
let text = tokio::task::spawn_blocking(move || {
    extract_pdf_text(&path)
}).await??;
```

## Struct & Type Design

- Derive `Debug`, `Clone`, `serde::Serialize`, `serde::Deserialize` on all IPC payload structs.
- Use `Arc<T>` for shared ownership across threads, not raw clones of heavy state.
- Prefer `PathBuf` over `String` for paths.

```rust
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
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
```

## Module Organization

```
src-tauri/src/
├── main.rs          # Entry point, minimal code
├── lib.rs           # Tauri builder, command registration
├── db.rs            # SQLite ledger (rusqlite)
├── watcher.rs       # notify file watcher + debounce
├── extractor.rs     # PDF, DOCX, TXT, image text extraction
├── classifier.rs    # Ollama API client + hybrid classification
├── mcp.rs           # MCP stdio server tool handlers
└── error.rs         # AppError enum
```

## Logging

Use `tracing` (not `println!`) for all diagnostic output:

```rust
tracing::info!(path = %file_path.display(), "New file detected");
tracing::warn!(confidence = confidence, "Low confidence, routing to _Needs_Review");
tracing::error!(error = %e, "Extractor failed");
```

## Clippy & Lints

Run `cargo clippy -- -D warnings` before every commit. Address all lints. Configure in `src-tauri/Cargo.toml`:

```toml
[lints.rust]
unsafe_code = "forbid"
```

## References
- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [Tokio Tutorial](https://tokio.rs/tokio/tutorial)
- [thiserror crate](https://docs.rs/thiserror)
