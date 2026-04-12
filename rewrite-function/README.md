# Editor Text Rewrite Service

A microservice that rewrites text in different styles using OpenAI's GPT model, built with Python and Flask.

## Features

### Text Rewriting
- Multiple style options
- Input coherence checking
- Context-aware rewriting
- Original text preservation

### Style Options
- Shakespearean
- Tech Bro
- Chav
- Extensible for additional styles

### Error Handling
- Input validation
- Empty text handling
- API error management
- Coherence validation

### CORS Support
- Cross-Origin Resource Sharing enabled
- Pre-flight request handling

## API Endpoint

```
POST /rewrite
GET /health
```

### Example Request

```bash
curl -X POST http://localhost:80/rewrite \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello world, how are you?",
    "style": "Shakespeare"
  }'
```

### Example Response

```json
{
    "rewritten_text": "Hark! Good morrow to thee, how dost thou fare?"
}
```

## Testing

Comprehensive test suite using Python's unittest:
- Unit tests: `test_rewrite.py`
- Integration tests: `test_integration.py`

Run tests:
```bash
python -m pytest test_rewrite.py
python -m pytest test_integration.py
```

## Project Structure

```
├── rewrite.py           # Main service implementation
├── tests/
│   ├── test_rewrite.py        # Unit tests
│   └── test_integration.py    # Integration tests
├── requirements.txt
└── README.md
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up OpenAI API key:
```bash
export OPENAI_API_KEY=your_api_key
```

3. Start the server:
```bash
python rewrite.py
```

The server will start on port 80 by default.

## Development Tools & Acknowledgments

This project was developed with assistance from:
- ChatGPT and Claude (Gen AI assistants) with code implementation, guidance and review