import { useState, useMemo } from 'react';

interface ContrastResult {
  ratio: number;
  aaNormal: boolean;
  aaLarge: boolean;
  aaaNormal: boolean;
  aaaLarge: boolean;
}

export default function ColorContrast() {
  const [fgColor, setFgColor] = useState('#1a1a1a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgInput, setFgInput] = useState('#1a1a1a');
  const [bgInput, setBgInput] = useState('#ffffff');
  const [swapped, setSwapped] = useState(false);

  const parseColor = (color: string): { r: number; g: number; b: number } | null => {
    // Hex formats
    let hex = color.trim();
    if (hex.startsWith('#')) hex = hex.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return { r, g, b };
    }
    if (hex.length === 8) {
      // Include alpha - blend with white
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = parseInt(hex.slice(6, 8), 16) / 255;
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return {
          r: Math.round(r * a + 255 * (1 - a)),
          g: Math.round(g * a + 255 * (1 - a)),
          b: Math.round(b * a + 255 * (1 - a)),
        };
      }
    }

    // rgb() / rgba()
    const rgbMatch = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+)?\s*\)/i);
    if (rgbMatch) {
      return { r: parseInt(rgbMatch[1], 10), g: parseInt(rgbMatch[2], 10), b: parseInt(rgbMatch[3], 10) };
    }

    // hsl() / hsla()
    const hslMatch = color.match(/hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*[\d.]+)?\s*\)/i);
    if (hslMatch) {
      const h = parseInt(hslMatch[1], 10) / 360;
      const s = parseInt(hslMatch[2], 10) / 100;
      const l = parseInt(hslMatch[3], 10) / 100;
      const hslToRgb = (h: number, s: number, l: number) => {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        if (s === 0) return { r: l, g: l, b: l };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        return {
          r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
          g: Math.round(hue2rgb(p, q, h) * 255),
          b: Math.round(hue2rgb(p, q, h - 1/3) * 255),
        };
      };
      return hslToRgb(h, s, l);
    }

    // Named colors (basic set)
    const namedColors: Record<string, { r: number; g: number; b: number }> = {
      transparent: { r: 255, g: 255, b: 255 },
      black: { r: 0, g: 0, b: 0 },
      white: { r: 255, g: 255, b: 255 },
      red: { r: 255, g: 0, b: 0 },
      green: { r: 0, g: 128, b: 0 },
      blue: { r: 0, g: 0, b: 255 },
      yellow: { r: 255, g: 255, b: 0 },
      cyan: { r: 0, g: 255, b: 255 },
      magenta: { r: 255, g: 0, b: 255 },
      silver: { r: 192, g: 192, b: 192 },
      gray: { r: 128, g: 128, b: 128 },
      grey: { r: 128, g: 128, b: 128 },
      maroon: { r: 128, g: 0, b: 0 },
      olive: { r: 128, g: 128, b: 0 },
      lime: { r: 0, g: 255, b: 0 },
      aqua: { r: 0, g: 255, b: 255 },
      teal: { r: 0, g: 128, b: 128 },
      navy: { r: 0, g: 0, b: 128 },
      fuchsia: { r: 255, g: 0, b: 255 },
      purple: { r: 128, g: 0, b: 128 },
    };
    const lower = color.toLowerCase();
    if (namedColors[lower]) return namedColors[lower];

    return null;
  };

  const getLuminance = (r: number, g: number, b: number): number => {
    const srgb = [r, g, b].map(v => {
      const val = v / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  };

  const calculateContrast = (fg: { r: number; g: number; b: number }, bg: { r: number; g: number; b: number }): ContrastResult => {
    const l1 = getLuminance(fg.r, fg.g, fg.b);
    const l2 = getLuminance(bg.r, bg.g, bg.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
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

  const parsedFg = useMemo(() => parseColor(fgInput), [fgInput]);
  const parsedBg = useMemo(() => parseColor(bgInput), [bgInput]);

  // Sync color pickers with text inputs
  useMemo(() => {
    if (parsedFg) setFgColor(rgbToHex(parsedFg.r, parsedFg.g, parsedFg.b));
  }, [parsedFg]);

  useMemo(() => {
    if (parsedBg) setBgColor(rgbToHex(parsedBg.r, parsedBg.g, parsedBg.b));
  }, [parsedBg]);

  const result = useMemo(() => {
    if (!parsedFg || !parsedBg) return null;
    return calculateContrast(parsedFg, parsedBg);
  }, [parsedFg, parsedBg]);

  const handleFgInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFgInput(e.target.value);
  };

  const handleBgInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBgInput(e.target.value);
  };

  const handleFgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFgColor(e.target.value);
    setFgInput(e.target.value);
  };

  const handleBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBgColor(e.target.value);
    setBgInput(e.target.value);
  };

  const swapColors = () => {
    setFgInput(bgInput);
    setBgInput(fgInput);
    setFgColor(bgColor);
    setBgColor(fgColor);
    setSwapped(!swapped);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const loadPreset = (fg: string, bg: string) => {
    setFgInput(fg);
    setBgInput(bg);
  };

  const fgHsl = parsedFg ? rgbToHsl(parsedFg.r, parsedFg.g, parsedFg.b) : null;
  const bgHsl = parsedBg ? rgbToHsl(parsedBg.r, parsedBg.g, parsedBg.b) : null;

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Color Contrast Checker</h2>
        <p className="tool-desc">Check WCAG contrast ratios between foreground and background colors. Test AA and AAA compliance for normal and large text.</p>
      </div>

      <div className="contrast-layout">
        <div className="editor-panel">
          <div className="editor-toolbar">
            <h3>Colors</h3>
            <div className="toolbar-actions">
              <button onClick={swapColors} className="btn-secondary" title="Swap foreground and background">
                {'\u21c5'} Swap
              </button>
            </div>
          </div>

          <div className="color-picker-row">
            <div className="color-picker-group">
              <label>Foreground (Text)</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={fgColor}
                  onChange={handleFgColorChange}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={fgInput}
                  onChange={handleFgInputChange}
                  className="color-text-input"
                  placeholder="#1a1a1a"
                  spellCheck={false}
                />
              </div>
              {parsedFg && (
                <div className="color-formats">
                  <code>RGB: {parsedFg.r}, {parsedFg.g}, {parsedFg.b}</code>
                  <code>HSL: {fgHsl?.h}\u00b0, {fgHsl?.s}%, {fgHsl?.l}%</code>
                </div>
              )}
            </div>

            <div className="color-picker-group">
              <label>Background</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={bgColor}
                  onChange={handleBgColorChange}
                  className="color-picker"
                />
                <input
                  type="text"
                  value={bgInput}
                  onChange={handleBgInputChange}
                  className="color-text-input"
                  placeholder="#ffffff"
                  spellCheck={false}
                />
              </div>
              {parsedBg && (
                <div className="color-formats">
                  <code>RGB: {parsedBg.r}, {parsedBg.g}, {parsedBg.b}</code>
                  <code>HSL: {bgHsl?.h}\u00b0, {bgHsl?.s}%, {bgHsl?.l}%</code>
                </div>
              )}
            </div>
          </div>

          <div className="presets-section">
            <h4>Preset Combinations</h4>
            <div className="presets-grid">
              {[
                { name: 'Default', fg: '#1a1a1a', bg: '#ffffff' },
                { name: 'Dark Mode', fg: '#e4e4e7', bg: '#18181b' },
                { name: 'High Contrast', fg: '#000000', bg: '#ffffff' },
                { name: 'Blue on White', fg: '#1d4ed8', bg: '#ffffff' },
                { name: 'White on Blue', fg: '#ffffff', bg: '#1d4ed8' },
                { name: 'Green on White', fg: '#166534', bg: '#ffffff' },
                { name: 'Red on White', fg: '#991b1b', bg: '#ffffff' },
                { name: 'Gray on White', fg: '#525252', bg: '#ffffff' },
                { name: 'Yellow on Black', fg: '#facc15', bg: '#000000' },
                { name: 'Subtle Gray', fg: '#737373', bg: '#ffffff' },
              ].map(preset => (
                <button
                  key={preset.name}
                  onClick={() => loadPreset(preset.fg, preset.bg)}
                  className={`preset-btn ${fgInput === preset.fg && bgInput === preset.bg ? 'active' : ''}`}
                  style={{ background: `linear-gradient(90deg, ${preset.bg} 50%, ${preset.fg} 50%)` }}
                  title={preset.name}
                >
                  <span style={{ color: preset.fg }}>Aa</span>
                </button>
              ))}
            </div>
          </div>

          <div className="examples-section">
            <h4>Common Text Colors</h4>
            <div className="color-suggestions">
              {['#000000', '#1a1a1a', '#333333', '#525252', '#737373', '#a3a3a3', '#d4d4d4', '#ffffff', '#1d4ed8', '#dc2626', '#16a34a', '#ca8a04', '#9333ea', '#ec4899'].map(color => (
                <button
                  key={color}
                  onClick={() => setFgInput(color)}
                  className={`color-suggestion ${fgInput.toLowerCase() === color.toLowerCase() ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          <div className="examples-section">
            <h4>Common Background Colors</h4>
            <div className="color-suggestions">
              {['#ffffff', '#fafafa', '#f5f5f5', '#e5e5e5', '#d4d4d4', '#a3a3a3', '#737373', '#525252', '#18181b', '#27272a', '#3f3f46', '#1e293b', '#1e3a8a', '#1c1917'].map(color => (
                <button
                  key={color}
                  onClick={() => setBgInput(color)}
                  className={`color-suggestion ${bgInput.toLowerCase() === color.toLowerCase() ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="preview-panel">
          <div className="preview-toolbar">
            <h3>Contrast Analysis</h3>
          </div>

          {result ? (
            <>
              <div className="contrast-ratio-display">
                <div className="ratio-circle" style={{ 
                  background: result.ratio >= 7 ? 'linear-gradient(135deg, #22c55e, #16a34a)' :
                            result.ratio >= 4.5 ? 'linear-gradient(135deg, #84cc16, #65a30d)' :
                            result.ratio >= 3 ? 'linear-gradient(135deg, #eab308, #ca8a04)' :
                            'linear-gradient(135deg, #ef4444, #dc2626)' 
                }}>
                  <span className="ratio-value">{result.ratio}:1</span>
                </div>
                <p className="ratio-label">Contrast Ratio</p>
              </div>

              <div className="wcag-results">
                <h4>WCAG 2.1 Compliance</h4>
                <div className="wcag-grid">
                  <div className={`wcag-card ${result.aaaNormal ? 'pass' : 'fail'}`}>
                    <div className="wcag-badge">{result.aaaNormal ? '\u2713 PASS' : '\u2717 FAIL'}</div>
                    <div className="wcag-title">AAA Normal Text</div>
                    <div className="wcag-desc">\u2265 7:1 ratio</div>
                    <div className="wcag-detail">Text \u003c 18pt (24px) or \u003c 14pt (18.5px) bold</div>
                  </div>
                  <div className={`wcag-card ${result.aaaLarge ? 'pass' : 'fail'}`}>
                    <div className="wcag-badge">{result.aaaLarge ? '\u2713 PASS' : '\u2717 FAIL'}</div>
                    <div className="wcag-title">AAA Large Text</div>
                    <div className="wcag-desc">\u2265 4.5:1 ratio</div>
                    <div className="wcag-detail">Text \u2265 18pt (24px) or \u2265 14pt (18.5px) bold</div>
                  </div>
                  <div className={`wcag-card ${result.aaNormal ? 'pass' : 'fail'}`}>
                    <div className="wcag-badge">{result.aaNormal ? '\u2713 PASS' : '\u2717 FAIL'}</div>
                    <div className="wcag-title">AA Normal Text</div>
                    <div className="wcag-desc">\u2265 4.5:1 ratio</div>
                    <div className="wcag-detail">Text \u003c 18pt (24px) or \u003c 14pt (18.5px) bold</div>
                  </div>
                  <div className={`wcag-card ${result.aaLarge ? 'pass' : 'fail'}`}>
                    <div className="wcag-badge">{result.aaLarge ? '\u2713 PASS' : '\u2717 FAIL'}</div>
                    <div className="wcag-title">AA Large Text</div>
                    <div className="wcag-desc">\u2265 3:1 ratio</div>
                    <div className="wcag-detail">Text \u2265 18pt (24px) or \u2265 14pt (18.5px) bold</div>
                  </div>
                  <div className={`wcag-card ${result.ratio >= 3 ? 'pass' : 'fail'}`}>
                    <div className="wcag-badge">{result.ratio >= 3 ? '\u2713 PASS' : '\u2717 FAIL'}</div>
                    <div className="wcag-title">UI Components (AA)</div>
                    <div className="wcag-desc">\u2265 3:1 ratio</div>
                    <div className="wcag-detail">Borders, icons, form controls, focus indicators</div>
                  </div>
                </div>
              </div>

              <div className="text-preview">
                <h4>Text Preview</h4>
                <div 
                  className="preview-text"
                  style={{ 
                    color: parsedFg ? rgbToHex(parsedFg.r, parsedFg.g, parsedFg.b) : fgInput,
                    backgroundColor: parsedBg ? rgbToHex(parsedBg.r, parsedBg.g, parsedBg.b) : bgInput,
                  }}
                >
                  <p className="preview-large">Large Text (\u226518pt / \u226514pt bold)</p>
                  <p className="preview-normal">Normal text at 16px \u2014 The quick brown fox jumps over the lazy dog.</p>
                  <p className="preview-small">Small text at 12px \u2014 The quick brown fox jumps over the lazy dog.</p>
                  <div className="preview-ui">
                    <button className="preview-button">Button</button>
                    <input type="text" className="preview-input" placeholder="Form input" defaultValue="Sample input" readOnly />
                    <div className="preview-border"></div>
                  </div>
                </div>
              </div>

              <div className="details-section">
                <h4>Details</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Foreground Luminance</span>
                    <span className="detail-value">{parsedFg ? getLuminance(parsedFg.r, parsedFg.g, parsedFg.b).toFixed(4) : 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Background Luminance</span>
                    <span className="detail-value">{parsedBg ? getLuminance(parsedBg.r, parsedBg.g, parsedBg.b).toFixed(4) : 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contrast Ratio</span>
                    <span className="detail-value">{result.ratio}:1</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">WCAG Level</span>
                    <span className="detail-value">
                      {result.aaaNormal ? 'AAA' : result.aaNormal ? 'AA' : result.aaLarge ? 'AA (Large only)' : 'Fail'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="export-section">
                <h4>Export</h4>
                <div className="export-buttons">
                  <button onClick={() => copyToClipboard(
                    `Color Contrast Report
Foreground: ${fgInput} (RGB: ${parsedFg?.r}, ${parsedFg?.g}, ${parsedFg?.b})
Background: ${bgInput} (RGB: ${parsedBg?.r}, ${parsedBg?.g}, ${parsedBg?.b})
Contrast Ratio: ${result.ratio}:1

WCAG 2.1 Results:
AAA Normal Text (\u22657:1): ${result.aaaNormal ? 'PASS' : 'FAIL'}
AAA Large Text (\u22654.5:1): ${result.aaaLarge ? 'PASS' : 'FAIL'}
AA Normal Text (\u22654.5:1): ${result.aaNormal ? 'PASS' : 'FAIL'}
AA Large Text (\u22653:1): ${result.aaLarge ? 'PASS' : 'FAIL'}
UI Components AA (\u22653:1): ${result.ratio >= 3 ? 'PASS' : 'FAIL'}
`)} className="btn-secondary">
                    Copy Report
                  </button>
                  <button onClick={() => copyToClipboard(
                    `--fg: ${fgInput};
--bg: ${bgInput};
--contrast-ratio: ${result.ratio};
`)} className="btn-secondary">
                    Copy CSS Variables
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Enter valid foreground and background colors to see contrast analysis</p>
            </div>
          )}

          <div className="info-section">
            <details>
              <summary>WCAG Contrast Guidelines</summary>
              <div className="help-content">
                <h4>WCAG 2.1 Contrast Requirements</h4>
                <table className="wcag-table">
                  <thead>
                    <tr><th>Level</th><th>Text Type</th><th>Minimum Ratio</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>AAA</td><td>Normal text</td><td>7:1</td></tr>
                    <tr><td>AAA</td><td>Large text (\u226518pt or \u226514pt bold)</td><td>4.5:1</td></tr>
                    <tr><td>AA</td><td>Normal text</td><td>4.5:1</td></tr>
                    <tr><td>AA</td><td>Large text (\u226518pt or \u226514pt bold)</td><td>3:1</td></tr>
                    <tr><td>AA</td><td>UI components, graphics</td><td>3:1</td></tr>
                  </tbody>
                </table>
                
                <h4>What counts as "Large Text"?</h4>
                <ul>
                  <li>\u2265 18pt (24px) regular weight</li>
                  <li>\u2265 14pt (18.5px) bold/semibold weight</li>
                </ul>

                <h4>Color Formats Supported</h4>
                <ul>
                  <li>Hex: <code>#rgb</code>, <code>#rrggbb</code>, <code>#rrggbbaa</code></li>
                  <li>RGB: <code>rgb(255, 0, 0)</code></li>
                  <li>HSL: <code>hsl(0, 100%, 50%)</code></li>
                  <li>Named colors: <code>red</code>, <code>blue</code>, <code>transparent</code>, etc.</li>
                </ul>

                <h4>How Contrast is Calculated</h4>
                <p>Using the WCAG 2.1 formula: <code>(L1 + 0.05) / (L2 + 0.05)</code> where L1 and L2 are the relative luminance of the lighter and darker colors. Luminance uses sRGB with gamma correction.</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}