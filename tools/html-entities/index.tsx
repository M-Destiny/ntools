import { useState, useMemo } from 'react';

export default function HTMLEntities() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ original: 0, converted: 0 });

  // HTML entity map for encoding
  const entityMap: Record<string, string> = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '&apos;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  // Extended entities for encoding (special characters)
  const extendedEntities: Record<string, string> = {
    ' ': '&nbsp;',
    '¡': '&iexcl;',
    '¢': '&cent;',
    '£': '&pound;',
    '¤': '&curren;',
    '¥': '&yen;',
    '¦': '&brvbar;',
    '§': '&sect;',
    '¨': '&uml;',
    '©': '&copy;',
    'ª': '&ordf;',
    '«': '&laquo;',
    '¬': '&not;',
    '­': '&shy;',
    '®': '&reg;',
    '¯': '&macr;',
    '°': '&deg;',
    '±': '&plusmn;',
    '²': '&sup2;',
    '³': '&sup3;',
    '´': '&acute;',
    'µ': '&micro;',
    '¶': '&para;',
    '·': '&middot;',
    '¸': '&cedil;',
    '¹': '&sup1;',
    'º': '&ordm;',
    '»': '&raquo;',
    '¼': '&frac14;',
    '½': '&frac12;',
    '¾': '&frac34;',
    '¿': '&iquest;',
    'À': '&Agrave;',
    'Á': '&Aacute;',
    'Â': '&Acirc;',
    'Ã': '&Atilde;',
    'Ä': '&Auml;',
    'Å': '&Aring;',
    'Æ': '&AElig;',
    'Ç': '&Ccedil;',
    'È': '&Egrave;',
    'É': '&Eacute;',
    'Ê': '&Ecirc;',
    'Ë': '&Euml;',
    'Ì': '&Igrave;',
    'Í': '&Iacute;',
    'Î': '&Icirc;',
    'Ï': '&Iuml;',
    'Ð': '&ETH;',
    'Ñ': '&Ntilde;',
    'Ò': '&Ograve;',
    'Ó': '&Oacute;',
    'Ô': '&Ocirc;',
    'Õ': '&Otilde;',
    'Ö': '&Ouml;',
    '×': '&times;',
    'Ø': '&Oslash;',
    'Ù': '&Ugrave;',
    'Ú': '&Uacute;',
    'Û': '&Ucirc;',
    'Ü': '&Uuml;',
    'Ý': '&Yacute;',
    'Þ': '&THORN;',
    'ß': '&szlig;',
    'à': '&agrave;',
    'á': '&aacute;',
    'â': '&acirc;',
    'ã': '&atilde;',
    'ä': '&auml;',
    'å': '&aring;',
    'æ': '&aelig;',
    'ç': '&ccedil;',
    'è': '&egrave;',
    'é': '&eacute;',
    'ê': '&ecirc;',
    'ë': '&euml;',
    'ì': '&igrave;',
    'í': '&iacute;',
    'î': '&icirc;',
    'ï': '&iuml;',
    'ð': '&eth;',
    'ñ': '&ntilde;',
    'ò': '&ograve;',
    'ó': '&oacute;',
    'ô': '&ocirc;',
    'õ': '&otilde;',
    'ö': '&ouml;',
    '÷': '&divide;',
    'ø': '&oslash;',
    'ù': '&ugrave;',
    'ú': '&uacute;',
    'û': '&ucirc;',
    'ü': '&uuml;',
    'ý': '&yacute;',
    'þ': '&thorn;',
    'ÿ': '&yuml;',
  };

  // Reverse map for decoding
  const decodeMap: Record<string, string> = Object.fromEntries(
    Object.entries({ ...entityMap, ...extendedEntities }).map(([k, v]) => [v, k])
  );

  // Also add numeric entity decoding
  const numericEntityRegex = /&#(\d+);|&#x([0-9a-fA-F]+);/g;

  const encode = (text: string): string => {
    return text
      .split('')
      .map(char => entityMap[char] || extendedEntities[char] || char)
      .join('');
  };

  const decode = (text: string): string => {
    return text
      .replace(/&[a-zA-Z]+;/g, match => decodeMap[match] || match)
      .replace(numericEntityRegex, (match, dec, hex) => {
        if (dec) return String.fromCharCode(parseInt(dec, 10));
        if (hex) return String.fromCharCode(parseInt(hex, 16));
        return match;
      });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    
    if (value.trim()) {
      try {
        const result = mode === 'encode' ? encode(value) : decode(value);
        setOutput(result);
        
        const originalSize = new Blob([value]).size;
        const convertedSize = new Blob([result]).size;
        setStats({ original: originalSize, converted: convertedSize });
      } catch (e) {
        setOutput('Error processing text');
        setStats({ original: 0, converted: 0 });
      }
    } else {
      setOutput('');
      setStats({ original: 0, converted: 0 });
    }
  };

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    if (input.trim()) {
      const result = newMode === 'encode' ? encode(input) : decode(input);
      setOutput(result);
      
      const originalSize = new Blob([input]).size;
      const convertedSize = new Blob([result]).size;
      setStats({ original: originalSize, converted: convertedSize });
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
    if (mode === 'encode') {
      const example = `<div class="container">
  <h1>Hello, World!</h1>
  <p>This is a "test" with special chars: <>&"'</p>
  <a href="/path?key=value&other=123">Link</a>
</div>`;
      setInput(example);
    } else {
      const example = `<div class="container">
  <h1>Hello, World!</h1>
  <p>This is a "test" with special chars: <>&"'</p>
  <a href="/path?key=value&other=123">Link</a>
</div>`;
      setInput(example);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setStats({ original: 0, converted: 0 });
  };

  const swap = () => {
    setInput(output);
    setOutput(input);
    setMode(mode === 'encode' ? 'decode' : 'encode');
    const temp = stats.original;
    setStats({ original: stats.converted, converted: temp });
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const entityCount = useMemo(() => {
    if (mode === 'encode') {
      return (output.match(/&[a-zA-Z]+;/g) || []).length + 
             (output.match(/&#\d+;/g) || []).length +
             (output.match(/&#x[0-9a-fA-F]+;/g) || []).length;
    }
    return (input.match(/&[a-zA-Z]+;/g) || []).length + 
           (input.match(/&#\d+;/g) || []).length +
           (input.match(/&#x[0-9a-fA-F]+;/g) || []).length;
  }, [input, output, mode]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>HTML Entities Encoder/Decoder</h2>
        <p className="tool-desc">
          Convert special characters to HTML entities and vice versa. 
          Essential for safely displaying HTML in web pages and preventing XSS.
        </p>
      </div>

      <div className="mode-toggle">
        <button
          className={mode === 'encode' ? 'active' : ''}
          onClick={() => handleModeChange('encode')}
        >
          Encode (Text → Entities)
        </button>
        <button
          className={mode === 'decode' ? 'active' : ''}
          onClick={() => handleModeChange('decode')}
        >
          Decode (Entities → Text)
        </button>
      </div>

      <div className="entities-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>{mode === 'encode' ? 'Input Text' : 'Input Entities'}</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary" disabled={!input.trim()}>Clear</button>
            </div>
          </div>

          <textarea
            className="code-input"
            value={input}
            onChange={handleInputChange}
            placeholder={mode === 'encode' 
              ? 'Paste text to convert to HTML entities...' 
              : 'Paste HTML entities to decode...'}
            spellCheck={false}
            rows={18}
          />

          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-label">Original:</span>
              <span className="stat-value">{formatBytes(stats.original)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Converted:</span>
              <span className="stat-value">{formatBytes(stats.converted)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Entities:</span>
              <span className="stat-value">{entityCount}</span>
            </div>
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-toolbar">
            <h3>{mode === 'encode' ? 'Encoded Output' : 'Decoded Output'}</h3>
            <div className="preview-actions">
              <button onClick={copyToClipboard} className={copied ? 'copied' : 'btn-primary'} disabled={!output.trim()}>
                {copied ? '✓ Copied!' : 'Copy Output'}
              </button>
              <button onClick={swap} className="btn-secondary" disabled={!output.trim()}>
                Swap
              </button>
            </div>
          </div>

          <textarea
            className="code-output"
            value={output}
            readOnly
            spellCheck={false}
            rows={18}
          />

          {output && (
            <div className="output-info">
              <p>
                {mode === 'encode' 
                  ? 'HTML entities ready to use. Safe for embedding in HTML attributes and content.' 
                  : 'Decoded text ready to use. All entities have been converted to characters.'}
              </p>
            </div>
          )}

          <div className="info-section">
            <details>
              <summary>HTML Entities Reference</summary>
              <div className="help-content">
                <h4>Common Entities (Always Encoded):</h4>
                <table className="entity-table">
                  <thead>
                    <tr><th>Char</th><th>Entity</th><th>Name</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>{String.fromCharCode(38)}</td><td><code>{String.fromCharCode(38)}</code></td><td>Ampersand</td></tr>
                    <tr><td>{String.fromCharCode(60)}</td><td><code>{String.fromCharCode(60)}</code></td><td>Less-than</td></tr>
                    <tr><td>{String.fromCharCode(62)}</td><td><code>{String.fromCharCode(62)}</code></td><td>Greater-than</td></tr>
                    <tr><td>{String.fromCharCode(34)}</td><td><code>{String.fromCharCode(34)}</code></td><td>Double quote</td></tr>
                    <tr><td>{String.fromCharCode(39)}</td><td><code>&apos;</code></td><td>Single quote</td></tr>
                    <tr><td>{String.fromCharCode(47)}</td><td><code>&#x2F;</code></td><td>Forward slash</td></tr>
                  </tbody>
                </table>

                <h4>Extended Entities (Optional):</h4>
                <ul>
                  <li><code>&nbsp;</code> — Non-breaking space</li>
                  <li><code>&copy;</code> — © Copyright</li>
                  <li><code>&reg;</code> — ® Registered trademark</li>
                  <li><code>&trade;</code> — ™ Trademark</li>
                  <li><code>&euro;</code> — € Euro</li>
                  <li><code>&pound;</code> — £ Pound</li>
                  <li><code>&yen;</code> — ¥ Yen</li>
                  <li>And many more (Latin-1 supplement, symbols, arrows, etc.)</li>
                </ul>

                <h4>Numeric Entities:</h4>
                <ul>
                  <li>Decimal: <code>&#65;</code> → A</li>
                  <li>Hexadecimal: <code>&#x41;</code> → A</li>
                  <li>Supports all Unicode code points</li>
                </ul>

                <h4>When to Use:</h4>
                <ul>
                  <li><strong>Encode:</strong> User-generated content, data attributes, JSON in HTML, preventing XSS</li>
                  <li><strong>Decode:</strong> Processing HTML from APIs, cleaning stored entities, displaying raw HTML</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}