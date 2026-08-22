import { useState } from 'react';

interface ParseOptions {
  attributePrefix: string;
  ignoreAttributes: boolean;
  textNodeName: string;
  parseNumbers: boolean;
  parseBooleans: boolean;
  trim: boolean;
}

function parseXml(xmlString: string, options: ParseOptions): any {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error(parseError.textContent || 'XML parsing error');
  }

  function parseNode(node: Node): any {
    if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE) {
      const text = options.trim ? (node.textContent?.trim() ?? '') : (node.textContent ?? '');
      if (text === '') return null;
      if (options.parseNumbers && /^-?\d+(\.\d+)?$/.test(text)) return parseFloat(text);
      if (options.parseBooleans && (text === 'true' || text === 'false')) return text === 'true';
      return text;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const element = node as Element;
    const result: any = {};
    let hasAttributes = false;
    let hasChildren = false;
    let textContent = '';

    // Parse attributes
    if (!options.ignoreAttributes && element.attributes.length > 0) {
      hasAttributes = true;
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        const key = options.attributePrefix + attr.name;
        let value: string | number | boolean = attr.value;
        if (options.parseNumbers && /^-?\d+(\.\d+)?$/.test(attr.value)) value = parseFloat(attr.value);
        if (options.parseBooleans && (attr.value === 'true' || attr.value === 'false')) value = attr.value === 'true';
        result[key] = value;
      }
    }

    // Parse child nodes
    const childNodes = Array.from(element.childNodes);
    const childElements = childNodes.filter(n => n.nodeType === Node.ELEMENT_NODE);
    const textNodes = childNodes.filter(n => n.nodeType === Node.TEXT_NODE || n.nodeType === Node.CDATA_SECTION_NODE);

    if (childElements.length > 0) {
      hasChildren = true;
      const grouped: Record<string, any[]> = {};

      for (const child of childElements) {
        const childName = child.nodeName;
        const childResult = parseNode(child);
        if (childResult !== null) {
          if (!grouped[childName]) grouped[childName] = [];
          grouped[childName].push(childResult);
        }
      }

      for (const [name, values] of Object.entries(grouped)) {
        result[name] = values.length === 1 ? values[0] : values;
      }
    }

    // Handle text content
    for (const textNode of textNodes) {
      const text = options.trim ? (textNode.textContent?.trim() ?? '') : (textNode.textContent ?? '');
      if (text && text !== '') {
        textContent += text;
      }
    }

    if (textContent) {
      if (hasAttributes || hasChildren) {
        result[options.textNodeName] = textContent;
      } else {
        return textContent;
      }
    }

    return result;
  }

  const rootElement = xmlDoc.documentElement;
  if (!rootElement) return {};
  
  return { [rootElement.nodeName]: parseNode(rootElement) };
}

function formatJson(obj: any, indent: number = 2): string {
  return JSON.stringify(obj, null, indent);
}

export default function XmlToJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [options, setOptions] = useState<ParseOptions>({
    attributePrefix: '@_',
    ignoreAttributes: false,
    textNodeName: '#text',
    parseNumbers: true,
    parseBooleans: true,
    trim: true,
  });

  const processXml = () => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      const result = parseXml(input, options);
      setOutput(formatJson(result));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid XML');
      setOutput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    processXml();
  };

  const handleOptionChange = (key: keyof ParseOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
    processXml();
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    const example = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="1" category="fiction">
    <title>The Great Gatsby</title>
    <author>F. Scott Fitzgerald</author>
    <price>10.99</price>
    <inStock>true</inStock>
    <tags>
      <tag>classic</tag>
      <tag>novel</tag>
    </tags>
  </book>
  <book id="2" category="non-fiction">
    <title>Sapiens</title>
    <author>Yuval Noah Harari</author>
    <price>15.50</price>
    <inStock>true</inStock>
  </book>
</catalog>`;
    setInput(example);
    processXml();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>XML to JSON</h2>
        <p className="tool-desc">Convert XML to JSON with configurable attribute handling, type parsing, and text node naming.</p>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input XML</h3>
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
            ) : input ? (
              <span className="success">✓ Converted</span>
            ) : (
              <span className="muted">Enter XML to convert</span>
            )}
          </div>

          <div className="stats">
            <span>Input: {input.length} chars</span>
            <span>Output: {output.length} chars</span>
          </div>

          <div className="options-panel">
            <h4>Options</h4>
            <div className="option-row">
              <label>
                <input
                  type="checkbox"
                  checked={!options.ignoreAttributes}
                  onChange={e => handleOptionChange('ignoreAttributes', !e.target.checked)}
                />
                Include Attributes (prefix: {options.attributePrefix})
              </label>
              <input
                type="text"
                value={options.attributePrefix}
                onChange={e => handleOptionChange('attributePrefix', e.target.value)}
                style={{ width: '80px', marginLeft: '8px' }}
              />
            </div>
            <div className="option-row">
              <label>
                <input
                  type="checkbox"
                  checked={options.parseNumbers}
                  onChange={e => handleOptionChange('parseNumbers', e.target.checked)}
                />
                Parse Numbers
              </label>
            </div>
            <div className="option-row">
              <label>
                <input
                  type="checkbox"
                  checked={options.parseBooleans}
                  onChange={e => handleOptionChange('parseBooleans', e.target.checked)}
                />
                Parse Booleans
              </label>
            </div>
            <div className="option-row">
              <label>
                <input
                  type="checkbox"
                  checked={options.trim}
                  onChange={e => handleOptionChange('trim', e.target.checked)}
                />
                Trim Whitespace
              </label>
            </div>
            <div className="option-row">
              <label>
                Text Node Name:
                <input
                  type="text"
                  value={options.textNodeName}
                  onChange={e => handleOptionChange('textNodeName', e.target.value)}
                  style={{ width: '100px', marginLeft: '8px' }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Output JSON</h3>
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