pub mod classifier;
pub mod db;
pub mod error;
pub mod extractor;
pub mod mcp;
pub mod watcher;

use std::path::PathBuf;
use std::sync::atomic::AtomicBool;
use std::sync::Arc;
use tauri::Emitter;
use tauri::Manager;
use tokio::sync::Mutex;
use tracing::{error, info};

use classifier::OllamaClassifier;
use db::{Database, FileTransaction};
use mcp::ClassificationPayload;

pub struct AppState {
    pub db: Mutex<Option<Database>>,
    pub classifier: OllamaClassifier,
    pub is_watcher_active: Arc<AtomicBool>,
}

/// Resolve directory to monitor.
/// Priority: WATCH_DIR env variable (validated) -> system Downloads/Downloads -> system Downloads -> current dir.
pub fn get_target_watch_dir() -> PathBuf {
    if let Ok(override_dir) = std::env::var("WATCH_DIR") {
        let path = PathBuf::from(&override_dir);
        if path.exists() && path.is_dir() {
            return path;
        }
        // Invalid WATCH_DIR — log and fall through to defaults
        tracing::warn!(path = %override_dir, "WATCH_DIR env variable points to a non-existent or non-directory path, ignoring");
    }

    if let Some(sys_downloads) = dirs::download_dir() {
        let nested_downloads = sys_downloads.join("Downloads");
        if nested_downloads.exists() && nested_downloads.is_dir() {
            return nested_downloads;
        }
        return sys_downloads;
    }

    PathBuf::from(".")
}

/// Core pipeline: Extract content -> Classify via local LLM AI -> Move file via MCP -> Write SQLite ledger -> Emit event
pub async fn process_detected_file(
    file_path: PathBuf,
    app_state: Arc<AppState>,
    app_handle: tauri::AppHandle,
) {
    if watcher::should_ignore(&file_path) || !file_path.is_file() {
        return;
    }

    info!(path = %file_path.display(), "Processing file through semantic AI classification pipeline");

    let watch_dir = get_target_watch_dir();

    // 1. Extract plain text content (first 2,000 chars)
    let content_snippet = match extractor::extract_content(&file_path) {
        Ok(c) => c,
        Err(e) => {
            error!(path = %file_path.display(), error = %e, "Failed to extract content");
            return;
        }
    };

    // 2. Pure AI Semantic Document Classification via local Ollama LLM
    let classification = match app_state
        .classifier
        .classify_document(&file_path, &content_snippet)
        .await
    {
        Ok(res) => res,
        Err(e) => {
            error!(path = %file_path.display(), error = %e, "Classification failed");
            return;
        }
    };

    // 3. Safely move file and resolve collisions via MCP handler
    let move_params = serde_json::json!({
        "source_path": file_path.to_string_lossy(),
        "category_path": classification.category_path,
        "summary": classification.summary,
        "suggested_filename": classification.suggested_filename,
        "confidence": classification.confidence_score,
    });

    let move_result = match mcp::handle_move_and_index(&move_params, &watch_dir) {
        Ok(res) => res,
        Err(e) => {
            error!(path = %file_path.display(), error = %e, "MCP move_and_index failed");
            return;
        }
    };

    let original_path = move_result.get("original_path").and_then(|v| v.as_str()).unwrap_or("");
    let new_path = move_result.get("new_path").and_then(|v| v.as_str()).unwrap_or("");
    let effective_category = move_result.get("category_path").and_then(|v| v.as_str()).unwrap_or("_Needs_Review");
    let summary = move_result.get("summary").and_then(|v| v.as_str()).unwrap_or("");
    let confidence = move_result.get("confidence").and_then(|v| v.as_f64()).unwrap_or(0.0);

    // 4. Record transaction in SQLite ledger
    let guard = app_state.db.lock().await;
    if let Some(ref db) = *guard {
        if let Ok(tx) = db.record_transaction(original_path, new_path, summary, effective_category, confidence) {
            info!(id = %tx.id, category = %effective_category, "Emitting file-processed event to frontend");
            // 5. Emit real-time event to React frontend
            let _ = app_handle.emit("file-processed", &tx);
        }
    }
}


