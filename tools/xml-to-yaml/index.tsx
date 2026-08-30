import { useState } from 'react';
import { parseStringPromise } from 'xml2js';
import * as yaml from 'yaml';

export default function XmlToYaml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    trim: true,
    explicitArray: false,
    ignoreAttrs: false,
    mergeAttrs: true
  });

  const convert = async () => {
    setError(null);
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }
      
      const result = await parseStringPromise(input, {
        trim: options.trim,
        explicitArray: options.explicitArray,
        ignoreAttrs: options.ignoreAttrs,
        mergeAttrs: options.mergeAttrs,
        explicitRoot: false
      });
      
      const yamlStr = yaml.stringify(result, {
        indent: 2,
        lineWidth: 120,
        defaultStringType: 'PLAIN'
      });
      
      setOutput(yamlStr);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed');
      setOutput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    const example = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <genre>Computer</genre>
    <price>44.95</price>
    <publish_date>2000-10-01</publish_date>
    <description>An in-depth look at creating applications with XML.</description>
  </book>
  <book id="bk102">
    <author>Ralls, Kim</author>
    <title>Midnight Rain</title>
    <genre>Fantasy</genre>
    <price>5.95</price>
    <publish_date>2000-12-16</publish_date>
    <description>A former architect battles corporate zombies.</description>
  </book>
</catalog>`;
    setInput(example);
    convert();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const toggleOption = (key: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    // Re-convert if there's input
    if (input.trim()) convert();
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>XML to YAML Converter</h2>
        <p className="tool-desc">Convert XML documents to YAML format with configurable parsing options</p>
      </div>

      <div className="converter-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>XML Input</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="code-editor"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste XML here..."
            spellCheck={false}
          />
        </div>

        <div className="options-panel">
          <h3>Options</h3>
          <div className="option-group">
            <label className="option-label">
              <input
                type="checkbox"
                checked={options.trim}
                onChange={() => toggleOption('trim')}
              />
              Trim whitespace
            </label>
            <label className="option-label">
              <input
                type="checkbox"
                checked={options.explicitArray}
                onChange={() => toggleOption('explicitArray')}
              />
              Explicit arrays
            </label>
            <label className="option-label">
              <input
                type="checkbox"
                checked={!options.ignoreAttrs}
                onChange={() => toggleOption('ignoreAttrs')}
              />
              Include attributes
            </label>
            <label className="option-label">
              <input
                type="checkbox"
                checked={options.mergeAttrs}
                onChange={() => toggleOption('mergeAttrs')}
              />
              Merge attributes
            </label>
          </div>

          <div className="status">
            {error ? (
              <span className="error">✗ {error}</span>
            ) : input.trim() ? (
              <span className="success">✓ Converted successfully</span>
            ) : (
              <span className="hint">Enter XML to convert</span>
            )}
          </div>

          <div className="stats">
            <span>Input: {input.length} chars</span>
            <span>Output: {output.length} chars</span>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>YAML Output</h3>
            <div className="toolbar-actions">
              <button onClick={copyOutput} className={copied ? 'copied' : ''}>
                {copied ? '✓ Copied!' : 'Copy Output'}
              </button>
            </div>
          </div>
          <textarea
            className="code-editor output"
            value={output}
            readOnly
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}