import { useState } from 'react';

export default function JsonToXml() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [rootElement, setRootElement] = useState('root');
  const [includeDeclaration, setIncludeDeclaration] = useState(true);
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [arrayItemName, setArrayItemName] = useState('item');
  const [attributePrefix, setAttributePrefix] = useState('@');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&apos;');
  };

  const isValidXmlName = (name: string): boolean => {
    return /^[a-zA-Z_][a-zA-Z0-9_.-]*$/.test(name);
  };

  const sanitizeXmlName = (name: string): string => {
    return name.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/^[^a-zA-Z_]/, '_');
  };

  const jsonToXml = (obj: unknown, elementName: string, depth: number = 0): string => {
    const indent = prettyPrint ? '  '.repeat(depth) : '';
    const newline = prettyPrint ? '\n' : '';

    if (obj === null) {
      return `${indent}<${elementName} xsi:nil="true" />`;
    }

    if (obj === undefined) {
      return '';
    }

    if (Array.isArray(obj)) {
      return obj
        .map(item => jsonToXml(item, arrayItemName, depth))
        .join(newline);
    }

    if (typeof obj === 'object') {
      const objRecord = obj as Record<string, unknown>;
      const attributes: string[] = [];
      const children: string[] = [];

      for (const [key, value] of Object.entries(objRecord)) {
        if (key.startsWith(attributePrefix)) {
          const attrName = key.slice(attributePrefix.length);
          if (isValidXmlName(attrName)) {
            attributes.push(`${attrName}="${escapeXml(String(value))}"`);
          }
        } else {
          const childName = isValidXmlName(key) ? key : sanitizeXmlName(key);
          children.push(jsonToXml(value, childName, depth + 1));
        }
      }

      const attrStr = attributes.length > 0 ? ' ' + attributes.join(' ') : '';
      const childrenStr = children.filter(Boolean).join(newline);

      if (childrenStr === '') {
        return `${indent}<${elementName}${attrStr} />`;
      }

      return `${indent}<${elementName}${attrStr}>${newline}${childrenStr}${newline}${indent}</${elementName}>`;
    }

    // Primitive values
    let valueStr: string;
    if (typeof obj === 'boolean') {
      valueStr = obj ? 'true' : 'false';
    } else if (typeof obj === 'number') {
      valueStr = String(obj);
    } else {
      valueStr = escapeXml(String(obj));
    }

    return `${indent}<${elementName}>${valueStr}</${elementName}>`;
  };

  const processJson = () => {
    setError(null);
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }

      const parsed = JSON.parse(input);
      let xml = '';

      if (includeDeclaration) {
        xml += '<?xml version="1.0" encoding="UTF-8"?>\n';
      }

      const rootName = isValidXmlName(rootElement) ? rootElement : sanitizeXmlName(rootElement);
      xml += jsonToXml(parsed, rootName);

      setOutput(xml);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setOutput('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    processJson();
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    const example = {
      users: [
        { id: 1, name: "Alice", email: "alice@example.com", active: true, "@role": "admin" },
        { id: 2, name: "Bob", email: "bob@example.com", active: false, "@role": "user" },
        { id: 3, name: "Carol", email: "carol@example.com", active: true, "@role": "user" }
      ],
      metadata: {
        version: "1.0",
        generated: "2026-08-22T10:30:00Z",
        count: 3
      }
    };
    setInput(JSON.stringify(example, null, 2));
    processJson();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JSON to XML</h2>
        <p className="tool-desc">Convert JSON to XML with configurable root element, attributes, and formatting</p>
      </div>

      <div className="controls-panel-full">
        <div className="control-group">
          <label>Root Element Name</label>
          <input
            type="text"
            value={rootElement}
            onChange={(e) => { setRootElement(e.target.value); processJson(); }}
            placeholder="root"
          />
        </div>
        <div className="control-group">
          <label>Array Item Name</label>
          <input
            type="text"
            value={arrayItemName}
            onChange={(e) => { setArrayItemName(e.target.value); processJson(); }}
            placeholder="item"
          />
        </div>
        <div className="control-group">
          <label>Attribute Prefix</label>
          <input
            type="text"
            value={attributePrefix}
            onChange={(e) => { setAttributePrefix(e.target.value); processJson(); }}
            placeholder="@"
            maxLength={1}
          />
        </div>
        <div className="control-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeDeclaration}
              onChange={(e) => { setIncludeDeclaration(e.target.checked); processJson(); }}
            />
            Include XML declaration
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={prettyPrint}
              onChange={(e) => { setPrettyPrint(e.target.checked); processJson(); }}
            />
            Pretty print
          </label>
        </div>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>JSON Input</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <textarea
            className="json-editor"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste JSON here..."
            spellCheck={false}
          />
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
            className="json-editor output"
            value={output}
            readOnly
            spellCheck={false}
          />
          {error && <div className="error-message">✗ {error}</div>}
        </div>
      </div>
    </div>
  );
}