import { useState, useMemo, useCallback } from 'react';

interface SlugOptions {
  lowercase: boolean;
  separator: string;
  maxLength: number;
  removeStopwords: boolean;
  customReplacements: Record<string, string>;
  preserveUnicode: boolean;
  strict: boolean;
}

const DEFAULT_STOPWORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in',
  'into', 'is', 'it', 'no', 'not', 'of', 'on', 'or', 'such',
  'that', 'the', 'their', 'then', 'there', 'these', 'they',
  'this', 'to', 'was', 'will', 'with', 'from', 'be', 'been',
  'has', 'have', 'had', 'do', 'does', 'did', 'can', 'could',
  'should', 'would', 'may', 'might', 'must', 'shall'
]);

const DEFAULT_REPLACEMENTS: Record<string, string> = {
  '&': 'and',
  '@': 'at',
  '#': 'hash',
  '$': 'dollar',
  '%': 'percent',
  '+': 'plus',
  '=': 'equals',
  '?': '',
  '!': '',
  '.': '',
  ',': '',
  ':': '',
  ';': '',
  '*': '',
  '^': '',
  '~': '',
  '`': '',
  '|': '',
  '\\': '',
  '/': '',
  '(': '',
  ')': '',
  '[': '',
  ']': '',
  '{': '',
  '}': '',
  '"': '',
  "'": '',
  '<': '',
  '>': '',
};