#[tauri::command]
fn get_watch_directory() -> String {
    get_target_watch_dir().to_string_lossy().to_string()
}

#[tauri::command]
async fn get_model_info(state: tauri::State<'_, Arc<AppState>>) -> Result<serde_json::Value, String> {
    let available = state.classifier.is_available().await;
    let model_name = state.classifier.get_model_name().to_string();
    let watch_dir = get_target_watch_dir().to_string_lossy().to_string();
    Ok(serde_json::json!({
        "model": model_name,
        "available": available,
        "watch_dir": watch_dir
    }))
}

#[tauri::command]
fn extract_file_content(file_path: String) -> Result<String, String> {
    let path = PathBuf::from(file_path);
    extractor::extract_content(&path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn classify_text(
    file_path: String,
    content: String,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<ClassificationPayload, String> {
    let path = PathBuf::from(file_path);
    state
        .classifier
        .classify_document(&path, &content)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_mcp_tools() -> serde_json::Value {
    mcp::list_mcp_tools()
}

#[tauri::command]
async fn get_transactions(
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<Vec<FileTransaction>, String> {
    let guard = state.db.lock().await;
    if let Some(ref db) = *guard {
        db.list_transactions().map_err(|e| e.to_string())
    } else {
        Ok(Vec::new())
    }
}

#[tauri::command]
async fn undo_transaction(
    id: String,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<FileTransaction, String> {
    let guard = state.db.lock().await;
    if let Some(ref db) = *guard {
        db.undo_transaction(&id).map_err(|e| e.to_string())
    } else {
        Err("Database is not initialized".into())
    }
}

#[tauri::command]
async fn run_batch_processing(
    state: tauri::State<'_, Arc<AppState>>,
    app_handle: tauri::AppHandle,
) -> Result<usize, String> {
    let watch_dir = get_target_watch_dir();
    let mut count = 0;

    if let Ok(entries) = std::fs::read_dir(&watch_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() && !watcher::should_ignore(&path) {
                count += 1;
                let state_clone = state.inner().clone();
                let handle_clone = app_handle.clone();
                tokio::spawn(async move {
                    process_detected_file(path, state_clone, handle_clone).await;
                });
            }
        }
    }

    Ok(count)
}

#[tauri::command]
fn launch_external_url(url: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("cmd")
            .args(["/C", "start", "", &url])
            .spawn();
    }
    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("open")
            .arg(&url)
            .spawn();
    }
    #[cfg(target_os = "linux")]
    {
        let _ = std::process::Command::new("xdg-open")
            .arg(&url)
            .spawn();
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let is_active = Arc::new(AtomicBool::new(true));
    let app_state = Arc::new(AppState {
        db: Mutex::new(None),
        classifier: OllamaClassifier::new(),
        is_watcher_active: is_active.clone(),
    });

    let state_clone = app_state.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(app_state)
        .setup(move |app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| PathBuf::from("."));
            let db_path = app_data_dir.join("ledger.db");

            if let Ok(database) = Database::new(&db_path) {
                let state_inner = state_clone.clone();
                tauri::async_runtime::block_on(async move {
                    let mut guard = state_inner.db.lock().await;
                    *guard = Some(database);
                });
            }

            // Start file watcher debouncer background task
            let watch_dir = get_target_watch_dir();
            if let Ok(mut rx) = watcher::start_debounced_watcher(watch_dir.clone(), is_active) {
                let state_watcher = state_clone.clone();
                let handle_watcher = app.handle().clone();

                info!(watch_dir = %watch_dir.display(), "Debounced watcher background loop initialized");

                tauri::async_runtime::spawn(async move {
                    while let Some(file_path) = rx.recv().await {
                        process_detected_file(file_path, state_watcher.clone(), handle_watcher.clone()).await;
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_watch_directory,
            get_model_info,
            extract_file_content,
            classify_text,
            get_mcp_tools,
            get_transactions,
            undo_transaction,
            run_batch_processing,
            launch_external_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
