pub mod error;
pub mod extractor;
pub mod watcher;

use std::path::PathBuf;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Local MCP File Organizer.", name)
}

#[tauri::command]
fn extract_file_content(file_path: String) -> Result<String, String> {
    let path = PathBuf::from(file_path);
    extractor::extract_content(&path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, extract_file_content])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
