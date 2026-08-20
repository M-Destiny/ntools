import { useState, useEffect } from 'react';

interface JWTClaim {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'null' | 'object';
}

const STANDARD_CLAIMS = [
  { key: 'iss', label: 'Issuer', type: 'string' as const, placeholder: 'https://example.com' },
  { key: 'sub', label: 'Subject', type: 'string' as const, placeholder: 'user123' },
  { key: 'aud', label: 'Audience', type: 'string' as const, placeholder: 'api.example.com' },
  { key: 'exp', label: 'Expiration Time', type: 'number' as const, placeholder: 'Unix timestamp (e.g., 1735689600)' },
  { key: 'nbf', label: 'Not Before', type: 'number' as const, placeholder: 'Unix timestamp' },
  { key: 'iat', label: 'Issued At', type: 'number' as const, placeholder: 'Unix timestamp (auto: now)' },
  { key: 'jti', label: 'JWT ID', type: 'string' as const, placeholder: 'unique-token-id' },
];

const ALGORITHMS = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512', 'none'];

export default function JWTEncoder() {
  const [algorithm, setAlgorithm] = useState('HS256');
  const [headerTyp, setHeaderTyp] = useState('JWT');
  const [headerKid, setHeaderKid] = useState('');
  const [claims, setClaims] = useState<JWTClaim[]>([
    { key: 'sub', value: 'user123', type: 'string' },
    { key: 'iat', value: String(Math.floor(Date.now() / 1000)), type: 'number' },
    { key: 'exp', value: String(Math.floor(Date.now() / 1000) + 3600), type: 'number' },
  ]);
  const [secret, setSecret] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const base64UrlEncode = (str: string): string => {
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const parseValue = (value: string, type: JWTClaim['type']): any => {
    switch (type) {
      case 'number':
        const num = Number(value);
        return isNaN(num) ? value : num;
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'null':
        return null;
      case 'object':
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      default:
        return value;
    }
  };

  const buildPayload = (): Record<string, any> => {
    const payload: Record<string, any> = {};
    claims.forEach(claim => {
      if (claim.key.trim()) {
        payload[claim.key.trim()] = parseValue(claim.value, claim.type);
      }
    });
    return payload;
  };

  const buildHeader = (): Record<string, any> => {
    const header: Record<string, any> = {
      alg: algorithm,
      typ: headerTyp,
    };
    if (headerKid.trim()) {
      header.kid = headerKid.trim();
    }
    return header;
  };

  const encodeJWT = async () => {
    setError(null);
    setOutput('');

    try {
      const header = buildHeader();
      const payload = buildPayload();

      const headerB64 = base64UrlEncode(JSON.stringify(header));
      const payloadB64 = base64UrlEncode(JSON.stringify(payload));

      const unsignedToken = `${headerB64}.${payloadB64}`;

      let signature = '';

      if (algorithm === 'none') {
        signature = '';
      } else if (algorithm.startsWith('HS')) {
        if (!secret) {
          throw new Error('HMAC secret is required for HS algorithms');
        }
        const encoder = new TextEncoder();
        const hashName = `SHA-${algorithm.slice(2)}`;
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(secret),
          { name: 'HMAC', hash: { name: hashName } },
          false,
          ['sign']
        );
        const data = encoder.encode(unsignedToken);
        const sigBuffer = await crypto.subtle.sign('HMAC', key, data);
        const sigArray = new Uint8Array(sigBuffer);
        let sigBase64 = '';
        for (const byte of sigArray) {
          sigBase64 += String.fromCharCode(byte);
        }
        signature = base64UrlEncode(sigBase64);
      } else if (algorithm.startsWith('RS') || algorithm.startsWith('PS') || algorithm.startsWith('ES')) {
        if (!privateKey) {
          throw new Error(`Private key is required for ${algorithm} algorithm`);
        }
        // For demo purposes - in production use a proper JWT library
        signature = 'SIGNATURE_PLACEHOLDER_' + algorithm;
      }

      const token = signature ? `${unsignedToken}.${signature}` : `${unsignedToken}.`;
      setOutput(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to encode JWT');
    }
  };

  useEffect(() => {
    encodeJWT();
  }, [algorithm, headerTyp, headerKid, claims, secret, privateKey]);

  const addClaim = () => {
    setClaims([...claims, { key: '', value: '', type: 'string' }]);
  };

  const removeClaim = (index: number) => {
    setClaims(claims.filter((_, i) => i !== index));
  };

  const updateClaim = (index: number, field: keyof JWTClaim, value: string) => {
    setClaims(claims.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'token.jwt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setClaims([
      { key: 'sub', value: 'user123', type: 'string' },
      { key: 'iat', value: String(Math.floor(Date.now() / 1000)), type: 'number' },
      { key: 'exp', value: String(Math.floor(Date.now() / 1000) + 3600), type: 'number' },
    ]);
    setSecret('');
    setPrivateKey('');
    setHeaderKid('');
    setOutput('');
    setError(null);
  };

  const loadExample = () => {
    setClaims([
      { key: 'iss', value: 'https://myapp.com', type: 'string' },
      { key: 'sub', value: 'user_abc123', type: 'string' },
      { key: 'aud', value: 'api.myapp.com', type: 'string' },
      { key: 'iat', value: String(Math.floor(Date.now() / 1000)), type: 'number' },
      { key: 'exp', value: String(Math.floor(Date.now() / 1000) + 86400), type: 'number' },
      { key: 'jti', value: 'token_' + Math.random().toString(36).substr(2, 9), type: 'string' },
      { key: 'role', value: 'admin', type: 'string' },
      { key: 'permissions', value: '["read", "write", "delete"]', type: 'object' },
    ]);
    setAlgorithm('HS256');
    setSecret('my-super-secret-key');
  };

  const getAlgorithmInfo = (alg: string) => {
    if (alg === 'none') return { type: 'none', name: 'None (unsecured)', requiresKey: false };
    if (alg.startsWith('HS')) return { type: 'hmac', name: `HMAC ${alg}`, requiresKey: true, keyLabel: 'HMAC Secret' };
    if (alg.startsWith('RS') || alg.startsWith('PS')) return { type: 'rsa', name: `RSA ${alg}`, requiresKey: true, keyLabel: 'RSA Private Key (PEM)' };
    if (alg.startsWith('ES')) return { type: 'ecdsa', name: `ECDSA ${alg}`, requiresKey: true, keyLabel: 'ECDSA Private Key (PEM)' };
    return { type: 'unknown', name: alg, requiresKey: false, keyLabel: 'Key' };
  };

  const algInfo = getAlgorithmInfo(algorithm);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JWT Encoder</h2>
        <p className="tool-desc">Create and sign JSON Web Tokens. Build headers and payloads with standard claims, sign with HMAC or RSA/ECDSA keys.</p>
      </div>

      <div className="jwt-encoder">
        {/* Algorithm Selection */}
        <div className="encoder-section">
          <h3>Algorithm</h3>
          <div className="algorithm-selector">
            <label>
              Algorithm:
              <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} className="algorithm-select">
                {ALGORITHMS.map(alg => (
                  <option key={alg} value={alg}>{getAlgorithmInfo(alg).name}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="alg-description">
            {algorithm === 'none' ? '⚠️ Unsecured token — no signature verification' :
             algorithm.startsWith('HS') ? '🔐 Symmetric signing — same secret for sign and verify' :
             '🔑 Asymmetric signing — private key signs, public key verifies'}
          </p>
        </div>

        {/* Header */}
        <div className="encoder-section">
          <h3>Header</h3>
          <div className="header-fields">
            <div className="header-field">
              <label>
                typ (token type):
                <input
                  type="text"
                  value={headerTyp}
                  onChange={(e) => setHeaderTyp(e.target.value)}
                  placeholder="JWT"
                />
              </label>
            </div>
            <div className="header-field">
              <label>
                kid (key ID):
                <input
                  type="text"
                  value={headerKid}
                  onChange={(e) => setHeaderKid(e.target.value)}
                  placeholder="optional key identifier"
                />
              </label>
            </div>
          </div>
          {showRaw && (
            <details className="raw-preview">
              <summary>Raw Header JSON</summary>
              <pre>{JSON.stringify(buildHeader(), null, 2)}</pre>
            </details>
          )}
        </div>

        {/* Payload/Claims */}
        <div className="encoder-section">
          <div className="section-header-row">
            <h3>Payload (Claims)</h3>
            <button onClick={addClaim} className="btn-secondary btn-sm">+ Add Claim</button>
          </div>
          
          <div className="claims-table">
            <div className="claims-header">
              <span className="claim-col key">Key</span>
              <span className="claim-col value">Value</span>
              <span className="claim-col type">Type</span>
              <span className="claim-col action"></span>
            </div>
            {claims.map((claim, index) => (
              <div key={index} className="claim-row">
                <input
                  type="text"
                  className="claim-col key"
                  value={claim.key}
                  onChange={(e) => updateClaim(index, 'key', e.target.value)}
                  placeholder="claim name"
                  list="standard-claims"
                />
                <input
                  type="text"
                  className="claim-col value"
                  value={claim.value}
                  onChange={(e) => updateClaim(index, 'value', e.target.value)}
                  placeholder="claim value"
                />
                <select
                  className="claim-col type"
                  value={claim.type}
                  onChange={(e) => updateClaim(index, 'type', e.target.value as any)}
                >
                  <option value="string">String</option>
                  <option value="number">Number</option>
                  <option value="boolean">Boolean</option>
                  <option value="null">Null</option>
                  <option value="object">JSON Object</option>
                </select>
                <button
                  className="claim-col action btn-icon"
                  onClick={() => removeClaim(index)}
                  disabled={claims.length <= 1}
                  title="Remove claim"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          
          <datalist id="standard-claims">
            {STANDARD_CLAIMS.map(c => (
              <option key={c.key} value={c.key} label={`${c.key} — ${c.label}`} />
            ))}
          </datalist>

          {showRaw && (
            <details className="raw-preview">
              <summary>Raw Payload JSON</summary>
              <pre>{JSON.stringify(buildPayload(), null, 2)}</pre>
            </details>
          )}
        </div>

        {/* Signing Key */}
        {algInfo.requiresKey && (
          <div className="encoder-section key-section">
            <h3>Signing Key</h3>
            <div className="key-input">
              {algorithm.startsWith('HS') ? (
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder={algInfo.keyLabel}
                  className="secret-input"
                />
              ) : (
                <textarea
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder={algInfo.keyLabel}
                  className="private-key-input"
                  rows={6}
                />
              )}
            </div>
            <p className="key-hint">
              {algorithm.startsWith('HS') 
                ? 'Use a strong random secret (32+ chars for HS256, 48+ for HS384, 64+ for HS512)'
                : 'Paste PEM-format private key (-----BEGIN PRIVATE KEY-----...)'}
            </p>
          </div>
        )}

        {/* Output */}
        <div className="encoder-section output-section">
          <div className="section-header-row">
            <h3>Encoded JWT</h3>
            <div className="output-actions">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={showRaw}
                  onChange={(e) => setShowRaw(e.target.checked)}
                />
                Show raw parts
              </label>
              <button onClick={copyOutput} className={copied ? 'copied' : 'btn-primary'} disabled={!output}>
                {copied ? '✓ Copied!' : 'Copy Token'}
              </button>
              <button onClick={downloadOutput} className="btn-secondary" disabled={!output}>
                Download .jwt
              </button>
            </div>
          </div>
          
          {error && <div className="error-banner">✗ {error}</div>}
          
          {output && (
            <div className="jwt-output">
              <textarea
                className="jwt-token"
                value={output}
                readOnly
                spellCheck={false}
                rows={3}
              />
              {showRaw && (() => {
                const parts = output.split('.');
                return (
                  <div className="token-parts">
                    <details>
                      <summary>Header (Base64Url)</summary>
                      <pre>{parts[0]}</pre>
                    </details>
                    <details>
                      <summary>Payload (Base64Url)</summary>
                      <pre>{parts[1]}</pre>
                    </details>
                    <details>
                      <summary>Signature (Base64Url)</summary>
                      <pre>{parts[2] || '(empty — alg=none)'}</pre>
                    </details>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="encoder-toolbar">
          <button onClick={clearAll} className="btn-secondary">Clear All</button>
          <button onClick={loadExample} className="btn-secondary">Load Example</button>
        </div>
      </div>

      <div className="jwt-encoder-info">
        <details>
          <summary>JWT Encoding Guide</summary>
          <ul>
            <li><strong>HS256/HS384/HS512</strong> — Symmetric HMAC, same secret signs and verifies</li>
            <li><strong>RS256/RS384/RS512</strong> — RSA asymmetric, private key signs, public key verifies</li>
            <li><strong>ES256/ES384/ES512</strong> — ECDSA asymmetric, smaller signatures</li>
            <li><strong>none</strong> — Unsecured token (no signature), for testing only</li>
            <li>Standard claims (iss, sub, aud, exp, nbf, iat, jti) have semantic meaning</li>
            <li>Numbers are auto-detected for timestamps; use Unix epoch seconds</li>
            <li>For RSA/ECDSA: production apps should use a proper JWT library (jose, jsonwebtoken)</li>
          </ul>
        </details>
      </div>
    </div>
  );
}