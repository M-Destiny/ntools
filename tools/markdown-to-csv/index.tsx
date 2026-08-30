import { useState } from 'react';

export default function MarkdownToCsv() {
  const [markdownInput, setMarkdownInput] = useState('');
  const [csvOutput, setCsvOutput] = useState('');
  const [error, setError] = useState('');
  const [includeHeader, setIncludeHeader] = useState(true);
  const [delimiter, setDelimiter] = useState(',');

  const parseMarkdownTable = (markdown: string): string[][] => {
    const lines = markdown.trim().split('\n');
    const tableLines = lines.filter(line => line.trim().startsWith('|') && line.trim().endsWith('|'));
    
    if (tableLines.length < 2) {
      throw new Error('No valid markdown table found (need at least header and separator rows)');
    }

    const rows: string[][] = [];
    
    for (const line of tableLines) {
      // Remove leading/trailing pipes and split
      const cells = line.trim().slice(1, -1).split('|').map(cell => cell.trim());
      
      // Skip separator rows (rows with only dashes, colons, pipes)
      const isSeparator = cells.every(cell => /^:?-+:?$/.test(cell));
      if (!isSeparator) {
        // Unescape markdown escapes
        const unescaped = cells.map(cell => cell.replace(/\\\|/g, '|').replace(/<br>/g, '\n'));
        rows.push(unescaped);
      }
    }

    return rows;
  };

  const escapeCsv = (str: string): string => {
    // Escape double quotes and wrap in quotes if contains delimiter, quotes, or newlines
    const escaped = str.replace(/"/g, '""');
    if (escaped.includes(delimiter) || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
      return `"${escaped}"`;
    }
    return escaped;
  };

  const convert = () => {
    setError('');
    setCsvOutput('');

    if (!markdownInput.trim()) {
      setError('Please enter Markdown table data');
      return;
    }

    try {
      const rows = parseMarkdownTable(markdownInput.trim());

      if (rows.length === 0) {
        setError('No data rows found in table');
        return;
      }

      const headers = includeHeader && rows.length > 0 ? rows[0] : rows[0].map((_, i) => `col${i + 1}`);
      const dataRows = includeHeader ? rows.slice(1) : rows;

      let csv = '';
      
      // Header row
      if (includeHeader && rows.length > 0) {
        csv += headers.map(escapeCsv).join(delimiter) + '\n';
      }
      
      // Data rows
      dataRows.forEach(row => {
        // Pad row to match header length
        const paddedRow = [...row];
        while (paddedRow.length < headers.length) {
          paddedRow.push('');
        }
        csv += paddedRow.slice(0, headers.length).map(escapeCsv).join(delimiter) + '\n';
      });

      setCsvOutput(csv.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    }
  };

  const copyToClipboard = () => {
    if (csvOutput) {
      navigator.clipboard.writeText(csvOutput);
    }
  };

  const downloadCsv = () => {
    if (csvOutput) {
      const blob = new Blob([csvOutput], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'output.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const sampleMarkdown = `| name | age | city | email |
| :--- | :---: | ---: | :--- |
| John Doe | 30 | New York | john@example.com |
| Jane Smith | 25 | Los Angeles | jane@example.com |
| Bob Johnson | 35 | Chicago | bob@example.com |`;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Markdown to CSV Converter</h1>
        <p className="text-gray-600 mb-4">Convert Markdown table to CSV format with configurable options</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Markdown Table Input</label>
            <textarea
              value={markdownInput}
              onChange={(e) => setMarkdownInput(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your Markdown table here..."
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setMarkdownInput(sampleMarkdown)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                Load Sample
              </button>
              <button
                onClick={() => setMarkdownInput('')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm">First row is header</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delimiter</label>
              <select
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab (\t)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
          </div>

          <button
            onClick={convert}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Convert to CSV
          </button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">CSV Output</h2>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                disabled={!csvOutput}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded text-gray-700"
              >
                Copy
              </button>
              <button
                onClick={downloadCsv}
                disabled={!csvOutput}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded text-gray-700"
              >
                Download
              </button>
            </div>
          </div>
          <textarea
            value={csvOutput}
            readOnly
            className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="CSV output will appear here..."
          />
        </div>
      </div>
    </div>
  );
}