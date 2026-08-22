import { useState, useMemo, useCallback } from 'react';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

interface TreeNode {
  key: string | number;
  value: JsonValue;
  path: string;
  depth: number;
  expanded: boolean;
  isArray: boolean;
  parent?: TreeNode;
}

export default function JsonTreeViewer() {
  const [input, setInput] = useState('{\n  "name": "John Doe",\n  "age": 30,\n  "active": true,\n  "address": {\n    "street": "123 Main St",\n    "city": "New York",\n    "zip": "10001"\n  },\n  "tags": ["developer", "designer", "manager"],\n  "metadata": null\n}');
  const [error, setError] = useState<string | null>(null);
  const [parsedJson, setParsedJson] = useState<JsonValue | null>(null);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['']));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const parseJson = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      setParsedJson(parsed);
      setError(null);
      setExpandedPaths(new Set(['']));
      return parsed;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
      setParsedJson(null);
      return null;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    parseJson(val);
  };

  const buildTree = useMemo(() => {
    if (!parsedJson) return [];
    const tree: TreeNode[] = [];
    
    const traverse = (value: JsonValue, path: string, depth: number, parent?: TreeNode, key?: string | number, isArray = false) => {
      const currentPath = path ? `${path}.${key}` : String(key ?? '');
      const expanded = expandedPaths.has(currentPath) || depth < 2;
      
      const node: TreeNode = {
        key: key ?? '',
        value,
        path: currentPath,
        depth,
        expanded,
        isArray,
        parent,
      };
      
      tree.push(node);
      
      if (expanded && value !== null && typeof value === 'object') {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            traverse(item, currentPath, depth + 1, node, index, true);
          });
        } else {
          Object.entries(value).forEach(([k, v]) => {
            traverse(v, currentPath, depth + 1, node, k, false);
          });
        }
      }
    };
    
    traverse(parsedJson, '', 0);
    return tree;
  }, [parsedJson, expandedPaths]);

  const filteredTree = useMemo(() => {
    if (!searchTerm.trim()) return buildTree;
    
    const term = searchTerm.toLowerCase();
    const matches = new Set<string>();
    
    buildTree.forEach(node => {
      const keyStr = String(node.key).toLowerCase();
      const valueStr = JSON.stringify(node.value).toLowerCase();
      if (keyStr.includes(term) || valueStr.includes(term)) {
        matches.add(node.path);
        // Expand all parents
        let current = node.parent;
        while (current) {
          matches.add(current.path);
          current = current.parent;
        }
      }
    });
    
    return buildTree.filter(node => 
      matches.has(node.path) || 
      (node.path === '' && matches.size > 0)
    );
  }, [buildTree, searchTerm]);

  const toggleExpand = (path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
  };

  const copyValue = (value: JsonValue) => {
    navigator.clipboard.writeText(JSON.stringify(value, null, 2));
  };

  const startEdit = (path: string, value: JsonValue) => {
    setSelectedPath(path);
    setEditMode(path);
    setEditValue(typeof value === 'string' ? value : JSON.stringify(value));
  };

  const saveEdit = () => {
    if (!selectedPath || !parsedJson) return;
    
    try {
      let newValue: JsonValue = editValue;
      // Try to parse as JSON, fallback to string
      try {
        newValue = JSON.parse(editValue);
      } catch {
        // Keep as string
      }
      
      const newJson = updateJsonAtPath(parsedJson, selectedPath, newValue);
      const newJsonStr = JSON.stringify(newJson, null, 2);
      setInput(newJsonStr);
      parseJson(newJsonStr);
      setEditMode(null);
      setSelectedPath(null);
    } catch (e) {
      setError('Failed to update value');
    }
  };

  const cancelEdit = () => {
    setEditMode(null);
    setSelectedPath(null);
  };

  const updateJsonAtPath = (obj: JsonValue, path: string, newValue: JsonValue): JsonValue => {
    if (path === '') return newValue;
    
    const parts = path.split('.').filter(Boolean);
    const result = JSON.parse(JSON.stringify(obj));
    let current: any = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const nextPart = parts[i + 1];
      const isNextArrayIndex = !isNaN(Number(nextPart));
      
      if (Array.isArray(current)) {
        current = current[Number(part)];
      } else {
        current = current[part];
      }
    }
    
    const lastPart = parts[parts.length - 1];
    if (Array.isArray(current)) {
      current[Number(lastPart)] = newValue;
    } else {
      current[lastPart] = newValue;
    }
    
    return result;
  };

  const addProperty = (path: string) => {
    if (!parsedJson) return;
    
    const newJson = updateJsonAtPath(parsedJson, path, {});
    const newJsonStr = JSON.stringify(newJson, null, 2);
    setInput(newJsonStr);
    parseJson(newJsonStr);
    setExpandedPaths(prev => new Set([...prev, path]));
  };

  const addArrayItem = (path: string) => {
    if (!parsedJson) return;
    
    const current = getValueAtPath(parsedJson, path);
    const newItem = Array.isArray(current) ? null : [];
    const newArray = Array.isArray(current) ? [...current, newItem] : [newItem];
    
    const newJson = updateJsonAtPath(parsedJson, path, newArray);
    const newJsonStr = JSON.stringify(newJson, null, 2);
    setInput(newJsonStr);
    parseJson(newJsonStr);
  };

  const removeItem = (path: string) => {
    if (!parsedJson || path === '') return;
    
    const parts = path.split('.').filter(Boolean);
    const parentPath = parts.slice(0, -1).join('.');
    const key = parts[parts.length - 1];
    
    const parent = getValueAtPath(parsedJson, parentPath);
    if (Array.isArray(parent)) {
      const newArray = parent.filter((_, i) => i !== Number(key));
      const newJson = updateJsonAtPath(parsedJson, parentPath, newArray);
      const newJsonStr = JSON.stringify(newJson, null, 2);
      setInput(newJsonStr);
      parseJson(newJsonStr);
    } else if (parent && typeof parent === 'object') {
      const { [key]: _, ...rest } = parent as Record<string, JsonValue>;
      const newJson = updateJsonAtPath(parsedJson, parentPath, rest);
      const newJsonStr = JSON.stringify(newJson, null, 2);
      setInput(newJsonStr);
      parseJson(newJsonStr);
    }
  };

  const getValueAtPath = (obj: JsonValue, path: string): JsonValue | undefined => {
    if (path === '') return obj;
    const parts = path.split('.').filter(Boolean);
    let current: any = obj;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      if (Array.isArray(current)) {
        current = current[Number(part)];
      } else {
        current = current[part];
      }
    }
    return current;
  };

  const formatValue = (value: JsonValue): string => {
    if (value === null) return 'null';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') {
      if (Array.isArray(value)) return `[${value.length}]`;
      return `{${Object.keys(value).length}}`;
    }
    return String(value);
  };

  const getValueType = (value: JsonValue): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  const samples = [
    { label: 'Simple Object', value: '{"name": "John", "age": 30, "active": true}' },
    { label: 'Nested Object', value: '{"user": {"profile": {"name": "John", "settings": {"theme": "dark", "notifications": true}}}}' },
    { label: 'Array of Objects', value: '[{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}, {"id": 3, "name": "Item 3"}]' },
    { label: 'Complex Mixed', value: '{"data": {"users": [{"name": "Alice", "roles": ["admin", "user"]}, {"name": "Bob", "roles": ["user"]}], "meta": {"total": 2, "page": 1}}}' },
  ];

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JSON Tree Viewer</h2>
        <p className="tool-desc">Parse, visualize, search, and edit JSON data in an interactive tree structure.</p>
      </div>

      <div className="tool-grid">
        <div className="editor-panel">
          <div className="toolbar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search keys and values..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="clear-search">✕</button>
              )}
            </div>
            <div className="sample-buttons">
              {samples.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(sample.value);
                    parseJson(sample.value);
                  }}
                  className="sample-btn"
                  title={sample.label}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="json-input">JSON Input</label>
            <textarea
              id="json-input"
              value={input}
              onChange={handleInputChange}
              className={`json-input ${error ? 'error' : ''}`}
              placeholder="Paste JSON here..."
              spellCheck={false}
              rows={15}
            />
            {error && <span className="error-message">{error}</span>}
          </div>

          <div className="actions">
            <button onClick={() => {
              const formatted = parsedJson ? JSON.stringify(parsedJson, null, 2) : '';
              setInput(formatted);
              navigator.clipboard.writeText(formatted);
            }} disabled={!parsedJson}>
              Copy Formatted
            </button>
            <button onClick={() => {
              setInput('');
              setParsedJson(null);
              setError(null);
            }}>
              Clear
            </button>
            <button onClick={() => {
              navigator.clipboard.readText().then(text => {
                setInput(text);
                parseJson(text);
              });
            }}>
              Paste from Clipboard
            </button>
          </div>
        </div>

        <div className="tree-panel">
          {parsedJson ? (
            <div className="tree-container">
              <div className="tree-stats">
                <span>{typeof parsedJson === 'object' && parsedJson !== null ? (Array.isArray(parsedJson) ? `${parsedJson.length} items` : `${Object.keys(parsedJson).length} keys`) : '1 value'}</span>
                <span>{JSON.stringify(parsedJson).length} characters</span>
              </div>
              
              <div className="tree" role="tree">
                {filteredTree.map((node, index) => {
                  const isExpandable = node.value !== null && typeof node.value === 'object' && 
                    (Array.isArray(node.value) ? node.value.length > 0 : Object.keys(node.value).length > 0);
                  const isMatch = searchTerm && (
                    String(node.key).toLowerCase().includes(searchTerm.toLowerCase()) ||
                    JSON.stringify(node.value).toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  
                  return (
                    <div
                      key={index}
                      className={`tree-node ${node.depth > 0 ? 'nested' : ''} ${isMatch ? 'match' : ''} ${editMode === node.path ? 'editing' : ''}`}
                      style={{ paddingLeft: `${node.depth * 20}px` }}
                    >
                      {isExpandable && (
                        <button
                          className="expand-toggle"
                          onClick={() => toggleExpand(node.path)}
                          aria-expanded={node.expanded}
                        >
                          {node.expanded ? '▼' : '▶'}
                        </button>
                      )}
                      
                      {!isExpandable && <span className="expand-placeholder"></span>}
                      
                      <span 
                        className={`tree-key ${getValueType(node.value)}`}
                        onClick={() => setSelectedPath(node.path)}
                        onDoubleClick={() => !isExpandable && startEdit(node.path, node.value)}
                      >
                        {node.path === '' ? 'root' : node.isArray ? `[${node.key}]` : node.key}
                      </span>
                      
                      {!isExpandable && (
                        <span 
                          className={`tree-value ${getValueType(node.value)}`}
                          onClick={() => setSelectedPath(node.path)}
                          onDoubleClick={() => startEdit(node.path, node.value)}
                        >
                          {editMode === node.path ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && saveEdit()}
                              onBlur={saveEdit}
                              autoFocus
                              className="edit-input"
                            />
                          ) : (
                            formatValue(node.value)
                          )}
                        </span>
                      )}
                      
                      {isExpandable && (
                        <span className="tree-type">
                          {Array.isArray(node.value) ? `Array[${node.value.length}]` : node.value && typeof node.value === 'object' ? `Object{${Object.keys(node.value).length}}` : ''}
                        </span>
                      )}
                      
                      <div className="node-actions">
                        {node.path !== '' && (
                          <>
                            <button 
                              className="icon-btn" 
                              onClick={() => copyPath(node.path)}
                              title="Copy path"
                            >
                              📋
                            </button>
                            <button 
                              className="icon-btn" 
                              onClick={() => copyValue(node.value)}
                              title="Copy value"
                            >
                              📄
                            </button>
                            {!isExpandable && (
                              <button 
                                className="icon-btn" 
                                onClick={() => startEdit(node.path, node.value)}
                                title="Edit value"
                              >
                                ✏️
                              </button>
                            )}
                            <button 
                              className="icon-btn danger" 
                              onClick={() => removeItem(node.path)}
                              title="Remove"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                        {isExpandable && node.path !== '' && (
                          <>
                            {Array.isArray(node.value) && (
                              <button 
                                className="icon-btn" 
                                onClick={() => addArrayItem(node.path)}
                                title="Add array item"
                              >
                                ➕
                              </button>
                            )}
                            {!Array.isArray(node.value) && (
                              <button 
                                className="icon-btn" 
                                onClick={() => addProperty(node.path)}
                                title="Add property"
                              >
                                ➕
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>Enter valid JSON to see the tree visualization</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}