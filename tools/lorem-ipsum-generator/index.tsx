import { useState, useMemo, useCallback } from 'react';

interface LoremOptions {
  type: 'paragraphs' | 'words' | 'sentences' | 'bytes';
  count: number;
  startWithLorem: boolean;
  html: boolean;
}

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
  'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
  'pariatur', 'excepteur', 'sint', 'occasuat', 'cupidatat', 'non', 'proident',
  'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
  'est', 'laborum', 'curabitur', 'pretium', 'tincidunt', 'lacinia', 'at', 'nibh',
  'etiam', 'fringilla', 'purus', 'orci', 'viverra', 'nec', 'venenatis', 'vel',
  'nonummy', 'lacus', 'sagittis', 'augue', 'euismod', 'massa', 'sapien', 'venenatis',
  'vehicula', 'justo', 'nulla', 'facilisis', 'at', 'vvero', 'eos', 'et', 'accusamus',
  'et', 'iusto', 'odio', 'dignissimos', 'ducimus', 'qui', 'blanditiis', 'praesentium',
  'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos', 'dolores', 'et', 'quas',
  'molestias', 'excepturi', 'sint', 'occaecati', 'cupiditate', 'non', 'provident',
  'similique', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollitia',
  'anim', 'id', 'est', 'laborum', 'et', 'dolor', 'um', 'fugiat', 'nulla', 'pariatur'
];

const LOREM_SENTENCES = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  'Curabitur pretium tincidunt lacinia at nibh.',
  'Etiam fringilla purus orci, viverra nec venenatis vel.',
  'Nulla facilisis at vero eros et accumsan et iusto odio dignissimos.',
  'Ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti.',
  'Quos dolores et quas molestias excepturi sint occaecati cupiditate.',
  'Non provident, similique sunt in culpa qui officia deserunt mollitia animi.',
  'Id est laborum et dolorum fuga et harum quidem rerum facilis est.',
  'Nam libero tempore, cum soluta nobis est eligendi optio cumque.',
  'Nihil impedit quo minus id quod maxime placeat facere possimus.',
  'Omnis voluptas assumenda est, omnis dolor repellendus.',
  'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus.',
  'Saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
  'Itaque earum rerum hic tenetur a sapiente delectus.',
  'Ut aut reiciendis voluptatibus maiores alias consequatur.',
  'Aut perferendis doloribus asperiores repellat.',
];

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateWords(count: number): string[] {
  const words: string[] = [];
  while (words.length < count) {
    words.push(...shuffleArray(LOREM_WORDS));
  }
  return words.slice(0, count);
}

function generateSentences(count: number): string[] {
  const sentences: string[] = [];
  while (sentences.length < count) {
    sentences.push(...shuffleArray(LOREM_SENTENCES));
  }
  return sentences.slice(0, count);
}

function generateParagraphs(count: number): string[] {
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i++) {
    const sentenceCount = Math.floor(Math.random() * 4) + 3; // 3-6 sentences
    const sentences = generateSentences(sentenceCount);
    paragraphs.push(sentences.join(' '));
  }
  return paragraphs;
}

