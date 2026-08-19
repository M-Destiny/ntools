import { useState, useMemo } from 'react';

export default function DiffChecker() {
  const [oldText, setOldText] = useState('');
  const [newText, setNewText] = useState('');
  const [mode, setMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const oldLines = useMemo(() => oldText.split('\n'), [oldText]);
  const newLines = useMemo(() => newText.split('\n'), [newText]);

  const computeDiff = () => {
    const a = ignoreWhitespace ? oldLines.map(l => l.trim()) : oldLines;
    const b = ignoreWhitespace ? newLines.map(l => l.trim()) : newLines;
    
    const m = a.length;
    const n = b.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (a[i - 1] === b[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    const result: Array<{ type: 'equal' | 'added' | 'removed'; value: string; oldLine?: number; newLine?: number }> = [];
    let i = m, j = n;
    let oldLineNum = m, newLineNum = n;
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        result.unshift({ type: 'equal', value: oldLines[i - 1], oldLine: oldLineNum, newLine: newLineNum });
        i--; j--; oldLineNum--; newLineNum--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        result.unshift({ type: 'added', value: newLines[j - 1], newLine: newLineNum });
        j--; newLineNum--;
      } else if (i > 0) {
        result.unshift({ type: 'removed', value: oldLines[i - 1], oldLine: oldLineNum });
        i--; oldLineNum--;
      }
    }
    
    return result;
  };

  const diff = useMemo(() => computeDiff(), [oldText, newText, ignoreWhitespace]);

  const stats = useMemo(() => {
    let added = 0, removed = 0, unchanged = 0;
    diff.forEach(d => {
      if (d.type === 'added') added++;
      else if (d.type === 'removed') removed++;
      else unchanged++;
    });
    return { added, removed, unchanged };
  }, [diff]);

  const loadExample = () => {
    setOldText(`function greet(name) {
  console.log("Hello, " + name);
  return "Welcome " + name;
}

const users = ["Alice", "Bob", "Charlie"];
users.forEach(greet);`);

    setNewText(`function greet(name: string) {
  console.log(\`Hello, \${name}\`);
  return \`Welcome \${name}\`;
}

const users = ["Alice", "Bob", "Charlie", "Diana"];
users.forEach(greet);

// New feature: logging
function logGreeting(name: string) {
  console.log(\`[LOG] Greeted \${name}\`);
}`);

  };

  const clearAll = () => {
    setOldText('');
    setNewText('');
  };

  const copyDiff = () => {
    const output = diff.map(d => {
      const prefix = d.type === 'added' ? '+' : d.type === 'removed' ? '-' : ' ';
      return `${prefix} ${d.value}`;
    }).join('\n');
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Diff Checker</h2>
        <p className="tool-desc">Compare two text blocks and visualize differences with side-by-side or unified view</p>
      </div>

      <div className="diff-toolbar">
        <div className="toolbar-group">
          <button onClick={loadExample} className="btn-secondary">Load Example</button>
          <button onClick={clearAll} className="btn-secondary">Clear</button>
          <button onClick={copyDiff} className="btn-secondary">Copy Diff</button>
        </div>
        <div className="toolbar-group">
          <label>
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={e => setIgnoreWhitespace(e.target.checked)}
            />
            Ignore whitespace
          </label>
          <label>
            <input
              type="checkbox"
              checked={showLineNumbers}
              onChange={e => setShowLineNumbers(e.target.checked)}
            />
            Line numbers
          </label>
        </div>
        <div className="toolbar-group">
          <label>View:</label>
          <select value={mode} onChange={e => setMode(e.target.value as any)} className="mode-select">
            <option value="side-by-side">Side by Side</option>
            <option value="unified">Unified</option>
          </select>
        </div>
      </div>

      <div className="diff-stats">
        <span className="stat unchanged">Unchanged: {stats.unchanged}</span>
        <span className="stat added">Added: {stats.added}</span>
        <span className="stat removed">Removed: {stats.removed}</span>
      </div>

      <div className="diff-editors">
        <div className="editor-pane">
          <div className="pane-header">
            <h3>Original</h3>
            <span className="line-count">{oldLines.length} lines</span>
          </div>
          <textarea
            className="diff-editor"
            value={oldText}
            onChange={e => setOldText(e.target.value)}
            placeholder="Paste original text here..."
            spellCheck={false}
          />
        </div>

        <div className="editor-pane">
          <div className="pane-header">
            <h3>Modified</h3>
            <span className="line-count">{newLines.length} lines</span>
          </div>
          <textarea
            className="diff-editor"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Paste modified text here..."
            spellCheck={false}
          />
        </div>
      </div>

      <div className="diff-output">
        <h3>Diff Result ({mode === 'side-by-side' ? 'Side by Side' : 'Unified'})</h3>
        {mode === 'side-by-side' ? (
          <div className="side-by-side-diff">
            <div className="diff-column">
              <div className="column-header">Original</div>
              {diff.map((chunk, idx) => (
                <div key={idx} className={`diff-line ${chunk.type === 'removed' ? 'removed' : chunk.type === 'added' ? 'added-context' : ''}`}>
                  {showLineNumbers && chunk.oldLine !== undefined && <span className="line-num">{chunk.oldLine}</span>}
                  <span className="line-content">{chunk.value || ' '}</span>
                </div>
              ))}
            </div>
            <div className="diff-column">
              <div className="column-header">Modified</div>
              {diff.map((chunk, idx) => (
                <div key={idx} className={`diff-line ${chunk.type === 'added' ? 'added' : chunk.type === 'removed' ? 'removed-context' : ''}`}>
                  {showLineNumbers && chunk.newLine !== undefined && <span className="line-num">{chunk.newLine}</span>}
                  <span className="line-content">{chunk.value || ' '}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="unified-diff">
            {diff.map((chunk, idx) => (
              <div key={idx} className={`unified-line ${chunk.type}`}>
                {showLineNumbers && (
                  <>
                    <span className="line-num old">{chunk.oldLine ?? ''}</span>
                    <span className="line-num new">{chunk.newLine ?? ''}</span>
                  </>
                )}
                <span className="prefix">{chunk.type === 'added' ? '+' : chunk.type === 'removed' ? '-' : ' '}</span>
                <span className="line-content">{chunk.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}