import { useState, useMemo } from 'react';

interface HttpCode {
  code: number;
  name: string;
  description: string;
  category: string;
}

const HTTP_CODES: HttpCode[] = [
  // 1xx Informational
  { code: 100, name: 'Continue', description: 'The server has received the request headers and the client should proceed to send the request body.', category: '1xx Informational' },
  { code: 101, name: 'Switching Protocols', description: 'The requester has asked the server to switch protocols and the server has agreed to do so.', category: '1xx Informational' },
  { code: 102, name: 'Processing', description: 'The server has received and is processing the request, but no response is available yet.', category: '1xx Informational' },
  { code: 103, name: 'Early Hints', description: 'Used to return some response headers before final HTTP message.', category: '1xx Informational' },

  // 2xx Success
  { code: 200, name: 'OK', description: 'Standard response for successful HTTP requests.', category: '2xx Success' },
  { code: 201, name: 'Created', description: 'The request has been fulfilled, resulting in the creation of a new resource.', category: '2xx Success' },
  { code: 202, name: 'Accepted', description: 'The request has been accepted for processing, but the processing has not been completed.', category: '2xx Success' },
  { code: 203, name: 'Non-Authoritative Information', description: 'The server is a transforming proxy that received a 200 OK from its origin, but is returning a modified version.', category: '2xx Success' },
  { code: 204, name: 'No Content', description: 'The server successfully processed the request and is not returning any content.', category: '2xx Success' },
  { code: 205, name: 'Reset Content', description: 'The server successfully processed the request, but is not returning any content. Unlike 204, this requires the requester to reset the document view.', category: '2xx Success' },
  { code: 206, name: 'Partial Content', description: 'The server is delivering only part of the resource due to a range header sent by the client.', category: '2xx Success' },
  { code: 207, name: 'Multi-Status', description: 'The message body that follows is an XML message and can contain a number of separate response codes.', category: '2xx Success' },
  { code: 208, name: 'Already Reported', description: 'The members of a DAV binding have already been enumerated in a preceding part of the multistatus response.', category: '2xx Success' },
  { code: 226, name: 'IM Used', description: 'The server has fulfilled a request for the resource, and the response is a representation of the result of one or more instance-manipulations.', category: '2xx Success' },

  // 3xx Redirection
  { code: 300, name: 'Multiple Choices', description: 'Indicates multiple options for the resource from which the client may choose.', category: '3xx Redirection' },
  { code: 301, name: 'Moved Permanently', description: 'This and all future requests should be directed to the given URI.', category: '3xx Redirection' },
  { code: 302, name: 'Found', description: 'The resource was found at a different URI. The client should use the original URI for future requests.', category: '3xx Redirection' },
  { code: 303, name: 'See Other', description: 'The response to the request can be found under another URI using GET.', category: '3xx Redirection' },
  { code: 304, name: 'Not Modified', description: 'Indicates the resource has not been modified since the version specified by the request headers.', category: '3xx Redirection' },
  { code: 305, name: 'Use Proxy', description: 'The requested resource is available only through a proxy.', category: '3xx Redirection' },
  { code: 307, name: 'Temporary Redirect', description: 'The request should be repeated with another URI, but future requests should still use the original URI.', category: '3xx Redirection' },
  { code: 308, name: 'Permanent Redirect', description: 'The request and all future requests should be repeated using another URI.', category: '3xx Redirection' },

  // 4xx Client Errors
  { code: 400, name: 'Bad Request', description: 'The server cannot or will not process the request due to an apparent client error.', category: '4xx Client Error' },
  { code: 401, name: 'Unauthorized', description: 'Authentication is required and has failed or has not yet been provided.', category: '4xx Client Error' },
  { code: 402, name: 'Payment Required', description: 'Reserved for future use. Original intention was for digital cash or micropayment schemes.', category: '4xx Client Error' },
  { code: 403, name: 'Forbidden', description: 'The request was valid, but the server is refusing action. The user might not have the necessary permissions.', category: '4xx Client Error' },
  { code: 404, name: 'Not Found', description: 'The requested resource could not be found but may be available in the future.', category: '4xx Client Error' },
  { code: 405, name: 'Method Not Allowed', description: 'A request method is not supported for the requested resource.', category: '4xx Client Error' },
  { code: 406, name: 'Not Acceptable', description: 'The requested resource is capable of generating only content not acceptable according to the Accept headers.', category: '4xx Client Error' },
  { code: 407, name: 'Proxy Authentication Required', description: 'The client must first authenticate itself with the proxy.', category: '4xx Client Error' },
  { code: 408, name: 'Request Timeout', description: 'The server timed out waiting for the request.', category: '4xx Client Error' },
  { code: 409, name: 'Conflict', description: 'Indicates that the request could not be processed because of conflict in the request.', category: '4xx Client Error' },
  { code: 410, name: 'Gone', description: 'Indicates that the resource requested is no longer available and will not be available again.', category: '4xx Client Error' },
  { code: 411, name: 'Length Required', description: 'The request did not specify the length of its content, which is required by the requested resource.', category: '4xx Client Error' },
  { code: 412, name: 'Precondition Failed', description: 'The server does not meet one of the preconditions that the requester put on the request.', category: '4xx Client Error' },
  { code: 413, name: 'Payload Too Large', description: 'The request is larger than the server is willing or able to process.', category: '4xx Client Error' },
  { code: 414, name: 'URI Too Long', description: 'The URI provided was too long for the server to process.', category: '4xx Client Error' },
  { code: 415, name: 'Unsupported Media Type', description: 'The request entity has a media type which the server or resource does not support.', category: '4xx Client Error' },
  { code: 416, name: 'Range Not Satisfiable', description: 'The client has asked for a portion of the file that the server cannot supply.', category: '4xx Client Error' },
  { code: 417, name: 'Expectation Failed', description: 'The server cannot meet the requirements of the Expect request-header field.', category: '4xx Client Error' },
  { code: 418, name: "I'm a teapot", description: 'This code was defined in 1998 as one of the traditional IETF April Fools\' jokes.', category: '4xx Client Error' },
  { code: 421, name: 'Misdirected Request', description: 'The request was directed at a server that is not able to produce a response.', category: '4xx Client Error' },
  { code: 422, name: 'Unprocessable Entity', description: 'The request was well-formed but was unable to be followed due to semantic errors.', category: '4xx Client Error' },
  { code: 423, name: 'Locked', description: 'The resource that is being accessed is locked.', category: '4xx Client Error' },
  { code: 424, name: 'Failed Dependency', description: 'The request failed due to failure of a previous request.', category: '4xx Client Error' },
  { code: 425, name: 'Too Early', description: 'Indicates that the server is unwilling to risk processing a request that might be replayed.', category: '4xx Client Error' },
  { code: 426, name: 'Upgrade Required', description: 'The client should switch to a different protocol such as TLS/1.0.', category: '4xx Client Error' },
  { code: 428, name: 'Precondition Required', description: 'The origin server requires the request to be conditional.', category: '4xx Client Error' },
  { code: 429, name: 'Too Many Requests', description: 'The user has sent too many requests in a given amount of time.', category: '4xx Client Error' },
  { code: 431, name: 'Request Header Fields Too Large', description: 'The server is unwilling to process the request because its header fields are too large.', category: '4xx Client Error' },
  { code: 451, name: 'Unavailable For Legal Reasons', description: 'The user-agent requested a resource that cannot legally be provided.', category: '4xx Client Error' },

  // 5xx Server Errors
  { code: 500, name: 'Internal Server Error', description: 'A generic error message, given when an unexpected condition was encountered.', category: '5xx Server Error' },
  { code: 501, name: 'Not Implemented', description: 'The server either does not recognize the request method, or it lacks the ability to fulfill the request.', category: '5xx Server Error' },
  { code: 502, name: 'Bad Gateway', description: 'The server was acting as a gateway or proxy and received an invalid response from the upstream server.', category: '5xx Server Error' },
  { code: 503, name: 'Service Unavailable', description: 'The server is currently unavailable (overloaded or down).', category: '5xx Server Error' },
  { code: 504, name: 'Gateway Timeout', description: 'The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.', category: '5xx Server Error' },
  { code: 505, name: 'HTTP Version Not Supported', description: 'The server does not support the HTTP protocol version used in the request.', category: '5xx Server Error' },
  { code: 506, name: 'Variant Also Negotiates', description: 'Transparent content negotiation for the request results in a circular reference.', category: '5xx Server Error' },
  { code: 507, name: 'Insufficient Storage', description: 'The server is unable to store the representation needed to complete the request.', category: '5xx Server Error' },
  { code: 508, name: 'Loop Detected', description: 'The server detected an infinite loop while processing the request.', category: '5xx Server Error' },
  { code: 510, name: 'Not Extended', description: 'Further extensions to the request are required for the server to fulfill it.', category: '5xx Server Error' },
  { code: 511, name: 'Network Authentication Required', description: 'The client needs to authenticate to gain network access.', category: '5xx Server Error' },
];

