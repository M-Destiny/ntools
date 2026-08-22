import { useState } from 'react';

export default function JsonToGo() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [packageName, setPackageName] = useState('main');
  const [structName, setStructName] = useState('Root');
  const [useJsonTags, setUseJsonTags] = useState(true);
  const [usePointers, setUsePointers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const convert = () => {
    setError(null);
    try {
      if (!input.trim()) {
        setOutput('');
        return;
      }
      
      const parsed = JSON.parse(input);
      const result = convertToGo(parsed, structName, 0, new Set(), useJsonTags, usePointers);
      setOutput(`package ${packageName}

${result}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
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
    const example = {
      id: 123,
      name: "John Doe",
      email: "john@example.com",
      active: true,
      roles: ["admin", "user"],
      profile: {
        age: 30,
        city: "New York",
        settings: {
          theme: "dark",
          notifications: true
        }
      },
      tags: [
        { key: "priority", value: "high" },
        { key: "department", value: "engineering" }
      ],
      metadata: null,
      scores: [95.5, 87.2, 91.0]
    };
    setInput(JSON.stringify(example, null, 2));
    convert();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JSON to Go Structs</h2>
        <p className="tool-desc">Convert JSON to Go structs with JSON tags, pointer options, and nested types</p>
      </div>

      <div className="json-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input JSON</h3>
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

        <div className="controls-panel">
          <div className="mode-selector">
            <label>Package Name</label>
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              className="config-input"
              placeholder="main"
            />
          </div>

          <div className="mode-selector">
            <label>Root Struct Name</label>
            <input
              type="text"
              value={structName}
              onChange={(e) => setStructName(e.target.value)}
              className="config-input"
              placeholder="Root"
            />
          </div>

          <div className="mode-selector">
            <label>Options</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={useJsonTags}
                  onChange={(e) => { setUseJsonTags(e.target.checked); convert(); }}
                />
                <span>Add JSON tags (\`json:"field"\`)</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={usePointers}
                  onChange={(e) => { setUsePointers(e.target.checked); convert(); }}
                />
                <span>Use pointers for optional fields</span>
              </label>
            </div>
          </div>

          <div className="stats">
            <span>Input: {input.length} chars</span>
            <span>Output: {output.length} chars</span>
          </div>

          <div className="toolbar-actions" style={{ marginTop: '16px' }}>
            <button onClick={convert} className="btn-primary" style={{ width: '100%' }}>
              Convert to Go
            </button>
          </div>

          {error && (
            <div className="status" style={{ marginTop: '12px' }}>
              <span className="error">✗ {error}</span>
            </div>
          )}
        </div>

        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Go Structs Output</h3>
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

interface TypeInfo {
  type: string;
  isArray: boolean;
  isNull: boolean;
  children?: Record<string, TypeInfo>;
}

function inferType(value: any): TypeInfo {
  if (value === null) {
    return { type: 'interface{}', isArray: false, isNull: true };
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return { type: 'interface{}', isArray: true, isNull: false };
    }
    // Infer type from first non-null element
    const firstNonNull = value.find(v => v !== null);
    if (!firstNonNull) {
      return { type: 'interface{}', isArray: true, isNull: false };
    }
    const elementType = inferType(firstNonNull);
    return { 
      type: elementType.type, 
      isArray: true, 
      isNull: false,
      children: elementType.children
    };
  }
  
  if (typeof value === 'object') {
    const children: Record<string, TypeInfo> = {};
    for (const [key, val] of Object.entries(value)) {
      children[key] = inferType(val);
    }
    return { 
      type: 'struct', 
      isArray: false, 
      isNull: false,
      children
    };
  }
  
  switch (typeof value) {
    case 'string':
      return { type: 'string', isArray: false, isNull: false };
    case 'number':
      if (Number.isInteger(value)) {
        if (value >= -2147483648 && value <= 2147483647) {
          return { type: 'int', isArray: false, isNull: false };
        }
        return { type: 'int64', isArray: false, isNull: false };
      }
      return { type: 'float64', isArray: false, isNull: false };
    case 'boolean':
      return { type: 'bool', isArray: false, isNull: false };
    default:
      return { type: 'interface{}', isArray: false, isNull: false };
  }
}

function toGoType(typeInfo: TypeInfo, usePointers: boolean, isTopLevel: boolean = false): string {
  let baseType = typeInfo.type;
  
  if (typeInfo.type === 'struct' && typeInfo.children) {
    // This will be handled by generating a separate struct
    baseType = ''; // placeholder, will be replaced
  }
  
  if (typeInfo.isArray) {
    baseType = `[]${baseType}`;
  }
  
  if (typeInfo.isNull && usePointers && !isTopLevel) {
    baseType = `*${baseType}`;
  }
  
  return baseType;
}

function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

function convertToGo(value: any, structName: string, depth: number, seenStructs: Set<string>, useJsonTags: boolean, usePointers: boolean): string {
  const typeInfo = inferType(value);
  
  if (typeInfo.type !== 'struct' || !typeInfo.children) {
    // Primitive or array of primitives
    return '';
  }
  
  // Check if we've already generated this struct
  const structKey = `${structName}_${JSON.stringify(Object.keys(typeInfo.children).sort())}`;
  if (seenStructs.has(structKey)) {
    return '';
  }
  seenStructs.add(structKey);
  
  let result = '';
  
  // First, generate child structs
  const childStructs: string[] = [];
  for (const [key, childInfo] of Object.entries(typeInfo.children)) {
    if (childInfo.type === 'struct' && childInfo.children) {
      const childName = toCamelCase(key);
      const childStruct = convertToGo(
        Object.fromEntries(
          Object.entries(childInfo.children).map(([k, v]) => [k, getDefaultValue(v)])
        ),
        childName,
        depth + 1,
        seenStructs,
        useJsonTags,
        usePointers
      );
      if (childStruct) childStructs.push(childStruct);
    }
  }
  
  // Generate current struct
  result += childStructs.join('\n\n');
  if (childStructs.length > 0) result += '\n\n';
  
  result += `type ${structName} struct {\n`;
  
  for (const [key, childInfo] of Object.entries(typeInfo.children)) {
    const fieldName = toCamelCase(key);
    let goType = '';
    
    if (childInfo.type === 'struct' && childInfo.children) {
      goType = toCamelCase(key);
      if (childInfo.isArray) goType = `[]${goType}`;
      if (childInfo.isNull && usePointers) goType = `*${goType}`;
    } else {
      goType = toGoType(childInfo, usePointers);
    }
    
    let tag = '';
    if (useJsonTags) {
      const omitEmpty = childInfo.isNull ? ',omitempty' : '';
      tag = ` \`json:"${key}${omitEmpty}"\``;
    }
    
    result += `  ${fieldName} ${goType}${tag}\n`;
  }
  
  result += '}';
  
  return result;
}

function getDefaultValue(typeInfo: TypeInfo): any {
  if (typeInfo.isArray) return [];
  if (typeInfo.type === 'struct') return {};
  if (typeInfo.type === 'string') return '';
  if (typeInfo.type.startsWith('int') || typeInfo.type === 'float64') return 0;
  if (typeInfo.type === 'bool') return false;
  return null;
}