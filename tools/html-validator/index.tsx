import { useState, useCallback } from 'react';

export default function HtmlValidator() {
  const [htmlInput, setHtmlInput] = useState('');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    stats: {
      elements: number;
      attributes: number;
      depth: number;
    } | null;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'validate' | 'examples'>('validate');
  const [exampleType, setExampleType] = useState<'valid' | 'invalid' | 'complex'>('valid');

  const examples = {
    valid: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Valid HTML Page</title>
</head>
<body>
  <header>
    <h1>Welcome</h1>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <article>
      <h2>Article Title</h2>
      <p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
      <img src="image.jpg" alt="Description" width="400" height="300">
    </article>
  </main>
  <footer>
    <p>&copy; 2024 Example Corp</p>
  </footer>
</body>
</html>`,
    invalid: `<html>
<head>
  <title>Invalid HTML</title>
</head>
<body>
  <h1>Missing closing tag
  <p>Unclosed paragraph
  <div>
    <span>Nested incorrectly</div>
  </span>
  <img src="broken.jpg">
  <br></br>
  <unknown-tag>Custom element</unknown-tag>
  <p>Duplicate id</p>
  <p id="dup">First</p>
  <p id="dup">Second</p>
  <script>
    document.write('<p>Injected</p>');
  </script>
</body>
</html>`,
    complex: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="A complex valid HTML5 document">
  <title>Complex Valid HTML</title>
  <link rel="stylesheet" href="styles.css">
  <script src="app.js" defer></script>
</head>
<body>
  <header role="banner">
    <nav role="navigation" aria-label="Main navigation">
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/products">Products</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main role="main">
    <section aria-labelledby="features-heading">
      <h2 id="features-heading">Features</h2>
      <article>
        <h3>Feature One</h3>
        <p>Details about feature one.</p>
      </article>
      <article>
        <h3>Feature Two</h3>
        <p>Details about feature two with a <a href="#link">link</a>.</p>
      </article>
    </section>
    <aside role="complementary">
      <h3>Sidebar</h3>
      <form>
        <label for="email">Email:</label>
        <input type="email" id="email" name="email" required>
        <button type="submit">Subscribe</button>
      </form>
    </aside>
  </main>
  <footer role="contentinfo">
    <address>
      Contact: <a href="mailto:info@example.com">info@example.com</a>
    </address>
    <p><small>&copy; 2024 All rights reserved.</small></p>
  </footer>
</body>
</html>`
  };
  const validateHtml = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let elementCount = 0;
    let attributeCount = 0;
    let maxDepth = 0;
    const seenIds = new Set<string>();

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlInput, 'text/html');

      // Check for parser errors
      const parserErrors = doc.querySelectorAll('parsererror');
      parserErrors.forEach((err) => {
        errors.push(`Parser error: ${err.textContent}`);
      });

      // Walk the DOM tree
      const walk = (node: Node, depth: number = 0) => {
        maxDepth = Math.max(maxDepth, depth);

        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          elementCount++;
          attributeCount += element.attributes.length;

          // Check for duplicate IDs
          const id = element.getAttribute('id');
          if (id) {
            if (seenIds.has(id)) {
              errors.push(`Duplicate id: "${id}"`);
            } else {
              seenIds.add(id);
            }
          }

          // Check for deprecated/obsolete elements
          const deprecatedTags = ['font', 'center', 'strike', 'tt', 'big', 'frame', 'frameset', 'noframes', 'acronym', 'applet', 'isindex', 'dir', 'basefont'];
          if (deprecatedTags.includes(element.tagName.toLowerCase())) {
            warnings.push(`Deprecated element: <${element.tagName.toLowerCase()}>`);
          }

          // Check for missing alt on images
          if (element.tagName.toLowerCase() === 'img' && !element.hasAttribute('alt')) {
            errors.push(`Missing required "alt" attribute on <img>`);
          }

          // Check for missing labels on inputs
          if (element.tagName.toLowerCase() === 'input') {
            const type = element.getAttribute('type') || 'text';
            if (!['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) {
              const id = element.getAttribute('id');
              const hasLabel = id && doc.querySelector(`label[for="${id}"]`);
              const wrappedInLabel = element.closest('label');
              if (!hasLabel && !wrappedInLabel && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
                warnings.push(`Input missing associated label: <input type="${type}">`);
              }
            }
          }

          // Check for void elements with closing tags (handled by parser but good to note)
          // Check for required attributes
          const tagName = element.tagName.toLowerCase();
          if (tagName === 'html' && !element.hasAttribute('lang')) {
            warnings.push(`Missing "lang" attribute on <html>`);
          }
          if (tagName === 'meta' && element.getAttribute('charset') === null && !element.hasAttribute('http-equiv')) {
            warnings.push(`<meta> should have charset or http-equiv attribute`);
          }
        }

        node.childNodes.forEach(child => walk(child, depth + 1));
      };

      walk(doc.documentElement);

      // Check for DOCTYPE
      if (!htmlInput.trim().toLowerCase().startsWith('<!doctype')) {
        warnings.push('Missing DOCTYPE declaration');
      }

      // Check for language
      const htmlEl = doc.documentElement;
      if (htmlEl.tagName.toLowerCase() === 'html' && !htmlEl.hasAttribute('lang')) {
        warnings.push('Missing lang attribute on <html> element');
      }

      // Check viewport meta
      const viewportMeta = doc.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        warnings.push('Missing viewport meta tag for responsive design');
      }

      // Check charset
      const charsetMeta = doc.querySelector('meta[charset]');
      const contentTypeMeta = doc.querySelector('meta[http-equiv="Content-Type"]');
      if (!charsetMeta && !contentTypeMeta) {
        warnings.push('Missing character encoding declaration (charset meta tag)');
      }

      setValidationResult({
        valid: errors.length === 0,
        errors,
        warnings,
        stats: {
          elements: elementCount,
          attributes: attributeCount,
          depth: maxDepth
        }
      });
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown validation error';
      setValidationResult({
        valid: false,
        errors: [error],
        warnings: [],
        stats: null
      });
    }
  }, [htmlInput]);

  const loadExample = useCallback((type: 'valid' | 'invalid' | 'complex') => {
    setHtmlInput(examples[type]);
    setExampleType(type);
    setActiveTab('validate');
    // Trigger validation
    setTimeout(() => validateHtml(), 0);
  }, [validateHtml]);

  const clearAll = useCallback(() => {
    setHtmlInput('');
    setValidationResult(null);
  }, []);

  const copyErrors = useCallback(() => {
    if (validationResult) {
      const allIssues = [
        ...validationResult.errors.map(e => `Error: ${e}`),
        ...validationResult.warnings.map(w => `Warning: ${w}`)
      ];
      navigator.clipboard.writeText(allIssues.join('\n'));
    }
  }, [validationResult]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>HTML Validator</h2>
        <p className="tool-desc">
          Validate HTML5 markup for syntax errors, accessibility issues, and best practices. Check compliance with W3C standards.
        </p>
      </div>

      <div className="tabs">
        <button
          className={activeTab === 'validate' ? 'active' : ''}
          onClick={() => setActiveTab('validate')}
        >
          Validate HTML
        </button>
        <button
          className={activeTab === 'examples' ? 'active' : ''}
          onClick={() => setActiveTab('examples')}
        >
          Examples
        </button>
      </div>

      {activeTab === 'validate' && (
        <div className="tool-grid">
          <div className="panel">
            <div className="panel-header">
              <h3>HTML Input</h3>
              <div className="panel-actions">
                <select
                  value={exampleType}
                  onChange={e => loadExample(e.target.value as 'valid' | 'invalid' | 'complex')}
                  className="example-select"
                >
                  <option value="valid">✓ Valid HTML5</option>
                  <option value="invalid">✗ Invalid HTML</option>
                  <option value="complex">📋 Complex Valid</option>
                </select>
              </div>
            </div>
            <textarea
              value={htmlInput}
              onChange={e => setHtmlInput(e.target.value)}
              placeholder="Paste your HTML here..."
              className="code-editor"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {activeTab === 'examples' && (
        <div className="schema-examples">
          {Object.entries(examples).map(([key, value]) => (
            <div key={key} className="schema-example-card">
              <div className="schema-example-header">
                <h4>{key.charAt(0).toUpperCase() + key.slice(1)} Example</h4>
                <button
                  className="copy-btn"
                  onClick={() => loadExample(key as 'valid' | 'invalid' | 'complex')}
                >
                  Load & Validate
                </button>
              </div>
              <pre className="schema-preview"><code>{value}</code></pre>
            </div>
          ))}
        </div>
      )}

      <div className="action-bar">
        <button className="primary-btn" onClick={validateHtml} disabled={!htmlInput.trim()}>
          Validate
        </button>
        <button className="secondary-btn" onClick={clearAll}>
          Clear All
        </button>
      </div>

      {validationResult && (
        <div className={`result-panel ${validationResult.valid ? 'success' : 'error'}`}>
          <div className="result-header">
            <span className={validationResult.valid ? 'valid-badge' : 'invalid-badge'}>
              {validationResult.valid ? '✓ Valid HTML' : '✗ Invalid HTML'}
            </span>
            {(validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
              <button className="copy-btn" onClick={copyErrors}>
                Copy Issues
              </button>
            )}
          </div>

          {validationResult.stats && (
            <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-value">{validationResult.stats.elements}</span>
                <span className="stat-label">Elements</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{validationResult.stats.attributes}</span>
                <span className="stat-label">Attributes</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{validationResult.stats.depth}</span>
                <span className="stat-label">Max Depth</span>
              </div>
            </div>
          )}

          {validationResult.errors.length > 0 && (
            <div className="errors-list">
              <h4>Errors ({validationResult.errors.length})</h4>
              {validationResult.errors.map((error, i) => (
                <div key={i} className="error-item">
                  <span className="error-number">{i + 1}.</span>
                  <span className="error-message">{error}</span>
                </div>
              ))}
            </div>
          )}

          {validationResult.warnings.length > 0 && (
            <div className="warnings-list">
              <h4>Warnings ({validationResult.warnings.length})</h4>
              {validationResult.warnings.map((warning, i) => (
                <div key={i} className="warning-item">
                  <span className="warning-number">{i + 1}.</span>
                  <span className="warning-message">{warning}</span>
                </div>
              ))}
            </div>
          )}

          {validationResult.valid && validationResult.warnings.length === 0 && (
            <div className="success-message">
              <p>No errors or warnings found. Your HTML is valid and follows best practices!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}