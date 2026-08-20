# markdown-link-checker

## Description
markdown-link-checker - Scan markdown content for HTTP/HTTPS links and verify they're reachable. Checks link validity with HEAD/GET requests and reports status codes.

## Usage
```tsx
import MarkdownLinkChecker from './tools/markdown-link-checker';
```

## Features
- Extracts all HTTP/HTTPS links from markdown content
- Validates links with HEAD requests (falls back to GET)
- Shows status codes for each link
- Handles timeouts and network errors gracefully
- Summary statistics (valid, broken, errors)
- Line number references for each link