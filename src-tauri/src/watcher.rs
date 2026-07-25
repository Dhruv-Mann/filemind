use notify::RecursiveMode;
use notify_debouncer_mini::{new_debouncer, DebouncedEvent};
use std::path::{Path, PathBuf};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::mpsc;
use tracing::{error, info, warn};

use crate::error::{AppError, AppResult};

/// Temporary extensions to ignore (incomplete browser downloads / temp files)
const IGNORED_EXTENSIONS: &[&str] = &[
    "crdownload", "part", "tmp", "temp", "download", "partial", "~"
];

/// Check if a file should be ignored by the file watcher engine
pub fn should_ignore(path: &Path) -> bool {
    // Skip hidden files (starting with '.')
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

/// Start watching a directory with a 4-second debouncer pipeline.
/// Returns an async mpsc receiver emitting verified new file paths.
pub fn start_debounced_watcher(
    watch_path: PathBuf,
    is_active: Arc<AtomicBool>,
) -> AppResult<mpsc::UnboundedReceiver<PathBuf>> {
    if !watch_path.exists() {
        return Err(AppError::Watcher(format!(
            "Watch path does not exist: {}",
            watch_path.display()
        )));
    }

    let (async_tx, async_rx) = mpsc::unbounded_channel::<PathBuf>();
    let (sync_tx, sync_rx) = std::sync::mpsc::channel::<Result<Vec<DebouncedEvent>, _>>();

    // Mandated 4-second debounce delay to ensure download locks are released
    let mut debouncer = new_debouncer(Duration::from_secs(4), sync_tx)
        .map_err(|e| AppError::Watcher(format!("Failed to initialize debouncer: {}", e)))?;

    debouncer
        .watcher()
        .watch(&watch_path, RecursiveMode::NonRecursive)
        .map_err(|e| AppError::Watcher(format!("Failed to watch path {}: {}", watch_path.display(), e)))?;

    info!(
        path = %watch_path.display(),
        debounce_seconds = 4,
        "File watcher debouncer started successfully"
    );

    // Background thread consuming sync debouncer events and forwarding to tokio mpsc
    std::thread::spawn(move || {
        let _debouncer_guard = debouncer; // Keeps watcher active for thread lifetime

        for result in sync_rx {
            if !is_active.load(Ordering::Relaxed) {
                continue;
            }

            match result {
                Ok(events) => {
                    for event in events {
                        let path = event.path;
                        if !should_ignore(&path) && path.is_file() {
                            info!(path = %path.display(), "Debounced file change confirmed");
                            if let Err(e) = async_tx.send(path) {
                                warn!("Async channel closed, stopping watcher receiver loop: {}", e);
                                break;
                            }
                        }
                    }
                }
                Err(err) => {
                    error!(error = %err, "File watcher debouncer error");
                }
            }
        }
    });

    Ok(async_rx)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_should_ignore_rules() {
        assert!(should_ignore(Path::new("/downloads/.DS_Store")));
        assert!(should_ignore(Path::new("/downloads/file.crdownload")));
        assert!(should_ignore(Path::new("/downloads/file.tmp")));
        assert!(should_ignore(Path::new("/downloads/file.part")));
        assert!(!should_ignore(Path::new("/downloads/invoice.pdf")));
        assert!(!should_ignore(Path::new("/downloads/report.docx")));
    }
}
