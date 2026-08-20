import { useState } from 'react';

interface LinkResult {
  url: string;
  text: string;
  line: number;
  status: 'pending' | 'valid' | 'broken' | 'error';
  statusCode?: number;
  error?: string;
}

export default function MarkdownLinkChecker() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<LinkResult[]>([]);
  const [checking, setChecking] = useState(false);
  const [summary, setSummary] = useState({ total: 0, valid: 0, broken: 0, errors: 0 });

  const extractLinks = (markdown: string): LinkResult[] => {
    const links: LinkResult[] = [];
    const lines = markdown.split('\n');
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

    lines.forEach((line, lineIndex) => {
      let match;
      while ((match = linkRegex.exec(line)) !== null) {
        const url = match[2].trim();
        const text = match[1].trim();
        if (url.startsWith('http://') || url.startsWith('https://')) {
          links.push({ url, text, line: lineIndex + 1, status: 'pending' });
        }
      }
    });

    return links;
  };

  const checkLink = async (link: LinkResult): Promise<LinkResult> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(link.url, { 
        method: 'HEAD',
        signal: controller.signal,
        mode: 'cors'
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        return { ...link, status: 'valid', statusCode: response.status };
      } else {
        return { ...link, status: 'broken', statusCode: response.status };
      }
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === 'AbortError') {
          return { ...link, status: 'error', error: 'Timeout' };
        }
        // Try GET if HEAD fails
        try {
          const response = await fetch(link.url, { method: 'GET', mode: 'cors' });
          if (response.ok) {
            return { ...link, status: 'valid', statusCode: response.status };
          }
          return { ...link, status: 'broken', statusCode: response.status };
        } catch {
          return { ...link, status: 'error', error: e.message };
        }
      }
      return { ...link, status: 'error', error: 'Unknown error' };
    }
  };

  const checkAllLinks = async () => {
    const links = extractLinks(input);
    if (links.length === 0) {
      alert('No HTTP/HTTPS links found in the markdown');
      return;
    }

    setResults(links);
    setChecking(true);
    setSummary({ total: links.length, valid: 0, broken: 0, errors: 0 });

    const updatedResults: LinkResult[] = [];
    for (let i = 0; i < links.length; i++) {
      const result = await checkLink(links[i]);
      updatedResults.push(result);
      setResults([...updatedResults]);
      setSummary({
        total: links.length,
        valid: updatedResults.filter(r => r.status === 'valid').length,
        broken: updatedResults.filter(r => r.status === 'broken').length,
        errors: updatedResults.filter(r => r.status === 'error').length,
      });
    }

    setChecking(false);
  };

  const clearAll = () => {
    setInput('');
    setResults([]);
    setSummary({ total: 0, valid: 0, broken: 0, errors: 0 });
  };

  const loadExample = () => {
    const example = `# Example Markdown with Links

## Valid Links
- [GitHub](https://github.com)
- [MDN Web Docs](https://developer.mozilla.org)
- [React](https://react.dev)

## Broken Links
- [Non-existent](https://this-domain-definitely-does-not-exist-12345.com)
- [404 Page](https://github.com/this/repo/does/not/exist)

## Relative Links (ignored)
- [Local file](./local-file.md)
- [Anchor](#section)

## Mixed Content
Here's a [link to Google](https://google.com) and some [another one](https://example.com).`;
    setInput(example);
  };

  const getStatusColor = (status: LinkResult['status']) => {
    switch (status) {
      case 'valid': return 'status-valid';
      case 'broken': return 'status-broken';
      case 'error': return 'status-error';
      default: return 'status-pending';
    }
  };

  const getStatusLabel = (status: LinkResult['status']) => {
    switch (status) {
      case 'valid': return '✓ Valid';
      case 'broken': return '✗ Broken';
      case 'error': return '⚠ Error';
      default: return '⏳ Pending';
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Markdown Link Checker</h2>
        <p className="tool-desc">Scan markdown for HTTP/HTTPS links and verify they're reachable</p>
      </div>

      <div className="link-checker-layout">
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste markdown content here..."
            spellCheck={false}
            rows={20}
          />
        </div>

        <div className="results-panel">
          <div className="results-toolbar">
            <h3>Link Check Results</h3>
            <div className="toolbar-actions">
              <button 
                onClick={checkAllLinks} 
                className="btn-primary"
                disabled={checking || input.trim() === ''}
              >
                {checking ? 'Checking...' : 'Check All Links'}
              </button>
            </div>
          </div>

          <div className="summary">
            <span className="stat total">Total: {summary.total}</span>
            <span className="stat valid">✓ Valid: {summary.valid}</span>
            <span className="stat broken">✗ Broken: {summary.broken}</span>
            <span className="stat error">⚠ Errors: {summary.errors}</span>
          </div>

          <div className="results-list">
            {results.length === 0 ? (
              <p className="empty-state">Enter markdown and click "Check All Links" to scan for links</p>
            ) : (
              results.map((result, index) => (
                <div key={index} className={`result-item ${getStatusColor(result.status)}`}>
                  <div className="result-info">
                    <span className="result-line">Line {result.line}</span>
                    <span className="result-text">[{result.text}]({result.url})</span>
                  </div>
                  <div className="result-status">
                    <span className={getStatusColor(result.status)}>
                      {getStatusLabel(result.status)}
                    </span>
                    {result.statusCode && <span className="status-code">{result.statusCode}</span>}
                    {result.error && <span className="status-error-msg">{result.error}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}