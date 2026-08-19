import { useState, useMemo } from 'react';

export default function CSSMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ original: 0, minified: 0, savings: 0 });
  const [error, setError] = useState<string | null>(null);

  const minifyCSS = (css: string): string => {
    try {
      // Remove comments
      let result = css.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Remove whitespace around special characters
      result = result.replace(/\s*([{}:;,>+~])\s*/g, '$1');
      
      // Remove semicolon before }
      result = result.replace(/;}/g, '}');
      
      // Remove whitespace around newlines
      result = result.replace(/\s+/g, ' ');
      
      // Remove leading/trailing whitespace
      result = result.trim();
      
      // Remove trailing semicolon
      result = result.replace(/;+$/, '');
      
      // Remove empty rules
      result = result.replace(/[^{}]+\{\s*\}/g, '');
      
      // Shorten hex colors (6 to 3 digits when possible)
      result = result.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3(?![0-9a-fA-F])/g, '#$1$2$3');
      
      // Remove units for zero values
      result = result.replace(/(\d)(\.\d+)?(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch)/g, (match, num, dec, unit) => {
        if (parseFloat(num + (dec || '')) === 0) return '0';
        return match;
      });
      
      // Remove leading zero from decimal values
      result = result.replace(/\b0\./g, '.');
      
      // Combine multiple semicolons
      result = result.replace(/;;+/g, ';');
      
      return result;
    } catch (e) {
      throw new Error('Failed to minify CSS');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setError(null);
    
    if (value.trim()) {
      try {
        const minified = minifyCSS(value);
        setOutput(minified);
        
        const originalSize = new Blob([value]).size;
        const minifiedSize = new Blob([minified]).size;
        const savings = originalSize > 0 ? Math.round((1 - minifiedSize / originalSize) * 100) : 0;
        setStats({ original: originalSize, minified: minifiedSize, savings });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Minification failed');
        setOutput('');
        setStats({ original: 0, minified: 0, savings: 0 });
      }
    } else {
      setOutput('');
      setStats({ original: 0, minified: 0, savings: 0 });
    }
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadExample = () => {
    const example = `/* Example CSS to minify */
.container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
    margin: 0 auto;
    max-width: 1200px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.button {
    background-color: #3b82f6;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.button:hover {
    background-color: #2563eb;
}

@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
    
    .button {
        padding: 10px 20px;
        font-size: 14px;
    }
}

.card {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}`;
    setInput(example);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setStats({ original: 0, minified: 0, savings: 0 });
    setError(null);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>CSS Minifier</h2>
        <p className="tool-desc">Minify CSS by removing comments, whitespace, and optimizing syntax. Reduces file size for faster loading.</p>
      </div>

      <div className="minifier-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input CSS</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary" disabled={!input.trim()}>Clear</button>
            </div>
          </div>

          <textarea
            className="code-input"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste your CSS here..."
            spellCheck={false}
            rows={20}
          />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-label">Original:</span>
              <span className="stat-value">{formatBytes(stats.original)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Minified:</span>
              <span className="stat-value">{formatBytes(stats.minified)}</span>
            </div>
            <div className="stat-item savings">
              <span className="stat-label">Savings:</span>
              <span className="stat-value">{stats.savings}%</span>
            </div>
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-toolbar">
            <h3>Minified Output</h3>
            <div className="preview-actions">
              <button onClick={copyToClipboard} className={copied ? 'copied' : 'btn-primary'} disabled={!output.trim()}>
                {copied ? '✓ Copied!' : 'Copy Minified'}
              </button>
              <button onClick={() => navigator.clipboard.writeText(input)} className="btn-secondary" disabled={!input.trim()}>
                Copy Original
              </button>
            </div>
          </div>

          <textarea
            className="code-output"
            value={output}
            readOnly
            spellCheck={false}
            rows={20}
          />

          {output && (
            <div className="output-info">
              <p>Minified CSS ready to use. Paste into your project or save as a .min.css file.</p>
            </div>
          )}

          <div className="info-section">
            <details>
              <summary>CSS Minification Details</summary>
              <div className="help-content">
                <h4>What this minifier does:</h4>
                <ul>
                  <li>Removes all comments (<code>/* ... */</code>)</li>
                  <li>Removes unnecessary whitespace and newlines</li>
                  <li>Removes trailing semicolons before <code>{'}'}</code></li>
                  <li>Shortens 6-digit hex colors to 3 digits when possible (<code>#ff0000</code> → <code>#f00</code>)</li>
                  <li>Removes units for zero values (<code>0px</code> → <code>0</code>)</li>
                  <li>Removes leading zeros from decimals (<code>0.5</code> → <code>.5</code>)</li>
                  <li>Removes empty rules</li>
                </ul>

                <h4>What it preserves:</h4>
                <ul>
                  <li>All functional CSS (selectors, properties, values)</li>
                  <li><code>@media</code>, <code>@keyframes</code>, <code>@supports</code> rules</li>
                  <li>CSS custom properties (variables)</li>
                  <li>Calc() expressions</li>
                  <li>URLs and font-face declarations</li>
                </ul>

                <h4>Best Practices:</h4>
                <ul>
                  <li>Keep original CSS for development; use minified for production</li>
                  <li>Use source maps in production for debugging</li>
                  <li>Combine with gzip/brotli compression for best results</li>
                  <li>Run minification as part of your build process</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}