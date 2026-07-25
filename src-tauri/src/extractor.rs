use std::fs::File;
use std::io::Read;
use std::path::Path;
use tracing::info;

use crate::error::{AppError, AppResult};

const MAX_CHAR_LIMIT: usize = 2000;

/// Extract raw text (up to 2,000 characters) or metadata based on MIME/extension.
pub fn extract_content(path: &Path) -> AppResult<String> {
    if !path.exists() {
        return Err(AppError::Extraction(format!(
            "File does not exist: {}",
            path.display()
        )));
    }

    let extension = path
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|s| s.to_lowercase())
        .unwrap_or_default();

    let raw_text = match extension.as_str() {
        "txt" | "md" | "json" | "csv" | "log" | "yaml" | "yml" => extract_text_file(path)?,
        "pdf" => extract_pdf_file(path)?,
        "docx" => extract_docx_file(path)?,
        "png" | "jpg" | "jpeg" | "webp" => extract_image_metadata(path)?,
        _ => extract_fallback_metadata(path)?,
    };

    // Truncate to first 2,000 characters safely (respecting UTF-8 char boundaries)
    let truncated: String = raw_text.chars().take(MAX_CHAR_LIMIT).collect();
    info!(
        path = %path.display(),
        extracted_len = raw_text.len(),
        truncated_len = truncated.len(),
        "Extracted content successfully"
    );

    Ok(truncated)
}

/// Extract plain text from text/markdown files
fn extract_text_file(path: &Path) -> AppResult<String> {
    let mut file = File::open(path)?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;
    let text = String::from_utf8_lossy(&buffer).to_string();
    Ok(text)
}

/// Extract text from PDF files using pdf-extract
fn extract_pdf_file(path: &Path) -> AppResult<String> {
    let bytes = std::fs::read(path)?;
    pdf_extract::extract_text_from_mem(&bytes)
        .map_err(|e| AppError::Extraction(format!("Failed to parse PDF {}: {}", path.display(), e)))
}

/// Extract text from DOCX files by reading word/document.xml inside the zip archive
fn extract_docx_file(path: &Path) -> AppResult<String> {
    let file = File::open(path)?;
    let mut archive = zip::ZipArchive::new(file)
        .map_err(|e| AppError::Extraction(format!("Invalid DOCX archive {}: {}", path.display(), e)))?;

    let mut doc_xml = archive.by_name("word/document.xml").map_err(|e| {
        AppError::Extraction(format!("Missing word/document.xml in DOCX {}: {}", path.display(), e))
    })?;

    let mut xml_content = String::new();
    doc_xml.read_to_string(&mut xml_content)?;

    // Parse text inside <w:t> tags
    let mut text_buf = String::new();
    let mut in_tag = false;
    let mut tag_buf = String::new();
    let mut capture_text = false;

    for c in xml_content.chars() {
        if c == '<' {
            in_tag = true;
            tag_buf.clear();
        } else if c == '>' {
            in_tag = false;
            if tag_buf.starts_with("w:t") {
                capture_text = true;
            } else if tag_buf.starts_with("/w:t") {
                capture_text = false;
                text_buf.push(' ');
            } else if tag_buf.starts_with("/w:p") {
                text_buf.push('\n');
            }
        } else if in_tag {
            tag_buf.push(c);
        } else if capture_text {
            text_buf.push(c);
        }
    }

    Ok(text_buf)
}

/// Extract metadata for image files (PNG, JPG)
fn extract_image_metadata(path: &Path) -> AppResult<String> {
    let file_name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown_image");

    let metadata = std::fs::metadata(path)?;
    let size_kb = metadata.len() / 1024;

    Ok(format!(
        "Image File: {}\nSize: {} KB\nType: Image Asset\nPath: {}",
        file_name,
        size_kb,
        path.display()
    ))
}

/// Fallback text extraction for unrecognized file types
fn extract_fallback_metadata(path: &Path) -> AppResult<String> {
    let file_name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown_file");

    let ext = path
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("none");

    let metadata = std::fs::metadata(path)?;
    let size_kb = metadata.len() / 1024;

    Ok(format!(
        "Generic File: {}\nExtension: {}\nSize: {} KB\nPath: {}",
        file_name,
        ext,
        size_kb,
        path.display()
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;
    use tempfile::NamedTempFile;

    #[test]
    fn test_text_extraction() {
        let mut tmp = NamedTempFile::new().expect("Create temp file");
        write!(tmp, "Hello, world! This is a test file.").expect("Write to temp file");
        let path = tmp.path();

        // Rename with .txt extension
        let txt_path = path.with_extension("txt");
        std::fs::copy(path, &txt_path).expect("Copy to txt path");

        let result = extract_content(&txt_path).expect("Extract content");
        assert!(result.contains("Hello, world!"));

        let _ = std::fs::remove_file(txt_path);
    }
}