export default function SlugGenerator() {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<SlugOptions>({
    lowercase: true,
    separator: '-',
    maxLength: 0,
    removeStopwords: false,
    customReplacements: {},
    preserveUnicode: false,
    strict: true,
  });
  const [slug, setSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const generateSlug = useCallback((text: string, opts: SlugOptions): string => {
    if (!text.trim()) return '';

    let result = text;

    // Apply custom replacements first
    Object.entries(opts.customReplacements).forEach(([from, to]) => {
      const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(escaped, 'g'), to);
    });

    // Apply default replacements for special chars
    if (opts.strict) {
      Object.entries(DEFAULT_REPLACEMENTS).forEach(([from, to]) => {
        if (from !== '/' && from !== '\\') { // Keep slashes for now
          const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          result = result.replace(new RegExp(escaped, 'g'), to);
        }
      });
    }

    // Handle unicode
    if (!opts.preserveUnicode) {
      // Normalize and remove diacritics
      result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    // Convert to lowercase
    if (opts.lowercase) {
      result = result.toLowerCase();
    }

    // Replace spaces and special chars with separator
    const separator = opts.separator || '-';
    const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Replace non-alphanumeric (and non-unicode if preserved) with separator
    const allowedChars = opts.preserveUnicode 
      ? `\\p{L}\\p{N}${escapedSeparator}` 
      : `a-z0-9${escapedSeparator}`;
    
    result = result.replace(new RegExp(`[^${allowedChars}]+`, opts.preserveUnicode ? 'gu' : 'g'), separator);

    // Remove stopwords if enabled
    if (opts.removeStopwords) {
      const words = result.split(separator).filter(w => w && !DEFAULT_STOPWORDS.has(w));
      result = words.join(separator);
    }

    // Trim separators from start/end
    result = result.replace(new RegExp(`^${escapedSeparator}+|${escapedSeparator}+$`, 'g'), '');

    // Collapse multiple separators
    result = result.replace(new RegExp(`${escapedSeparator}{2,}`, 'g'), separator);

    // Truncate to max length
    if (opts.maxLength > 0 && result.length > opts.maxLength) {
      result = result.slice(0, opts.maxLength);
      // Don't end with separator
      result = result.replace(new RegExp(`${escapedSeparator}+$`, 'g'), '');
    }

    return result;
  }, []);

  // Generate slug on input/options change
  useMemo(() => {
    const generated = generateSlug(input, options);
    setSlug(generated);
  }, [input, options, generateSlug]);

  const addToHistory = (s: string) => {
    if (!s) return;
    setHistory(prev => {
      const filtered = prev.filter(h => h !== s);
      return [s, ...filtered].slice(0, 10);
    });
  };

  const copyToClipboard = () => {
    if (!slug) return;
    navigator.clipboard.writeText(slug);
    setCopied(true);
    addToHistory(slug);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = (type: string) => {
    const examples: Record<string, string> = {
      blog: 'How to Build a Modern React Application with TypeScript',
      product: 'Wireless Bluetooth Headphones - Noise Cancelling (Black)',
      api: 'GET /api/v1/users/:id/profile?include=posts&limit=10',
      file: 'My Document (Final Version 2).pdf',
      title: 'The Quick Brown Fox Jumps Over the Lazy Dog!',
      unicode: 'Café & Résumé — naïve façade',
      long: 'This is a very long title that exceeds the maximum length limit and should be truncated properly when the max length option is enabled',
    };
    setInput(examples[type] || '');
  };

  const updateOption = <K extends keyof SlugOptions>(key: K, value: SlugOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const addCustomReplacement = () => {
    const from = prompt('Character/string to replace:');
    if (!from) return;
    const to = prompt(`Replace "${from}" with:`) || '';
    setOptions(prev => ({
      ...prev,
      customReplacements: { ...prev.customReplacements, [from]: to }
    }));
  };

  const removeCustomReplacement = (key: string) => {
    setOptions(prev => {
      const next = { ...prev.customReplacements };
      delete next[key];
      return { ...prev, customReplacements: next };
    });
  };

  const clearHistory = () => setHistory([]);

  // Preview variants
  const variants = useMemo(() => {
    if (!slug) return [];
    return [
      { label: 'kebab-case', value: slug },
      { label: 'snake_case', value: slug.replace(/-/g, '_') },
      { label: 'camelCase', value: slug.split('-').map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('') },
      { label: 'PascalCase', value: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('') },
      { label: 'UPPER_CASE', value: slug.replace(/-/g, '_').toUpperCase() },
      { label: 'no-separator', value: slug.replace(/-/g, '') },
    ];
  }, [slug]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Slug Generator</h2>
        <p className="tool-desc">Create URL-friendly slugs from text. Configure separators, casing, stopwords, length limits, and custom replacements.</p>
      </div>

      <div className="slug-layout">
        <div className="input-panel">
          <div className="input-toolbar">
            <h3>Input Text</h3>
            <div className="toolbar-actions">
              <button onClick={() => { setInput(''); setSlug(''); }} className="btn-secondary">Clear</button>
            </div>
          </div>

          <textarea
            className="slug-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Enter text to convert to a slug..."
            spellCheck={false}
            rows={4}
          />

          <div className="example-buttons">
            <h4>Examples</h4>
            <div className="example-grid">
              {Object.keys({
                blog: 'Blog Title',
                product: 'Product Name',
                api: 'API Endpoint',
                file: 'Filename',
                title: 'Article Title',
                unicode: 'Unicode Text',
                long: 'Long Text',
              }).map(key => (
                <button key={key} className="btn-example" onClick={() => loadExample(key)}>
                  {({ blog: 'Blog', product: 'Product', api: 'API', file: 'File', title: 'Title', unicode: 'Unicode', long: 'Long' } as Record<string, string>)[key]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="options-panel">
          <div className="control-group">
            <label>Separator</label>
            <select
              value={options.separator}
              onChange={e => updateOption('separator', e.target.value)}
              className="option-select"
            >
              <option value="-">- (kebab-case)</option>
              <option value="_">_ (snake_case)</option>
              <option value="">(none)</option>
              <option value=".">. (dot)</option>
              <option value="~">~ (tilde)</option>
            </select>
          </div>

          <div className="control-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={options.lowercase}
                onChange={e => updateOption('lowercase', e.target.checked)}
              />
              Lowercase
            </label>
            <label>
              <input
                type="checkbox"
                checked={options.removeStopwords}
                onChange={e => updateOption('removeStopwords', e.target.checked)}
              />
              Remove stopwords (a, the, and, etc.)
            </label>
            <label>
              <input
                type="checkbox"
                checked={options.preserveUnicode}
                onChange={e => updateOption('preserveUnicode', e.target.checked)}
              />
              Preserve Unicode (keep accents)
            </label>
            <label>
              <input
                type="checkbox"
                checked={options.strict}
                onChange={e => updateOption('strict', e.target.checked)}
              />
              Strict mode (remove special chars)
            </label>
          </div>

          <div className="control-group">
            <label>Max Length: {options.maxLength || 'unlimited'}</label>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={options.maxLength}
              onChange={e => updateOption('maxLength', parseInt(e.target.value, 10))}
              className="length-slider"
            />
            <div className="length-presets">
              <button onClick={() => updateOption('maxLength', 0)}>None</button>
              <button onClick={() => updateOption('maxLength', 50)}>50</button>
              <button onClick={() => updateOption('maxLength', 100)}>100</button>
              <button onClick={() => updateOption('maxLength', 150)}>150</button>
            </div>
          </div>

          <details className="advanced-options" open={showAdvanced}>
            <summary onClick={() => setShowAdvanced(!showAdvanced)}>
              Advanced: Custom Replacements
            </summary>
            <div className="custom-replacements">
              {Object.entries(options.customReplacements).map(([from, to]) => (
                <div key={from} className="replacement-row">
                  <code>{from}</code>
                  <span>→</span>
                  <code>{to || '(remove)'}</code>
                  <button onClick={() => removeCustomReplacement(from)} className="btn-icon" title="Remove">✕</button>
                </div>
              ))}
              <button className="btn-secondary" onClick={addCustomReplacement}>+ Add Replacement</button>
            </div>
          </details>
        </div>
      </div>

      <div className="output-panel">
        <div className="output-toolbar">
          <h3>Generated Slug</h3>
          <div className="output-actions">
            <button 
              className={copied ? 'copied' : 'btn-primary'} 
              onClick={copyToClipboard}
              disabled={!slug}
            >
              {copied ? '✓ Copied!' : 'Copy Slug'}
            </button>
          </div>
        </div>

        {slug ? (
          <div className="slug-output">
            <code className="slug-value">{slug}</code>
            <div className="slug-meta">
              <span>Length: {slug.length} chars</span>
              <span>Words: {slug.split(options.separator || '-').filter(Boolean).length}</span>
              {options.maxLength > 0 && slug.length >= options.maxLength && (
                <span className="warning">Truncated to {options.maxLength}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>Enter text above to generate a slug</p>
          </div>
        )}

        {slug && (
          <div className="variants-section">
            <h4>Format Variants</h4>
            <div className="variants-grid">
              {variants.map(v => (
                <div key={v.label} className="variant-card">
                  <span className="variant-label">{v.label}</span>
                  <div className="variant-value">
                    <code>{v.value}</code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(v.value); }}
                      className="btn-icon"
                      title="Copy"
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="history-panel">
            <div className="history-header">
              <h4>Recent Slugs</h4>
              <button className="btn-secondary btn-sm" onClick={clearHistory}>Clear</button>
            </div>
            <div className="history-list">
              {history.map((h, i) => (
                <div key={i} className="history-item" onClick={() => { setInput(h); navigator.clipboard.writeText(h); }}>
                  <code>{h}</code>
                  <span className="history-action">Click to reuse</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="help-section">
        <details>
          <summary>Slug Best Practices</summary>
          <div className="help-content">
            <h4>Why Slugs Matter</h4>
            <ul>
              <li><strong>SEO</strong> — Clean URLs rank better and are more clickable</li>
              <li><strong>Sharing</strong> — Readable links get more clicks</li>
              <li><strong>Consistency</strong> — Predictable patterns across your site</li>
            </ul>

            <h4>Separator Choice</h4>
            <ul>
              <li><strong>kebab-case ( - )</strong> — Google-recommended, most readable</li>
              <li><strong>snake_case ( _ )</strong> — Common in APIs, Python</li>
              <li><strong>none</strong> — Shortest, but harder to read</li>
            </ul>

            <h4>Options Explained</h4>
            <ul>
              <li><strong>Lowercase</strong> — Prevents case-sensitivity issues on Linux servers</li>
              <li><strong>Remove stopwords</strong> — Shorter slugs, but may change meaning</li>
              <li><strong>Preserve Unicode</strong> — Keep accents (café → café), not ASCII (café → cafe)</li>
              <li><strong>Max length</strong> — Keep under 50-60 chars for full visibility in SERPs</li>
              <li><strong>Custom replacements</strong> — Handle brand-specific terms (& → and, @ → at)</li>
            </ul>

            <h4>Common Patterns</h4>
            <pre>{`Blog:     /blog/how-to-build-react-app
Product:  /shop/wireless-headphones-black
API:      /api/v1/users/123/profile
Category: /category/web-development`}</pre>
          </div>
        </details>
      </div>
    </div>
  );
}