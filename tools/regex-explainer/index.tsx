import { useState, useCallback, useEffect, useMemo } from 'react';

interface MatchResult {
  match: string;
  index: number;
  groups: Record<string, string>;
}

interface ExplainedPart {
  regex: string;
  description: string;
  type: 'literal' | 'charClass' | 'quantifier' | 'anchor' | 'group' | 'lookahead' | 'flag' | 'escape' | 'alternation' | 'boundary';
}

const FLAGS_INFO: Record<string, { name: string; description: string }> = {
  g: { name: 'Global', description: 'Find all matches, not just the first' },
  i: { name: 'Case Insensitive', description: 'Match uppercase and lowercase letters' },
  m: { name: 'Multiline', description: '^ and $ match start/end of each line' },
  s: { name: 'Dot All', description: '. matches newline characters' },
  u: { name: 'Unicode', description: 'Enable full Unicode matching' },
  y: { name: 'Sticky', description: 'Match only at the index indicated by lastIndex' },
  d: { name: 'Indices', description: 'Return match indices in result' },
};

const ESCAPE_SEQUENCES: Record<string, string> = {
  '\\n': 'Newline (LF)',
  '\\r': 'Carriage return (CR)',
  '\\t': 'Tab',
  '\\v': 'Vertical tab',
  '\\f': 'Form feed',
  '\\0': 'Null character',
  '\\\\': 'Literal backslash',
  '\\\'': 'Literal single quote',
  '\\"': 'Literal double quote',
  '\\/': 'Literal forward slash',
  '\\b': 'Word boundary',
  '\\B': 'Non-word boundary',
  '\\d': 'Digit [0-9]',
  '\\D': 'Non-digit [^0-9]',
  '\\w': 'Word character [a-zA-Z0-9_]',
  '\\W': 'Non-word character [^a-zA-Z0-9_]',
  '\\s': 'Whitespace [\\t\\n\\r\\f\\v ]',
  '\\S': 'Non-whitespace [^\\t\\n\\r\\f\\v ]',
  '\\cA': 'Control character (Ctrl+A)',
  '\\xNN': 'Hex character (2 digits)',
  '\\uNNNN': 'Unicode character (4 hex digits)',
  '\\u{N...}': 'Unicode code point (ES2018+)',
};

const CHAR_CLASS_ESCAPES: Record<string, string> = {
  '\\d': 'Digit [0-9]',
  '\\D': 'Non-digit [^0-9]',
  '\\w': 'Word character [a-zA-Z0-9_]',
  '\\W': 'Non-word character [^a-zA-Z0-9_]',
  '\\s': 'Whitespace [\\t\\n\\r\\f\\v ]',
  '\\S': 'Non-whitespace [^\\t\\n\\r\\f\\v ]',
  '\\b': 'Backspace (only in char class)',
  '\\p{...}': 'Unicode property (ES2018+)',
  '\\P{...}': 'Negated Unicode property (ES2018+)',
};

const EXAMPLES = {
  email: {
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    flags: '',
    testString: 'user@example.com\ninvalid.email\nanother@test.org',
    description: 'Email validation (basic RFC 5322 compatible)',
  },
  url: {
    pattern: 'https?://(?:[-\\w.]|(?:%[\\da-fA-F]{2}))+',
    flags: 'g',
    testString: 'Visit https://example.com and http://test.org/path?query=1',
    description: 'HTTP/URL matching',
  },
  phone: {
    pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}',
    flags: 'g',
    testString: 'Call 555-123-4567 or (555) 987-6543 or 555.111.2222',
    description: 'US phone number formats',
  },
  ipv4: {
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    testString: 'IPs: 192.168.1.1, 10.0.0.1, 256.1.1.1 (invalid), 8.8.8.8',
    description: 'IPv4 address validation',
  },
  date: {
    pattern: '\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b',
    flags: 'g',
    testString: 'Dates: 2024-01-15, 2024-13-01 (invalid), 2024-02-29 (leap)',
    description: 'ISO date format (YYYY-MM-DD)',
  },
  hexColor: {
    pattern: '#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b',
    flags: 'g',
    testString: 'Colors: #fff, #FF0000, #abc123, #ggg (invalid)',
    description: 'Hex color codes (3 or 6 digits)',
  },
  creditCard: {
    pattern: '\\b(?:\\d{4}[-.\\s]?){3}\\d{4}\\b',
    flags: 'g',
    testString: 'Cards: 4111-1111-1111-1111, 4111 1111 1111 1111',
    description: 'Credit card number format (16 digits)',
  },
  htmlTag: {
    pattern: '<([a-zA-Z][a-zA-Z0-9]*)\\b[^>]*>(.*?)</\\1>',
    flags: 'gs',
    testString: '<div class="test">Content</div><span>More</span>',
    description: 'HTML tag with content (capturing groups)',
  },
  password: {
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: '',
    testString: 'Password123!\nweak\nNoNumbers!\nNONUMBERS123!',
    description: 'Strong password: 8+ chars, upper, lower, digit, special',
  },
  uuid: {
    pattern: '\\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\b',
    flags: 'gi',
    testString: 'UUIDs: 550e8400-e29b-41d4-a716-446655440000, invalid-uuid',
    description: 'UUID v4 format',
  },
};

