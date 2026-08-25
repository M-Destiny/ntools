import { useState, useCallback } from 'react';

interface ConversionResult {
  xml: string;
  error?: string;
}

export default function TomlToXml() {
  const [tomlInput, setTomlInput] = useState(`title = "TOML Example"
owner = { name = "Tom Preston-Werner", dob = 1979-05-27T07:32:00-08:00 }
database = { server = "192.168.1.1", ports = [8001, 8001, 8002], connection_max = 5000, enabled = true }
servers = { alpha = { ip = "10.0.0.1", dc = "eqdc10" }, beta = { ip = "10.0.0.2", dc = "eqdc11" } }
clients = { data = [["gamma", "delta"], [1, 2]], hosts = ["alpha", "omega"] }`);
  const [xmlOutput, setXmlOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [formatOutput, setFormatOutput] = useState(true);

  const escapeXml = useCallback((str: string): string => {
    return str
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&apos;');
  }, []);

  const formatXml = useCallback((xml: string): string => {
    let formatted = '';
    let indent = 0;
    const lines = xml.split(/(<[^>]+>)/).filter(Boolean);
    
    for (const line of lines) {
      if (line.startsWith('</')) {
        indent--;
        formatted += '  '.repeat(indent) + line + '\n';
      } else if (line.startsWith('<') && line.endsWith('/>')) {
        formatted += '  '.repeat(indent) + line + '\n';
      } else if (line.startsWith('<')) {
        formatted += '  '.repeat(indent) + line + '\n';
        if (!line.endsWith('/>') && !line.match(/^<[^>]+>$/)) {
          indent++;
        }
      } else {
        formatted += '  '.repeat(indent) + line + '\n';
      }
    }
    return formatted.trim();
  }, []);

  const tomlToXml = useCallback((toml: string): ConversionResult => {
    try {
      // Simple TOML parser for basic structures
      const lines = toml.split('\n');
      let result = '';
      let currentPath: string[] = [];
      let inArray = false;
      let arrayName = '';
      let arrayItems: string[] = [];

      const writeValue = (path: string[], key: string, value: any): string => {
        const fullPath = [...path, key];
        const tagName = fullPath.join('-');
        
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return `<${tagName}/>`;
          }
          if (value.every(v => typeof v !== 'object')) {
            return value.map(v => `<${tagName}>${escapeXml(String(v))}</${tagName}>`).join('\n');
          }
          return value.map((v, i) => {
            if (typeof v === 'object' && v !== null) {
              let inner = '';
              for (const [k, val] of Object.entries(v)) {
                inner += writeValue([...fullPath, String(i)], k, val);
              }
              return `<${tagName}>\n${inner}\n${'  '.repeat(fullPath.length)}</${tagName}>`;
            }
            return `<${tagName}>${escapeXml(String(v))}</${tagName}>`;
          }).join('\n');
        } else if (typeof value === 'object' && value !== null) {
          let inner = '';
          for (const [k, val] of Object.entries(value)) {
            inner += writeValue(fullPath, k, val);
          }
          return `<${tagName}>\n${inner}\n${'  '.repeat(fullPath.length - 1)}</${tagName}>`;
        } else {
          return `<${tagName}>${escapeXml(String(value))}</${tagName}>`;
        }
      };

      // Very basic TOML parsing - handles simple key = value, tables, and arrays
      const parsed: Record<string, any> = {};
      let currentTable: Record<string, any> = parsed;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        // Table header [section]
        const tableMatch = trimmed.match(/^\[(.+)\]$/);
        if (tableMatch) {
          const path = tableMatch[1].split('.');
          currentTable = parsed;
          for (const part of path) {
            if (!currentTable[part]) currentTable[part] = {};
            currentTable = currentTable[part];
          }
          continue;
        }

        // Key = value
        const kvMatch = trimmed.match(/^([^=]+)=(.*)$/);
        if (kvMatch) {
          const key = kvMatch[1].trim();
          let value = kvMatch[2].trim();

          // Remove inline comments
          value = value.split('#')[0].trim();

          // Parse value
          let parsedValue: any;
          if (value === 'true') parsedValue = true;
          else if (value === 'false') parsedValue = false;
          else if (value.match(/^\d+$/)) parsedValue = parseInt(value, 10);
          else if (value.match(/^\d+\.\d+$/)) parsedValue = parseFloat(value);
          else if (value.match(/^".*"$/)) parsedValue = value.slice(1, -1).replace(/\\"/g, '"');
          else if (value.match(/^'.*'$/)) parsedValue = value.slice(1, -1);
          else if (value.match(/^\[.*\]$/)) {
            // Array
            const arrContent = value.slice(1, -1).trim();
            if (!arrContent) {
              parsedValue = [];
            } else {
              parsedValue = arrContent.split(',').map(v => {
                const vv = v.trim();
                if (vv.match(/^".*"$/)) return vv.slice(1, -1).replace(/\\"/g, '"');
                if (vv.match(/^'.*'$/)) return vv.slice(1, -1);
                if (vv.match(/^\d+$/)) return parseInt(vv, 10);
                if (vv.match(/^\d+\.\d+$/)) return parseFloat(vv);
                if (vv === 'true') return true;
                if (vv === 'false') return false;
                return vv;
              });
            }
          } else if (value.match(/^\{.*\}$/)) {
            // Inline table - simplified
            parsedValue = {};
            const content = value.slice(1, -1);
            const pairs = content.split(',').map(p => p.trim()).filter(Boolean);
            for (const pair of pairs) {
              const [k, v] = pair.split('=').map(s => s.trim());
              let pv: any = v;
              if (pv === 'true') pv = true;
              else if (pv === 'false') pv = false;
              else if (pv.match(/^\d+$/)) pv = parseInt(pv, 10);
              else if (pv.match(/^\d+\.\d+$/)) pv = parseFloat(pv);
              else if (pv.match(/^".*"$/)) pv = pv.slice(1, -1).replace(/\\"/g, '"');
              else if (pv.match(/^'.*'$/)) pv = pv.slice(1, -1);
              parsedValue[k] = pv;
            }
          } else {
            parsedValue = value;
          }

          currentTable[key] = parsedValue;
        }
      }

      // Convert parsed TOML to XML
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
      for (const [key, value] of Object.entries(parsed)) {
        xml += writeValue([], key, value) + '\n';
      }
      xml += '</root>';

      return { xml: formatOutput ? formatXml(xml) : xml };
    } catch (e) {
      return { xml: '', error: e instanceof Error ? e.message : 'Conversion failed' };
    }
  }, [escapeXml, formatOutput, formatXml]);

  const handleConvert = () => {
    setError(null);
    const result = tomlToXml(tomlInput);
    if (result.error) {
      setError(result.error);
      setXmlOutput('');
    } else {
      setXmlOutput(result.xml);
    }
  };

  const handleCopy = async () => {
    if (xmlOutput) {
      await navigator.clipboard.writeText(xmlOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setTomlInput('');
    setXmlOutput('');
    setError(null);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>TOML to XML Converter</h2>
        <p className="tool-desc">Convert TOML configuration to XML format. Supports tables, arrays, inline tables, and nested structures.</p>
      </div>

      <div className="tool-grid">
        <div className="panel">
          <h3>TOML Input</h3>
          <textarea
            className="code-input"
            value={tomlInput}
            onChange={(e) => setTomlInput(e.target.value)}
            placeholder="Enter TOML here..."
            rows={20}
            spellCheck={false}
          />
          <div className="button-group">
            <button className="primary-btn" onClick={handleConvert}>
              Convert to XML
            </button>
            <button className="secondary-btn" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>XML Output</h3>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formatOutput}
                onChange={(e) => setFormatOutput(e.target.checked)}
              />
              Pretty Print
            </label>
          </div>
          <textarea
            className="code-input"
            value={xmlOutput}
            readOnly
            rows={20}
            spellCheck={false}
          />
          {error && <div className="error-message">{error}</div>}
          <div className="button-group">
            <button className="secondary-btn" onClick={handleCopy} disabled={!xmlOutput}>
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>
      </div>

      <div className="examples-section">
        <h3>Example TOML</h3>
        <pre className="example-code">{`title = "TOML Example"
owner = { name = "Tom Preston-Werner", dob = 1979-05-27T07:32:00-08:00 }
database = { 
  server = "192.168.1.1", 
  ports = [8001, 8001, 8002], 
  connection_max = 5000, 
  enabled = true 
}
servers = { 
  alpha = { ip = "10.0.0.1", dc = "eqdc10" }, 
  beta = { ip = "10.0.0.2", dc = "eqdc11" } 
}
clients = { 
  data = [["gamma", "delta"], [1, 2]], 
  hosts = ["alpha", "omega"] 
}`}</pre>
      </div>
    </div>
  );
}