# Editor Character Count Service

A microservice that counts the total number of characters in provided text, built with Node.js and Express, featuring comprehensive testing and error handling.

## Features

### Character Counting
- Accurate character counting
- Unicode character support
- Whitespace handling
- Special character support

### Error Handling
- Empty text validation
- Input type checking
- Comprehensive error responses
- Invalid request handling

### CORS Support
- Cross-Origin Resource Sharing enabled
- Pre-flight request handling
- Configurable allowed methods

## API Endpoint

```
POST /
GET /health
```

### Example Request

```bash
curl -X POST http://localhost:80/charcount \
  -H "Content-Type: application/json" \
  -d '{"text": "hello world!"}'
```

### Example Response

```json
{
    "error": false,
    "string": "Contains 11 characters",
    "answer": 11
}
```

## Testing

Comprehensive test suite using Mocha and Chai:
- Unit tests: `test/test-charcount.js`
- Integration tests: `test/test-integration.js`

Run tests:
```bash
npm test
```

## Project Structure

```
├── charcount.js      # Core character counting logic
├── server.js         # Express server implementation
├── test/
│   ├── test-charcount.js    # Unit tests
│   └── test-integration.js  # Integration tests
├── package.json
└── README.md
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will start on port 80 by default.

## Development Tools & Acknowledgments

This project was developed with assistance from:
- ChatGPT and Claude (Gen AI assistants) with code implementation, guidance and review