import { useState, useCallback, useMemo } from 'react';

type PaletteType = 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'split-complementary' | 'square' | 'shades' | 'tints' | 'tones';

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

const PALETTE_TYPES: { value: PaletteType; label: string; description: string; count: number }[] = [
  { value: 'monochromatic', label: 'Monochromatic', description: 'Variations of a single hue', count: 5 },
  { value: 'analogous', label: 'Analogous', description: 'Colors adjacent on the color wheel', count: 5 },
  { value: 'complementary', label: 'Complementary', description: 'Opposite colors on the color wheel', count: 2 },
  { value: 'triadic', label: 'Triadic', description: 'Three evenly spaced colors', count: 3 },
  { value: 'tetradic', label: 'Tetradic', description: 'Two complementary pairs', count: 4 },
  { value: 'split-complementary', label: 'Split Complementary', description: 'Base color with two adjacent to complement', count: 3 },
  { value: 'square', label: 'Square', description: 'Four evenly spaced colors', count: 4 },
  { value: 'shades', label: 'Shades', description: 'Base color with black added', count: 5 },
  { value: 'tints', label: 'Tints', description: 'Base color with white added', count: 5 },
  { value: 'tones', label: 'Tones', description: 'Base color with gray added', count: 5 },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
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
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function createColor(hex: string): Color {
  const rgb = hexToRgb(hex)!;
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return { hex, rgb, hsl };
}

function generatePalette(baseColor: Color, type: PaletteType): Color[] {
  const { h, s, l } = baseColor.hsl;
  const colors: Color[] = [baseColor];

  switch (type) {
    case 'monochromatic': {
      // Same hue, varying saturation and lightness
      const variations = [
        { s: Math.min(s + 20, 100), l: Math.min(l + 20, 100) },
        { s: Math.min(s + 10, 100), l: Math.min(l + 10, 100) },
        { s: Math.max(s - 10, 0), l: Math.max(l - 10, 0) },
        { s: Math.max(s - 20, 0), l: Math.max(l - 20, 0) },
      ];
      variations.forEach(v => {
        const rgb = hslToRgb(h, v.s, v.l);
        colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
      });
      break;
    }
    case 'analogous': {
      // Adjacent hues (30 degrees apart)
      for (let i = 1; i <= 4; i++) {
        const newH = (h + i * 30) % 360;
        const rgb = hslToRgb(newH, s, l);
        colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
      }
      break;
    }
    case 'complementary': {
      // Opposite hue (180 degrees)
      const newH = (h + 180) % 360;
      const rgb = hslToRgb(newH, s, l);
      colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
      break;
    }
    case 'triadic': {
      // 120 degrees apart
      for (let i = 1; i <= 2; i++) {
        const newH = (h + i * 120) % 360;
        const rgb = hslToRgb(newH, s, l);
        colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
      }
      break;
    }
    case 'tetradic': {
      // Two complementary pairs (90 degrees apart)
      for (let i = 1; i <= 3; i++) {
        const newH = (h + i * 90) % 360;
        const rgb = hslToRgb(newH, s, l);
        colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
      }
      break;
    }
    case 'split-complementary': {
      // Base with two adjacent to complement (150 and 210 degrees)
      for (const offset of [150, 210]) {
        const newH = (h + offset) % 360;
        const rgb = hslToRgb(newH, s, l);
        colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
      }
      break;
    }
    case 'square': {
      // 90 degrees apart
      for (let i = 1; i <= 3; i++) {
        const newH = (h + i * 90) % 360;
        const rgb = hslToRgb(newH, s, l);
        colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
      }
      break;
    }
    case 'shades': {
      // Add black (decrease lightness)
      for (let i = 1; i <= 4; i++) {
        const newL = Math.max(l - i * 15, 5);
        const rgb = hslToRgb(h, s, newL);
        colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
      }
      break;
    }
    case 'tints': {
      // Add white (increase lightness)
      for (let i = 1; i <= 4; i++) {
        const newL = Math.min(l + i * 15, 95);
        const rgb = hslToRgb(h, s, newL);
        colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
      }
      break;
    }
    case 'tones': {
      // Add gray (decrease saturation)
      for (let i = 1; i <= 4; i++) {
        const newS = Math.max(s - i * 20, 0);
        const rgb = hslToRgb(h, newS, l);
        colors.push(createColor(rgbToHex(rgb.r, rgb.g, rgb.b)));
      }
      break;
    }
  }

  return colors.slice(0, PALETTE_TYPES.find(t => t.value === type)?.count || 5);
}

function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#000000';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export default function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [paletteType, setPaletteType] = useState<PaletteType>('monochromatic');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const baseColorObj = useMemo(() => createColor(baseColor), [baseColor]);
  const palette = useMemo(() => generatePalette(baseColorObj, paletteType), [baseColorObj, paletteType]);
  const selectedType = PALETTE_TYPES.find(t => t.value === paletteType);

  const handleBaseColorChange = (hex: string) => {
    setBaseColor(hex.startsWith('#') ? hex : `#${hex}`);
  };

  const handleCopy = (hex: string) => {
    copyToClipboard(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const exportPalette = (format: 'css' | 'scss' | 'json' | 'tailwind') => {
    let output = '';
    const name = paletteType.replace('-', '-');
    
    switch (format) {
      case 'css':
        output = palette.map((c, i) => `--color-${name}-${i + 1}: ${c.hex};`).join('\n');
        output = `:root {\n${output}\n}`;
        break;
      case 'scss':
        output = palette.map((c, i) => `$${name}-${i + 1}: ${c.hex};`).join('\n');
        break;
      case 'json':
        output = JSON.stringify(palette.map(c => ({ hex: c.hex, rgb: c.rgb, hsl: c.hsl })), null, 2);
        break;
      case 'tailwind':
        output = palette.map((c, i) => `  '${name}-${i + 1}': '${c.hex}',`).join('\n');
        output = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${output}\n      }\n    }\n  }\n};`;
        break;
    }
    copyToClipboard(output);
    setCopiedColor(`Exported as ${format.toUpperCase()}`);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Color Palette Generator</h2>
        <p className="tool-desc">Generate harmonious color palettes from a base color using color theory algorithms.</p>
      </div>

      <div className="tool-grid">
        <div className="controls-panel">
          <div className="control-group">
            <label>Base Color</label>
            <div className="color-input-group">
              <input
                type="color"
                value={baseColor}
                onChange={e => handleBaseColorChange(e.target.value)}
                className="color-picker-input"
              />
              <input
                type="text"
                value={baseColor}
                onChange={e => handleBaseColorChange(e.target.value)}
                className="color-hex-input"
                placeholder="#3b82f6"
              />
            </div>
            <div className="base-color-preview" style={{ backgroundColor: baseColor }}>
              <span style={{ color: getContrastColor(baseColor) }}>{baseColor}</span>
            </div>
          </div>

          <div className="control-group">
            <label>Palette Type</label>
            <select
              value={paletteType}
              onChange={e => setPaletteType(e.target.value as PaletteType)}
              className="palette-select"
            >
              {PALETTE_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <p className="type-description">{selectedType?.description} ({selectedType?.count} colors)</p>
          </div>

          <div className="control-group">
            <label>Export</label>
            <div className="export-buttons">
              <button onClick={() => exportPalette('css')} className="export-btn">CSS Variables</button>
              <button onClick={() => exportPalette('scss')} className="export-btn">SCSS Variables</button>
              <button onClick={() => exportPalette('json')} className="export-btn">JSON</button>
              <button onClick={() => exportPalette('tailwind')} className="export-btn">Tailwind Config</button>
            </div>
          </div>

          {copiedColor && (
            <div className="copy-toast">
              {copiedColor.startsWith('Exported') ? copiedColor : `Copied ${copiedColor}!`}
            </div>
          )}
        </div>

        <div className="palette-panel">
          <h3>Generated Palette</h3>
          <div className="palette-grid">
            {palette.map((color, index) => (
              <div
                key={index}
                className="palette-swatch"
                style={{ backgroundColor: color.hex }}
                onClick={() => handleCopy(color.hex)}
                title="Click to copy"
              >
                <div className="swatch-content">
                  <div className="swatch-hex" style={{ color: getContrastColor(color.hex) }}>
                    {color.hex}
                  </div>
                  <div className="swatch-values" style={{ color: getContrastColor(color.hex) }}>
                    RGB: {color.rgb.r}, {color.rgb.g}, {color.rgb.b}<br />
                    HSL: {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
                  </div>
                  {index === 0 && (
                    <div className="base-badge" style={{ color: getContrastColor(color.hex) }}>BASE</div>
                  )}
                </div>
                {copiedColor === color.hex && (
                  <div className="copy-indicator">✓ Copied!</div>
                )}
              </div>
            ))}
          </div>

          <div className="palette-preview">
            <h4>Preview: UI Application</h4>
            <div className="ui-preview">
              <div className="preview-card" style={{ backgroundColor: palette[0]?.hex, color: getContrastColor(palette[0]?.hex || '#fff') }}>
                <div className="preview-header" style={{ backgroundColor: palette[1]?.hex }}>Header</div>
                <div className="preview-body">
                  <h5>Card Title</h5>
                  <p>This is a preview of how your palette looks in a UI component.</p>
                  <button className="preview-btn" style={{ backgroundColor: palette[2]?.hex, color: getContrastColor(palette[2]?.hex || '#fff') }}>
                    Primary Action
                  </button>
                  <button className="preview-btn secondary" style={{ backgroundColor: palette[3]?.hex, color: getContrastColor(palette[3]?.hex || '#fff') }}>
                    Secondary
                  </button>
                </div>
                <div className="preview-footer" style={{ backgroundColor: palette[4]?.hex }}>Footer</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}