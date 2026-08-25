import { useState, useMemo } from 'react';

interface BeautifyOptions {
  indentSize: number;
  indentChar: 'space' | 'tab';
  selectorSeparator: string;
  braceStyle: 'collapse' | 'expand' | 'end-expand' | 'expand-strict';
  semicolons: boolean;
}

function beautifyCSS(input: string, options: BeautifyOptions): string {
  if (!input.trim()) return '';
  
  const indent = options.indentChar === 'tab' ? '\t' : ' '.repeat(options.indentSize);
  let output = '';
  let indentLevel = 0;
  let inSelector = false;
  let inRule = false;
  let buffer = '';
  
  // First, normalize whitespace
  let normalized = input
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, ' { ')
    .replace(/\s*}\s*/g, ' } ')
    .replace(/\s*:\s*/g, ': ')
    .replace(/\s*;\s*/g, '; ')
    .replace(/\s*,\s*/g, ', ')
    .trim();
  
  // Tokenize
  const tokens = normalized.match(/{|}|[^{};,]+/g) || [];
  
  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;
    
    if (trimmed === '{') {
      if (options.braceStyle === 'collapse' || options.braceStyle === 'expand') {
        output = output.trimEnd() + ' ' + trimmed + ' ';
      } else if (options.braceStyle === 'end-expand') {
        output = output.trimEnd() + ' ' + trimmed + '\n' + indent.repeat(indentLevel + 1);
      } else if (options.braceStyle === 'expand-strict') {
        output += '\n' + indent.repeat(indentLevel) + trimmed + '\n' + indent.repeat(indentLevel + 1);
      }
      indentLevel++;
      inRule = true;
    } else if (trimmed === '}') {
      indentLevel = Math.max(0, indentLevel - 1);
      if (options.braceStyle === 'collapse') {
        output = output.trimEnd() + ' ' + trimmed + (options.semicolons ? ' ' : '\n');
      } else if (options.braceStyle === 'expand') {
        output += '\n' + indent.repeat(indentLevel) + trimmed + '\n';
      } else {
        output += '\n' + indent.repeat(indentLevel) + trimmed + '\n';
      }
      inRule = false;
    } else if (trimmed.endsWith(':')) {
      // Property
      output += '\n' + indent.repeat(indentLevel) + trimmed + ' ';
    } else if (trimmed.endsWith(';')) {
      // Property value
      output += trimmed + (options.semicolons ? ' ' : '\n');
    } else if (trimmed.includes(',')) {
      // Selector separator
      const selectors = trimmed.split(',').map(s => s.trim());
      output += selectors.join(options.selectorSeparator);
      inSelector = true;
    } else {
      // Selector or property value
      if (inSelector) {
        output += trimmed + ' ';
      } else if (inRule) {
        output += trimmed + (options.semicolons ? ' ' : '\n');
      } else {
        output += trimmed + ' ';
        inSelector = true;
      }
    }
  }
  
  return output.trim() + '\n';
}

function minifyCSS(input: string): string {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/\s*{\s*/g, '{')
    .replace(/\s*}\s*/g, '}')
    .replace(/\s*:\s*/g, ':')
    .replace(/\s*;\s*/g, ';')
    .replace(/\s*,\s*/g, ',')
    .replace(/;\}/g, '}') // Remove last semicolon before }
    .trim();
}

export default function CssBeautifier() {
  const [input, setInput] = useState(`/* Example CSS */
.container {
  display: flex;
  flex-direction: column;
  padding: 20px;
  margin: 0 auto;
  max-width: 1200px;
}

.header {
  background-color: #3b82f6;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
}

.button {
  background: #fff;
  color: #3b82f6;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.button:hover {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
}`);
  const [output, setOutput] = useState('');
  const [options, setOptions] = useState<BeautifyOptions>({
    indentSize: 2,
    indentChar: 'space',
    selectorSeparator: ',\n',
    braceStyle: 'expand',
    semicolons: true,
  });
  const [mode, setMode] = useState<'beautify' | 'minify'>('beautify');
  const [copied, setCopied] = useState(false);

  const processedOutput = useMemo(() => {
    if (mode === 'minify') {
      return minifyCSS(input);
    }
    return beautifyCSS(input, options);
  }, [input, options, mode]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(processedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOptionChange = (key: keyof BeautifyOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>CSS Beautifier / Minifier</h2>
        <p className="tool-desc">Format, beautify, or minify CSS code with configurable options.</p>
      </div>

      <div className="tool-grid">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <div className="mode-toggle">
              <button
                className={mode === 'beautify' ? 'active' : ''}
                onClick={() => setMode('beautify')}
              >
                Beautify
              </button>
              <button
                className={mode === 'minify' ? 'active' : ''}
                onClick={() => setMode('minify')}
              >
                Minify
              </button>
            </div>
            <button className="copy-btn" onClick={copyToClipboard}>
              {copied ? '✓ Copied!' : 'Copy Output'}
            </button>
          </div>

          <textarea
            className="code-editor"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste CSS here..."
            spellCheck={false}
          />

          {mode === 'beautify' && (
            <div className="options-panel">
              <h4>Beautify Options</h4>
              <div className="options-grid">
                <div className="option-row">
                  <label>Indent Size</label>
                  <select
                    value={options.indentSize}
                    onChange={e => handleOptionChange('indentSize', parseInt(e.target.value))}
                  >
                    <option value={2}>2 spaces</option>
                    <option value={4}>4 spaces</option>
                    <option value={8}>8 spaces</option>
                  </select>
                </div>
                <div className="option-row">
                  <label>Indent Char</label>
                  <select
                    value={options.indentChar}
                    onChange={e => handleOptionChange('indentChar', e.target.value as 'space' | 'tab')}
                  >
                    <option value="space">Spaces</option>
                    <option value="tab">Tabs</option>
                  </select>
                </div>
                <div className="option-row">
                  <label>Brace Style</label>
                  <select
                    value={options.braceStyle}
                    onChange={e => handleOptionChange('braceStyle', e.target.value as any)}
                  >
                    <option value="collapse">Collapse (one line)</option>
                    <option value="expand">Expand (new line)</option>
                    <option value="end-expand">End-expand</option>
                    <option value="expand-strict">Expand-strict</option>
                  </select>
                </div>
                <div className="option-row">
                  <label>Selector Separator</label>
                  <select
                    value={options.selectorSeparator}
                    onChange={e => handleOptionChange('selectorSeparator', e.target.value)}
                  >
                    <option value=",\n">New line</option>
                    <option value=", ">Space</option>
                  </select>
                </div>
                <div className="option-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={options.semicolons}
                      onChange={e => handleOptionChange('semicolons', e.target.checked)}
                    />
                    Keep semicolons
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="output-panel">
          <div className="output-header">
            <h3>Output</h3>
            <span className="stats">
              {processedOutput.length} chars • {processedOutput.split('\n').length} lines
            </span>
          </div>
          <pre className="code-output"><code>{processedOutput}</code></pre>
        </div>
      </div>
    </div>
  );
}