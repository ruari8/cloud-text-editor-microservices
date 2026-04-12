# Dynamic Reverse Proxy Service

A highly configurable reverse proxy service with dynamic routing, health checks, caching, and rate limiting capabilities.

## Features

### Dynamic Route Management
- Add, update, delete, and list routes through REST API endpoints
- Routes stored in `routes.json` and can be modified at runtime
- Service auto-discovery through registration endpoint

### Health Monitoring
- Automatic health checks every 30 seconds
- Configurable failure threshold (default: 3 attempts)
- Automatic removal of unhealthy services
- Recovery tracking and service reinstatement

### Performance Optimization
- Response caching with configurable TTL
- Rate limiting per client IP
- Request timeout handling
- Cross-Origin Resource Sharing (CORS) support

### Error Handling
- Comprehensive error responses
- Timeout management
- Invalid route handling
- Content type validation

## API Endpoints

### Route Management
```
POST /admin/add
PUT /admin/update
DELETE /admin/delete
GET /admin/list
```

### Service Registration
```
POST /register
```

### Example Requests

Add Route:
```bash
curl -X POST http://localhost:3000/admin/add \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/service",
    "target": "http://service:8080"
  }'
```

Update Route:
```bash
curl -X PUT http://localhost:3000/admin/update \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/service",
    "target": "http://new-service:8080"
  }'
```

Delete Route:
```bash
curl -X DELETE http://localhost:3000/admin/delete \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/service"
  }'
```

List Routes:
```bash
curl http://localhost:3000/admin/list
```

Register Service:
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/newservice",
    "target": "http://new-service:8080"
  }'
```

## Configuration

- Route definitions: `routes.json`
- Health check interval: 30 seconds (configurable)
- Maximum health check failures: 3 (configurable)
- Cache TTL: 60 seconds (configurable)
- Rate limit: 20 requests per 10 minutes per IP (configurable)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

The server will start on port 3000 by default.

## Requirements

- Node.js 16+
- Express.js
- Body Parser

## Project Structure

```
├── src/
│   ├── server.js     # Main server implementation
│   ├── cache.js      # Caching middleware
│   └── rateLimit.js  # Rate limiting middleware
├── routes.json       # Route configuration
├── package.json
└── README.md
```

## Development Tools & Acknowledgments

This project was developed with assistance from:
- ChatGPT and Claude (Gen AI assistants) for code implementation guidance and review
