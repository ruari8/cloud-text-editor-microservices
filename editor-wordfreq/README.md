# Editor Word Frequency Service

A microservice that analyzes text and returns the frequency of each word, built in Go with support for case-insensitive counting and special character handling.

## Features

### Word Frequency Analysis
- Case-insensitive word counting
- Special character handling
- Support for numbers and symbols
- Email and URL support

### Optimization
- Efficient word parsing
- Fast hash table implementation
- Memory-efficient processing
- Concurrent request handling

### Error Handling
- Empty text validation
- Input sanitization
- Detailed error responses
- Request validation

### CORS Support
- Cross-Origin Resource Sharing enabled
- Pre-flight request handling
- Configurable allowed methods

## API Endpoint

```
POST /frequency
GET /health
```

### Example Request

```bash
curl -X POST http://localhost:80/frequency \
  -H "Content-Type: application/json" \
  -d '{"text": "hello world hello test hello"}'
```

### Example Response

```json
{
    "error": false,
    "frequencies": {
        "hello": 3,
        "world": 1,
        "test": 1
    }
}
```

## Testing

Comprehensive test suite using Go's testing package:
- Unit tests: `main_test.go`
- Integration tests: `integration_test.go`

Run tests:
```bash
go test
go test -tags=integration
```

## Project Structure

```
├── main.go              # Service implementation
├── main_test.go         # Unit tests
├── integration_test.go  # Integration tests
├── go.mod
├── go.sum
└── README.md
```

## Setup

1. Ensure Go is installed
2. Download dependencies:
```bash
go mod download
```

3. Build and run:
```bash
go build
./wordfreq
```

The server will start on port 80 by default.

## Development Tools & Acknowledgments

This project was developed with assistance from:
- ChatGPT and Claude (Gen AI assistants) with code implementation, guidance and review