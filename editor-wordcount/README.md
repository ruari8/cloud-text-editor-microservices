# Editor Word Count Service

A microservice that calculates the number of words in provided text, built with PHP and featuring comprehensive error handling and testing.

## Features

### Word Counting
- Accurate word count calculation
- Handles multiple whitespace characters
- Special character support
- Input validation and sanitization

### Error Handling
- Empty text validation
- Maximum text length validation
- Input type checking
- Detailed error messages

### CORS Support
- Cross-Origin Resource Sharing enabled
- Configurable allowed origins
- Pre-flight request handling

## API Endpoint

```
POST /
GET /health
```

### Example Request

```bash
curl -X POST http://localhost:80 \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "text=hello world test"
```

### Example Response

```json
{
    "error": false,
    "string": "Contains 3 words",
    "answer": 3
}
```

## Configuration

- Maximum text length: 10000 characters
- Allowed HTTP method: POST
- CORS: All origins allowed (configurable)
- Service will be available on port 80 by default

## Testing

Two levels of testing implemented:
- Unit tests: `tests/unit_tests.php`
- Integration tests: `tests/integration_tests.php`

Run tests:
```bash
php tests/unit_tests.php
php tests/integration_tests.php
```

## Development Tools & Acknowledgments

This project was developed with assistance from:
- ChatGPT and Claude (Gen AI assistants) with code implementation, guidance and review