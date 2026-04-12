# Cloud Text Editor — Polyglot Microservices

A distributed text editor built as a set of independently containerised microservices, each written in a different language with its own Docker container and CI/CD pipeline. Built as coursework for CSC3065 Cloud Computing at Queen's University Belfast.

## Architecture

The system is a microservices-based text editor where each feature is a standalone service behind a shared reverse proxy.

```
┌─────────────────────────────────────────────┐
│              Reverse Proxy (Node.js)         │
│   Dynamic routing · Health checks · Cache   │
│          Rate limiting · CORS                │
└───────────────────────┬─────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
 ┌──────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
 │ editor-     │ │ editor-     │ │ editor-    │
 │ charcount   │ │ wordcount   │ │ wordfreq   │
 │ (Node.js)   │ │ (Java)      │ │ (Go)       │
 └─────────────┘ └─────────────┘ └────────────┘
        │               │               │
 ┌──────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
 │ rewrite-    │ │ find-       │ │ spelling-  │
 │ function    │ │ replace     │ │ error-     │
 │ (Python)    │ │ (C# .NET)   │ │ checker    │
 └─────────────┘ └─────────────┘ │ (Rust)     │
        │                        └────────────┘
 ┌──────▼──────┐ ┌─────────────┐ ┌────────────┐
 │ stateful-   │ │ average-    │ │ monitoring │
 │ saving      │ │ word-length │ │ metrics    │
 │ (Node/SQL)  │ │ (Rust)      │ │ (Node.js)  │
 └─────────────┘ └─────────────┘ └────────────┘
```

## Services

| Service | Language | Description |
|---|---|---|
| `reverse-proxy-node` | Node.js | Dynamic reverse proxy with health checks, caching, rate limiting |
| `editor-charcount` | Node.js | Character count API with unit tests |
| `editor-wordcount` | Java | Word count service |
| `editor-wordfreq` | Go | Word frequency analysis with integration tests |
| `editor-frontend` | React | Frontend editor UI |
| `rewrite-function` | Python (Flask) | Text rewriting service with pytest integration tests |
| `find-replace-function` | C# (.NET) | Find and replace with xUnit unit + integration tests |
| `spelling-error-checker` | Rust | Spell checker against a dictionary |
| `average-word-length` | Rust | Average word length calculator |
| `stateful-saving` | Node.js + SQLite | Persistent text storage with database backend |
| `monitoringmetrics` | Node.js | Service health and metrics monitoring |

## Key Features

**Reverse Proxy**
- Dynamic route management via REST API (add/update/delete routes at runtime)
- Automatic health checks every 30 seconds with configurable failure threshold
- Response caching with configurable TTL
- Rate limiting per client IP

**Testing** — every service has tests:
- Go: unit tests + integration tests
- Python: pytest unit + integration tests
- C#: xUnit unit + integration tests
- Node.js: Jest tests
- Rust: cargo test

**CI/CD** — each service has a `.gitlab-ci.yml` pipeline for build, test, and Docker image publishing.

## Running a Service

Each service is independently runnable via Docker:

```bash
cd <service-folder>
docker build -t <service-name> .
docker run -p <port>:<port> <service-name>
```

Or with the reverse proxy orchestrating everything, services self-register via:

```bash
POST /register
{
  "path": "/myservice",
  "target": "http://myservice:8080"
}
```

## Tech Stack

Rust · Go · Node.js · Python · C# .NET · React · Docker · SQLite · GitLab CI/CD
