import { useState, useEffect } from 'react';

export default function YamlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);

  // YAML parsing and stringifying using js-yaml-like logic
  const parseYaml = (yaml: string): any => {
    // Simple YAML parser for common cases
    const lines = yaml.split('\n');
    const stack: Array<{ indent: number; value: any }> = [{ indent: -1, value: {} }];
    let currentKey = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const indent = line.length - trimmed.length;
      const isArrayItem = trimmed.startsWith('- ');
      
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      
      const parent = stack[stack.length - 1].value;
      
      if (isArrayItem) {
        const value = trimmed.substring(2).trim();
        if (!Array.isArray(parent[currentKey])) {
          parent[currentKey] = [];
        }
        if (value.includes(':') && !value.startsWith('"') && !value.startsWith("'")) {
          // Nested object
          const obj: any = {};
          parent[currentKey].push(obj);
          stack.push({ indent, value: obj });
        } else {
          parent[currentKey].push(parseYamlValue(value));
        }
      } else if (trimmed.includes(':')) {
        const colonIndex = trimmed.indexOf(':');
        currentKey = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();
        
        if (value === '' || value === '|' || value === '>') {
          // Multi-line or nested object
          const obj: any = value === '' ? {} : value;
          parent[currentKey] = obj;
          if (value === '' || value === '|' || value === '>') {
            stack.push({ indent, value: obj });
          }
        } else {
          parent[currentKey] = parseYamlValue(value);
        }
      }
    }
    
    return stack[0].value;
  };

  const parseYamlValue = (value: string): any => {
    value = value.trim();
    if (value === 'true' || value === 'false') return value === 'true';
    if (value === 'null' || value === '~') return null;
    if (/^-?\d+$/.test(value)) return parseInt(value, 10);
    if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value);
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    return value;
  };

  const stringifyYaml = (obj: any, currentIndent = 0): string => {
    // const spaces = ' '.repeat(currentIndent);
    const nextIndent = currentIndent + indent;
    const nextSpaces = ' '.repeat(nextIndent);
    
    if (obj === null) return 'null';
    if (obj === undefined) return '';
    if (typeof obj === 'string') {
      if (obj.includes('\n') || obj.includes(':') || obj.includes('#') || obj.startsWith(' ')) {
        return `"${obj.replace(/"/g, '\\"')}"`;
      }
      return obj;
    }
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map(item => {
        if (typeof item === 'object' && item !== null) {
          const itemStr = stringifyYaml(item, nextIndent);
          return `${nextSpaces}- ${itemStr.startsWith('\n') ? itemStr.trim() : itemStr}`;
        }
        return `${nextSpaces}- ${stringifyYaml(item, 0)}`;
      }).join('\n');
    }
    
    if (typeof obj === 'object') {
      const keys = sortKeys ? Object.keys(obj).sort() : Object.keys(obj);
      if (keys.length === 0) return '{}';
      return keys.map(key => {
        const value = obj[key];
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const valueStr = stringifyYaml(value, nextIndent);
          return `${nextSpaces}${key}:\n${valueStr}`;
        }
        return `${nextSpaces}${key}: ${stringifyYaml(value, 0)}`;
      }).join('\n');
    }
    
    return String(obj);
  };

  useEffect(() => {
    setError(null);
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }
      const parsed = parseYaml(input);
      const formatted = stringifyYaml(parsed);
      setOutput(formatted);
    } catch (e) {
      setError('Invalid YAML: ' + (e as Error).message);
      setOutput('');
    }
  }, [input, indent, sortKeys]);

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const loadExample = () => {
    const example = `# Example YAML
name: John Doe
age: 30
active: true
tags:
  - developer
  - designer
  - writer
address:
  street: 123 Main St
  city: San Francisco
  zip: "94102"
  coordinates:
    lat: 37.7749
    lng: -122.4194
projects:
  - name: Project Alpha
    status: completed
    duration: 6
  - name: Project Beta
    status: in-progress
    duration: 3
metadata:
  created: "2024-01-15"
  version: 1.0
  notes: |
    This is a multi-line
    string example`;
    setInput(example);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>YAML Formatter</h2>
        <p className="tool-desc">Format, validate, and pretty-print YAML. Supports custom indentation and key sorting.</p>
      </div>

      <div className="yaml-toolbar">
        <div className="toolbar-group">
          <button onClick={clearAll} className="btn-secondary">Clear</button>
          <button onClick={copyOutput} className={copied ? 'copied' : 'btn-secondary'}>
            {copied ? 'Copied!' : 'Copy Output'}
          </button>
          <button onClick={downloadOutput} className="btn-secondary">Download .yaml</button>
          <button onClick={loadExample} className="btn-secondary">Load Example</button>
        </div>
        <div className="toolbar-group">
          <label>
            Indent:
            <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="small-select">
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={1}>1 space</option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
            />
            Sort keys alphabetically
          </label>
        </div>
      </div>

      {error && <div className="error-banner">Error: {error}</div>}

      <div className="yaml-layout">
        <div className="editor-pane">
          <div className="pane-header">
            <h3>Input YAML</h3>
          </div>
          <textarea
            className="yaml-editor"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste YAML here..."
            spellCheck={false}
          />
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <h3>Formatted Output</h3>
          </div>
          <textarea
            className="yaml-editor output"
            value={output}
            readOnly
            spellCheck={false}
          />
        </div>
      </div>

      <div className="yaml-info">
        <details>
          <summary>YAML Formatting Tips</summary>
          <ul>
            <li>Use 2-space indentation (standard) or customize</li>
            <li>Keys are sorted alphabetically when enabled</li>
            <li>Strings with special chars are auto-quoted</li>
            <li>Multi-line strings use | (literal) or {'>'} (folded) style</li>
            <li>Boolean/null values are preserved as YAML types</li>
          </ul>
        </details>
      </div>
    </div>
  );
}