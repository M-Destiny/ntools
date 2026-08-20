import { useState } from 'react';

export default function Base64Decoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'decode' | 'encode'>('decode');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [inputEncoding, setInputEncoding] = useState<'utf8' | 'base64'>('base64');

  const processData = () => {
    setError(null);
    try {
      if (mode === 'decode') {
        // Decode base64 to text
        const binary = atob(input.replace(/[\s\n\r]/g, ''));
        // Try to decode as UTF-8
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        setOutput(new TextDecoder('utf-8').decode(bytes));
      } else {
        // Encode text to base64
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        let binary = '';
        for (let i = 0; i < data.length; i++) {
          binary += String.fromCharCode(data[i]);
        }
        setOutput(btoa(binary));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Processing failed');
      setOutput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    processData();
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    if (mode === 'decode') {
      setInput('SGVsbG8gV29ybGQhIFRoaXMgaXMgYSBiYXNlNjQgZW5jb2RlZCBzdHJpbmcu');
    } else {
      setInput('Hello World! This is a plain text string to encode.');
    }
    processData();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const swapMode = () => {
    const newMode = mode === 'decode' ? 'encode' : 'decode';
    setMode(newMode);
    setInput(output);
    setOutput(input);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Base64 Encoder/Decoder</h2>
        <p className="tool-desc">Encode text to Base64 or decode Base64 back to text. Supports UTF-8 encoding.</p>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input ({mode === 'decode' ? 'Base64' : 'Text'})</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="json-editor"
            value={input}
            onChange={handleInputChange}
            placeholder={mode === 'decode' ? 'Paste Base64 string here...' : 'Enter text to encode...'}
            spellCheck={false}
          />
        </div>

        <div className="controls-panel">
          <div className="mode-selector">
            <label>Mode</label>
            <div className="mode-buttons">
              {(['decode', 'encode'] as const).map(m => (
                <button
                  key={m}
                  className={mode === m ? 'active' : ''}
                  onClick={() => { setMode(m); processData(); }}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button className="swap-btn" onClick={swapMode} title="Swap input/output">
            ⇅ Swap
          </button>

          <div className="status">
            {error ? (
              <span className="error">✗ {error}</span>
            ) : (
              <span className="success">✓ Ready</span>
            )}
          </div>

          <div className="stats">
            <span>Input: {input.length} chars</span>
            <span>Output: {output.length} chars</span>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Output ({mode === 'decode' ? 'Text' : 'Base64'})</h3>
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