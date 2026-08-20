import { useState, useEffect } from 'react';

export default function JsonToCsv() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [delimiter, setDelimiter] = useState(',');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [flattenNested, setFlattenNested] = useState(true);

  useEffect(() => {
    setError(null);
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }
      const parsed = JSON.parse(input);
      const csv = jsonToCsv(parsed);
      setOutput(csv);
    } catch (e) {
      setError('Invalid JSON: ' + (e as Error).message);
      setOutput('');
    }
  }, [input, delimiter, includeHeaders, flattenNested]);

  const jsonToCsv = (data: any): string => {
    if (!Array.isArray(data)) {
      data = [data];
    }

    if (data.length === 0) return '';

    // Flatten objects if enabled
    const flattened = flattenNested ? data.map((item: any) => flattenObject(item)) : data;

    // Get all unique keys
    const allKeys = new Set<string>();
    flattened.forEach((item: any) => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    });

    const keys = Array.from(allKeys);
    
    // Generate header
    const header = keys.map(key => {
      return escapeCsv(key);
    }).join(delimiter);

    // Generate rows
    const rows = flattened.map((item: any) => {
      return keys.map(key => {
        const value = item[key];
        return escapeCsv(formatValue(value));
      }).join(delimiter);
    });

    const parts = [];
    if (includeHeaders) parts.push(header);
    parts.push(...rows);
    return parts.join('\n');
  };

  const flattenObject = (obj: any, prefix = ''): any => {
    const result: any = {};
    
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively flatten nested objects
        const flattened = flattenObject(value, newKey);
        Object.assign(result, flattened);
      } else if (Array.isArray(value)) {
        // Handle arrays - join with semicolon or stringify
        if (value.every(v => typeof v !== 'object')) {
          result[newKey] = value.join('; ');
        } else {
          result[newKey] = JSON.stringify(value);
        }
      } else {
        result[newKey] = value;
      }
    }
    
    return result;
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const escapeCsv = (value: string): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const loadExample = () => {
    const example = `[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "zip": "94102"
    },
    "tags": ["developer", "designer"],
    "active": true
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "address": {
      "street": "456 Oak Ave",
      "city": "New York",
      "zip": "10001"
    },
    "tags": ["manager", "writer"],
    "active": false
  }
]`;
    setInput(example);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JSON to CSV Converter</h2>
        <p className="tool-desc">Convert JSON arrays or objects to CSV. Flattens nested objects, customizable delimiter, and header options.</p>
      </div>

      <div className="json-csv-toolbar">
        <div className="toolbar-group">
          <button onClick={clearAll} className="btn-secondary">Clear</button>
          <button onClick={copyOutput} className={copied ? 'copied' : 'btn-secondary'}>
            {copied ? '✓ Copied!' : 'Copy Output'}
          </button>
          <button onClick={downloadOutput} className="btn-secondary">Download .csv</button>
          <button onClick={loadExample} className="btn-secondary">Load Example</button>
        </div>
        <div className="toolbar-group">
          <label>
            Delimiter:
            <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className="small-select">
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab (\\t)</option>
              <option value="|">Pipe (|)</option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={includeHeaders}
              onChange={(e) => setIncludeHeaders(e.target.checked)}
            />
            Include headers
          </label>
          <label>
            <input
              type="checkbox"
              checked={flattenNested}
              onChange={(e) => setFlattenNested(e.target.checked)}
            />
            Flatten nested objects
          </label>
        </div>
      </div>

      {error && <div className="error-banner">✗ {error}</div>}

      <div className="json-csv-layout">
        <div className="editor-pane">
          <div className="pane-header">
            <h3>Input JSON</h3>
          </div>
          <textarea
            className="json-editor"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste JSON array or object here..."
            spellCheck={false}
          />
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <h3>CSV Output</h3>
          </div>
          <textarea
            className="json-editor output"
            value={output}
            readOnly
            spellCheck={false}
          />
        </div>
      </div>

      <div className="json-csv-info">
        <details>
          <summary>Conversion Details</summary>
          <ul>
            <li>Input can be a JSON array or single object (wrapped in array)</li>
            <li>Nested objects are flattened with dot notation (e.g., address.city)</li>
            <li>Arrays of primitives joined with semicolon; arrays of objects stringified</li>
            <li>Fields with commas, quotes, or newlines are auto-quoted per RFC 4180</li>
            <li>Null/undefined values become empty cells</li>
          </ul>
        </details>
      </div>
    </div>
  );
}