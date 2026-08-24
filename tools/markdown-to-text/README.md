# markdown-to-text

## Description
Convert markdown to clean plain text. Removes formatting syntax while preserving content structure, links, and code.

## Usage
```tsx
import MarkdownToText from './tools/markdown-to-text';
```

## Features
- Converts headers, bold, italic, strikethrough
- Handles code blocks and inline code
- Preserves links as "text (URL)"
- Converts images to "[Image: alt text]"
- Removes blockquotes, horizontal rules
- Flattens lists (numbered and bullet)
- Basic table handling
- Copy to clipboard or download as .txt

## Development
```bash
npm run dev
```