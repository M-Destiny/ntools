import { useState, useMemo } from 'react';

export default function MarkdownTocGenerator() {
  const [input, setInput] = useState('');
  const [maxDepth, setMaxDepth] = useState(3);
  const [includeLinks, setIncludeLinks] = useState(true);
  const [orderedList, setOrderedList] = useState(false);
  const [copied, setCopied] = useState(false);

  const headings = useMemo(() => {
    const lines = input.split('\n');
    const result: { level: number; text: string; slug: string }[] = [];
    
    lines.forEach((line) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const slug = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        result.push({ level, text, slug });
      }
    });
    
    return result;
  }, [input]);

  const filteredHeadings = useMemo(() => {
    return headings.filter(h => h.level <= maxDepth);
  }, [headings, maxDepth]);

  const toc = useMemo(() => {
    if (filteredHeadings.length === 0) return '';
    
    let result = '';
    const indent = '  ';
    
    filteredHeadings.forEach((heading, index) => {
      const prefix = orderedList ? `${index + 1}.` : '-';
      const link = includeLinks ? `[${heading.text}](#${heading.slug})` : heading.text;
      result += `${indent.repeat(heading.level - 1)}${prefix} ${link}\n`;
    });
    
    return result;
  }, [filteredHeadings, maxDepth, includeLinks, orderedList]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(toc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadToc = () => {
    const blob = new Blob([toc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table-of-contents.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput('');
    setCopied(false);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Markdown TOC Generator</h2>
        <p className="tool-desc">Generate a table of contents from Markdown headings. Supports custom depth, ordered/unordered lists, and anchor links.</p>
      </div>

      <div className="toc-layout">
        <div className="editor-pane">
          <div className="pane-header">
            <h3>Markdown Input</h3>
            <div className="pane-actions">
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          
          <textarea
            className="toc-editor"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your Markdown content here...\n\n# Heading 1\n## Heading 2\n### Heading 3\n## Another Heading 2"
            spellCheck={false}
          />
          
          <div className="editor-stats">
            <span>{input.split('\n').length} lines • {headings.length} headings found</span>
          </div>
        </div>

        <div className="preview-pane">
          <div className="pane-header">
            <h3>Generated TOC</h3>
            <div className="pane-actions">
              <button onClick={copyToClipboard} className={copied ? 'copied' : 'btn-primary'} disabled={!toc}>
                {copied ? '✓ Copied!' : 'Copy TOC'}
              </button>
              <button onClick={downloadToc} className="btn-secondary" disabled={!toc}>
                Download
              </button>
            </div>
          </div>

          <div className="toc-options">
            <div className="option-group">
              <label>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={maxDepth}
                  onChange={e => setMaxDepth(parseInt(e.target.value))}
                />
                <span>Max Depth: <strong>{maxDepth}</strong></span>
              </label>
            </div>
            <div className="option-group">
              <label>
                <input
                  type="checkbox"
                  checked={includeLinks}
                  onChange={e => setIncludeLinks(e.target.checked)}
                />
                Include Anchor Links
              </label>
            </div>
            <div className="option-group">
              <label>
                <input
                  type="checkbox"
                  checked={orderedList}
                  onChange={e => setOrderedList(e.target.checked)}
                />
                Ordered List
              </label>
            </div>
          </div>

          {toc ? (
            <div className="toc-output">
              <pre>{toc}</pre>
            </div>
          ) : (
            <div className="empty-state">
              <p>No headings found. Paste Markdown content with headings (# ## ###) to generate a TOC.</p>
            </div>
          )}

          <div className="info-section">
            <details>
              <summary>How It Works</summary>
              <div className="help-content">
                <ul>
                  <li>Parses Markdown headings (# through ######)</li>
                  <li>Generates slugs compatible with GitHub/GitLab anchor links</li>
                  <li>Respects heading hierarchy for nested indentation</li>
                  <li>Filters by maximum depth (1-6)</li>
                  <li>Optionally generates ordered (numbered) or unordered (bullet) lists</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}