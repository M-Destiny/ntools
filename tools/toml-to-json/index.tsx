import { useState, useEffect } from 'react';

export default function TomlToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [tomlModule, setTomlModule] = useState<{ parse: (str: string) => unknown; stringify: (obj: unknown) => string } | null>(null);
  const [indent, setIndent] = useState(2);

  useEffect(() => {
    import('smol-toml').then(module => {
      setTomlModule(module);
    });
  }, []);

  const processToml = () => {
    setError(null);
    setOutput('');
    if (!tomlModule) {
      setError('TOML module not loaded yet');
      return;
    }
    try {
      const parsed = tomlModule.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid TOML');
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
    const example = `title = "TOML Example"

[owner]
name = "Tom Preston-Werner"
dob = 1979-05-27T07:32:00-08:00 # First class dates

[database]
server = "192.168.1.1"
ports = [ 8001, 8001, 8002 ]
connection_max = 5000
enabled = true

[servers]

  [servers.alpha]
  ip = "10.0.0.1"
  dc = "eqdc10"

  [servers.beta]
  ip = "10.0.0.2"
  dc = "eqdc10"

[clients]
data = [ ["gamma", "delta"], [1, 2] ]

hosts = [
  "alpha",
  "omega"
]`;
    setInput(example);
    processToml();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>TOML to JSON</h2>
        <p className="tool-desc">Convert TOML to JSON with configurable indentation</p>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input (TOML)</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="json-editor"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste TOML here..."
            spellCheck={false}
          />
        </div>

        <div className="controls-panel">
          <div className="status">
            {error ? (
              <span className="error">✗ {error}</span>
            ) : (
              <span className="success">✓ Valid TOML</span>
            )}
          </div>

          <div className="stats">
            <span>Input: {input.length} chars</span>
            <span>Lines: {input.split('\n').length}</span>
          </div>

          <div className="options">
            <label>
              Indent:
              <select value={indent} onChange={e => { setIndent(Number(e.target.value)); processToml(); }}>
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={0}>Minified</option>
              </select>
            </label>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Output (JSON)</h3>
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