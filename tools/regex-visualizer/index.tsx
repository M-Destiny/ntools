import { useState, useMemo } from 'react';

export default function RegexVisualizer() {
  const [pattern, setPattern] = useState('\\d{3}-\\d{2}-\\d{4}');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('My SSN is 123-45-6789 and another is 987-65-4321');
  const [error, setError] = useState<string | null>(null);

  const regex = useMemo(() => {
    try {
      setError(null);
      return new RegExp(pattern, flags);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid regex');
      return null;
    }
  }, [pattern, flags]);

  const matches = useMemo(() => {
    if (!regex) return [];
    const results: RegExpExecArray[] = [];
    let match: RegExpExecArray | null;
    const globalRegex = new RegExp(pattern, flags + (flags.includes('g') ? '' : 'g'));
    while ((match = globalRegex.exec(testString)) !== null) {
      results.push(match);
      if (!flags.includes('g')) break;
    }
    return results;
  }, [regex, testString, pattern, flags]);

  const highlightedString = useMemo(() => {
    if (!regex || matches.length === 0) return <span>{testString}</span>;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${i}`}>{testString.slice(lastIndex, match.index)}</span>);
      }
      parts.push(
        <mark key={`match-${i}`} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {match[0]}
        </mark>
      );
      lastIndex = match.index + match[0].length;
    });

    if (lastIndex < testString.length) {
      parts.push(<span key="tail">{testString.slice(lastIndex)}</span>);
    }

    return <span>{parts}</span>;
  }, [testString, matches, regex]);

  const explanation = useMemo(() => {
    if (!pattern) return '';
    const parts: string[] = [];
    let i = 0;
    while (i < pattern.length) {
      const char = pattern[i];
      if (char === '\\' && i + 1 < pattern.length) {
        const next = pattern[i + 1];
        const escapes: Record<string, string> = {
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
        parts.push(`\\${next}: ${escapes[next] || 'Escaped ' + next}`);
        i += 2;
      } else if (char === '[') {
        let j = i + 1;
        while (j < pattern.length && pattern[j] !== ']') j++;
        parts.push(`[${pattern.slice(i + 1, j)}]: Character class`);
        i = j + 1;
      } else if (char === '(') {
        let j = i + 1;
        while (j < pattern.length && pattern[j] !== ')') j++;
        parts.push(`(${pattern.slice(i + 1, j)}): Capture group`);
        i = j + 1;
      } else if (['*', '+', '?'].includes(char)) {
        const quantifiers: Record<string, string> = {
          '*': 'Zero or more',
          '+': 'One or more',
          '?': 'Zero or one (optional)',
        };
        parts.push(`${char}: ${quantifiers[char]}`);
        i++;
      } else if (char === '{') {
        let j = i + 1;
        while (j < pattern.length && pattern[j] !== '}') j++;
        parts.push(`{${pattern.slice(i + 1, j)}}: Quantifier`);
        i = j + 1;
      } else if (char === '^') {
        parts.push('^: Start of string/line');
        i++;
      } else if (char === '$') {
        parts.push('$: End of string/line');
        i++;
      } else if (char === '.') {
        parts.push('.: Any character except newline');
        i++;
      } else if (char === '|') {
        parts.push('|: Alternation (OR)');
        i++;
      } else {
        parts.push(`"${char}": Literal character`);
        i++;
      }
    }
    return parts.join('\n');
  }, [pattern]);

  const flagOptions = [
    { value: 'g', label: 'Global (g)' },
    { value: 'i', label: 'Case insensitive (i)' },
    { value: 'm', label: 'Multiline (m)' },
    { value: 's', label: 'Dot matches newline (s)' },
    { value: 'u', label: 'Unicode (u)' },
    { value: 'y', label: 'Sticky (y)' },
  ];

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Regex Visualizer</h2>
        <p className="tool-desc">Test, debug, and visualize regular expressions with real-time highlighting and explanation.</p>
      </div>

      <div className="tool-grid">
        <div className="panel">
          <h3>Pattern</h3>
          <div className="input-group">
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="Enter regex pattern"
              className="regex-input font-mono"
            />
            <div className="flags-selector">
              {flagOptions.map(f => (
                <label key={f.value} className="flag-label">
                  <input
                    type="checkbox"
                    checked={flags.includes(f.value)}
                    onChange={e => setFlags(e.target.checked ? flags + f.value : flags.replace(f.value, ''))}
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>
          {error && <p className="error text-red-500 text-sm mt-2">{error}</p>}
        </div>

        <div className="panel">
          <h3>Test String</h3>
          <textarea
            value={testString}
            onChange={e => setTestString(e.target.value)}
            placeholder="Enter text to test against..."
            className="test-input font-mono"
            rows={4}
          />
        </div>
      </div>

      <div className="tool-grid">
        <div className="panel">
          <h3>Highlighted Matches</h3>
          <div className="highlighted-output p-4 border rounded font-mono whitespace-pre-wrap">
            {highlightedString}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {matches.length} match{matches.length !== 1 ? 'es' : ''} found
          </p>
        </div>

        <div className="panel">
          <h3>Match Details</h3>
          {matches.length > 0 ? (
            <div className="match-details space-y-2 max-h-64 overflow-y-auto">
              {matches.map((match, i) => (
                <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                  <div className="font-mono text-lg font-semibold mb-1">Match {i + 1}: "{match[0]}"</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Index: {match.index} | Length: {match[0].length}
                  </div>
                  {match.groups && (
                    <div className="mt-1 text-sm">
                      <strong>Groups:</strong>
                      <pre className="mt-1 font-mono text-xs">{JSON.stringify(match.groups, null, 2)}</pre>
                    </div>
                  )}
                  {match.length > 1 && (
                    <div className="mt-1 text-sm">
                      <strong>Capture groups:</strong>
                      <ul className="list-disc list-inside font-mono text-xs">
                        {match.slice(1).map((g, idx) => (
                          <li key={idx}>Group {idx + 1}: "{g}"</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No matches found</p>
          )}
        </div>
      </div>

      <div className="panel mt-4">
        <h3>Pattern Explanation</h3>
        <pre className="p-4 bg-gray-50 dark:bg-gray-800 rounded border font-mono text-sm whitespace-pre-wrap overflow-x-auto">
          {explanation || 'Enter a pattern to see explanation'}
        </pre>
      </div>

      <div className="panel mt-4">
        <h3>Quick Reference</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>\\d</code> - Digit</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>\\w</code> - Word char</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>\\s</code> - Whitespace</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>.</code> - Any char</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>*</code> - 0 or more</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>+</code> - 1 or more</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>?</code> - 0 or 1</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>{`\\{n\\}`}</code> - Exactly n</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>[abc]</code> - Char class</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>[^abc]</code> - Negated</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>(abc)</code> - Capture group</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>(?:abc)</code> - Non-capturing</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>|</code> - Alternation</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>^</code> - Start</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>$</code> - End</div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"><code>\\b</code> - Word boundary</div>
        </div>
      </div>
    </div>
  );
}