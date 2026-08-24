# html-to-text

## Description
Extract clean plain text from HTML. Removes tags, decodes entities, preserves links and formatting structure.

## Usage
```tsx
import HtmlToText from './tools/html-to-text';
```

## Features
- Removes all HTML tags (scripts, styles, comments optional)
- Decodes HTML entities (&, <, >, &copy;, etc.)
- Preserves links as "text (URL)"
- Handles tables, lists, blockquotes
- Configurable options (keep links, images, word wrap)
- Copy to clipboard or download as .txt

## Development
```bash
npm run dev
```