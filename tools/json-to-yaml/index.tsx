import { useState } from 'react';
import * as YAML from 'js-yaml';

export default function JsonToYaml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);

  const processJson = () => {
    setError(null);
    try {
      const parsed = JSON.parse(input);
      const yamlOutput = YAML.dump(parsed, { indent, lineWidth: -1, noRefs: true });
      setOutput(yamlOutput);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    processJson();
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    const example = {
      users: [
        { id: 1, name: 'Alice', email: 'alice@example.com', active: true, roles: ['admin', 'user'] },
        { id: 2, name: 'Bob', email: 'bob@example.com', active: false, roles: ['user'] }
      ],
      metadata: {
        version: '1.0',
        timestamp: '2026-08-18T10:30:00Z',
        tags: ['api', 'users', 'data'],
        settings: {
          notifications: true,
          theme: 'dark',
          locale: 'en-US'
        }
      }
    };
    setInput(JSON.stringify(example, null, 2));
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
        <h2>JSON to YAML</h2>
        <p className="tool-desc">Convert JSON to YAML with configurable indentation. Supports nested objects, arrays, and all JSON types.</p>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>JSON Input</h3>
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
          <div className="indent-control">
            <label>Indentation: {indent} spaces</label>
            <input
              type="range"
              min="1"
              max="8"
              value={indent}
              onChange={e => { setIndent(Number(e.target.value)); processJson(); }}
              className="indent-slider"
            />
          </div>

          <div className="status">
            {error ? (
              <span className="error">✗ {error}</span>
            ) : input.trim() ? (
              <span className="success">✓ Valid JSON</span>
            ) : (
              <span className="muted">Enter JSON to convert</span>
            )}
          </div>

          <div className="stats">
            <span>Input: {input.length} chars</span>
            <span>Output: {output.length} chars</span>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>YAML Output</h3>
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