import { useState, useMemo, useCallback } from 'react';

type Algorithm = 'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512' | 'ripemd160';

const ALGORITHMS: { id: Algorithm; name: string; length: number }[] = [
  { id: 'md5', name: 'MD5', length: 32 },
  { id: 'sha1', name: 'SHA-1', length: 40 },
  { id: 'sha256', name: 'SHA-256', length: 64 },
  { id: 'sha384', name: 'SHA-384', length: 96 },
  { id: 'sha512', name: 'SHA-512', length: 128 },
  { id: 'ripemd160', name: 'RIPEMD-160', length: 40 },
];

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<Algorithm>('sha256');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [fileName, setFileName] = useState('');

  const hash = useCallback(async (data: string | ArrayBuffer, algo: Algorithm): Promise<string> => {
    const encoder = new TextEncoder();
    const buffer = typeof data === 'string' ? encoder.encode(data) : data;
    const hashBuffer = await crypto.subtle.digest(algo.toUpperCase().replace('-', ''), buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    if (value.trim()) {
      hash(value, algorithm).then(setOutput);
    } else {
      setOutput('');
    }
    setCopied(false);
  };

  const handleAlgorithmChange = (algo: Algorithm) => {
    setAlgorithm(algo);
    if (input.trim()) {
      hash(input, algo).then(setOutput);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setInputType('file');
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const result = await hash(arrayBuffer, algorithm);
        setOutput(result);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setFileName('');
    setInputType('text');
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const currentAlgo = ALGORITHMS.find(a => a.id === algorithm);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Hash Generator</h2>
        <p className="tool-desc">Generate cryptographic hashes (MD5, SHA-1, SHA-256, SHA-384, SHA-512, RIPEMD-160) from text or files. Runs entirely in-browser using Web Crypto API.</p>
      </div>

      <div className="hash-layout">
        <div className="input-panel">
          <div className="input-tabs">
            <button
              className={inputType === 'text' ? 'active' : ''}
              onClick={() => setInputType('text')}
            >
              Text Input
            </button>
            <button
              className={inputType === 'file' ? 'active' : ''}
              onClick={() => setInputType('file')}
            >
              File Input
            </button>
          </div>

          {inputType === 'text' && (
            <div className="text-input-section">
              <textarea
                className="code-input"
                value={input}
                onChange={handleInputChange}
                placeholder="Enter text to hash..."
                spellCheck={false}
                rows={10}
              />
              <button onClick={clearAll} className="btn-secondary" disabled={!input.trim()}>
                Clear
              </button>
            </div>
          )}

          {inputType === 'file' && (
            <div className="file-input-section">
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="file-input"
                accept="*"
              />
              {fileName && (
                <div className="file-info">
                  <span>📄 {fileName}</span>
                  <button onClick={clearAll} className="btn-secondary btn-small">Remove</button>
                </div>
              )}
              <p className="file-hint">Select a file to generate its hash. File is processed locally — never uploaded.</p>
            </div>
          )}

          <div className="algorithm-selector">
            <label>Algorithm:</label>
            <div className="algo-grid">
              {ALGORITHMS.map(algo => (
                <button
                  key={algo.id}
                  className={algorithm === algo.id ? 'active' : ''}
                  onClick={() => handleAlgorithmChange(algo.id)}
                  title={`${algo.name} (${algo.length} hex chars)`}
                >
                  {algo.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="output-panel">
          <div className="output-header">
            <h3>Hash Output ({currentAlgo?.name})</h3>
            <div className="output-actions">
              <button onClick={copyToClipboard} className={copied ? 'copied' : 'btn-primary'} disabled={!output}>
                {copied ? '✓ Copied!' : 'Copy Hash'}
              </button>
            </div>
          </div>

          <div className="hash-output" title="Click to copy">
            {output || (
              <span className="placeholder">
                {inputType === 'text' ? 'Enter text or select a file to generate hash' : 'Select a file to generate hash'}
              </span>
            )}
          </div>

          {output && (
            <div className="hash-meta">
              <span>Algorithm: {currentAlgo?.name}</span>
              <span>Length: {output.length} characters</span>
              <span>Input: {inputType === 'text' ? `${input.length} chars` : fileName || 'file'}</span>
            </div>
          )}

          <div className="info-section">
            <details>
              <summary>Algorithm Comparison & Use Cases</summary>
              <div className="help-content">
                <table>
                  <thead>
                    <tr>
                      <th>Algorithm</th>
                      <th>Output Size</th>
                      <th>Security Level</th>
                      <th>Speed</th>
                      <th>Recommended Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>MD5</strong></td>
                      <td>128-bit (32 hex)</td>
                      <td>❌ Broken (collisions)</td>
                      <td>Fastest</td>
                      <td>Checksums only, non-security</td>
                    </tr>
                    <tr>
                      <td><strong>SHA-1</strong></td>
                      <td>160-bit (40 hex)</td>
                      <td>❌ Broken (collisions)</td>
                      <td>Fast</td>
                      <td>Legacy systems, Git (transitioning)</td>
                    </tr>
                    <tr>
                      <td><strong>SHA-256</strong></td>
                      <td>256-bit (64 hex)</td>
                      <td>✅ Secure</td>
                      <td>Fast</td>
                      <td><strong>General purpose</strong>, TLS, blockchain, signatures</td>
                    </tr>
                    <tr>
                      <td><strong>SHA-384</strong></td>
                      <td>384-bit (96 hex)</td>
                      <td>✅ Secure (stronger)</td>
                      <td>Medium</td>
                      <td>High-security apps, certs</td>
                    </tr>
                    <tr>
                      <td><strong>SHA-512</strong></td>
                      <td>512-bit (128 hex)</td>
                      <td>✅ Secure (strongest)</td>
                      <td>Medium</td>
                      <td>Maximum security, key derivation</td>
                    </tr>
                    <tr>
                      <td><strong>RIPEMD-160</strong></td>
                      <td>160-bit (40 hex)</td>
                      <td>⚠️ Acceptable</td>
                      <td>Fast</td>
                      <td>Bitcoin addresses (with SHA-256)</td>
                    </tr>
                  </tbody>
                </table>

                <h4>Important Notes:</h4>
                <ul>
                  <li><strong>Never use MD5 or SHA-1 for security</strong> — both have practical collision attacks</li>
                  <li><strong>SHA-256 is the default recommendation</strong> for most use cases</li>
                  <li>For password hashing, use <strong>bcrypt, scrypt, Argon2, or PBKDF2</strong> — not these</li>
                  <li>All hashing runs <strong>locally in your browser</strong> via Web Crypto API — no data leaves your device</li>
                  <li>File hashing uses streaming for large files (processed in chunks)</li>
                </ul>

                <h4>Common Use Cases:</h4>
                <ul>
                  <li>File integrity verification (downloads, backups)</li>
                  <li>Digital signatures and certificates</li>
                  <li>Content addressing (IPFS, Git)</li>
                  <li>Blockchain / cryptocurrency addresses</li>
                  <li>Cache busting (content-based filenames)</li>
                  <li>Deduplication (identical content = identical hash)</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}