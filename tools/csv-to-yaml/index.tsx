import { useState, useCallback } from 'react';

export default function CsvToYaml() {
  const [csvInput, setCsvInput] = useState('');
  const [yamlOutput, setYamlOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [hasHeader, setHasHeader] = useState(true);
  const [delimiter, setDelimiter] = useState(',');

  const parseCSV = useCallback((csv: string): Array<Record<string, string>> => {
    const lines = csv.trim().split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const delimiterChar = delimiter === '\\t' ? '\t' : delimiter;
    const headers = lines[0].split(delimiterChar).map(h => h.trim().replace(/^"|"$/g, ''));
    
    const startIndex = hasHeader ? 1 : 0;
    const data = lines.slice(startIndex).map((line) => {
      const values = line.split(delimiterChar).map(v => v.trim().replace(/^"|"$/g, ''));
      const obj: Record<string, string> = {};
      
      if (hasHeader) {
        headers.forEach((header, i) => {
          obj[header] = values[i] ?? '';
        });
      } else {
        values.forEach((value, i) => {
          obj[`column_${i + 1}`] = value;
        });
      }
      return obj;
    });
    return data;
  }, [delimiter, hasHeader]);

  const convertToYaml = useCallback((data: Array<Record<string, string>>): string => {
    if (data.length === 0) return '';
    
    const yamlLines: string[] = [];
    data.forEach((row, index) => {
      yamlLines.push(`- # Row ${index + 1}`);
      Object.entries(row).forEach(([key, value]) => {
        // Escape special YAML characters
        const escapedValue = value
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r');
        const needsQuotes = /[":{}[\]&*#?|!><=%@`,\s]/.test(escapedValue) || 
                           escapedValue === '' || 
                           /^(true|false|null|~|\d+)$/i.test(escapedValue);
        yamlLines.push(`  ${key}: ${needsQuotes ? `"${escapedValue}"` : escapedValue}`);
      });
    });
    return yamlLines.join('\n');
  }, []);

  const handleConvert = () => {
    setError(null);
    try {
      if (!csvInput.trim()) {
        setError('Please enter CSV data');
        return;
      }
      const data = parseCSV(csvInput);
      const yaml = convertToYaml(data);
      setYamlOutput(yaml);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert CSV to YAML');
    }
  };

  const handleCopy = async () => {
    if (!yamlOutput) return;
    await navigator.clipboard.writeText(yamlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setCsvInput('');
    setYamlOutput('');
    setError(null);
  };

  const sampleCSV = `name,age,city,active
John Doe,30,New York,true
Jane Smith,25,Los Angeles,false
Bob Wilson,35,Chicago,true`;

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>CSV to YAML</h2>
        <p className="tool-desc">Convert CSV data to YAML format. Supports custom delimiters and header options.</p>
      </div>

      <div className="tool-grid">
        <div className="input-panel">
          <h3>CSV Input</h3>
          <div className="options-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={e => setHasHeader(e.target.checked)}
              />
              First row is header
            </label>
            <div className="delimiter-select">
              <label>Delimiter:</label>
              <select value={delimiter} onChange={e => setDelimiter(e.target.value)}>
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\\t">Tab (\\t)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </div>
          </div>
          <textarea
            className="code-input"
            value={csvInput}
            onChange={e => setCsvInput(e.target.value)}
            placeholder="Paste your CSV data here..."
            rows={15}
            spellCheck={false}
          />
          <div className="button-group">
            <button className="primary-btn" onClick={handleConvert}>Convert to YAML</button>
            <button className="secondary-btn" onClick={handleClear}>Clear</button>
            <button className="secondary-btn" onClick={() => setCsvInput(sampleCSV)}>Load Sample</button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="output-panel">
          <div className="output-header">
            <h3>YAML Output</h3>
            <button className="copy-btn" onClick={handleCopy} disabled={!yamlOutput}>
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <pre className="code-output">{yamlOutput || 'YAML output will appear here...'}</pre>
        </div>
      </div>
    </div>
  );
}