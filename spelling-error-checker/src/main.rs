use spelling::{SpellChecker, DefaultTokenSplitter};
use warp::{Filter, http::StatusCode};
use std::sync::Arc; // For thread-safe shared state

#[tokio::main] // Declare the async main function
async fn main() {
    // Initialize a spell checker with the default English dictionary
    let checker = Arc::new(SpellChecker::from_path("dictionary/en").unwrap_or_else(|_| {
        eprintln!("Failed to load dictionary. Ensure the 'dictionary/en' file exists.");
        std::process::exit(1);
    }));

    // Clone the spell checker for thread safety in the handler
    let checker_filter = warp::any().map(move || Arc::clone(&checker));

    // Define the route
    let spell_check_route = warp::path("spellcheck")
        .and(warp::query::<std::collections::HashMap<String, String>>())
        .and(checker_filter)
        .and_then(handle_spell_check);

    // Start the server on port 3030
    println!("Starting server on port 80...");
    warp::serve(spell_check_route).run(([0, 0, 0, 0], 80)).await;
}

// Handler for the /spellcheck route
async fn handle_spell_check(
    query: std::collections::HashMap<String, String>,
    checker: Arc<SpellChecker>,
) -> Result<impl warp::Reply, warp::Rejection> {
    // Extract the 'text' query parameter
    if let Some(text) = query.get("text") {
        // Tokenize the input text
        let tokens: Vec<_> = DefaultTokenSplitter::new(text).collect();

        // Check for spelling errors
        let errors: Vec<_> = tokens
            .into_iter()
            .filter(|token| !checker.is_correct(token))
            .collect();

        // Prepare the JSON response
        let response = warp::reply::json(&serde_json::json!({
            "error": false,
            "message": "Spelling check completed",
            "errors": errors
        }));

        Ok(warp::reply::with_status(response, StatusCode::OK))
    } else {
        // Return an error if 'text' is missing
        let response = warp::reply::json(&serde_json::json!({
            "error": true,
            "message": "Missing 'text' query parameter"
        }));

        Ok(warp::reply::with_status(response, StatusCode::BAD_REQUEST))
    }
}
