import { useState, useEffect } from 'react';

interface JWTPart {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  raw: { header: string; payload: string; signature: string };
}

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  raw: { header: string; payload: string; signature: string };
  isValid: boolean;
  error?: string;
}

const EXAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const KNOWN_ALGORITHMS = [
  'HS256', 'HS384', 'HS512',
  'RS256', 'RS384', 'RS512',
  'ES256', 'ES384', 'ES512',
  'PS256', 'PS384', 'PS512',
  'EdDSA',
  'none'
];

const STANDARD_CLAIMS: Record<string, string> = {
  iss: 'Issuer',
  sub: 'Subject',
  aud: 'Audience',
  exp: 'Expiration Time',
  nbf: 'Not Before',
  iat: 'Issued At',
  jti: 'JWT ID',
};

export default function JWTDecoder() {
  const [input, setInput] = useState(EXAMPLE_JWT);
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [verifyMode, setVerifyMode] = useState<'none' | 'secret' | 'publicKey'>('none');
  const [secret, setSecret] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [verificationResult, setVerificationResult] = useState<string | null>(null);

  const base64UrlDecode = (str: string): string => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (base64.length % 4) {
      case 2: base64 += '=='; break;
      case 3: base64 += '='; break;
    }
    try {
      return atob(base64);
    } catch {
      throw new Error('Invalid base64url encoding');
    }
  };

  const parseJWT = (token: string): JWTPart => {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format: must have 3 parts separated by dots');
    }
    const [headerB64, payloadB64, signature] = parts;
    
    const headerJson = base64UrlDecode(headerB64);
    const payloadJson = base64UrlDecode(payloadB64);
    
    let header: Record<string, unknown>;
    let payload: Record<string, unknown>;
    
    try {
      header = JSON.parse(headerJson);
    } catch {
      throw new Error('Invalid header: not valid JSON');
    }
    
    try {
      payload = JSON.parse(payloadJson);
    } catch {
      throw new Error('Invalid payload: not valid JSON');
    }
    
    return {
      header,
      payload,
      signature,
      raw: { header: headerB64, payload: payloadB64, signature },
    };
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toISOString().replace('T', ' ').replace('Z', ' UTC');
  };

  const getTimeRemaining = (timestamp: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const diff = timestamp - now;
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds || parts.length === 0) parts.push(`${seconds}s`);
    return parts.join(' ');
  };

  const decodeAndValidate = (token: string) => {
    setError(null);
    setVerificationResult(null);
    try {
      const parsed = parseJWT(token);
      
      let isExpired = false;
      let expInfo = '';
      if (parsed.payload.exp && typeof parsed.payload.exp === 'number') {
        const now = Math.floor(Date.now() / 1000);
        isExpired = parsed.payload.exp < now;
        expInfo = isExpired 
          ? ` (expired ${getTimeRemaining(parsed.payload.exp)} ago)` 
          : ` (expires in ${getTimeRemaining(parsed.payload.exp)})`;
      }
      
      let nbfInfo = '';
      if (parsed.payload.nbf && typeof parsed.payload.nbf === 'number') {
        const now = Math.floor(Date.now() / 1000);
        if (parsed.payload.nbf > now) {
          nbfInfo = ` (not valid until ${getTimeRemaining(parsed.payload.nbf)})`;
        }
      }
      
      setDecoded({
        header: parsed.header,
        payload: parsed.payload,
        signature: parsed.signature,
        raw: parsed.raw,
        isValid: !isExpired,
        error: isExpired ? `Token expired${expInfo}${nbfInfo}` : (nbfInfo ? `Token not yet valid${nbfInfo}` : undefined),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to decode JWT');
      setDecoded(null);
    }
  };

  useEffect(() => {
    decodeAndValidate(input);
  }, [input]);

  const loadExample = () => {
    setInput(EXAMPLE_JWT);
  };

  const clearAll = () => {
    setInput('');
    setDecoded(null);
    setError(null);
    setSecret('');
    setPublicKey('');
    setVerificationResult(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const verifySignature = async () => {
    if (!decoded) return;
    
    const alg = ((decoded.header.alg as string) || '').toUpperCase();
    
    if (alg === 'NONE') {
      setVerificationResult('Algorithm is "none" — no signature verification needed (INSECURE)');
      return;
    }
    
    if (verifyMode === 'secret' && secret) {
      try {
        if (alg.startsWith('HS')) {
          const encoder = new TextEncoder();
          const hashName = `SHA-${alg.slice(2)}`;
          const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: { name: hashName } },
            false,
            ['verify']
          );
          
          const [headerB64, payloadB64] = input.split('.').slice(0, 2);
          const data = encoder.encode(`${headerB64}.${payloadB64}`);
          
          const sigBase64 = decoded.signature.replace(/-/g, '+').replace(/_/g, '/');
          const sigPadding = sigBase64.length % 4 === 2 ? '==' : sigBase64.length % 4 === 3 ? '=' : '';
          const signature = new Uint8Array(
            atob(sigBase64 + sigPadding).split('').map(c => c.charCodeAt(0))
          );
          
          const isValid = await crypto.subtle.verify('HMAC', key, signature, data);
          setVerificationResult(isValid ? '✓ Signature VERIFIED' : '✗ Signature INVALID');
        } else {
          setVerificationResult(`Algorithm ${alg} requires public key verification, not secret`);
        }
      } catch (e) {
        setVerificationResult(`Verification failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    } else if (verifyMode === 'publicKey' && publicKey) {
      setVerificationResult('Public key verification (RSA/ECDSA) requires additional setup — use a JWT library for production');
    } else {
      setVerificationResult('Please provide a secret or public key for verification');
    }
  };

  const renderClaim = (key: string, value: unknown) => {
    const isStandard = key in STANDARD_CLAIMS;
    
    if ((key === 'exp' || key === 'iat' || key === 'nbf') && typeof value === 'number') {
      const dateStr = formatDate(value);
      const remaining = key === 'exp' ? getTimeRemaining(value) : 
                       key === 'nbf' ? getTimeRemaining(value) : '';
      const isExpired = key === 'exp' && value * 1000 < Date.now();
      return (
        <div className="claim-row" key={key}>
          <div className="claim-key">
            {isStandard && <span className="standard-badge">Std</span>}
            <code>{key}</code>
          </div>
          <div className="claim-value">
            <span className="timestamp">{dateStr}</span>
            {remaining && <span className={`time-remaining ${isExpired ? 'expired' : ''}`}>{remaining}</span>}
          </div>
        </div>
      );
    }
    
    if (key === 'aud') {
      const audStr = Array.isArray(value) ? value.join(', ') : String(value);
      return (
        <div className="claim-row" key={key}>
          <div className="claim-key">
            {isStandard && <span className="standard-badge">Std</span>}
            <code>{key}</code>
          </div>
          <div className="claim-value">{audStr}</div>
        </div>
      );
    }
    
    const displayValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
    return (
      <div className="claim-row" key={key}>
        <div className="claim-key">
          {isStandard && <span className="standard-badge">Std</span>}
          <code>{key}</code>
        </div>
        <div className="claim-value"><pre>{displayValue}</pre></div>
      </div>
    );
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JWT Decoder</h2>
        <p className="tool-desc">Decode, inspect, and verify JSON Web Tokens. Paste a JWT to see header, payload, and signature details.</p>
      </div>

      <div className="jwt-decoder">
        <div className="input-section">
          <div className="input-toolbar">
            <h3>Input JWT</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="jwt-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste JWT token here (xxxxx.yyyyy.zzzzz)..."
            spellCheck={false}
            rows={3}
          />
        </div>

        {error && <div className="error-banner">✗ {error}</div>}

        {decoded && (
          <>
            <div className="jwt-section">
              <div className="section-header">
                <h3>Header</h3>
                <div className="section-actions">
                  <button 
                    onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2), 'header')}
                    className={copied === 'header' ? 'copied' : 'btn-secondary'}
                    disabled={copied !== null}
                  >
                    {copied === 'header' ? '✓ Copied!' : 'Copy JSON'}
                  </button>
                  {showRaw && (
                    <button 
                      onClick={() => copyToClipboard(decoded.raw.header, 'raw-header')}
                      className={copied === 'raw-header' ? 'copied' : 'btn-secondary'}
                      disabled={copied !== null}
                    >
                      {copied === 'raw-header' ? '✓ Copied!' : 'Copy Base64'}
                    </button>
                  )}
                </div>
              </div>
              <div className="jwt-part">
                {(Object.keys(decoded.header) as Array<keyof typeof decoded.header>).map(key => 
                  renderClaim(key, decoded.header[key])
                )}
              </div>
              {showRaw && (
                <details className="raw-section">
                  <summary>Raw Base64Url</summary>
                  <pre className="raw-base64">{decoded.raw.header}</pre>
                </details>
              )}
            </div>

            <div className="jwt-section">
              <div className="section-header">
                <h3>Payload (Claims)</h3>
                <div className="section-actions">
                  <button 
                    onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2), 'payload')}
                    className={copied === 'payload' ? 'copied' : 'btn-secondary'}
                    disabled={copied !== null}
                  >
                    {copied === 'payload' ? '✓ Copied!' : 'Copy JSON'}
                  </button>
                  {showRaw && (
                    <button 
                      onClick={() => copyToClipboard(decoded.raw.payload, 'raw-payload')}
                      className={copied === 'raw-payload' ? 'copied' : 'btn-secondary'}
                      disabled={copied !== null}
                    >
                      {copied === 'raw-payload' ? '✓ Copied!' : 'Copy Base64'}
                    </button>
                  )}
                </div>
              </div>
              <div className="jwt-part">
                {(Object.keys(decoded.payload) as Array<keyof typeof decoded.payload>).map(key => 
                  renderClaim(key, decoded.payload[key])
                )}
              </div>
              {showRaw && (
                <details className="raw-section">
                  <summary>Raw Base64Url</summary>
                  <pre className="raw-base64">{decoded.raw.payload}</pre>
                </details>
              )}
            </div>

            <div className="jwt-section signature-section">
              <div className="section-header">
                <h3>Signature</h3>
                <div className="section-actions">
                  <button 
                    onClick={() => copyToClipboard(decoded.signature, 'signature')}
                    className={copied === 'signature' ? 'copied' : 'btn-secondary'}
                    disabled={copied !== null}
                  >
                    {copied === 'signature' ? '✓ Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="signature-info">
                <div className="sig-row">
                  <span className="sig-label">Algorithm</span>
                  <span className={`sig-value alg-badge ${KNOWN_ALGORITHMS.includes(((decoded.header.alg as string) || '').toUpperCase()) ? 'known' : 'unknown'}`}>
                    {String(decoded.header.alg || 'none')}
                  </span>
                </div>
                <div className="sig-row">
                  <span className="sig-label">Signature (Base64Url)</span>
                  <code className="signature-value">{decoded.signature}</code>
                </div>
                <div className="sig-row">
                  <span className="sig-label">Length</span>
                  <span className="sig-value">{decoded.signature.length} chars</span>
                </div>
              </div>

              <div className="verification-panel">
                <h4>Verify Signature</h4>
                <div className="verify-mode">
                  <label>
                    <input
                      type="radio"
                      name="verifyMode"
                      value="none"
                      checked={verifyMode === 'none'}
                      onChange={() => setVerifyMode('none')}
                    />
                    Skip verification
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="verifyMode"
                      value="secret"
                      checked={verifyMode === 'secret'}
                      onChange={() => setVerifyMode('secret')}
                    />
                    HMAC Secret (HS256/384/512)
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="verifyMode"
                      value="publicKey"
                      checked={verifyMode === 'publicKey'}
                      onChange={() => setVerifyMode('publicKey')}
                    />
                    Public Key (RS/ES/PS/EdDSA)
                  </label>
                </div>
                
                {verifyMode === 'secret' && (
                  <div className="verify-input">
                    <input
                      type="password"
                      value={secret}
                      onChange={e => setSecret(e.target.value)}
                      placeholder="Enter HMAC secret key"
                      className="secret-input"
                    />
                  </div>
                )}
                
                {verifyMode === 'publicKey' && (
                  <div className="verify-input">
                    <textarea
                      value={publicKey}
                      onChange={e => setPublicKey(e.target.value)}
                      placeholder="Paste PEM public key"
                      className="public-key-input"
                      rows={4}
                    />
                  </div>
                )}
                
                <button onClick={verifySignature} className="btn-primary verify-btn" disabled={verifyMode !== 'none' && !secret && !publicKey}>
                  Verify Signature
                </button>
                
                {verificationResult && (
                  <div className={`verification-result ${verificationResult.includes('VERIFIED') ? 'success' : 'error'}`}>
                    {verificationResult}
                  </div>
                )}
              </div>
            </div>

            <div className="jwt-section token-info">
              <h3>Token Summary</h3>
              <div className="info-grid">
                <div className={`info-item ${!decoded.isValid ? 'invalid' : ''}`}>
                  <span className="info-label">Status</span>
                  <span className={`info-value status-badge ${decoded.isValid ? 'valid' : 'invalid'}`}>
                    {decoded.isValid ? '✓ Valid' : '✗ Invalid'}
                  </span>
                  {decoded.error && <span className="info-error">{decoded.error}</span>}
                </div>
                <div className="info-item">
                  <span className="info-label">Algorithm</span>
                  <span className="info-value">{String(decoded.header.alg || 'none')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Token Type</span>
                  <span className="info-value">{String(decoded.header.typ || 'JWT')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Size</span>
                  <span className="info-value">{input.length} chars</span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="options-panel">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showRaw}
              onChange={e => setShowRaw(e.target.checked)}
            />
            Show raw Base64Url parts
          </label>
        </div>

        <div className="help-section">
          <details>
            <summary>JWT Reference</summary>
            <div className="help-content">
              <h4>Structure</h4>
              <p>A JWT consists of three parts separated by dots: <code>header.payload.signature</code></p>
              <ul>
                <li><strong>Header</strong> — Algorithm and token type (e.g., <code>{'{\"alg\":\"HS256\",\"typ\":\"JWT\"}'}</code>)</li>
                <li><strong>Payload</strong> — Claims (registered, public, private)</li>
                <li><strong>Signature</strong> — Verifies token integrity</li>
              </ul>
              
              <h4>Standard Claims (Registered)</h4>
              <ul>
                <li><code>iss</code> — Issuer</li>
                <li><code>sub</code> — Subject</li>
                <li><code>aud</code> — Audience</li>
                <li><code>exp</code> — Expiration Time (Unix timestamp)</li>
                <li><code>nbf</code> — Not Before (Unix timestamp)</li>
                <li><code>iat</code> — Issued At (Unix timestamp)</li>
                <li><code>jti</code> — JWT ID (unique identifier)</li>
              </ul>
              
              <h4>Common Algorithms</h4>
              <ul>
                <li><strong>HS256/384/512</strong> — HMAC with SHA-2 (shared secret)</li>
                <li><strong>RS256/384/512</strong> — RSASSA-PKCS1-v1_5 with SHA-2</li>
                <li><strong>ES256/384/512</strong> — ECDSA with SHA-2</li>
                <li><strong>PS256/384/512</strong> — RSASSA-PSS with SHA-2</li>
                <li><strong>EdDSA</strong> — Ed25519/Ed448</li>
                <li><strong>none</strong> — No signature (INSECURE)</li>
              </ul>
              
              <h4>Security Notes</h4>
              <ul>
                <li>Never put sensitive data in JWT payloads — they're base64 encoded, not encrypted</li>
                <li>Always verify signatures on the server side</li>
                <li>Use short expiration times and implement token refresh</li>
                <li>Prefer RS256/ES256 over HS256 for distributed systems</li>
                <li>Reject tokens with <code>alg: "none"</code></li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}