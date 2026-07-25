pub mod classifier;
pub mod db;
pub mod error;
pub mod extractor;
pub mod mcp;
pub mod watcher;

use std::path::PathBuf;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;

use classifier::OllamaClassifier;
use db::{Database, FileTransaction};
use mcp::ClassificationPayload;

pub struct AppState {
    pub db: Mutex<Option<Database>>,
    pub classifier: OllamaClassifier,
}

/// Resolve directory to monitor.
/// Priority: WATCH_DIR environment variable -> system Downloads folder -> current folder.
pub fn get_target_watch_dir() -> PathBuf {
    if let Ok(override_dir) = std::env::var("WATCH_DIR") {
        PathBuf::from(override_dir)
    } else {
        dirs::download_dir().unwrap_or_else(|| PathBuf::from("."))
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Local MCP File Organizer.", name)
}

#[tauri::command]
fn get_watch_directory() -> String {
    get_target_watch_dir().to_string_lossy().to_string()
}

#[tauri::command]
async fn get_model_info(state: tauri::State<'_, Arc<AppState>>) -> Result<serde_json::Value, String> {
    let available = state.classifier.is_available().await;
    let model_name = state.classifier.get_model_name().to_string();
    Ok(serde_json::json!({
        "model": model_name,
        "available": available
    }))
}

#[tauri::command]
fn extract_file_content(file_path: String) -> Result<String, String> {
    let path = PathBuf::from(file_path);
    extractor::extract_content(&path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn classify_text(
    content: String,
    state: tauri::State<'_, Arc<AppState>>,
) -> Result<ClassificationPayload, String> {
    let default_taxonomy = vec![
        "Financials/Invoices",
        "Financials/Receipts",
        "Documents/Reports",
        "Documents/Contracts",
        "Personal/Identity",
        "Software/Code",
        "Media/Images",
        "_Needs_Review",
    ];

    state
        .classifier
        .classify_document(&content, &default_taxonomy)
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_state = Arc::new(AppState {
        db: Mutex::new(None),
        classifier: OllamaClassifier::new(),
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

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            get_watch_directory,
            get_model_info,
            extract_file_content,
            classify_text,
            get_mcp_tools,
            get_transactions,
            undo_transaction
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
