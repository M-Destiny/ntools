import { useState, useCallback } from 'react';

export default function JsonToTypescript() {
  const [jsonInput, setJsonInput] = useState('');
  const [tsOutput, setTsOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    rootName: 'Root',
    useInterfaces: true,
    useReadonly: false,
    optionalFields: false,
    semicolons: true,
    strictNullChecks: false,
  });

  const generateTypescript = useCallback((input: string, opts: typeof options) => {
    setError(null);
    
    if (!input.trim()) {
      setError('Input is empty');
      setTsOutput('');
      return;
    }

    try {
      const parsed = JSON.parse(input);
      
      // Generate types recursively
      const generateType = (obj: unknown, name: string, isRoot = true): string => {
        if (obj === null) {
          return 'null';
        }
        
        if (Array.isArray(obj)) {
          if (obj.length === 0) {
            return 'unknown[]';
          }
          // Use the first element's type for the array
          const itemType = generateType(obj[0], `${name}Item`, false);
          return `${itemType}[]`;
        }
        
        if (typeof obj === 'object') {
          const record = obj as Record<string, unknown>;
          const keys = Object.keys(record);
          
          if (keys.length === 0) {
            return 'Record<string, unknown>';
          }
          
          const properties = keys.map(key => {
            const value = record[key];
            const isOptional = opts.optionalFields || value === null || value === undefined;
            const type = generateType(value, `${name}${key.charAt(0).toUpperCase() + key.slice(1)}`, false);
            const readonly = opts.useReadonly ? 'readonly ' : '';
            const optional = isOptional ? '?' : '';
            const semi = opts.semicolons ? ';' : '';
            return `  ${readonly}${key}${optional}: ${type}${semi}`;
          });
          
          const keyword = opts.useInterfaces ? 'interface' : 'type';
          const semi = opts.semicolons ? '' : '';
          
          if (isRoot) {
            return `${keyword} ${opts.rootName} ${semi}{\n${properties.join('\n')}\n}`;
          } else {
            return `{\n${properties.join('\n')}\n}`;
          }
        }
        
        // Primitive types
        if (typeof obj === 'string') {
          // Check if it looks like a date
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
            return 'Date | string';
          }
          return 'string';
        }
        if (typeof obj === 'number') return 'number';
        if (typeof obj === 'boolean') return 'boolean';
        
        return 'unknown';
      };
      
      const result = generateType(parsed, opts.rootName);
      setTsOutput(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setTsOutput('');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    generateTypescript(e.target.value, options);
  };

  const copyToClipboard = () => {
    if (tsOutput) {
      navigator.clipboard.writeText(tsOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearInput = () => {
    setJsonInput('');
    setTsOutput('');
    setError(null);
  };

  const loadExample = () => {
    const example = `{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "isActive": true,
  "roles": ["admin", "user"],
  "profile": {
    "avatar": "https://example.com/avatar.png",
    "bio": "Software developer",
    "location": null
  },
  "metadata": {
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLogin": "2024-12-01T08:45:00Z",
    "tags": ["developer", "typescript", "react"]
  }
}`;
    setJsonInput(example);
    generateTypescript(example, options);
  };

  const updateOption = (key: keyof typeof options, value: boolean) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    if (jsonInput.trim()) {
      generateTypescript(jsonInput, newOptions);
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JSON to TypeScript</h2>
        <p className="tool-desc">Convert JSON to TypeScript interfaces or type aliases. Generates clean, typed definitions from JSON structures.</p>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input JSON</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearInput} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="json-editor"
            value={jsonInput}
            onChange={handleInputChange}
            placeholder="Paste JSON here..."
            spellCheck={false}
          />
          {error && <div className="error-message">✗ {error}</div>}
        </div>

        <div className="controls-panel">
          <div className="options-group">
            <h4>Options</h4>
            <label className="option-label">
              <input
                type="checkbox"
                checked={options.useInterfaces}
                onChange={(e) => updateOption('useInterfaces', e.target.checked)}
              />
              Use interfaces (vs type aliases)
            </label>
            <label className="option-label">
              <input
                type="checkbox"
                checked={options.useReadonly}
                onChange={(e) => updateOption('useReadonly', e.target.checked)}
              />
              Mark properties as readonly
            </label>
            <label className="option-label">
              <input
                type="checkbox"
                checked={options.optionalFields}
                onChange={(e) => updateOption('optionalFields', e.target.checked)}
              />
              Make all fields optional
            </label>
            <label className="option-label">
              <input
                type="checkbox"
                checked={options.semicolons}
                onChange={(e) => updateOption('semicolons', e.target.checked)}
              />
              Include semicolons
            </label>
            <label className="option-label">
              <input
                type="checkbox"
                checked={options.strictNullChecks}
                onChange={(e) => updateOption('strictNullChecks', e.target.checked)}
              />
              Strict null checks (union with null)
            </label>
          </div>

          <div className="root-name-input">
            <label>Root Type Name:</label>
            <input
              type="text"
              value={options.rootName}
              onChange={(e) => {
                const newOptions = { ...options, rootName: e.target.value || 'Root' };
                setOptions(newOptions);
                if (jsonInput.trim()) {
                  generateTypescript(jsonInput, newOptions);
                }
              }}
              className="root-name-field"
            />
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>TypeScript Output</h3>
            <div className="toolbar-actions">
              <button onClick={copyToClipboard} className={copied ? 'copied' : ''}>
                {copied ? '✓ Copied!' : 'Copy TypeScript'}
              </button>
            </div>
          </div>
          <pre className="ts-output"><code>{tsOutput || '// TypeScript types will appear here...'}</code></pre>
        </div>
      </div>

      <div className="features-panel">
        <h3>Features</h3>
        <ul>
          <li>Converts JSON objects to TypeScript interfaces or type aliases</li>
          <li>Handles nested objects and arrays automatically</li>
          <li>Infers types: string, number, boolean, Date, null</li>
          <li>Configurable: readonly, optional fields, semicolons, strict null checks</li>
          <li>One-click copy to clipboard</li>
        </ul>
      </div>
    </div>
  );
}