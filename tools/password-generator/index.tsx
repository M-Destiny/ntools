import { useState, useCallback } from 'react';

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState<{ score: number; label: string; color: string }>({ score: 0, label: '', color: '' });
  const [history, setHistory] = useState<string[]>([]);

  const generatePassword = useCallback(() => {
    let charset = '';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, '');
    }
    if (excludeAmbiguous) {
      charset = charset.replace(/[{}[\]()<>'",;:\\|~`]/g, '');
    }

    if (!charset) {
      setPassword('Select at least one character type');
      setStrength({ score: 0, label: 'No charset', color: '#ef4444' });
      return;
    }

    // Use crypto.getRandomValues for cryptographically secure random
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[array[i] % charset.length];
    }

    setPassword(result);
    setCopied(false);
    calculateStrength(result);
    addToHistory(result);
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, excludeAmbiguous]);

  const calculateStrength = (pwd: string) => {
    let score = 0;
    const checks = [
      pwd.length >= 8,
      pwd.length >= 12,
      pwd.length >= 16,
      /[a-z]/.test(pwd),
      /[A-Z]/.test(pwd),
      /[0-9]/.test(pwd),
      /[^a-zA-Z0-9]/.test(pwd),
    ];
    score = checks.filter(Boolean).length;

    let label = '', color = '';
    if (score <= 2) { label = 'Very Weak'; color = '#ef4444'; }
    else if (score <= 3) { label = 'Weak'; color = '#f97316'; }
    else if (score <= 4) { label = 'Fair'; color = '#eab308'; }
    else if (score <= 5) { label = 'Good'; color = '#22c55e'; }
    else { label = 'Strong'; color = '#16a34a'; }

    setStrength({ score, label, color });
  };

  const addToHistory = (pwd: string) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h !== pwd);
      return [pwd, ...filtered].slice(0, 10);
    });
  };

  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateMultiple = (count: number) => {
    const passwords: string[] = [];
    for (let i = 0; i < count; i++) {
      let charset = '';
      if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
      if (includeNumbers) charset += '0123456789';
      if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
      if (excludeSimilar) charset = charset.replace(/[il1Lo0O]/g, '');
      if (excludeAmbiguous) charset = charset.replace(/[{}[\]()<>'",;:\\|~`]/g, '');

      const array = new Uint32Array(length);
      crypto.getRandomValues(array);
      let result = '';
      for (let j = 0; j < length; j++) {
        result += charset[array[j] % charset.length];
      }
      passwords.push(result);
    }
    return passwords;
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Password Generator</h2>
        <p className="tool-desc">Generate cryptographically secure passwords with customizable options. Uses Web Crypto API for true randomness.</p>
      </div>

      <div className="tool-grid">
        <div className="generator-panel">
          <div className="password-display">
            <input
              type="text"
              value={password}
              readOnly
              className="password-output"
              placeholder="Click Generate to create a password"
            />
            <button className="copy-btn" onClick={copyToClipboard} disabled={!password}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <div className="strength-meter">
            <div className="strength-bar">
              <div
                className="strength-fill"
                style={{
                  width: `${(strength.score / 7) * 100}%`,
                  backgroundColor: strength.color
                }}
              ></div>
            </div>
            <span className="strength-label" style={{ color: strength.color }}>
              {strength.label} ({strength.score}/7)
            </span>
          </div>

          <div className="options-panel">
            <h3>Length: {length}</h3>
            <input
              type="range"
              min="4"
              max="128"
              value={length}
              onChange={e => setLength(Number(e.target.value))}
              className="length-slider"
            />

            <div className="option-group">
              <h4>Character Types</h4>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={e => setIncludeUppercase(e.target.checked)}
                />
                <span>Uppercase (A-Z)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={e => setIncludeLowercase(e.target.checked)}
                />
                <span>Lowercase (a-z)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={e => setIncludeNumbers(e.target.checked)}
                />
                <span>Numbers (0-9)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={e => setIncludeSymbols(e.target.checked)}
                />
                <span>Symbols (!@#$%^&*)</span>
              </label>
            </div>

            <div className="option-group">
              <h4>Exclusions</h4>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={excludeSimilar}
                  onChange={e => setExcludeSimilar(e.target.checked)}
                />
                <span>Exclude similar (i, l, 1, L, o, 0, O)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={e => setExcludeAmbiguous(e.target.checked)}
                />
                <span>Exclude ambiguous (&#123; &#125; &#91; &#93; &#40; &#41; &#60; &#62; ' &#34; &#44; &#59; &#58; &#92; &#124; &#126; &#96;)</span>
              </label>
            </div>

            <button className="btn-primary generate-btn" onClick={generatePassword}>
              Generate Password
            </button>

            <div className="quick-generate">
              <span>Quick generate:</span>
              <button className="btn-secondary" onClick={() => setPassword(generateMultiple(1)[0])}>1</button>
              <button className="btn-secondary" onClick={() => { const p = generateMultiple(5); setPassword(p.join('\n')); }}>5</button>
              <button className="btn-secondary" onClick={() => { const p = generateMultiple(10); setPassword(p.join('\n')); }}>10</button>
            </div>
          </div>
        </div>

        <div className="info-panel">
          <div className="info-section">
            <h3>Security Features</h3>
            <ul>
              <li>Uses <code>crypto.getRandomValues()</code> for cryptographically secure randomness</li>
              <li>No password is ever sent to a server — generated entirely in your browser</li>
              <li>Generated passwords are not stored or logged</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>Best Practices</h3>
            <ul>
              <li>Use at least 16 characters for high-security accounts</li>
              <li>Enable all character types for maximum entropy</li>
              <li>Use a unique password for every service</li>
              <li>Store passwords in a password manager</li>
              <li>Enable 2FA wherever possible</li>
            </ul>
          </div>

          <div className="info-section">
            <h3>Entropy Calculation</h3>
            <p>Password entropy ≈ log₂(charset^length) bits</p>
            <p>Example: 16 chars with 94 charset = ~105 bits</p>
            <p><strong>128 bits+</strong> recommended for long-term security</p>
          </div>

          {history.length > 0 && (
            <div className="history-section">
              <h3>Recent Passwords</h3>
              <div className="history-list">
                {history.map((p, i) => (
                  <div key={i} className="history-item">
                    <code>{p.length > 30 ? p.slice(0, 30) + '...' : p}</code>
                    <button
                      className="btn-tiny"
                      onClick={() => { navigator.clipboard.writeText(p); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}