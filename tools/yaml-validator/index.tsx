import { useState, useEffect } from 'react';

export default function YamlValidator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [yamlModule, setYamlModule] = useState<{ load: (str: string) => unknown } | null>(null);

  useEffect(() => {
    import('js-yaml').then(module => {
      setYamlModule(module.default);
    });
  }, []);

  const processYaml = () => {
    setError(null);
    setOutput('');
    setParsedData(null);
    if (!yamlModule) {
      setError('YAML module not loaded yet');
      return;
    }
    try {
      const parsed = yamlModule.load(input);
      setParsedData(parsed);
      setOutput('✓ Valid YAML');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid YAML');
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
    const example = `users:
  - id: 1
    name: "Alice"
    email: "alice@example.com"
    active: true
    roles:
      - admin
      - user
  - id: 2
    name: "Bob"
    email: "bob@example.com"
    active: false
    roles:
      - user
metadata:
  version: "1.0"
  timestamp: "2026-08-18T10:30:00Z"
  tags: ["api", "users", "data"]
`;
    setInput(example);
    processYaml();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
    setParsedData(null);
  };

  const renderParsed = (data: unknown, indent: number = 0): React.ReactNode => {
    const spaces = '  '.repeat(indent);
    if (data === null) {
      return <span className="yaml-null">{spaces}null</span>;
    }
    if (typeof data === 'string') {
      return <span className="yaml-string">{spaces}"{data}"</span>;
    }
    if (typeof data === 'number') {
      return <span className="yaml-number">{spaces}{data}</span>;
    }
    if (typeof data === 'boolean') {
      return <span className="yaml-boolean">{spaces}{data ? 'true' : 'false'}</span>;
    }
    if (Array.isArray(data)) {
      return (
        <div>
          {data.map((item, i) => (
            <div key={i}>
              <span className="yaml-punct">{spaces}- </span>
              {renderParsed(item, indent + 1)}
            </div>
          ))}
        </div>
      );
    }
    if (typeof data === 'object') {
      const entries = Object.entries(data as Record<string, unknown>);
      if (entries.length === 0) {
        return <span className="yaml-brace">{spaces}{{ }}</span>;
      }
      return (
        <div>
          {entries.map(([key, value]) => (
            <div key={key}>
              <span className="yaml-key">{spaces}{key}:</span>
              {typeof value === 'object' && value !== null ? (
                <>
                  <span> </span>
                  {renderParsed(value, indent + 1)}
                </>
              ) : (
                <>
                  <span> </span>
                  {renderParsed(value, 0)}
                </>
              )}
            </div>
          ))}
        </div>
      );
    }
    return <span className="yaml-unknown">{spaces}{String(data)}</span>;
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>YAML Validator</h2>
        <p className="tool-desc">Validate YAML syntax and view parsed structure with syntax highlighting</p>
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
            placeholder="Paste YAML here..."
            spellCheck={false}
          />
        </div>

        <div className="controls-panel">
          <div className="status">
            {error ? (
              <span className="error">✗ {error}</span>
            ) : (
              <span className="success">✓ Valid YAML</span>
            )}
          </div>

          <div className="stats">
            <span>Input: {input.length} chars</span>
            <span>Lines: {input.split('\n').length}</span>
          </div>

          {parsedData && (
            <div className="parsed-preview">
              <h4>Parsed Structure</h4>
              <div className="parsed-content">{renderParsed(parsedData)}</div>
            </div>
          )}
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