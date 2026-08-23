import { useState } from 'react';
import * as yaml from 'js-yaml';
import * as toml from 'smol-toml';

export default function TomlYamlConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState<'toml-to-yaml' | 'yaml-to-toml'>('toml-to-yaml');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ original: 0, converted: 0 });

  const convert = () => {
    setError(null);
    try {
      let result: string;
      if (direction === 'toml-to-yaml') {
        const parsed = toml.parse(input);
        result = yaml.dump(parsed, { indent: 2, lineWidth: -1 });
      } else {
        const parsed = yaml.load(input);
        result = toml.stringify(parsed);
      }
      setOutput(result);
      setStats({ original: input.length, converted: result.length });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed');
      setOutput('');
      setStats({ original: 0, converted: 0 });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (input.trim()) convert();
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    if (direction === 'toml-to-yaml') {
      const example = `# TOML Example
title = "TOML Example"
owner = { name = "Tom Preston-Werner", dob = 1979-05-27T07:32:00-08:00 }
database = { server = "192.168.1.1", ports = [ 8001, 8001, 8002 ], connection_max = 5000, enabled = true }
servers = { alpha = { ip = "10.0.0.1", role = "frontend" }, beta = { ip = "10.0.0.2", role = "backend" } }
clients = { data = [ ["gamma", "delta"], [1, 2] ], hosts = "alpha", "omega" }`;
      setInput(example);
    } else {
      const example = `# YAML Example
title: "YAML Example"
owner:
  name: "Tom Preston-Werner"
  dob: 1979-05-27T07:32:00-08:00
database:
  server: "192.168.1.1"
  ports: [8001, 8001, 8002]
  connection_max: 5000
  enabled: true
servers:
  alpha:
    ip: "10.0.0.1"
    role: "frontend"
  beta:
    ip: "10.0.0.2"
    role: "backend"
clients:
  data:
    - ["gamma", "delta"]
    - [1, 2]
  hosts:
    - "alpha"
    - "omega"`;
      setInput(example);
    }
    convert();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
    setStats({ original: 0, converted: 0 });
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>TOML ↔ YAML Converter</h2>
        <p className="tool-desc">Convert between TOML and YAML formats bidirectionally</p>
      </div>

      <div className="converter-toolbar">
        <div className="direction-toggle">
          <button
            className={direction === 'toml-to-yaml' ? 'active' : ''}
            onClick={() => setDirection('toml-to-yaml')}
          >
            TOML → YAML
          </button>
          <button
            className={direction === 'yaml-to-toml' ? 'active' : ''}
            onClick={() => setDirection('yaml-to-toml')}
          >
            YAML → TOML
          </button>
        </div>
        <div className="toolbar-actions">
          <button onClick={loadExample} className="btn-secondary">Load Example</button>
          <button onClick={clearAll} className="btn-secondary">Clear</button>
        </div>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input ({direction === 'toml-to-yaml' ? 'TOML' : 'YAML'})</h3>
          </div>
          <textarea
            className="json-editor"
            value={input}
            onChange={handleInputChange}
            placeholder={`Paste ${direction === 'toml-to-yaml' ? 'TOML' : 'YAML'} here to convert...`}
            spellCheck={false}
          />
        </div>

        <div className="controls-panel">
          <div className="status">
            {error ? (
              <span className="error">✗ {error}</span>
            ) : input.trim() ? (
              <span className="success">✓ Valid format</span>
            ) : (
              <span className="muted">Enter data to convert</span>
            )}
          </div>

          <div className="stats">
            <span>Original: {stats.original} chars</span>
            <span>Converted: {stats.converted} chars</span>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Output ({direction === 'toml-to-yaml' ? 'YAML' : 'TOML'})</h3>
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