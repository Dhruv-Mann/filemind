---
name: tauri-v2-ipc
description: Tauri v2 IPC patterns, command definitions, and frontend-backend communication rules. Use when adding new Tauri commands, modifying tauri.conf.json permissions, working on any invoke() call from the frontend, or designing the state management bridge between Rust and React.
---

# Tauri v2 IPC & Architecture

## Project Structure

```
project/
├── src/                    # React frontend
│   ├── main.tsx
│   ├── App.tsx
│   └── lib/
│       └── tauri.ts        # All invoke() wrappers (typed)
├── src-tauri/
│   ├── src/
│   │   ├── main.rs         # Entry, cfg(not(debug_assertions)) windows_subsystem
│   │   ├── lib.rs          # Builder + invoke_handler registration
│   │   └── commands/       # One file per feature area
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── capabilities/       # Permission grants (Tauri v2 style)
```

## Defining Tauri Commands

All commands live in `src-tauri/src/` and must be registered in `lib.rs`.

```rust
// src-tauri/src/commands/transactions.rs
#[tauri::command]
pub async fn get_transactions(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<FileTransaction>, String> {
    let db = state.db.lock().await;
    db.list_transactions().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn undo_transaction(
    id: String,
    state: tauri::State<'_, AppState>,
) -> Result<bool, String> {
    let db = state.db.lock().await;
    db.undo_transaction(&id).map_err(|e| e.to_string())
}
```

```rust
// src-tauri/src/lib.rs
pub struct AppState {
    pub db: tokio::sync::Mutex<crate::db::Database>,
    pub watcher_active: std::sync::Arc<std::sync::atomic::AtomicBool>,
}

pub fn run() {
    tauri::Builder::default()
        .manage(AppState { ... })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::transactions::get_transactions,
            commands::transactions::undo_transaction,
            commands::watcher::toggle_watcher,
            commands::batch::run_batch_processing,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## Frontend Typed Wrappers

Create a typed layer in `src/lib/tauri.ts` — never call `invoke()` directly from components:

```typescript
import { invoke } from '@tauri-apps/api/core';
import type { FileTransaction } from '../types';

export const getTransactions = (): Promise<FileTransaction[]> =>
  invoke<FileTransaction[]>('get_transactions');

export const undoTransaction = (id: string): Promise<boolean> =>
  invoke<boolean>('undo_transaction', { id });

export const runBatchProcessing = (): Promise<void> =>
  invoke<void>('run_batch_processing');

export const toggleWatcher = (active: boolean): Promise<boolean> =>
  invoke<boolean>('toggle_watcher', { active });
```

## Tauri v2 Permissions (tauri.conf.json)

In Tauri v2, permissions use the capabilities JSON system:

```json
// src-tauri/capabilities/default.json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capabilities",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "shell:allow-open",
    "fs:allow-read-dir",
    "fs:allow-read-file",
    "fs:allow-write-file",
    "fs:allow-rename",
    "fs:allow-mkdir",
    "fs:allow-exists"
  ]
}
```

## Real-time Events (Backend → Frontend)

Use Tauri events for pushing data from Rust to the React frontend (e.g. new file processed):

```rust
// In Rust, emit an event after processing a file
app_handle.emit("file-processed", &transaction)
    .map_err(|e| tracing::error!("Failed to emit event: {e}"))?;
```

```typescript
// In React, listen for backend events
import { listen } from '@tauri-apps/api/event';
import type { FileTransaction } from '../types';

useEffect(() => {
  const unlisten = listen<FileTransaction>('file-processed', (event) => {
    setTransactions(prev => [event.payload, ...prev]);
  });
  return () => { unlisten.then(f => f()); };
}, []);
```

## State Management Rules

- Use `tokio::sync::Mutex` for all async-shared state in `AppState`.
- Expose via `tauri::State<'_, AppState>` in commands.
- Do **NOT** use global statics or `lazy_static`. Use Tauri's managed state.

## Key Constraints

- Every `#[tauri::command]` must return `Result<T, String>` (Tauri serializes String for JS errors).
- IPC payload types must implement `serde::Serialize` and `serde::Deserialize`.
- Keep `lib.rs` clean — only builder chain + command registration.
- Filesystem permissions must be explicitly granted in capabilities JSON.

## References
- [Tauri v2 Commands](https://tauri.app/develop/calling-rust/)
- [Tauri v2 Events](https://tauri.app/develop/inter-process-communication/events/)
- [Tauri v2 Capabilities](https://tauri.app/security/capabilities/)
