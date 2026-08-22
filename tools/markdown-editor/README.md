# Markdown Editor

## Description
A live Markdown editor with real-time preview, word count, character count, auto-save to localStorage, and export to Markdown or HTML.

## Features
- **Live Preview** - See rendered Markdown as you type
- **Syntax Highlighting** - Code blocks with language detection
- **Word & Character Count** - Real-time statistics
- **Auto-Save** - Content persists in localStorage
- **Export Options** - Download as .md or .html file
- **Copy HTML** - Copy rendered HTML to clipboard
- **Responsive Layout** - Side-by-side on desktop, stacked on mobile
- **Tables, Blockquotes, Lists** - Full CommonMark support

## Usage
```tsx
import MarkdownEditor from './tools/markdown-editor';

function App() {
  return <MarkdownEditor />;
}
```

## Keyboard Shortcuts
- Standard textarea shortcuts (Ctrl/Cmd + Z, Y, A, etc.)
- Tab key works for indentation

## Development
```bash
npm run dev
```

## Supported Markdown
- Headers (#, ##, ###)
- Bold (**text**), Italic (*text*)
- Inline code (`code`) and code blocks (```lang)
- Lists (- item, 1. item)
- Links [text](url) and images ![alt](url)
- Blockquotes (> quote)
- Tables
- Horizontal rules (---)