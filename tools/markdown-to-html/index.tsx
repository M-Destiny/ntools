import { useState, useEffect } from 'react';

export default function MarkdownToHtml() {
  const [input, setInput] = useState('');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [previewMode, setPreviewMode] = useState<'html' | 'preview'>('preview');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const markdownToHtml = (md: string): string => {
    if (!md) return '';

    let html = md;

    // Escape HTML first
    html = escapeHtml(html);

    // Headers
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/___(.*?)___/gim, '<strong><em>$1</em></strong>');
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

    // Strikethrough
    html = html.replace(/~~(.*?)~~/gim, '<del>$1</del>');

    // Code blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (_match, lang, code) => {
      const language = lang ? ` class="language-${lang}"` : '';
      return `<pre><code${language}>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" />');

    // Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr />');
    html = html.replace(/^\*\*\*$/gim, '<hr />');
    html = html.replace(/^___$/gim, '<hr />');

    // Lists - ordered
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ol>$1</ol>');

    // Lists - unordered
    html = html.replace(/^[-*+] (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');

    // Fix nested list tags
    html = html.replace(/<\/ol>\s*<ol>/gim, '');
    html = html.replace(/<\/ul>\s*<ul>/gim, '');

    // Paragraphs
    html = html.split('\n\n').map(block => {
      block = block.trim();
      if (!block) return '';
      if (block.match(/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|table|thead|tbody|tr|th|td)/)) {
        return block;
      }
      return `<p>${block.replace(/\n/g, '<br />')}</p>`;
    }).join('\n\n');

    // Tables (basic)
    html = html.replace(/\|(.+)\|\n\|([\-\:\| ]+)\|\n((?:\|.+\|\n?)+)/gim, (_match, header, separator, rows) => {
      const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean);
      const aligns = separator.split('|').map((s: string) => {
        s = s.trim();
        if (s.startsWith(':') && s.endsWith(':')) return ' style="text-align:center"';
        if (s.endsWith(':')) return ' style="text-align:right"';
        if (s.startsWith(':')) return ' style="text-align:left"';
        return '';
      }).filter(Boolean);
      const rowHtml = rows.trim().split('\n').map((row: string) => {
        const cells = row.split('|').map((c: string) => c.trim()).filter(Boolean);
        return '<tr>' + cells.map((cell: string, i: number) => `<td${aligns[i] || ''}>${cell}</td>`).join('') + '</tr>';
      }).join('');
      return '<table><thead><tr>' + headers.map((h: string, i: number) => `<th${aligns[i] || ''}>${h}</th>`).join('') + '</tr></thead><tbody>' + rowHtml + '</tbody></table>';
    });

    return html;
  };

  useEffect(() => {
    setError(null);
    try {
      const html = markdownToHtml(input);
      setHtmlOutput(html);
    } catch (e) {
      setError('Conversion failed');
      setHtmlOutput('');
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setError(null);
  };

  const copyHtml = () => {
    navigator.clipboard.writeText(htmlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyPreview = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlOutput;
    navigator.clipboard.writeText(tempDiv.innerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setHtmlOutput('');
    setError(null);
  };

  const loadExample = () => {
    setInput(`# Markdown to HTML Converter

## Features

- **Real-time** conversion as you type
- **Syntax highlighting** for code blocks
- **Tables**, **lists**, **blockquotes** support
- **Copy HTML** or **copy as plain text**

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet('World'));
\`\`\`

### Table

| Feature | Status |
|:--------|:------:|
| Headers | ✅ |
| Lists | ✅ |
| Tables | ✅ |

> **Note:** This is a blockquote with **bold** text.

---

*Built with React + TypeScript*
`);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Markdown to HTML Converter</h2>
        <p className="tool-desc">Convert Markdown to clean HTML. Supports headers, lists, tables, code blocks, links, images, and more.</p>
      </div>

      <div className="markdown-toolbar">
        <div className="toolbar-group">
          <button onClick={clearAll} className="btn-secondary">Clear</button>
          <button onClick={copyHtml} className={copied ? 'copied' : 'btn-secondary'}>
            {copied ? '✓ Copied!' : 'Copy HTML'}
          </button>
          <button onClick={copyPreview} className="btn-secondary">Copy as Text</button>
          <button onClick={loadExample} className="btn-secondary">Load Example</button>
        </div>
        <div className="toolbar-group">
          <label>
            <input
              type="radio"
              name="previewMode"
              value="preview"
              checked={previewMode === 'preview'}
              onChange={() => setPreviewMode('preview')}
            />
            Preview
          </label>
          <label>
            <input
              type="radio"
              name="previewMode"
              value="html"
              checked={previewMode === 'html'}
              onChange={() => setPreviewMode('html')}
            />
            Raw HTML
          </label>
        </div>
      </div>

      {error && <div className="error-banner">✗ {error}</div>}

      <div className="markdown-layout">
        <div className="editor-pane">
          <div className="pane-header">
            <h3>Markdown Input</h3>
          </div>
          <textarea
            className="markdown-editor"
            value={input}
            onChange={handleInputChange}
            placeholder="Write Markdown here... (supports headers, lists, tables, code blocks, links, images, blockquotes)"
            spellCheck={false}
            rows={20}
          />
          <div className="input-stats">
            <span>{input.length} characters • {input.trim() ? input.trim().split(/\s+/).length : 0} words</span>
          </div>
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <h3>{previewMode === 'preview' ? 'Rendered Preview' : 'HTML Output'}</h3>
          </div>
          {previewMode === 'preview' ? (
            <div
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: htmlOutput }}
            />
          ) : (
            <textarea
              className="markdown-editor output"
              value={htmlOutput}
              readOnly
              spellCheck={false}
              rows={20}
            />
          )}
          <div className="output-stats">
            <span>{htmlOutput.length} characters</span>
          </div>
        </div>
      </div>

      <div className="markdown-info">
        <details>
          <summary>Supported Markdown Syntax</summary>
          <div className="markdown-reference">
            <table>
              <thead>
                <tr><th>Element</th><th>Syntax</th><th>Example</th></tr>
              </thead>
              <tbody>
                <tr><td>Headers</td><td><code># H1</code> to <code>###### H6</code></td><td><code># Title</code></td></tr>
                <tr><td>Bold</td><td><code>**text**</code> or <code>__text__</code></td><td><code>**bold**</code></td></tr>
                <tr><td>Italic</td><td><code>*text*</code> or <code>_text_</code></td><td><code>*italic*</code></td></tr>
                <tr><td>Bold + Italic</td><td><code>***text***</code></td><td><code>***both***</code></td></tr>
                <tr><td>Strikethrough</td><td><code>~~text~~</code></td><td><code>~~deleted~~</code></td></tr>
                <tr><td>Inline Code</td><td><code>\`code\`</code></td><td><code>\`const x = 1\`</code></td></tr>
                <tr><td>Code Block</td><td><code>```lang\ncode\n```</code></td><td><code>```js\n...</code></td></tr>
                <tr><td>Link</td><td><code>[text](url)</code></td><td><code>[GitHub](https://github.com)</code></td></tr>
                <tr><td>Image</td><td><code>![alt](url)</code></td><td><code>![Logo](logo.png)</code></td></tr>
                <tr><td>Blockquote</td><td><code>{'>'} text</code></td><td><code>{'>'} Quote</code></td></tr>
                <tr><td>Horizontal Rule</td><td><code>---</code> or <code>***</code></td><td><code>---</code></td></tr>
                <tr><td>Unordered List</td><td><code>- item</code> or <code>* item</code></td><td><code>- Item 1</code></td></tr>
                <tr><td>Ordered List</td><td><code>1. item</code></td><td><code>1. First</code></td></tr>
                <tr><td>Table</td><td><code>\| A \| B \|\n\|---\|---\|\n\| 1 \| 2 \|</code></td><td>See example</td></tr>
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}