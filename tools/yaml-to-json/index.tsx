import { useState } from 'react';
import * as YAML from 'js-yaml';

export default function YamlToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [format, setFormat] = useState<'pretty' | 'compact'>('pretty');

  const processYaml = () => {
    setError(null);
    try {
      const parsed = YAML.load(input);
      if (parsed === undefined || parsed === null) {
        setOutput(format === 'pretty' ? 'null' : 'null');
        return;
      }
      const jsonOutput = format === 'pretty' 
        ? JSON.stringify(parsed, null, 2)
        : JSON.stringify(parsed);
      setOutput(jsonOutput);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid YAML');
      setOutput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    processYaml();
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    const example = `users:
  - id: 1
    name: Alice
    email: alice@example.com
    active: true
    roles:
      - admin
      - user
  - id: 2
    name: Bob
    email: bob@example.com
    active: false
    roles:
      - user
metadata:
  version: "1.0"
  timestamp: "2026-08-18T10:30:00Z"
  tags:
    - api
    - users
    - data
  settings:
    notifications: true
    theme: dark
    locale: en-US`;
    setInput(example);
    processYaml();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>YAML to JSON</h2>
        <p className="tool-desc">Convert YAML to JSON with pretty or compact output. Supports all YAML types including anchors, aliases, and multi-line strings.</p>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>YAML Input</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="json-editor"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste YAML here..."
            spellCheck={false}
          />
        </div>

        <div className="controls-panel">
          <div className="format-selector">
            <label>Output Format</label>
            <div className="format-buttons">
              {(['pretty', 'compact'] as const).map(f => (
                <button
                  key={f}
                  className={format === f ? 'active' : ''}
                  onClick={() => { setFormat(f); processYaml(); }}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="status">
            {error ? (
              <span className="error">✗ {error}</span>
            ) : input.trim() ? (
              <span className="success">✓ Valid YAML</span>
            ) : (
              <span className="muted">Enter YAML to convert</span>
            )}
          </div>

          <div className="stats">
            <span>Input: {input.length} chars</span>
            <span>Output: {output.length} chars</span>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>JSON Output</h3>
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