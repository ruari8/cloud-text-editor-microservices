pub mod analysis {
    use actix_web::{web, HttpResponse, error::ResponseError};
    use serde::{Deserialize, Serialize};
    use thiserror::Error;

    pub const MAX_TEXT_LENGTH: usize = 10000;

    #[derive(Error, Debug)]
    pub enum AnalysisError {
        #[error("Empty text provided")]
        EmptyText,
        
        #[error("Text exceeds maximum length of {0} characters")]
        TextTooLong(usize),
    }

    #[derive(Serialize, Deserialize)]
    pub struct ErrorResponse {
        pub error_type: String,
        pub message: String,
    }

    impl ResponseError for AnalysisError {
        fn error_response(&self) -> HttpResponse {
            match self {
                AnalysisError::EmptyText => {
                    HttpResponse::BadRequest().json(ErrorResponse {
                        error_type: "EMPTY_TEXT".to_string(),
                        message: "Empty text provided".to_string(),
                    })
                }
                AnalysisError::TextTooLong(_) => {
                    HttpResponse::BadRequest().json(ErrorResponse {
                        error_type: "TEXT_TOO_LONG".to_string(),
                        message: "Text too long".to_string(),
                    })
                }
            }
        }
    }

    #[derive(Deserialize)]
    pub struct TextRequest {
        pub text: String,
    }

    #[derive(Serialize, Deserialize)]
    pub struct WordLengthResponse {
        pub average_length: f64,
        pub word_count: usize,
    }

    pub fn calculate_average_word_length(text: &str) -> Result<WordLengthResponse, AnalysisError> {
        if text.trim().is_empty() {
            return Err(AnalysisError::EmptyText);
        }

        if text.len() > MAX_TEXT_LENGTH {
            return Err(AnalysisError::TextTooLong(MAX_TEXT_LENGTH));
        }

        let words: Vec<&str> = text.split_whitespace().collect();
        let word_count = words.len();
        let mut total_length = 0;

        for word in words.iter() {
            let cleaned_word = word.trim_matches(|c: char| c.is_ascii_punctuation());
            let word_length = cleaned_word.len();
            total_length += word_length;
        }
        
        Ok(WordLengthResponse {
            average_length: (total_length as f64 / word_count as f64 * 100.0).round() / 100.0,
            word_count,
        })
    }

    pub async fn analyze_text(request: web::Json<TextRequest>) -> Result<HttpResponse, AnalysisError> {
        let result = calculate_average_word_length(&request.text)?;
        Ok(HttpResponse::Ok().json(result))
    }

    pub async fn health_check() -> HttpResponse {
        HttpResponse::Ok().json(serde_json::json!({
            "status": "healthy"
        }))
    }
    
}

// Re-export the types needed for integration tests
pub use analysis::{
    analyze_text,
    health_check,
    calculate_average_word_length,
    AnalysisError,
    TextRequest,
    WordLengthResponse,
    ErrorResponse,
    MAX_TEXT_LENGTH,
};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_word_length() {
        let text = "hello world";
        let result = analysis::calculate_average_word_length(text).unwrap();
        assert_eq!(result.word_count, 2);
        assert_eq!(result.average_length, 5.0);
    }

    #[test]
    fn test_punctuation_handling() {
        let text = "hello, world! How are you?";
        let result = analysis::calculate_average_word_length(text).unwrap();
        assert_eq!(result.word_count, 5);
        assert_eq!(result.average_length, 3.8);
    }

    #[test]
    fn test_multiple_spaces() {
        let text = "hello    world   test";
        let result = analysis::calculate_average_word_length(text).unwrap();
        assert_eq!(result.word_count, 3);
        assert_eq!(result.average_length, 4.67);
    }

    #[test]
    fn test_special_cases() {
        let text = "don't self-driving test@example.com. Testing123 numbers 456 and symbols $99.99";
        let result = analysis::calculate_average_word_length(text).unwrap();
        assert_eq!(result.word_count, 9);
        assert_eq!(result.average_length, 7.56);
    }

    #[test]
    fn test_empty_text() {
        let text = "";
        let result = analysis::calculate_average_word_length(text);
        assert!(matches!(result, Err(analysis::AnalysisError::EmptyText)));
    }

    #[test]
    fn test_only_whitespace() {
        let text = "   \t   \n   ";
        let result = analysis::calculate_average_word_length(text);
        assert!(matches!(result, Err(analysis::AnalysisError::EmptyText)));
    }

    #[test]
    fn test_text_too_long() {
        let text = "a".repeat(analysis::MAX_TEXT_LENGTH + 1);
        let result = analysis::calculate_average_word_length(&text);
        assert!(matches!(result, Err(analysis::AnalysisError::TextTooLong(_))));
    }
}