const CATEGORY_ORDER = ['1xx Informational', '2xx Success', '3xx Redirection', '4xx Client Error', '5xx Server Error'];

export default function HttpStatusCodes() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [copied, setCopied] = useState<number | null>(null);

  const filteredCodes = useMemo(() => {
    return HTTP_CODES.filter(code => {
      const matchesSearch = code.code.toString().includes(search) ||
        code.name.toLowerCase().includes(search.toLowerCase()) ||
        code.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || code.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [search, categoryFilter]);

  const categories = ['All', ...CATEGORY_ORDER];

  const copyCode = (code: number) => {
    navigator.clipboard.writeText(code.toString());
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '1xx Informational': return 'var(--color-cat-1xx, #6366f1)';
      case '2xx Success': return 'var(--color-cat-2xx, #22c55e)';
      case '3xx Redirection': return 'var(--color-cat-3xx, #3b82f6)';
      case '4xx Client Error': return 'var(--color-cat-4xx, #f97316)';
      case '5xx Server Error': return 'var(--color-cat-5xx, #ef4444)';
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>HTTP Status Codes</h2>
        <p className="tool-desc">Complete reference of HTTP status codes with descriptions. Search, filter, and copy codes.</p>
      </div>

      <div className="http-codes-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by code, name, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div className="http-codes-grid">
        {filteredCodes.map(code => (
          <div key={code.code} className="http-code-card">
            <div className="code-header" style={{ borderLeftColor: getCategoryColor(code.category) }}>
              <span className="code-number">{code.code}</span>
              <span className="code-name">{code.name}</span>
            </div>
            <div className="code-category" style={{ backgroundColor: getCategoryColor(code.category) }}>
              {code.category}
            </div>
            <p className="code-description">{code.description}</p>
            <button
              className={`copy-code-btn ${copied === code.code ? 'copied' : ''}`}
              onClick={() => copyCode(code.code)}
              title="Copy code"
            >
              {copied === code.code ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        ))}
      </div>

      {filteredCodes.length === 0 && (
        <div className="no-results">No status codes match your search.</div>
      )}

      <div className="legend">
        <h4>Categories</h4>
        <div className="legend-items">
          {CATEGORY_ORDER.map(cat => (
            <span key={cat} className="legend-item" style={{ borderLeftColor: getCategoryColor(cat) }}>
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}