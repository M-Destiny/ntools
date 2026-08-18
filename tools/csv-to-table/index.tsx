import { useState, useRef, useEffect } from 'react';

interface CSVData {
  headers: string[];
  rows: string[][];
}

export default function CSVToTable() {
  const [csvInput, setCsvInput] = useState(`Name,Age,City,Occupation,Salary
Alice Johnson,28,New York,Software Engineer,95000
Bob Smith,35,San Francisco,Product Manager,120000
Carol Williams,42,Chicago,Data Scientist,110000
David Brown,31,Austin,DevOps Engineer,98000
Eva Martinez,29,Seattle,UX Designer,87000`);
  const [parsedData, setParsedData] = useState<CSVData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeader, setHasHeader] = useState(true);
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [copied, setCopied] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    parseCSV();
  }, [csvInput, delimiter, hasHeader]);

  const parseCSV = () => {
    setError(null);
    try {
      const lines = csvInput.trim().split('\n').filter(l => l.trim());
      if (lines.length === 0) {
        setParsedData({ headers: [], rows: [] });
        return;
      }

      const parseLine = (line: string) => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === delimiter && !inQuotes) {
            result.push(current);
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current);
        return result;
      };

      const parsed = lines.map(parseLine);
      
      if (hasHeader && parsed.length > 0) {
        setParsedData({
          headers: parsed[0],
          rows: parsed.slice(1)
        });
      } else {
        const numCols = parsed[0]?.length || 0;
        setParsedData({
          headers: Array.from({ length: numCols }, (_, i) => `Column ${i + 1}`),
          rows: parsed
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse CSV');
      setParsedData(null);
    }
  };

  const loadExample = () => {
    setCsvInput(`Name,Age,City,Occupation,Salary
Alice Johnson,28,New York,Software Engineer,95000
Bob Smith,35,San Francisco,Product Manager,120000
Carol Williams,42,Chicago,Data Scientist,110000
David Brown,31,Austin,DevOps Engineer,98000
Eva Martinez,29,Seattle,UX Designer,87000
Frank Lee,38,Boston,Backend Developer,105000
Grace Kim,26,Denver,Frontend Developer,82000
Henry Chen,45,Atlanta,Engineering Manager,145000`);
  };

  const clearAll = () => {
    setCsvInput('');
    setParsedData(null);
    setError(null);
  };

  const copyAsMarkdown = () => {
    if (!parsedData) return;
    let md = '| ' + parsedData.headers.join(' | ') + ' |\n';
    md += '| ' + parsedData.headers.map(() => '---').join(' | ') + ' |\n';
    parsedData.rows.forEach(row => {
      md += '| ' + row.join(' | ') + ' |\n';
    });
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAsJSON = () => {
    if (!parsedData) return;
    const json = parsedData.rows.map(row => {
      const obj: Record<string, string> = {};
      parsedData.headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      return obj;
    });
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCSV = () => {
    if (!parsedData) return;
    let csv = parsedData.headers.join(delimiter) + '\n';
    parsedData.rows.forEach(row => {
      csv += row.join(delimiter) + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSort = (colIndex: number) => {
    if (!parsedData) return;
    setSortColumn(prev => prev === colIndex ? null : colIndex);
    setSortDirection(prev => sortColumn === colIndex && prev === 'asc' ? 'desc' : 'asc');
  };

  const getFilteredAndSortedRows = () => {
    if (!parsedData) return [];
    
    let rows = [...parsedData.rows];
    
    // Filter
    if (filterText) {
      const lowerFilter = filterText.toLowerCase();
      rows = rows.filter(row => 
        row.some(cell => cell.toLowerCase().includes(lowerFilter))
      );
    }
    
    // Sort
    if (sortColumn !== null) {
      rows.sort((a, b) => {
        const aVal = a[sortColumn] || '';
        const bVal = b[sortColumn] || '';
        const numA = parseFloat(aVal);
        const numB = parseFloat(bVal);
        const isNumeric = !isNaN(numA) && !isNaN(numB);
        
        let comparison = 0;
        if (isNumeric) {
          comparison = numA - numB;
        } else {
          comparison = aVal.localeCompare(bVal);
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    return rows;
  };

  const filteredRows = getFilteredAndSortedRows();
  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>CSV to Table</h2>
        <p className="tool-desc">Parse CSV data into a sortable, filterable table. Export as Markdown, JSON, or CSV.</p>
      </div>

      <div className="csv-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>CSV Input</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          
          <div className="csv-options">
            <div className="option-group">
              <label>Delimiter</label>
              <select value={delimiter} onChange={e => setDelimiter(e.target.value)} className="option-select">
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab (\t)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
            <div className="option-group">
              <label>
                <input 
                  type="checkbox" 
                  checked={hasHeader} 
                  onChange={e => setHasHeader(e.target.checked)} 
                />
                First row is header
              </label>
            </div>
          </div>
          
          <textarea
            className="csv-editor"
            value={csvInput}
            onChange={e => setCsvInput(e.target.value)}
            placeholder="Paste CSV data here..."
            spellCheck={false}
          />
          
          {error && <div className="error-message">✗ {error}</div>}
        </div>

        <div className="table-panel">
          <div className="table-toolbar">
            <h3>Parsed Table ({filteredRows.length} rows)</h3>
            <div className="table-actions">
              <input
                type="text"
                className="filter-input"
                placeholder="Filter rows..."
                value={filterText}
                onChange={e => { setFilterText(e.target.value); setCurrentPage(1); }}
              />
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="page-size-select"
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
              <button onClick={copyAsMarkdown} className={copied ? 'copied' : ''}>
                {copied ? '✓ Copied!' : 'Copy Markdown'}
              </button>
              <button onClick={copyAsJSON} className="btn-secondary">Copy JSON</button>
              <button onClick={downloadCSV} className="btn-secondary">Download CSV</button>
            </div>
          </div>

          {parsedData && (
            <div className="table-wrapper">
              <table className="data-table" ref={tableRef}>
                <thead>
                  <tr>
                    {parsedData.headers.map((header, i) => (
                      <th key={i} onClick={() => handleSort(i)} className={sortColumn === i ? `sorted ${sortDirection}` : ''}>
                        {header}
                        {sortColumn === i && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={parsedData.headers.length} className="empty-row">No data to display</td>
                    </tr>
                  ) : (
                    paginatedRows.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {row.map((cell, colIdx) => (
                          <td key={colIdx}>{cell}</td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                className="page-btn"
              >
                ← Prev
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}