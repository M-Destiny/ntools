import { useState, useRef } from 'react';

interface ShadowLayer {
  id: number;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

export default function CssShadowGenerator() {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { id: 1, x: 0, y: 4, blur: 6, spread: 0, color: '#000000', opacity: 0.1, inset: false },
    { id: 2, x: 0, y: 10, blur: 15, spread: -3, color: '#000000', opacity: 0.1, inset: false },
  ]);
  const [nextId, setNextId] = useState(3);
  const [preset, setPreset] = useState<string>('custom');
  const [copied, setCopied] = useState(false);
  const [previewSize, setPreviewSize] = useState(120);
  const previewRef = useRef<HTMLDivElement>(null);

  const presets = {
    custom: 'Custom',
    subtle: 'Subtle',
    medium: 'Medium',
    elevated: 'Elevated',
    floating: 'Floating',
    inner: 'Inner Shadow',
    neon: 'Neon Glow',
    brutalist: 'Brutalist',
    soft: 'Soft Depth',
    'long-shadow': 'Long Shadow',
  };

  const presetValues: Record<string, Omit<ShadowLayer, 'id'>[]> = {
    subtle: [{ x: 0, y: 1, blur: 2, spread: 0, color: '#000000', opacity: 0.05, inset: false }],
    medium: [
      { x: 0, y: 4, blur: 6, spread: -1, color: '#000000', opacity: 0.1, inset: false },
      { x: 0, y: 2, blur: 4, spread: -1, color: '#000000', opacity: 0.06, inset: false },
    ],
    elevated: [
      { x: 0, y: 10, blur: 15, spread: -3, color: '#000000', opacity: 0.1, inset: false },
      { x: 0, y: 4, blur: 6, spread: -2, color: '#000000', opacity: 0.05, inset: false },
    ],
    floating: [
      { x: 0, y: 20, blur: 25, spread: -5, color: '#000000', opacity: 0.15, inset: false },
      { x: 0, y: 10, blur: 10, spread: -5, color: '#000000', opacity: 0.1, inset: false },
    ],
    inner: [{ x: 0, y: 2, blur: 4, spread: 0, color: '#000000', opacity: 0.1, inset: true }],
    neon: [
      { x: 0, y: 0, blur: 5, spread: 0, color: '#00ffff', opacity: 0.8, inset: false },
      { x: 0, y: 0, blur: 10, spread: 0, color: '#00ffff', opacity: 0.5, inset: false },
      { x: 0, y: 0, blur: 20, spread: 0, color: '#00ffff', opacity: 0.3, inset: false },
    ],
    brutalist: [
      { x: 8, y: 8, blur: 0, spread: 0, color: '#000000', opacity: 1, inset: false },
      { x: 4, y: 4, blur: 0, spread: 0, color: '#ffffff', opacity: 0.5, inset: false },
    ],
    soft: [
      { x: 0, y: 2, blur: 8, spread: 0, color: '#000000', opacity: 0.08, inset: false },
      { x: 0, y: 6, blur: 16, spread: -4, color: '#000000', opacity: 0.08, inset: false },
    ],
    'long-shadow': [
      { x: 10, y: 10, blur: 0, spread: 0, color: '#000000', opacity: 0.15, inset: false },
      { x: 8, y: 8, blur: 0, spread: 0, color: '#000000', opacity: 0.15, inset: false },
      { x: 6, y: 6, blur: 0, spread: 0, color: '#000000', opacity: 0.15, inset: false },
      { x: 4, y: 4, blur: 0, spread: 0, color: '#000000', opacity: 0.15, inset: false },
      { x: 2, y: 2, blur: 0, spread: 0, color: '#000000', opacity: 0.15, inset: false },
    ],
  };

  const applyPreset = (presetName: string) => {
    if (presetName === 'custom') return;
    const values = presetValues[presetName];
    if (values) {
      const newLayers = values.map((v, i) => ({ ...v, id: i + 1 }));
      setLayers(newLayers);
      setNextId(values.length + 1);
      setPreset(presetName);
    }
  };

  const updateLayer = (id: number, updates: Partial<ShadowLayer>) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    setPreset('custom');
  };

  const addLayer = () => {
    const newLayer: ShadowLayer = {
      id: nextId,
      x: 0,
      y: 4,
      blur: 6,
      spread: 0,
      color: '#000000',
      opacity: 0.1,
      inset: false,
    };
    setLayers(prev => [...prev, newLayer]);
    setNextId(prev => prev + 1);
    setPreset('custom');
  };

  const removeLayer = (id: number) => {
    if (layers.length <= 1) return;
    setLayers(prev => prev.filter(l => l.id !== id));
    setPreset('custom');
  };

  const duplicateLayer = (id: number) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      const newLayer = { ...layer, id: nextId };
      setLayers(prev => [...prev, newLayer]);
      setNextId(prev => prev + 1);
      setPreset('custom');
    }
  };

  const generateCss = () => {
    if (layers.length === 0) return 'box-shadow: none;';
    
    const shadows = layers.map(layer => {
      const rgba = hexToRgba(layer.color, layer.opacity);
      const inset = layer.inset ? 'inset ' : '';
      return `${inset}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px ${rgba}`;
    });
    
    return `box-shadow: ${shadows.join(',\n  ')};`;
  };

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const copyToClipboard = () => {
    const css = generateCss();
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const previewStyle = {
    width: previewSize,
    height: previewSize,
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: layers.map(layer => {
      const rgba = hexToRgba(layer.color, layer.opacity);
      const inset = layer.inset ? 'inset ' : '';
      return `${inset}${layer.x}px ${layer.y}px ${layer.blur}px ${layer.spread}px ${rgba}`;
    }).join(', '),
    transition: 'all 0.3s ease',
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>CSS Shadow Generator</h2>
        <p className="tool-desc">Create complex box-shadow effects with multiple layers. Build subtle depth, neon glows, or brutalist shadows visually.</p>
      </div>

      <div className="tool-grid">
        <div className="controls-panel">
          <div className="preset-section">
            <h3>Presets</h3>
            <div className="preset-grid">
              {Object.entries(presets).map(([key, label]) => (
                <button
                  key={key}
                  className={`preset-btn ${preset === key ? 'active' : ''}`}
                  onClick={() => applyPreset(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="layers-section">
            <div className="section-header">
              <h3>Shadow Layers</h3>
              <button className="add-layer-btn" onClick={addLayer}>+ Add Layer</button>
            </div>
            
            {layers.map(layer => (
              <div key={layer.id} className="layer-card">
                <div className="layer-header">
                  <span className="layer-title">Layer {layers.findIndex(l => l.id === layer.id) + 1}</span>
                  <div className="layer-actions">
                    <button className="icon-btn" onClick={() => duplicateLayer(layer.id)} title="Duplicate">⧉</button>
                    <button className="icon-btn danger" onClick={() => removeLayer(layer.id)} title="Remove">✕</button>
                  </div>
                </div>

                <div className="layer-controls">
                  <div className="control-row">
                    <label>
                      X Offset
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={layer.x}
                        onChange={e => updateLayer(layer.id, { x: parseInt(e.target.value) })}
                      />
                      <span className="value">{layer.x}px</span>
                    </label>
                    <label>
                      Y Offset
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={layer.y}
                        onChange={e => updateLayer(layer.id, { y: parseInt(e.target.value) })}
                      />
                      <span className="value">{layer.y}px</span>
                    </label>
                  </div>

                  <div className="control-row">
                    <label>
                      Blur
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={layer.blur}
                        onChange={e => updateLayer(layer.id, { blur: parseInt(e.target.value) })}
                      />
                      <span className="value">{layer.blur}px</span>
                    </label>
                    <label>
                      Spread
                      <input
                        type="range"
                        min="-20"
                        max="20"
                        value={layer.spread}
                        onChange={e => updateLayer(layer.id, { spread: parseInt(e.target.value) })}
                      />
                      <span className="value">{layer.spread}px</span>
                    </label>
                  </div>

                  <div className="control-row">
                    <label>
                      Opacity
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={layer.opacity}
                        onChange={e => updateLayer(layer.id, { opacity: parseFloat(e.target.value) })}
                      />
                      <span className="value">{Math.round(layer.opacity * 100)}%</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={layer.inset}
                        onChange={e => updateLayer(layer.id, { inset: e.target.checked })}
                      />
                      Inset
                    </label>
                  </div>

                  <div className="color-control">
                    <label>Color</label>
                    <div className="color-inputs">
                      <input
                        type="color"
                        value={layer.color}
                        onChange={e => updateLayer(layer.id, { color: e.target.value })}
                      />
                      <input
                        type="text"
                        value={layer.color}
                        onChange={e => updateLayer(layer.id, { color: e.target.value })}
                        className="hex-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="preview-panel">
          <div className="panel-header">
            <h3>Live Preview</h3>
            <div className="preview-controls">
              <label>
                Size
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={previewSize}
                  onChange={e => setPreviewSize(parseInt(e.target.value))}
                />
                <span>{previewSize}px</span>
              </label>
            </div>
          </div>

          <div className="preview-area">
            <div ref={previewRef} className="preview-box" style={previewStyle}></div>
          </div>

          <div className="css-output">
            <div className="output-header">
              <h3>Generated CSS</h3>
              <button className="copy-btn" onClick={copyToClipboard}>
                {copied ? '✓ Copied!' : 'Copy CSS'}
              </button>
            </div>
            <pre className="css-code">{generateCss()}</pre>
          </div>

          <div className="usage-tip">
            <p><strong>Tip:</strong> Paste the CSS into your stylesheet. For multiple shadows, the first layer appears on top.</p>
          </div>
        </div>
      </div>
    </div>
  );
}