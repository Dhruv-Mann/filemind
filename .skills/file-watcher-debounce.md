---
name: file-watcher-debounce
description: File system watcher implementation using the Rust notify crate with a 4-second debounce delay. Use when working on watcher.rs, modifying the detection pipeline, adding temporary file filtering, or debugging file detection issues.
---

# File Watcher & Debounce Engine

## Core Requirements

- Monitor `~/Downloads` (or user-configured path) using the `notify` crate.
- **4-second mandatory debounce delay** before processing any new file (ensures downloads complete).
- **Ignore temporary files**: `.crdownload`, `.part`, `.tmp`, `.download`, `.partial`.
- **Ignore hidden files**: Any file starting with `.`.

---

## Cargo.toml Dependencies

```toml
[dependencies]
notify = "6.1"
notify-debouncer-mini = "0.4"
```

---

## Implementation

```rust
// src-tauri/src/watcher.rs
use notify::{RecommendedWatcher, RecursiveMode, Watcher};
use notify_debouncer_mini::{new_debouncer, DebouncedEvent};
use std::path::{Path, PathBuf};
use std::time::Duration;
use tokio::sync::mpsc;

/// Extensions to ignore (incomplete downloads)
const IGNORED_EXTENSIONS: &[&str] = &[
    "crdownload", "part", "tmp", "download", "partial", "~"
];

/// Check if a file should be skipped
fn should_ignore(path: &Path) -> bool {
    // Skip hidden files
    if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
        if name.starts_with('.') {
            return true;
        }
    }
    // Skip temporary extensions
    if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
        if IGNORED_EXTENSIONS.contains(&ext.to_lowercase().as_str()) {
            return true;
        }
    }
    // Skip directories
    if path.is_dir() {
        return true;
    }
    false
}

/// Start watching a directory, returning a channel receiver for new file paths
pub fn start_watcher(
    watch_path: PathBuf,
) -> Result<mpsc::UnboundedReceiver<PathBuf>, notify::Error> {
    let (tx, rx) = mpsc::unbounded_channel::<PathBuf>();

    // 4-second debounce delay
    let (debounced_tx, debounced_rx) = std::sync::mpsc::channel::<Result<Vec<DebouncedEvent>, _>>();
    
    let mut debouncer = new_debouncer(Duration::from_secs(4), debounced_tx)?;
    debouncer.watcher().watch(&watch_path, RecursiveMode::NonRecursive)?;

    // Spawn a thread to forward debounced events to the async channel
    std::thread::spawn(move || {
        // Keep debouncer alive
        let _debouncer = debouncer;
        
        for result in debounced_rx {
            match result {
                Ok(events) => {
                    for event in events {
                        let path = event.path;
                        if !should_ignore(&path) && path.is_file() {
                            tracing::info!(path = %path.display(), "New file ready for processing");
                            let _ = tx.send(path);
                        }
                    }
                }
                Err(errors) => {
                    for e in errors {
                        tracing::error!(error = %e, "Watcher error");
                    }
                }
            }
        }
    });

    Ok(rx)
}
```

---

## Integration with Main Pipeline

```rust
// In lib.rs or a background task spawned at startup:
pub async fn run_watcher_loop(
    watch_path: PathBuf,
    app_state: std::sync::Arc<AppState>,
    app_handle: tauri::AppHandle,
) {
    let mut rx = match start_watcher(watch_path) {
        Ok(rx) => rx,
        Err(e) => {
            tracing::error!("Failed to start file watcher: {e}");
            return;
        }
    };

    while let Some(path) = rx.recv().await {
        // Skip if watcher has been paused by user
        if !app_state.watcher_active.load(std::sync::atomic::Ordering::Relaxed) {
            continue;
        }

        let state = app_state.clone();
        let handle = app_handle.clone();

        tokio::spawn(async move {
            match process_file(path, state).await {
                Ok(transaction) => {
                    // Emit event to frontend
                    let _ = handle.emit("file-processed", &transaction);
                }
                Err(e) => {
                    tracing::error!(error = %e, "Failed to process file");
                }
            }
        });
    }
}
```

---

## Downloads Path Resolution

```rust
pub fn get_downloads_dir() -> Option<PathBuf> {
    dirs::download_dir()
}
```

The `dirs` crate resolves the correct platform path:
- Windows: `C:\Users\<user>\Downloads`
- macOS: `/Users/<user>/Downloads`
- Linux: `/home/<user>/Downloads`

---

## Key Rules

- **4 seconds minimum debounce** — do not reduce this. Downloads may still be writing.
- **NonRecursive mode** — only watch the top-level Downloads folder, not subdirectories (avoid recursion into the organized output).
- **Check `path.is_file()`** after debounce — the file might have been moved or deleted by then.
- **Never acquire filesystem locks** before the debounce completes.

## References
- [notify crate](https://docs.rs/notify/latest/notify/)
- [notify-debouncer-mini](https://docs.rs/notify-debouncer-mini/latest/notify_debouncer_mini/)
- [dirs crate](https://docs.rs/dirs/latest/dirs/)
