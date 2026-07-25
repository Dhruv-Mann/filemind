use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("File system error: {0}")]
    Filesystem(String),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Extraction error: {0}")]
    Extraction(String),

    #[error("Database error: {0}")]
    Database(String),

    #[error("Classification error: {0}")]
    Classification(String),

    #[error("Watcher error: {0}")]
    Watcher(String),
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type AppResult<T> = Result<T, AppError>;