function parseRegex(pattern: string, flags: string): ExplainedPart[] {
  const parts: ExplainedPart[] = [];
  let i = 0;
  let inCharClass = false;
  let charClassStart = -1;
  let groupStack: { start: number; type: string }[] = [];

  while (i < pattern.length) {
    const char = pattern[i];
    const nextChar = pattern[i + 1];
    const nextNextChar = pattern[i + 2];

    // Handle character class [...]
    if (char === '[' && !inCharClass && (i === 0 || pattern[i - 1] !== '\\')) {
      inCharClass = true;
      charClassStart = i;
      i++;
      continue;
    }

    if (inCharClass) {
      if (char === ']' && (i === charClassStart + 1 || pattern[i - 1] !== '\\')) {
        inCharClass = false;
        const charClass = pattern.substring(charClassStart, i + 1);
        parts.push({
          regex: charClass,
          description: explainCharClass(charClass),
          type: 'charClass',
        });
        charClassStart = -1;
        i++;
        continue;
      }
      i++;
      continue;
    }

    // Handle escape sequences
    if (char === '\\' && nextChar) {
      const escapeSeq = char + nextChar;
      const unicodeMatch = escapeSeq.match(/^\\u\{([0-9a-fA-F]+)\}$/);
      
      if (unicodeMatch) {
        // \u{...} - consume until }
        let j = i + 2;
        while (j < pattern.length && pattern[j] !== '}') j++;
        if (j < pattern.length) {
          const fullEscape = pattern.substring(i, j + 1);
          parts.push({
            regex: fullEscape,
            description: `Unicode code point U+${unicodeMatch[1].toUpperCase()}`,
            type: 'escape',
          });
          i = j + 1;
          continue;
        }
      }
      
      if (nextChar === 'x' && nextNextChar && /[0-9a-fA-F]/.test(nextNextChar) && pattern[i + 3] && /[0-9a-fA-F]/.test(pattern[i + 3])) {
        // \xNN
        const fullEscape = pattern.substring(i, i + 4);
        parts.push({
          regex: fullEscape,
          description: `Hex character ${fullEscape.slice(2).toUpperCase()}`,
          type: 'escape',
        });
        i += 4;
        continue;
      }
      
      if (nextChar === 'u' && nextNextChar && /[0-9a-fA-F]/.test(nextNextChar)) {
        // \uNNNN
        if (pattern[i + 3] && /[0-9a-fA-F]/.test(pattern[i + 3]) && pattern[i + 4] && /[0-9a-fA-F]/.test(pattern[i + 4]) && pattern[i + 5] && /[0-9a-fA-F]/.test(pattern[i + 5])) {
          const fullEscape = pattern.substring(i, i + 6);
          parts.push({
            regex: fullEscape,
            description: `Unicode character U+${fullEscape.slice(2).toUpperCase()}`,
            type: 'escape',
          });
          i += 6;
          continue;
        }
      }

      // Simple escape
      const desc = ESCAPE_SEQUENCES[escapeSeq] || CHAR_CLASS_ESCAPES[escapeSeq] || `Literal "${nextChar}"`;
      parts.push({
        regex: escapeSeq,
        description: desc,
        type: 'escape',
      });
      i += 2;
      continue;
    }

    // Handle quantifiers
    if ('*+?{'.includes(char)) {
      let quantifier = char;
      if (char === '{') {
        let j = i + 1;
        while (j < pattern.length && pattern[j] !== '}') j++;
        if (j < pattern.length) {
          quantifier = pattern.substring(i, j + 1);
          i = j + 1;
          
          // Check for greedy/lazy/possessive
          if (i < pattern.length && '?+'.includes(pattern[i])) {
            quantifier += pattern[i];
            i++;
          }
          
          const desc = explainQuantifier(quantifier);
          parts.push({ regex: quantifier, description: desc, type: 'quantifier' });
          continue;
        }
      } else {
        // Check for lazy/possessive modifier
        if (i + 1 < pattern.length && '?+'.includes(pattern[i + 1])) {
          quantifier += pattern[i + 1];
          i += 2;
        } else {
          i++;
        }
        const desc = explainQuantifier(quantifier);
        parts.push({ regex: quantifier, description: desc, type: 'quantifier' });
        continue;
      }
    }

    // Handle anchors
    if (char === '^' && (i === 0 || pattern[i - 1] === '|' || pattern[i - 1] === '(')) {
      parts.push({ regex: '^', description: 'Start of string (or line with m flag)', type: 'anchor' });
      i++;
      continue;
    }
    if (char === '$' && (i === pattern.length - 1 || pattern[i + 1] === '|' || pattern[i + 1] === ')')) {
      parts.push({ regex: '$', description: 'End of string (or line with m flag)', type: 'anchor' });
      i++;
      continue;
    }
    if (char === '\\' && nextChar && 'bB'.includes(nextChar)) {
      const esc = char + nextChar;
      parts.push({
        regex: esc,
        description: esc === '\\b' ? 'Word boundary' : 'Non-word boundary',
        type: 'boundary',
      });
      i += 2;
      continue;
    }

    // Handle groups
    if (char === '(') {
      if (nextChar === '?') {
        if (nextNextChar === ':') {
          // Non-capturing group (?:...)
          groupStack.push({ start: i, type: 'non-capturing' });
          i += 3;
          continue;
        } else if (nextNextChar === '=') {
          // Positive lookahead (?=...)
          groupStack.push({ start: i, type: 'lookahead' });
          i += 3;
          continue;
        } else if (nextNextChar === '!') {
          // Negative lookahead (?!...)
          groupStack.push({ start: i, type: 'negative-lookahead' });
          i += 3;
          continue;
        } else if (nextNextChar === '<') {
          // Lookbehind (?<=...) or (?<!...)
          const lookbehindType = pattern[i + 3] === '=' ? 'positive-lookbehind' : 'negative-lookbehind';
          groupStack.push({ start: i, type: lookbehindType });
          i += 4;
          continue;
        } else if (nextNextChar === '>') {
          // Atomic group (?>...)
          groupStack.push({ start: i, type: 'atomic' });
          i += 3;
          continue;
        } else if (nextNextChar === '#') {
          // Comment (?#...) - consume until )
          let j = i + 3;
          while (j < pattern.length && pattern[j] !== ')') j++;
          if (j < pattern.length) {
            parts.push({
              regex: pattern.substring(i, j + 1),
              description: 'Comment (ignored)',
              type: 'group',
            });
            i = j + 1;
            continue;
          }
        }
      } else {
        // Capturing group
        groupStack.push({ start: i, type: 'capturing' });
      }
    }

    if (char === ')' && groupStack.length > 0) {
      const group = groupStack.pop()!;
      const groupRegex = pattern.substring(group.start, i + 1);
      const typeNames: Record<string, string> = {
        'capturing': 'Capturing group',
        'non-capturing': 'Non-capturing group',
        'lookahead': 'Positive lookahead',
        'negative-lookahead': 'Negative lookahead',
        'positive-lookbehind': 'Positive lookbehind',
        'negative-lookbehind': 'Negative lookbehind',
        'atomic': 'Atomic group',
      };
      parts.push({
        regex: groupRegex,
        description: typeNames[group.type] || 'Group',
        type: 'group',
      });
      i++;
      continue;
    }

    // Handle alternation
    if (char === '|') {
      parts.push({ regex: '|', description: 'Alternation (OR)', type: 'alternation' });
      i++;
      continue;
    }

    // Handle dot
    if (char === '.') {
      parts.push({ regex: '.', description: 'Any character except newline (or any with s flag)', type: 'literal' });
      i++;
      continue;
    }

    // Regular literal character
    parts.push({ regex: char, description: `Literal "${char}"`, type: 'literal' });
    i++;
  }

  // Add flags explanation
  for (const flag of flags) {
    if (FLAGS_INFO[flag]) {
      parts.push({
        regex: flag,
        description: `${FLAGS_INFO[flag].name}: ${FLAGS_INFO[flag].description}`,
        type: 'flag',
      });
    }
  }

  return parts;
}

