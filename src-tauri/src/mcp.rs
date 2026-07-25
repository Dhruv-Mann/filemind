use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::path::{Path, PathBuf};
use tracing::{info, warn};

use crate::error::{AppError, AppResult};
use crate::extractor;

/// JSON-RPC 2.0 Request Payload
#[derive(Debug, Deserialize, Serialize)]
pub struct JsonRpcRequest {
    pub jsonrpc: String,
    pub id: Option<Value>,
    pub method: String,
    pub params: Option<Value>,
}

/// JSON-RPC 2.0 Response Payload
#[derive(Debug, Deserialize, Serialize)]
pub struct JsonRpcResponse {
    pub jsonrpc: String,
    pub id: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub result: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<JsonRpcError>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct JsonRpcError {
    pub code: i32,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<Value>,
}

/// Classification LLM Response Contract
#[derive(Debug, Deserialize, Serialize)]
pub struct ClassificationPayload {
    pub category_path: String,
    pub confidence_score: f64,
    pub summary: String,
    pub suggested_filename: String,
}

/// Parameters for `move_and_index` tool
#[derive(Debug, Deserialize, Serialize)]
pub struct MoveAndIndexParams {
    pub source_path: String,
    pub category_path: String,
    pub summary: String,
    pub suggested_filename: String,
    pub confidence: f64,
}

/// MCP Tool Definitions (JSON Schema discovery)
pub fn list_mcp_tools() -> Value {
    json!({
        "tools": [
            {
                "name": "extract_content",
                "description": "Extract plain text (first 2000 chars) from a document (PDF, DOCX, TXT, MD, Images).",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "file_path": {
                            "type": "string",
                            "description": "Absolute path to the target file."
                        }
                    },
                    "required": ["file_path"]
                }
            },
            {
                "name": "move_and_index",
                "description": "Safely move a file to its target category directory, resolving name collisions by timestamp suffix.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "source_path": { "type": "string" },
                        "category_path": { "type": "string", "description": "e.g. Financials/Invoices/2026" },
                        "summary": { "type": "string" },
                        "suggested_filename": { "type": "string" },
                        "confidence": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
                    },
                    "required": ["source_path", "category_path", "summary", "suggested_filename", "confidence"]
                }
            }
        ]
    })
}

/// Execute the `extract_content` MCP tool call
pub fn handle_extract_content(params: &Value) -> AppResult<Value> {
    let file_path_str = params
        .get("file_path")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::Extraction("Missing required parameter: file_path".into()))?;

    let path = PathBuf::from(file_path_str);
    let extracted_text = extractor::extract_content(&path)?;

    Ok(json!({
        "content": [
            {
                "type": "text",
                "text": extracted_text
            }
        ],
        "file_path": file_path_str
    }))
}

/// Resolve destination filename collision by appending timestamp if file already exists
pub fn resolve_target_path(base_dir: &Path, category_path: &str, filename: &str) -> PathBuf {
    let target_dir = base_dir.join(category_path);

    let path_obj = Path::new(filename);
    let stem = path_obj
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("file");
    let ext = path_obj
        .extension()
        .and_then(|e| e.to_str())
        .map(|e| format!(".{}", e))
        .unwrap_or_default();

    let initial_target = target_dir.join(filename);
    if !initial_target.exists() {
        return initial_target;
    }

    // Append timestamp suffix if collision exists
    let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
    let unique_name = format!("{}_{}{}", stem, timestamp, ext);
    target_dir.join(unique_name)
}

/// Execute the `move_and_index` MCP tool call
pub fn handle_move_and_index(params: &Value, base_organize_dir: &Path) -> AppResult<Value> {
    let p: MoveAndIndexParams = serde_json::from_value(params.clone())
        .map_err(|e| AppError::Filesystem(format!("Invalid move_and_index parameters: {}", e)))?;

    let source = PathBuf::from(&p.source_path);
    if !source.exists() {
        return Err(AppError::Filesystem(format!(
            "Source file does not exist: {}",
            p.source_path
        )));
    }

    // Low confidence routing rule: if confidence < 0.70, route to _Needs_Review/
    let effective_category = if p.confidence < 0.70 {
        warn!(
            confidence = p.confidence,
            source = %source.display(),
            "Low confidence score, routing to _Needs_Review/"
        );
        "_Needs_Review".to_string()
    } else {
        p.category_path
    };

    let destination = resolve_target_path(base_organize_dir, &effective_category, &p.suggested_filename);

    // Create target directory if missing
    if let Some(parent) = destination.parent() {
        std::fs::create_dir_all(parent)?;
    }

    // Move file
    std::fs::rename(&source, &destination)?;

    info!(
        from = %source.display(),
        to = %destination.display(),
        confidence = p.confidence,
        "File moved successfully via MCP"
    );

    Ok(json!({
        "status": "success",
        "original_path": source.to_string_lossy(),
        "new_path": destination.to_string_lossy(),
        "category_path": effective_category,
        "summary": p.summary,
        "confidence": p.confidence
    }))
}

/// Handle incoming JSON-RPC 2.0 stdio requests
pub fn process_jsonrpc_request(req: JsonRpcRequest, base_organize_dir: &Path) -> JsonRpcResponse {
    let id = req.id.clone();
    let result = match req.method.as_str() {
        "tools/list" => Ok(list_mcp_tools()),
        "tools/call" => {
            let params = req.params.unwrap_or(json!({}));
            let name = params.get("name").and_then(|n| n.as_str()).unwrap_or("");
            let arguments = params.get("arguments").cloned().unwrap_or(json!({}));

            match name {
                "extract_content" => handle_extract_content(&arguments),
                "move_and_index" => handle_move_and_index(&arguments, base_organize_dir),
                _ => Err(AppError::Classification(format!("Unknown tool: {}", name))),
            }
        }
        _ => Err(AppError::Classification(format!("Unsupported method: {}", req.method))),
    };

    match result {
        Ok(res) => JsonRpcResponse {
            jsonrpc: "2.0".into(),
            id,
            result: Some(res),
            error: None,
        },
        Err(e) => JsonRpcResponse {
            jsonrpc: "2.0".into(),
            id,
            result: None,
            error: Some(JsonRpcError {
                code: -32603,
                message: e.to_string(),
                data: None,
            }),
        },
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_list_tools() {
        let tools = list_mcp_tools();
        assert!(tools.get("tools").is_some());
    }

    #[test]
    fn test_collision_resolution() {
        let dir = tempdir().expect("Create tempdir");
        let base = dir.path();

        let path1 = resolve_target_path(base, "Documents", "test.txt");
        assert_eq!(path1, base.join("Documents").join("test.txt"));

        // Create target directory and file
        std::fs::create_dir_all(base.join("Documents")).unwrap();
        std::fs::write(base.join("Documents").join("test.txt"), "existing").unwrap();

        let path2 = resolve_target_path(base, "Documents", "test.txt");
        assert_ne!(path2, path1);
        assert!(path2.to_string_lossy().contains("test_"));
    }
}
