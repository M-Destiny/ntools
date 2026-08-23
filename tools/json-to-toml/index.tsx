import { useState, useEffect } from 'react';

export default function JsonToToml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tomlModule, setTomlModule] = useState<{ parse: (str: string) => unknown; stringify: (obj: unknown) => string } | null>(null);

  useEffect(() => {
    import('smol-toml').then(module => {
      setTomlModule(module);
    });
  }, []);

  const processJson = () => {
    setError(null);
    setOutput('');
    if (!tomlModule) {
      setError('TOML module not loaded yet');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setOutput(tomlModule.stringify(parsed));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    const example = `{
  "title": "TOML Example",
  "owner": {
    "name": "Tom Preston-Werner",
    "dob": "1979-05-27T07:32:00-08:00"
  },
  "database": {
    "server": "192.168.1.1",
    "ports": [8001, 8001, 8002],
    "connection_max": 5000,
    "enabled": true
  },
  "servers": {
    "alpha": {
      "ip": "10.0.0.1",
      "dc": "eqdc10"
    },
    "beta": {
      "ip": "10.0.0.2",
      "dc": "eqdc10"
    }
  },
  "clients": {
    "data": [["gamma", "delta"], [1, 2]],
    "hosts": ["alpha", "omega"]
  }
}`;
    setInput(example);
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
        <h2>JSON to TOML</h2>
        <p className="tool-desc">Convert JSON to TOML format</p>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input (JSON)</h3>
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
          <div className="status">
            {error ? (
              <span className="error">✗ {error}</span>
            ) : (
              <span className="success">✓ Valid JSON</span>
            )}
          </div>

          <div className="stats">
            <span>Input: {input.length} chars</span>
            <span>Lines: {input.split('\n').length}</span>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Output (TOML)</h3>
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