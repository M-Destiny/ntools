import React, { useState } from 'react';

export default function CsvToMarkdown() {
  const [csvInput, setCsvInput] = useState('');
  const [markdownOutput, setMarkdownOutput] = useState('');
  const [error, setError] = useState('');
  const [includeHeader, setIncludeHeader] = useState(true);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');

  const parseCSV = (csv: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];

      if (char === '"') {
        if (inQuotes && csv[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField);
        currentField = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && csv[i + 1] === '\n') {
          i++;
        }
        currentRow.push(currentField);
        if (currentRow.length > 0 || currentField !== '') {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }

    if (currentField !== '' || currentRow.length > 0) {
      currentRow.push(currentField);
      rows.push(currentRow);
    }

    return rows;
  };

  const escapeMarkdown = (str: string): string => {
    return str
      .replace(/\|/g, '\\|')
      .replace(/\n/g, '<br>');
  };

  const convert = () => {
    setError('');
    setMarkdownOutput('');

    if (!csvInput.trim()) {
      setError('Please enter CSV data');
      return;
    }

    try {
      const rows = parseCSV(csvInput.trim());

      if (rows.length === 0) {
        setError('No data found');
        return;
      }

      const headers = includeHeader && rows.length > 0 ? rows[0] : rows[0].map((_, i) => `col${i + 1}`);
      const dataRows = includeHeader ? rows.slice(1) : rows;

      if (headers.length === 0) {
        setError('No columns found');
        return;
      }

      // Calculate column widths for alignment (optional, for pretty output)
      const colWidths = headers.map((_, colIndex) => {
        const maxLen = Math.max(
          headers[colIndex].length,
          ...dataRows.map(row => (row[colIndex] || '').length)
        );
        return maxLen;
      });

      // Build markdown table
      let markdown = '';

      // Header row
      markdown += '| ' + headers.map((h, i) => escapeMarkdown(h).padEnd(colWidths[i])).join(' | ') + ' |\n';

      // Separator row with alignment
      const alignChars = {
        left: ':---',
        center: ':---:',
        right: '---:'
      };
      markdown += '| ' + colWidths.map((w, i) => alignChars[alignment].padEnd(w)).join(' | ') + ' |\n';

      // Data rows
      dataRows.forEach(row => {
        markdown += '| ' + row.map((cell, i) => escapeMarkdown(cell || '').padEnd(colWidths[i])).join(' | ') + ' |\n';
      });

      setMarkdownOutput(markdown);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    }
  };

  const copyToClipboard = () => {
    if (markdownOutput) {
      navigator.clipboard.writeText(markdownOutput);
    }
  };

  const downloadMarkdown = () => {
    if (markdownOutput) {
      const blob = new Blob([markdownOutput], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'output.md';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const sampleCsv = `name,age,city,email
John Doe,30,New York,john@example.com
Jane Smith,25,Los Angeles,jane@example.com
Bob Johnson,35,Chicago,bob@example.com`;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">CSV to Markdown Converter</h1>
        <p className="text-gray-600 mb-4">Convert CSV data to Markdown table format with configurable options</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">CSV Input</label>
            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your CSV data here..."
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setCsvInput(sampleCsv)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                Load Sample
              </button>
              <button
                onClick={() => setCsvInput('')}
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
              <label className="block text-sm font-medium mb-1">Alignment</label>
              <select
                value={alignment}
                onChange={(e) => setAlignment(e.target.value as 'left' | 'center' | 'right')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>

          <button
            onClick={convert}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Convert to Markdown
          </button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Markdown Output</h2>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                disabled={!markdownOutput}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded text-gray-700"
              >
                Copy
              </button>
              <button
                onClick={downloadMarkdown}
                disabled={!markdownOutput}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded text-gray-700"
              >
                Download
              </button>
            </div>
          </div>
          <textarea
            value={markdownOutput}
            readOnly
            className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Markdown output will appear here..."
          />
        </div>
      </div>
    </div>
  );
}