import { useState, useCallback } from 'react';

interface DiffResult {
  type: 'added' | 'removed' | 'changed' | 'unchanged';
  path: string;
  oldValue?: unknown;
  newValue?: unknown;
  children?: DiffResult[];
}

function diffObjects(oldObj: unknown, newObj: unknown, path = ''): DiffResult[] {
  const results: DiffResult[] = [];

  // Both are primitives or null
  if (oldObj === newObj) {
    if (path) {
      results.push({ type: 'unchanged', path, oldValue: oldObj, newValue: newObj });
    }
    return results;
  }

  // One is null/undefined
  if (oldObj == null || newObj == null) {
    results.push({ type: oldObj == null ? 'added' : 'removed', path, oldValue: oldObj, newValue: newObj });
    return results;
  }

  // Both are arrays
  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    const maxLen = Math.max(oldObj.length, newObj.length);
    for (let i = 0; i < maxLen; i++) {
      const childPath = path ? `${path}[${i}]` : `[${i}]`;
      if (i >= oldObj.length) {
        results.push({ type: 'added', path: childPath, newValue: newObj[i] });
      } else if (i >= newObj.length) {
        results.push({ type: 'removed', path: childPath, oldValue: oldObj[i] });
      } else {
        results.push(...diffObjects(oldObj[i], newObj[i], childPath));
      }
    }
    return results;
  }

  // Both are objects
  if (typeof oldObj === 'object' && typeof newObj === 'object' && !Array.isArray(oldObj) && !Array.isArray(newObj)) {
    const oldKeys = new Set(Object.keys(oldObj as Record<string, unknown>));
    const newKeys = new Set(Object.keys(newObj as Record<string, unknown>));
    const allKeys = new Set([...oldKeys, ...newKeys]);

    for (const key of allKeys) {
      const childPath = path ? `${path}.${key}` : key;
      const oldVal = (oldObj as Record<string, unknown>)[key];
      const newVal = (newObj as Record<string, unknown>)[key];

      if (!oldKeys.has(key)) {
        results.push({ type: 'added', path: childPath, newValue: newVal });
      } else if (!newKeys.has(key)) {
        results.push({ type: 'removed', path: childPath, oldValue: oldVal });
      } else {
        results.push(...diffObjects(oldVal, newVal, childPath));
      }
    }
    return results;
  }

  // Different primitive values
  results.push({ type: 'changed', path, oldValue: oldObj, newValue: newObj });
  return results;
}

function formatValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function renderDiffItem(item: DiffResult, level = 0): React.ReactNode {
  const indent = level * 20;
  const pathStyle = { marginLeft: indent, fontFamily: 'monospace', fontSize: '13px' };
  const valueStyle = { fontFamily: 'monospace', fontSize: '13px', wordBreak: 'break-word' as const };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'added': return '#10b981';
      case 'removed': return '#ef4444';
      case 'changed': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'added': return '+';
      case 'removed': return '-';
      case 'changed': return '~';
      default: return ' ';
    }
  };

  if (item.children && item.children.length > 0) {
    return (
      <div key={item.path} style={pathStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: getTypeLabel(item.type), fontWeight: 'bold' }}>{getTypeLabel(item.type)}</span>
          <span style={{ color: getTypeColor(item.type) }}>{item.path || '(root)'}</span>
          <span style={{ color: '#9ca3af' }}>{item.type}</span>
        </div>
        <div style={{ marginLeft: '16px' }}>
          {item.children.map(child => renderDiffItem(child, level + 1))}
        </div>
      </div>
    );
  }

  return (
    <div key={item.path} style={pathStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ color: getTypeLabel(item.type), fontWeight: 'bold', minWidth: '16px' }}>{getTypeLabel(item.type)}</span>
        <span style={{ color: getTypeColor(item.type) }}>{item.path || '(root)'}</span>
        <span style={{ color: '#9ca3af' }}>{item.type}</span>
        {item.type === 'changed' && (
          <>
            <span style={valueStyle}>&nbsp;{formatValue(item.oldValue)}</span>
            <span style={{ color: '#9ca3af', margin: '0 4px' }}>→</span>
            <span style={valueStyle}>&nbsp;{formatValue(item.newValue)}</span>
          </>
        )}
        {item.type === 'added' && <span style={valueStyle}>&nbsp;{formatValue(item.newValue)}</span>}
        {item.type === 'removed' && <span style={valueStyle}>&nbsp;{formatValue(item.oldValue)}</span>}
        {item.type === 'unchanged' && <span style={valueStyle}>&nbsp;{formatValue(item.newValue)}</span>}
      </div>
    </div>
  );
}

