import { useState, useCallback } from 'react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
  size: number;
}

export default function ApiTester() {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('https://api.example.com/');
  const [headers, setHeaders] = useState<Header[]>([{ key: 'Content-Type', value: 'application/json', enabled: true }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'response' | 'auth'>('params');
  const [queryParams, setQueryParams] = useState<Array<{ key: string; value: string; enabled: boolean }>>([{ key: '', value: '', enabled: true }]);
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'basic' | 'api-key'>('none');
  const [authBearer, setAuthBearer] = useState('');
  const [authBasic, setAuthBasic] = useState({ username: '', password: '' });
  const [authApiKey, setAuthApiKey] = useState({ key: '', value: '', addTo: 'header' as 'header' | 'query' });

  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  const methodColors: Record<HttpMethod, string> = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-orange-100 text-orange-800',
    PUT: 'bg-blue-100 text-blue-800',
    PATCH: 'bg-purple-100 text-purple-800',
    DELETE: 'bg-red-100 text-red-800',
    HEAD: 'bg-gray-100 text-gray-800',
    OPTIONS: 'bg-yellow-100 text-yellow-800',
  };

  const addHeader = () => setHeaders([...headers, { key: '', value: '', enabled: true }]);
  const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index));
  const updateHeader = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  const addQueryParam = () => setQueryParams([...queryParams, { key: '', value: '', enabled: true }]);
  const removeQueryParam = (index: number) => setQueryParams(queryParams.filter((_, i) => i !== index));
  const updateQueryParam = (index: number, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newParams = [...queryParams];
    newParams[index] = { ...newParams[index], [field]: value };
    setQueryParams(newParams);
  };

  const buildUrl = () => {
    const urlObj = new URL(url);
    queryParams.forEach(param => {
      if (param.enabled && param.key) {
        urlObj.searchParams.append(param.key, param.value);
      }
    });
    return urlObj.toString();
  };

  const buildHeaders = () => {
    const requestHeaders: Record<string, string> = {};
    headers.forEach(h => {
      if (h.enabled && h.key) {
        requestHeaders[h.key] = h.value;
      }
    });

    if (authType === 'bearer' && authBearer) {
      requestHeaders['Authorization'] = `Bearer ${authBearer}`;
    } else if (authType === 'basic' && authBasic.username) {
      const credentials = btoa(`${authBasic.username}:${authBasic.password}`);
      requestHeaders['Authorization'] = `Basic ${credentials}`;
    } else if (authType === 'api-key' && authApiKey.key && authApiKey.value) {
      if (authApiKey.addTo === 'header') {
        requestHeaders[authApiKey.key] = authApiKey.value;
      }
    }

    return requestHeaders;
  };

  const sendRequest = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const startTime = performance.now();
    const requestUrl = buildUrl();
    const requestHeaders = buildHeaders();

    let requestBody: string | undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (authType === 'api-key' && authApiKey.addTo === 'query' && authApiKey.key && authApiKey.value) {
        // Already handled in URL
      } else if (body.trim()) {
        requestBody = body;
      }
    }

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: requestHeaders,
        body: requestBody,
      };

      const res = await fetch(requestUrl, fetchOptions);
      const endTime = performance.now();

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      let responseData: any;
      const contentType = res.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        responseData = await res.json();
      } else if (contentType.includes('text/') || contentType.includes('application/xml')) {
        responseData = await res.text();
      } else {
        const blob = await res.blob();
        responseData = await blob.text();
      }

      const responseSize = new Blob([JSON.stringify(responseData)]).size;

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data: responseData,
        time: Math.round(endTime - startTime),
        size: responseSize,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsLoading(false);
    }
  }, [method, url, queryParams, headers, body, authType, authBearer, authBasic, authApiKey]);

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    }
  };

  const formatJson = (json: any) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch {
      return String(json);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400 && status < 500) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Request Bar */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <select
          value={method}
          onChange={e => setMethod(e.target.value as HttpMethod)}
          className={`px-3 py-2 rounded font-mono text-sm ${methodColors[method]} border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          {methods.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="Enter URL..."
          className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendRequest}
          disabled={isLoading || !url.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b flex gap-1">
        {(['params', 'headers', 'body', 'auth', 'response'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t transition-colors ${
              activeTab === tab
                ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {/* Query Params */}
        {activeTab === 'params' && (
          <div className="space-y-2 p-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <span>Query Parameters</span>
              <button onClick={addQueryParam} className="text-blue-600 hover:underline">Add</button>
            </div>
            {queryParams.map((param, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={param.enabled}
                  onChange={e => updateQueryParam(index, 'enabled', e.target.checked)}
                  className="w-4 h-4"
                />
                <input
                  type="text"
                  placeholder="Key"
                  value={param.key}
                  onChange={e => updateQueryParam(index, 'key', e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={param.value}
                  onChange={e => updateQueryParam(index, 'value', e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <button
                  onClick={() => removeQueryParam(index)}
                  disabled={queryParams.length === 1}
                  className="text-red-500 hover:text-red-700 disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Headers */}
        {activeTab === 'headers' && (
          <div className="space-y-2 p-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <span>Headers</span>
              <button onClick={addHeader} className="text-blue-600 hover:underline">Add</button>
            </div>
            {headers.map((header, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={header.enabled}
                  onChange={e => updateHeader(index, 'enabled', e.target.checked)}
                  className="w-4 h-4"
                />
                <input
                  type="text"
                  placeholder="Key"
                  value={header.key}
                  onChange={e => updateHeader(index, 'key', e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={header.value}
                  onChange={e => updateHeader(index, 'value', e.target.value)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <button
                  onClick={() => removeHeader(index)}
                  disabled={headers.length === 1}
                  className="text-red-500 hover:text-red-700 disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        {activeTab === 'body' && (
          <div className="p-2">
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Request body (JSON, form data, etc.)"
              className="w-full h-64 font-mono text-sm px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              spellCheck={false}
            />
            <div className="mt-2 text-sm text-gray-500">
              Tip: For JSON, set Content-Type header to application/json
            </div>
          </div>
        )}

        {/* Auth */}
        {activeTab === 'auth' && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Auth Type</label>
              <select
                value={authType}
                onChange={e => setAuthType(e.target.value as typeof authType)}
                className="w-full md:w-1/3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
                <option value="api-key">API Key</option>
              </select>
            </div>

            {authType === 'bearer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bearer Token</label>
                <input
                  type="password"
                  value={authBearer}
                  onChange={e => setAuthBearer(e.target.value)}
                  placeholder="Enter token"
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {authType === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={authBasic.username}
                    onChange={e => setAuthBasic({ ...authBasic, username: e.target.value })}
                    placeholder="Username"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={authBasic.password}
                    onChange={e => setAuthBasic({ ...authBasic, password: e.target.value })}
                    placeholder="Password"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {authType === 'api-key' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                    <input
                      type="text"
                      value={authApiKey.key}
                      onChange={e => setAuthApiKey({ ...authApiKey, key: e.target.value })}
                      placeholder="Key name (e.g., X-API-Key)"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <input
                      type="password"
                      value={authApiKey.value}
                      onChange={e => setAuthApiKey({ ...authApiKey, value: e.target.value })}
                      placeholder="API key value"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add to</label>
                  <select
                    value={authApiKey.addTo}
                    onChange={e => setAuthApiKey({ ...authApiKey, addTo: e.target.value as 'header' | 'query' })}
                    className="w-full md:w-1/3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="header">Header</option>
                    <option value="query">Query Parameter</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Response */}
        {activeTab === 'response' && (
          <div className="p-2">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
                <strong>Error:</strong> {error}
              </div>
            )}

            {response && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className={`font-mono text-lg font-bold ${getStatusColor(response.status)}`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="text-sm text-gray-500">{response.time}ms</span>
                  <span className="text-sm text-gray-500">{(response.size / 1024).toFixed(2)} KB</span>
                  <button onClick={copyResponse} className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors">
                    Copy Response
                  </button>
                </div>

                <div className="border rounded overflow-hidden">
                  <div className="bg-gray-100 px-3 py-2 border-b font-medium text-sm">Headers</div>
                  <pre className="p-3 max-h-48 overflow-auto font-mono text-sm bg-white">{formatJson(response.headers)}</pre>
                </div>

                <div className="border rounded overflow-hidden">
                  <div className="bg-gray-100 px-3 py-2 border-b font-medium text-sm">Body</div>
                  <pre className="p-3 max-h-96 overflow-auto font-mono text-sm bg-white">{formatJson(response.data)}</pre>
                </div>
              </div>
            )}

            {!response && !error && !isLoading && (
              <div className="text-center text-gray-500 py-12">
                No response yet. Send a request to see the response here.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}