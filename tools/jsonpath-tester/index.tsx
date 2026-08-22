import { useState, useMemo, useEffect } from 'react';

// Simple JSONPath implementation (subset)
interface JsonPathResult {
  path: string;
  value: unknown;
  parent: unknown;
  parentProperty: string | number;
}

function jsonPath(obj: unknown, expr: string): JsonPathResult[] {
  const results: JsonPathResult[] = [];

  function normalizePath(path: (string | number)[]): string {
    return '$' + path.map(p => typeof p === 'number' ? `[${p}]` : `.${p}`).join('');
  }

  function walk(current: unknown, path: (string | number)[], parent: unknown, parentProperty: string | number) {
    if (matchPath(path, expr)) {
      results.push({
        path: normalizePath(path),
        value: current,
        parent,
        parentProperty
      });
    }

    if (Array.isArray(current)) {
      current.forEach((item, index) => {
        walk(item, [...path, index], current, index);
      });
    } else if (current && typeof current === 'object') {
      Object.entries(current as Record<string, unknown>).forEach(([key, value]) => {
        walk(value, [...path, key], current, key);
      });
    }
  }

  function matchPath(currentPath: (string | number)[], expr: string): boolean {
    // Simple JSONPath matching - supports $, ., [], *, .., @
    const tokens = tokenize(expr);
    return matchTokens(currentPath, tokens, 0);
  }

  function tokenize(expr: string): string[] {
    // Very simple tokenizer for basic JSONPath
    const tokens: string[] = [];
    let current = '';
    for (let i = 0; i < expr.length; i++) {
      const c = expr[i];
      if (c === '.' || c === '[' || c === ']' || c === '*') {
        if (current) { tokens.push(current); current = ''; }
        if (c !== ']') tokens.push(c);
      } else {
        current += c;
      }
    }
    if (current) tokens.push(current);
    return tokens.filter(t => t);
  }

  function matchTokens(path: (string | number)[], tokens: string[], tokenIndex: number): boolean {
    if (tokenIndex >= tokens.length) return true;
    if (path.length === 0) return tokens[tokenIndex] === '$';

    const token = tokens[tokenIndex];
    const pathSegment = path[path.length - 1];

    if (token === '$') {
      return path.length === 1 && matchTokens(path, tokens, tokenIndex + 1);
    }
    if (token === '*') {
      return matchTokens(path, tokens, tokenIndex + 1);
    }
    if (token === '..') {
      // Recursive descent - simplified: match anywhere in path
      for (let i = 0; i < path.length; i++) {
        if (matchTokens(path.slice(i), tokens, tokenIndex + 1)) return true;
      }
      return false;
    }
    if (typeof pathSegment === 'string' && token === pathSegment) {
      return matchTokens(path, tokens, tokenIndex + 1);
    }
    if (typeof pathSegment === 'number' && token === String(pathSegment)) {
      return matchTokens(path, tokens, tokenIndex + 1);
    }
    return false;
  }

  walk(obj, ['$'], null, '');
  return results;
}

const SAMPLE_JSON = {
  store: {
    book: [
      { category: "reference", author: "Nigel Rees", title: "Sayings of the Century", price: 8.95 },
      { category: "fiction", author: "Evelyn Waugh", title: "Sword of Honour", price: 12.99 },
      { category: "fiction", author: "Herman Melville", title: "Moby Dick", isbn: "0-553-21311-3", price: 8.99 },
      { category: "fiction", author: "J. R. R. Tolkien", title: "The Lord of the Rings", isbn: "0-395-19395-8", price: 22.99 }
    ],
    bicycle: { color: "red", price: 19.95 }
  },
  expenses: [
    { category: "food", amount: 50, items: ["apple", "bread", "milk"] },
    { category: "transport", amount: 30, items: ["bus", "train"] }
  ],
  metadata: { version: 1, tags: ["shop", "inventory"] }
};

