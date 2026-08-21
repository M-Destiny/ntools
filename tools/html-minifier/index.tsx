import { useState, useMemo } from 'react';

export default function HtmlMinifier() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    collapseWhitespace: true,
    removeComments: true,
    removeAttributeQuotes: false,
    removeRedundantAttributes: false,
    useShortDoctype: true,
    removeEmptyAttributes: false,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    minifyJS: false,
    minifyCSS: false,
    minifyURLs: false,
  });

  const minifyHTML = (html: string, opts: typeof options): string => {
    let result = html;

    // Remove comments
    if (opts.removeComments) {
      result = result.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Collapse whitespace
    if (opts.collapseWhitespace) {
      result = result
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
    }

    // Remove attribute quotes (simple heuristic)
    if (opts.removeAttributeQuotes) {
      result = result.replace(/="([^"'\s=]+)"/g, '=$1');
      result = result.replace(/='([^"'\s=]+)'/g, "=$1");
    }

    // Use short doctype
    if (opts.useShortDoctype) {
      result = result.replace(/<!DOCTYPE[^>]*>/i, '<!DOCTYPE html>');
    }

    // Remove redundant attributes (basic)
    if (opts.removeRedundantAttributes) {
      result = result.replace(/\s+(type|method|enctype|role|value)="(text\/javascript|get|application\/x-www-form-urlencoded|button|submit)"\s*/gi, ' ');
    }

    // Remove empty attributes
    if (opts.removeEmptyAttributes) {
      result = result.replace(/\s+\w+=""\s*/g, ' ');
    }

    // Remove script type attributes
    if (opts.removeScriptTypeAttributes) {
      result = result.replace(/\s+type="text\/javascript"/gi, '');
    }

    // Remove style/link type attributes
    if (opts.removeStyleLinkTypeAttributes) {
      result = result.replace(/\s+type="text\/css"/gi, '');
    }

    // Basic JS minification (very simple)
    if (opts.minifyJS) {
      result = result.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (_match, content) => {
        const minified = content
          .replace(/\s+/g, ' ')
          .replace(/\s*([{}();,:])\s*/g, '$1')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\/\/.*$/gm, '')
          .trim();
        return `<script>${minified}</script>`;
      });
    }

    // Basic CSS minification (very simple)
    if (opts.minifyCSS) {
      result = result.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_match, content) => {
        const minified = content
          .replace(/\s+/g, ' ')
          .replace(/\s*([{}();,:])\s*/g, '$1')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .trim();
        return `<style>${minified}</style>`;
      });
    }

    // Minify URLs
    if (opts.minifyURLs) {
      result = result.replace(/=["']?((?:https?:)?\/\/[^"'\s>]+)["']?/gi, '=$1');
    }

    return result;
  };

  const processedOutput = useMemo(() => {
    if (!input.trim()) return '';
    try {
      return minifyHTML(input, options);
    } catch (e) {
      return 'Error: ' + (e as Error).message;
    }
  }, [input, options]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(processedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    const sample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Page</title>
    <link rel="stylesheet" type="text/css" href="styles.css">
    <style type="text/css">
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        /* This is a comment */
        h1 { color: #333; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to My Page</h1>
        <p>This is a sample HTML page with various elements.</p>
        <ul>
            <li>Item 1</li>
            <li>Item 2</li>
            <li>Item 3</li>
        </ul>
        <script type="text/javascript">
            // Simple script
            function greet() {
                console.log("Hello, World!");
            }
            greet();
        </script>
    </div>
</body>
</html>`;
    setInput(sample);
  };

  const clearAll = () => {
    setInput('');
  };

  const stats = useMemo(() => {
    if (!input || !processedOutput) return null;
    const reduction = ((1 - processedOutput.length / input.length) * 100).toFixed(1);
    return {
      original: input.length,
      minified: processedOutput.length,
      reduction: `${reduction}%`,
    };
  }, [input, processedOutput]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>HTML Minifier</h2>
        <p className="tool-desc">Minify HTML by removing whitespace, comments, and optional attributes. Supports JS/CSS minification.</p>
      </div>

      <div className="tool-grid">
        <div className="input-panel">
          <div className="panel-header">
            <h3>Input HTML</h3>
            <div className="panel-actions">
              <button className="btn btn-secondary" onClick={loadSample}>Load Sample</button>
              <button className="btn btn-secondary" onClick={clearAll}>Clear</button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="code-textarea"
            placeholder="Paste HTML here..."
            spellCheck={false}
          />
        </div>

        <div className="output-panel">
          <div className="panel-header">
            <h3>Minified Output</h3>
            <div className="panel-actions">
              <button className="btn btn-primary" onClick={copyToClipboard} disabled={!processedOutput}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <textarea
            value={processedOutput}
            readOnly
            className="code-textarea"
            placeholder="Minified output will appear here..."
          />
        </div>
      </div>

      <div className="options-panel">
        <h3>Minification Options</h3>
        <div className="options-grid">
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.collapseWhitespace}
              onChange={(e) => setOptions({ ...options, collapseWhitespace: e.target.checked })}
            />
            Collapse Whitespace
          </label>
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.removeComments}
              onChange={(e) => setOptions({ ...options, removeComments: e.target.checked })}
            />
            Remove Comments
          </label>
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.removeAttributeQuotes}
              onChange={(e) => setOptions({ ...options, removeAttributeQuotes: e.target.checked })}
            />
            Remove Attribute Quotes
          </label>
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.removeRedundantAttributes}
              onChange={(e) => setOptions({ ...options, removeRedundantAttributes: e.target.checked })}
            />
            Remove Redundant Attributes
          </label>
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.useShortDoctype}
              onChange={(e) => setOptions({ ...options, useShortDoctype: e.target.checked })}
            />
            Use Short Doctype
          </label>
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.removeEmptyAttributes}
              onChange={(e) => setOptions({ ...options, removeEmptyAttributes: e.target.checked })}
            />
            Remove Empty Attributes
          </label>
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.removeScriptTypeAttributes}
              onChange={(e) => setOptions({ ...options, removeScriptTypeAttributes: e.target.checked })}
            />
            Remove Script Type Attributes
          </label>
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.removeStyleLinkTypeAttributes}
              onChange={(e) => setOptions({ ...options, removeStyleLinkTypeAttributes: e.target.checked })}
            />
            Remove Style/Link Type Attributes
          </label>
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.minifyJS}
              onChange={(e) => setOptions({ ...options, minifyJS: e.target.checked })}
            />
            Minify Inline JavaScript
          </label>
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.minifyCSS}
              onChange={(e) => setOptions({ ...options, minifyCSS: e.target.checked })}
            />
            Minify Inline CSS
          </label>
          <label className="option-item">
            <input
              type="checkbox"
              checked={options.minifyURLs}
              onChange={(e) => setOptions({ ...options, minifyURLs: e.target.checked })}
            />
            Minify URLs
          </label>
        </div>
      </div>

      {stats && (
        <div className="stats-panel">
          <div className="stat-item">
            <span className="stat-label">Original Size</span>
            <span className="stat-value">{stats.original.toLocaleString()} bytes</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Minified Size</span>
            <span className="stat-value">{stats.minified.toLocaleString()} bytes</span>
          </div>
          <div className="stat-item reduction">
            <span className="stat-label">Reduction</span>
            <span className="stat-value">{stats.reduction}</span>
          </div>
        </div>
      )}
    </div>
  );
}