export default function JsonDiff() {
  const [leftJson, setLeftJson] = useState('{\n  "name": "John",\n  "age": 30,\n  "city": "New York",\n  "hobbies": ["reading", "swimming"]\n}');
  const [rightJson, setRightJson] = useState('{\n  "name": "John",\n  "age": 31,\n  "city": "Boston",\n  "hobbies": ["reading", "cycling", "swimming"],\n  "email": "john@example.com"\n}');
  const [leftError, setLeftError] = useState<string | null>(null);
  const [rightError, setRightError] = useState<string | null>(null);
  const [diffResult, setDiffResult] = useState<DiffResult[]>([]);
  const [showUnchanged, setShowUnchanged] = useState(false);

  const parseJson = useCallback((json: string): unknown => {
    return JSON.parse(json);
  }, []);

  const computeDiff = useCallback(() => {
    setLeftError(null);
    setRightError(null);
    try {
      const left = parseJson(leftJson);
      setLeftError(null);
    } catch (e) {
      setLeftError(e instanceof Error ? e.message : 'Invalid JSON');
      return;
    }
    try {
      const right = parseJson(rightJson);
      setRightError(null);
    } catch (e) {
      setRightError(e instanceof Error ? e.message : 'Invalid JSON');
      return;
    }

    try {
      const left = parseJson(leftJson);
      const right = parseJson(rightJson);
      const diff = diffObjects(left, right);
      setDiffResult(diff);
    } catch (e) {
      setLeftError(e instanceof Error ? e.message : 'Diff failed');
    }
  }, [leftJson, rightJson, parseJson]);

  const filteredDiff = showUnchanged ? diffResult : diffResult.filter(d => d.type !== 'unchanged');

  const stats = diffResult.reduce((acc, item) => {
    if (item.type === 'added') acc.added++;
    else if (item.type === 'removed') acc.removed++;
    else if (item.type === 'changed') acc.changed++;
    else acc.unchanged++;
    return acc;
  }, { added: 0, removed: 0, changed: 0, unchanged: 0 });

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>JSON Diff</h2>
        <p className="tool-desc">Compare two JSON objects and visualize differences. Added (green), removed (red), changed (yellow).</p>
      </div>

      <div className="tool-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="panel">
          <div className="panel-header">
            <h3>Original (Left)</h3>
            {leftError && <span className="error-badge">Invalid JSON</span>}
          </div>
          <textarea
            value={leftJson}
            onChange={e => setLeftJson(e.target.value)}
            className={`json-input ${leftError ? 'error' : ''}`}
            placeholder="Paste JSON here..."
            spellCheck={false}
          />
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Modified (Right)</h3>
            {rightError && <span className="error-badge">Invalid JSON</span>}
          </div>
          <textarea
            value={rightJson}
            onChange={e => setRightJson(e.target.value)}
            className={`json-input ${rightError ? 'error' : ''}`}
            placeholder="Paste JSON here..."
            spellCheck={false}
          />
        </div>
      </div>

      <div className="diff-controls">
        <button className="primary-btn" onClick={computeDiff}>Compare</button>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showUnchanged}
            onChange={e => setShowUnchanged(e.target.checked)}
          />
          Show unchanged
        </label>
        <div className="diff-stats">
          <span className="stat added">+{stats.added}</span>
          <span className="stat removed">-{stats.removed}</span>
          <span className="stat changed">~{stats.changed}</span>
          <span className="stat unchanged">={stats.unchanged}</span>
        </div>
      </div>

      <div className="diff-output">
        {diffResult.length === 0 && !leftError && !rightError && (
          <p className="no-diff">No differences found. Click Compare to see results.</p>
        )}
        {diffResult.length > 0 && (
          <div className="diff-tree">
            {filteredDiff.map(item => renderDiffItem(item))}
          </div>
        )}
      </div>
    </div>
  );
}