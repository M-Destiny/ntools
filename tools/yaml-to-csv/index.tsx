import { useState, useCallback } from 'react';

export default function YamlToCsv() {
  const [yamlInput, setYamlInput] = useState('');
  const [csvOutput, setCsvOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [delimiter, setDelimiter] = useState(',');

  const parseYaml = useCallback((yaml: string): Array<Record<string, string>> => {
    const lines = yaml.trim().split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
    if (lines.length === 0) return [];

    const result: Array<Record<string, string>> = [];
    let currentObj: Record<string, string> = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for new document/item marker (starts with "-")
      if (trimmed.startsWith('-')) {
        // Save previous object if not empty
        if (Object.keys(currentObj).length > 0) {
          result.push(currentObj);
        }
        // Start new object (content after "-" on same line is ignored for simplicity)
        currentObj = {};
      } else if (trimmed.includes(':')) {
        // Key-value pair
        const colonIndex = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIndex).trim();
        let value = trimmed.substring(colonIndex + 1).trim();
        
        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        // Unescape
        value = value
          .replace(/\\"/g, '"')
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\\\/g, '\\');
        
        currentObj[key] = value;
      }
    }
    
    // Don't forget the last object
    if (Object.keys(currentObj).length > 0) {
      result.push(currentObj);
    }
    
    return result;
  }, []);

  const convertToCsv = useCallback((data: Array<Record<string, string>>): string => {
    if (data.length === 0) return '';
    
    // Get all unique keys
    const allKeys = new Set<string>();
    data.forEach(row => Object.keys(row).forEach(key => allKeys.add(key)));
    const headers = Array.from(allKeys);
    
    const delimiterChar = delimiter === '\\t' ? '\t' : delimiter;
    const lines: string[] = [];
    
    if (includeHeader) {
      lines.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(delimiterChar));
    }
    
    data.forEach(row => {
      const values = headers.map(key => {
        const value = row[key] ?? '';
        // Escape for CSV: wrap in quotes if contains delimiter, quote, or newline
        if (value.includes(delimiterChar) || value.includes('"') || value.includes('\n') || value.includes('\r')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      lines.push(values.join(delimiterChar));
    });
    
    return lines.join('\n');
  }, [delimiter, includeHeader]);

  const handleConvert = () => {
    setError(null);
    try {
      if (!yamlInput.trim()) {
        setError('Please enter YAML data');
        return;
      }
      const data = parseYaml(yamlInput);
      if (data.length === 0) {
        setError('No valid YAML objects found. Expected format: list of objects with key: value pairs');
        return;
      }
      const csv = convertToCsv(data);
      setCsvOutput(csv);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert YAML to CSV');
    }
  };

  const handleCopy = async () => {
    if (!csvOutput) return;
    await navigator.clipboard.writeText(csvOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setYamlInput('');
    setCsvOutput('');
    setError(null);
  };

  const sampleYaml = `- name: John Doe
  age: "30"
  city: New York
  active: "true"
- name: Jane Smith
  age: "25"
  city: Los Angeles
  active: "false"
- name: Bob Wilson
  age: "35"
  city: Chicago
  active: "true"`;

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>YAML to CSV</h2>
        <p className="tool-desc">Convert YAML data to CSV format. Supports custom delimiters and optional header row.</p>
      </div>

      <div className="tool-grid">
        <div className="input-panel">
          <h3>YAML Input</h3>
          <div className="options-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeHeader}
                onChange={e => setIncludeHeader(e.target.checked)}
              />
              Include header row
            </label>
            <div className="delimiter-select">
              <label>Delimiter:</label>
              <select value={delimiter} onChange={e => setDelimiter(e.target.value)}>
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\\t">Tab (\\t)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
          </div>
          <textarea
            className="code-input"
            value={yamlInput}
            onChange={e => setYamlInput(e.target.value)}
            placeholder="Paste your YAML data here..."
            rows={15}
            spellCheck={false}
          />
          <div className="button-group">
            <button className="primary-btn" onClick={handleConvert}>Convert to CSV</button>
            <button className="secondary-btn" onClick={handleClear}>Clear</button>
            <button className="secondary-btn" onClick={() => setYamlInput(sampleYaml)}>Load Sample</button>
          </div>
          {error && <div className="error-message">{error}</div>}
          
          <div className="format-hint">
            <p><strong>Expected YAML format:</strong></p>
            <pre>{sampleYaml}</pre>
          </div>
        </div>

        <div className="output-panel">
          <div className="output-header">
            <h3>CSV Output</h3>
            <button className="copy-btn" onClick={handleCopy} disabled={!csvOutput}>
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <pre className="code-output">{csvOutput || 'CSV output will appear here...'}</pre>
        </div>
      </div>
    </div>
  );
}