export default function LoremIpsumGenerator() {
  const [options, setOptions] = useState<LoremOptions>({
    type: 'paragraphs',
    count: 3,
    startWithLorem: true,
    html: false,
  });
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const generate = useCallback(() => {
    let result = '';
    
    switch (options.type) {
      case 'words': {
        const words = generateWords(options.count);
        if (options.startWithLorem) {
          words[0] = 'Lorem';
          if (words.length > 1) words[1] = 'ipsum';
        }
        result = words.join(' ');
        break;
      }
      case 'sentences': {
        const sentences = generateSentences(options.count);
        if (options.startWithLorem && sentences.length > 0) {
          sentences[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        }
        result = sentences.join(' ');
        break;
      }
      case 'paragraphs': {
        const paragraphs = generateParagraphs(options.count);
        if (options.startWithLorem && paragraphs.length > 0) {
          paragraphs[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + paragraphs[0];
        }
        result = paragraphs.join('\n\n');
        break;
      }
      case 'bytes': {
        const targetBytes = options.count;
        let currentText = '';
        while (new TextEncoder().encode(currentText).length < targetBytes) {
          const moreParagraphs = generateParagraphs(1);
          currentText += (currentText ? '\n\n' : '') + moreParagraphs[0];
        }
        // Trim to approximate byte count
        const encoder = new TextEncoder();
        const encoded = encoder.encode(currentText);
        if (encoded.length > targetBytes) {
          result = new TextDecoder().decode(encoded.slice(0, targetBytes));
        } else {
          result = currentText;
        }
        break;
      }
    }

    if (options.html && options.type === 'paragraphs') {
      result = result.split('\n\n').map(p => `<p>${p}</p>`).join('\n');
    }

    setOutput(result);
  }, [options]);

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setHistory(prev => {
      const filtered = prev.filter(h => h !== output);
      return [output, ...filtered].slice(0, 10);
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = () => setHistory([]);

  // Generate on mount and option change
  useMemo(() => {
    generate();
  }, [generate]);

  const presets = [
    { label: '1 Paragraph', type: 'paragraphs' as const, count: 1 },
    { label: '3 Paragraphs', type: 'paragraphs' as const, count: 3 },
    { label: '5 Paragraphs', type: 'paragraphs' as const, count: 5 },
    { label: '100 Words', type: 'words' as const, count: 100 },
    { label: '500 Words', type: 'words' as const, count: 500 },
    { label: '1000 Words', type: 'words' as const, count: 1000 },
    { label: '5 Sentences', type: 'sentences' as const, count: 5 },
    { label: '1 KB', type: 'bytes' as const, count: 1024 },
    { label: '5 KB', type: 'bytes' as const, count: 5120 },
  ];

  const wordCount = useMemo(() => {
    return output.trim() ? output.trim().split(/\s+/).length : 0;
  }, [output]);

  const charCount = useMemo(() => {
    return output.length;
  }, [output]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Lorem Ipsum Generator</h2>
        <p className="tool-desc">Generate placeholder text in paragraphs, words, sentences, or bytes. Optionally start with classic "Lorem ipsum" and wrap in HTML tags.</p>
      </div>

      <div className="lorem-layout">
        <div className="options-panel">
          <div className="control-group">
            <label>Output Type</label>
            <div className="type-tabs">
              {(['paragraphs', 'words', 'sentences', 'bytes'] as const).map(type => (
                <button
                  key={type}
                  className={options.type === type ? 'active' : ''}
                  onClick={() => setOptions(prev => ({ ...prev, type }))}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>Count: {options.count}</label>
            <input
              type="range"
              min={options.type === 'bytes' ? 10 : 1}
              max={options.type === 'bytes' ? 50000 : options.type === 'words' ? 5000 : 50}
              step={options.type === 'bytes' ? 10 : 1}
              value={options.count}
              onChange={e => setOptions(prev => ({ ...prev, count: parseInt(e.target.value, 10) }))}
              className="count-slider"
            />
            <div className="preset-buttons">
              {presets
                .filter(p => p.type === options.type)
                .map(preset => (
                  <button
                    key={preset.label}
                    className={options.count === preset.count ? 'active' : ''}
                    onClick={() => setOptions(prev => ({ ...prev, count: preset.count }))}
                  >
                    {preset.label}
                  </button>
                ))}
            </div>
          </div>

          <div className="control-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={options.startWithLorem}
                onChange={e => setOptions(prev => ({ ...prev, startWithLorem: e.target.checked }))}
              />
              Start with "Lorem ipsum"
            </label>
            <label>
              <input
                type="checkbox"
                checked={options.html}
                onChange={e => setOptions(prev => ({ ...prev, html: e.target.checked }))}
                disabled={options.type !== 'paragraphs'}
              />
              Wrap paragraphs in <p> tags
            </label>
          </div>

          <div className="action-buttons">
            <button className="btn-primary" onClick={generate}>
              Generate
            </button>
            <button 
              className={copied ? 'btn-primary copied' : 'btn-primary'} 
              onClick={copyToClipboard}
              disabled={!output}
            >
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
          </div>

          <div className="stats">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            <span>{output.split('\n\n').filter(p => p.trim()).length} paragraphs</span>
          </div>
        </div>

        <div className="output-panel">
          <div className="output-toolbar">
            <h3>Generated Text</h3>
          </div>
          
          {output ? (
            <div className="lorem-output">
              <pre className={options.html ? 'html-output' : ''}>
                {output}
              </pre>
            </div>
          ) : (
            <div className="empty-state">
              <p>Click "Generate" to create placeholder text</p>
            </div>
          )}

          {history.length > 0 && (
            <div className="history-panel">
              <div className="history-header">
                <h4>Recent Outputs</h4>
                <button className="btn-secondary btn-sm" onClick={clearHistory}>Clear</button>
              </div>
              <div className="history-list">
                {history.map((h, i) => (
                  <div key={i} className="history-item" onClick={() => {
                    navigator.clipboard.writeText(h);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}>
                    <code>{h.slice(0, 100)}{h.length > 100 ? '...' : ''}</code>
                    <span className="history-action">Click to copy</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="help-section">
        <details>
          <summary>Lorem Ipsum Guide</summary>
          <div className="help-content">
            <h4>What is Lorem Ipsum?</h4>
            <p>Lorem Ipsum is dummy text used in printing and typesetting. It's been the industry standard since the 1500s, when an unknown printer scrambled a galley of type to make a type specimen book.</p>

            <h4>Output Types</h4>
            <ul>
              <li><strong>Paragraphs</strong> — Multi-sentence blocks separated by blank lines (best for layouts)</li>
              <li><strong>Words</strong> — Exact word count, space-separated</li>
              <li><strong>Sentences</strong> — Complete sentences with proper punctuation</li>
              <li><strong>Bytes</strong> — Approximate byte size (useful for testing file uploads, database fields)</li>
            </ul>

            <h4>Options</h4>
            <ul>
              <li><strong>Start with "Lorem ipsum"</strong> — Ensures classic opening for recognition</li>
              <li><strong>Wrap in <p> tags</strong> — Outputs valid HTML paragraphs (paragraphs mode only)</li>
            </ul>

            <h4>Common Use Cases</h4>
            <ul>
              <li>Design mockups and wireframes</li>
              <li>CMS content placeholder</li>
              <li>Testing text truncation/overflow</li>
              <li>Database field size validation</li>
              <li>API response simulation</li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
}