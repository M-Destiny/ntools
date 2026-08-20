import { useState, useEffect } from 'react';

type CaseType = 'lower' | 'upper' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'dot' | 'path' | 'header' | 'capitalize';

interface CaseOption {
  id: CaseType;
  label: string;
  description: string;
}

const CASE_OPTIONS: CaseOption[] = [
  { id: 'lower', label: 'lowercase', description: 'all lowercase' },
  { id: 'upper', label: 'UPPERCASE', description: 'all uppercase' },
  { id: 'title', label: 'Title Case', description: 'First Letter Of Each Word' },
  { id: 'sentence', label: 'Sentence case', description: 'First letter only' },
  { id: 'camel', label: 'camelCase', description: 'first word lowercase, rest capitalized' },
  { id: 'pascal', label: 'PascalCase', description: 'All words capitalized' },
  { id: 'snake', label: 'snake_case', description: 'lowercase with underscores' },
  { id: 'kebab', label: 'kebab-case', description: 'lowercase with hyphens' },
  { id: 'constant', label: 'CONSTANT_CASE', description: 'uppercase with underscores' },
  { id: 'dot', label: 'dot.case', description: 'lowercase with dots' },
  { id: 'path', label: 'path/case', description: 'lowercase with slashes' },
  { id: 'header', label: 'Header-Case', description: 'Capitalized with hyphens' },
  { id: 'capitalize', label: 'Capitalize', description: 'First letter of string only' },
];

function convertCase(text: string, caseType: CaseType): string {
  if (!text) return '';
  
  // Split into words (handle various separators)
  const words = text
    .trim()
    .split(/[\s_\-\.]+/)
    .filter(w => w.length > 0)
    .map(w => w.toLowerCase());

  if (words.length === 0) return '';

  switch (caseType) {
    case 'lower':
      return words.join(' ').toLowerCase();
    case 'upper':
      return words.join(' ').toUpperCase();
    case 'title':
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    case 'sentence':
      return words[0].charAt(0).toUpperCase() + words[0].slice(1) + words.slice(1).join(' ');
    case 'camel':
      return words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    case 'pascal':
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    case 'snake':
      return words.join('_');
    case 'kebab':
      return words.join('-');
    case 'constant':
      return words.map(w => w.toUpperCase()).join('_');
    case 'dot':
      return words.join('.');
    case 'path':
      return words.join('/');
    case 'header':
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-');
    case 'capitalize':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    default:
      return text;
  }
}

export default function TextCaseConverter() {
  const [input, setInput] = useState('');
  const [selectedCase, setSelectedCase] = useState<CaseType>('lower');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Compute output when input or selected case changes
  useEffect(() => {
    setOutput(convertCase(input, selectedCase));
  }, [input, selectedCase]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setCopied(false);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const clearAll = () => {
    setInput('');
    setOutput('');
    setCopied(false);
  };

  const loadSample = (sample: string) => {
    setInput(sample);
  };

  const samples = [
    'hello world',
    'Hello World',
    'HELLO WORLD',
    'hello_world',
    'hello-world',
    'hello.world',
    'camelCaseExample',
    'PascalCaseExample',
    'CONSTANT_CASE_EXAMPLE',
    'this is a test string',
    'user_id',
    'api-response-code',
    'XMLHttpRequest',
    'getUserById',
  ];

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Text Case Converter</h2>
        <p className="tool-desc">Convert text between 13 different case formats. Enter text and select a case style, or view all conversions at once.</p>
      </div>

      <div className="case-converter">
        {/* Input Area */}
        <div className="input-section">
          <div className="section-header">
            <h3>Input Text</h3>
            <button onClick={clearAll} className="btn-secondary" disabled={!input}>
              Clear
            </button>
          </div>
          <textarea
            className="case-editor"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter text to convert..."
            spellCheck={false}
            rows={4}
          />
          <div className="sample-buttons">
            <span>Samples:</span>
            {samples.map((sample, i) => (
              <button key={i} onClick={() => loadSample(sample)} className="sample-btn">
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Case Selector */}
        <div className="case-selector">
          <h3>Output Case</h3>
          <div className="case-options">
            {CASE_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setSelectedCase(opt.id)}
                className={`case-option ${selectedCase === opt.id ? 'active' : ''}`}
                title={opt.description}
              >
                <span className="case-preview">{convertCase('Sample Text', opt.id)}</span>
                <span className="case-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Output Area */}
        <div className="output-section">
          <div className="section-header">
            <h3>Output ({CASE_OPTIONS.find(o => o.id === selectedCase)?.label})</h3>
            <div className="output-actions">
              <button 
                onClick={copyOutput} 
                className={copied ? 'copied' : 'btn-primary'}
                disabled={!output}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <button onClick={() => setShowAll(!showAll)} className="btn-secondary">
                {showAll ? 'Show Selected Only' : 'Show All Cases'}
              </button>
            </div>
          </div>

          {showAll ? (
            <div className="all-cases-output">
              {CASE_OPTIONS.map(opt => (
                <div key={opt.id} className="case-result-row">
                  <span className="case-name">{opt.label}</span>
                  <div className="case-result-wrapper">
                    <code className="case-result">{convertCase(input, opt.id) || '—'}</code>
                    <button 
                      onClick={() => navigator.clipboard.writeText(convertCase(input, opt.id))}
                      className="copy-inline"
                      title="Copy this result"
                      disabled={!input}
                    >
                      📋
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <textarea
              className="case-editor output"
              value={output}
              readOnly
              spellCheck={false}
              rows={4}
            />
          )}

          <div className="output-stats">
            <span>{input.length} chars in → {output.length} chars out</span>
            <span className="word-count">{input.trim() ? input.trim().split(/\s+/).length : 0} words</span>
          </div>
        </div>

        {/* Help Section */}
        <div className="help-section">
          <details>
            <summary>Case Format Reference</summary>
            <div className="help-content">
              <table className="case-reference-table">
                <thead>
                  <tr>
                    <th>Format</th>
                    <th>Example</th>
                    <th>Use Case</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>lowercase</td><td>hello world</td><td>General text</td></tr>
                  <tr><td>UPPERCASE</td><td>HELLO WORLD</td><td>Constants, headers</td></tr>
                  <tr><td>Title Case</td><td>Hello World</td><td>Titles, headings</td></tr>
                  <tr><td>Sentence case</td><td>Hello world</td><td>Sentences, UI labels</td></tr>
                  <tr><td>camelCase</td><td>helloWorld</td><td>JavaScript variables</td></tr>
                  <tr><td>PascalCase</td><td>HelloWorld</td><td>Classes, components</td></tr>
                  <tr><td>snake_case</td><td>hello_world</td><td>Python, SQL, config</td></tr>
                  <tr><td>kebab-case</td><td>hello-world</td><td>URLs, CSS, CLI</td></tr>
                  <tr><td>CONSTANT_CASE</td><td>HELLO_WORLD</td><td>Env vars, constants</td></tr>
                  <tr><td>dot.case</td><td>hello.world</td><td>DNS, packages</td></tr>
                  <tr><td>path/case</td><td>hello/world</td><td>File paths, routes</td></tr>
                  <tr><td>Header-Case</td><td>Hello-World</td><td>HTTP headers</td></tr>
                  <tr><td>Capitalize</td><td>Hello world</td><td>First word only</td></tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}