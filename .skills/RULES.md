# Rules — Coding Standards & Conventions

## Applies To
All code in `d:\GitHub\Local MCP Semantic File Organizer`

---

## Universal Rules

### 1. Privacy-First — Zero External Network Calls
**NEVER** make HTTP requests to any external server. All network calls must go to:
- `http://localhost:11434` (Ollama)
- `http://localhost:*` only

Audit every `reqwest` call. The Tauri CSP in `tauri.conf.json` must block all non-localhost origins.

### 2. No `unwrap()` in Production Code
Replace every `.unwrap()` and `.expect("...")` in `src-tauri/src/` (except in tests) with proper error propagation:
```rust
// ❌ Never
let x = something.unwrap();

// ✅ Always
let x = something.map_err(|e| AppError::Filesystem(e.to_string()))?;
```

### 3. Every File Move Must Be Ledgered
Before moving any file, write the transaction to SQLite. On failure, do NOT move the file. Atomic: ledger first, filesystem second.

### 4. Typed IPC Only
Never pass raw `serde_json::Value` through Tauri IPC. All `invoke()` arguments and return types must be typed:
- Rust side: `serde::Serialize + serde::Deserialize` structs
- TypeScript side: explicit interface types in `src/types/`

---

## Rust Rules

### Code Style
- **Edition**: Rust 2021
- **Formatting**: `rustfmt` (run `cargo fmt` before commit)
- **Linting**: `cargo clippy -- -D warnings` (zero warnings)
- **Line length**: 100 chars max

### Error Types
- Use `thiserror` for error enum derivation
- All `#[tauri::command]` functions return `Result<T, String>`
- Internal functions return `Result<T, AppError>`

### Async
- Use `tokio` runtime (configured in Tauri)
- Blocking I/O in `tokio::task::spawn_blocking`
- No `std::thread::sleep` in async contexts — use `tokio::time::sleep`

### Naming
- Files: `snake_case.rs`
- Public structs: `PascalCase`
- Functions: `snake_case`
- Constants: `SCREAMING_SNAKE_CASE`

---

## TypeScript / React Rules

### Code Style
- **Strict mode**: `"strict": true` in `tsconfig.json`
- **No `any`**: Use `unknown` + type guards if needed
- **Formatting**: Prettier with default settings

### Component Rules
- Functional components ONLY
- Named exports (not default exports) for all components
- Every component in `src/components/<ComponentName>.tsx`
- Hooks in `src/hooks/use<HookName>.ts`
- Tauri API wrappers only in `src/lib/tauri.ts`

### State Management
- Component state: `useState` / `useReducer`
- No Redux, Zustand, or external state libraries unless explicitly needed
- Backend events: `listen()` from `@tauri-apps/api/event`, always cleanup in `useEffect` return

---

## File Organization Rules

### Temporary File Handling
NEVER process files with these extensions:
- `.crdownload` (Chrome partial download)
- `.part` (Firefox partial download)
- `.tmp`, `.temp`
- `.download`
- Files starting with `.` (hidden)

### Filename Collision Resolution
When target filename already exists:
```
report.pdf → report_20260125_143022.pdf
```
Format: `<basename>_<YYYYMMDD_HHMMSS>.<ext>`

### Low-Confidence Routing
If `confidence_score < 0.70`: route to `_Needs_Review/` subfolder, never guess the category.

---

## Git Rules

### Commit Messages
Follow Conventional Commits:
```
feat(watcher): add 4-second debounce pipeline
fix(db): prevent double-undo on ledger entries
refactor(classifier): extract embedding logic to separate module
```

### Branches
- `main` — stable, working builds only
- `phase/<n>-<description>` — per phase development

### Never Commit
- `*.db`, `*.db-wal`, `*.db-journal` (SQLite files)
- `target/` (Rust build artifacts)
- `node_modules/`
- `.env` files

---

## Security Rules

1. **File paths from IPC must be validated** — check the path is within allowed directories before any filesystem operation.
2. **No shell command execution** from user-provided input.
3. **SQLite params**: Always use parameterized queries (`params![]`), never string interpolation.
4. **Tauri capabilities**: Only grant the minimum required filesystem permissions in `capabilities/default.json`.
