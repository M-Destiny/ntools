import { useState } from 'react';

type ColorFormat = 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hsv' | 'hsva' | 'cmyk' | 'css';

interface ColorValue {
  hex: string;
  r: number;
  g: number;
  b: number;
  a: number;
  h: number;
  s: number;
  l: number;
  v: number;
  c: number;
  m: number;
  y: number;
  k: number;
}

const INITIAL_STATE: ColorValue = {
  hex: '#3b82f6',
  r: 59, g: 130, b: 246, a: 1,
  h: 221, s: 89, l: 60, v: 96,
  c: 76, m: 47, y: 0, k: 4,
};

export default function ColorFormatConverter() {
  const [input, setInput] = useState('#3b82f6');
  const [format, setFormat] = useState<ColorFormat>('hex');
  const [color, setColor] = useState<ColorValue>(INITIAL_STATE);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const parseColor = (str: string): Partial<ColorValue> | null => {
    const trimmed = str.trim();
    let r = 0, g = 0, b = 0, a = 1;

    // Hex
    if (trimmed.startsWith('#')) {
      const hex = trimmed.slice(1);
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      } else if (hex.length === 8) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
        a = parseInt(hex.slice(6, 8), 16) / 255;
      } else return null;
      return { r, g, b, a };
    }

    // RGB/RGBA
    const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
    if (rgbMatch) {
      r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
      g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
      b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
      a = rgbMatch[4] ? Math.min(1, Math.max(0, parseFloat(rgbMatch[4]))) : 1;
      return { r, g, b, a };
    }

    // HSL/HSLA
    const hslMatch = trimmed.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+)\s*)?\)/i);
    if (hslMatch) {
      const h = parseInt(hslMatch[1], 10) % 360;
      const s = Math.min(100, Math.max(0, parseInt(hslMatch[2], 10))) / 100;
      const l = Math.min(100, Math.max(0, parseInt(hslMatch[3], 10))) / 100;
      a = hslMatch[4] ? Math.min(1, Math.max(0, parseFloat(hslMatch[4]))) : 1;
      const { r: rr, g: gg, b: bb } = hslToRgb(h, s, l);
      return { r: rr, g: gg, b: bb, a };
    }

    // HSV/HSVA
    const hsvMatch = trimmed.match(/hsva?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+)\s*)?\)/i);
    if (hsvMatch) {
      const h = parseInt(hsvMatch[1], 10) % 360;
      const s = Math.min(100, Math.max(0, parseInt(hsvMatch[2], 10))) / 100;
      const v = Math.min(100, Math.max(0, parseInt(hsvMatch[3], 10))) / 100;
      a = hsvMatch[4] ? Math.min(1, Math.max(0, parseFloat(hsvMatch[4]))) : 1;
      const { r: rr, g: gg, b: bb } = hsvToRgb(h, s, v);
      return { r: rr, g: gg, b: bb, a };
    }

    // CMYK
    const cmykMatch = trimmed.match(/cmyk\(\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/i);
    if (cmykMatch) {
      const c = parseInt(cmykMatch[1], 10) / 100;
      const m = parseInt(cmykMatch[2], 10) / 100;
      const y = parseInt(cmykMatch[3], 10) / 100;
      const k = parseInt(cmykMatch[4], 10) / 100;
      r = Math.round(255 * (1 - c) * (1 - k));
      g = Math.round(255 * (1 - m) * (1 - k));
      b = Math.round(255 * (1 - y) * (1 - k));
      return { r, g, b, a: 1 };
    }

    // Named colors (basic set)
    const namedColors: Record<string, string> = {
      'red': '#ff0000', 'green': '#008000', 'blue': '#0000ff',
      'white': '#ffffff', 'black': '#000000', 'gray': '#808080',
      'yellow': '#ffff00', 'cyan': '#00ffff', 'magenta': '#ff00ff',
      'orange': '#ffa500', 'purple': '#800080', 'pink': '#ffc0cb',
    };
    if (namedColors[trimmed.toLowerCase()]) {
      return parseColor(namedColors[trimmed.toLowerCase()]);
    }

    return null;
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
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const v = max;
    let h = 0, s = max === 0 ? 0 : (max - min) / max;
    if (max !== min) {
      const d = max - min;
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100) };
  };

  const rgbToCmyk = (r: number, g: number, b: number) => {
    let c = 1 - r / 255;
    let m = 1 - g / 255;
    let y = 1 - b / 255;
    const k = Math.min(c, m, y);
    if (k === 1) { c = 0; m = 0; y = 0; }
    else { c = (c - k) / (1 - k); m = (m - k) / (1 - k); y = (y - k) / (1 - k); }
    return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h/360 + 1/3);
      g = hue2rgb(p, q, h/360);
      b = hue2rgb(p, q, h/360 - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  };

  const hsvToRgb = (h: number, s: number, v: number) => {
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
  };

  const toHex = (r: number, g: number, b: number, a: number) => {
    const toHexByte = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
    return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}${a < 1 ? toHexByte(a * 255) : ''}`.toUpperCase();
  };

  const formatOutput = (fmt: ColorFormat, c: ColorValue): string => {
    switch (fmt) {
      case 'hex': return c.hex;
      case 'rgb': return `rgb(${c.r}, ${c.g}, ${c.b})`;
      case 'rgba': return `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a.toFixed(2).replace(/\.00$/, '')})`;
      case 'hsl': return `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
      case 'hsla': return `hsla(${c.h}, ${c.s}%, ${c.l}%, ${c.a.toFixed(2).replace(/\.00$/, '')})`;
      case 'hsv': return `hsv(${c.h}, ${c.s}%, ${c.v}%)`;
      case 'hsva': return `hsva(${c.h}, ${c.s}%, ${c.v}%, ${c.a.toFixed(2).replace(/\.00$/, '')})`;
      case 'cmyk': return `cmyk(${c.c}%, ${c.m}%, ${c.y}%, ${c.k}%)`;
      case 'css': return c.a < 1 ? `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a.toFixed(2)})` : c.hex;
      default: return c.hex;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    const parsed = parseColor(val);
    if (parsed && parsed.r !== undefined && parsed.g !== undefined && parsed.b !== undefined) {
      setError(null);
      const { r, g, b, a = 1 } = parsed;
      const { h, s, l } = rgbToHsl(r, g, b);
      const { v } = rgbToHsv(r, g, b);
      const { c, m, y, k } = rgbToCmyk(r, g, b);
      const hex = toHex(r, g, b, a);
      setColor({ r, g, b, a, h, s, l, v, c, m, y, k, hex });
    } else {
      setError('Invalid color format');
    }
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormat(e.target.value as ColorFormat);
  };

  const copyOutput = () => {
    const out = formatOutput(format, color);
    navigator.clipboard.writeText(out);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    const examples = ['#3b82f6', 'rgb(59, 130, 246)', 'hsl(221, 89%, 60%)', 'hsv(221, 76%, 96%)', 'cmyk(76%, 47%, 0%, 4%)'];
    const ex = examples[Math.floor(Math.random() * examples.length)];
    setInput(ex);
    const parsed = parseColor(ex);
    if (parsed) handleInputChange({ target: { value: ex } } as any);
  };

  const clearAll = () => {
    setInput('');
    setError(null);
  };

  const output = formatOutput(format, color);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Color Format Converter</h2>
        <p className="tool-desc">Convert colors between Hex, RGB, HSL, HSV, CMYK, and CSS formats</p>
      </div>

      <div className="converter-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Input</h3>
            <div className="toolbar-actions">
              <button onClick={loadExample} className="btn-secondary">Load Example</button>
              <button onClick={clearAll} className="btn-secondary">Clear</button>
            </div>
          </div>
          <input
            type="text"
            className="color-input"
            value={input}
            onChange={handleInputChange}
            placeholder="Enter color (hex, rgb, hsl, hsv, cmyk, or name)..."
            spellCheck={false}
          />
          <div className="color-preview" style={{ backgroundColor: color.hex }}></div>
          {error && <span className="error">✗ {error}</span>}
        </div>

        <div className="controls-panel">
          <div className="format-selector">
            <label>Output Format</label>
            <select value={format} onChange={handleFormatChange} className="format-select">
              <option value="hex">HEX (#RRGGBB)</option>
              <option value="rgb">RGB (r, g, b)</option>
              <option value="rgba">RGBA (r, g, b, a)</option>
              <option value="hsl">HSL (h, s%, l%)</option>
              <option value="hsla">HSLA (h, s%, l%, a)</option>
              <option value="hsv">HSV (h, s%, v%)</option>
              <option value="hsva">HSVA (h, s%, v%, a)</option>
              <option value="cmyk">CMYK (c%, m%, y%, k%)</option>
              <option value="css">CSS (auto hex/rgba)</option>
            </select>
          </div>

          <div className="output-section">
            <h3>Output</h3>
            <div className="output-value">
              <code>{output}</code>
              <button onClick={copyOutput} className={copied ? 'copied' : ''}>
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="all-formats">
            <h3>All Formats</h3>
            <table className="formats-table">
              <tbody>
                <tr><td>HEX</td><td><code>{color.hex}</code></td></tr>
                <tr><td>RGB</td><td><code>rgb({color.r}, {color.g}, {color.b})</code></td></tr>
                <tr><td>RGBA</td><td><code>rgba({color.r}, {color.g}, {color.b}, {color.a.toFixed(2)})</code></td></tr>
                <tr><td>HSL</td><td><code>hsl({color.h}, {color.s}%, {color.l}%)</code></td></tr>
                <tr><td>HSLA</td><td><code>hsla({color.h}, {color.s}%, {color.l}%, {color.a.toFixed(2)})</code></td></tr>
                <tr><td>HSV</td><td><code>hsv({color.h}, {color.s}%, {color.v}%)</code></td></tr>
                <tr><td>HSVA</td><td><code>hsva({color.h}, {color.s}%, {color.v}%, {color.a.toFixed(2)})</code></td></tr>
                <tr><td>CMYK</td><td><code>cmyk({color.c}%, {color.m}%, {color.y}%, {color.k}%)</code></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}