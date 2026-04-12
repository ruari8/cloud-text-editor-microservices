# Editor Text Storage Service

A microservice that provides persistent storage for text content using SQLite, built with Node.js and Express, featuring automatic expiration and comprehensive error handling.

## Features

### Text Storage
- Unique ID generation per save
- 7-day automatic expiration
- Text content validation
- Size limit enforcement

### Data Management
- SQLite database backend
- Automatic cleanup of expired entries
- Secure data storage
- Efficient retrieval

### Error Handling
- Invalid ID handling
- Text size validation (100,000 char limit)
- Expired content handling
- Database error management

### CORS Support
- Cross-Origin Resource Sharing enabled
- Pre-flight request handling
- Configurable allowed methods

## API Endpoints

```
POST /save
GET /load/:id
GET /health
```

### Example Save Request

```bash
curl -X POST http://localhost:4000/save \
  -H "Content-Type: application/json" \
  -d '{"content": "Text to be saved"}'
```

### Example Save Response

```json
{
    "id": "text_uuid123",
    "message": "Text saved successfully"
}
```

### Example Load Request

```bash
curl http://localhost:4000/load/text_uuid123
```

### Example Load Response

```json
{
    "content": "Text to be saved"
}
```

## Testing

Comprehensive test suite using Jest:
- Unit tests: `tests/unit.test.js`
- Integration tests: `tests/integration.test.js`

Run tests:
```bash
npm test
```

## Project Structure

```
├── app.js             # Main application logic
├── init_db.js         # Database initialization
├── tests/
│   ├── unit.test.js
│   └── integration.test.js
├── package.json
└── README.md
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Initialize database:
```bash
node init_db.js
```

3. Start the server:
```bash
npm start
```

The server will start on port 4000 by default.

## Development Tools & Acknowledgments

This project was developed with assistance from:
- ChatGPT and Claude (Gen AI assistants) with code implementation, guidance and review