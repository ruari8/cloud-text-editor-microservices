# Editor Frontend Service

A web-based text editor interface that integrates multiple text processing services, built with vanilla JavaScript and modern CSS, featuring a clean and responsive design.

## Features

### Text Operations
- Word counting
- Character counting
- Text rewriting (multiple styles)
- Word frequency analysis
- Average word length calculation
- Find and replace functionality
- Text save/load capabilities

### User Interface
- Clean, modern design
- Responsive layout
- Real-time updates
- Error state handling
- Loading state indicators

### Technical Features
- Asynchronous API calls
- Error handling
- Request debouncing
- Cross-browser compatibility

## Interface Components

```
- Text input area
- Operation buttons
- Results display
- Style selector dropdown
- Find/Replace inputs
- Save/Load text functionality
```

### Operation Buttons
- Word Count
- Character Count
- Rewrite Text
- Word Frequency
- Average Word Length
- Find/Replace Text
- Save Text
- Load Text

## Project Structure

```
├── src/
│   └── index.html      # Main HTML file
├── css/
│   └── styles.css         # Styling
├── js/
│   ├── main.js           # Core functionality
│   ├── api.js            # API integration
│   └── config.js         # Configuration
└── README.md
```

## Setup

1. Configure service endpoints in `config.js`
2. Serve the files using any web server
3. Access via browser at configured URL/port

## Configuration

Edit `config.js` to set up:
- API endpoints for each service
- Development/production environments
- Proxy configuration

## Cross-Origin Resource Sharing

- CORS headers configured for development
- Production endpoints configurable
- Proxy support for API requests

## Development Tools & Acknowledgments

This project was developed with assistance from:
- ChatGPT and Claude (Gen AI assistants) with code implementation, guidance and review