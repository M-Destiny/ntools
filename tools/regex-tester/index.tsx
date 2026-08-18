import { useState, useMemo } from 'react';

export default function RegexTester() {
  const [pattern, setPattern] = useState('^\\d{3}-\\d{2}-\\d{4}$');
  const [flags, setFlags] = useState('gm');
  const [testString, setTestString] = useState('SSN: 123-45-6789\nPhone: 555-123-4567\nInvalid: 12-345-6789');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const regex = useMemo(() => {
    try {
      return new RegExp(pattern, flags);
    } catch {
      return null;
    }
  }, [pattern, flags]);

  const matches = useMemo(() => {
    if (!regex) return [];
    const results = [];
    let match;
    const globalRegex = new RegExp(pattern, flags + (flags.includes('g') ? '' : 'g'));
    while ((match = globalRegex.exec(testString)) !== null) {
      results.push({
        match: match[0],
        index: match.index,
        groups: match.slice(1),
        namedGroups: match.groups || {},
      });
      if (!flags.includes('g')) break;
    }
    return results;
  }, [regex, pattern, flags, testString]);

  const matchInfo = useMemo(() => {
    if (!regex) return null;
    const test = regex.test(testString);
    const exec = regex.exec(testString);
    return { test, exec: exec ? exec[0] : null };
  }, [regex, testString]);

  const explainPattern = () => {
    if (!pattern) return [];
    const parts: { char: string; meaning: string }[] = [];
    let i = 0;
    while (i < pattern.length) {
      const char = pattern[i];
      if (char === '\\' && i + 1 < pattern.length) {
        const next = pattern[i + 1];
        const meanings: Record<string, string> = {
          'd': 'Digit (0-9)',
          'D': 'Non-digit',
          'w': 'Word character (a-z, A-Z, 0-9, _)',
          'W': 'Non-word character',
          's': 'Whitespace',
          'S': 'Non-whitespace',
          'b': 'Word boundary',
          'B': 'Non-word boundary',
          'n': 'Newline',
          't': 'Tab',
          'r': 'Carriage return',
        };
        parts.push({ char: `\\${next}`, meaning: meanings[next] || `Escaped ${next}` });
        i += 2;
      } else if (char === '[') {
        let end = pattern.indexOf(']', i);
        if (end === -1) end = pattern.length - 1;
        parts.push({ char: pattern.slice(i, end + 1), meaning: 'Character class' });
        i = end + 1;
      } else if (char === '(') {
        let end = pattern.indexOf(')', i);
        if (end === -1) end = pattern.length - 1;
        parts.push({ char: pattern.slice(i, end + 1), meaning: 'Capture group' });
        i = end + 1;
      } else if ('^$.*+?{}()|[]\\'.includes(char)) {
        const meanings: Record<string, string> = {
          '^': 'Start of string/line',
          '$': 'End of string/line',
          '.': 'Any character (except newline)',
          '*': 'Zero or more',
          '+': 'One or more',
          '?': 'Zero or one (optional)',
          '{': 'Quantifier start',
          '|': 'Alternation (OR)',
          '(': 'Group start',
          ')': 'Group end',
          '[': 'Character class start',
          ']': 'Character class end',
          '\\': 'Escape',
        };
        parts.push({ char, meaning: meanings[char] || 'Special character' });
        i++;
      } else {
        parts.push({ char, meaning: `Literal "${char}"` });
        i++;
      }
    }
    return parts;
  };

  const loadExample = (type: string) => {
    const examples: Record<string, { pattern: string; flags: string; testString: string }> = {
      email: {
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        flags: 'gm',
        testString: 'user@example.com\ninvalid.email@\ntest+tag@domain.co.uk\nnot-an-email',
      },
      url: {
        pattern: 'https?://(?:[-\\w.]|(?:%[\\da-fA-F]{2}))+',
        flags: 'gm',
        testString: 'https://example.com\nhttp://localhost:3000\nftp://files.example.com\nnot-a-url',
      },
      phone: {
        pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}',
        flags: 'gm',
        testString: '(555) 123-4567\n555-123-4567\n555.123.4567\n555 123 4567\n123-4567',
      },
      date: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
        flags: 'gm',
        testString: '2026-08-18\n2025-12-25\n08/18/2026\nAug 18, 2026',
      },
      ip: {
        pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
        flags: 'gm',
        testString: '192.168.1.1\n10.0.0.1\n256.1.1.1\n172.16.254.1',
      },
    };
    const ex = examples[type];
    if (ex) {
      setPattern(ex.pattern);
      setFlags(ex.flags);
      setTestString(ex.testString);
    }
  };

  const clearAll = () => {
    setPattern('');
    setTestString('');
    setError(null);
  };

  const copyResults = () => {
    const output = matches.map(m => 
      `Match: "${m.match}" at index ${m.index}${m.groups.length ? ` | Groups: ${m.groups.join(', ')}` : ''}`
    ).join('\n');
    navigator.clipboard.writeText(output || 'No matches');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightMatches = () => {
    if (!regex || !testString) return <code>{testString}</code>;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    const globalRegex = new RegExp(pattern, flags + (flags.includes('g') ? '' : 'g'));
    let match;
    
    while ((match = globalRegex.exec(testString)) !== null) {
      if (match.index > lastIndex) {
        parts.push(testString.slice(lastIndex, match.index));
      }
      parts.push(<mark key={match.index}>{match[0]}</mark>);
      lastIndex = match.index + match[0].length;
      if (!flags.includes('g')) break;
    }
    
    if (lastIndex < testString.length) {
      parts.push(testString.slice(lastIndex));
    }
    
    return <code>{parts}</code>;
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Regex Tester</h2>
        <p className="tool-desc">Test and debug regular expressions with live matching, syntax explanation, and examples.</p>
      </div>

      <div className="regex-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Pattern & Flags</h3>
            <div className="toolbar-actions">
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>

          <div className="regex-inputs">
            <div className="input-group">
              <label>Pattern</label>
              <input
                type="text"
                className={`regex-pattern ${error ? 'error' : ''}`}
                value={pattern}
                onChange={e => { setPattern(e.target.value); setError(null); }}
                placeholder="Enter regex pattern..."
                spellCheck={false}
              />
              {error && <span className="error-message">✗ {error}</span>}
            </div>
            <div className="input-group">
              <label>Flags</label>
              <div className="flag-buttons">
                {['g', 'i', 'm', 's', 'u', 'y'].map(f => (
                  <button
                    key={f}
                    className={flags.includes(f) ? 'active' : ''}
                    onClick={() => setFlags(prev => prev.includes(f) ? prev.replace(f, '') : prev + f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="examples-section">
            <h4>Quick Examples</h4>
            <div className="example-buttons">
              {['email', 'url', 'phone', 'date', 'ip'].map(ex => (
                <button key={ex} className="btn-example" onClick={() => loadExample(ex)}>
                  {ex.charAt(0).toUpperCase() + ex.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="explanation-section">
            <h4>Pattern Explanation</h4>
            <div className="explanation-grid">
              {explainPattern().map((part, i) => (
                <div key={i} className="explanation-item">
                  <code>{part.char}</code>
                  <span>{part.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Test String</h3>
            <div className="toolbar-actions">
              <button onClick={copyResults} className={copied ? 'copied' : ''}>
                {copied ? '✓ Copied!' : 'Copy Matches'}
              </button>
            </div>
          </div>
          <textarea
            className="regex-test-input"
            value={testString}
            onChange={e => setTestString(e.target.value)}
            placeholder="Enter test string..."
            spellCheck={false}
          />
          
          <div className="match-result">
            <h4>Highlighted Matches</h4>
            <div className="highlighted-string">
              {highlightMatches()}
            </div>
          </div>

          <div className="match-details">
            <h4>Match Details ({matches.length} matches)</h4>
            {matches.length === 0 ? (
              <p className="no-matches">No matches found</p>
            ) : (
              <div className="matches-list">
                {matches.map((m, i) => (
                  <div key={i} className="match-item">
                    <div className="match-header">
                      <span className="match-text">"{m.match}"</span>
                      <span className="match-index">index {m.index}</span>
                    </div>
                    {m.groups.length > 0 && (
                      <div className="match-groups">
                        {m.groups.map((g, gi) => (
                          <span key={gi} className="group-badge">Group {gi + 1}: "{g}"</span>
                        ))}
                      </div>
                    )}
                    {Object.keys(m.namedGroups).length > 0 && (
                      <div className="match-named-groups">
                        {Object.entries(m.namedGroups).map(([name, value]) => (
                          <span key={name} className="group-badge">{name}: "{value}"</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="quick-test">
            <h4>Quick Test</h4>
            <div className="quick-test-result">
              {regex ? (
                <>
                  <div className={`test-badge ${matchInfo?.test ? 'pass' : 'fail'}`}>
                    {matchInfo?.test ? '✓ Pattern matches' : '✗ No match'}
                  </div>
                  {matchInfo?.exec && (
                    <div className="first-match">First match: "{matchInfo.exec}"</div>
                  )}
                </>
              ) : (
                <div className="test-badge error">✗ Invalid regex pattern</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}