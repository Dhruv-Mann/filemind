# Local MCP Semantic File Organizer — Agent Context

## What This Project Is

A 100% local, privacy-first desktop application that automatically organizes `~/Downloads` using semantic content analysis. Built with Tauri v2 (Rust backend + React/TypeScript frontend). All AI inference runs locally via Ollama.

**No external network calls. Ever.**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Framework | Tauri v2 |
| Backend Language | Rust (Edition 2021) |
| Frontend | React 18 + TypeScript + Tailwind CSS v3 |
| Local LLM | Ollama (`llama3.2:3b-instruct-q4_K_M`) at `http://localhost:11434` |
| Embeddings | `bge-small-en-v1.5` via Ollama embedding API |
| Vector DB | LanceDB (embedded) |
| Transaction Ledger | SQLite via `rusqlite` |
| File Watcher | `notify` crate with 4-second debounce |
| Text Extractors | `pdf-extract`, `docx-rs`, std fs |
| Protocol | MCP (Model Context Protocol) stdio/JSON-RPC 2.0 |

---

## Project Structure

```
Local MCP Semantic File Organizer/
├── .skills/               ← Agent skills & rules (YOU ARE HERE)
│   ├── AGENTS.md          ← This file
│   ├── RULES.md           ← Coding standards
│   ├── REFERENCES.md      ← External docs & source repos
│   ├── rust-best-practices.md
│   ├── tauri-v2-ipc.md
│   ├── mcp-server-design.md
│   ├── react-typescript-ui.md
│   ├── sqlite-ledger-patterns.md
│   ├── ollama-local-llm.md
│   ├── file-watcher-debounce.md
│   └── frontend-design-aesthetic.md
│
├── src/                   ← React/TypeScript frontend
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/             ← TypeScript interfaces
│   ├── components/        ← React UI components
│   ├── hooks/             ← Custom React hooks
│   └── lib/
│       └── tauri.ts       ← Typed Tauri invoke() wrappers
│
├── src-tauri/             ← Rust backend
│   ├── src/
│   │   ├── main.rs        ← Entry point
│   │   ├── lib.rs         ← Tauri builder + command registration
│   │   ├── db.rs          ← SQLite ledger (rusqlite)
│   │   ├── watcher.rs     ← notify file watcher
│   │   ├── extractor.rs   ← Text extraction (PDF, DOCX, TXT, images)
│   │   ├── classifier.rs  ← Ollama client + hybrid classification
│   │   ├── mcp.rs         ← MCP stdio tool handlers
│   │   └── error.rs       ← AppError enum
│   ├── Cargo.toml
│   ├── build.rs
│   └── tauri.conf.json
│
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## Build & Dev Commands

```bash
# Install frontend dependencies
npm install

# Start full Tauri dev server (frontend + backend)
npm run tauri dev

# Check Rust code (no compile)
cd src-tauri && cargo check

# Run Rust lints
cd src-tauri && cargo clippy -- -D warnings

# Format Rust code
cd src-tauri && cargo fmt

# Build production bundle
npm run tauri build
```

---

## Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Done | Project foundation & Tauri v2 scaffold |
| 2 | 🔲 Next | Rust file watcher & extraction modules |
| 3 | 🔲 | Local MCP server implementation |
| 4 | 🔲 | SQLite transaction ledger & undo engine |
| 5 | 🔲 | Dashboard UI |

---

## Core Rules Summary

1. **Zero external HTTP calls** — only `http://localhost:11434`
2. **No `unwrap()` in production code** — use `?` with typed errors
3. **Every file move must be recorded in SQLite first**
4. **Ignore `.crdownload`, `.part`, `.tmp` files**
5. **`confidence_score < 0.70` → route to `_Needs_Review/`**
6. **Typed IPC only** — structs with `serde::Serialize/Deserialize`
7. **Named exports** for all React components
8. **Tauri invoke() wrappers only in `src/lib/tauri.ts`**

---

## Skill Quick Reference

| Question | Read This Skill |
|---------|----------------|
| "How do I write a new Tauri command?" | `tauri-v2-ipc.md` |
| "How do I handle errors in Rust?" | `rust-best-practices.md` |
| "How do I add an MCP tool?" | `mcp-server-design.md` |
| "How do I build a React component?" | `react-typescript-ui.md` |
| "How do I add a DB query?" | `sqlite-ledger-patterns.md` |
| "How do I call Ollama?" | `ollama-local-llm.md` |
| "How does the file watcher work?" | `file-watcher-debounce.md` |
| "What's the design aesthetic?" | `frontend-design-aesthetic.md` |
