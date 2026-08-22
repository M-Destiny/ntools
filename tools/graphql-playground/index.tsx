import { useState, useEffect, useCallback } from 'react';

interface GraphQLResponse {
  data?: unknown;
  errors?: Array<{ message: string; locations?: Array<{ line: number; column: number }>; path?: string[] }>;
}

export default function GraphQLPlayground() {
  const [query, setQuery] = useState(`# Try a query!
query GetUser {
  user(id: "1") {
    id
    name
    email
    posts {
      title
      published
    }
  }
}`);
  const [variables, setVariables] = useState('{\n  "userId": "1"\n}');
  const [headers, setHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [endpoint, setEndpoint] = useState('https://graphqlzero.almansi.dev/api');
  const [response, setResponse] = useState<GraphQLResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ query: string; variables: string; timestamp: number }>>([]);
  const [activeTab, setActiveTab] = useState<'query' | 'variables' | 'headers' | 'response' | 'history'>('query');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('graphql-playground-history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse history');
      }
    }
    const storedTheme = localStorage.getItem('graphql-playground-theme');
    if (storedTheme) {
      setTheme(storedTheme as 'light' | 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('graphql-playground-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const saveToHistory = useCallback((q: string, v: string) => {
    const entry = { query: q, variables: v, timestamp: Date.now() };
    setHistory(prev => [entry, ...prev.slice(0, 49)]);
  }, []);

  const executeQuery = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    let parsedVariables: Record<string, unknown> = {};
    let parsedHeaders: Record<string, string> = {};

    try {
      parsedVariables = JSON.parse(variables);
    } catch (e) {
      setError('Invalid JSON in Variables');
      setLoading(false);
      return;
    }

    try {
      parsedHeaders = JSON.parse(headers);
    } catch (e) {
      setError('Invalid JSON in Headers');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...parsedHeaders,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: parsedVariables,
        }),
      });

      const data = await res.json();
      setResponse(data);

      if (!res.ok) {
        setError(`HTTP ${res.status}: ${res.statusText}`);
      }

      saveToHistory(query, variables);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatJson = (obj: unknown): string => {
    return JSON.stringify(obj, null, 2);
  };

  const loadExample = (name: string) => {
    const examples: Record<string, { query: string; variables: string }> = {
      'github': {
        query: `query GetRepo($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    name
    description
    stargazerCount
    forkCount
    primaryLanguage {
      name
      color
    }
    issues(first: 5, states: OPEN) {
      nodes {
        title
        createdAt
        author {
          login
        }
      }
    }
  }
}`,
        variables: '{\n  "owner": "facebook",\n  "name": "react"\n}'
      },
      'rickandmorty': {
        query: `query GetCharacters($page: Int) {
  characters(page: $page) {
    info {
      count
      pages
      next
      prev
    }
    results {
      id
      name
      status
      species
      type
      gender
      origin {
        name
      }
      location {
        name
      }
      image
      episode {
        name
        air_date
      }
    }
  }
}`,
        variables: '{\n  "page": 1\n}'
      },
      'countries': {
        query: `query GetCountries {
  countries {
    code
    name
    capital
    currency
    languages {
      code
      name
    }
    continent {
      name
    }
  }
}`,
        variables: '{}'
      },
      'starwars': {
        query: `query GetFilms {
  allFilms {
    films {
      title
      episodeID
      director
      producers
      releaseDate
      openingCrawl
      characterConnection {
        characters {
          name
        }
      }
    }
  }
}`,
        variables: '{}'
      }
    };

    const ex = examples[name];
    if (ex) {
      setQuery(ex.query);
      setVariables(ex.variables);
    }
  };

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(formatJson(response));
    }
  };

  const prettifyQuery = () => {
    // Basic prettification - just add some spacing
    setQuery(query
      .replace(/\s+/g, ' ')
      .replace(/\{/g, ' {\n  ')
      .replace(/\}/g, '\n}')
      .replace(/,/g, ',\n  ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
    );
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('graphql-playground-history');
  };

  return (
    <div className={`tool-container ${theme}`}>
      <div className="tool-header">
        <h2>GraphQL Playground</h2>
        <p className="tool-desc">Test GraphQL queries against any endpoint with variables, headers, and history</p>
      </div>

      <div className="playground-layout">
        {/* Left Panel - Query Editor */}
        <div className="editor-panel">
          <div className="endpoint-bar">
            <label>Endpoint</label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="https://api.example.com/graphql"
            />
            <button onClick={executeQuery} className={`btn-primary ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? '⏳ Executing...' : '▶ Execute'}
            </button>
            <button onClick={prettifyQuery} className="btn-secondary">Prettify</button>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="btn-secondary">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>

          <div className="tab-bar">
            <button className={activeTab === 'query' ? 'active' : ''} onClick={() => setActiveTab('query')}>
              📝 Query
            </button>
            <button className={activeTab === 'variables' ? 'active' : ''} onClick={() => setActiveTab('variables')}>
              📦 Variables
            </button>
            <button className={activeTab === 'headers' ? 'active' : ''} onClick={() => setActiveTab('headers')}>
              🔧 Headers
            </button>
          </div>

          {activeTab === 'query' && (
            <textarea
              className="code-editor"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Write your GraphQL query here..."
              spellCheck={false}
            />
          )}

          {activeTab === 'variables' && (
            <textarea
              className="code-editor"
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              placeholder='{\n  "variableName": "value"\n}'
              spellCheck={false}
            />
          )}

          {activeTab === 'headers' && (
            <textarea
              className="code-editor"
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              placeholder='{\n  "Authorization": "Bearer token"\n}'
              spellCheck={false}
            />
          )}

          <div className="examples-bar">
            <span>Examples:</span>
            {Object.keys({
              github: 1, rickandmorty: 1, countries: 1, starwars: 1
            }).map(name => (
              <button key={name} className="btn-example" onClick={() => loadExample(name)}>
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel - Response */}
        <div className="response-panel">
          <div className="response-header">
            <div className="response-tabs">
              <button className={activeTab === 'response' ? 'active' : ''} onClick={() => setActiveTab('response')}>
                📄 Response
              </button>
              <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>
                📜 History ({history.length})
              </button>
            </div>
            <div className="response-actions">
              {response && <button onClick={copyResponse} className="btn-secondary">📋 Copy</button>}
              {activeTab === 'history' && history.length > 0 && (
                <button onClick={clearHistory} className="btn-danger">Clear History</button>
              )}
            </div>
          </div>

          {activeTab === 'response' && (
            <div className="response-content">
              {error && !response && (
                <div className="error-banner">
                  <span>⚠ {error}</span>
                </div>
              )}
              {response && (
                <pre className="json-response">
                  {formatJson(response)}
                </pre>
              )}
              {!response && !error && !loading && (
                <div className="empty-state">
                  <p>Execute a query to see the response</p>
                </div>
              )}
              {loading && !response && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Executing query...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-content">
              {history.length === 0 ? (
                <div className="empty-state">
                  <p>No history yet. Execute queries to build history.</p>
                </div>
              ) : (
                <ul className="history-list">
                  {history.map((entry, index) => (
                    <li key={index} className="history-item">
                      <div className="history-query" onClick={() => {
                        setQuery(entry.query);
                        setVariables(entry.variables);
                        setActiveTab('query');
                      }}>
                        <pre>{entry.query.slice(0, 200)}{entry.query.length > 200 ? '...' : ''}</pre>
                        <span className="history-time">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .tool-container {
          padding: 1rem;
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100vh;
          background: #f8fafc;
          color: #1e293b;
          transition: background 0.2s, color 0.2s;
        }
        .tool-container.dark {
          background: #0f172a;
          color: #f1f5f9;
        }
        .tool-header {
          margin-bottom: 1rem;
        }
        .tool-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .tool-desc {
          color: #64748b;
        }
        .tool-container.dark .tool-desc {
          color: #94a3b8;
        }

        .playground-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          height: calc(100vh - 180px);
          min-height: 600px;
        }

        .editor-panel, .response-panel {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .tool-container.dark .editor-panel,
        .tool-container.dark .response-panel {
          background: #1e293b;
          border-color: #334155;
        }

        .endpoint-bar {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          align-items: center;
          flex-wrap: wrap;
        }
        .tool-container.dark .endpoint-bar {
          background: #1e293b;
          border-color: #334155;
        }
        .endpoint-bar label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .endpoint-bar input {
          flex: 1;
          min-width: 200px;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #1e293b;
          font-size: 0.875rem;
        }
        .tool-container.dark .endpoint-bar input {
          background: #0f172a;
          border-color: #334155;
          color: #f1f5f9;
        }

        .tab-bar {
          display: flex;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .tool-container.dark .tab-bar {
          background: #1e293b;
          border-color: #334155;
        }
        .tab-bar button {
          padding: 0.75rem 1rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tool-container.dark .tab-bar button {
          color: #94a3b8;
        }
        .tab-bar button:hover {
          color: #334155;
        }
        .tool-container.dark .tab-bar button:hover {
          color: #f1f5f9;
        }
        .tab-bar button.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }

        .code-editor {
          flex: 1;
          border: none;
          outline: none;
          resize: none;
          padding: 1rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          color: #1e293b;
          background: white;
        }
        .tool-container.dark .code-editor {
          background: #0f172a;
          color: #f1f5f9;
        }
        .code-editor::placeholder {
          color: #94a3b8;
        }

        .examples-bar {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-top: 1px solid #e2e8f0;
          background: #f8fafc;
          flex-wrap: wrap;
          align-items: center;
        }
        .tool-container.dark .examples-bar {
          background: #1e293b;
          border-color: #334155;
        }
        .examples-bar span {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .btn-example {
          padding: 0.375rem 0.75rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          font-size: 0.75rem;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tool-container.dark .btn-example {
          background: #334155;
          border-color: #475569;
          color: #e2e8f0;
        }
        .btn-example:hover {
          background: #e2e8f0;
        }
        .tool-container.dark .btn-example:hover {
          background: #475569;
        }

        .response-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .tool-container.dark .response-header {
          background: #1e293b;
          border-color: #334155;
        }
        .response-tabs {
          display: flex;
          gap: 0.25rem;
        }
        .response-tabs button {
          padding: 0.5rem 1rem;
          background: none;
          border: 1px solid transparent;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tool-container.dark .response-tabs button {
          color: #94a3b8;
        }
        .response-tabs button:hover {
          background: #e2e8f0;
          color: #334155;
        }
        .tool-container.dark .response-tabs button:hover {
          background: #334155;
          color: #f1f5f9;
        }
        .response-tabs button.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        .response-actions {
          display: flex;
          gap: 0.5rem;
        }

        .response-content, .history-content {
          flex: 1;
          overflow: auto;
          padding: 1rem;
        }

        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }
        .tool-container.dark .error-banner {
          background: #7f1d1d;
          border-color: #991b1b;
          color: #fca5a5;
        }

        .json-response {
          margin: 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.8rem;
          line-height: 1.5;
          color: #1e293b;
          background: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          overflow: auto;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .tool-container.dark .json-response {
          background: #0f172a;
          color: #e2e8f0;
        }

        .empty-state, .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 300px;
          color: #94a3b8;
          text-align: center;
        }
        .loading-state .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .history-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .history-item {
          border-bottom: 1px solid #e2e8f0;
        }
        .tool-container.dark .history-item {
          border-color: #334155;
        }
        .history-item:last-child {
          border-bottom: none;
        }
        .history-query {
          padding: 1rem;
          cursor: pointer;
          transition: background 0.15s;
        }
        .history-query:hover {
          background: #f8fafc;
        }
        .tool-container.dark .history-query:hover {
          background: #1e293b;
        }
        .history-query pre {
          margin: 0;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.75rem;
          line-height: 1.5;
          color: #475569;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .tool-container.dark .history-query pre {
          color: #94a3b8;
        }
        .history-time {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.7rem;
          color: #94a3b8;
        }

        .btn-primary {
          padding: 0.625rem 1.5rem;
          background: #3b82f6;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .btn-primary.loading {
          background: #93c5fd;
        }

        .btn-secondary {
          padding: 0.5rem 1rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tool-container.dark .btn-secondary {
          background: #334155;
          border-color: #475569;
          color: #e2e8f0;
        }
        .btn-secondary:hover {
          background: #e2e8f0;
        }
        .tool-container.dark .btn-secondary:hover {
          background: #475569;
        }

        .btn-danger {
          padding: 0.5rem 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.15s;
        }
        .tool-container.dark .btn-danger {
          background: #7f1d1d;
          border-color: #991b1b;
          color: #fca5a5;
        }
        .btn-danger:hover {
          background: #fee2e2;
        }
        .tool-container.dark .btn-danger:hover {
          background: #991b1b;
        }

        @media (max-width: 1000px) {
          .playground-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}