function explainCharClass(charClass: string): string {
  if (charClass.startsWith('[^')) {
    const content = charClass.slice(2, -1);
    return `Negated character class: match any character EXCEPT ${explainCharClassContent(content)}`;
  }
  const content = charClass.slice(1, -1);
  return `Character class: match any of ${explainCharClassContent(content)}`;
}

function explainCharClassContent(content: string): string {
  const parts: string[] = [];
  let i = 0;
  
  while (i < content.length) {
    if (content[i] === '\\' && i + 1 < content.length) {
      const escape = content.substring(i, i + 2);
      const desc = CHAR_CLASS_ESCAPES[escape] || `Literal "${escape[1]}"`;
      parts.push(desc);
      i += 2;
    } else if (content[i] === '-' && i > 0 && i < content.length - 1 && content[i - 1] !== '\\' && content[i + 1] !== '\\') {
      // Range like a-z
      // This is handled by the range detection below
      i++;
    } else if (i + 2 < content.length && content[i + 1] === '-' && content[i + 2] !== ']' && content[i + 2] !== '\\') {
      // Range like a-z
      parts.push(`Range ${content[i]}-${content[i + 2]}`);
      i += 3;
    } else {
      parts.push(`"${content[i]}"`);
      i++;
    }
  }
  
  return parts.join(', ');
}

