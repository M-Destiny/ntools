import { useState } from 'react';

type ColorScheme = 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'tetradic' | 'split-complementary' | 'custom';
type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'css';

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

interface GeneratedScheme {
  name: string;
  colors: Color[];
  description: string;
}

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
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

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  h /= 360; s /= 100; l /= 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const hslToRgbArray = (h: number, s: number, l: number): [number, number, number] => {
  const rgb = hslToRgb(h, s, l);
  return [rgb.r, rgb.g, rgb.b];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

const createColor = (hex: string): Color => {
  const rgb = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return { hex: hex.startsWith('#') ? hex : '#' + hex, rgb, hsl };
};

const generateScheme = (baseColor: Color, scheme: ColorScheme): GeneratedScheme => {
  const { h, s, l } = baseColor.hsl;
  let colors: Color[] = [baseColor];
  let name = '';
  let description = '';

  switch (scheme) {
    case 'monochromatic':
      name = 'Monochromatic';
      description = 'Variations of a single hue with different saturation and lightness';
      colors = [
        createColor(rgbToHex(...hslToRgbArray(h, Math.min(s + 20, 100), Math.min(l + 30, 95)))),
        createColor(rgbToHex(...hslToRgbArray(h, Math.min(s + 10, 100), Math.min(l + 15, 90)))),
        baseColor,
        createColor(rgbToHex(...hslToRgbArray(h, Math.max(s - 10, 0), Math.max(l - 15, 10)))),
        createColor(rgbToHex(...hslToRgbArray(h, Math.max(s - 20, 0), Math.max(l - 30, 5)))),
      ];
      break;
    case 'analogous':
      name = 'Analogous';
      description = 'Colors adjacent to each other on the color wheel (30° apart)';
      colors = [
        createColor(rgbToHex(...hslToRgbArray((h + 330) % 360, s, l))),
        createColor(rgbToHex(...hslToRgbArray((h + 345) % 360, s, l))),
        baseColor,
        createColor(rgbToHex(...hslToRgbArray((h + 30) % 360, s, l))),
        createColor(rgbToHex(...hslToRgbArray((h + 60) % 360, s, l))),
      ];
      break;
    case 'complementary':
      name = 'Complementary';
      description = 'Colors opposite each other on the color wheel (180° apart)';
      colors = [
        baseColor,
        createColor(rgbToHex(...hslToRgbArray((h + 180) % 360, s, l))),
        createColor(rgbToHex(...hslToRgbArray(h, Math.max(s - 30, 0), Math.min(l + 20, 90)))),
        createColor(rgbToHex(...hslToRgbArray((h + 180) % 360, Math.max(s - 30, 0), Math.min(l + 20, 90)))),
        createColor(rgbToHex(...hslToRgbArray(h, Math.min(s + 20, 100), Math.max(l - 20, 10)))),
      ];
      break;
    case 'triadic':
      name = 'Triadic';
      description = 'Three colors evenly spaced on the color wheel (120° apart)';
      colors = [
        baseColor,
        createColor(rgbToHex(...hslToRgbArray((h + 120) % 360, s, l))),
        createColor(rgbToHex(...hslToRgbArray((h + 240) % 360, s, l))),
        createColor(rgbToHex(...hslToRgbArray(h, Math.max(s - 20, 0), Math.min(l + 25, 95)))),
        createColor(rgbToHex(...hslToRgbArray((h + 120) % 360, Math.max(s - 20, 0), Math.min(l + 25, 95)))),
      ];
      break;
    case 'tetradic':
      name = 'Tetradic (Rectangle)';
      description = 'Four colors forming a rectangle on the color wheel (90° apart)';
      colors = [
        baseColor,
        createColor(rgbToHex(...hslToRgbArray((h + 90) % 360, s, l))),
        createColor(rgbToHex(...hslToRgbArray((h + 180) % 360, s, l))),
        createColor(rgbToHex(...hslToRgbArray((h + 270) % 360, s, l))),
        createColor(rgbToHex(...hslToRgbArray(h, Math.max(s - 30, 0), Math.min(l + 20, 90)))),
      ];
      break;
    case 'split-complementary':
      name = 'Split Complementary';
      description = 'Base color plus two colors adjacent to its complement (150° and 210°)';
      colors = [
        baseColor,
        createColor(rgbToHex(...hslToRgbArray((h + 150) % 360, s, l))),
        createColor(rgbToHex(...hslToRgbArray((h + 210) % 360, s, l))),
        createColor(rgbToHex(...hslToRgbArray(h, Math.max(s - 20, 0), Math.min(l + 25, 95)))),
        createColor(rgbToHex(...hslToRgbArray((h + 180) % 360, Math.max(s - 20, 0), Math.min(l + 25, 95)))),
      ];
      break;
    case 'custom':
      name = 'Custom';
      description = 'Your custom color palette';
      break;
  }

  return { name, colors, description };
};

const formatColor = (color: Color, format: ColorFormat): string => {
  switch (format) {
    case 'hex': return color.hex;
    case 'rgb': return `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;
    case 'hsl': return `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`;
    case 'css': return `--color: ${color.hex}; /* rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}) */`;
    default: return color.hex;
  }
};

const generateCssVariables = (scheme: GeneratedScheme): string => {
  let css = ':root {\n';
  scheme.colors.forEach((color, index) => {
    const name = index === 0 ? 'primary' : index === 1 ? 'secondary' : index === 2 ? 'tertiary' : `color-${index + 1}`;
    css += `  --${name}: ${formatColor(color, 'hex')};\n`;
  });
  css += '}\n\n';
  css += '/* Usage example */\n';
  css += '.element { background-color: var(--primary); color: var(--secondary); }';
  return css;
};

const generateTailwindConfig = (scheme: GeneratedScheme): string => {
  let config = 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n';
  scheme.colors.forEach((color, index) => {
    const name = index === 0 ? 'primary' : index === 1 ? 'secondary' : index === 2 ? 'tertiary' : `color${index + 1}`;
    config += `        ${name}: '${color.hex}',\n`;
  });
  config += '      }\n    }\n  }\n}';
  return config;
};

const generateScssVariables = (scheme: GeneratedScheme): string => {
  let scss = '';
  scheme.colors.forEach((color, index) => {
    const name = index === 0 ? 'primary' : index === 1 ? 'secondary' : index === 2 ? 'tertiary' : `color-${index + 1}`;
    scss += `$${name}: ${color.hex};\n`;
  });
  scss += '\n// Usage\n.element { background-color: $primary; color: $secondary; }';
  return scss;
};

export default function ColorSchemeGenerator() {
  const [baseColor, setBaseColor] = useState<Color>(createColor('#3b82f6'));
  const [scheme, setScheme] = useState<ColorScheme>('complementary');
  const [customColors, setCustomColors] = useState<Color[]>([]);
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<ColorFormat>('hex');
  const [showExport, setShowExport] = useState(false);

  const generatedScheme = scheme === 'custom' 
    ? { name: 'Custom', colors: customColors.length > 0 ? customColors : [baseColor], description: 'Your custom color palette' }
    : generateScheme(baseColor, scheme);

  const handleBaseColorChange = (hex: string) => {
    const color = createColor(hex);
    setBaseColor(color);
    if (customColors.length > 0) {
      setCustomColors([color, ...customColors.slice(1)]);
    }
  };

  const addCustomColor = (hex: string) => {
    const color = createColor(hex);
    setCustomColors([...customColors, color]);
    setScheme('custom');
  };

  const removeCustomColor = (index: number) => {
    setCustomColors(customColors.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExportContent = (format: 'css' | 'tailwind' | 'scss' | 'json'): string => {
    switch (format) {
      case 'css': return generateCssVariables(generatedScheme);
      case 'tailwind': return generateTailwindConfig(generatedScheme);
      case 'scss': return generateScssVariables(generatedScheme);
      case 'json': return JSON.stringify({
        name: generatedScheme.name,
        colors: generatedScheme.colors.map(c => ({ hex: c.hex, rgb: c.rgb, hsl: c.hsl }))
      }, null, 2);
      default: return '';
    }
  };

  const exportAll = () => {
    const content = `/* ${generatedScheme.name} Color Scheme */
${generateCssVariables(generatedScheme)}

/* Tailwind Config */
${generateTailwindConfig(generatedScheme)}

/* SCSS Variables */
${generateScssVariables(generatedScheme)}

/* JSON */
${getExportContent('json')}`;
    copyToClipboard(content);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Color Scheme Generator</h2>
        <p className="tool-desc">Generate harmonious color palettes from a base color. Export as CSS variables, Tailwind config, SCSS, or JSON.</p>
      </div>

      <div className="tool-grid">
        <div className="controls-panel">
          <div className="control-group">
            <label>Base Color</label>
            <div className="color-picker-row">
              <input
                type="color"
                value={baseColor.hex}
                onChange={e => handleBaseColorChange(e.target.value)}
                className="color-input-large"
              />
              <input
                type="text"
                value={baseColor.hex}
                onChange={e => handleBaseColorChange(e.target.value)}
                className="color-text-input"
                placeholder="#3b82f6"
              />
            </div>
            <div className="color-values">
              <span>RGB: {baseColor.rgb.r}, {baseColor.rgb.g}, {baseColor.rgb.b}</span>
              <span>HSL: {baseColor.hsl.h}°, {baseColor.hsl.s}%, {baseColor.hsl.l}%</span>
            </div>
          </div>

          <div className="control-group">
            <label>Color Scheme</label>
            <div className="scheme-buttons">
              {([
                { value: 'monochromatic', label: 'Mono' },
                { value: 'analogous', label: 'Analogous' },
                { value: 'complementary', label: 'Complement' },
                { value: 'triadic', label: 'Triadic' },
                { value: 'tetradic', label: 'Tetradic' },
                { value: 'split-complementary', label: 'Split Comp' },
                { value: 'custom', label: 'Custom' },
              ] as const).map(s => (
                <button
                  key={s.value}
                  className={scheme === s.value ? 'active' : ''}
                  onClick={() => setScheme(s.value)}
                  title={s.value.charAt(0).toUpperCase() + s.value.slice(1)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="scheme-description">{generatedScheme.description}</p>
          </div>

          {scheme === 'custom' && (
            <div className="control-group">
              <label>Custom Colors</label>
              <div className="custom-colors-input">
                <input
                  type="color"
                  onChange={e => addCustomColor(e.target.value)}
                  className="color-input-small"
                />
                <input
                  type="text"
                  placeholder="Add hex color..."
                  onKeyDown={e => e.key === 'Enter' && e.currentTarget.value && (addCustomColor(e.currentTarget.value), e.currentTarget.value = '')}
                  className="color-text-input"
                />
              </div>
              <div className="custom-colors-list">
                {customColors.map((color, index) => (
                  <div key={index} className="custom-color-item">
                    <div 
                      className="custom-color-swatch" 
                      style={{ backgroundColor: color.hex }}
                    />
                    <input
                      type="text"
                      value={color.hex}
                      onChange={e => {
                        const newColors = [...customColors];
                        newColors[index] = createColor(e.target.value);
                        setCustomColors(newColors);
                      }}
                      className="color-text-input small"
                    />
                    <button className="remove-btn" onClick={() => removeCustomColor(index)}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="control-group">
            <label>Display Format</label>
            <div className="format-toggle">
              {(['hex', 'rgb', 'hsl', 'css'] as const).map(f => (
                <button
                  key={f}
                  className={exportFormat === f ? 'active' : ''}
                  onClick={() => setExportFormat(f)}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="action-buttons">
            <button className="export-btn" onClick={() => setShowExport(!showExport)}>
              {showExport ? 'Hide Export' : 'Export Options'}
            </button>
            <button className="copy-btn" onClick={() => {
              const colors = generatedScheme.colors.map(c => formatColor(c, exportFormat)).join(', ');
              copyToClipboard(colors);
            }}>
              {copied ? '✓ Copied!' : 'Copy Colors'}
            </button>
          </div>
        </div>

        <div className="preview-panel">
          <h3>Generated Palette</h3>
          <div className="palette-preview">
            {generatedScheme.colors.map((color, index) => (
              <div 
                key={index} 
                className="palette-color"
                style={{ backgroundColor: color.hex }}
              >
                <div className="color-info">
                  <div className="color-name">
                    {index === 0 ? 'Primary' : index === 1 ? 'Secondary' : index === 2 ? 'Tertiary' : `Color ${index + 1}`}
                  </div>
                  <div className="color-value">
                    {formatColor(color, exportFormat)}
                  </div>
                  <button 
                    className="copy-color-btn"
                    onClick={() => copyToClipboard(formatColor(color, exportFormat))}
                    title="Copy"
                  >
                    📋
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="palette-preview-full">
            <h4>Full Width Preview</h4>
            <div className="full-width-colors">
              {generatedScheme.colors.map((color, index) => (
                <div 
                  key={index} 
                  className="full-color"
                  style={{ backgroundColor: color.hex }}
                >
                  <span className="color-label">
                    {formatColor(color, exportFormat)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="usage-examples">
            <h4>Usage Examples</h4>
            <div className="example-cards">
              <div className="example-card">
                <div className="example-header">Button Styles</div>
                <div className="example-buttons">
                  <button className="example-btn primary" style={{ backgroundColor: generatedScheme.colors[0]?.hex }}>Primary</button>
                  <button className="example-btn secondary" style={{ backgroundColor: generatedScheme.colors[1]?.hex }}>Secondary</button>
                  <button className="example-btn tertiary" style={{ backgroundColor: generatedScheme.colors[2]?.hex }}>Tertiary</button>
                </div>
              </div>
              <div className="example-card">
                <div className="example-header">Card with Accent</div>
                <div className="example-card-content" style={{ borderColor: generatedScheme.colors[0]?.hex }}>
                  <div className="card-accent" style={{ backgroundColor: generatedScheme.colors[1]?.hex }}></div>
                  <p style={{ color: generatedScheme.colors[0]?.hex }}>Card title with accent color</p>
                  <p style={{ color: generatedScheme.colors[2]?.hex }}>Supporting text in tertiary color</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showExport && (
        <div className="export-panel">
          <h3>Export Options</h3>
          <div className="export-tabs">
            <button 
              className={exportFormat === 'hex' ? 'active' : ''} 
              onClick={() => setExportFormat('hex')}
            >CSS Variables</button>
            <button 
              className={exportFormat === 'rgb' ? 'active' : ''} 
              onClick={() => setExportFormat('rgb')}
            >Tailwind Config</button>
            <button 
              className={exportFormat === 'hsl' ? 'active' : ''} 
              onClick={() => setExportFormat('hsl')}
            >SCSS Variables</button>
            <button 
              className={exportFormat === 'css' ? 'active' : ''} 
              onClick={() => setExportFormat('css')}
            >JSON</button>
            <button className="export-all-btn" onClick={exportAll}>Export All</button>
          </div>
          <pre className="export-content"><code>
{(() => {
  switch (exportFormat) {
    case 'hex': return generateCssVariables(generatedScheme);
    case 'rgb': return generateTailwindConfig(generatedScheme);
    case 'hsl': return generateScssVariables(generatedScheme);
    case 'css': return getExportContent('json');
    default: return '';
  }
})()}
          </code></pre>
          <button className="copy-export-btn" onClick={() => {
            let content = '';
            switch (exportFormat) {
              case 'hex': content = generateCssVariables(generatedScheme); break;
              case 'rgb': content = generateTailwindConfig(generatedScheme); break;
              case 'hsl': content = generateScssVariables(generatedScheme); break;
              case 'css': content = getExportContent('json'); break;
            }
            copyToClipboard(content);
          }}>
            Copy {exportFormat.toUpperCase()}
          </button>
        </div>
      )}
    </div>
  );
}