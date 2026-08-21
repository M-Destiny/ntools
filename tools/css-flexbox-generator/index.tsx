import { useState } from 'react';

export default function CssFlexboxGenerator() {
  const [direction, setDirection] = useState<'row' | 'row-reverse' | 'column' | 'column-reverse'>('row');
  const [justifyContent, setJustifyContent] = useState<'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'>('flex-start');
  const [alignItems, setAlignItems] = useState<'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'>('stretch');
  const [gap, setGap] = useState('16');
  const [wrap, setWrap] = useState<'nowrap' | 'wrap' | 'wrap-reverse'>('nowrap');
  const [items, setItems] = useState([
    { id: 1, size: '100', color: '#3b82f6' },
    { id: 2, size: '100', color: '#22c55e' },
    { id: 3, size: '100', color: '#f97316' },
  ]);
  const [copied, setCopied] = useState(false);

  const addItem = () => {
    const newId = Math.max(...items.map(i => i.id)) + 1;
    setItems([...items, { id: newId, size: '100', color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0') }]);
  };

  const removeItem = (id: number) => {
    if (items.length <= 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: number, field: 'size' | 'color', value: string) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const generateCSS = () => {
    const props = [
      `display: flex;`,
      `flex-direction: ${direction};`,
      `justify-content: ${justifyContent};`,
      `align-items: ${alignItems};`,
      `flex-wrap: ${wrap};`,
      `gap: ${gap}px;`,
    ];
    return `.container {\n  ${props.join('\n  ')}\n}`;
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(generateCSS());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>CSS Flexbox Generator</h2>
        <p className="tool-desc">Visual flexbox layout builder. Configure properties and copy the generated CSS.</p>
      </div>

      <div className="flexbox-layout">
        <div className="controls-panel">
          <div className="control-group">
            <label>Flex Direction</label>
            <select value={direction} onChange={e => setDirection(e.target.value as any)} className="control-select">
              <option value="row">Row</option>
              <option value="row-reverse">Row Reverse</option>
              <option value="column">Column</option>
              <option value="column-reverse">Column Reverse</option>
            </select>
          </div>

          <div className="control-group">
            <label>Justify Content</label>
            <select value={justifyContent} onChange={e => setJustifyContent(e.target.value as any)} className="control-select">
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>

          <div className="control-group">
            <label>Align Items</label>
            <select value={alignItems} onChange={e => setAlignItems(e.target.value as any)} className="control-select">
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="stretch">Stretch</option>
              <option value="baseline">Baseline</option>
            </select>
          </div>

          <div className="control-group">
            <label>Flex Wrap</label>
            <select value={wrap} onChange={e => setWrap(e.target.value as any)} className="control-select">
              <option value="nowrap">No Wrap</option>
              <option value="wrap">Wrap</option>
              <option value="wrap-reverse">Wrap Reverse</option>
            </select>
          </div>

          <div className="control-group">
            <label>Gap (px)</label>
            <input type="range" min="0" max="100" value={gap} onChange={e => setGap(e.target.value)} className="control-range" />
            <span>{gap}px</span>
          </div>

          <div className="items-control">
            <div className="items-header">
              <h4>Flex Items ({items.length})</h4>
              <button onClick={addItem} className="btn-secondary" disabled={items.length >= 6}>+ Add Item</button>
            </div>
            {items.map((item, index) => (
              <div key={item.id} className="item-control">
                <div className="item-color">
                  <input type="color" value={item.color} onChange={e => updateItem(item.id, 'color', e.target.value)} />
                  <span>Item {index + 1}</span>
                </div>
                <div className="item-size">
                  <input type="range" min="50" max="300" value={item.size} onChange={e => updateItem(item.id, 'size', e.target.value)} />
                  <span>{item.size}px</span>
                </div>
                {items.length > 1 && (
                  <button onClick={() => removeItem(item.id)} className="btn-remove" title="Remove">×</button>
                )}
              </div>
            ))}
          </div>

          <button onClick={copyCSS} className={`copy-btn ${copied ? 'copied' : ''}`}>
            {copied ? '✓ Copied!' : 'Copy CSS'}
          </button>
        </div>

        <div className="preview-panel">
          <h3>Preview</h3>
          <div 
            className="flexbox-preview"
            style={{
              display: 'flex',
              flexDirection: direction,
              justifyContent: justifyContent,
              alignItems: alignItems,
              flexWrap: wrap,
              gap: `${gap}px`,
              minHeight: '200px',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid var(--color-border)',
            }}
          >
            {items.map(item => (
              <div
                key={item.id}
                style={{
                  width: `${item.size}px`,
                  height: direction.startsWith('column') ? `${item.size}px` : '100px',
                  minHeight: direction.startsWith('column') ? '100px' : 'auto',
                  backgroundColor: item.color,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  flexShrink: 0,
                }}
              >
                {item.size}×{direction.startsWith('column') ? item.size : '100'}
              </div>
            ))}
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