function explainQuantifier(q: string): string {
  const base = q.replace(/[?+]$/, '');
  const modifier = q.endsWith('?') ? ' (lazy/non-greedy)' : q.endsWith('+') ? ' (possessive)' : ' (greedy)';
  
  switch (base) {
    case '*': return `Zero or more${modifier}`;
    case '+': return `One or more${modifier}`;
    case '?': return `Zero or one (optional)${modifier}`;
    default:
      if (base.startsWith('{')) {
        const inner = base.slice(1, -1);
        if (inner.includes(',')) {
          const [min, max] = inner.split(',');
          if (max === '') return `At least ${min} times${modifier}`;
          return `Between ${min} and ${max} times${modifier}`;
        }
        return `Exactly ${inner} times${modifier}`;
      }
      return base;
  }
}

function findMatches(pattern: string, flags: string, testString: string): MatchResult[] {
  try {
    const regex = new RegExp(pattern, flags);
    const matches: MatchResult[] = [];
    let match;
    
    // Use exec in a loop for global flag
    if (flags.includes('g')) {
      while ((match = regex.exec(testString)) !== null) {
        const groups: Record<string, string> = {};
        if (match.groups) {
          Object.assign(groups, match.groups);
        }
        // Also add numbered groups
        for (let i = 1; i < match.length; i++) {
          groups[i.toString()] = match[i];
        }
        
        matches.push({
          match: match[0],
          index: match.index,
          groups,
        });
        
        // Prevent infinite loop on zero-width matches
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    } else {
      match = regex.exec(testString);
      if (match) {
        const groups: Record<string, string> = {};
        if (match.groups) {
          Object.assign(groups, match.groups);
        }
        for (let i = 1; i < match.length; i++) {
          groups[i.toString()] = match[i];
        }
        matches.push({
          match: match[0],
          index: match.index,
          groups,
        });
      }
    }
    
    return matches;
  } catch (e) {
    return [];
  }
}

function highlightMatches(text: string, matches: MatchResult[]): React.ReactNode[] {
  if (matches.length === 0) return [text];
  
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  
  matches.forEach((match, idx) => {
    if (match.index > lastIndex) {
      result.push(text.substring(lastIndex, match.index));
    }
    result.push(
      <mark key={idx} className="regex-match" data-index={idx}>
        {match.match}
      </mark>
    );
    lastIndex = match.index + match.match.length;
  });
  
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }
  
  return result;
}

