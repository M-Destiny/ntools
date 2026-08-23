import { useState } from 'react';
import { parseStringPromise, Builder } from 'xml2js';
import * as yaml from 'yaml';

export default function YamlToXml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState({
    rootName: 'root',
    headless: false,
    renderOpts: {
      pretty: true,
      indent: '  ',
      newline: '\n'
    },
    xmldec: { version: '1.0', encoding: 'UTF-8' }
  });

  const convert = () => {
    setError(null);
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }
      
      const parsed = yaml.parse(input);
      
      const builder = new Builder({
        rootName: options.rootName,
        headless: options.headless,
        renderOpts: options.renderOpts,
        xmldec: options.xmldec
      });
      
      const xmlStr = builder.buildObject(parsed);
      setOutput(xmlStr);
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
    const example = `catalog:
  book:
    - id: "bk101"
      author: "Gambardella, Matthew"
      title: "XML Developer's Guide"
      genre: "Computer"
      price: 44.95
      publish_date: "2000-10-01"
      description: "An in-depth look at creating applications with XML."
    - id: "bk102"
      author: "Ralls, Kim"
      title: "Midnight Rain"
      genre: "Fantasy"
      price: 5.95
      publish_date: "2000-12-16"
      description: "A former architect battles corporate zombies."`;
    setInput(example);
    convert();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const handleRootNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptions(prev => ({ ...prev, rootName: e.target.value }));
    if (input.trim()) convert();
  };

  const togglePretty = () => {
    setOptions(prev => ({
      ...prev,
      renderOpts: { ...prev.renderOpts, pretty: !prev.renderOpts.pretty }
    }));
    if (input.trim()) convert();
  };

  const toggleHeadless = () => {
    setOptions(prev => ({ ...prev, headless: !prev.headless }));
    if (input.trim()) convert();
  };

  const toggleXmlDec = () => {
    setOptions(prev => ({
      ...prev,
      xmldec: prev.xmldec ? null : { version: '1.0', encoding: 'UTF-8' }
    }));
    if (input.trim()) convert();
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>YAML to XML Converter</h2>
        <p className="tool-desc">Convert YAML documents to XML format with configurable output options</p>
      </div>

      <div className="converter-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>YAML Input</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="code-editor"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste YAML here..."
            spellCheck={false}
          />
        </div>

        <div className="options-panel">
          <h3>Options</h3>
          <div className="option-group">
            <div className="option-row">
              <label className="option-label">Root Element Name</label>
              <input
                type="text"
                value={options.rootName}
                onChange={handleRootNameChange}
                className="option-input"
              />
            </div>
            <label className="option-label checkbox">
              <input
                type="checkbox"
                checked={options.renderOpts.pretty}
                onChange={togglePretty}
              />
              Pretty print
            </label>
            <label className="option-label checkbox">
              <input
                type="checkbox"
                checked={options.headless}
                onChange={toggleHeadless}
              />
              Headless (no root wrapper)
            </label>
            <label className="option-label checkbox">
              <input
                type="checkbox"
                checked={!!options.xmldec}
                onChange={toggleXmlDec}
              />
              Include XML declaration
            </label>
          </div>

          <div className="status">
            {error ? (
              <span className="error">✗ {error}</span>
            ) : input.trim() ? (
              <span className="success">✓ Converted successfully</span>
            ) : (
              <span className="hint">Enter YAML to convert</span>
            )}
          </div>

          <div className="stats">
            <span>Input: {input.length} chars</span>
            <span>Output: {output.length} chars</span>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>XML Output</h3>
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