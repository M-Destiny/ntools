# Markdown to PDF Converter

## Description
A React + TypeScript tool that converts Markdown content to PDF documents using pdfmake. Supports headers, bold/italic text, code blocks, lists, links, and more.

## Features
- Converts Markdown to PDF with proper formatting
- Supports headers (H1, H2, H3)
- Bold, italic, and inline code formatting
- Code blocks with syntax highlighting
- Ordered and unordered lists
- Links and horizontal rules
- Live preview of rendered Markdown
- One-click PDF export

## Usage
```tsx
import MarkdownToPDF from './tools/markdown-to-pdf';

function App() {
  const markdown = `# Hello World
  
  This is **bold** and *italic* text.
  
  \`\`\`js
  console.log('code block');
  \`\`\`
  
  - Item 1
  - Item 2`;

  return <MarkdownToPDF markdown={markdown} onExport={(blob) => {
    // Handle PDF blob (download, upload, etc.)
    const url = URL.createObjectURL(blob);
    window.open(url);
  }} />;
}
```

## Dependencies
- pdfmake
- @types/pdfmake

## Development
```bash
npm run dev
```