export default function RegexExplainer() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('');
  const [testString, setTestString] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [activeExample, setActiveExample] = useState<string | null>(null);

  const explainedParts = useMemo(() => parseRegex(pattern, flags), [pattern, flags]);

  const testRegex = useCallback(() => {
    setError(null);
    if (!pattern) {
      setMatches([]);
      return;
    }
    try {
      new RegExp(pattern, flags); // Validate
      const found = findMatches(pattern, flags, testString);
      setMatches(found);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid regex');
      setMatches([]);
    }
  }, [pattern, flags, testString]);

  useEffect(() => {
    const timer = setTimeout(testRegex, 300);
    return () => clearTimeout(timer);
  }, [testRegex]);

  const loadExample = (key: string) => {
    const ex = EXAMPLES[key as keyof typeof EXAMPLES];
    setPattern(ex.pattern);
    setFlags(ex.flags);
    setTestString(ex.testString);
    setActiveExample(key);
  };

  const clearAll = () => {
    setPattern('');
    setFlags('');
    setTestString('');
    setError(null);
    setMatches([]);
    setActiveExample(null);
  };

  const copyPattern = () => {
    navigator.clipboard.writeText(pattern);
  };

  const swapTestString = () => {
    if (matches.length > 0) {
      setTestString(matches.map(m => m.match).join('\n'));
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Regex Explainer</h2>
        <p className="tool-desc">Break down regular expressions into plain English explanations with live matching and examples</p>
      </div>

      <div className="explainer-toolbar">
        <div className="toolbar-group">
          <label className="tool-input">
            <span className="input-label">Pattern</span>
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="/pattern/"
              className="regex-pattern-input"
              spellCheck={false}
            />
          </label>
          <label className="tool-input">
            <span className="input-label">Flags</span>
            <input
              type="text"
              value={flags}
              onChange={e => setFlags(e.target.value)}
              placeholder="gimsuyd"
              className="regex-flags-input"
              maxLength={7}
              spellCheck={false}
            />
          </label>
        </div>

        <div className="toolbar-group">
          <label className="tool-input full-width">
            <span className="input-label">Test String</span>
            <textarea
              value={testString}
              onChange={e => setTestString(e.target.value)}
              placeholder="Enter text to test against..."
              className="regex-test-input"
              spellCheck={false}
              rows={3}
            />
          </label>
        </div>

        <div className="toolbar-group actions">
          <select
            value={activeExample || ''}
            onChange={e => e.target.value && loadExample(e.target.value)}
            className="example-select"
          >
            <option value="">📋 Load Example...</option>
            {Object.entries(EXAMPLES).map(([key, ex]) => (
              <option key={key} value={key}>{ex.description}</option>
            ))}
          </select>
          <button onClick={clearAll} className="btn-secondary">Clear All</button>
          <button onClick={copyPattern} className="btn-secondary" disabled={!pattern}>Copy Pattern</button>
          <button onClick={swapTestString} className="btn-secondary" disabled={matches.length === 0}>
            Use Matches as Input
          </button>
        </div>
      </div>

      {error && <div className="error-banner">✗ {error}</div>}

      <div className="explainer-layout">
        {/* Explanation Panel */}
        <div className="explanation-panel">
          <div className="panel-header">
            <h3>Explanation</h3>
            <span className="part-count">{explainedParts.length} parts</span>
          </div>
          
          {explainedParts.length === 0 ? (
            <div className="empty-explanation">
              <p>Enter a regex pattern above to see it broken down into parts.</p>
              <p className="hint">Try loading an example from the dropdown!</p>
            </div>
          ) : (
            <div className="explained-parts">
              {explainedParts.map((part, idx) => (
                <div key={idx} className={`explained-part ${part.type}`}>
                  <span className="part-regex">{part.regex}</span>
                  <span className="part-type">{part.type}</span>
                  <span className="part-description">{part.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Flags Legend */}
          {flags && (
            <details className="flags-legend">
              <summary>Flags Used</summary>
              <ul>
                {flags.split('').map(f => FLAGS_INFO[f] && (
                  <li key={f}>
                    <code>/{f}</code> — {FLAGS_INFO[f].name}: {FLAGS_INFO[f].description}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        {/* Matches Panel */}
        <div className="matches-panel">
          <div className="panel-header">
            <h3>Matches</h3>
            <span className="match-count">{matches.length} match{matches.length !== 1 ? 'es' : ''}</span>
          </div>

          {testString && (
            <div className="test-string-display">
              {highlightMatches(testString, matches)}
            </div>
          )}

          {matches.length > 0 && (
            <div className="matches-list">
              {matches.map((match, idx) => (
                <div key={idx} className="match-item">
                  <div className="match-header">
                    <span className="match-index">Match #{idx + 1}</span>
                    <span className="match-position">at index {match.index}</span>
                  </div>
                  <div className="match-value">"{match.match}"</div>
                  {Object.keys(match.groups).length > 0 && (
                    <details className="match-groups">
                      <summary>Groups ({Object.keys(match.groups).length})</summary>
                      <table className="groups-table">
                        <thead>
                          <tr><th>Group</th><th>Value</th></tr>
                        </thead>
                        <tbody>
                          {Object.entries(match.groups).map(([key, value]) => (
                            <tr key={key}>
                              <td><code>{key}</code></td>
                              <td>"{value}"</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {testString && matches.length === 0 && !error && pattern && (
            <div className="no-matches">No matches found</div>
          )}

          {!testString && (
            <div className="empty-matches">
              <p>Enter a test string to see matches.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="explainer-reference">
        <details>
          <summary>📖 Quick Reference</summary>
          <div className="ref-grid">
            <div className="ref-section">
              <h4>Anchors</h4>
              <table>
                <tr><td><code>^</code></td><td>Start of string/line</td></tr>
                <tr><td><code>$</code></td><td>End of string/line</td></tr>
                <tr><td><code>{'\\b'}</code></td><td>Word boundary</td></tr>
                                <tr><td><code>{'\\B'}</code></td><td>Non-word boundary</td></tr>
              </table>
            </div>
            <div className="ref-section">
              <h4>Quantifiers</h4>
              <table>
                <tr><td><code>*</code></td><td>0 or more (greedy)</td></tr>
                <tr><td><code>+</code></td><td>1 or more (greedy)</td></tr>
                <tr><td><code>?</code></td><td>0 or 1 (optional)</td></tr>
                <tr><td><code>{`{n}`}</code></td><td>Exactly n times</td></tr>
                <tr><td><code>{`{n,}`}</code></td><td>n or more</td></tr>
                <tr><td><code>{`{n,m}`}</code></td><td>Between n and m</td></tr>
                <tr><td><code>*? +? ??</code></td><td>Lazy versions</td></tr>
              </table>
            </div>
            <div className="ref-section">
              <h4>Character Classes</h4>
              <table>
                <tr><td><code>.</code></td><td>Any char (except newline)</td></tr>
                <tr><td><code>{'\\d \\D'}</code></td><td>Digit / Non-digit</td></tr>
                                <tr><td><code>{'\\w \\W'}</code></td><td>Word char / Non-word</td></tr>
                                <tr><td><code>{'\\s \\S'}</code></td><td>Whitespace / Non-whitespace</td></tr>
                <tr><td><code>[abc]</code></td><td>Any of a, b, c</td></tr>
                <tr><td><code>[^abc]</code></td><td>Not a, b, c</td></tr>
                <tr><td><code>[a-z]</code></td><td>Range a through z</td></tr>
              </table>
            </div>
            <div className="ref-section">
              <h4>Groups & Lookaround</h4>
              <table>
                <tr><td><code>{'(...)'}</code></td><td>Capturing group</td></tr>
                <tr><td><code>{'(?:...)'}</code></td><td>Non-capturing group</td></tr>
                <tr><td><code>{'(?=...)'}</code></td><td>Positive lookahead</td></tr>
                <tr><td><code>{'(?!...)'}</code></td><td>Negative lookahead</td></tr>
                <tr><td><code>{'(?<=...)'}</code></td><td>Positive lookbehind</td></tr>
                <tr><td><code>{'(?<!...)'}</code></td><td>Negative lookbehind</td></tr>
              </table>
            </div>
            <div className="ref-section">
              <h4>Flags</h4>
              <table>
                <tr><td><code>g</code></td><td>Global (all matches)</td></tr>
                <tr><td><code>i</code></td><td>Case insensitive</td></tr>
                <tr><td><code>m</code></td><td>Multiline (^$ per line)</td></tr>
                <tr><td><code>s</code></td><td>Dot matches newline</td></tr>
                <tr><td><code>u</code></td><td>Unicode mode</td></tr>
                <tr><td><code>y</code></td><td>Sticky</td></tr>
                <tr><td><code>d</code></td><td>Indices in result</td></tr>
              </table>
            </div>
            <div className="ref-section">
              <h4>Escapes</h4>
              <table>
                <tr><td><code>{'\\n \\r \\t'}</code></td><td>Newline, CR, Tab</td></tr>
                <tr><td><code>{'\\xNN'}</code></td><td>Hex (2 digits)</td></tr>
                <tr><td><code>{'\\uNNNN'}</code></td><td>Unicode (4 hex)</td></tr>
                <tr><td><code>{'\\u{NNN}'}</code></td><td>Code point (ES2018)</td></tr>
                <tr><td><code>{'\\p{L}'}</code></td><td>Unicode property</td></tr>
                <tr><td><code>{`\\cA-\\cZ`}</code></td><td>Control chars</td></tr>
              </table>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}