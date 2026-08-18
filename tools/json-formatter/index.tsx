import { useState } from 'react';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'beautify' | 'minify' | 'validate'>('beautify');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const processJson = () => {
    setError(null);
    try {
      const parsed = JSON.parse(input);
      switch (mode) {
        case 'beautify':
          setOutput(JSON.stringify(parsed, null, 2));
          break;
        case 'minify':
          setOutput(JSON.stringify(parsed));
          break;
        case 'validate':
          setOutput('✓ Valid JSON');
          break;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (mode === 'validate') processJson();
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    const example = {
      users: [
        { id: 1, name: "Alice", email: "alice@example.com", active: true },
        { id: 2, name: "Bob", email: "bob@example.com", active: false }
      ],
      metadata: {
        version: "1.0",
        timestamp: "2026-08-18T10:30:00Z",
        tags: ["api", "users", "data"]
      }
    };
    setInput(JSON.stringify(example));
    processJson();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JSON Formatter</h2>
        <p className="tool-desc">Format, validate, minify, and prettify JSON with syntax highlighting</p>
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
            placeholder="Paste JSON here..."
            spellCheck={false}
          />
        </div>

        <div className="controls-panel">
          <div className="mode-selector">
            <label>Mode</label>
            <div className="mode-buttons">
              {(['beautify', 'minify', 'validate'] as const).map(m => (
                <button
                  key={m}
                  className={mode === m ? 'active' : ''}
                  onClick={() => { setMode(m); processJson(); }}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="status">
            {error ? (
              <span className="error">✗ {error}</span>
            ) : (
              <span className="success">✓ Valid JSON</span>
            )}
          </div>

          <div className="stats">
            <span>Input: {input.length} chars</span>
            <span>Output: {output.length} chars</span>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Output</h3>
            <div className="toolbar-actions">
              <button onClick={copyOutput} className={copied ? 'copied' : ''}>
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