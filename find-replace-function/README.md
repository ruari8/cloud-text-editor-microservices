# Editor Find/Replace Service

A microservice that performs text find and replace operations, built with C# and ASP.NET Core, featuring robust error handling and comprehensive testing.

## Features

### Text Operations
- Case-sensitive find/replace
- Multi-occurrence replacement
- Input validation
- Length preservation

### Error Handling
- Empty text validation
- Invalid input checks
- Detailed error responses
- Request validation

### CORS Support
- Cross-Origin Resource Sharing enabled
- Pre-flight request handling
- Configurable allowed methods

## API Endpoint

```
POST /FindReplace/replace
GET /FindReplace/health
```

### Example Request

```bash
curl -X POST http://localhost:80/FindReplace/replace \
  -H "Content-Type: application/json" \
  -d '{
    "InputText": "hello world hello",
    "FindWord": "hello",
    "ReplaceWord": "hi"
  }'
```

### Example Response

```json
{
    "processedText": "hi world hi"
}
```

## Testing

Comprehensive test suite using xUnit:
- Unit tests: `FindReplaceControllerTests.cs`
- Integration tests: `FindReplaceApiTests.cs`

Run tests:
```bash
dotnet test
```

## Project Structure

```
├── FindReplaceService/
│   ├── Program.cs
│   └── Controllers/
│       └── FindReplaceController.cs
├── FindReplaceService.Tests/
│   └── FindReplaceControllerTests.cs
├── FindReplaceService.IntegrationTests/
│   └── FindReplaceApiTests.cs
└── README.md
```

## Setup

1. Ensure .NET SDK is installed
2. Build the project:
```bash
dotnet build
```

3. Run the service:
```bash
dotnet run
```

The server will start on port 80 by default.

## Development Tools & Acknowledgments

This project was developed with assistance from:
- ChatGPT and Claude (Gen AI assistants) for code implementation guidance and review