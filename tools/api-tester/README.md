# API Tester

## Description
A React + TypeScript tool for testing REST APIs. Supports all HTTP methods, query parameters, headers, authentication (Bearer, Basic, API Key), request bodies, and displays formatted responses with timing and size metrics.

## Features
- All HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- Query parameters with enable/disable toggles
- Custom headers with enable/disable toggles
- Multiple authentication types: Bearer Token, Basic Auth, API Key
- Request body editor for POST/PUT/PATCH
- Formatted response display (headers + body)
- Response timing and size metrics
- Copy response to clipboard
- Error handling and display

## Usage
```tsx
import ApiTester from './tools/api-tester';

function App() {
  return <ApiTester />;
}
```

## Development
```bash
npm run dev
```