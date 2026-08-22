import { useState } from 'react';

export default function JsonMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ original: 0, minified: 0, savings: 0 });

  const minify = () => {
    setError(null);
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      
      const originalSize = input.length;
      const minifiedSize = minified.length;
      const savings = originalSize > 0 ? Math.round(((originalSize - minifiedSize) / originalSize) * 100) : 0;
      
      setStats({ original: originalSize, minified: minifiedSize, savings });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
      setStats({ original: 0, minified: 0, savings: 0 });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (input.trim()) minify();
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    const example = {
      users: [
        { id: 1, name: "Alice", email: "alice@example.com", active: true, roles: ["admin", "user"] },
        { id: 2, name: "Bob", email: "bob@example.com", active: false, roles: ["user"] }
      ],
      metadata: {
        version: "1.0",
        timestamp: "2026-08-18T10:30:00Z",
        tags: ["api", "users", "data"],
        config: { debug: true, maxRetries: 3 }
      }
    };
    setInput(JSON.stringify(example, null, 2));
    minify();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
    setStats({ original: 0, minified: 0, savings: 0 });
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JSON Minifier</h2>
        <p className="tool-desc">Minify JSON by removing all whitespace. Validates JSON before minifying.</p>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="json-editor"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste JSON here to minify..."
            spellCheck={false}
          />
        </div>

        <div className="controls-panel">
          <div className="status">
            {error ? (
              <span className="error">✗ {error}</span>
            ) : input.trim() ? (
              <span className="success">✓ Valid JSON</span>
            ) : (
              <span className="muted">Enter JSON to minify</span>
            )}
          </div>

          <div className="stats">
            <span>Original: {stats.original} chars</span>
            <span>Minified: {stats.minified} chars</span>
            {stats.original > 0 && <span className="savings">Saved: {stats.savings}%</span>}
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Output</h3>
            <div className="toolbar-actions">
              <button onClick={copyOutput} className={copied ? 'copied' : ''} disabled={!output}>
                {copied ? '✓ Copied!' : 'Copy Output'}
              </button>
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
