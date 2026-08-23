import { useState } from 'react';

export default function CsvToTsv() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const parseCsv = (csv: string, delim: string): string[][] => {
    const lines = csv.trim().split('\n');
    const result: string[][] = [];
    let current = '';
    let inQuotes = false;
    let row: string[] = [];

    for (const line of lines) {
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delim && !inQuotes) {
          row.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      row.push(current);
      result.push(row);
      row = [];
      current = '';
      inQuotes = false;
    }
    return result;
  };

  const processCsv = () => {
    setError(null);
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }

      const rows = parseCsv(input, delimiter);
      if (rows.length === 0) {
        setOutput('');
        return;
      }

      const tsvRows = rows.map(row => row.join('\t'));
      setOutput(tsvRows.join('\n'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse CSV');
      setOutput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    processCsv();
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    const example = `id,name,email,age,active,salary
1,Alice Johnson,alice@example.com,30,true,75000
2,Bob Smith,bob@example.com,25,false,65000
3,Carol Williams,carol@example.com,35,true,85000`;
    setInput(example);
    processCsv();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>CSV to TSV</h2>
        <p className="tool-desc">Convert CSV data to Tab-Separated Values (TSV)</p>
      </div>

      <div className="controls-panel-full">
        <div className="control-group">
          <label>Input Delimiter</label>
          <select
            value={delimiter}
            onChange={(e) => { setDelimiter(e.target.value); processCsv(); }}
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>CSV Input</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="json-editor"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste CSV data here..."
            spellCheck={false}
          />
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>TSV Output</h3>
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