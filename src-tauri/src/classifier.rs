use reqwest::Client;
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::error::{AppError, AppResult};
use crate::mcp::ClassificationPayload;

const OLLAMA_BASE_DEFAULT: &str = "http://localhost:11434";
const DEFAULT_MODEL: &str = "qwen3.5:4b";

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

pub struct OllamaClassifier {
    client: Client,
    base_url: String,
    model_name: String,
}

impl OllamaClassifier {
    pub fn new() -> Self {
        let base_url = std::env::var("OLLAMA_BASE_URL")
            .unwrap_or_else(|_| OLLAMA_BASE_DEFAULT.to_string());
        let model_name = std::env::var("OLLAMA_MODEL")
            .unwrap_or_else(|_| DEFAULT_MODEL.to_string());

        Self {
            client: Client::builder()
                .timeout(std::time::Duration::from_secs(45))
                .build()
                .expect("Failed to build HTTP client for Ollama"),
            base_url,
            model_name,
        }
    }

    pub fn get_model_name(&self) -> &str {
        &self.model_name
    }

    /// Health check to verify Ollama server connectivity on localhost:11434
    pub async fn is_available(&self) -> bool {
        self.client
            .get(format!("{}/api/tags", self.base_url))
            .send()
            .await
            .map(|r| r.status().is_success())
            .unwrap_or(false)
    }

    /// Classify a document snippet into a structured taxonomy using Ollama
    pub async fn classify_document(
        &self,
        content_snippet: &str,
        taxonomy_categories: &[&str],
    ) -> AppResult<ClassificationPayload> {
        let taxonomy_formatted = taxonomy_categories.join("\n- ");

        let prompt = format!(
            r#"You are an automated file organization assistant. Analyze the document content snippet below and classify it into ONE category path from the taxonomy list.

Target Taxonomy Categories:
- {taxonomy_formatted}

Document Content Snippet:
"""
{content_snippet}
"""

Respond ONLY with a single valid JSON object matching this schema exactly. Do NOT include any markdown codeblocks, explanation, or additional text:
{{
  "category_path": "Category/Subcategory/Year",
  "confidence_score": 0.95,
  "summary": "One sentence summary describing the document.",
  "suggested_filename": "descriptive_filename.ext"
}}"#
        );

        let payload = GenerateRequest {
            model: &self.model_name,
            prompt,
            stream: false,
            format: "json",
            options: GenerateOptions {
                temperature: 0.1,
                num_predict: 256,
            },
        };

        info!(
            model = %self.model_name,
            url = %self.base_url,
            "Sending classification request to local Ollama API"
        );

        let response = self
            .client
            .post(format!("{}/api/generate", self.base_url))
            .json(&payload)
            .send()
            .await
            .map_err(|e| {
                AppError::Classification(format!(
                    "Failed to communicate with Ollama at {}: {}",
                    self.base_url, e
                ))
            })?;

        let gen_res: GenerateResponse = response.json().await.map_err(|e| {
            AppError::Classification(format!("Failed to parse Ollama HTTP response: {}", e))
        })?;

        let result: ClassificationPayload = serde_json::from_str(&gen_res.response).map_err(|e| {
            AppError::Classification(format!(
                "Failed to parse LLM JSON schema output: {}\nRaw LLM output: {}",
                e, gen_res.response
            ))
        })?;

        info!(
            category = %result.category_path,
            confidence = result.confidence_score,
            summary = %result.summary,
            "Successfully classified document via local Ollama"
        );

        Ok(result)
    }
}
