# markdown-toc-generator

## Description
Generate a table of contents from Markdown headings. Supports custom depth, ordered/unordered lists, and anchor links.

## Usage
```tsx
import MarkdownTocGenerator from './tools/markdown-toc-generator';
```

## Features
- Parses Markdown headings (# through ######)
- Generates GitHub/GitLab compatible anchor slugs
- Configurable maximum heading depth (1-6)
- Optional anchor links
- Ordered or unordered list output
- Copy to clipboard and download as .md

## Development
```bash
npm run dev
```