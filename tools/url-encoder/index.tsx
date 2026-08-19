import { useState, useMemo } from 'react';

export default function URLEncoder() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const process = useMemo(() => {
    try {
      setError(null);
      if (mode === 'encode') {
        // Encode: replace special characters with %XX
        return encodeURIComponent(input)
          // Preserve some characters that encodeURIComponent encodes but we might want to keep
          .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
      } else {
        // Decode: replace %XX with characters
        return decodeURIComponent(input);
      }
    } catch (e) {
      setError(mode === 'encode' ? 'Encoding failed' : 'Decoding failed - invalid %XX sequence');
      return '';
    }
  }, [input, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setOutput(process);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const swap = () => {
    setMode(m => m === 'encode' ? 'decode' : 'encode');
    setInput(output);
    // The output will be recalculated via useMemo
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const loadExample = () => {
    const example = 'https://example.com/search?q=hello world&category=programming&tag=react+typescript';
    setInput(example);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>URL Encoder / Decoder</h2>
        <p className="tool-desc">Encode or decode URLs. Handles special characters, spaces, and Unicode. Uses encodeURIComponent/decodeURIComponent.</p>
      </div>

      <div className="encoder-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>{mode === 'encode' ? 'Text to Encode' : 'URL to Decode'}</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary" disabled={!input.trim()}>Clear</button>
            </div>
          </div>

          <textarea
            className="code-input"
            value={input}
            onChange={handleInputChange}
            placeholder={mode === 'encode' ? 'Enter text to URL-encode...' : 'Enter URL-encoded string to decode...'}
            spellCheck={false}
            rows={15}
          />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="mode-toggle">
            <button
              className={mode === 'encode' ? 'active' : ''}
              onClick={() => setMode('encode')}
            >
              Encode
            </button>
            <button
              className={mode === 'decode' ? 'active' : ''}
              onClick={() => setMode('decode')}
            >
              Decode
            </button>
            <button className="swap-btn" onClick={swap} title="Swap input/output">
              ↕ Swap
            </button>
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-toolbar">
            <h3>{mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}</h3>
            <div className="preview-actions">
              <button onClick={copyToClipboard} className={copied ? 'copied' : 'btn-primary'} disabled={!output.trim()}>
                {copied ? '✓ Copied!' : 'Copy Result'}
              </button>
            </div>
          </div>

          <textarea
            className="code-output"
            value={output}
            readOnly
            spellCheck={false}
            rows={15}
          />

          {output && (
            <div className="output-info">
              <p>{mode === 'encode' ? 'Encoded URL ready to use.' : 'Decoded text. Special characters restored.'}</p>
            </div>
          )}

          <div className="info-section">
            <details>
              <summary>URL Encoding Reference</summary>
              <div className="help-content">
                <h4>Characters that are encoded:</h4>
                <ul>
                  <li>Space → <code>%20</code> (or <code>+</code> in form data)</li>
                  <li><code>!</code> → <code>%21</code> | <code>#</code> → <code>%23</code> | <code>$</code> → <code>%24</code> | <code>%</code> → <code>%25</code></li>
                  <li><code>&</code> → <code>%26</code> | <code>'</code> → <code>%27</code> | <code>(</code> → <code>%28</code> | <code>)</code> → <code>%29</code></li>
                  <li><code>*</code> → <code>%2A</code> | <code>+</code> → <code>%2B</code> | <code>,</code> → <code>%2C</code> | <code>/</code> → <code>%2F</code></li>
                  <li><code>:</code> → <code>%3A</code> | <code>;</code> → <code>%3B</code> | <code>=</code> → <code>%3D</code> | <code>?</code> → <code>%3F</code></li>
                  <li><code>@</code> → <code>%40</code> | <code>[</code> → <code>%5B</code> | <code>]</code> → <code>%5D</code></li>
                  <li>Unicode characters → UTF-8 byte sequences (e.g., <code>é</code> → <code>%C3%A9</code>)</li>
                </ul>

                <h4>Characters NOT encoded (reserved for URL structure):</h4>
                <ul>
                  <li>Letters (A-Z, a-z), Digits (0-9)</li>
                  <li><code>- _ . ~</code> (unreserved per RFC 3986)</li>
                  <li><code>: / ? # [ ] @</code> (reserved delimiters - preserved in full URLs)</li>
                  <li><code>! $ & ' ( ) * + , ; =</code> (sub-delimiters)</li>
                </ul>

                <h4>encodeURI vs encodeURIComponent:</h4>
                <ul>
                  <li><strong>encodeURI</strong>: Encodes a full URL, preserves <code>: / ? # [ ] @</code> and sub-delimiters</li>
                  <li><strong>encodeURIComponent</strong>: Encodes a single component (query value), encodes everything except <code>- _ . ~</code></li>
                  <li>This tool uses <strong>encodeURIComponent</strong> for maximum safety</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}