import { useState, useEffect } from 'react';

export default function NumberBaseConverter() {
  const [input, setInput] = useState('');
  const [inputBase, setInputBase] = useState<'bin' | 'oct' | 'dec' | 'hex'>('dec');
  const [outputBases, setOutputBases] = useState<Record<'bin' | 'oct' | 'dec' | 'hex', string>>({
    bin: '',
    oct: '',
    dec: '',
    hex: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const parseInput = (value: string, base: 'bin' | 'oct' | 'dec' | 'hex'): number | null => {
    try {
      const radix = { bin: 2, oct: 8, dec: 10, hex: 16 }[base];
      const cleaned = value.replace(/[_\s]/g, '').toLowerCase();
      if (!cleaned) return null;
      
      // Handle prefixes
      let numStr = cleaned;
      if ((base === 'bin' && cleaned.startsWith('0b')) ||
          (base === 'oct' && cleaned.startsWith('0o')) ||
          (base === 'hex' && cleaned.startsWith('0x'))) {
        numStr = cleaned.slice(2);
      }
      
      const parsed = parseInt(numStr, radix);
      return isNaN(parsed) ? null : parsed;
    } catch {
      return null;
    }
  };

  const formatOutput = (value: number | null, base: 'bin' | 'oct' | 'dec' | 'hex'): string => {
    if (value === null) return '';
    const prefixes = { bin: '0b', oct: '0o', dec: '', hex: '0x' };
    const formatted = value.toString({ bin: 2, oct: 8, dec: 10, hex: 16 }[base]).toUpperCase();
    return prefixes[base] + formatted;
  };

  useEffect(() => {
    setError(null);
    const parsed = parseInput(input, inputBase);
    
    if (input.trim() && parsed === null) {
      setError(`Invalid ${inputBase.toUpperCase()} number`);
      setOutputBases({ bin: '', oct: '', dec: '', hex: '' });
    } else if (parsed !== null) {
      setOutputBases({
        bin: formatOutput(parsed, 'bin'),
        oct: formatOutput(parsed, 'oct'),
        dec: formatOutput(parsed, 'dec'),
        hex: formatOutput(parsed, 'hex')
      });
    } else {
      setOutputBases({ bin: '', oct: '', dec: '', hex: '' });
    }
  }, [input, inputBase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setError(null);
  };

  const copyToClipboard = (base: 'bin' | 'oct' | 'dec' | 'hex') => {
    const value = outputBases[base];
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(base);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const clearAll = () => {
    setInput('');
    setOutputBases({ bin: '', oct: '', dec: '', hex: '' });
    setError(null);
  };

  const loadExample = () => {
    setInput('255');
    setInputBase('dec');
  };

  const bases: Array<{ key: 'bin' | 'oct' | 'dec' | 'hex'; label: string; prefix: string }> = [
    { key: 'bin', label: 'Binary (base 2)', prefix: '0b' },
    { key: 'oct', label: 'Octal (base 8)', prefix: '0o' },
    { key: 'dec', label: 'Decimal (base 10)', prefix: '' },
    { key: 'hex', label: 'Hexadecimal (base 16)', prefix: '0x' }
  ];

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Number Base Converter</h2>
        <p className="tool-desc">Convert numbers between binary, octal, decimal, and hexadecimal. Supports prefixes (0b, 0o, 0x) and underscores for readability.</p>
      </div>

      <div className="converter-input">
        <div className="input-section">
          <label>Input Base</label>
          <div className="base-buttons">
            {bases.map(b => (
              <button
                key={b.key}
                className={inputBase === b.key ? 'active' : ''}
                onClick={() => setInputBase(b.key as typeof inputBase)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="input-section">
          <label>Value</label>
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={`Enter ${inputBase.toUpperCase()} number...`}
              className="number-input"
              spellCheck={false}
            />
            {input && <button onClick={clearAll} className="clear-btn" title="Clear">✕</button>}
          </div>
        </div>
        
        <div className="input-section">
          <button onClick={loadExample} className="btn-secondary">Load Example (255)</button>
        </div>
      </div>

      {error && <div className="error-banner">✗ {error}</div>}

      <div className="converter-outputs">
        {bases.map(b => (
          <div key={b.key} className={`output-row ${inputBase === b.key ? 'input-base' : ''}`}>
            <div className="output-label">
              <span className="base-badge">{b.prefix}{b.label.split(' ')[0].toUpperCase()}</span>
              <span>{b.label}</span>
            </div>
            <div className="output-value-wrapper">
              <input
                type="text"
                value={outputBases[b.key]}
                readOnly
                className="output-value"
              />
              <button
                onClick={() => copyToClipboard(b.key)}
                className={copied === b.key ? 'copied' : 'copy-btn'}
                title="Copy to clipboard"
                disabled={!outputBases[b.key]}
              >
                {copied === b.key ? '✓' : '📋'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="converter-info">
        <details>
          <summary>About Number Bases</summary>
          <ul>
            <li><strong>Binary (base 2):</strong> Uses 0-1, prefix 0b. Used in low-level computing.</li>
            <li><strong>Octal (base 8):</strong> Uses 0-7, prefix 0o. Historical Unix permissions.</li>
            <li><strong>Decimal (base 10):</strong> Uses 0-9, no prefix. Human-standard numbering.</li>
            <li><strong>Hexadecimal (base 16):</strong> Uses 0-9, A-F, prefix 0x. Common in programming, colors, memory addresses.</li>
            <li>Underscores are ignored for readability (e.g., 0xFF_EE_DD)</li>
            <li>JavaScript supports up to 53-bit integers (Number.MAX_SAFE_INTEGER)</li>
          </ul>
        </details>
      </div>
    </div>
  );
}