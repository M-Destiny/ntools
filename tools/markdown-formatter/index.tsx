import { useState, useCallback } from 'react';

export default function MarkdownFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState({
    lineWidth: 80,
    useTabs: false,
    tabWidth: 2,
    trimTrailingWhitespace: true,
    singleQuote: false,
    bracketSpacing: true,
    proseWrap: 'preserve' as 'always' | 'never' | 'preserve',
  });
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ lines: 0, chars: 0, words: 0 });

  const formatMarkdown = useCallback(() => {
    try {
      // Simple markdown formatting using regex-based approach
      let formatted = input;

      // Normalize line endings
      formatted = formatted.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

      // Trim trailing whitespace if enabled
      if (options.trimTrailingWhitespace) {
        formatted = formatted.replace(/[ \t]+$/gm, '');
      }

      // Ensure consistent heading spacing
      formatted = formatted.replace(/^(#{1,6})([^#\s])/gm, '$1 $2');

      // Ensure blank lines around headings
      formatted = formatted.replace(/^(\S.*)\n(#{1,6}\s)/gm, '$1\n\n$2');
      formatted = formatted.replace(/(#{1,6}\s.*\n)(\S)/gm, '$1\n$2');

      // Fix list formatting
      formatted = formatted.replace(/^([-*+]|\d+\.)([^\s])/gm, '$1 $2');

      // Ensure blank lines around code blocks
      formatted = formatted.replace(/^(\S.*)\n(```)/gm, '$1\n\n$2');
      formatted = formatted.replace(/(```\n)(\S)/gm, '$1\n$2');

      // Fix table formatting
      formatted = formatted.replace(/^\|(.+)\|$/gm, (match) => {
        const cells = match.split('|').slice(1, -1).map(c => c.trim());
        return '| ' + cells.join(' | ') + ' |';
      });

      // Fix horizontal rules
      formatted = formatted.replace(/^([-*_]){3,}$/gm, '---');

      // Ensure single blank line between paragraphs (not more)
      formatted = formatted.replace(/\n{3,}/g, '\n\n');

      // Trim leading/trailing blank lines
      formatted = formatted.trim() + '\n';

      setOutput(formatted);
      updateStats(formatted);
    } catch (e) {
      setOutput('Error formatting: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  }, [input, options]);

  const updateStats = useCallback((text: string) => {
    const lines = text.split('\n').length;
    const chars = text.length;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    setStats({ lines, chars, words });
  }, []);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const loadExample = useCallback(() => {
    const example = `# Heading 1

## Heading 2

This is a paragraph with **bold** and *italic* text.

### List Example

- Item one
- Item two
  - Nested item
- Item three

1. First item
2. Second item
3. Third item

### Code Block

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

### Table

| Name | Age | City |
|------|-----|------|
| Alice | 30 | NYC |
| Bob | 25 | LA |

---

> Blockquote example
> Multiple lines`;

    setInput(example);
  }, []);

  const clearAll = useCallback(() => {
    setInput('');
    setOutput('');
    setStats({ lines: 0, chars: 0, words: 0 });
  }, []);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Markdown Formatter</h2>
        <p className="tool-desc">Format and beautify Markdown with consistent style. Normalize headings, lists, tables, and code blocks.</p>
      </div>

      <div className="options-panel">
        <h3>Options</h3>
        <div className="options-grid">
          <label>
            Line Width
            <input
              type="number"
              value={options.lineWidth}
              onChange={e => setOptions({ ...options, lineWidth: parseInt(e.target.value) })}
              min={40}
              max={200}
            />
          </label>
          <label>
            Tab Width
            <input
              type="number"
              value={options.tabWidth}
              onChange={e => setOptions({ ...options, tabWidth: parseInt(e.target.value) })}
              min={1}
              max={8}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={options.useTabs}
              onChange={e => setOptions({ ...options, useTabs: e.target.checked })}
            />
            Use Tabs
          </label>
          <label>
            <input
              type="checkbox"
              checked={options.trimTrailingWhitespace}
              onChange={e => setOptions({ ...options, trimTrailingWhitespace: e.target.checked })}
            />
            Trim Trailing Whitespace
          </label>
          <label>
            <input
              type="checkbox"
              checked={options.singleQuote}
              onChange={e => setOptions({ ...options, singleQuote: e.target.checked })}
            />
            Single Quotes
          </label>
          <label>
            <input
              type="checkbox"
              checked={options.bracketSpacing}
              onChange={e => setOptions({ ...options, bracketSpacing: e.target.checked })}
            />
            Bracket Spacing
          </label>
          <label>
            Prose Wrap
            <select
              value={options.proseWrap}
              onChange={e => setOptions({ ...options, proseWrap: e.target.value as typeof options.proseWrap })}
            >
              <option value="preserve">Preserve</option>
              <option value="always">Always Wrap</option>
              <option value="never">Never Wrap</option>
            </select>
          </label>
        </div>
      </div>

      <div className="tool-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Input</h3>
            <div className="panel-actions">
              <button className="secondary-btn" onClick={loadExample}>Load Example</button>
              <button className="secondary-btn" onClick={clearAll}>Clear</button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); formatMarkdown(); }}
            placeholder="Paste your Markdown here..."
            className="code-editor"
            spellCheck={false}
          />
          <div className="stats">
            Lines: {stats.lines} | Chars: {stats.chars} | Words: {stats.words}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Formatted Output</h3>
            <div className="panel-actions">
              <button className="copy-btn" onClick={copyToClipboard}>
                {copied ? '✓ Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>
          <textarea
            value={output}
            readOnly
            className="code-editor output"
            spellCheck={false}
          />
          {output && (
            <div className="preview-section">
              <h4>Preview</h4>
              <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(output) }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function simpleMarkdownToHtml(md: string): string {
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/```[\s\S]*?```/g, (match) => '<pre>' + match.replace(/```/g, '') + '</pre>')
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').slice(1, -1).map(c => c.trim());
      return '<tr>' + cells.map(c => '<td>' + c + '</td>').join('') + '</tr>';
    })
    .replace(/^[-*+] (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
    .replace(/<p><h([1-6])>/g, '<h$1>')
    .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
    .replace(/<p><ul>/g, '<ul>')
    .replace(/<\/ul><\/p>/g, '</ul>')
    .replace(/<p><pre>/g, '<pre>')
    .replace(/<\/pre><\/p>/g, '</pre>')
    .replace(/<p>---<\/p>/g, '<hr/>')
    .replace(/<p>> (.*?)<\/p>/g, '<blockquote>$1</blockquote>');
}