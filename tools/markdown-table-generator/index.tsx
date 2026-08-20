import { useState, useMemo } from 'react';

export default function MarkdownTableGenerator() {
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [headers, setHeaders] = useState<string[]>(['Header 1', 'Header 2', 'Header 3']);
  const [data, setData] = useState<string[][]>([
    ['Cell 1', 'Cell 2', 'Cell 3'],
    ['Cell 4', 'Cell 5', 'Cell 6'],
    ['Cell 7', 'Cell 8', 'Cell 9'],
  ]);
  const [alignment, setAlignment] = useState<('left' | 'center' | 'right')[]>(['left', 'left', 'left']);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState('');

  const generateTable = useMemo(() => {
    if (cols === 0 || rows === 0) return '';
    
    // Header row
    const headerRow = '| ' + headers.slice(0, cols).join(' | ') + ' |';
    
    // Alignment row
    const alignMap = { left: ':---', center: ':---:', right: '---:' };
    const alignRow = '| ' + alignment.slice(0, cols).map(a => alignMap[a]).join(' | ') + ' |';
    
    // Data rows
    const dataRows = data.slice(0, rows).map(row => 
      '| ' + row.slice(0, cols).join(' | ') + ' |'
    ).join('\n');
    
    return headerRow + '\n' + alignRow + '\n' + dataRows;
  }, [rows, cols, headers, data, alignment]);

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRows = Math.max(1, Math.min(50, parseInt(e.target.value) || 1));
    setRows(newRows);
    if (newRows > data.length) {
      const newData = [...data];
      for (let i = data.length; i < newRows; i++) {
        newData.push(Array(cols).fill(''));
      }
      setData(newData);
    }
  };

  const handleColsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCols = Math.max(1, Math.min(20, parseInt(e.target.value) || 1));
    setCols(newCols);
    if (newCols > headers.length) {
      setHeaders([...headers, ...Array(newCols - headers.length).fill('')]);
      setAlignment([...alignment, ...Array(newCols - alignment.length).fill('left')]);
      setData(data.map(row => [...row, ...Array(newCols - row.length).fill('')]));
    }
  };

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = value;
    setHeaders(newHeaders);
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    newData[rowIndex] = [...newData[rowIndex]];
    newData[rowIndex][colIndex] = value;
    setData(newData);
  };

  const handleAlignmentChange = (index: number, value: 'left' | 'center' | 'right') => {
    const newAlignment = [...alignment];
    newAlignment[index] = value;
    setAlignment(newAlignment);
  };

  const addRow = () => {
    if (rows < 50) {
      setRows(rows + 1);
      setData([...data, Array(cols).fill('')]);
    }
  };

  const removeRow = (index: number) => {
    if (rows > 1) {
      setRows(rows - 1);
      setData(data.filter((_, i) => i !== index));
    }
  };

  const addCol = () => {
    if (cols < 20) {
      setCols(cols + 1);
      setHeaders([...headers, `Header ${cols + 1}`]);
      setAlignment([...alignment, 'left']);
      setData(data.map(row => [...row, '']));
    }
  };

  const removeCol = (index: number) => {
    if (cols > 1) {
      setCols(cols - 1);
      setHeaders(headers.filter((_, i) => i !== index));
      setAlignment(alignment.filter((_, i) => i !== index));
      setData(data.map(row => row.filter((_, i) => i !== index)));
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(generateTable());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    setRows(4);
    setCols(4);
    setHeaders(['Name', 'Age', 'City', 'Role']);
    setAlignment(['left', 'center', 'left', 'center']);
    setData([
      ['Alice', '28', 'New York', 'Developer'],
      ['Bob', '35', 'San Francisco', 'Designer'],
      ['Carol', '31', 'London', 'Manager'],
      ['Dave', '26', 'Tokyo', 'Engineer'],
    ]);
  };

  const clearAll = () => {
    setRows(3);
    setCols(3);
    setHeaders(['Header 1', 'Header 2', 'Header 3']);
    setAlignment(['left', 'left', 'left']);
    setData([
      ['Cell 1', 'Cell 2', 'Cell 3'],
      ['Cell 4', 'Cell 5', 'Cell 6'],
      ['Cell 7', 'Cell 8', 'Cell 9'],
    ]);
  };

  const exportCSV = () => {
    const csvRows = [
      headers.slice(0, cols).join(','),
      ...data.slice(0, rows).map(row => row.slice(0, cols).map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ];
    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'table.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Markdown Table Generator</h2>
        <p className="tool-desc">Create Markdown tables visually. Adjust rows/columns, set alignments, and export to Markdown or CSV.</p>
      </div>

      <div className="table-generator-layout">
        <div className="controls-panel">
          <div className="control-group">
            <label>Rows: <input type="number" value={rows} onChange={handleRowsChange} min="1" max="50" /></label>
            <label>Columns: <input type="number" value={cols} onChange={handleColsChange} min="1" max="20" /></label>
          </div>

          <div className="control-group">
            <button onClick={addRow} className="btn-secondary" disabled={rows >= 50}>+ Add Row</button>
            <button onClick={addCol} className="btn-secondary" disabled={cols >= 20}>+ Add Column</button>
          </div>

          <div className="control-group">
            <button onClick={loadExample} className="btn-secondary">Load Example</button>
            <button onClick={clearAll} className="btn-secondary">Clear</button>
            <button onClick={exportCSV} className="btn-secondary">Export CSV</button>
          </div>

          <div className="control-group">
            <button onClick={copyOutput} className={copied ? 'copied' : ''}>
              {copied ? '✓ Copied!' : 'Copy Markdown'}
            </button>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Table Editor</h3>
          </div>
          <div className="table-editor">
            <div className="header-row">
              {headers.slice(0, cols).map((header, i) => (
                <div key={i} className="header-cell">
                  <input
                    type="text"
                    value={header}
                    onChange={e => handleHeaderChange(i, e.target.value)}
                    placeholder={`Header ${i + 1}`}
                  />
                  <select
                    value={alignment[i]}
                    onChange={e => handleAlignmentChange(i, e.target.value as 'left' | 'center' | 'right')}
                    className="align-select"
                  >
                    <option value="left">← Left</option>
                    <option value="center">↔ Center</option>
                    <option value="right">→ Right</option>
                  </select>
                  {cols > 1 && <button onClick={() => removeCol(i)} className="remove-btn" title="Remove column">×</button>}
                </div>
              ))}
            </div>
            {data.slice(0, rows).map((row, r) => (
              <div key={r} className="data-row">
                {row.slice(0, cols).map((cell, c) => (
                  <div key={c} className="data-cell">
                    <input
                      type="text"
                      value={cell}
                      onChange={e => handleCellChange(r, c, e.target.value)}
                      placeholder={`Row ${r + 1}, Col ${c + 1}`}
                    />
                    {rows > 1 && <button onClick={() => removeRow(r)} className="remove-btn" title="Remove row">×</button>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Markdown Output</h3>
            <div className="toolbar-actions">
              <button onClick={copyOutput} className={copied ? 'copied' : ''}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            className="json-editor output"
            value={generateTable}
            readOnly
            spellCheck={false}
          />
          <div className="preview-section">
            <h4>Preview</h4>
            <div className="markdown-preview">
              {generateTable.split('\n').map((line, i) => (
                <div key={i} style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}