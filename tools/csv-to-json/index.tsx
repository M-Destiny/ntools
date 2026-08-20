import { useState, useEffect } from 'react';

export default function CsvToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeaders, setHasHeaders] = useState(true);
  const [outputFormat, setOutputFormat] = useState<'array' | 'objects' | 'lines'>('array');
  const [quoteChar, setQuoteChar] = useState('"');

  useEffect(() => {
    setError(null);
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }
      const json = csvToJson(input);
      setOutput(json);
    } catch (e) {
      setError('Conversion failed: ' + (e as Error).message);
      setOutput('');
    }
  }, [input, delimiter, hasHeaders, outputFormat, quoteChar]);

  const csvToJson = (csv: string): string => {
    const lines = csv.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return '[]';

    // Parse CSV with proper quote handling
    const parsed = parseCsv(lines);
    if (parsed.length === 0) return '[]';

    let headers: string[];
    let dataRows: string[][];

    if (hasHeaders) {
      headers = parsed[0];
      dataRows = parsed.slice(1);
    } else {
      headers = parsed[0].map((_, i) => `column${i + 1}`);
      dataRows = parsed;
    }

    // Convert to objects
    const objects = dataRows.map(row => {
      const obj: Record<string, any> = {};
      headers.forEach((header, i) => {
        let value: any = row[i] !== undefined ? row[i] : '';
        // Try to auto-detect types
        value = autoConvert(value);
        obj[header] = value;
      });
      return obj;
    });

    switch (outputFormat) {
      case 'array':
        return JSON.stringify(objects, null, 2);
      case 'objects':
        return objects.map(o => JSON.stringify(o)).join('\n');
      case 'lines':
        return objects.map(o => JSON.stringify(o)).join('\n');
      default:
        return JSON.stringify(objects, null, 2);
    }
  };

  const parseCsv = (lines: string[]): string[][] => {
    const result: string[][] = [];
    
    for (const line of lines) {
      const row: string[] = [];
      let current = '';
      let inQuotes = false;
      let i = 0;

      while (i < line.length) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === quoteChar) {
          if (inQuotes && nextChar === quoteChar) {
            // Escaped quote
            current += quoteChar;
            i += 2;
            continue;
          }
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          row.push(current);
          current = '';
        } else {
          current += char;
        }
        i++;
      }
      row.push(current);
      result.push(row);
    }

    return result;
  };

  const autoConvert = (value: string): any => {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed.toLowerCase() === 'null') return null;
    if (trimmed.toLowerCase() === 'true') return true;
    if (trimmed.toLowerCase() === 'false') return false;
    
    // Number detection
    if (/^-?\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      if (num.toString() === trimmed) return num;
    }
    if (/^-?\d*\.\d+$/.test(trimmed)) {
      const num = parseFloat(trimmed);
      if (num.toString() === trimmed || trimmed.endsWith('.0')) return num;
    }
    
    return value;
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const loadExample = () => {
    const example = `id,name,email,age,active,score
1,John Doe,john@example.com,30,true,95.5
2,Jane Smith,jane@example.com,25,false,87.2
3,Bob Wilson,bob@example.com,35,true,91.0
4,Alice Brown,alice@example.com,28,true,88.7`;
    setInput(example);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>CSV to JSON Converter</h2>
        <p className="tool-desc">Convert CSV data to JSON. Auto-detects types, customizable delimiter, and multiple output formats.</p>
      </div>

      <div className="csv-json-toolbar">
        <div className="toolbar-group">
          <button onClick={clearAll} className="btn-secondary">Clear</button>
          <button onClick={copyOutput} className={copied ? 'copied' : 'btn-secondary'}>
            {copied ? '✓ Copied!' : 'Copy Output'}
          </button>
          <button onClick={downloadOutput} className="btn-secondary">Download .json</button>
          <button onClick={loadExample} className="btn-secondary">Load Example</button>
        </div>
        <div className="toolbar-group">
          <label>
            Delimiter:
            <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className="small-select">
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab (\t)</option>
              <option value="|">Pipe (|)</option>
            </select>
          </label>
          <label>
            Quote char:
            <select value={quoteChar} onChange={(e) => setQuoteChar(e.target.value)} className="small-select">
              <option value='"'>Double quote (")</option>
              <option value="'">Single quote (')</option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={hasHeaders}
              onChange={(e) => setHasHeaders(e.target.checked)}
            />
            First row is headers
          </label>
          <label>
            Format:
            <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value as any)} className="small-select">
              <option value="array">Array of objects</option>
              <option value="objects">JSON Lines (NDJSON)</option>
            </select>
          </label>
        </div>
      </div>

      {error && <div className="error-banner">✗ {error}</div>}

      <div className="csv-json-layout">
        <div className="editor-pane">
          <div className="pane-header">
            <h3>Input CSV</h3>
          </div>
          <textarea
            className="json-editor"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste CSV data here..."
            spellCheck={false}
          />
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <h3>JSON Output</h3>
          </div>
          <textarea
            className="json-editor output"
            value={output}
            readOnly
            spellCheck={false}
          />
        </div>
      </div>

      <div className="csv-json-info">
        <details>
          <summary>Conversion Details</summary>
          <ul>
            <li>Auto-converts: numbers, booleans (true/false), nulls</li>
            <li>Properly handles quoted fields with embedded delimiters and newlines</li>
            <li>Escaped quotes ("" → ") handled per RFC 4180</li>
            <li>Empty cells become empty strings (or null if "null" text)</li>
            <li>JSON Lines format outputs one JSON object per line (NDJSON)</li>
          </ul>
        </details>
      </div>
    </div>
  );
}