import { useState, useCallback, useMemo } from 'react';

type DataType = 'string' | 'number' | 'boolean' | 'date' | 'email' | 'name' | 'address' | 'phone' | 'uuid' | 'lorem' | 'color' | 'url' | 'ip' | 'job' | 'company';

const DATA_TYPES: { id: DataType; label: string; description: string; example: string; emoji: string }[] = [
  { id: 'string', label: 'Random String', description: 'Random alphanumeric string', example: 'aB3x9K', emoji: '🔤' },
  { id: 'number', label: 'Number', description: 'Random number in range', example: '42', emoji: '🔢' },
  { id: 'boolean', label: 'Boolean', description: 'Random true/false', example: 'true', emoji: '✅' },
  { id: 'date', label: 'Date', description: 'Random date in range', example: '2024-03-15', emoji: '📅' },
  { id: 'email', label: 'Email', description: 'Fake email address', example: 'user@example.com', emoji: '📧' },
  { id: 'name', label: 'Full Name', description: 'Random person name', example: 'John Smith', emoji: '👤' },
  { id: 'address', label: 'Address', description: 'Fake street address', example: '123 Main St, City, ST 12345', emoji: '🏠' },
  { id: 'phone', label: 'Phone', description: 'Phone number', example: '+1 (555) 123-4567', emoji: '📞' },
  { id: 'uuid', label: 'UUID', description: 'Random UUID v4', example: '550e8400-e29b-41d4-a716-446655440000', emoji: '🆔' },
  { id: 'lorem', label: 'Lorem Ipsum', description: 'Placeholder text', example: 'Lorem ipsum dolor sit amet...', emoji: '📝' },
  { id: 'color', label: 'Color', description: 'Random hex color', example: '#3b82f6', emoji: '🎨' },
  { id: 'url', label: 'URL', description: 'Fake website URL', example: 'https://example.com/path', emoji: '🔗' },
  { id: 'ip', label: 'IP Address', description: 'IPv4 or IPv6 address', example: '192.168.1.1', emoji: '🌐' },
  { id: 'job', label: 'Job Title', description: 'Random job title', example: 'Senior Software Engineer', emoji: '💼' },
  { id: 'company', label: 'Company', description: 'Fake company name', example: 'Acme Corporation', emoji: '🏢' },
];

interface Field {
  id: string;
  name: string;
  type: DataType;
  options: Record<string, any>;
}

const TYPE_DEFAULTS: Record<DataType, Record<string, any>> = {
  string: { length: 10 },
  number: { min: 0, max: 100, decimal: false },
  boolean: {},
  date: { start: '2020-01-01', end: '2024-12-31' },
  email: {},
  name: {},
  address: {},
  phone: {},
  uuid: {},
  lorem: { type: 'words', count: 10 },
  color: {},
  url: {},
  ip: { version: 'v4' },
  job: {},
  company: {},
};

const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
const STREETS = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm St', 'Washington Ave', 'Lake Dr', 'Hill St', 'Park Ave'];
const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'];
const STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD'];
const COMPANIES = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Corp', 'Wayne Enterprises', 'Stark Industries', 'Cyberdyne', 'Tyrell Corp', 'Weyland-Yutani', 'Massive Dynamic'];
const JOBS = ['Software Engineer', 'Product Manager', 'Designer', 'Data Scientist', 'DevOps Engineer', 'QA Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile Developer'];
const LOREM_WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua'];

