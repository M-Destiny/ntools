import { useState } from 'react';

const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const thousands = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion'];

function convertHundreds(num: number): string {
  if (num === 0) return '';
  if (num < 20) return ones[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return tens[ten] + (one ? '-' + ones[one] : '');
  }
  const hundred = Math.floor(num / 100);
  const rest = num % 100;
  return ones[hundred] + ' hundred' + (rest ? ' ' + convertHundreds(rest) : '');
}

function numberToWords(num: number): string {
  if (num === 0) return 'zero';
  if (num < 0) return 'minus ' + numberToWords(-num);
  
  const isDecimal = num % 1 !== 0;
  if (isDecimal) {
    const parts = num.toString().split('.');
    const integerPart = parseInt(parts[0]);
    const decimalPart = parts[1];
    return numberToWords(integerPart) + ' point ' + decimalPart.split('').map(d => ones[parseInt(d)]).join(' ');
  }

  let result = '';
  let thousandIndex = 0;
  
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk !== 0) {
      const chunkWords = convertHundreds(chunk);
      const thousandWord = thousands[thousandIndex];
      result = chunkWords + (thousandWord ? ' ' + thousandWord : '') + (result ? ' ' + result : '');
    }
    num = Math.floor(num / 1000);
    thousandIndex++;
  }
  
  return result;
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

export default function NumberToWords() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const processInput = () => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      return;
    }

    const num = parseFloat(input.replace(/,/g, ''));
    if (isNaN(num)) {
      setError('Please enter a valid number');
      setOutput('');
      return;
    }

    if (!isFinite(num)) {
      setError('Number is too large');
      setOutput('');
      return;
    }

    setOutput(numberToWords(num));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    processInput();
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    setInput('1234567.89');
    processInput();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const formattedInput = input && !isNaN(parseFloat(input.replace(/,/g, ''))) ? formatNumber(parseFloat(input.replace(/,/g, ''))) : '';

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Number to Words</h2>
        <p className="tool-desc">Convert numbers to their English word representation. Supports decimals, negatives, and large numbers.</p>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="json-editor"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter a number (e.g., 1234567.89)..."
            spellCheck={false}
          />
          {formattedInput && (
            <div className="formatted-hint">Formatted: {formattedInput}</div>
          )}
        </div>

        <div className="controls-panel">
          <div className="status">
            {error ? (
              <span className="error">✗ {error}</span>
            ) : input ? (
              <span className="success">✓ Converted</span>
            ) : (
              <span className="muted">Enter a number to convert</span>
            )}
          </div>

          <div className="stats">
            <span>Input: {input.length} chars</span>
            <span>Output: {output.length} chars</span>
          </div>

          <div className="examples">
            <h4>Examples:</h4>
            <ul>
              <li>42 → "forty-two"</li>
              <li>100 → "one hundred"</li>
              <li>1234 → "one thousand two hundred thirty-four"</li>
              <li>-56 → "minus fifty-six"</li>
              <li>3.14 → "three point one four"</li>
            </ul>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Output</h3>
            <div className="toolbar-actions">
              <button onClick={copyOutput} className={copied ? 'copied' : ''}>
                {copied ? '✓ Copied!' : 'Copy Output'}
              </button>
            </div>
          </div>
          <textarea
            className="json-editor output"
            value={output}
            readOnly
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}