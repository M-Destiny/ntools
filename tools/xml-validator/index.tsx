import { useState } from 'react';

const LESS_THAN = '<';
const GREATER_THAN = '>';
const SLASH = '/';

export default function XmlValidator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [parsedData, setParsedData] = useState<Document | null>(null);

  const processXml = () => {
    setError(null);
    setOutput('');
    setParsedData(null);
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(input, 'text/xml');
      const parseError = xmlDoc.querySelector('parsererror');
      
      if (parseError) {
        throw new Error(parseError.textContent || 'XML parsing error');
      }
      
      setParsedData(xmlDoc);
      setOutput('✓ Valid XML');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid XML');
      setOutput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    const example = `<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user id="1">
    <name>Alice</name>
    <email>alice@example.com</email>
    <active>true</active>
    <roles>
      <role>admin</role>
      <role>user</role>
    </roles>
  </user>
  <user id="2">
    <name>Bob</name>
    <email>bob@example.com</email>
    <active>false</active>
    <roles>
      <role>user</role>
    </roles>
  </user>
</users>`;
    setInput(example);
    processXml();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
    setParsedData(null);
  };

  const renderXmlNode = (node: Node, indent: number = 0): React.ReactNode => {
    const spaces = '  '.repeat(indent);
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const attrs = Array.from(element.attributes).map(attr => 
        <span key={attr.name}>
          <span className="xml-attr-name">{attr.name}</span>={'='}
          <span className="xml-punct">"</span>
          <span className="xml-attr-value">{attr.value}</span>
          <span className="xml-punct">"</span>
        </span>
      );
      
      const children = Array.from(node.childNodes);
      const hasChildren = children.some(child => 
        child.nodeType === Node.ELEMENT_NODE || 
        (child.nodeType === Node.TEXT_NODE && child.textContent?.trim())
      );
      
      if (!hasChildren) {
        return (
          <div key={node.nodeName}>
            <span className="xml-punct">{spaces}{LESS_THAN}</span>
            <span className="xml-tag">{node.nodeName}</span>
            {attrs.length > 0 && <span> {attrs}</span>}
            <span className="xml-punct">{SLASH}{GREATER_THAN}</span>
          </div>
        );
      }
      
      return (
        <div key={node.nodeName}>
          <div>
            <span className="xml-punct">{spaces}{LESS_THAN}</span>
            <span className="xml-tag">{node.nodeName}</span>
            {attrs.length > 0 && <span> {attrs}</span>}
            <span className="xml-punct">{GREATER_THAN}</span>
          </div>
          {children.map((child, i) => renderXmlNode(child, indent + 1))}
          <div>
            <span className="xml-punct">{spaces}{LESS_THAN}{SLASH}</span>
            <span className="xml-tag">{node.nodeName}</span>
            <span className="xml-punct">{GREATER_THAN}</span>
          </div>
        </div>
      );
    }
    
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (!text) return null;
      return <span key="text" className="xml-text">{spaces}{text}</span>;
    }
    
    return null;
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>XML Validator</h2>
        <p className="tool-desc">Validate XML syntax and view parsed structure with syntax highlighting</p>
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
            placeholder="Paste XML here..."
            spellCheck={false}
          />
        </div>

        <div className="controls-panel">
          <div className="status">
            {error ? (
              <span className="error">✗ {error}</span>
            ) : (
              <span className="success">✓ Valid XML</span>
            )}
          </div>

          <div className="stats">
            <span>Input: {input.length} chars</span>
            <span>Lines: {input.split('\n').length}</span>
          </div>

          {parsedData && (
            <div className="parsed-preview">
              <h4>Parsed Structure</h4>
              <div className="parsed-content">
                {renderXmlNode(parsedData)}
              </div>
            </div>
          )}
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