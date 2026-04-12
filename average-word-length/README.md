# Editor Average Word Length Service

A microservice that calculates the average length of words in a given text, built with Rust and Actix-web, featuring high performance and comprehensive error handling.

## Features

### Word Length Analysis
- Accurate word length calculation
- Punctuation handling
- Whitespace normalization
- Support for compound words

### Performance
- Zero-copy string handling
- Efficient memory usage
- Fast text processing
- Concurrent request handling

### Error Handling
- Empty text validation
- Maximum text length check (10000 chars)
- Detailed error responses
- Input validation

### CORS Support
- Cross-Origin Resource Sharing enabled
- Pre-flight request handling
- Configurable headers

## API Endpoint

```
POST /analyze
GET /health
```

### Example Request

```bash
curl -X POST http://localhost:80/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "hello world test longer"}'
```

### Example Response

```json
{
    "average_length": 4.75,
    "word_count": 4
}
```

## Testing

Comprehensive test suite using Rust's testing framework:
- Unit tests in `lib.rs`
- Integration tests: `tests/integration_tests.rs`

Run tests:
```bash
cargo test
```

## Project Structure

```
├── src/
│   ├── main.rs     # Server implementation
│   └── lib.rs      # Core logic and unit tests
├── tests/
│   └── integration_tests.rs
├── Cargo.toml
└── README.md
```

## Setup

1. Ensure Rust is installed
2. Build the project:
```bash
cargo build --release
```

3. Run the server:
```bash
cargo run --release
```

The server will start on port 80 by default.

## Development Tools & Acknowledgments

This project was developed with assistance from:
- ChatGPT and Claude (Gen AI assistants) with code implementation, guidance and review