// tests/integration_tests.rs
use actix_web::{test, web, App};
use average_word_length::{
    analyze_text,
    health_check, 
    WordLengthResponse, 
    ErrorResponse,
    MAX_TEXT_LENGTH
};

#[actix_rt::test]
async fn test_analyze_text_success() {
    let app = test::init_service(
        App::new().service(web::resource("/analyze").route(web::post().to(analyze_text)))
    ).await;

    let request_body = r#"{
        "text": "The self-driving car won't start! Send an email to help@example.com or visit https://help.com. The iPhone14 costs $599.99 in 2024."
    }"#;
    let req = test::TestRequest::post()
        .uri("/analyze")
        .set_payload(request_body)
        .insert_header(("Content-Type", "application/json"))
        .to_request();

    let resp: WordLengthResponse = test::call_and_read_body_json(&app, req).await;
    assert_eq!(resp.word_count, 19);
    assert!((resp.average_length - 5.68).abs() < 0.01);
}

#[actix_rt::test]
async fn test_analyze_text_empty_input() {
    let app = test::init_service(
        App::new().service(web::resource("/analyze").route(web::post().to(analyze_text)))
    ).await;

    let request_body = r#"{
        "text": ""
    }"#;
    let req = test::TestRequest::post()
        .uri("/analyze")
        .set_payload(request_body)
        .insert_header(("Content-Type", "application/json"))
        .to_request();

    let resp: ErrorResponse = test::call_and_read_body_json(&app, req).await;
    assert_eq!(resp.error_type, "EMPTY_TEXT");
}

#[actix_rt::test]
async fn test_analyze_text_too_long() {
    let app = test::init_service(
        App::new().service(web::resource("/analyze").route(web::post().to(analyze_text)))
    ).await;

    let request_body = format!(r#"{{ "text": "{}" }}"#, "a".repeat(MAX_TEXT_LENGTH + 1));
    let req = test::TestRequest::post()
        .uri("/analyze")
        .set_payload(request_body)
        .insert_header(("Content-Type", "application/json"))
        .to_request();

    let resp: ErrorResponse = test::call_and_read_body_json(&app, req).await;
    assert_eq!(resp.error_type, "TEXT_TOO_LONG");
}

#[actix_rt::test]
async fn test_health_check() {
    let app = test::init_service(
        App::new().service(web::resource("/health").route(web::get().to(health_check)))
    ).await;

    let req = test::TestRequest::get()
        .uri("/health")
        .to_request();

    let resp: serde_json::Value = test::call_and_read_body_json(&app, req).await;
    assert_eq!(resp["status"], "healthy");
}