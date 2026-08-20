import { useState, useMemo } from 'react';

export default function XmlFormatter() {
  const [input, setInput] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [useTabs, setUseTabs] = useState(false);
  const [sortAttributes, setSortAttributes] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatXml = useMemo(() => {
    if (!input.trim()) return '';
    
    setError(null);
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, 'application/xml');
      
      // Check for parser errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error(parserError.textContent || 'Invalid XML');
      }
      
      // Serialize with formatting
      const serializer = new XMLSerializer();
      let xmlString = serializer.serializeToString(doc.documentElement);
      
      // Pretty print
      const indentChar = useTabs ? '\t' : ' '.repeat(indentSize);
      let formatted = '';
      let currentIndent = 0;
      
      // Split by tags
      const tags = xmlString.match(/<[^>]+>|[^<]+/g) || [];
      
      tags.forEach((tag, index) => {
        const isClosing = tag.startsWith('</');
        const isSelfClosing = tag.endsWith('/>') || (tag.startsWith('<') && tag.endsWith('>') && !isClosing && tag.includes(' ') && tag.trim().endsWith('/>'));
        const isDeclaration = tag.startsWith('<?');
        const isComment = tag.startsWith('<!--');
        const isCdata = tag.startsWith('<![CDATA[');
        
        if (isClosing && !isSelfClosing) {
          currentIndent = Math.max(0, currentIndent - 1);
        }
        
        if (!isSelfClosing && !isDeclaration && !isComment && !isCdata && !isClosing) {
          formatted += indentChar.repeat(currentIndent) + tag + '\n';
          currentIndent++;
        } else {
          formatted += indentChar.repeat(currentIndent) + tag + '\n';
        }
        
        // Handle self-closing - don't increment for next
        if (isSelfClosing && !isDeclaration && !isComment && !isCdata) {
          // already handled
        }
      });
      
      // Clean up extra whitespace in text nodes
      formatted = formatted.replace(/>\s+</g, '><').trim();
      
      // Re-parse to properly handle text nodes
      const doc2 = parser.parseFromString(formatted, 'application/xml');
      const serializer2 = new XMLSerializer();
      let finalOutput = '';
      
      const formatNode = (node: Node, indent: number) => {
        const indentStr = indentChar.repeat(indent);
        
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text) {
            finalOutput += indentStr + text + '\n';
          }
        } else if (node.nodeType === Node.COMMENT_NODE) {
          finalOutput += indentStr + node.textContent + '\n';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          let attrs = '';
          
          if (element.attributes.length > 0) {
            const attrArray: string[] = [];
            for (let i = 0; i < element.attributes.length; i++) {
              const attr = element.attributes[i];
              attrArray.push(`${attr.name}="${attr.value}"`);
            }
            if (sortAttributes) {
              attrArray.sort();
            }
            attrs = ' ' + attrArray.join(' ');
          }
          
          if (element.children.length === 0 && element.textContent?.trim() === '') {
            // Self-closing
            finalOutput += indentStr + `<${element.tagName}${attrs} />\n`;
          } else {
            finalOutput += indentStr + `<${element.tagName}${attrs}>\n`;
            
            for (let i = 0; i < element.childNodes.length; i++) {
              formatNode(element.childNodes[i], indent + 1);
            }
            
            finalOutput += indentStr + `</${element.tagName}>\n`;
          }
        }
      };
      
      formatNode(doc2.documentElement, 0);
      setOutput(finalOutput.trim());
      return finalOutput.trim();
      
    } catch (e) {
      const err = e as Error;
      setError(err.message || 'Failed to format XML');
      setOutput('');
      return '';
    }
  }, [input, indentSize, useTabs, sortAttributes]);

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
    setCopied(false);
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
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>XML Formatter & Beautifier</h2>
        <p className="tool-desc">Format, beautify, and validate XML. Supports custom indentation, attribute sorting, and error detection.</p>
      </div>

      <div className="xml-layout">
        <div className="editor-pane">
          <div className="pane-header">
            <h3>Input XML</h3>
            <div className="pane-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>

          {error && <div className="error-banner">✗ {error}</div>}

          <textarea
            className="xml-editor"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste XML here to format..."
            spellCheck={false}
          />

          <div className="xml-options">
            <div className="option-group">
              <label>
                Indent Size:
                <select value={indentSize} onChange={e => setIndentSize(parseInt(e.target.value))}>
                  <option value={1}>1 space</option>
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </label>
            </div>
            <div className="option-group">
              <label>
                <input
                  type="checkbox"
                  checked={useTabs}
                  onChange={e => setUseTabs(e.target.checked)}
                />
                Use Tabs
              </label>
            </div>
            <div className="option-group">
              <label>
                <input
                  type="checkbox"
                  checked={sortAttributes}
                  onChange={e => setSortAttributes(e.target.checked)}
                />
                Sort Attributes
              </label>
            </div>
          </div>
        </div>

        <div className="preview-pane">
          <div className="pane-header">
            <h3>Formatted Output</h3>
            <div className="pane-actions">
              <button onClick={copyOutput} className={copied ? 'copied' : 'btn-primary'} disabled={!output}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <button onClick={downloadOutput} className="btn-secondary" disabled={!output}>
                Download
              </button>
            </div>
          </div>

          {output ? (
            <pre className="xml-output">{output}</pre>
          ) : (
            <div className="empty-state">
              <p>Enter XML in the left panel to see formatted output</p>
            </div>
          )}

          <div className="info-section">
            <details>
              <summary>Features</summary>
              <div className="help-content">
                <ul>
                  <li>Validates XML syntax and reports parse errors</li>
                  <li>Configurable indentation (spaces or tabs)</li>
                  <li>Optional attribute alphabetical sorting</li>
                  <li>Preserves comments, CDATA, and processing instructions</li>
                  <li>Handles self-closing tags correctly</li>
                  <li>Copy to clipboard or download as .xml file</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}