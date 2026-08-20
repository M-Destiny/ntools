import { useState, useEffect } from 'react';

const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', '.': '.-.-.-', ',': '--..--', '?': '..--..',
  "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
  '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.'
};

const REVERSE_MORSE: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_CODE).map(([k, v]) => [v, k])
);

export default function MorseCodeTranslator() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'text-to-morse' | 'morse-to-text'>('text-to-morse');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setError(null);
    try {
      let result = '';
      if (mode === 'text-to-morse') {
        const words = input.trim().toUpperCase().split(/\s+/);
        result = words.map(word => 
          word.split('').map(char => MORSE_CODE[char] || '').filter(Boolean).join(' ')
        ).join('   ');
      } else {
        const words = input.trim().split('   ');
        result = words.map(word => 
          word.trim().split(' ').map(code => REVERSE_MORSE[code] || '').join('')
        ).join(' ');
      }
      setOutput(result);
    } catch (e) {
      setError('Translation failed');
      setOutput('');
    }
  }, [input, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setError(null);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const swapMode = () => {
    setMode(prev => prev === 'text-to-morse' ? 'morse-to-text' : 'text-to-morse');
    setInput(output);
    setError(null);
  };

  const loadExample = () => {
    if (mode === 'text-to-morse') {
      setInput('SOS HELLO WORLD');
    } else {
      setInput('... --- ...   .... . .-.. .-.. ---   .-- --- .-. .-.. -..');
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Morse Code Translator</h2>
        <p className="tool-desc">Convert between text and Morse code. Use dots (.) and dashes (-) for Morse, separate letters with spaces, words with 3 spaces.</p>
      </div>

      <div className="morse-toolbar">
        <div className="toolbar-group">
          <button onClick={clearAll} className="btn-secondary">Clear</button>
          <button onClick={copyOutput} className={copied ? 'copied' : 'btn-secondary'}>
            {copied ? '✓ Copied!' : 'Copy Output'}
          </button>
          <button onClick={loadExample} className="btn-secondary">Load Example</button>
          <button onClick={swapMode} className="btn-secondary swap-btn" title="Swap direction">
            ⇅ Swap
          </button>
        </div>
        <div className="toolbar-group">
          <label>
            <input
              type="radio"
              name="mode"
              value="text-to-morse"
              checked={mode === 'text-to-morse'}
              onChange={() => setMode('text-to-morse')}
            />
            Text → Morse
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="morse-to-text"
              checked={mode === 'morse-to-text'}
              onChange={() => setMode('morse-to-text')}
            />
            Morse → Text
          </label>
        </div>
      </div>

      {error && <div className="error-banner">✗ {error}</div>}

      <div className="morse-layout">
        <div className="editor-pane">
          <div className="pane-header">
            <h3>Input ({mode === 'text-to-morse' ? 'Text' : 'Morse Code'})</h3>
          </div>
          <textarea
            className="morse-editor"
            value={input}
            onChange={handleInputChange}
            placeholder={mode === 'text-to-morse' 
              ? 'Enter text to convert to Morse...' 
              : 'Enter Morse code (· − or . -)...'}
            spellCheck={false}
            rows={12}
          />
          <div className="input-stats">
            <span>{input.length} characters</span>
          </div>
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <h3>Output ({mode === 'text-to-morse' ? 'Morse Code' : 'Text'})</h3>
          </div>
          <textarea
            className="morse-editor output"
            value={output}
            readOnly
            spellCheck={false}
            rows={12}
          />
          <div className="output-stats">
            <span>{output.length} characters</span>
          </div>
        </div>
      </div>

      <div className="morse-info">
        <details>
          <summary>Morse Code Reference</summary>
          <div className="morse-reference">
            <table>
              <thead>
                <tr><th>Char</th><th>Morse</th><th>Char</th><th>Morse</th><th>Char</th><th>Morse</th></tr>
              </thead>
              <tbody>
                {Object.entries(MORSE_CODE).slice(0, 26).map(([char, code], i) => (
                  i % 3 === 0 ? (
                    <tr key={char}>
                      <td>{char}</td><td><code>{code}</code></td>
                      <td>{Object.keys(MORSE_CODE)[i + 1]}</td><td><code>{Object.values(MORSE_CODE)[i + 1]}</code></td>
                      <td>{Object.keys(MORSE_CODE)[i + 2]}</td><td><code>{Object.values(MORSE_CODE)[i + 2]}</code></td>
                    </tr>
                  ) : null
                ))}
              </tbody>
            </table>
            <p><strong>Rules:</strong> Letters separated by space, words by 3 spaces. Use . and - or · and − for dots/dashes.</p>
          </div>
        </details>
      </div>
    </div>
  );
}