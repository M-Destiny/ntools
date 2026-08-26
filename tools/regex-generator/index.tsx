import React, { useState, useCallback, useEffect } from 'react';

interface Pattern {
  name: string;
  pattern: string;
  description: string;
  example: string;
}

const PATTERNS: Pattern[] = [
  {
    name: 'Email',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: 'Standard email address validation',
    example: 'user@example.com'
  },
  {
    name: 'URL',
    pattern: '^https?://(?:www\\.)?[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)+[/#?]?.*$',
    description: 'HTTP/HTTPS URLs with optional www',
    example: 'https://example.com/path'
  },
  {
    name: 'IPv4 Address',
    pattern: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$',
    description: 'IPv4 address (0.0.0.0 - 255.255.255.255)',
    example: '192.168.1.1'
  },
  {
    name: 'IPv6 Address',
    pattern: '^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$',
    description: 'Full IPv6 address',
    example: '2001:0db8:85a3:0000:0000:8a2e:0370:7334'
  },
  {
    name: 'Phone (US)',
    pattern: '^\\+?1?[-.\\s]?\\(?([0-9]{3})\\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$',
    description: 'US phone number with various formats',
    example: '(555) 123-4567'
  },
  {
    name: 'Phone (International)',
    pattern: '^\\+[1-9]\\d{1,14}$',
    description: 'E.164 international phone format',
    example: '+15551234567'
  },
  {
    name: 'Date (YYYY-MM-DD)',
    pattern: '^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])$',
    description: 'ISO 8601 date format',
    example: '2024-12-31'
  },
  {
    name: 'Time (24-hour)',
    pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$',
    description: '24-hour time format HH:MM',
    example: '14:30'
  },
  {
    name: 'UUID v4',
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
    description: 'UUID version 4 (random)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  },
  {
    name: 'MAC Address',
    pattern: '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',
    description: 'MAC address with colon or hyphen separators',
    example: '00:1A:2B:3C:4D:5E'
  },
  {
    name: 'Credit Card',
    pattern: '^\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}[-\\s]?\\d{4}$',
    description: '16-digit credit card with optional spaces/dashes',
    example: '4111 1111 1111 1111'
  },
  {
    name: 'Hex Color',
    pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
    description: 'CSS hex color (#RGB or #RRGGBB)',
    example: '#FF5733'
  },
  {
    name: 'Slug',
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
    description: 'URL-friendly slug (lowercase, hyphens)',
    example: 'my-awesome-post'
  },
  {
    name: 'Username',
    pattern: '^[a-zA-Z0-9_]{3,20}$',
    description: 'Alphanumeric + underscore, 3-20 chars',
    example: 'john_doe123'
  },
  {
    name: 'Strong Password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    description: 'Min 8 chars, upper, lower, number, special',
    example: 'SecureP@ss123'
  },
  {
    name: 'Postal Code (US)',
    pattern: '^\\d{5}(-\\d{4})?$',
    description: 'US ZIP code (5 digits or ZIP+4)',
    example: '90210'
  },
  {
    name: 'Postal Code (UK)',
    pattern: '^[A-Z]{1,2}\\d[A-Z\\d]? \\d[A-Z]{2}$',
    description: 'UK postcode format',
    example: 'SW1A 1AA'
  },
  {
    name: 'Semantic Version',
    pattern: '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$',
    description: 'Semantic Versioning 2.0.0',
    example: '1.2.3-beta.1+build.4'
  },
  {
    name: 'Base64',
    pattern: '^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$',
    description: 'Base64 encoded string',
    example: 'SGVsbG8gV29ybGQ='
  },
  {
    name: 'JWT Token',
    pattern: '^eyJ[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+\\.[A-Za-z0-9-_=]+$',
    description: 'JSON Web Token (3 base64url parts)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  {
    name: 'MongoDB ObjectId',
    pattern: '^[a-fA-F0-9]{24}$',
    description: '24-character hex string',
    example: '507f1f77bcf86cd799439011'
  },
  {
    name: 'CSS Selector',
    pattern: '^[a-zA-Z][a-zA-Z0-9_-]*(?:\\.[a-zA-Z][a-zA-Z0-9_-]*)*(?:#[a-zA-Z][a-zA-Z0-9_-]*)?$',
    description: 'Simple CSS selector (tag.class#id)',
    example: 'div.container#main'
  },
  {
    name: 'Git Commit SHA',
    pattern: '^[a-f0-9]{40}$',
    description: 'Full 40-char SHA-1 hash',
    example: 'a1b2c3d4e5f6789012345678901234567890abcd'
  },
  {
    name: 'Docker Image Tag',
    pattern: '^[a-z0-9]+(?:[._-][a-z0-9]+)*(?:/[a-z0-9]+(?:[._-][a-z0-9]+)*)?(?::[a-zA-Z0-9._-]+)?$',
    description: 'Docker image name with optional tag',
    example: 'nginx:latest'
  }
];

const FLAGS = [
  { value: 'g', label: 'Global (g)', description: 'Find all matches' },
  { value: 'i', label: 'Case Insensitive (i)', description: 'Ignore case' },
  { value: 'm', label: 'Multiline (m)', description: '^ and $ match line breaks' },
  { value: 's', label: 'DotAll (s)', description: '. matches newlines' },
  { value: 'u', label: 'Unicode (u)', description: 'Full Unicode support' },
  { value: 'y', label: 'Sticky (y)', description: 'Match only from lastIndex' }
];

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', wrapper: (p: string) => `/${p}/` },
  { value: 'python', label: 'Python', wrapper: (p: string) => `re.compile(r'${p}')` },
  { value: 'go', label: 'Go', wrapper: (p: string) => `regexp.MustCompile(\`${p}\`)` },
  { value: 'java', label: 'Java', wrapper: (p: string) => `Pattern.compile("${p.replace(/\"/g, '\\\\\"')}")` },
  { value: 'rust', label: 'Rust', wrapper: (p: string) => `regex::Regex::new(r"${p}").unwrap()` },
  { value: 'php', label: 'PHP', wrapper: (p: string) => `~${p}~` },
  { value: 'ruby', label: 'Ruby', wrapper: (p: string) => `/${p}/` },
  { value: 'csharp', label: 'C#', wrapper: (p: string) => `new Regex(@"${p}")` },
  { value: 'swift', label: 'Swift', wrapper: (p: string) => `try NSRegularExpression(pattern: "${p}")` },
  { value: 'kotlin', label: 'Kotlin', wrapper: (p: string) => `Regex("${p}")` }
];

