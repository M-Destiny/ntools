import { useState, useMemo } from 'react';

interface EnvVar {
  key: string;
  value: string;
  comment?: string;
  isNew?: boolean;
}

export default function EnvEditor() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [variables, setVariables] = useState<EnvVar[]>([]);
  const [showTable, setShowTable] = useState(false);

  const parseEnv = (text: string): EnvVar[] => {
    const lines = text.split('\n');
    const result: EnvVar[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        // Comment or empty line
        if (trimmed.startsWith('#') && result.length > 0) {
          result[result.length - 1].comment = (result[result.length - 1].comment ? result[result.length - 1].comment + '\n' : '') + trimmed;
        }
        continue;
      }
      
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        const value = trimmed.substring(eqIndex + 1).trim();
        result.push({ key, value });
      }
    }
    return result;
  };

  const stringifyEnv = (vars: EnvVar[]): string => {
    return vars
      .map(v => {
        let line = `${v.key}=${v.value}`;
        if (v.comment) {
          line = v.comment + '\n' + line;
        }
        return line;
      })
      .join('\n');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newInput = e.target.value;
    setInput(newInput);
    try {
      const parsed = parseEnv(newInput);
      setVariables(parsed);
      setError(null);
    } catch {
      setError('Parse error');
    }
  };

  const handleVarChange = (index: number, field: 'key' | 'value', value: string) => {
    const newVars = [...variables];
    newVars[index] = { ...newVars[index], [field]: value };
    setVariables(newVars);
    setInput(stringifyEnv(newVars));
  };

  const addVariable = () => {
    const newVars = [...variables, { key: '', value: '', isNew: true }];
    setVariables(newVars);
    setInput(stringifyEnv(newVars));
  };

  const removeVariable = (index: number) => {
    const newVars = variables.filter((_, i) => i !== index);
    setVariables(newVars);
    setInput(stringifyEnv(newVars));
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output || input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    const example = `# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=admin
DB_PASSWORD=secret123

# Redis
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600

# API Keys
API_KEY=sk_live_abc123
STRIPE_SECRET=sk_test_xyz789

# Feature Flags
ENABLE_NEW_UI=true
ENABLE_BETA_FEATURES=false

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json`;
    setInput(example);
    const parsed = parseEnv(example);
    setVariables(parsed);
    setError(null);
  };

  const clearAll = () => {
    setInput('');
    setVariables([]);
    setError(null);
  };

  const generateOutput = () => {
    // Generate .env.example (without values)
    const example = variables
      .filter(v => v.key)
      .map(v => `${v.key}=`)
      .join('\n');
    setOutput(example);
  };

  const sortedVars = useMemo(() => 
    [...variables].sort((a, b) => a.key.localeCompare(b.key))
  , [variables]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>.env File Editor</h2>
        <p className="tool-desc">Parse, edit, and generate .env files with a table UI. Create .env.example templates.</p>
      </div>

      <div className="env-toolbar">
        <div className="toolbar-group">
          <button onClick={loadExample} className="btn-secondary">Load Example</button>
          <button onClick={clearAll} className="btn-secondary">Clear</button>
          <button onClick={addVariable} className="btn-secondary">Add Variable</button>
        </div>
        <div className="toolbar-group">
          <button 
            onClick={() => { generateOutput(); setShowTable(false); }} 
            className={!showTable ? 'active' : ''}
          >
            Raw Editor
          </button>
          <button 
            onClick={() => { generateOutput(); setShowTable(true); }} 
            className={showTable ? 'active' : ''}
          >
            Table View
          </button>
          <button 
            onClick={generateOutput} 
            className="btn-primary"
          >
            Generate .env.example
          </button>
        </div>
      </div>

      {error && <div className="error-banner">✗ {error}</div>}

      {!showTable ? (
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>.env Content</h3>
            <div className="toolbar-actions">
              <button onClick={copyOutput} className={copied ? 'copied' : ''} disabled={!input}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            className="json-editor"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste .env content here..."
            spellCheck={false}
          />
        </div>
      ) : (
        <div className="table-panel">
          <div className="table-toolbar">
            <h3>Variables ({variables.filter(v => v.key).length})</h3>
          </div>
          <div className="env-table-container">
            <table className="env-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedVars.map((v, idx) => (
                  <tr key={idx}>
                    <td>
                      <input
                        type="text"
                        value={v.key}
                        onChange={e => handleVarChange(idx, 'key', e.target.value)}
                        placeholder="KEY"
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={v.value}
                        onChange={e => handleVarChange(idx, 'value', e.target.value)}
                        placeholder="value"
                        className="table-input"
                      />
                    </td>
                    <td>
                      <button onClick={() => removeVariable(idx)} className="btn-icon" title="Remove">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {output && (
        <div className="output-section">
          <div className="output-header">
            <h3>.env.example (values stripped)</h3>
            <button onClick={copyOutput} className={copied ? 'copied' : ''} disabled={!output}>
              {copied ? '✓ Copied!' : 'Copy Template'}
            </button>
          </div>
          <textarea
            className="json-editor output"
            value={output}
            readOnly
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}