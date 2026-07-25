---
name: mcp-server-design
description: Guide for implementing local stdio-based MCP (Model Context Protocol) servers using JSON-RPC 2.0. Sourced from Anthropic's official mcp-builder skill. Use when building, modifying, or debugging the mcp-server-extractor or mcp-server-filesystem tools in this project.
---

# MCP Server Development Guide

> Sourced and adapted from: Anthropic/skills mcp-builder (https://github.com/anthropics/skills)

## Overview

Create MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. For this project, both servers communicate over **stdio** (local-only, no network).

The quality of an MCP server is measured by how reliably it enables the LLM to accomplish file organization tasks.

---

## Architecture for This Project

### Two Local MCP Servers

```
mcp-server-extractor   → extract_content tool
mcp-server-filesystem  → move_and_index tool
```

Both use **stdio transport** (JSON-RPC 2.0 over stdin/stdout), not HTTP.

---

## Tool Design Principles

### 1. Tool Naming & Discoverability
Clear, action-oriented names help the LLM find the right tool. Use consistent prefixes:
- `extract_content` (not `get_text` or `parse`)
- `move_and_index` (not `move_file` or `process`)

### 2. Input Schema (JSON Schema validation)

```json
{
  "name": "extract_content",
  "description": "Extract plain text (first 2000 chars) from a file. Supports PDF, DOCX, TXT, MD, and image files (PNG, JPG via OCR if available).",
  "inputSchema": {
    "type": "object",
    "properties": {
      "file_path": {
        "type": "string",
        "description": "Absolute path to the file to extract content from."
      }
    },
    "required": ["file_path"]
  }
}
```

```json
{
  "name": "move_and_index",
  "description": "Safely move a file to a target category directory, resolve collisions by timestamp suffix, and record the transaction in the SQLite ledger.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "source_path": { "type": "string" },
      "category_path": {
        "type": "string",
        "description": "Relative path within organized folder, e.g. 'Financials/Invoices/2026'"
      },
      "summary": { "type": "string" },
      "suggested_filename": { "type": "string" },
      "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
    },
    "required": ["source_path", "category_path", "summary", "suggested_filename", "confidence"]
  }
}
```

### 3. Structured LLM JSON Output (Classification Response)

The LLM MUST respond with strictly this JSON schema when classifying documents:

```json
{
  "category_path": "Financials/Invoices/2026",
  "confidence_score": 0.92,
  "summary": "Invoice from ACME Corp for software licenses, dated March 2026.",
  "suggested_filename": "ACME_Invoice_March2026.pdf"
}
```

Enforce this with a system prompt constraint:
> "Respond ONLY with a valid JSON object matching this schema. No additional text, markdown, or explanation."

### 4. Actionable Error Messages

Error responses must guide the agent toward resolution:

```json
{
  "error": "File not found at path: /Users/user/Downloads/report.pdf. Verify the path exists and is accessible."
}
```

---

## Rust Implementation Pattern (stdio MCP)

```rust
// Process JSON-RPC 2.0 messages from stdin
use tokio::io::{AsyncBufReadExt, AsyncWriteExt};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let stdin = tokio::io::stdin();
    let mut stdout = tokio::io::stdout();
    let mut lines = tokio::io::BufReader::new(stdin).lines();

    while let Some(line) = lines.next_line().await? {
        let request: serde_json::Value = serde_json::from_str(&line)?;
        let response = handle_request(request).await;
        let response_json = serde_json::to_string(&response)? + "\n";
        stdout.write_all(response_json.as_bytes()).await?;
        stdout.flush().await?;
    }
    Ok(())
}
```

---

## Fallback Rules

| Condition | Action |
|-----------|--------|
| `confidence_score < 0.70` | Move file to `_Needs_Review/` without guessing |
| Cosine similarity > 0.85 (vector fast path) | Route automatically, skip LLM |
| Extractor fails (unsupported MIME) | Log warning, move to `_Needs_Review/` |
| Ollama not responding | Return error, keep file in place |

---

## Key Constraints for This Project

- **Zero network calls**: All MCP tool calls operate strictly on localhost.
- **Never mutate files without ledger entry**: Every `move_and_index` must write to SQLite first.
- **Filename collision**: Always check for existing files, append `_YYYYMMDDHHMMSS` suffix if needed.
- **Temporary file guard**: Ignore `.crdownload`, `.part`, `.tmp` extensions in `extract_content`.

## References
- [MCP Specification](https://modelcontextprotocol.io/specification)
- [TypeScript MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Anthropic mcp-builder skill](https://github.com/anthropics/skills/tree/main/skills/mcp-builder)