export default function RegexGenerator() {
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(PATTERNS[0]);
  const [customPattern, setCustomPattern] = useState('');
  const [flags, setFlags] = useState<string>('gm');
  const [testString, setTestString] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [matches, setMatches] = useState<RegExpMatchArray | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCustom, setIsCustom] = useState(false);

  const getActivePattern = useCallback(() => {
    return isCustom ? customPattern : (selectedPattern?.pattern || '');
  }, [isCustom, customPattern, selectedPattern]);

  const handleFlagToggle = (flag: string) => {
    setFlags(prev => prev.includes(flag) ? prev.replace(flag, '') : prev + flag);
  };

  // Test regex whenever pattern or flags change
  useEffect(() => {
    const pattern = getActivePattern();
    if (!pattern) {
      setMatches(null);
      setError(null);
      return;
    }
    try {
      const regex = new RegExp(pattern, flags);
      const result: RegExpMatchArray | null = testString.match(regex);
      setMatches(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid regex');
      setMatches(null);
    }
  }, [getActivePattern, flags, testString]);

  const getCodeSnippet = () => {
    const pattern = getActivePattern();
    const lang = LANGUAGES.find(l => l.value === language);
    if (!lang || !pattern) return '// Select a pattern or enter custom regex';
    return lang.wrapper(pattern);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Regex Generator</h1>
        <p style={styles.subtitle}>Build, test, and export regular expressions</p>
      </div>

      <div style={styles.main}>
        {/* Pattern Selector */}
        <div style={styles.panel}>
          <div style={styles.section}>
            <label style={styles.label}>Pattern Source</label>
            <div style={styles.toggle}>
              <button
                style={{ ...styles.toggleBtn, ...(isCustom ? styles.toggleActive : {}) }}
                onClick={() => setIsCustom(false)}
              >
                Presets
              </button>
              <button
                style={{ ...styles.toggleBtn, ...(isCustom ? styles.toggleActive : {}) }}
                onClick={() => setIsCustom(true)}
              >
                Custom
              </button>
            </div>
          </div>

          {isCustom ? (
            <div style={styles.section}>
              <label style={styles.label}>Custom Pattern</label>
              <textarea
                style={styles.textarea}
                value={customPattern}
                onChange={e => setCustomPattern(e.target.value)}
                placeholder="Enter your regex pattern (without delimiters)..."
                rows={3}
              />
              <div style={styles.helper}>Enter pattern without /delimiters/, flags are set below</div>
            </div>
          ) : (
            <div style={styles.section}>
              <label style={styles.label}>Choose a Preset</label>
              <select
                style={styles.select}
                value={selectedPattern?.name || ''}
                onChange={e => {
                  const p = PATTERNS.find(pt => pt.name === e.target.value);
                  if (p) setSelectedPattern(p);
                }}
              >
                {PATTERNS.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
              {selectedPattern && (
                <div style={styles.patternInfo}>
                  <div style={styles.patternRow}>
                    <span style={styles.patternLabel}>Pattern:</span>
                    <code style={styles.patternCode}>{selectedPattern.pattern}</code>
                    <button
                      style={styles.copyBtn}
                      onClick={() => copyToClipboard(selectedPattern.pattern)}
                      title="Copy pattern"
                    >
                      📋
                    </button>
                  </div>
                  <div style={styles.patternRow}>
                    <span style={styles.patternLabel}>Description:</span>
                    <span>{selectedPattern.description}</span>
                  </div>
                  <div style={styles.patternRow}>
                    <span style={styles.patternLabel}>Example:</span>
                    <code style={styles.exampleCode}>{selectedPattern.example}</code>
                    <button
                      style={styles.copyBtn}
                      onClick={() => setTestString(selectedPattern.example)}
                      title="Use as test input"
                    >
                      → Test
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Flags */}
          <div style={styles.section}>
            <label style={styles.label}>Flags</label>
            <div style={styles.flags}>
              {FLAGS.map(flag => (
                <label key={flag.value} style={styles.flag}>
                  <input
                    type="checkbox"
                    checked={flags.includes(flag.value)}
                    onChange={() => handleFlagToggle(flag.value)}
                  />
                  <span title={flag.description}>{flag.label}</span>
                </label>
              ))}
            </div>
            <div style={styles.flagDisplay}>/ {getActivePattern()} / {flags}</div>
          </div>
        </div>

        {/* Test Area & Output */}
        <div style={styles.panel}>
          <div style={styles.section}>
            <label style={styles.label}>Test String</label>
            <textarea
              style={styles.textarea}
              value={testString}
              onChange={e => setTestString(e.target.value)}
              placeholder="Enter text to test against the regex..."
              rows={6}
            />
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Matches</label>
            {error && (
              <div style={styles.error}>{error}</div>
            )}
            {(() => {
              if (!error && matches && matches.length > 0) {
                return (
                  <div style={styles.matches}>
                    {(matches as unknown as RegExpMatchArray[]).map((matchItem: RegExpMatchArray, i: number) => (
                      <div key={i} style={styles.match}>
                        <div style={styles.matchMain}>{matchItem[0]}</div>
                        {matchItem.length > 1 && (
                          <div style={styles.matchGroups}>
                            {matchItem.slice(1).map((group: string, gi: number) => (
                              <span key={gi} style={styles.group}>Group ${gi + 1}: {group}</span>
                            ))}
                          </div>
                        )}
                        <div style={styles.matchMeta}>
                          Index: {matchItem.index} | Length: {matchItem[0].length}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              } else if (!error && matches && matches.length === 0) {
                return <div style={styles.noMatch}>No matches found</div>;
              } else {
                return <div style={styles.placeholder}>Enter a test string to see matches</div>;
              }
            })()}
          </div>
        </div>
      </div>

      {/* Code Export */}
      <div style={styles.exportPanel}>
        <div style={styles.exportHeader}>
          <label style={styles.label}>Export for</label>
          <select
            style={styles.select}
            value={language}
            onChange={e => setLanguage(e.target.value)}
          >
            {LANGUAGES.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>
        <div style={styles.codeBlock}>
          <pre style={styles.pre}>{getCodeSnippet()}</pre>
          <button
            style={styles.copyBtnLarge}
            onClick={() => copyToClipboard(getCodeSnippet())}
          >
            Copy Code
          </button>
        </div>
      </div>

      {/* Quick Reference */}
      <div style={styles.refPanel}>
        <h3 style={styles.refTitle}>Quick Reference</h3>
        <div style={styles.refGrid}>
          <div style={styles.refItem}><kbd>.</kbd> Any character (except newline)</div>
          <div style={styles.refItem}><kbd>\d</kbd> Digit <kbd>[0-9]</kbd></div>
          <div style={styles.refItem}><kbd>\w</kbd> Word char <kbd>[a-zA-Z0-9_]</kbd></div>
          <div style={styles.refItem}><kbd>\s</kbd> Whitespace</div>
          <div style={styles.refItem}><kbd>^</kbd> Start of string/line</div>
          <div style={styles.refItem}><kbd>$</kbd> End of string/line</div>
          <div style={styles.refItem}><kbd>*</kbd> 0 or more</div>
          <div style={styles.refItem}><kbd>+</kbd> 1 or more</div>
          <div style={styles.refItem}><kbd>?</kbd> 0 or 1</div>
          <div style={styles.refItem}><kbd>{`{n}`}</kbd> Exactly n</div>
          <div style={styles.refItem}><kbd>{`{n,}`}</kbd> n or more</div>
          <div style={styles.refItem}><kbd>{`{n,m}`}</kbd> n to m times</div>
          <div style={styles.refItem}><kbd>()</kbd> Capture group</div>
          <div style={styles.refItem}><kbd>(?:)</kbd> Non-capturing group</div>
          <div style={styles.refItem}><kbd>|</kbd> Alternation (OR)</div>
          <div style={styles.refItem}><kbd>[]</kbd> Character class</div>
          <div style={styles.refItem}><kbd>[^]</kbd> Negated class</div>
          <div style={styles.refItem}><kbd>\b</kbd> Word boundary</div>
          <div style={styles.refItem}><kbd>\B</kbd> Non-word boundary</div>
          <div style={styles.refItem}><kbd>(?=)</kbd> Positive lookahead</div>
          <div style={styles.refItem}><kbd>(?!)</kbd> Negative lookahead</div>
          <div style={styles.refItem}><kbd>{`(?<=)`}</kbd> Positive lookbehind</div>
          <div style={styles.refItem}><kbd>{`(?<!)`}</kbd> Negative lookbehind</div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px',
    color: '#1a1a2e'
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px'
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '16px'
  },
  main: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    marginBottom: '24px'
  },
  panel: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0'
  },
  section: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    fontSize: '14px',
    color: '#334155'
  },
  toggle: {
    display: 'flex',
    gap: '8px'
  },
  toggleBtn: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    color: '#475569',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  toggleActive: {
    background: '#667eea',
    borderColor: '#667eea',
    color: '#fff'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    fontSize: '13px',
    lineHeight: 1.5,
    resize: 'vertical',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '14px',
    background: '#fff',
    cursor: 'pointer',
    outline: 'none'
  },
  helper: {
    marginTop: '6px',
    fontSize: '12px',
    color: '#94a3b8'
  },
  patternInfo: {
    marginTop: '12px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  patternRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    flexWrap: 'wrap'
  },
  patternLabel: {
    fontWeight: 600,
    fontSize: '13px',
    color: '#475569',
    minWidth: '100px'
  },
  patternCode: {
    fontSize: '12px',
    background: '#e2e8f0',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#334155',
    flex: 1,
    minWidth: 0,
    wordBreak: 'break-all'
  },
  exampleCode: {
    fontSize: '12px',
    background: '#dcfce7',
    padding: '2px 6px',
    borderRadius: '4px',
    color: '#166534',
    flex: 1,
    minWidth: 0
  },
  copyBtn: {
    padding: '4px 8px',
    borderRadius: '4px',
    border: 'none',
    background: '#e2e8f0',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background 0.2s'
  },
  flags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '8px'
  },
  flag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    background: '#f1f5f9',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#334155'
  },
  flagDisplay: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#64748b',
    padding: '8px',
    background: '#f8fafc',
    borderRadius: '6px',
    wordBreak: 'break-all'
  },
  error: {
    padding: '12px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#dc2626',
    fontSize: '13px'
  },
  matches: {
    maxHeight: '300px',
    overflow: 'auto'
  },
  noMatch: {
    padding: '20px',
    textAlign: 'center',
    color: '#94a3b8'
  },
  match: {
    padding: '12px',
    marginBottom: '8px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px'
  },
  matchMain: {
    fontFamily: 'monospace',
    fontSize: '13px',
    color: '#166534',
    fontWeight: 500
  },
  matchGroups: {
    marginTop: '8px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  group: {
    fontSize: '11px',
    background: '#dcfce7',
    padding: '2px 8px',
    borderRadius: '4px',
    color: '#166534'
  },
  matchMeta: {
    marginTop: '4px',
    fontSize: '11px',
    color: '#64748b'
  },
  placeholder: {
    padding: '20px',
    textAlign: 'center',
    color: '#94a3b8'
  },
  exportPanel: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    marginBottom: '24px'
  },
  exportHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  codeBlock: {
    position: 'relative'
  },
  pre: {
    margin: 0,
    padding: '16px',
    background: '#0f172a',
    borderRadius: '8px',
    overflow: 'auto',
    fontSize: '13px',
    lineHeight: 1.6,
    color: '#e2e8f0'
  },
  copyBtnLarge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    background: '#667eea',
    color: '#fff',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background 0.2s'
  },
  refPanel: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0'
  },
  refTitle: {
    margin: '0 0 16px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#1e293b'
  },
  refGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '8px'
  },
  refItem: {
    fontSize: '12px',
    padding: '8px 12px',
    background: '#f8fafc',
    borderRadius: '6px',
    border: '1px solid #e2e8f0'
  }
};