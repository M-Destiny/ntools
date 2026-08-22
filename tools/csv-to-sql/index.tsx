import { useState } from 'react';

export default function CsvToSql() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [tableName, setTableName] = useState('users');
  const [includeCreateTable, setIncludeCreateTable] = useState(true);
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

  const escapeSql = (value: string): string => {
    return value.replace(/'/g, "''");
  };

  const inferType = (values: string[]): string => {
    const nonEmpty = values.filter(v => v !== '');
    if (nonEmpty.length === 0) return 'TEXT';

    const allInt = nonEmpty.every(v => /^-?\d+$/.test(v));
    if (allInt) return 'INTEGER';

    const allFloat = nonEmpty.every(v => /^-?\d*\.?\d+$/.test(v));
    if (allFloat) return 'REAL';

    const allBool = nonEmpty.every(v => v.toLowerCase() === 'true' || v.toLowerCase() === 'false');
    if (allBool) return 'BOOLEAN';

    return 'TEXT';
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

      const headers = rows[0];
      const dataRows = rows.slice(1);

      if (dataRows.length === 0) {
        setOutput('');
        return;
      }

      // Infer column types
      const columns = headers.map((_, colIndex) => {
        const values = dataRows.map(row => row[colIndex] || '');
        return { name: headers[colIndex], type: inferType(values) };
      });

      let sql = '';

      if (includeCreateTable) {
        const columnDefs = columns.map(c => `"${c.name}" ${c.type}`).join(',\n  ');
        sql += `CREATE TABLE "${tableName}" (\n  ${columnDefs}\n);\n\n`;
      }

      // Generate INSERT statements
      const insertHeader = `INSERT INTO "${tableName}" (${columns.map(c => `"${c.name}"`).join(', ')}) VALUES`;

      const valueRows = dataRows.map(row => {
        const values = row.map((val, i) => {
          if (val === '') return 'NULL';
          if (columns[i].type === 'TEXT') return `'${escapeSql(val)}'`;
          if (columns[i].type === 'BOOLEAN') return val.toLowerCase() === 'true' ? 'TRUE' : 'FALSE';
          return val;
        });
        return `(${values.join(', ')})`;
      });

      sql += insertHeader + '\n' + valueRows.join(',\n') + ';';

      setOutput(sql);
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
3,Carol Williams,carol@example.com,35,true,85000
4,David Brown,david@example.com,28,true,72000
5,Eve Davis,eve@example.com,32,false,68000`;
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
        <h2>CSV to SQL</h2>
        <p className="tool-desc">Convert CSV data to SQL INSERT statements with optional CREATE TABLE</p>
      </div>

      <div className="controls-panel-full">
        <div className="control-group">
          <label>Table Name</label>
          <input
            type="text"
            value={tableName}
            onChange={(e) => { setTableName(e.target.value); processCsv(); }}
            placeholder="table_name"
          />
        </div>
        <div className="control-group">
          <label>Delimiter</label>
          <select
            value={delimiter}
            onChange={(e) => { setDelimiter(e.target.value); processCsv(); }}
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab (\t)</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>
        <div className="control-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeCreateTable}
              onChange={(e) => { setIncludeCreateTable(e.target.checked); processCsv(); }}
            />
            Include CREATE TABLE statement
          </label>
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
            <h3>SQL Output</h3>
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