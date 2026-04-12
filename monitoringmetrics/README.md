# Editor Service Monitoring

A comprehensive monitoring service for the editor's microservices architecture, providing automated health checks, performance monitoring, and alert management.

## Features

### Service Health Monitoring
- Periodic health checks (configurable interval)
- Support for both direct and proxy service testing
- Response time tracking
- Automated test case execution

### Alert Management
- Telegram integration for real-time alerts
- Configurable alert thresholds
- Different severity levels (info, warning, critical)
- Daily performance summaries

### Performance Metrics
- Response time tracking
- Success rate calculation
- Service-specific statistics
- Historical data tracking

## API Endpoints

```
GET /health
POST /check
POST /check/:service
```

### Example Requests

Check All Services:
```bash
curl -X POST http://localhost:3001/check
```

Check Specific Service:
```bash
curl -X POST http://localhost:3001/check/wordcount
```

Get Health Status:
```bash
curl http://localhost:3001/health
```

## Configuration

- Check interval: 5 minutes (configurable)
- Response time threshold: 2000ms
- Retry attempts: 2
- Retry delay: 1000ms

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

3. Start the server:
```bash
npm start
```

The server will start on port 3001 by default.

## Project Structure

```
├── src/
│   ├── server.js     # Main server implementation
│   ├── monitor.js    # Monitoring logic
│   ├── alerts.js     # Alert management
│   └── config.js     # Configuration
├── package.json
└── README.md
```

## Development Tools & Acknowledgments

This project was developed with assistance from:
- ChatGPT and Claude (Gen AI assistants) for assistance with code implementation, guidance and review