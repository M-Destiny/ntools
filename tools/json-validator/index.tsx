import { useState, useRef, useEffect } from 'react';

export default function JsonValidator() {
  const [jsonInput, setJsonInput] = useState('');
  const [result, setResult] = useState<{ valid: boolean; error?: string; formatted?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const validateJson = (input: string) => {
    if (!input.trim()) {
      setResult({ valid: false, error: 'Input is empty' });
      return;
    }

    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setResult({ valid: true, formatted });
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Invalid JSON';
      setResult({ valid: false, error });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    validateJson(e.target.value);
  };

  const copyToClipboard = () => {
    if (result?.formatted) {
      navigator.clipboard.writeText(result.formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearInput = () => {
    setJsonInput('');
    setResult(null);
  };

  const loadExample = (type: 'valid' | 'invalid' | 'complex') => {
    const examples = {
      valid: `{
  "name": "John Doe",
  "age": 30,
  "isActive": true,
  "hobbies": ["reading", "coding", "gaming"],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  }
}`,
      invalid: `{
  "name": "John Doe",
  "age": 30,
  "hobbies": ["reading", "coding", "gaming"],
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001",
  }
}`,
      complex: `{
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com",
      "roles": ["admin", "user"],
      "metadata": {
        "createdAt": "2024-01-15T10:30:00Z",
        "lastLogin": "2024-12-01T08:45:00Z",
        "preferences": {
          "theme": "dark",
          "notifications": true,
          "language": "en"
        }
      }
    },
    {
      "id": 2,
      "name": "Bob",
      "email": "bob@example.com",
      "roles": ["user"],
      "metadata": {
        "createdAt": "2024-03-22T14:20:00Z",
        "lastLogin": null,
        "preferences": {
          "theme": "light",
          "notifications": false,
          "language": "es"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "hasNext": false
  }
}`
    };
    const example = examples[type];
    setJsonInput(example);
    validateJson(example);
  };

  useEffect(() => {
    if (jsonInput) {
      validateJson(jsonInput);
    }
  }, []);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JSON Validator & Formatter</h2>
        <p className="tool-desc">Validate, format, and prettify JSON. Paste JSON to check syntax and see formatted output.</p>
      </div>

      <div className="tool-grid">
        <div className="input-panel">
          <div className="panel-header">
            <h3>Input JSON</h3>
            <div className="example-buttons">
              <button onClick={() => loadExample('valid')} className="example-btn">Valid Example</button>
              <button onClick={() => loadExample('invalid')} className="example-btn">Invalid Example</button>
              <button onClick={() => loadExample('complex')} className="example-btn">Complex Example</button>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            className="json-textarea"
            value={jsonInput}
            onChange={handleInputChange}
            placeholder="Paste your JSON here..."
            spellCheck={false}
          />
          <div className="input-actions">
            <button className="clear-btn" onClick={clearInput}>Clear</button>
          </div>
        </div>

        <div className="output-panel">
          <div className="panel-header">
            <h3>Result</h3>
            {result && result.valid && (
              <button className="copy-btn" onClick={copyToClipboard}>
                {copied ? '✓ Copied!' : 'Copy Formatted'}
              </button>
            )}
          </div>

          {result ? (
            result.valid ? (
              <div className="result-success">
                <div className="status-badge success">✓ Valid JSON</div>
                <pre className="formatted-json">{result.formatted}</pre>
              </div>
            ) : (
              <div className="result-error">
                <div className="status-badge error">✗ Invalid JSON</div>
                <div className="error-message">{result.error}</div>
              </div>
            )
          ) : (
            <div className="result-empty">
              <p>Enter JSON in the left panel to validate</p>
            </div>
          )}
        </div>
      </div>

      <div className="features-panel">
        <h3>Features</h3>
        <ul>
          <li>Real-time JSON validation</li>
          <li>Syntax error detection with helpful messages</li>
          <li>Pretty-print formatting with 2-space indentation</li>
          <li>Copy formatted JSON to clipboard</li>
          <li>Example JSON templates for testing</li>
        </ul>
      </div>
    </div>
  );
}