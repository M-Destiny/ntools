import { useState, useEffect } from 'react';

export default function Base64Encoder() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');

  // Compute output whenever input or mode changes
  useEffect(() => {
    setError(null);
    try {
      let result: string;
      if (mode === 'encode') {
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        let binary = '';
        const len = data.length;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(data[i]);
        }
        result = btoa(binary);
      } else {
        const binary = atob(input.replace(/\s/g, ''));
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const decoder = new TextDecoder('utf-8', { fatal: true });
        result = decoder.decode(bytes);
      }
      setOutput(result);
    } catch (e) {
      setError(mode === 'encode' ? 'Encoding failed' : 'Invalid Base64 input');
      setOutput('');
    }
  }, [input, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setError(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setFileType(file.type || 'unknown');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const len = bytes.length;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      setInput(base64);
      setOutput(base64);
      setInputType('file');
      setMode('encode');
    };
    reader.readAsArrayBuffer(file);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'encode' ? 'encoded.txt' : 'decoded.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
    setFileName('');
    setFileType('');
    setInputType('text');
  };

  const swapMode = () => {
    setMode(prev => prev === 'encode' ? 'decode' : 'encode');
    setInput(output);
    setError(null);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Base64 Encoder/Decoder</h2>
        <p className="tool-desc">Encode text or files to Base64, decode Base64 back to text. Supports UTF-8 and binary files.</p>
      </div>

      <div className="base64-toolbar">
        <div className="toolbar-group">
          <button onClick={clearAll} className="btn-secondary">Clear</button>
          <button onClick={copyOutput} className={copied ? 'copied' : 'btn-secondary'}>
            {copied ? '✓ Copied!' : 'Copy Output'}
          </button>
          <button onClick={downloadOutput} className="btn-secondary">Download</button>
          <button onClick={swapMode} className="btn-secondary swap-btn" title="Swap encode/decode">
            ⇅ Swap
          </button>
        </div>
        <div className="toolbar-group">
          <label>
            <input
              type="radio"
              name="mode"
              value="encode"
              checked={mode === 'encode'}
              onChange={() => setMode('encode')}
            />
            Encode
          </label>
          <label>
            <input
              type="radio"
              name="mode"
              value="decode"
              checked={mode === 'decode'}
              onChange={() => setMode('decode')}
            />
            Decode
          </label>
        </div>
      </div>

      {error && <div className="error-banner">✗ {error}</div>}

      <div className="base64-layout">
        <div className="editor-pane">
          <div className="pane-header">
            <h3>Input ({mode === 'encode' ? 'Plain Text' : 'Base64'})</h3>
            {fileName && <span className="file-info">{fileName} ({fileType})</span>}
          </div>
          
          {inputType === 'file' ? (
            <div className="file-input-wrapper">
              <input
                type="file"
                onChange={handleFileSelect}
                className="file-input"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="file-dropzone">
                <span className="drop-icon">📁</span>
                <span>Click or drag file to encode</span>
                <span className="file-hint">Max 10MB • Any file type</span>
              </label>
              {fileName && (
                <button onClick={() => { setInputType('text'); setFileName(''); setFileType(''); }} className="btn-secondary">
                  Switch to text input
                </button>
              )}
            </div>
          ) : (
            <textarea
              className="base64-editor"
              value={input}
              onChange={handleInputChange}
              placeholder={mode === 'encode' 
                ? 'Enter text to encode...' 
                : 'Enter Base64 to decode...'}
              spellCheck={false}
            />
          )}
          
          <div className="input-stats">
            <span>{input.length} characters</span>
            {mode === 'encode' && input && (
              <span>≈ {Math.ceil(input.length * 1.33)} Base64 chars</span>
            )}
            {mode === 'decode' && input && (
              <span>≈ {Math.floor(input.length * 0.75)} decoded chars</span>
            )}
          </div>
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <h3>Output ({mode === 'encode' ? 'Base64' : 'Plain Text'})</h3>
          </div>
          <textarea
            className="base64-editor output"
            value={output}
            readOnly
            spellCheck={false}
          />
          <div className="output-stats">
            <span>{output.length} characters</span>
          </div>
        </div>
      </div>

      <div className="base64-info">
        <details>
          <summary>About Base64</summary>
          <ul>
            <li>Base64 encodes binary data as ASCII text using 64 characters (A-Z, a-z, 0-9, +, /)</li>
            <li>Output is ~33% larger than input</li>
            <li>Padding with = ensures output length is multiple of 4</li>
            <li>Common uses: email attachments, data URLs, JWT tokens, API auth</li>
            <li>This tool handles UTF-8 text and binary files correctly</li>
          </ul>
        </details>
      </div>
    </div>
  );
}