import { useState } from 'react';

export default function XmlToCsv() {
  const [xmlInput, setXmlInput] = useState('');
  const [csvOutput, setCsvOutput] = useState('');
  const [error, setError] = useState('');
  const [delimiter, setDelimiter] = useState(',');
  const [includeHeader, setIncludeHeader] = useState(true);
  const [rowSelector, setRowSelector] = useState('row');

  const parseXML = (xml: string): Document | null => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'text/xml');
      const parseError = doc.querySelector('parsererror');
      if (parseError) {
        throw new Error(parseError.textContent || 'XML parsing failed');
      }
      return doc;
    } catch {
      return null;
    }
  };

  const escapeCsv = (value: string): string => {
    if (value.includes(delimiter) || value.includes('"') || value.includes('\n') || value.includes('\r')) {
      return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
  };

  const convert = () => {
    setError('');
    setCsvOutput('');
    
    if (!xmlInput.trim()) {
      setError('Please enter XML data');
      return;
    }
    
    const doc = parseXML(xmlInput.trim());
    if (!doc) {
      setError('Invalid XML format');
      return;
    }
    
    try {
      const rows = doc.querySelectorAll(rowSelector);
      
      if (rows.length === 0) {
        setError(`No elements found matching selector: ${rowSelector}`);
        return;
      }
      
      const firstRow = rows[0];
      const childElements = Array.from(firstRow.children);
      const headers = childElements.map(el => el.tagName);
      
      let csv = '';
      
      if (includeHeader) {
        csv += headers.map(h => escapeCsv(h)).join(delimiter) + '\n';
      }
      
      rows.forEach((row) => {
        const values = childElements.map((_, i) => {
          const child = row.children[i];
          return child ? child.textContent || '' : '';
        });
        csv += values.map(v => escapeCsv(v)).join(delimiter) + '\n';
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

  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <row>
    <name>John Doe</name>
    <age>30</age>
    <city>New York</city>
    <email>john@example.com</email>
  </row>
  <row>
    <name>Jane Smith</name>
    <age>25</age>
    <city>Los Angeles</city>
    <email>jane@example.com</email>
  </row>
  <row>
    <name>Bob Johnson</name>
    <age>35</age>
    <city>Chicago</city>
    <email>bob@example.com</email>
  </row>
</root>`;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">XML to CSV Converter</h1>
        <p className="text-gray-600 mb-4">Convert XML data to CSV format with configurable options</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">XML Input</label>
            <textarea
              value={xmlInput}
              onChange={(e) => setXmlInput(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your XML data here..."
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setXmlInput(sampleXml)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                Load Sample
              </button>
              <button
                onClick={() => setXmlInput('')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Row Selector</label>
              <input
                type="text"
                value={rowSelector}
                onChange={(e) => setRowSelector(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., row, item, record"
              />
              <p className="text-xs text-gray-500 mt-1">CSS selector for row elements</p>
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
                <option value="\t">Tab</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHeader}
                  onChange={(e) => setIncludeHeader(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm">Include header row</span>
              </label>
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