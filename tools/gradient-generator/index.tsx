import { useState, useCallback } from 'react';

type GradientType = 'linear' | 'radial' | 'conic';
type ColorStop = { color: string; position: number };

export default function GradientGenerator() {
  const [type, setType] = useState<GradientType>('linear');
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<ColorStop[]>([
    { color: '#3b82f6', position: 0 },
    { color: '#8b5cf6', position: 50 },
    { color: '#ec4899', position: 100 },
  ]);
  const [copied, setCopied] = useState(false);
  const [cssOutput, setCssOutput] = useState('');

  const generateCSS = useCallback(() => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopStrings = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');
    
    let css = '';
    switch (type) {
      case 'linear':
        css = `background: linear-gradient(${angle}deg, ${stopStrings});`;
        break;
      case 'radial':
        css = `background: radial-gradient(circle, ${stopStrings});`;
        break;
      case 'conic':
        css = `background: conic-gradient(from ${angle}deg, ${stopStrings});`;
        break;
    }
    
    const fullCSS = `.gradient {\n  ${css}\n  /* Fallback for older browsers */\n  background: ${sortedStops[0].color};\n}`;
    setCssOutput(fullCSS);
    return fullCSS;
  }, [type, angle, stops]);

  const addStop = () => {
    if (stops.length >= 10) return;
    const newPosition = stops.length > 0 
      ? Math.round(100 / (stops.length + 1) * (stops.length)) 
      : 50;
    const newColor = `hsl(${Math.random() * 360}, 70%, 60%)`;
    setStops([...stops, { color: newColor, position: newPosition }].sort((a, b) => a.position - b.position));
  };

  const removeStop = (index: number) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((_, i) => i !== index));
  };

  const updateStopColor = (index: number, color: string) => {
    setStops(stops.map((s, i) => i === index ? { ...s, color } : s));
  };

  const updateStopPosition = (index: number, position: number) => {
    const clamped = Math.max(0, Math.min(100, position));
    setStops(stops.map((s, i) => i === index ? { ...s, position: clamped } : s).sort((a, b) => a.position - b.position));
  };

  const copyCSS = () => {
    navigator.clipboard.writeText(cssOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadPreset = (preset: string) => {
    const presets: Record<string, { type: GradientType; angle: number; stops: ColorStop[] }> = {
      sunset: { type: 'linear', angle: 135, stops: [{ color: '#ff9a9e', position: 0 }, { color: '#fecfef', position: 50 }, { color: '#fecfef', position: 100 }] },
      ocean: { type: 'linear', angle: 180, stops: [{ color: '#2c3e50', position: 0 }, { color: '#3498db', position: 100 }] },
      forest: { type: 'linear', angle: 90, stops: [{ color: '#134e5e', position: 0 }, { color: '#71b280', position: 100 }] },
      fire: { type: 'linear', angle: 45, stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }] },
      violet: { type: 'linear', angle: 135, stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] },
      rainbow: { type: 'linear', angle: 90, stops: [{ color: '#ff0000', position: 0 }, { color: '#ff7f00', position: 14 }, { color: '#ffff00', position: 28 }, { color: '#00ff00', position: 42 }, { color: '#0000ff', position: 57 }, { color: '#4b0082', position: 71 }, { color: '#9400d3', position: 85 }, { color: '#ff0000', position: 100 }] },
      radial_sunset: { type: 'radial', angle: 0, stops: [{ color: '#ff9a9e', position: 0 }, { color: '#fad0c4', position: 100 }] },
      radial_neon: { type: 'radial', angle: 0, stops: [{ color: '#00f2fe', position: 0 }, { color: '#4facfe', position: 100 }] },
      conic_pie: { type: 'conic', angle: 0, stops: [{ color: '#ff6b6b', position: 0 }, { color: '#ffd93d', position: 25 }, { color: '#6bcb77', position: 50 }, { color: '#4d96ff', position: 75 }, { color: '#ff6b6b', position: 100 }] },
    };
    
    const p = presets[preset];
    if (p) {
      setType(p.type);
      setAngle(p.angle);
      setStops(p.stops);
    }
  };

  const randomGradient = () => {
    const types: GradientType[] = ['linear', 'radial', 'conic'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const stopCount = Math.floor(Math.random() * 4) + 2;
    const newStops: ColorStop[] = [];
    
    for (let i = 0; i < stopCount; i++) {
      newStops.push({
        color: `hsl(${Math.random() * 360}, ${50 + Math.random() * 50}%, ${40 + Math.random() * 30}%)`,
        position: Math.round((100 / (stopCount - 1)) * i),
      });
    }
    
    setType(randomType);
    setAngle(randomType === 'conic' ? Math.floor(Math.random() * 360) : Math.floor(Math.random() * 180));
    setStops(newStops);
  };

  const exportCSS = () => {
    const blob = new Blob([cssOutput], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradient.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  generateCSS();

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Gradient Generator</h2>
        <p className="tool-desc">Create beautiful CSS gradients — linear, radial, and conic. Export ready-to-use CSS code.</p>
      </div>

      <div className="gradient-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Controls</h3>
            <div className="toolbar-actions">
              <button onClick={randomGradient} className="btn-secondary">Random</button>
            </div>
          </div>

          <div className="control-group">
            <label>Gradient Type</label>
            <div className="type-buttons">
              {(['linear', 'radial', 'conic'] as const).map(t => (
                <button
                  key={t}
                  className={type === t ? 'active' : ''}
                  onClick={() => setType(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {type !== 'radial' && (
            <div className="control-group">
              <label>Angle: {angle}°</label>
              <input
                type="range"
                min="0"
                max={type === 'conic' ? '360' : '180'}
                value={angle}
                onChange={e => setAngle(Number(e.target.value))}
                className="angle-slider"
              />
              <div className="angle-presets">
                {[0, 45, 90, 135, 180, 225, 270, 315].filter(a => type === 'conic' || a <= 180).map(a => (
                  <button key={a} className={angle === a ? 'active' : ''} onClick={() => setAngle(a)}>
                    {a}°
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="control-group">
            <label>Color Stops ({stops.length})</label>
            <div className="stops-list">
              {stops.map((stop, index) => (
                <div key={index} className="stop-item">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={e => updateStopColor(index, e.target.value)}
                    className="stop-color"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={e => updateStopPosition(index, Number(e.target.value))}
                    className="stop-position"
                  />
                  <span className="stop-position-value">{stop.position}%</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={stop.position}
                    onChange={e => updateStopPosition(index, Number(e.target.value) || 0)}
                    className="stop-position-input"
                  />
                  {stops.length > 2 && (
                    <button className="btn-remove" onClick={() => removeStop(index)}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <button className="btn-add-stop" onClick={addStop} disabled={stops.length >= 10}>
              + Add Color Stop
            </button>
          </div>

          <div className="presets-section">
            <h4>Presets</h4>
            <div className="preset-grid">
              {['sunset', 'ocean', 'forest', 'fire', 'violet', 'rainbow', 'radial_sunset', 'radial_neon', 'conic_pie'].map(p => (
                <button
                  key={p}
                  className="preset-btn"
                  onClick={() => loadPreset(p)}
                  style={{ 
                    background: `var(--preset-${p})`,
                    backgroundImage: `var(--preset-${p}-gradient)`,
                  }}
                  title={p.replace('_', ' ')}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-toolbar">
            <h3>Live Preview</h3>
            <div className="preview-actions">
              <button onClick={copyCSS} className={copied ? 'copied' : ''}>
                {copied ? '✓ Copied!' : 'Copy CSS'}
              </button>
              <button onClick={exportCSS} className="btn-secondary">Download .css</button>
            </div>
          </div>

          <div 
            className="gradient-preview"
            style={{
              background: type === 'linear' 
                ? `linear-gradient(${angle}deg, ${stops.sort((a, b) => a.position - b.position).map(s => `${s.color} ${s.position}%`).join(', ')})`
                : type === 'radial'
                ? `radial-gradient(circle, ${stops.sort((a, b) => a.position - b.position).map(s => `${s.color} ${s.position}%`).join(', ')})`
                : `conic-gradient(from ${angle}deg, ${stops.sort((a, b) => a.position - b.position).map(s => `${s.color} ${s.position}%`).join(', ')})`,
            }}
          >
            <div className="preview-overlay">
              <code className="preview-code">{cssOutput.split('\n')[1]?.trim()}</code>
            </div>
          </div>

          <div className="css-output-section">
            <h4>Generated CSS</h4>
            <pre className="css-code"><code>{cssOutput}</code></pre>
            <p className="css-usage">
              Usage: <code><div className="gradient"></div></code>
            </p>
          </div>

          <div className="color-palette">
            <h4>Color Palette</h4>
            <div className="palette-grid">
              {stops.sort((a, b) => a.position - b.position).map((stop, i) => (
                <div key={i} className="palette-item">
                  <div className="palette-swatch" style={{ backgroundColor: stop.color }}></div>
                  <span className="palette-hex">{stop.color}</span>
                  <span className="palette-position">{stop.position}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}