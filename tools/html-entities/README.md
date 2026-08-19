# html-entities

## Description
html-entities - Encode/decode HTML entities for safe web content handling. Built with React + TypeScript.

## Usage
```tsx
import HTMLEntities from './tools/html-entities';
```

## Features
- Encode text to HTML entities (prevent XSS, safe embedding)
- Decode HTML entities back to characters
- Support for named entities (&, <, >, etc.)
- Support for numeric entities (decimal &#65; and hex &#x41;)
- Extended entity support (copyright, trademark, currency symbols, Latin-1)
- Real-time conversion with statistics
- Copy to clipboard functionality
- Example loading for quick testing

## Development
```bash
npm run dev
```