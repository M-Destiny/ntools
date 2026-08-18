import { useState, useRef, useEffect } from 'react';

export default function ColorPicker() {
  const [color, setColor] = useState('#3b82f6');
  const [format, setFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  // Initialize canvas gradient
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;

    const drawGradient = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // White to transparent gradient (vertical)
      const whiteGradient = ctx.createLinearGradient(0, 0, 0, height);
      whiteGradient.addColorStop(0, 'rgba(255,255,255,1)');
      whiteGradient.addColorStop(1, 'rgba(255,255,255,0)');
      
      // Black to transparent gradient (horizontal)
      const blackGradient = ctx.createLinearGradient(0, 0, width, 0);
      blackGradient.addColorStop(0, 'rgba(0,0,0,0)');
      blackGradient.addColorStop(1, 'rgba(0,0,0,1)');
      
      // Hue gradient (horizontal)
      const hueGradient = ctx.createLinearGradient(0, 0, width, 0);
      for (let i = 0; i <= 360; i += 30) {
        hueGradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
      }
      
      // Draw hue base
      ctx.fillStyle = hueGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Overlay white gradient
      ctx.fillStyle = whiteGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Overlay black gradient
      ctx.fillStyle = blackGradient;
      ctx.fillRect(0, 0, width, height);
    };

    drawGradient();
  }, []);

  const getColorAt = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return color;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const pixel = ctx.getImageData(Math.floor(x * scaleX), Math.floor(y * scaleY), 1, 1).data;
    return `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const newColor = getColorAt(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setColor(newColor);
    addToHistory(newColor);
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons === 1) { // Left mouse button held
      handleCanvasClick(e);
    }
  };

  const addToHistory = (c: string) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h !== c);
      return [c, ...filtered].slice(0, 10);
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFormattedColor());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFormattedColor = () => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    
    switch (format) {
      case 'hex':
        return color;
      case 'rgb':
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      case 'hsl': {
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
      }
      default:
        return color;
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : { h: 0, s: 0, l: 0 };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Color Picker</h2>
        <p className="tool-desc">Pick colors from the gradient canvas or use the native picker. Copy values in hex, rgb, or hsl.</p>
      </div>

      <div className="tool-grid">
        <div className="picker-panel">
          <div className="color-preview" style={{ backgroundColor: color }}></div>
          
          <div className="color-values">
            <div className="value-row">
              <label>HEX</label>
              <input 
                type="text" 
                value={color} 
                onChange={e => { setColor(e.target.value); addToHistory(e.target.value); }}
                className="color-input"
              />
            </div>
            <div className="value-row">
              <label>RGB</label>
              <input 
                type="text" 
                value={rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : ''} 
                readOnly
                className="color-input"
              />
            </div>
            <div className="value-row">
              <label>HSL</label>
              <input 
                type="text" 
                value={hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : ''} 
                readOnly
                className="color-input"
              />
            </div>
          </div>

          <div className="format-toggle">
            {(['hex', 'rgb', 'hsl'] as const).map(f => (
              <button
                key={f}
                className={format === f ? 'active' : ''}
                onClick={() => setFormat(f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          <button className="copy-btn" onClick={copyToClipboard}>
            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
          </button>

          <div className="native-picker">
            <label>Native Picker</label>
            <input
              ref={pickerRef}
              type="color"
              value={color}
              onChange={e => { setColor(e.target.value); addToHistory(e.target.value); }}
            />
          </div>
        </div>

        <div className="canvas-panel">
          <h3>Color Canvas</h3>
          <canvas
            ref={canvasRef}
            width={300}
            height={200}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMove}
            className="color-canvas"
          />
          <p className="canvas-hint">Click and drag to pick colors</p>
        </div>
      </div>

      {history.length > 0 && (
        <div className="history-panel">
          <h3>Recent Colors</h3>
          <div className="history-grid">
            {history.map((c, i) => (
              <div
                key={i}
                className="history-swatch"
                style={{ backgroundColor: c }}
                onClick={() => { setColor(c); addToHistory(c); }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}