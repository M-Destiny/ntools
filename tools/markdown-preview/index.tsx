import { useState, useEffect, useRef } from 'react';

export default function MarkdownPreview() {
  const [markdown, setMarkdown] = useState(`# Welcome to Markdown Preview

## Features

- **Real-time preview** — See changes instantly
- **Syntax highlighting** — Code blocks with language detection
- **Export options** — Copy HTML or download as file

### Code Example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

### Lists & Tables

| Feature | Status |
|---------|--------|
| Live preview | ✅ |
| GFM support | ✅ |
| Math rendering | 🚧 |

> **Tip:** Edit the markdown on the left to see live updates!

---

*Built with React + TypeScript*`);
  const [html, setHtml] = useState('');
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'github'>('github');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // Simple markdown to HTML conversion
      let result = markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold & Italic
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/_(.*?)_/g, '<em>$1</em>')
        // Code blocks
        .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => 
          `<pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`
        )
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Blockquotes
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        // Horizontal rule
        .replace(/^---$/gim, '<hr>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        // Images
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
        // Tables
        .replace(/^\|(.*)\|$/gim, (match) => {
          const cells = match.split('|').slice(1, -1).map(c => c.trim());
          return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
        })
        // Unordered lists
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        // Ordered lists
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        // Paragraphs (simple heuristic)
        .replace(/^(?!<[hubl\/\?])(.*?)$/gim, (match, p) => {
          if (p.trim() && !p.startsWith('<') && !p.startsWith('|')) {
            return '<p>' + p + '</p>';
          }
          return match;
        })
        // Line breaks
        .replace(/\n/g, '<br>');
      
      // Wrap list items in ul/ol
      result = result
        .replace(/(<li>.*<\/li>\n*)+/g, (match) => '<ul>' + match + '</ul>');
      
      setHtml(result);
    } catch (e) {
      setHtml('<div class="error">Error rendering markdown</div>');
    }
  }, [markdown]);

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;');
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; font-family: 'Monaco', 'Menlo', monospace; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    pre code { background: none; padding: 0; color: inherit; }
    blockquote { border-left: 4px solid #3b82f6; margin: 1rem 0; padding-left: 1rem; color: #666; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
    th { background: #f5f5f5; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${html}
</body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'markdown-preview.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    setMarkdown(`# Markdown Preview Example

## Features

- **Real-time preview** — See changes instantly
- **Syntax highlighting** — Code blocks with language detection
- **Export options** — Copy HTML or download as file

### Code Example

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

### Lists & Tables

| Feature | Status |
|---------|--------|
| Live preview | ✅ |
| GFM support | ✅ |
| Math rendering | 🚧 |

> **Tip:** Edit the markdown on the left to see live updates!

---

*Built with React + TypeScript*`);
  };

  const clearAll = () => {
    setMarkdown('');
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Markdown Preview</h2>
        <p className="tool-desc">Write markdown on the left, see live HTML preview on the right. Export as HTML file.</p>
      </div>

      <div className="markdown-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Markdown Input</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="markdown-editor"
            value={markdown}
            onChange={e => setMarkdown(e.target.value)}
            placeholder="Write markdown here..."
            spellCheck={false}
          />
        </div>

        <div className="preview-panel">
          <div className="preview-toolbar">
            <h3>Live Preview</h3>
            <div className="preview-actions">
              <select
                value={theme}
                onChange={e => setTheme(e.target.value as 'light' | 'dark' | 'github')}
                className="theme-select"
              >
                <option value="github">GitHub</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
              <button onClick={copyHtml} className={copied ? 'copied' : ''}>
                {copied ? '✓ Copied!' : 'Copy HTML'}
              </button>
              <button onClick={downloadHtml} className="btn-secondary">Download .html</button>
            </div>
          </div>
          <div
            ref={previewRef}
            className={`markdown-preview ${theme}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  );
}