import { useState } from 'react';

type InputFormat = 'csv' | 'tsv' | 'json' | 'html' | 'excel';

export default function TableToMarkdown() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [format, setFormat] = useState<InputFormat>('csv');
  const [hasHeader, setHasHeader] = useState(true);
  const [delimiter, setDelimiter] = useState(',');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const parseCSV = (text: string, delim: string): string[][] => {
    const lines = text.trim().split('\n');
    const result: string[][] = [];
    
    let inQuotes = false;
    let currentField = '';
    let currentRow: string[] = [];

    for (const line of lines) {
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            currentField += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delim && !inQuotes) {
          currentRow.push(currentField);
          currentField = '';
        } else {
          currentField += char;
        }
      }
      currentRow.push(currentField);
      result.push(currentRow);
      currentRow = [];
      currentField = '';
      inQuotes = false;
    }

    return result;
  };

  const parseTSV = (text: string): string[][] => parseCSV(text, '\t');

  const parseJSON = (text: string): string[][] => {
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error('JSON must be an array of objects');
    if (data.length === 0) return [[]];
    
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(h => String(obj[h] ?? '')));
    return [headers, ...rows];
  };

  const parseHTML = (text: string): string[][] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const tables = doc.querySelectorAll('table');
    if (tables.length === 0) throw new Error('No table found in HTML');
    
    const table = tables[0];
    const rows = table.querySelectorAll('tr');
    const result: string[][] = [];
    
    rows.forEach(row => {
      const cells = row.querySelectorAll('th, td');
      const rowData: string[] = [];
      cells.forEach(cell => rowData.push(cell.textContent?.trim() || ''));
      result.push(rowData);
    });
    
    return result;
  };

  const generateMarkdown = (rows: string[][], hasHeaderRow: boolean): string => {
    if (rows.length === 0) return '';
    
    const headerRow = rows[0];
    const dataRows = hasHeaderRow ? rows.slice(1) : rows;
    const headers = hasHeaderRow ? headerRow : headerRow.map((_, i) => `Column ${i + 1}`);
    
    const colCount = headers.length;
    const alignRow = headers.map(() => '---').join('|');
    
    const headerLine = '| ' + headers.join(' | ') + ' |';
    const separatorLine = '| ' + alignRow + ' |';
    
    const dataLines = dataRows.map(row => {
      const paddedRow = [...row];
      while (paddedRow.length < colCount) paddedRow.push('');
      return '| ' + paddedRow.slice(0, colCount).join(' | ') + ' |';
    }).join('\n');
    
    return [headerLine, separatorLine, dataLines].join('\n');
  };

  const convert = () => {
    setError(null);
    try {
      let rows: string[][];
      
      switch (format) {
        case 'csv':
          rows = parseCSV(input, delimiter);
          break;
        case 'tsv':
          rows = parseTSV(input);
          break;
        case 'json':
          rows = parseJSON(input);
          break;
        case 'html':
          rows = parseHTML(input);
          break;
        default:
          throw new Error('Unsupported format');
      }
      
      const md = generateMarkdown(rows, hasHeader);
      setOutput(md);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed');
      setOutput('');
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const loadExample = () => {
    const examples: Record<InputFormat, string> = {
      csv: `Name,Age,City,Active
Alice,30,New York,true
Bob,25,San Francisco,false
Charlie,35,Chicago,true`,
      tsv: `Name\tAge\tCity\tActive
Alice\t30\tNew York\ttrue
Bob\t25\tSan Francisco\tfalse
Charlie\t35\tChicago\ttrue`,
      json: `[
  {"Name": "Alice", "Age": 30, "City": "New York", "Active": true},
  {"Name": "Bob", "Age": 25, "City": "San Francisco", "Active": false},
  {"Name": "Charlie", "Age": 35, "City": "Chicago", "Active": true}
]`,
      html: `<table>
  <thead>
    <tr><th>Name</th><th>Age</th><th>City</th><th>Active</th></tr>
  </thead>
  <tbody>
    <tr><td>Alice</td><td>30</td><td>New York</td><td>true</td></tr>
    <tr><td>Bob</td><td>25</td><td>San Francisco</td><td>false</td></tr>
    <tr><td>Charlie</td><td>35</td><td>Chicago</td><td>true</td></tr>
  </tbody>
</table>`,
      excel: `Name,Age,City,Active
Alice,30,New York,true
Bob,25,San Francisco,false
Charlie,35,Chicago,true`
    };
    setInput(examples[format] || examples.csv);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Table to Markdown</h2>
        <p className="tool-desc">Convert CSV, TSV, JSON, HTML tables, or Excel data to Markdown tables</p>
      </div>

      <div className="table-converter-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input Data</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>

          <div className="format-options">
            <label>
              <span>Format</span>
              <select value={format} onChange={(e) => setFormat(e.target.value as InputFormat)}>
                <option value="csv">CSV (Comma Separated)</option>
                <option value="tsv">TSV (Tab Separated)</option>
                <option value="json">JSON Array</option>
                <option value="html">HTML Table</option>
                <option value="excel">Excel (CSV Export)</option>
              </select>
            </label>

            {format === 'csv' && (
              <label>
                <span>Delimiter</span>
                <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="|">Pipe (|)</option>
                  <option value="\t">Tab</option>
                </select>
              </label>
            )}

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
              />
              First row is header
            </label>
          </div>

          <textarea
            className="table-editor"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your data here..."
            spellCheck={false}
            rows={15}
          />

          {error && <div className="error-message">✗ {error}</div>}
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Markdown Output</h3>
            <div className="toolbar-actions">
              <button onClick={copyOutput} className={copied ? 'copied' : ''}>
                {copied ? '✓ Copied!' : 'Copy Markdown'}
              </button>
            </div>
          </div>
          <textarea
            className="table-editor output"
            value={output}
            readOnly
            spellCheck={false}
            rows={15}
          />
          
          <button className="btn-primary convert-btn" onClick={convert}>
            Convert to Markdown
          </button>
        </div>
      </div>
    </div>
  );
}