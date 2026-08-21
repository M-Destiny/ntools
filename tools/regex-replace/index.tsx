import { useState, useMemo } from 'react';

export default function RegexReplace() {
  const [input, setInput] = useState('');
  const [pattern, setPattern] = useState('');
  const [replacement, setReplacement] = useState('');
  const [flags, setFlags] = useState('g');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const process = useMemo(() => {
    setError(null);
    if (!pattern) {
      setMatchCount(0);
      return input;
    }
    try {
      const regex = new RegExp(pattern, flags);
      const matches = input.match(regex);
      setMatchCount(matches ? matches.length : 0);
      return input.replace(regex, replacement);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid regex pattern');
      setMatchCount(0);
      return '';
    }
  }, [input, pattern, replacement, flags]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadExample = () => {
    setInput('The quick brown fox jumps over the lazy dog. The fox is quick.');
    setPattern('fox');
    setReplacement('cat');
    setFlags('gi');
  };

  const clearAll = () => {
    setInput('');
    setPattern('');
    setReplacement('');
    setOutput('');
    setError(null);
    setMatchCount(0);
  };

  const commonPatterns = [
    { label: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { label: 'URL', pattern: 'https?://[^\\s]+' },
    { label: 'IP Address', pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b' },
    { label: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
    { label: 'Phone (US)', pattern: '\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b' },
    { label: 'Whitespace', pattern: '\\s+' },
    { label: 'Digits', pattern: '\\d+' },
    { label: 'Words', pattern: '\\b\\w+\\b' },
  ];

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Regex Find & Replace</h2>
        <p className="tool-desc">Find and replace text using regular expressions. Supports capture groups in replacement ($1, $2, etc.).</p>
      </div>

      <div className="regex-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input Text</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary" disabled={!input.trim() && !pattern}>Clear All</button>
            </div>
          </div>

          <textarea
            className="code-input"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter text to process..."
            spellCheck={false}
            rows={12}
          />
        </div>

        <div className="controls-panel">
          <div className="control-group">
            <label>Pattern</label>
            <input
              type="text"
              className="regex-input"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="Enter regex pattern..."
              spellCheck={false}
            />
          </div>

          <div className="control-group">
            <label>Replacement</label>
            <input
              type="text"
              className="regex-input"
              value={replacement}
              onChange={e => setReplacement(e.target.value)}
              placeholder="Replacement text (use $1, $2 for groups)..."
              spellCheck={false}
            />
            <p className="hint">Use $1, $2, etc. for capture groups. $$ for literal $.</p>
          </div>

          <div className="control-group">
            <label>Flags</label>
            <div className="flag-toggles">
              {[
                { value: 'g', label: 'Global (g)', desc: 'Replace all occurrences' },
                { value: 'i', label: 'Case-insensitive (i)', desc: 'Ignore case' },
                { value: 'm', label: 'Multiline (m)', desc: '^ and $ match line breaks' },
                { value: 's', label: 'DotAll (s)', desc: '. matches newlines' },
              ].map(f => (
                <label key={f.value} className="flag-toggle">
                  <input
                    type="checkbox"
                    checked={flags.includes(f.value)}
                    onChange={e => setFlags(e.target.checked ? flags + f.value : flags.replace(f.value, ''))}
                  />
                  <span title={f.desc}>{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="common-patterns">
            <label>Common Patterns</label>
            <div className="pattern-chips">
              {commonPatterns.map(p => (
                <button
                  key={p.pattern}
                  className="pattern-chip"
                  onClick={() => { setPattern(p.pattern); setFlags('g'); }}
                  title={p.label}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-message">
              ✗ {error}
            </div>
          )}

          {pattern && !error && (
            <div className="match-info">
              {matchCount > 0 ? `✓ ${matchCount} match${matchCount !== 1 ? 'es' : ''} found` : 'No matches'}
            </div>
          )}
        </div>

        <div className="preview-panel">
          <div className="preview-toolbar">
            <h3>Result</h3>
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
              <p>{input.length} → {output.length} characters</p>
            </div>
          )}

          <div className="info-section">
            <details>
              <summary>Replacement Syntax Reference</summary>
              <div className="help-content">
                <table>
                  <thead>
                    <tr><th>Syntax</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    <tr><td><code>$$</code></td><td>Literal $ character</td></tr>
                    <tr><td><code>$&</code></td><td>The matched substring</td></tr>
                    <tr><td><code>$`</code></td><td>Text before the match</td></tr>
                    <tr><td><code>$'</code></td><td>Text after the match</td></tr>
                    <tr><td><code>$n</code></td><td>nth capture group (1-99)</td></tr>
                    <tr><td><code>$<n></code></td><td>Named capture group</td></tr>
                  </tbody>
                </table>
                <h4>Flag Reference</h4>
                <ul>
                  <li><strong>g</strong> - Global: replace all matches, not just first</li>
                  <li><strong>i</strong> - Ignore case</li>
                  <li><strong>m</strong> - Multiline: ^ and $ match start/end of each line</li>
                  <li><strong>s</strong> - DotAll: . matches newlines</li>
                  <li><strong>u</strong> - Unicode: treat pattern as Unicode code points</li>
                  <li><strong>y</strong> - Sticky: match only from lastIndex</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}