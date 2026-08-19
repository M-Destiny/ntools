import { useState, useEffect } from 'react';

export default function TextStatistics() {
  const [input, setInput] = useState('');
  const [stats, setStats] = useState<Record<string, string | number>>({});
  const [copied, setCopied] = useState(false);

  const calculateStats = (text: string) => {
    if (!text) {
      setStats({});
      return;
    }

    const lines = text.split('\n');
    const nonEmptyLines = lines.filter(l => l.trim().length > 0);
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const charactersNoNewlines = text.replace(/\n/g, '').length;
    const paragraphs = text.trim().split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Character frequency
    const charFreq: Record<string, number> = {};
    for (const char of text.toLowerCase()) {
      if (char.match(/[a-z0-9]/)) {
        charFreq[char] = (charFreq[char] || 0) + 1;
      }
    }
    const topChars = Object.entries(charFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([c, n]) => `${c}: ${n}`)
      .join(', ');

    // Word frequency
    const wordFreq: Record<string, number> = {};
    for (const word of words) {
      const clean = word.toLowerCase().replace(/[^\w']/g, '');
      if (clean.length > 0) {
        wordFreq[clean] = (wordFreq[clean] || 0) + 1;
      }
    }
    const topWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([w, n]) => `${w} (${n})`)
      .join(', ');

    // Reading time (average 200 words/min)
    const readingTimeMinutes = Math.ceil(words.length / 200);
    const speakingTimeMinutes = Math.ceil(words.length / 130);

    // Longest/shortest words
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    const longestWord = sortedWords[0] || '';
    const shortestWord = sortedWords[sortedWords.length - 1] || '';

    // Line stats
    const lineLengths = lines.map(l => l.length);
    const avgLineLength = lineLengths.reduce((a, b) => a + b, 0) / lineLengths.length || 0;
    const maxLineLength = Math.max(...lineLengths, 0);
    const minLineLength = lineLengths.length > 0 ? Math.min(...lineLengths) : 0;

    setStats({
      characters,
      charactersNoSpaces,
      charactersNoNewlines,
      words: words.length,
      uniqueWords: Object.keys(wordFreq).length,
      lines: lines.length,
      nonEmptyLines: nonEmptyLines.length,
      paragraphs: paragraphs.length,
      sentences: sentences.length,
      readingTimeMinutes,
      speakingTimeMinutes,
      longestWord,
      shortestWord,
      avgLineLength: avgLineLength.toFixed(1),
      maxLineLength,
      minLineLength,
      topChars: topChars || 'N/A',
      topWords: topWords || 'N/A'
    });
  };

  useEffect(() => {
    calculateStats(input);
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const copyStats = () => {
    const text = Object.entries(stats)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}: ${v}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setStats({});
  };

  const loadExample = () => {
    setInput(`The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once.

It is commonly used for font testing and keyboard testing because it includes all 26 letters in a relatively short sentence.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`);
  };

  const statGroups = [
    { title: 'Characters', items: [
      { key: 'characters', label: 'Total characters' },
      { key: 'charactersNoSpaces', label: 'Excluding spaces' },
      { key: 'charactersNoNewlines', label: 'Excluding newlines' }
    ]},
    { title: 'Words', items: [
      { key: 'words', label: 'Total words' },
      { key: 'uniqueWords', label: 'Unique words' },
      { key: 'longestWord', label: 'Longest word' },
      { key: 'shortestWord', label: 'Shortest word' }
    ]},
    { title: 'Structure', items: [
      { key: 'lines', label: 'Total lines' },
      { key: 'nonEmptyLines', label: 'Non-empty lines' },
      { key: 'paragraphs', label: 'Paragraphs' },
      { key: 'sentences', label: 'Sentences' }
    ]},
    { title: 'Line Stats', items: [
      { key: 'avgLineLength', label: 'Avg line length' },
      { key: 'maxLineLength', label: 'Max line length' },
      { key: 'minLineLength', label: 'Min line length' }
    ]},
    { title: 'Estimates', items: [
      { key: 'readingTimeMinutes', label: 'Reading time (min)', suffix: ' min' },
      { key: 'speakingTimeMinutes', label: 'Speaking time (min)', suffix: ' min' }
    ]},
    { title: 'Frequency', items: [
      { key: 'topChars', label: 'Top characters' },
      { key: 'topWords', label: 'Top words' }
    ]}
  ];

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Text Statistics</h2>
        <p className="tool-desc">Analyze text with comprehensive statistics: character/word counts, reading time, frequency analysis, and more.</p>
      </div>

      <div className="stats-toolbar">
        <div className="toolbar-group">
          <button onClick={clearAll} className="btn-secondary">Clear</button>
          <button onClick={copyStats} className={copied ? 'copied' : 'btn-secondary'}>
            {copied ? '✓ Copied!' : 'Copy All Stats'}
          </button>
          <button onClick={loadExample} className="btn-secondary">Load Example</button>
        </div>
      </div>

      <div className="stats-layout">
        <div className="editor-pane">
          <div className="pane-header">
            <h3>Input Text</h3>
            <span className="live-count">{input.length} chars • {input.trim() ? input.trim().split(/\s+/).length : 0} words</span>
          </div>
          <textarea
            className="stats-editor"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste or type text to analyze..."
            spellCheck={false}
            rows={20}
          />
        </div>

        <div className="stats-results">
          <div className="pane-header">
            <h3>Statistics</h3>
          </div>
          <div className="stats-grid">
            {statGroups.map(group => (
              <div key={group.title} className="stat-group">
                <h4>{group.title}</h4>
                {group.items.map(item => {
                  const value = stats[item.key as keyof typeof stats];
                  if (value === undefined || value === '') return null;
                  const suffix = (item as any).suffix || '';
                  return (
                    <div key={item.key} className="stat-item">
                      <span className="stat-label">{item.label}</span>
                      <span className="stat-value">{value}{suffix}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="stats-info">
        <details>
          <summary>About Text Statistics</summary>
          <ul>
            <li><strong>Words</strong> split on whitespace; unique words are case-insensitive</li>
            <li><strong>Sentences</strong> split on . ! ? punctuation</li>
            <li><strong>Paragraphs</strong> split on double newlines</li>
            <li><strong>Reading time</strong> assumes 200 words/minute (average adult)</li>
            <li><strong>Speaking time</strong> assumes 130 words/minute (average speech)</li>
            <li><strong>Frequency</strong> shows top 10 characters (a-z, 0-9) and words (case-insensitive, punctuation stripped)</li>
            <li>All calculations update in real-time as you type</li>
          </ul>
        </details>
      </div>
    </div>
  );
}