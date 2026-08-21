import { useState, useMemo } from 'react';

export default function CssGridGenerator() {
  const [columns, setColumns] = useState('1fr 1fr 1fr');
  const [rows, setRows] = useState('auto');
  const [gap, setGap] = useState('16');
  const [columnGap, setColumnGap] = useState('');
  const [rowGap, setRowGap] = useState('');
  const [areas, setAreas] = useState<string[]>(['header header header', 'sidebar main main', 'footer footer footer']);
  const [useAreas, setUseAreas] = useState(false);
  const [copied, setCopied] = useState(false);

  const areaRows = areas.filter(r => r.trim().length > 0);

  const generateCSS = () => {
    const props = [
      `display: grid;`,
      useAreas ? `grid-template-areas: ${areaRows.map(r => `"${r}"`).join(' ')};` : `grid-template-columns: ${columns};`,
      `grid-template-rows: ${rows};`,
      gap ? `gap: ${gap}px;` : '',
      columnGap ? `column-gap: ${columnGap}px;` : '',
      rowGap ? `row-gap: ${rowGap}px;` : '',
    ].filter(Boolean);
    return `.container {\n  ${props.join('\n  ')}\n}`;
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(generateCSS());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addAreaRow = () => {
    setAreas([...areas, '']);
  };

  const removeAreaRow = (index: number) => {
    if (areas.length <= 1) return;
    setAreas(areas.filter((_, i) => i !== index));
  };

  const updateAreaRow = (index: number, value: string) => {
    setAreas(areas.map((r, i) => i === index ? value : r));
  };

  const parseAreas = useMemo(() => {
    if (!useAreas) return [];
    const allNames = new Set<string>();
    areaRows.forEach(row => {
      row.split(/\s+/).forEach(name => {
        if (name && name !== '.') allNames.add(name);
      });
    });
    return Array.from(allNames);
  }, [areaRows, useAreas]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>CSS Grid Generator</h2>
        <p className="tool-desc">Visual CSS Grid layout builder. Define columns, rows, gaps, and named grid areas. Copy the generated CSS.</p>
      </div>

      <div className="grid-layout">
        <div className="controls-panel">
          <div className="control-group">
            <label>
              <input type="checkbox" checked={useAreas} onChange={e => setUseAreas(e.target.checked)} />
              Use Grid Template Areas
            </label>
          </div>

          {!useAreas && (
            <>
              <div className="control-group">
                <label>Grid Template Columns</label>
                <input
                  type="text"
                  value={columns}
                  onChange={e => setColumns(e.target.value)}
                  placeholder="1fr 1fr 1fr or 200px 1fr 100px"
                  className="control-input"
                />
                <p className="hint">Examples: <code>1fr 1fr 1fr</code>, <code>200px 1fr</code>, <code>repeat(3, 1fr)</code></p>
              </div>

              <div className="control-group">
                <label>Grid Template Rows</label>
                <input
                  type="text"
                  value={rows}
                  onChange={e => setRows(e.target.value)}
                  placeholder="auto or 100px 1fr 50px"
                  className="control-input"
                />
                <p className="hint">Examples: <code>auto</code>, <code>100px 1fr</code>, <code>minmax(100px, auto)</code></p>
              </div>
            </>
          )}

          {useAreas && (
            <div className="control-group">
              <label>Grid Template Areas</label>
              <div className="areas-editor">
                {areaRows.map((row, index) => (
                  <div key={index} className="area-row">
                    <input
                      type="text"
                      value={row}
                      onChange={e => updateAreaRow(index, e.target.value)}
                      placeholder="header header header"
                      className="control-input area-input"
                    />
                    {areas.length > 1 && (
                      <button onClick={() => removeAreaRow(index)} className="btn-remove" title="Remove row">×</button>
                    )}
                  </div>
                ))}
                <button onClick={addAreaRow} className="btn-secondary btn-small">+ Add Row</button>
              </div>
              <p className="hint">Use <code>.</code> for empty cells. Each row must have the same number of columns.</p>
            </div>
          )}

          <div className="control-group">
            <label>Gap (px)</label>
            <input type="range" min="0" max="100" value={gap} onChange={e => setGap(e.target.value)} className="control-range" />
            <span>{gap}px</span>
          </div>

          <div className="control-group">
            <label>Column Gap (px, optional)</label>
            <input type="number" min="0" max="100" value={columnGap} onChange={e => setColumnGap(e.target.value)} placeholder="0" className="control-input control-input-small" />
          </div>

          <div className="control-group">
            <label>Row Gap (px, optional)</label>
            <input type="number" min="0" max="100" value={rowGap} onChange={e => setRowGap(e.target.value)} placeholder="0" className="control-input control-input-small" />
          </div>

          <button onClick={copyCSS} className={`copy-btn ${copied ? 'copied' : ''}`}>
            {copied ? '✓ Copied!' : 'Copy CSS'}
          </button>
        </div>

        <div className="preview-panel">
          <h3>Preview</h3>
          <div 
            className="grid-preview"
            style={{
              display: 'grid',
              gridTemplateColumns: useAreas ? 'none' : columns,
              gridTemplateRows: useAreas ? 'none' : rows,
              gridTemplateAreas: useAreas ? areaRows.map(r => `"${r}"`).join(' ') : 'none',
              gap: `${gap}px`,
              columnGap: columnGap ? `${columnGap}px` : 'normal',
              rowGap: rowGap ? `${rowGap}px` : 'normal',
              minHeight: '250px',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid var(--color-border)',
            }}
          >
            {useAreas ? parseAreas.map(name => (
              <div
                key={name}
                style={{
                  gridArea: name,
                  backgroundColor: `hsl(${Math.abs(name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % 360}, 65%, 50%)`,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  minHeight: '60px',
                }}
              >
                {name}
              </div>
            )) : (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: `hsl(${i * 60}, 65%, 50%)`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    minHeight: '80px',
                  }}
                >
                  Item {i + 1}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="output-panel">
        <h3>Generated CSS</h3>
        <pre className="css-output"><code>{generateCSS()}</code></pre>
      </div>
    </div>
  );
}