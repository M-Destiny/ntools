import { useState, useCallback } from 'react';

interface CorsResult {
  url: string;
  method: string;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  status: number;
  statusText: string;
  allowed: boolean;
  error?: string;
}

interface TestConfig {
  url: string;
  method: string;
  origin: string;
  headers: string;
  credentials: boolean;
}

export default function CorsTester() {
  const [config, setConfig] = useState<TestConfig>({
    url: '',
    method: 'GET',
    origin: window.location.origin,
    headers: '',
    credentials: false
  });
  const [result, setResult] = useState<CorsResult | null>(null);
  const [preflightResult, setPreflightResult] = useState<CorsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [history, setHistory] = useState<CorsResult[]>([]);

  const parseHeaders = (headerString: string): Record<string, string> => {
    const headers: Record<string, string> = {};
    headerString.split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        if (key) headers[key] = value;
      }
    });
    return headers;
  };

  const runTest = async (isPreflight = false) => {
    const { url, method, origin, headers, credentials } = config;
    
    if (!url.trim()) {
      setToast({ message: 'Please enter a URL to test', type: 'error' });
      return;
    }

    try {
      new URL(url);
    } catch {
      setToast({ message: 'Invalid URL format', type: 'error' });
      return;
    }

    setLoading(true);
    const testHeaders = parseHeaders(headers);
    const requestHeaders: Record<string, string> = {
      'Origin': origin,
      ...testHeaders
    };

    if (isPreflight) {
      requestHeaders['Access-Control-Request-Method'] = method;
      if (Object.keys(testHeaders).length > 0) {
        requestHeaders['Access-Control-Request-Headers'] = Object.keys(testHeaders).join(', ');
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: isPreflight ? 'OPTIONS' : method,
        headers: requestHeaders,
        credentials: credentials ? 'include' : 'omit',
        mode: 'cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const corsResult: CorsResult = {
        url,
        method: isPreflight ? 'OPTIONS' : method,
        requestHeaders,
        responseHeaders,
        status: response.status,
        statusText: response.statusText,
        allowed: checkCorsAllowed(responseHeaders, origin),
      };

      if (isPreflight) {
        setPreflightResult(corsResult);
      } else {
        setResult(corsResult);
        setHistory(prev => [corsResult, ...prev.slice(0, 9)]);
      }

      setToast({
        message: corsResult.allowed ? 'CORS check passed' : 'CORS blocked',
        type: corsResult.allowed ? 'success' : 'error'
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Request failed';
      const corsResult: CorsResult = {
        url,
        method: isPreflight ? 'OPTIONS' : method,
        requestHeaders,
        responseHeaders: {},
        status: 0,
        statusText: error,
        allowed: false,
        error
      };

      if (isPreflight) {
        setPreflightResult(corsResult);
      } else {
        setResult(corsResult);
        setHistory(prev => [corsResult, ...prev.slice(0, 9)]);
      }
      setToast({ message: `Request failed: ${error}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const checkCorsAllowed = (
    responseHeaders: Record<string, string>,
    origin: string
  ): boolean => {
    const acao = responseHeaders['access-control-allow-origin'];
    if (!acao) return false;
    if (acao === '*' && !config.credentials) return true;
    if (acao === origin) return true;
    return false;
  };

  const runFullTest = useCallback(() => {
    setPreflightResult(null);
    runTest(true);
    setTimeout(() => runTest(false), 500);
  }, [config]);

  const copyResult = (data: CorsResult | null) => {
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setToast({ message: 'Result copied', type: 'success' });
    }
  };

  const clearResults = () => {
    setResult(null);
    setPreflightResult(null);
  };

  const formatHeaders = (headers: Record<string, string>) => {
    return Object.entries(headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n') || '(none)';
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>CORS Tester</h2>
        <p className="tool-desc">Test Cross-Origin Resource Sharing (CORS) configuration. Sends actual requests to verify headers, preflight handling, and credential support.</p>
      </div>

      <div className="space-y-4">
        {/* Configuration */}
        <div className="config-section">
          <h3>Request Configuration</h3>
          <div className="config-grid">
            <div className="input-group">
              <label>Target URL</label>
              <input
                type="url"
                value={config.url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://api.example.com/endpoint"
                className="input"
              />
            </div>
            <div className="input-group">
              <label>HTTP Method</label>
              <select
                value={config.method}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setConfig({ ...config, method: e.target.value })}
                className="input"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
                <option value="HEAD">HEAD</option>
                <option value="OPTIONS">OPTIONS</option>
              </select>
            </div>
            <div className="input-group">
              <label>Origin Header</label>
              <input
                type="text"
                value={config.origin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, origin: e.target.value })}
                placeholder="https://your-site.com"
                className="input"
              />
            </div>
            <div className="input-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.credentials}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfig({ ...config, credentials: e.target.checked })}
                />
                <span>Include Credentials</span>
              </label>
            </div>
          </div>

          <div className="input-group full-width">
            <label>Custom Request Headers (one per line, format: Key: Value)</label>
            <textarea
              value={config.headers}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConfig({ ...config, headers: e.target.value })}
              className="input textarea"
              rows={4}
              placeholder="Content-Type: application/json\nAuthorization: Bearer token123\nX-Custom-Header: value"
            />
          </div>

          <div className="button-group">
            <button 
              onClick={runFullTest} 
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Testing...' : 'Run Full Test (Preflight + Actual)'}
            </button>
            <button onClick={() => runTest(true)} disabled={loading} className="btn btn-secondary">
              Preflight Only (OPTIONS)
            </button>
            <button onClick={() => runTest(false)} disabled={loading} className="btn btn-secondary">
              Actual Request Only
            </button>
            <button onClick={clearResults} className="btn btn-ghost">
              Clear
            </button>
          </div>
        </div>

        {toast && (
          <div className={`toast toast-${toast.type}`} onClick={() => setToast(null)}>
            {toast.message}
          </div>
        )}

        {/* Results */}
        {(result || preflightResult) && (
          <div className="results-section">
            {preflightResult && (
              <div className={`result-card ${preflightResult.allowed ? 'success' : 'error'}`}>
                <div className="result-header">
                  <h3 className="result-title">
                    <span className="badge">PREFLIGHT</span>
                    OPTIONS Request
                  </h3>
                  <button onClick={() => copyResult(preflightResult)} className="btn-copy">Copy</button>
                </div>
                <div className="result-details">
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value ${preflightResult.allowed ? 'text-green' : 'text-red'}`}>
                      {preflightResult.status} {preflightResult.statusText}
                    </span>
                    {preflightResult.error && (
                      <span className="detail-error">({preflightResult.error})</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Allow-Origin:</span>
                    <code className={preflightResult.responseHeaders['access-control-allow-origin'] === config.origin || preflightResult.responseHeaders['access-control-allow-origin'] === '*' ? 'text-green' : 'text-red'}>
                      {preflightResult.responseHeaders['access-control-allow-origin'] || '(missing)'}
                    </code>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Allow-Methods:</span>
                    <code>{preflightResult.responseHeaders['access-control-allow-methods'] || '(missing)'}</code>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Allow-Headers:</span>
                    <code>{preflightResult.responseHeaders['access-control-allow-headers'] || '(missing)'}</code>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Allow-Credentials:</span>
                    <code>{preflightResult.responseHeaders['access-control-allow-credentials'] || '(missing)'}</code>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Max-Age:</span>
                    <code>{preflightResult.responseHeaders['access-control-max-age'] || '(missing)'}</code>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className={`result-card ${result.allowed ? 'success' : 'error'}`}>
                <div className="result-header">
                  <h3 className="result-title">
                    <span className="badge">ACTUAL</span>
                    {result.method} Request
                  </h3>
                  <button onClick={() => copyResult(result)} className="btn-copy">Copy</button>
                </div>
                <div className="result-details">
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value ${result.allowed ? 'text-green' : 'text-red'}`}>
                      {result.status} {result.statusText}
                    </span>
                    {result.error && (
                      <span className="detail-error">({result.error})</span>
                    )}
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Allow-Origin:</span>
                    <code className={result.responseHeaders['access-control-allow-origin'] === config.origin || result.responseHeaders['access-control-allow-origin'] === '*' ? 'text-green' : 'text-red'}>
                      {result.responseHeaders['access-control-allow-origin'] || '(missing)'}
                    </code>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Expose-Headers:</span>
                    <code>{result.responseHeaders['access-control-expose-headers'] || '(none)'}</code>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Allow-Credentials:</span>
                    <code>{result.responseHeaders['access-control-allow-credentials'] || '(missing)'}</code>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Vary Header:</span>
                    <code>{result.responseHeaders['vary'] || '(missing)'}</code>
                  </div>
                </div>
              </div>
            )}

            {result && (
              <div className="result-card full-width">
                <h4 className="section-title">All Response Headers</h4>
                <pre className="headers-pre">{formatHeaders(result.responseHeaders)}</pre>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="history-section">
            <h3 className="section-title">Recent Tests</h3>
            <div className="history-list">
              {history.map((item, i) => (
                <div key={i} className="history-item">
                  <div className="history-info">
                    <span className={`badge ${item.allowed ? 'badge-success' : 'badge-error'}`}>
                      {item.allowed ? 'Allowed' : 'Blocked'}
                    </span>
                    <code>{item.method} {new URL(item.url).pathname}</code>
                    <span className="history-status">{item.status} {item.statusText}</span>
                  </div>
                  <button onClick={() => copyResult(item)} className="btn-copy-sm">Copy</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Panel */}
        <div className="info-panel">
          <h4>How CORS Testing Works</h4>
          <ul className="info-list">
            <li><strong>Preflight (OPTIONS):</strong> Browser sends OPTIONS with <code>Access-Control-Request-Method</code> and <code>Access-Control-Request-Headers</code>. Server must respond with <code>Access-Control-Allow-*</code> headers.</li>
            <li><strong>Actual Request:</strong> If preflight passes, browser sends the real request with <code>Origin</code> header. Server must echo <code>Access-Control-Allow-Origin</code> matching the origin (or <code>*</code> without credentials).</li>
            <li><strong>Credentials:</strong> When enabled, <code>Access-Control-Allow-Credentials: true</code> required and <code>Allow-Origin</code> cannot be <code>*</code>.</li>
            <li><strong>Vary Header:</strong> Server should include <code>Vary: Origin</code> to prevent cache poisoning.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}