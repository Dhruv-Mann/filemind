---
name: ollama-local-llm
description: Ollama API integration patterns for local LLM inference on localhost:11434. Use when working on the classifier.rs module, the hybrid classification pipeline, Ollama health checks, or embedding generation. This keeps all LLM calls strictly local and private.
---

# Ollama Local LLM Integration

## Core Principle

**Zero network calls outside localhost.** All Ollama API calls use `http://localhost:11434`. Never introduce any external HTTP endpoint.

---

## Ollama API Reference

### Health Check
```
GET http://localhost:11434/api/tags
```
Returns list of available models. Use this to verify Ollama is running before file processing begins.

### Text Generation (Classification)
```
POST http://localhost:11434/api/generate
Content-Type: application/json

{
  "model": "llama3.2:3b-instruct-q4_K_M",
  "prompt": "...",
  "stream": false,
  "format": "json",
  "options": {
    "temperature": 0.1,
    "num_predict": 256
  }
}
```

### Embeddings (384-dim via bge-small-en-v1.5)
```
POST http://localhost:11434/api/embeddings
Content-Type: application/json

{
  "model": "bge-small-en-v1.5",
  "prompt": "Invoice for software licenses from ACME Corp"
}
```

---

## Rust Implementation

```rust
// src-tauri/src/classifier.rs
use reqwest::Client;
use serde::{Deserialize, Serialize};

const OLLAMA_BASE: &str = "http://localhost:11434";
const MODEL_ID: &str = "llama3.2:3b-instruct-q4_K_M";
const EMBED_MODEL: &str = "bge-small-en-v1.5";

#[derive(Debug, Serialize)]
struct GenerateRequest<'a> {
    model: &'a str,
    prompt: String,
    stream: bool,
    format: &'a str,
    options: GenerateOptions,
}

#[derive(Debug, Serialize)]
struct GenerateOptions {
    temperature: f32,
    num_predict: u32,
}

#[derive(Debug, Deserialize)]
struct GenerateResponse {
    response: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ClassificationResult {
    pub category_path: String,
    pub confidence_score: f64,
    pub summary: String,
    pub suggested_filename: String,
}

pub struct OllamaClient {
    client: Client,
}

impl OllamaClient {
    pub fn new() -> Self {
        Self {
            client: Client::builder()
                .timeout(std::time::Duration::from_secs(30))
                .build()
                .expect("Failed to build HTTP client"),
        }
    }

    /// Check if Ollama is running and model is available
    pub async fn is_available(&self) -> bool {
        self.client
            .get(format!("{OLLAMA_BASE}/api/tags"))
            .send()
            .await
            .map(|r| r.status().is_success())
            .unwrap_or(false)
    }

    /// Classify a document using the local LLM
    pub async fn classify(&self, content_snippet: &str, taxonomy: &[&str]) -> Result<ClassificationResult, crate::error::AppError> {
        let taxonomy_list = taxonomy.join("\n- ");
        let prompt = format!(
            r#"You are a file organization assistant. Classify the following document content into ONE category from the taxonomy below.

Available categories:
- {taxonomy_list}

Document content:
{content_snippet}

Respond ONLY with a valid JSON object. No markdown, no explanation, no extra text:
{{
  "category_path": "Category/Subcategory/Year",
  "confidence_score": 0.95,
  "summary": "One sentence describing this document.",
  "suggested_filename": "descriptive-filename.ext"
}}"#
        );

        let body = GenerateRequest {
            model: MODEL_ID,
            prompt,
            stream: false,
            format: "json",
            options: GenerateOptions { temperature: 0.1, num_predict: 256 },
        };

        let res = self.client
            .post(format!("{OLLAMA_BASE}/api/generate"))
            .json(&body)
            .send()
            .await
            .map_err(|e| crate::error::AppError::Classification(e.to_string()))?;

        let gen: GenerateResponse = res.json().await
            .map_err(|e| crate::error::AppError::Classification(e.to_string()))?;

        serde_json::from_str::<ClassificationResult>(&gen.response)
            .map_err(|e| crate::error::AppError::Classification(
                format!("Failed to parse LLM JSON response: {e}\nRaw: {}", gen.response)
            ))
    }

    /// Generate embeddings for a text snippet
    pub async fn embed(&self, text: &str) -> Result<Vec<f32>, crate::error::AppError> {
        #[derive(Serialize)]
        struct EmbedReq<'a> { model: &'a str, prompt: &'a str }
        #[derive(Deserialize)]
        struct EmbedRes { embedding: Vec<f32> }

        let res = self.client
            .post(format!("{OLLAMA_BASE}/api/embeddings"))
            .json(&EmbedReq { model: EMBED_MODEL, prompt: text })
            .send()
            .await
            .map_err(|e| crate::error::AppError::Classification(e.to_string()))?;

        let embed: EmbedRes = res.json().await
            .map_err(|e| crate::error::AppError::Classification(e.to_string()))?;
        Ok(embed.embedding)
    }
}
```

---

## Hybrid Classification Pipeline

```
New file detected
     │
     ▼
Extract text (first 2000 chars)
     │
     ▼
Generate embedding (384-dim)
     │
     ▼
Compare against taxonomy embeddings in LanceDB
     │
Similarity > 0.85? ──YES──► Auto-route (fast path)
     │ NO
     ▼
Send to Ollama (reasoning path)
     │
confidence_score < 0.70? ──YES──► Move to _Needs_Review/
     │ NO
     ▼
Move to category_path (execute + log in SQLite)
```

---

## Confidence Thresholds

| Score | Action |
|-------|--------|
| Vector similarity > 0.85 | Fast path auto-route |
| LLM confidence ≥ 0.70 | Execute move + log |
| LLM confidence < 0.70 | Move to `_Needs_Review/` |

---

## Privacy Guarantee

- **No external API calls**: `reqwest` in `src-tauri` must NEVER contact any host other than `localhost` or `127.0.0.1`.
- Enforce this at `Cargo.toml` level with `reqwest`'s default-features disabled for TLS if needed.
- The Tauri CSP must block all non-localhost network requests.

## References
- [Ollama REST API](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [llama3.2 model card](https://ollama.com/library/llama3.2)
- [bge-small-en-v1.5](https://ollama.com/library/bge-small-en-v1.5)
