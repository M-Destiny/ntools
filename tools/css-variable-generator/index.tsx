import { useState, useMemo } from 'react';

export default function CssVariableGenerator() {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [prefix, setPrefix] = useState('--color');
  const [format, setFormat] = useState<'css' | 'scss' | 'tailwind' | 'json'>('css');
  const [includeShades, setIncludeShades] = useState(true);
  const [includeOpacity, setIncludeOpacity] = useState(true);
  const [copied, setCopied] = useState(false);

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

  const hslToRgb = (h: number, s: number, l: number) => {
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

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  };

  const generateShades = useMemo(() => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return [];
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    const shades = [
      { name: '50', lightness: 95 },
      { name: '100', lightness: 90 },
      { name: '200', lightness: 80 },
      { name: '300', lightness: 70 },
      { name: '400', lightness: 60 },
      { name: '500', lightness: 50 },
      { name: '600', lightness: 40 },
      { name: '700', lightness: 30 },
      { name: '800', lightness: 20 },
      { name: '900', lightness: 10 },
      { name: '950', lightness: 5 },
    ];
    
    return shades.map(shade => {
      const newHsl = { ...hsl, l: shade.lightness };
      const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
      const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      return { ...shade, hex, rgb: newRgb };
    });
  }, [baseColor]);

  const generateOpacityVariants = useMemo(() => {
    if (!includeOpacity) return [];
    const rgb = hexToRgb(baseColor);
    if (!rgb) return [];
    
    return [
      { name: '10', alpha: 0.1 },
      { name: '20', alpha: 0.2 },
      { name: '30', alpha: 0.3 },
      { name: '40', alpha: 0.4 },
      { name: '50', alpha: 0.5 },
      { name: '60', alpha: 0.6 },
      { name: '70', alpha: 0.7 },
      { name: '80', alpha: 0.8 },
      { name: '90', alpha: 0.9 },
    ].map(op => ({
      ...op,
      value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${op.alpha})`,
      hex: baseColor
    }));
  }, [baseColor, includeOpacity]);

  const generateOutput = () => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return '';
    
    const lines: string[] = [];
    
    if (format === 'css') {
      lines.push(':root {');
      lines.push(`  ${prefix}-primary: ${baseColor};`);
      if (includeShades) {
        generateShades.forEach(shade => {
          lines.push(`  ${prefix}-primary-${shade.name}: ${shade.hex};`);
        });
      }
      if (includeOpacity) {
        generateOpacityVariants.forEach(op => {
          lines.push(`  ${prefix}-primary-${op.name}: ${op.value};`);
        });
      }
      lines.push('}');
    } else if (format === 'scss') {
      lines.push(`$${prefix.replace('--', '')}-primary: ${baseColor};`);
      if (includeShades) {
        generateShades.forEach(shade => {
          lines.push(`$${prefix.replace('--', '')}-primary-${shade.name}: ${shade.hex};`);
        });
      }
      if (includeOpacity) {
        generateOpacityVariants.forEach(op => {
          lines.push(`$${prefix.replace('--', '')}-primary-${op.name}: ${op.value};`);
        });
      }
    } else if (format === 'tailwind') {
      lines.push('module.exports = {');
      lines.push('  theme: {');
      lines.push('    extend: {');
      lines.push('      colors: {');
      lines.push(`        primary: {`);
      lines.push(`          DEFAULT: '${baseColor}',`);
      if (includeShades) {
        generateShades.forEach(shade => {
          lines.push(`          ${shade.name}: '${shade.hex}',`);
        });
      }
      lines.push(`        },`);
      lines.push('      },');
      lines.push('    },');
      lines.push('  },');
      lines.push('}');
    } else if (format === 'json') {
      const obj: Record<string, string> = {
        [`${prefix}-primary`]: baseColor
      };
      if (includeShades) {
        generateShades.forEach(shade => {
          obj[`${prefix}-primary-${shade.name}`] = shade.hex;
        });
      }
      if (includeOpacity) {
        generateOpacityVariants.forEach(op => {
          obj[`${prefix}-primary-${op.name}`] = op.value;
        });
      }
      lines.push(JSON.stringify(obj, null, 2));
    }
    
    return lines.join('\n');
  };

  const output = generateOutput();

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBaseColor(e.target.value);
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
      setBaseColor(e.target.value);
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>CSS Variable Generator</h2>
        <p className="tool-desc">Generate CSS custom properties (variables) with shades and opacity variants from a single base color. Export as CSS, SCSS, Tailwind config, or JSON.</p>
      </div>

      <div className="tool-grid">
        <div className="picker-panel">
          <div className="color-preview-large" style={{ backgroundColor: baseColor }}></div>
          
          <div className="color-values">
            <div className="value-row">
              <label>Base Color</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={baseColor}
                  onChange={handleColorChange}
                  className="color-picker-input"
                />
                <input
                  type="text"
                  value={baseColor}
                  onChange={handleColorInputChange}
                  className="color-input"
                  placeholder="#3b82f6"
                />
              </div>
            </div>
          </div>

          <div className="options-panel">
            <div className="option-group">
              <label>Variable Prefix</label>
              <input
                type="text"
                value={prefix}
                onChange={e => setPrefix(e.target.value)}
                className="text-input"
                placeholder="--color"
              />
            </div>

            <div className="option-group">
              <label>Output Format</label>
              <div className="format-toggle">
                {(['css', 'scss', 'tailwind', 'json'] as const).map(f => (
                  <button
                    key={f}
                    className={format === f ? 'active' : ''}
                    onClick={() => setFormat(f)}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={includeShades}
                  onChange={e => setIncludeShades(e.target.checked)}
                />
                Include 50-950 shades
              </label>
            </div>

            <div className="option-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={includeOpacity}
                  onChange={e => setIncludeOpacity(e.target.checked)}
                />
                Include opacity variants (10-90%)
              </label>
            </div>

            <button className="copy-btn" onClick={copyOutput} disabled={!output}>
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>

        <div className="preview-panel">
          <h3>Generated Variables</h3>
          <div className="output-format-badge">{format.toUpperCase()}</div>
          <pre className="code-output"><code>{output}</code></pre>
          
          {includeShades && (
            <div className="shades-preview">
              <h4>Color Scale Preview</h4>
              <div className="shades-grid">
                {generateShades.map(shade => (
                  <div key={shade.name} className="shade-swatch" style={{ backgroundColor: shade.hex }}>
                    <span className="shade-label">{shade.name}</span>
                    <span className="shade-value">{shade.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
