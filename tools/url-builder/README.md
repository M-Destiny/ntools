# url-builder

## Description
url-builder - Construct URLs visually with protocol, host, path, query parameters, and fragments. Parse existing URLs and encode/decode.

## Usage
```tsx
import UrlBuilder from './tools/url-builder';
```

## Features
- Visual URL construction with all components (protocol, host, port, path, query, fragment)
- Query parameter management (add, remove, enable/disable, reorder)
- URL parsing - paste any URL to populate all fields
- URL encoding/decoding
- Presets for common URLs (Google, GitHub, API endpoints, localhost, WebSocket)
- Copy built/encoded URLs to clipboard
- Clear all fields
- Shows parsed components in detail view

## Development
```bash
npm run dev
```