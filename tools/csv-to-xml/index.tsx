import { useState } from 'react';

export default function CsvToXml() {
  const [csvInput, setCsvInput] = useState('');
  const [xmlOutput, setXmlOutput] = useState('');
  const [error, setError] = useState('');
  const [rootElement, setRootElement] = useState('root');
  const [rowElement, setRowElement] = useState('row');
  const [includeHeader, setIncludeHeader] = useState(true);

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

  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&apos;');
  };

  const sanitizeTagName = (name: string): string => {
    return name
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/^[^a-zA-Z_]/, '_$&');
  };

  const convert = () => {
    setError('');
    setXmlOutput('');
    
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
      
      const root = sanitizeTagName(rootElement);
      const row = sanitizeTagName(rowElement);
      
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += `<${root}>\n`;
      
      dataRows.forEach((dataRow) => {
        xml += `  <${row}>\n`;
        headers.forEach((header, colIndex) => {
          const value = dataRow[colIndex] !== undefined ? dataRow[colIndex] : '';
          const tagName = sanitizeTagName(header);
          xml += `    <${tagName}>${escapeXml(value)}</${tagName}>\n`;
        });
        xml += `  </${row}>\n`;
      });
      
      xml += `</${root}>`;
      setXmlOutput(xml);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    }
  };

  const copyToClipboard = () => {
    if (xmlOutput) {
      navigator.clipboard.writeText(xmlOutput);
    }
  };

  const downloadXml = () => {
    if (xmlOutput) {
      const blob = new Blob([xmlOutput], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'output.xml';
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
        <h1 className="text-2xl font-bold mb-2">CSV to XML Converter</h1>
        <p className="text-gray-600 mb-4">Convert CSV data to XML format with configurable options</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Root Element</label>
              <input
                type="text"
                value={rootElement}
                onChange={(e) => setRootElement(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Row Element</label>
              <input
                type="text"
                value={rowElement}
                onChange={(e) => setRowElement(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
          </div>

          <button
            onClick={convert}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Convert to XML
          </button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">XML Output</h2>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                disabled={!xmlOutput}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded text-gray-700"
              >
                Copy
              </button>
              <button
                onClick={downloadXml}
                disabled={!xmlOutput}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 rounded text-gray-700"
              >
                Download
              </button>
            </div>
          </div>
          <textarea
            value={xmlOutput}
            readOnly
            className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="XML output will appear here..."
          />
        </div>
      </div>
    </div>
  );
}