function generateValue(field: Field): any {
  const { type, options } = field;
  
  switch (type) {
    case 'string': {
      const length = options.length || 10;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }
    case 'number': {
      const min = options.min ?? 0;
      const max = options.max ?? 100;
      const decimal = options.decimal ?? false;
      const val = Math.random() * (max - min) + min;
      return decimal ? Number(val.toFixed(2)) : Math.floor(val);
    }
    case 'boolean':
      return Math.random() > 0.5;
    case 'date': {
      const start = new Date(options.start || '2020-01-01').getTime();
      const end = new Date(options.end || '2024-12-31').getTime();
      const date = new Date(start + Math.random() * (end - start));
      return date.toISOString().split('T')[0];
    }
    case 'email': {
      const name = `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]}.${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
      const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'company.com'];
      return `${name.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`;
    }
    case 'name':
      return `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
    case 'address': {
      const num = Math.floor(Math.random() * 9999) + 1;
      const street = STREETS[Math.floor(Math.random() * STREETS.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const state = STATES[Math.floor(Math.random() * STATES.length)];
      const zip = Math.floor(Math.random() * 90000) + 10000;
      return `${num} ${street}, ${city}, ${state} ${zip}`;
    }
    case 'phone': {
      const area = Math.floor(Math.random() * 900) + 100;
      const exchange = Math.floor(Math.random() * 900) + 100;
      const line = Math.floor(Math.random() * 9000) + 1000;
      return `+1 (${area}) ${exchange}-${line}`;
    }
    case 'uuid':
      return crypto.randomUUID();
    case 'lorem': {
      const count = options.count || 10;
      const loremType = options.type || 'words';
      if (loremType === 'words') {
        return Array.from({ length: count }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]).join(' ');
      } else if (loremType === 'sentences') {
        return Array.from({ length: count }, () => {
          const words = Array.from({ length: Math.floor(Math.random() * 10) + 5 }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
          return words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1) + '.';
        }).join(' ');
      } else {
        return Array.from({ length: count }, () => {
          const sentences = Array.from({ length: Math.floor(Math.random() * 5) + 2 }, () => {
            const words = Array.from({ length: Math.floor(Math.random() * 10) + 5 }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
            return words.join(' ').charAt(0).toUpperCase() + words.join(' ').slice(1) + '.';
          });
          return sentences.join(' ');
        }).join('\n\n');
      }
    }
    case 'color':
      return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    case 'url': {
      const protocols = ['https://', 'http://'];
      const domains = ['example.com', 'test.org', 'demo.net', 'sample.io', 'app.dev'];
      const paths = ['', '/api', '/users', '/products', '/dashboard', '/settings'];
      return `${protocols[Math.floor(Math.random() * protocols.length)]}${domains[Math.floor(Math.random() * domains.length)]}${paths[Math.floor(Math.random() * paths.length)]}`;
    }
    case 'ip': {
      if (options.version === 'v6') {
        return Array.from({ length: 8 }, () => Math.floor(Math.random() * 65536).toString(16)).join(':');
      }
      return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
    }
    case 'job':
      return JOBS[Math.floor(Math.random() * JOBS.length)];
    case 'company':
      return COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
    default:
      return '';
  }
}

export default function MockDataGenerator() {
  const [fields, setFields] = useState<Field[]>([
    { id: crypto.randomUUID(), name: 'id', type: 'uuid', options: {} },
    { id: crypto.randomUUID(), name: 'name', type: 'name', options: {} },
    { id: crypto.randomUUID(), name: 'email', type: 'email', options: {} },
  ]);
  const [rowCount, setRowCount] = useState(10);
  const [format, setFormat] = useState<'json' | 'csv' | 'sql' | 'yaml'>('json');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [generatedData, setGeneratedData] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState('');

  const updateField = useCallback((fieldId: string, key: keyof Field, value: any) => {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, [key]: value } : f));
  }, []);

  const addField = useCallback(() => {
    setFields(prev => [...prev, { 
      id: crypto.randomUUID(), 
      name: `field${prev.length + 1}`, 
      type: 'string', 
      options: TYPE_DEFAULTS.string 
    }]);
  }, []);

  const removeField = useCallback((fieldId: string) => {
    if (fields.length <= 1) return;
    setFields(prev => prev.filter(f => f.id !== fieldId));
  }, [fields.length]);

  const getFieldOptions = useCallback((field: Field) => {
    const { type, options } = field;
    
    switch (type) {
      case 'string':
        return (
          <div className="field-options">
            <label>Length: <input type="number" value={options.length || 10} onChange={e => updateField(field.id, 'options', { ...options, length: parseInt(e.target.value) })} min={1} max={1000} /></label>
          </div>
        );
      case 'number':
        return (
          <div className="field-options">
            <label>Min: <input type="number" value={options.min ?? 0} onChange={e => updateField(field.id, 'options', { ...options, min: parseFloat(e.target.value) })} /></label>
            <label>Max: <input type="number" value={options.max ?? 100} onChange={e => updateField(field.id, 'options', { ...options, max: parseFloat(e.target.value) })} /></label>
            <label><input type="checkbox" checked={options.decimal ?? false} onChange={e => updateField(field.id, 'options', { ...options, decimal: e.target.checked })} /> Decimal</label>
          </div>
        );
      case 'date':
        return (
          <div className="field-options">
            <label>Start: <input type="date" value={options.start || '2020-01-01'} onChange={e => updateField(field.id, 'options', { ...options, start: e.target.value })} /></label>
            <label>End: <input type="date" value={options.end || '2024-12-31'} onChange={e => updateField(field.id, 'options', { ...options, end: e.target.value })} /></label>
          </div>
        );
      case 'lorem':
        return (
          <div className="field-options">
            <label>Type: <select value={options.type || 'words'} onChange={e => updateField(field.id, 'options', { ...options, type: e.target.value })}>
              <option value="words">Words</option>
              <option value="sentences">Sentences</option>
              <option value="paragraphs">Paragraphs</option>
            </select></label>
            <label>Count: <input type="number" value={options.count || 10} onChange={e => updateField(field.id, 'options', { ...options, count: parseInt(e.target.value) })} min={1} max={1000} /></label>
          </div>
        );
      case 'ip':
        return (
          <div className="field-options">
            <label>Version: <select value={options.version || 'v4'} onChange={e => updateField(field.id, 'options', { ...options, version: e.target.value })}>
              <option value="v4">IPv4</option>
              <option value="v6">IPv6</option>
            </select></label>
          </div>
        );
      default:
        return <span className="no-options">No options for this type</span>;
    }
  }, [updateField]);

  const generateData = useCallback(() => {
    const data = [];
    for (let i = 0; i < rowCount; i++) {
      const row: Record<string, any> = {};
      for (const field of fields) {
        row[field.name] = generateValue(field);
      }
      data.push(row);
    }
    setGeneratedData(data);
    
    // Generate output based on format
    let out = '';
    if (format === 'json') {
      out = JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      const headers = fields.map(f => f.name);
      const rows = data.map(row => headers.map(h => {
        const val = row[h];
        if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(','));
      out = (includeHeaders ? headers.join(',') + '\n' : '') + rows.join('\n');
    } else if (format === 'sql') {
      const tableName = 'mock_data';
      const columns = fields.map(f => f.name).join(', ');
      const rows = data.map(row => {
        const values = fields.map(f => {
          const val = row[f.name];
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
          if (val === null || val === undefined) return 'NULL';
          return val;
        }).join(', ');
        return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
      }).join('\n');
      out = rows;
    } else if (format === 'yaml') {
      out = data.map((row, i) => {
        const lines = fields.map(f => {
          const val = row[f.name];
          if (typeof val === 'string') return `  ${f.name}: "${val}"`;
          if (typeof val === 'boolean') return `  ${f.name}: ${val}`;
          return `  ${f.name}: ${val}`;
        });
        return `- ${lines.join('\n')}`;
      }).join('\n');
    }
    setOutput(out);
  }, [fields, rowCount, format, includeHeaders]);

  const copyToClipboard = useCallback(async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  const clearAll = useCallback(() => {
    setFields([
      { id: crypto.randomUUID(), name: 'id', type: 'uuid', options: {} },
      { id: crypto.randomUUID(), name: 'name', type: 'name', options: {} },
      { id: crypto.randomUUID(), name: 'email', type: 'email', options: {} },
    ]);
    setRowCount(10);
    setGeneratedData([]);
    setOutput('');
  }, []);

  const loadExample = useCallback(() => {
    setFields([
      { id: crypto.randomUUID(), name: 'id', type: 'uuid', options: {} },
      { id: crypto.randomUUID(), name: 'firstName', type: 'name', options: {} },
      { id: crypto.randomUUID(), name: 'email', type: 'email', options: {} },
      { id: crypto.randomUUID(), name: 'age', type: 'number', options: { min: 18, max: 80, decimal: false } },
      { id: crypto.randomUUID(), name: 'isActive', type: 'boolean', options: {} },
      { id: crypto.randomUUID(), name: 'createdAt', type: 'date', options: { start: '2023-01-01', end: '2024-12-31' } },
      { id: crypto.randomUUID(), name: 'role', type: 'job', options: {} },
      { id: crypto.randomUUID(), name: 'company', type: 'company', options: {} },
    ]);
    setRowCount(5);
    setFormat('json');
  }, []);

  const stats = useMemo(() => ({
    fields: fields.length,
    rows: rowCount,
    totalValues: fields.length * rowCount,
  }), [fields.length, rowCount]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Mock Data Generator</h2>
        <p className="tool-desc">Generate realistic mock data for testing, development, and prototyping. Define custom schemas with 15+ data types and export as JSON, CSV, SQL, or YAML.</p>
      </div>

      <div className="mock-generator">
        <div className="schema-editor">
          <h3>Schema Definition</h3>
          <div className="fields-list">
            {fields.map(field => {
              const typeInfo = DATA_TYPES.find(t => t.id === field.type);
              return (
                <div key={field.id} className="field-row">
                  <input
                    type="text"
                    value={field.name}
                    onChange={e => updateField(field.id, 'name', e.target.value)}
                    placeholder="fieldName"
                    className="field-name"
                  />
                  <select
                    value={field.type}
                    onChange={e => {
                      const newType = e.target.value as DataType;
                      updateField(field.id, 'type', newType);
                      updateField(field.id, 'options', TYPE_DEFAULTS[newType]);
                    }}
                    className="field-type"
                  >
                    {DATA_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.emoji} {t.label}</option>
                    ))}
                  </select>
                  <div className="field-options-container">
                    {getFieldOptions(field)}
                  </div>
                  <button 
                    className="btn-icon remove-btn" 
                    onClick={() => removeField(field.id)}
                    disabled={fields.length <= 1}
                    title="Remove field"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
          <button className="add-field-btn" onClick={addField}>
            + Add Field
          </button>
        </div>

        <div className="generation-controls">
          <div className="control-group">
            <label>Rows to Generate:</label>
            <input
              type="number"
              value={rowCount}
              onChange={e => setRowCount(Math.max(1, Math.min(10000, parseInt(e.target.value) || 1)))}
              min={1}
              max={10000}
            />
          </div>
          <div className="control-group">
            <label>Output Format:</label>
            <select value={format} onChange={e => setFormat(e.target.value as 'json' | 'csv' | 'sql' | 'yaml')}>
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="sql">SQL INSERT</option>
              <option value="yaml">YAML</option>
            </select>
          </div>
          {format === 'csv' && (
            <div className="control-group">
              <label>
                <input
                  type="checkbox"
                  checked={includeHeaders}
                  onChange={e => setIncludeHeaders(e.target.checked)}
                />
                Include Headers
              </label>
            </div>
          )}
          
          <div className="button-group">
            <button className="primary-btn" onClick={generateData}>
              Generate Data
            </button>
            <button className="secondary-btn" onClick={loadExample}>
              Load Example
            </button>
            <button className="secondary-btn" onClick={clearAll}>
              Clear Schema
            </button>
          </div>

          <div className="stats">
            <span>{stats.fields} fields × {stats.rows} rows = {stats.totalValues} values</span>
          </div>
        </div>

        <div className="output-section">
          <div className="output-header">
            <h3>Generated Output</h3>
            <button 
              className={copied ? 'copy-btn copied' : 'copy-btn'} 
              onClick={copyToClipboard}
              disabled={!output}
            >
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          
          <div className="output-preview">
            {output ? (
              <pre className={`output-code ${format}`}><code>{output}</code></pre>
            ) : (
              <div className="placeholder">
                Define your schema above, set row count, and click "Generate Data"
              </div>
            )}
          </div>

          {generatedData.length > 0 && (
            <div className="preview-table">
              <h4>Data Preview (first 10 rows)</h4>
              <table>
                <thead>
                  <tr>
                    {fields.map(f => <th key={f.id}>{f.name} <span className="type-badge">{DATA_TYPES.find(t => t.id === f.type)?.label}</span></th>)}
                  </tr>
                </thead>
                <tbody>
                  {generatedData.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      {fields.map(f => <td key={f.id}>{String(row[f.name])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="help-section">
        <details>
          <summary>Data Types Reference</summary>
          <div className="help-content">
            <table>
              <thead>
                <tr><th>Type</th><th>Description</th><th>Options</th><th>Example</th></tr>
              </thead>
              <tbody>
                {DATA_TYPES.map(t => (
                  <tr key={t.id}>
                    <td><code>{t.emoji} {t.label}</code></td>
                    <td>{t.description}</td>
                    <td>{Object.keys(TYPE_DEFAULTS[t.id]).join(', ') || 'None'}</td>
                    <td><code>{t.example}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <h4>Output Formats</h4>
            <ul>
              <li><strong>JSON</strong> — Array of objects, perfect for APIs and JavaScript</li>
              <li><strong>CSV</strong> — Comma-separated values, great for spreadsheets</li>
              <li><strong>SQL</strong> — INSERT statements for database seeding</li>
              <li><strong>YAML</strong> — Human-readable, good for config files</li>
            </ul>

            <h4>Tips</h4>
            <ul>
              <li>Use descriptive field names (camelCase or snake_case)</li>
              <li>Set appropriate ranges for numbers and dates</li>
              <li>For large datasets, consider CSV or SQL for better performance</li>
              <li>Generated data is random each time — not reproducible without a seed</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}