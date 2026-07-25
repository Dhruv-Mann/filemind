# References — Skills & External Resources

## Source Repositories Researched

| Repository | Stars | URL |
|-----------|-------|-----|
| PatrickJS/awesome-cursorrules | 40.4k ⭐ | https://github.com/PatrickJS/awesome-cursorrules |
| VoltAgent/awesome-agent-skills | 1497+ skills | https://github.com/VoltAgent/awesome-agent-skills |
| anthropics/skills | Official | https://github.com/anthropics/skills |
| officialskills.sh | Directory | https://officialskills.sh |
| cursor.directory | Rules hub | https://cursor.directory |

---

## Skills Included in This Project (`.skills/`)

| File | Source | Tech Area |
|------|--------|-----------|
| `rust-best-practices.md` | awesome-cursorrules Rust ruleset + official Rust API Guidelines | Rust backend patterns |
| `tauri-v2-ipc.md` | awesome-cursorrules Tauri rules + Tauri v2 official docs | Tauri IPC, permissions, events |
| `mcp-server-design.md` | **Anthropic/skills mcp-builder** (official) | MCP protocol, tool design |
| `react-typescript-ui.md` | awesome-cursorrules React/TypeScript/Tailwind ruleset | React 18 + TypeScript frontend |
| `sqlite-ledger-patterns.md` | rusqlite docs + community SQLite Rust patterns | SQLite ledger, undo engine |
| `ollama-local-llm.md` | Ollama API docs + privacy-first LLM patterns | Local LLM, embeddings, classification |
| `file-watcher-debounce.md` | notify crate docs + debounce engineering patterns | notify watcher, download safety |
| `frontend-design-aesthetic.md` | **Anthropic/skills frontend-design** (official) | Visual design, dark mode, glassmorphism |

---

## Key External Documentation

### Rust
- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- [Tokio Tutorial](https://tokio.rs/tokio/tutorial)
- [thiserror crate](https://docs.rs/thiserror)
- [notify crate](https://docs.rs/notify/latest/notify/)
- [rusqlite docs](https://docs.rs/rusqlite/)
- [uuid crate](https://docs.rs/uuid)
- [chrono crate](https://docs.rs/chrono)
- [pdf-extract crate](https://docs.rs/pdf-extract)
- [docx-rs crate](https://docs.rs/docx-rs)

### Tauri
- [Tauri v2 Quickstart](https://tauri.app/start/)
- [Tauri v2 Commands](https://tauri.app/develop/calling-rust/)
- [Tauri v2 Events](https://tauri.app/develop/inter-process-communication/events/)
- [Tauri v2 Capabilities](https://tauri.app/security/capabilities/)
- [Tauri v2 Plugin Shell](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/shell)

### React + TypeScript
- [React 18 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### MCP Protocol
- [MCP Specification](https://modelcontextprotocol.io/specification)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [Anthropic MCP Builder Skill](https://github.com/anthropics/skills/tree/main/skills/mcp-builder)

### Ollama
- [Ollama REST API](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [llama3.2 on Ollama](https://ollama.com/library/llama3.2)
- [bge-small-en-v1.5 embeddings](https://ollama.com/library/bge-small-en-v1.5)

### Vector Database
- [LanceDB Rust Docs](https://lancedb.github.io/lancedb/basic/)
- [LanceDB Embeddings Guide](https://lancedb.github.io/lancedb/embeddings/)

---

## Agent Compatibility

These skills are formatted to be compatible with:
- **Antigravity IDE** (this environment)
- Claude Code
- Cursor (as `.mdc` rules)
- GitHub Copilot (via AGENTS.md references)
- Gemini CLI

To convert any `.md` in `.skills/` to a Cursor `.mdc` rule:
1. Copy contents to `.cursor/rules/<name>.mdc`
2. Add YAML frontmatter with `globs` patterns if needed
