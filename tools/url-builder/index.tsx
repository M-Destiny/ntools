import { useState, useCallback, useMemo } from 'react';

export default function UrlBuilder() {
  const [protocol, setProtocol] = useState<'http' | 'https' | 'ftp' | 'ws' | 'wss'>('https');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [path, setPath] = useState('');
  const [queryParams, setQueryParams] = useState<Array<{ key: string; value: string; enabled: boolean }>>([
    { key: '', value: '', enabled: true }
  ]);
  const [fragment, setFragment] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [parsedResult, setParsedResult] = useState<{
    protocol: string;
    host: string;
    port: string;
    path: string;
    query: Record<string, string>;
    fragment: string;
  } | null>(null);
  const [encodedUrl, setEncodedUrl] = useState('');

  const presets = useMemo(() => ({
    google: { protocol: 'https' as const, host: 'google.com', port: '', path: '/search', queryParams: [{ key: 'q', value: '', enabled: true }], fragment: '' },
    github: { protocol: 'https' as const, host: 'github.com', port: '', path: '', queryParams: [{ key: '', value: '', enabled: true }], fragment: '' },
    api: { protocol: 'https' as const, host: 'api.example.com', port: '', path: '/v1/users', queryParams: [{ key: 'page', value: '1', enabled: true }, { key: 'limit', value: '20', enabled: true }], fragment: '' },
    localhost: { protocol: 'http' as const, host: 'localhost', port: '3000', path: '/api/health', queryParams: [{ key: '', value: '', enabled: true }], fragment: '' },
    search: { protocol: 'https' as const, host: 'duckduckgo.com', port: '', path: '/', queryParams: [{ key: 'q', value: '', enabled: true }], fragment: '' },
    ws: { protocol: 'wss' as const, host: 'ws.example.com', port: '', path: '/socket', queryParams: [{ key: 'token', value: '', enabled: true }], fragment: '' },
  }), []);

  const buildUrl = useCallback(() => {
    let url = `${protocol}://`;
    
    if (host) {
      url += host;
      if (port) {
        // Only add port if non-standard
        const standardPorts: Record<string, string> = { 'http': '80', 'https': '443', 'ws': '80', 'wss': '443', 'ftp': '21' };
        if (port !== standardPorts[protocol]) {
          url += `:${port}`;
        }
      }
    }
    
    if (path) {
      url += path.startsWith('/') ? path : `/${path}`;
    }
    
    const activeParams = queryParams.filter(p => p.enabled && p.key.trim());
    if (activeParams.length > 0) {
      const params = new URLSearchParams();
      activeParams.forEach(p => params.append(p.key, p.value));
      url += `?${params.toString()}`;
    }
    
    if (fragment) {
      url += `#${fragment}`;
    }
    
    return url;
  }, [protocol, host, port, path, queryParams, fragment]);

  const parseUrl = useCallback((url: string) => {
    try {
      const parsed = new URL(url);
      const query: Record<string, string> = {};
      parsed.searchParams.forEach((value, key) => {
        query[key] = value;
      });
      
      const queryParamArray = Object.entries(query).map(([key, value]) => ({
        key, value, enabled: true
      }));
      
      // If no query params, keep empty row
      if (queryParamArray.length === 0) {
        queryParamArray.push({ key: '', value: '', enabled: true });
      }
      
      const standardPorts: Record<string, string> = { 'http:': '80', 'https:': '443', 'ws:': '80', 'wss:': '443', 'ftp:': '21' };
      const port = parsed.port && parsed.port !== standardPorts[parsed.protocol] ? parsed.port : '';
      
      setProtocol(parsed.protocol.replace(':', '') as any);
      setHost(parsed.hostname);
      setPort(port);
      setPath(parsed.pathname);
      setQueryParams(queryParamArray);
      setFragment(parsed.hash.slice(1));
      setParsedResult({
        protocol: parsed.protocol,
        host: parsed.hostname,
        port: parsed.port || '',
        path: parsed.pathname,
        query,
        fragment: parsed.hash.slice(1)
      });
    } catch (e) {
      // Invalid URL
      setParsedResult(null);
    }
  }, []);

  const addQueryParam = useCallback(() => {
    setQueryParams(prev => [...prev, { key: '', value: '', enabled: true }]);
  }, []);

  const removeQueryParam = useCallback((index: number) => {
    setQueryParams(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateQueryParam = useCallback((index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    setQueryParams(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  }, []);

  const toggleQueryParam = useCallback((index: number) => {
    setQueryParams(prev => prev.map((p, i) => i === index ? { ...p, enabled: !p.enabled } : p));
  }, []);

  const loadPreset = useCallback((preset: keyof typeof presets) => {
    const p = presets[preset];
    setProtocol(p.protocol);
    setHost(p.host);
    setPort(p.port || '');
    setPath(p.path);
    setQueryParams(p.queryParams);
    setFragment(p.fragment);
  }, [presets]);

  const copyUrl = useCallback(() => {
    const url = buildUrl();
    navigator.clipboard.writeText(url);
  }, [buildUrl]);

  const copyEncoded = useCallback(() => {
    navigator.clipboard.writeText(encodedUrl);
  }, [encodedUrl]);

  const clearAll = useCallback(() => {
    setProtocol('https');
    setHost('');
    setPort('');
    setPath('');
    setQueryParams([{ key: '', value: '', enabled: true }]);
    setFragment('');
    setCustomUrl('');
    setParsedResult(null);
    setEncodedUrl('');
  }, []);

  const builtUrl = buildUrl();
  const fullEncodedUrl = useMemo(() => {
    try {
      return encodeURI(builtUrl);
    } catch {
      return builtUrl;
    }
  }, [builtUrl]);

  setEncodedUrl(fullEncodedUrl);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>URL Builder</h2>
        <p className="tool-desc">
          Construct URLs visually with protocol, host, path, query parameters, and fragments. Parse existing URLs and encode/decode.
        </p>
      </div>

      <div className="tool-grid">
        <div className="panel">
          <h3>URL Components</h3>
          
          <div className="input-group">
            <label>Protocol</label>
            <select value={protocol} onChange={e => setProtocol(e.target.value as any)} className="protocol-select">
              <option value="https">https://</option>
              <option value="http">http://</option>
              <option value="ftp">ftp://</option>
              <option value="ws">ws://</option>
              <option value="wss">wss://</option>
            </select>
          </div>

          <div className="input-row">
            <div className="input-group flex-1">
              <label>Host</label>
              <input
                type="text"
                value={host}
                onChange={e => setHost(e.target.value)}
                placeholder="example.com"
                className="host-input"
              />
            </div>
            <div className="input-group port-group">
              <label>Port</label>
              <input
                type="text"
                value={port}
                onChange={e => setPort(e.target.value)}
                placeholder="8080"
                className="port-input"
              />
            </div>
          </div>

          <div className="input-group">
            <label>Path</label>
            <input
              type="text"
              value={path}
              onChange={e => setPath(e.target.value)}
              placeholder="/api/v1/users"
              className="path-input"
            />
          </div>

          <div className="input-group">
            <label>Fragment (#)</label>
            <input
              type="text"
              value={fragment}
              onChange={e => setFragment(e.target.value)}
              placeholder="section-name"
              className="fragment-input"
            />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Query Parameters</h3>
            <button className="add-btn" onClick={addQueryParam}>+ Add Parameter</button>
          </div>
          
          <div className="query-params">
            {queryParams.map((param, index) => (
              <div key={index} className={`query-param-row ${param.enabled ? '' : 'disabled'}`}>
                <input
                  type="checkbox"
                  checked={param.enabled}
                  onChange={() => toggleQueryParam(index)}
                  className="param-toggle"
                  title="Enable/disable parameter"
                />
                <input
                  type="text"
                  value={param.key}
                  onChange={e => updateQueryParam(index, 'key', e.target.value)}
                  placeholder="key"
                  className="param-key"
                  disabled={!param.enabled}
                />
                <span className="equals">=</span>
                <input
                  type="text"
                  value={param.value}
                  onChange={e => updateQueryParam(index, 'value', e.target.value)}
                  placeholder="value"
                  className="param-value"
                  disabled={!param.enabled}
                />
                <button
                  className="remove-btn"
                  onClick={() => removeQueryParam(index)}
                  disabled={queryParams.length <= 1}
                  title="Remove parameter"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="presets-section">
        <h3>Presets</h3>
        <div className="presets-grid">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              className="preset-btn"
              onClick={() => loadPreset(key as keyof typeof presets)}
              title={`${preset.protocol}://${preset.host}${preset.port ? ':' + preset.port : ''}${preset.path}`}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="tool-grid">
        <div className="panel">
          <h3>Built URL</h3>
          <div className="output-url">
            <input
              type="text"
              value={builtUrl}
              readOnly
              className="url-output"
            />
            <button className="copy-btn" onClick={copyUrl}>
              Copy
            </button>
          </div>
        </div>

        <div className="panel">
          <h3>Encoded URL</h3>
          <div className="output-url">
            <input
              type="text"
              value={fullEncodedUrl}
              readOnly
              className="url-output"
            />
            <button className="copy-btn" onClick={copyEncoded}>
              Copy
            </button>
          </div>
        </div>
      </div>

      <div className="panel parse-section">
        <h3>Parse Existing URL</h3>
        <div className="input-group">
          <input
            type="text"
            value={customUrl}
            onChange={e => { setCustomUrl(e.target.value); parseUrl(e.target.value); }}
            placeholder="Paste a URL to parse and populate fields..."
            className="parse-input"
          />
          <button className="clear-btn" onClick={clearAll}>Clear All</button>
        </div>
        
        {parsedResult && (
          <details className="parsed-details">
            <summary>Parsed Components</summary>
            <div className="parsed-grid">
              <div><strong>Protocol:</strong> {parsedResult.protocol}</div>
              <div><strong>Host:</strong> {parsedResult.host}</div>
              <div><strong>Port:</strong> {parsedResult.port || '(default)'}</div>
              <div><strong>Path:</strong> {parsedResult.path}</div>
              <div><strong>Query:</strong> {JSON.stringify(parsedResult.query, null, 2)}</div>
              <div><strong>Fragment:</strong> {parsedResult.fragment || '(none)'}</div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}