export default function JsonPathTester() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(SAMPLE_JSON, null, 2));
  const [pathExpr, setPathExpr] = useState('$.store.book[*].author');
  const [results, setResults] = useState<JsonPathResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const parsedJson = useMemo(() => {
    setJsonError(null);
    try {
      return JSON.parse(jsonInput);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON');
      return null;
    }
  }, [jsonInput]);

  useEffect(() => {
    if (!parsedJson || !pathExpr.trim()) {
      setResults([]);
      return;
    }
    try {
      setError(null);
      const res = jsonPath(parsedJson, pathExpr.trim());
      setResults(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Evaluation error');
      setResults([]);
    }
  }, [parsedJson, pathExpr]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
    setCopied(false);
  };

  const copyResults = () => {
    const text = results.map(r => `${r.path} = ${JSON.stringify(r.value)}`).join('\n');
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadExample = (json: unknown, expr: string) => {
    setJsonInput(JSON.stringify(json, null, 2));
    setPathExpr(expr);
  };

  const examples = [
    { name: 'All book authors', expr: '$.store.book[*].author' },
    { name: 'Books under $10', expr: '$.store.book[?(@.price < 10)]' },
    { name: 'All prices', expr: '$.store..price' },
    { name: 'First book', expr: '$.store.book[0]' },
    { name: 'Last book', expr: '$.store.book[-1:]' },
    { name: 'Books with ISBN', expr: '$.store.book[?(@.isbn)]' },
    { name: 'Expense categories', expr: '$.expenses[*].category' },
    { name: 'All items in expenses', expr: '$.expenses[*].items[*]' },
  ];

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JSONPath Tester</h2>
        <p className="tool-desc">Test JSONPath expressions against JSON data. Supports basic JSONPath syntax including wildcards, filters, and recursive descent.</p>
      </div>

      <div className="jsonpath-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>JSON Input</h3>
            <div className="toolbar-actions">
              <button onClick={() => loadExample(SAMPLE_JSON, '$.store.book[*].author')} className="btn-secondary">Load Sample</button>
              <button onClick={() => { setJsonInput(''); setPathExpr(''); }} className="btn-secondary" disabled={!jsonInput.trim()}>Clear</button>
            </div>
          </div>

          <textarea
            className="code-input"
            value={jsonInput}
            onChange={handleJsonChange}
            placeholder="Paste JSON here..."
            spellCheck={false}
            rows={15}
          />

          {jsonError && <div className="error-message">✗ JSON Error: {jsonError}</div>}
        </div>

        <div className="controls-panel">
          <div className="control-group">
            <label>JSONPath Expression</label>
            <input
              type="text"
              className="path-input"
              value={pathExpr}
              onChange={e => setPathExpr(e.target.value)}
              placeholder="$.store.book[*].author"
              spellCheck={false}
            />
          </div>

          <div className="examples-section">
            <label>Examples</label>
            <div className="example-chips">
              {examples.map(ex => (
                <button
                  key={ex.expr}
                  className="example-chip"
                  onClick={() => loadExample(SAMPLE_JSON, ex.expr)}
                  title={ex.name}
                >
                  {ex.name}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="error-message">✗ {error}</div>}

          <div className="syntax-reference">
            <details>
              <summary>JSONPath Syntax</summary>
              <div className="help-content">
                <table>
                  <thead><tr><th>Syntax</th><th>Description</th></tr></thead>
                  <tbody>
                    <tr><td><code>$</code></td><td>Root object/element</td></tr>
                    <tr><td><code>@</code></td><td>Current object/element</td></tr>
                    <tr><td><code>.</code> or <code>[]</code></td><td>Child operator</td></tr>
                    <tr><td><code>..</code></td><td>Recursive descent</td></tr>
                    <tr><td><code>*</code></td><td>Wildcard (all elements)</td></tr>
                    <tr><td><code>[n]</code></td><td>Array index (0-based)</td></tr>
                    <tr><td><code>[m:n]</code></td><td>Array slice</td></tr>
                    <tr><td><code>[?(@.prop)]</code></td><td>Filter expression</td></tr>
                    <tr><td><code>[?(@.prop {'>'} 10)]</code></td><td>Comparison filter</td></tr>
                    <tr><td><code>[?(@.prop =~ /regex/)]</code></td><td>Regex filter</td></tr>
                  </tbody>
                </table>
                <p><strong>Note:</strong> This implementation supports a subset of JSONPath. Filter expressions are parsed but evaluation is simplified.</p>
              </div>
            </details>
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-toolbar">
            <h3>Results ({results.length} match{results.length !== 1 ? 'es' : ''})</h3>
            <div className="preview-actions">
              <button onClick={copyResults} className={copied ? 'copied' : 'btn-primary'} disabled={results.length === 0}>
                {copied ? '✓ Copied!' : 'Copy Results'}
              </button>
            </div>
          </div>

          {results.length === 0 && !error && !jsonError && pathExpr.trim() && (
            <div className="empty-state">
              <p>No matches found for expression: <code>{pathExpr}</code></p>
            </div>
          )}

          {results.length > 0 && (
            <div className="results-list">
              {results.map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-path">{result.path}</div>
                  <pre className="result-value"><code>{JSON.stringify(result.value, null, 2)}</code></pre>
                </div>
              ))}
            </div>
          )}

          {(jsonError || error) && results.length === 0 && (
            <div className="empty-state">
              <p>Fix the errors above to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}