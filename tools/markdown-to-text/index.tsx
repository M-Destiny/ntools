import { useState } from 'react';

export default function MarkdownToText() {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown to Text

## Features

- **Converts** markdown to plain text
- **Removes** formatting syntax
- **Preserves** content structure

### Lists

1. First item
2. Second item
   - Nested item
   - Another nested item
3. Third item

### Code

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Links and Images

[Visit Example](https://example.com)

![Alt text](https://example.com/image.png)

### Blockquotes

> This is a blockquote
> With multiple lines

---

**Bold** and *italic* text`);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const convert = () => {
    let text = markdown;

    // Remove code blocks but keep content
    text = text.replace(/```[\s\S]*?```/g, (match) => {
      return match.replace(/```\w*\n?/g, '').replace(/```/g, '');
    });

    // Remove inline code
    text = text.replace(/`([^`]+)`/g, '$1');

    // Headers
    text = text.replace(/^#{1,6}\s+/gm, '');

    // Bold and italic
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    text = text.replace(/\*([^*]+)\*/g, '$1');
    text = text.replace(/__([^_]+)__/g, '$1');
    text = text.replace(/_([^_]+)_/g, '$1');

    // Links: [text](url) -> text (url)
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Images: ![alt](url) -> [Image: alt]
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '[Image: $1]');

    // Blockquotes
    text = text.replace(/^>\s*/gm, '');

    // Horizontal rules
    text = text.replace(/^---+$/gm, '');
    text = text.replace(/^___+$/gm, '');
    text = text.replace(/^\*\*\*+$/gm, '');

    // Lists - numbered
    text = text.replace(/^\s*\d+\.\s+/gm, '');

    // Lists - bullet
    text = text.replace(/^\s*[-*+]\s+/gm, '');

    // Tables - basic cleanup
    text = text.replace(/\|/g, ' ');
    text = text.replace(/^[-:\s|]+$/gm, '');

    // Clean up extra whitespace
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.trim();

    setOutput(text);
  };

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadText = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'output.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const loadExample = () => {
    setMarkdown(`# Project Documentation

## Overview

This is a **sample markdown** document to demonstrate the converter.

### Key Features

- Converts markdown to plain text
- Handles headers, lists, code blocks
- Preserves links as text with URLs
- Removes formatting syntax

### Code Example

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

### Table

| Name | Age | City |
|------|-----|------|
| Alice | 30 | NYC |
| Bob | 25 | LA |

---

> **Note:** This tool is useful for extracting readable content from markdown files.

[Learn more](https://example.com)`);
  };

  const clearAll = () => {
    setMarkdown('');
    setOutput('');
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Markdown to Text</h2>
        <p className="tool-desc">Convert markdown to clean plain text. Removes formatting syntax while preserving content.</p>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Markdown Input</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="json-editor"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Paste markdown here..."
            spellCheck={false}
          />
        </div>

        <div className="controls-panel">
          <div className="mode-selector">
            <button onClick={convert} className="btn-primary" style={{width: '100%'}}>
              Convert to Text
            </button>
          </div>

          <div className="stats">
            <span>Input: {markdown.length} chars</span>
            <span>Output: {output.length} chars</span>
          </div>

          <div className="status">
            {output && <span className="success">✓ Converted successfully</span>}
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Plain Text Output</h3>
            <div className="toolbar-actions">
              <button onClick={copyOutput} className={copied ? 'copied' : ''}>
                {copied ? '✓ Copied!' : 'Copy Output'}
              </button>
              <button onClick={downloadText} className="btn-secondary">Download .txt</button>
            </div>
          </div>
          <textarea
            className="json-editor output"
            value={output}
            readOnly
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}