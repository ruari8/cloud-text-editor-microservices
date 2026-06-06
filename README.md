# Cloud Text Editor Microservices

Coursework project for CSC3065 Cloud Computing at Queen's University Belfast. The idea was to build a text editor as a set of small services, with each service using a different language or runtime and exposing a simple HTTP API.

This is best read as a polyglot microservices prototype rather than a one-command production app. Most services can be built and tested independently. The frontend and proxy configuration may need local endpoint changes before the full system runs on another machine.

## At a glance

| Area | Details |
| --- | --- |
| Project type | Cloud computing coursework / microservices prototype |
| Architecture | Static frontend, reverse proxy, independent text-processing APIs |
| Languages | JavaScript, PHP, Go, Python, C#, Rust |
| Runtime style | Dockerfiles per service, local service-level test commands |
| CI | GitLab CI files for several service directories |
| Main caveat | No top-level Docker Compose orchestration is included |

## Services

| Service | Stack | Purpose |
| --- | --- | --- |
| `editor-frontend` | HTML, CSS, vanilla JS | Browser UI for calling the editor services |
| `reverse-proxy-node` | Node.js, Express | Dynamic route registration, proxy routing, caching, rate limiting |
| `editor-charcount` | Node.js, Express | Character count API |
| `editor-wordcount` | PHP | Word count API |
| `editor-wordfreq` | Go | Word frequency API |
| `rewrite-function` | Python, Flask, OpenAI API | Rewrites text in a selected style |
| `find-replace-function` | C# / ASP.NET Core | Find and replace API |
| `spelling-error-checker` | Rust, Warp | Spell checking API |
| `average-word-length` | Rust, Actix Web | Average word length API |
| `stateful-saving` | Node.js, Express, SQLite | Save and load text snippets |
| `monitoringmetrics` | Node.js, Express | Health checks, metrics, optional Telegram alerts |

## What to look at

- `reverse-proxy-node/src/server.js` for dynamic route registration and proxy behaviour.
- `editor-frontend/src/js/api.js` and `editor-frontend/src/js/config.js` for client-side service integration.
- The service-level tests, especially `editor-charcount`, `editor-wordfreq`, `find-replace-function`, `average-word-length`, `stateful-saving`, and `rewrite-function`.
- The `.gitlab-ci.yml` files in individual services for build/test pipeline examples.

## Running services locally

Each service is intended to be run from its own directory. Most services bind to port `80` in their container or local runtime, so run them one at a time locally or remap ports in Docker.

Generic Docker pattern:

```bash
cd <service-directory>
docker build -t <service-name> .
docker run -p <host-port>:80 <service-name>
```

Example local commands:

```bash
cd editor-charcount
npm install
npm start
```

```bash
cd editor-wordfreq
go test ./...
go run .
```

```bash
cd average-word-length
cargo test
cargo run
```

```bash
cd find-replace-function
dotnet test
dotnet run --project FindReplaceService
```

The rewrite service requires an OpenAI API key:

```bash
cd rewrite-function
pip install -r requirements.txt
export OPENAI_API_KEY=your_api_key
python rewrite.py
```

## Frontend configuration

The frontend config currently points at a development proxy:

```js
proxy: 'http://192.168.0.100:3000'
```

Update `editor-frontend/src/js/config.js` to match your own proxy or service host before using the UI. Then serve `editor-frontend/src/index.html` with any static file server.

## Reverse proxy

The proxy runs from `reverse-proxy-node`:

```bash
cd reverse-proxy-node
npm install
npm start
```

Routes can be registered at runtime:

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"path": "/charcount", "target": "http://localhost:8081"}'
```

Admin endpoints are documented in `reverse-proxy-node/README.md`.

## Tests

| Service | Command |
| --- | --- |
| `editor-charcount` | `npm install && npm test` |
| `editor-wordcount` | `php src/tests/unit_tests.php` and `php src/tests/integration_tests.php` |
| `editor-wordfreq` | `go test ./...` |
| `rewrite-function` | `pytest` |
| `find-replace-function` | `dotnet test` |
| `average-word-length` | `cargo test` |
| `stateful-saving` | `npm install && npm test` |
| `monitoringmetrics` | `npm install && npm test` |

`spelling-error-checker` currently expects dictionary files at runtime under `dictionary/en`, but those files are not present in the repository. The service will need those dictionary files added or the path changed before it can run successfully.

## Known limitations

- There is no top-level compose file to launch the whole system.
- Several services default to port `80`, so local multi-service runs need port remapping.
- The frontend uses a hard-coded development proxy host.
- The spelling checker references dictionary files that are not currently committed.
- The rewrite service depends on an external OpenAI API key.

## Development note

Some implementation, debugging, and review work used ChatGPT and Claude. The repository remains a coursework prototype, with service-level READMEs giving more detail on each component.
