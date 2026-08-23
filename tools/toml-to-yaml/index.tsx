import { useState } from 'react';

export default function TomlToYaml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const parseToml = (toml: string): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    const lines = toml.split('\n');
    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Section header [section.name]
      const sectionMatch = trimmed.match(/^\[(.+)\]$/);
      if (sectionMatch) {
        currentSection = sectionMatch[1];
        if (!result[currentSection]) {
          result[currentSection] = {};
        }
        continue;
      }

      // Key-value pair
      const kvMatch = trimmed.match(/^([^=]+)=(.*)$/);
      if (kvMatch) {
        const key = kvMatch[1].trim();
        let value = kvMatch[2].trim();

        // Remove trailing comments
        value = value.split('#')[0].trim();

        // Parse value
        let parsed: unknown = value;
        if (value === 'true' || value === 'false') {
          parsed = value === 'true';
        } else if (/^-?\d+$/.test(value)) {
          parsed = parseInt(value, 10);
        } else if (/^-?\d*\.\d+$/.test(value)) {
          parsed = parseFloat(value);
        } else if (value.startsWith('"') && value.endsWith('"')) {
          parsed = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n');
        } else if (value.startsWith("'") && value.endsWith("'")) {
          parsed = value.slice(1, -1);
        } else if (value.startsWith('[') && value.endsWith(']')) {
          // Array
          const arrayContent = value.slice(1, -1).trim();
          if (arrayContent) {
            parsed = arrayContent.split(',').map(v => {
              const trimmed = v.trim();
              if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
                return trimmed.slice(1, -1).replace(/\\"/g, '"');
              }
              if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
                return trimmed.slice(1, -1);
              }
              if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
              if (/^-?\d*\.\d+$/.test(trimmed)) return parseFloat(trimmed);
              return trimmed;
            });
          } else {
            parsed = [];
          }
        }

        if (currentSection) {
          (result[currentSection] as Record<string, unknown>)[key] = parsed;
        } else {
          result[key] = parsed;
        }
      }
    }
    return result;
  };

  const toYaml = (obj: Record<string, unknown>, indent = 0): string => {
    const spaces = '  '.repeat(indent);
    let yaml = '';

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        yaml += `${spaces}${key}: null\n`;
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          yaml += `${spaces}${key}: []\n`;
        } else {
          yaml += `${spaces}${key}:\n`;
          for (const item of value) {
            yaml += `${spaces}  - ${toYamlValue(item)}\n`;
          }
        }
      } else if (typeof value === 'object') {
        yaml += `${spaces}${key}:\n`;
        yaml += toYaml(value as Record<string, unknown>, indent + 1);
      } else {
        yaml += `${spaces}${key}: ${toYamlValue(value)}\n`;
      }
    }
    return yaml;
  };

  const toYamlValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') {
      // Quote strings that contain special characters or look like numbers/booleans
      if (/^[0-9]+$/.test(value) || /^[0-9]*\.[0-9]+$/.test(value) || value === 'true' || value === 'false' || value.includes(':') || value.includes('#') || value.includes('\n') || value.startsWith(' ') || value.endsWith(' ')) {
        return `"${value.replace(/"/g, '\\"')}"`;
      }
      return value;
    }
    return String(value);
  };

  const processToml = () => {
    setError(null);
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }

      const parsed = parseToml(input);
      const yaml = toYaml(parsed);
      setOutput(yaml);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse TOML');
      setOutput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    processToml();
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    const example = `# Sample TOML configuration
title = "My Project"
version = "1.0.0"
debug = true

[database]
host = "localhost"
port = 5432
username = "admin"
password = "secret"
ssl = true

[server]
host = "0.0.0.0"
port = 8080
workers = 4

[features]
enabled = ["auth", "cache", "logging", "metrics"]
max_connections = 100
`;
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
        <h2>TOML to YAML</h2>
        <p className="tool-desc">Convert TOML configuration to YAML format</p>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>TOML Input</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="json-editor"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste TOML data here..."
            spellCheck={false}
          />
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
          {error && <div className="error-message">✗ {error}</div>}
        </div>
      </div>
    </div>
  );
}