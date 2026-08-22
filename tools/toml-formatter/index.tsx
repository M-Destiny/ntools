import { useState } from 'react';

export default function TomlFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'beautify' | 'minify' | 'validate'>('beautify');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Simple TOML parser/formatter (handles basic TOML)
  const processToml = () => {
    setError(null);
    try {
      let parsed: any;
      
      try {
        // Try to parse as TOML first (basic implementation)
        parsed = parseToml(input);
      } catch (e) {
        // If TOML parsing fails, try JSON as fallback
        try {
          parsed = JSON.parse(input);
        } catch {
          throw new Error('Invalid TOML or JSON');
        }
      }
      
      switch (mode) {
        case 'beautify':
          setOutput(formatToml(parsed, 0));
          break;
        case 'minify':
          setOutput(formatToml(parsed, 0, true));
          break;
        case 'validate':
          setOutput('✓ Valid TOML');
          break;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid TOML');
      setOutput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (mode === 'validate') processToml();
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    const example = `# Example TOML configuration
title = "TOML Example"

[owner]
name = "Tom Preston-Werner"
dob = 1979-05-27T07:32:00-08:00

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

hosts = """
alpha = 10.0.0.1
beta = 10.0.0.2
"""
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
        <h2>TOML Formatter</h2>
        <p className="tool-desc">Format, validate, minify, and prettify TOML with syntax highlighting</p>
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
            placeholder="Paste TOML here..."
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
                  onClick={() => { setMode(m); processToml(); }}
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
              <span className="success">✓ Valid TOML</span>
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

// Simple TOML parser
function parseToml(str: string): any {
  const result: any = {};
  let currentSection = result;
  let sectionPath: string[] = [];
  
  const lines = str.split('\n');
  let inMultiline = false;
  let multilineKey = '';
  let multilineValue = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) continue;
    
    // Handle multiline strings
    if (inMultiline) {
      if (line.endsWith('"""') || line.endsWith("'''")) {
        inMultiline = false;
        multilineValue += '\n' + line.slice(0, -3);
        setNestedValue(currentSection, multilineKey, multilineValue);
      } else {
        multilineValue += '\n' + line;
      }
      continue;
    }
    
    // Check for multiline string start
    if (line.includes('"""') || line.includes("'''")) {
      const quoteStyle = line.includes('"""') ? '"""' : "'''";
      const keyEnd = line.indexOf('=');
      if (keyEnd > 0) {
        multilineKey = line.slice(0, keyEnd).trim();
        multilineValue = line.slice(line.indexOf(quoteStyle) + 3);
        if (multilineValue.endsWith(quoteStyle)) {
          multilineValue = multilineValue.slice(0, -3);
          setNestedValue(currentSection, multilineKey, multilineValue);
        } else {
          inMultiline = true;
        }
      }
      continue;
    }
    
    // Section headers [section] or [[array]]
    const sectionMatch = line.match(/^\[\[?(.*?)\]\]?$/);
    if (sectionMatch) {
      const sectionName = sectionMatch[1].trim();
      sectionPath = sectionName.split('.');
      currentSection = result;
      for (const part of sectionPath) {
        if (!currentSection[part]) currentSection[part] = {};
        currentSection = currentSection[part];
      }
      continue;
    }
    
    // Key-value pairs
    const kvMatch = line.match(/^([^=]+)=(.*)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim();
      let value = kvMatch[2].trim();
      
      // Remove inline comments
      value = value.split('#')[0].trim();
      
      // Parse value
      let parsedValue: any = parseTomlValue(value);
      setNestedValue(currentSection, key, parsedValue);
    }
  }
  
  return result;
}

function parseTomlValue(value: string): any {
  // String
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  
  // Boolean
  if (value === 'true') return true;
  if (value === 'false') return false;
  
  // Number
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d*\.\d+$/.test(value)) return parseFloat(value);
  
  // Array
  if (value.startsWith('[') && value.endsWith(']')) {
    const content = value.slice(1, -1).trim();
    if (!content) return [];
    return content.split(',').map(v => parseTomlValue(v.trim()));
  }
  
  // Date
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return new Date(value).toISOString();
  }
  
  return value;
}

function setNestedValue(obj: any, key: string, value: any) {
  const parts = key.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) current[part] = {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

function formatToml(obj: any, indent: number, minify = false): string {
  const spaces = minify ? '' : '  '.repeat(indent);
  let result = '';
  
  const keys = Object.keys(obj).sort();
  
  // First, output non-object values
  for (const key of keys) {
    const value = obj[key];
    if (value === null || value === undefined) continue;
    
    if (typeof value !== 'object' || Array.isArray(value)) {
      result += `${spaces}${key} = ${formatValue(value, minify)}\n`;
    }
  }
  
  // Then, output nested objects/sections
  for (const key of keys) {
    const value = obj[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!minify) {
        result += '\n';
      }
      const sectionName = indent === 0 ? key : `${key}`;
      result += `${spaces}[${sectionName}]\n`;
      result += formatToml(value, indent + 1, minify);
    }
  }
  
  return result;
}

function formatValue(value: any, minify: boolean): string {
  if (typeof value === 'string') {
    // Escape quotes
    const escaped = value.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    return `"${escaped}"`;
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    const items = value.map(v => formatValue(v, minify)).join(minify ? ',' : ', ');
    return `[${minify ? '' : ' '}${items}${minify ? '' : ' '}]`;
  }
  if (value instanceof Date) return `"${value.toISOString()}"`;
  return String(value);
}