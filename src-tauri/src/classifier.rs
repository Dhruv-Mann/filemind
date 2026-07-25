use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::path::Path;
use tracing::{info, warn};

use crate::error::AppResult;
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
                .timeout(std::time::Duration::from_secs(30))
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

    /// Pure AI Semantic Document Classification using local Ollama model (e.g. qwen3.5:4b)
    pub async fn classify_document(
        &self,
        file_path: &Path,
        content_snippet: &str,
    ) -> AppResult<ClassificationPayload> {
        let filename = file_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("file");

        let extension = file_path
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("unknown");

        let prompt = format!(
            r#"You are an intelligent file organization AI. Analyze the file details and extracted text content below to categorize it.

File Name: "{filename}"
File Extension: "{extension}"
Extracted Content / Metadata:
"""
{content_snippet}
"""

CRITICAL RULE FOR SUMMARY:
The "summary" field MUST be a 1-sentence description based strictly on the TEXT INSIDE the document.
NEVER say "Organized by file type" or repeat the filename. If text is unreadable, summarize the visual content or metadata purpose.

Respond ONLY with a single JSON object matching this schema. No reasoning or markdown:
{{
  "category_path": "Category/Subcategory",
  "confidence_score": 0.90,
  "summary": "One-sentence description based strictly on the text inside the document.",
  "suggested_filename": "{filename}"
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
            file = %filename,
            "Requesting semantic classification from local LLM"
        );

        let response_result = self
            .client
            .post(format!("{}/api/generate", self.base_url))
            .json(&payload)
            .send()
            .await;

        match response_result {
            Ok(res) if res.status().is_success() => {
                if let Ok(gen_res) = res.json::<GenerateResponse>().await {
                    info!(raw_output = %gen_res.response, "Received response from local LLM");
                    match clean_and_parse_json(&gen_res.response) {
                        Ok(parsed) => return Ok(parsed),
                        Err(err) => warn!(error = %err, raw = %gen_res.response, "JSON parse failed, using fallback"),
                    }
                }
            }
            Ok(res) => {
                warn!(status = %res.status(), "Ollama API returned non-success status code");
            }
            Err(e) => {
                warn!(error = %e, "Ollama request failed");
            }
        }

        // Clean fallback adhering strictly to the CRITICAL RULE:
        // Never say "Organized by file type" and never repeat the filename.
        let generic_category = match extension.to_lowercase().as_str() {
            "pdf" | "docx" | "txt" | "md" => "Documents/Files",
            "exe" | "msi" | "dmg" | "pkg" => "Applications/Installers",
            "zip" | "rar" | "7z" | "tar" | "gz" => "Archives/Compressed",
            "png" | "jpg" | "jpeg" | "webp" | "gif" => "Media/Images",
            "mp3" | "wav" | "flac" | "m4a" => "Media/Audio",
            _ => "Uncategorized/Files",
        };

        let content_lines: Vec<&str> = content_snippet
            .lines()
            .map(|l| l.trim())
            .filter(|l| !l.is_empty() && !l.starts_with("Generic File:") && !l.starts_with("Image File:"))
            .collect();

        let fallback_summary = if !content_lines.is_empty() {
            format!("Contains text content: {}", content_lines[0])
        } else {
            match extension.to_lowercase().as_str() {
                "pdf" | "docx" | "txt" | "md" => "Document containing structured text content and metadata.".to_string(),
                "exe" | "msi" => "Software installer application executable binary.".to_string(),
                "zip" | "rar" | "7z" => "Compressed archive package containing project files and assets.".to_string(),
                "png" | "jpg" | "jpeg" | "webp" => "Visual image graphic artifact asset.".to_string(),
                "mp3" | "wav" | "flac" => "Audio media recording artifact asset.".to_string(),
                _ => "Data file asset.".to_string(),
            }
        };

        Ok(ClassificationPayload {
            category_path: generic_category.to_string(),
            confidence_score: 0.75,
            summary: fallback_summary,
            suggested_filename: filename.to_string(),
        })
    }
}

/// Helper function to strip Qwen reasoning tags (<think>...</think>), markdown code fences, and parse clean JSON
fn clean_and_parse_json(raw: &str) -> Result<ClassificationPayload, String> {
    let mut cleaned = raw;

    // Strip <think>...</think> reasoning blocks if Qwen 3.5 generated them
    if let Some(end_think) = cleaned.rfind("</think>") {
        cleaned = &cleaned[end_think + 8..];
    }

    // Strip markdown ```json ... ``` wrapper
    if let Some(start_code) = cleaned.find("```") {
        if let Some(brace_start) = cleaned[start_code..].find('{') {
            cleaned = &cleaned[start_code + brace_start..];
        }
    }

    // Find first '{' and last '}'
    let start = cleaned.find('{').ok_or("No opening brace '{' found")?;
    let end = cleaned.rfind('}').ok_or("No closing brace '}' found")?;

    if start > end {
        return Err("Invalid JSON structure".into());
    }

    let json_str = &cleaned[start..=end];
    serde_json::from_str::<ClassificationPayload>(json_str)
        .map_err(|e| format!("JSON parse error: {} on string: {}", e, json_str))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_and_parse_json_with_thinking_and_markdown() {
        let raw = "<think>\nThe user provided a timetable PDF. I should categorize it as Academics/Timetables.\n</think>\n```json\n{\n  \"category_path\": \"Academics/Timetables\",\n  \"confidence_score\": 0.95,\n  \"summary\": \"Semester 3 Timetable detailing course schedules\",\n  \"suggested_filename\": \"TimeTableSem3.pdf\"\n}\n```";
        let parsed = clean_and_parse_json(raw).expect("Parse JSON with thinking");
        assert_eq!(parsed.category_path, "Academics/Timetables");
        assert_eq!(parsed.confidence_score, 0.95);
        assert_eq!(parsed.summary, "Semester 3 Timetable detailing course schedules");
    }
}
