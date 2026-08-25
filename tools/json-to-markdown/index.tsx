import { useState, useCallback } from 'react';

interface ConversionOptions {
  includeHeaders: boolean;
  headerLevel: number;
  arrayAsTable: boolean;
  tableMaxRows: number;
  escapeHtml: boolean;
}

export default function JsonToMarkdown() {
  const [jsonInput, setJsonInput] = useState(`{
  "users": [
    { "id": 1, "name": "Alice", "email": "alice@example.com", "active": true, "roles": ["admin", "user"] },
    { "id": 2, "name": "Bob", "email": "bob@example.com", "active": false, "roles": ["user"] },
    { "id": 3, "name": "Carol", "email": "carol@example.com", "active": true, "roles": ["editor", "user"] }
  ],
  "settings": {
    "theme": "dark",
    "notifications": true,
    "language": "en",
    "limits": { "maxUsers": 100, "maxStorage": "10GB" }
  },
  "version": "1.0.0",
  "tags": ["api", "users", "management"]
}`);
  const [markdownOutput, setMarkdownOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<ConversionOptions>({
    includeHeaders: true,
    headerLevel: 2,
    arrayAsTable: true,
    tableMaxRows: 50,
    escapeHtml: true,
  });

  const escapeHtml = useCallback((str: string): string => {
    return str
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, "'");
  }, []);

  const formatValue = useCallback((value: any, escape: boolean): string => {
    if (value === null) return '`null`';
    if (value === undefined) return '`undefined`';
    if (typeof value === 'string') {
      const escaped = escape ? escapeHtml(value) : value;
      return escaped.includes('\n') ? `\n\`\`\`\n${escaped}\n\`\`\`` : `\`${escaped}\``;
    }
    if (typeof value === 'boolean') return value ? '**true**' : '**false**';
    if (typeof value === 'number') return `\`${value}\``;
    return JSON.stringify(value, null, 2);
  }, [escapeHtml]);

  const generateTable = useCallback((arr: any[], escape: boolean, maxRows: number): string => {
    if (arr.length === 0) return '*Empty array*';
    
    const firstIsObj = arr[0] && typeof arr[0] === 'object' && !Array.isArray(arr[0]);
    if (!firstIsObj) {
      return arr.slice(0, maxRows).map(v => `- ${formatValue(v, escape)}`).join('\n') +
        (arr.length > maxRows ? `\n... and ${arr.length - maxRows} more items` : '');
    }

    const keys = new Set<string>();
    arr.forEach(item => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach(k => keys.add(k));
      }
    });
    const keyArray = Array.from(keys);

    let md = '| ' + keyArray.map(k => `**${k}**`).join(' | ') + ' |\n';
    md += '| ' + keyArray.map(() => '---').join(' | ') + ' |\n';

    const rowsToShow = arr.slice(0, maxRows);
    for (const item of rowsToShow) {
      if (item && typeof item === 'object') {
        md += '| ' + keyArray.map(k => formatValue(item[k], escape)).join(' | ') + ' |\n';
      } else {
        md += '| ' + keyArray.map(() => '').join(' | ') + ' |\n';
      }
    }

    if (arr.length > maxRows) {
      md += `\n*... and ${arr.length - maxRows} more rows*`;
    }

    return md;
  }, [formatValue, escapeHtml]);

  const jsonToMarkdown = useCallback((obj: any, depth: number = 0, parentKey: string = ''): string => {
    const { includeHeaders, headerLevel, arrayAsTable, tableMaxRows, escapeHtml: doEscape } = options;
    const headerPrefix = '#'.repeat(Math.min(headerLevel + depth, 6));
    let md = '';

    if (Array.isArray(obj)) {
      if (arrayAsTable && obj.length > 0 && obj[0] && typeof obj[0] === 'object') {
        md += generateTable(obj, doEscape, tableMaxRows);
      } else {
        md += obj.slice(0, tableMaxRows).map((v, i) => 
          `${'  '.repeat(depth)}- ${formatValue(v, doEscape)}`
        ).join('\n');
        if (obj.length > tableMaxRows) {
          md += `\n${'  '.repeat(depth)}*... and ${obj.length - tableMaxRows} more items*`;
        }
      }
      return md;
    }

    if (obj && typeof obj === 'object') {
      const entries = Object.entries(obj);
      
      for (const [key, value] of entries) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (includeHeaders) {
            md += `${headerPrefix} ${key}\n\n`;
          }
          md += jsonToMarkdown(value, depth + 1, fullKey) + '\n\n';
        } else if (Array.isArray(value)) {
          if (includeHeaders) {
            md += `${headerPrefix} ${key}\n\n`;
          }
          md += jsonToMarkdown(value, depth + 1, fullKey) + '\n\n';
        } else {
          const label = includeHeaders ? `**${key}**: ` : `- **${key}**: `;
          md += `${'  '.repeat(depth)}${label}${formatValue(value, doEscape)}\n`;
        }
      }
    } else {
      md += formatValue(obj, doEscape);
    }

    return md;
  }, [options, formatValue, generateTable, escapeHtml]);

  const handleConvert = () => {
    setError(null);
    try {
      const parsed = JSON.parse(jsonInput);
      const md = jsonToMarkdown(parsed);
      setMarkdownOutput(md);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setMarkdownOutput('');
    }
  };

  const handleCopy = async () => {
    if (markdownOutput) {
      await navigator.clipboard.writeText(markdownOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setJsonInput('');
    setMarkdownOutput('');
    setError(null);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e) {
      setError('Invalid JSON - cannot format');
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JSON to Markdown Converter</h2>
        <p className="tool-desc">Convert JSON data to readable Markdown. Supports nested objects, arrays as tables, and configurable output formatting.</p>
      </div>

      <div className="tool-grid">
        <div className="panel">
          <h3>JSON Input</h3>
          <textarea
            className="code-input"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Enter JSON here..."
            rows={18}
            spellCheck={false}
          />
          <div className="button-group">
            <button className="primary-btn" onClick={handleConvert}>
              Convert to Markdown
            </button>
            <button className="secondary-btn" onClick={handleFormat}>
              Format JSON
            </button>
            <button className="secondary-btn" onClick={handleClear}>
              Clear
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Markdown Output</h3>
          </div>
          <div className="options-panel">
            <label>
              <input
                type="checkbox"
                checked={options.includeHeaders}
                onChange={(e) => setOptions({...options, includeHeaders: e.target.checked})}
              />
              Include Headers
            </label>
            <label>
              <input
                type="checkbox"
                checked={options.arrayAsTable}
                onChange={(e) => setOptions({...options, arrayAsTable: e.target.checked})}
              />
              Arrays as Tables
            </label>
            <label>
              <input
                type="checkbox"
                checked={options.escapeHtml}
                onChange={(e) => setOptions({...options, escapeHtml: e.target.checked})}
              />
              Escape HTML
            </label>
            <label>
              Header Level:
              <select
                value={options.headerLevel}
                onChange={(e) => setOptions({...options, headerLevel: parseInt(e.target.value)})}
                className="small-select"
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
              </select>
            </label>
            <label>
              Max Table Rows:
              <input
                type="number"
                value={options.tableMaxRows}
                onChange={(e) => setOptions({...options, tableMaxRows: parseInt(e.target.value) || 50})}
                min={1}
                max={500}
                className="small-input"
              />
            </label>
          </div>
          <textarea
            className="code-input"
            value={markdownOutput}
            readOnly
            rows={18}
            spellCheck={false}
          />
          {error && <div className="error-message">{error}</div>}
          <div className="button-group">
            <button className="secondary-btn" onClick={handleCopy} disabled={!markdownOutput}>
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>
      </div>

      <div className="preview-section">
        <h3>Live Preview</h3>
        <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: markdownOutput }} />
      </div>
    </div>
  );
}
