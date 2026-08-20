import { useState, useMemo } from 'react';

export default function ColorBlender() {
  const [color1, setColor1] = useState('#3b82f6');
  const [color2, setColor2] = useState('#ef4444');
  const [mode, setMode] = useState<'mix' | 'gradient' | 'steps'>('mix');
  const [steps, setSteps] = useState(5);
  const [colorSpace, setColorSpace] = useState<'srgb' | 'oklab' | 'hsl'>('oklab');
  const [copied, setCopied] = useState<string | null>(null);

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : null;
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (c: number) => Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
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
    return { h: h * 360, s: s * 100, l: l * 100 };
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
    return { r, g, b };
  };

  // OKLab conversion (perceptually uniform)
  const rgbToOklab = (r: number, g: number, b: number) => {
    // sRGB to linear
    const lin = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const rl = lin(r), gl = lin(g), bl = lin(b);
    
    // Linear sRGB to OKLab
    const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
    const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
    const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;
    
    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);
    
    return {
      L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
      a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
      b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    };
  };

  const oklabToRgb = (L: number, a: number, b: number) => {
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
    
    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;
    
    const rl = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const gl = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    
    // Linear to sRGB
    const gam = (c: number) => c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1/2.4) - 0.055;
    return {
      r: gam(rl),
      g: gam(gl),
      b: gam(bl)
    };
  };

  const mixColors = (c1: string, c2: string, t: number): string => {
    const rgb1 = hexToRgb(c1);
    const rgb2 = hexToRgb(c2);
    if (!rgb1 || !rgb2) return c1;

    switch (colorSpace) {
      case 'srgb': {
        const r = rgb1.r + (rgb2.r - rgb1.r) * t;
        const g = rgb1.g + (rgb2.g - rgb1.g) * t;
        const b = rgb1.b + (rgb2.b - rgb1.b) * t;
        return rgbToHex(r, g, b);
      }
      case 'hsl': {
        const hsl1 = rgbToHsl(rgb1.r, rgb1.g, rgb1.b);
        const hsl2 = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);
        
        // Shortest path for hue
        let dh = hsl2.h - hsl1.h;
        if (dh > 180) dh -= 360;
        if (dh < -180) dh += 360;
        
        const h = (hsl1.h + dh * t + 360) % 360;
        const s = hsl1.s + (hsl2.s - hsl1.s) * t;
        const l = hsl1.l + (hsl2.l - hsl1.l) * t;
        
        const rgb = hslToRgb(h, s, l);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
      }
      case 'oklab': {
        const lab1 = rgbToOklab(rgb1.r, rgb1.g, rgb1.b);
        const lab2 = rgbToOklab(rgb2.r, rgb2.g, rgb2.b);
        
        const L = lab1.L + (lab2.L - lab1.L) * t;
        const a = lab1.a + (lab2.a - lab1.a) * t;
        const b = lab1.b + (lab2.b - lab1.b) * t;
        
        const rgb = oklabToRgb(L, a, b);
        return rgbToHex(rgb.r, rgb.g, rgb.b);
      }
    }
  };

  const mixedColor = useMemo(() => mixColors(color1, color2, 0.5), [color1, color2, colorSpace]);

  const gradientColors = useMemo(() => {
    const colors: string[] = [];
    for (let i = 0; i < steps; i++) {
      colors.push(mixColors(color1, color2, i / (steps - 1)));
    }
    return colors;
  }, [color1, color2, steps, colorSpace]);

  const stepColors = useMemo(() => {
    return gradientColors.map((c, i) => ({
      color: c,
      position: `${Math.round(i / (steps - 1) * 100)}%`,
      css: `color-stop(${Math.round(i / (steps - 1) * 100)}%, ${c})`
    }));
  }, [gradientColors, steps]);

  const copyColor = (c: string) => {
    navigator.clipboard.writeText(c);
    setCopied(c);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyGradientCss = () => {
    const css = `linear-gradient(90deg, ${gradientColors.join(', ')})`;
    navigator.clipboard.writeText(css);
    setCopied(css);
    setTimeout(() => setCopied(null), 2000);
  };

  const copyTailwindGradient = () => {
    const tw = gradientColors.map((c, i) => `${c} ${Math.round(i / (steps - 1) * 100)}%`).join(', ');
    const css = `bg-gradient-to-r [${tw}]`;
    navigator.clipboard.writeText(css);
    setCopied(css);
    setTimeout(() => setCopied(null), 2000);
  };

  const swapColors = () => {
    setColor1(color2);
    setColor2(color1);
  };

  const randomColor = () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Color Blender</h2>
        <p className="tool-desc">Mix two colors, generate gradients, and create color scales with perceptual color spaces</p>
      </div>

      <div className="tool-grid">
        <div className="panel color-inputs">
          <h3>Input Colors</h3>
          
          <div className="color-pair">
            <div className="color-input-group">
              <div className="color-swatch-large" style={{ backgroundColor: color1 }}></div>
              <input
                type="color"
                value={color1}
                onChange={e => setColor1(e.target.value)}
                className="color-picker-hidden"
              />
              <input
                type="text"
                value={color1}
                onChange={e => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && setColor1(e.target.value)}
                className="color-hex-input"
                placeholder="#RRGGBB"
              />
              <div className="color-actions">
                <button onClick={() => setColor1(randomColor())} className="btn-icon" title="Random">🎲</button>
              </div>
            </div>

            <button onClick={swapColors} className="swap-btn" title="Swap colors">⇄</button>

            <div className="color-input-group">
              <div className="color-swatch-large" style={{ backgroundColor: color2 }}></div>
              <input
                type="color"
                value={color2}
                onChange={e => setColor2(e.target.value)}
                className="color-picker-hidden"
              />
              <input
                type="text"
                value={color2}
                onChange={e => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && setColor2(e.target.value)}
                className="color-hex-input"
                placeholder="#RRGGBB"
              />
              <div className="color-actions">
                <button onClick={() => setColor2(randomColor())} className="btn-icon" title="Random">🎲</button>
              </div>
            </div>
          </div>

          <div className="mixed-preview">
            <h4>50/50 Mix</h4>
            <div 
              className="mixed-swatch" 
              style={{ backgroundColor: mixedColor }}
              onClick={() => copyColor(mixedColor)}
            ></div>
            <code className="mixed-hex" onClick={() => copyColor(mixedColor)}>{mixedColor}</code>
            {copied === mixedColor && <span className="copied-toast">Copied!</span>}
          </div>
        </div>

        <div className="panel controls">
          <h3>Blend Settings</h3>
          
          <div className="control-group">
            <label>Mode</label>
            <div className="mode-tabs">
              {(['mix', 'gradient', 'steps'] as const).map(m => (
                <button
                  key={m}
                  className={mode === m ? 'active' : ''}
                  onClick={() => setMode(m)}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>Color Space</label>
            <div className="mode-tabs">
              {(['srgb', 'oklab', 'hsl'] as const).map(cs => (
                <button
                  key={cs}
                  className={colorSpace === cs ? 'active' : ''}
                  onClick={() => setColorSpace(cs)}
                >
                  {cs.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="space-hint">
              {colorSpace === 'oklab' && 'Perceptually uniform — best for gradients'}
              {colorSpace === 'srgb' && 'Standard RGB — direct channel interpolation'}
              {colorSpace === 'hsl' && 'Hue-Saturation-Lightness — good for hue shifts'}
            </p>
          </div>

          {mode !== 'mix' && (
            <div className="control-group">
              <label>Steps: {steps}</label>
              <input
                type="range"
                min={2}
                max={20}
                value={steps}
                onChange={e => setSteps(parseInt(e.target.value))}
                className="steps-slider"
              />
            </div>
          )}
        </div>
      </div>

      {mode === 'gradient' && (
        <div className="panel gradient-output">
          <div className="output-header">
            <h3>Gradient Output ({steps} steps)</h3>
            <div className="copy-actions">
              <button onClick={copyGradientCss} className="btn-secondary" disabled={copied === gradientColors.join(', ')}>
                Copy CSS linear-gradient
              </button>
              <button onClick={copyTailwindGradient} className="btn-secondary" disabled={copied?.startsWith('bg-gradient')}>
                Copy Tailwind
              </button>
            </div>
          </div>
          
          <div className="gradient-bar" style={{
            background: `linear-gradient(90deg, ${gradientColors.join(', ')})`
          }}></div>
          
          <div className="gradient-stops">
            {gradientColors.map((c, i) => (
              <div
                key={i}
                className="gradient-stop"
                style={{ backgroundColor: c, left: `${i / (steps - 1) * 100}%` }}
                onClick={() => copyColor(c)}
                title={`${c} — Click to copy`}
              >
                {copied === c && <span className="copied-badge">✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === 'steps' && (
        <div className="panel steps-output">
          <div className="output-header">
            <h3>Color Scale ({steps} steps)</h3>
          </div>
          
          <div className="steps-grid">
            {stepColors.map((item, i) => (
              <div
                key={i}
                className="step-card"
                onClick={() => copyColor(item.color)}
              >
                <div className="step-swatch" style={{ backgroundColor: item.color }}></div>
                <div className="step-info">
                  <code className="step-hex">{item.color}</code>
                  <span className="step-position">{item.position}</span>
                </div>
                {copied === item.color && <span className="copied-badge">Copied!</span>}
              </div>
            ))}
          </div>

          <div className="export-options">
            <h4>Export Formats</h4>
            <div className="export-tabs">
              <button className="btn-secondary" onClick={() => copyColor(JSON.stringify(gradientColors))}>
                JSON Array
              </button>
              <button className="btn-secondary" onClick={() => copyColor(gradientColors.join(', '))}>
                CSV
              </button>
              <button className="btn-secondary" onClick={() => copyColor(`const colors = [${gradientColors.map(c => `"${c}"`).join(', ')}];`)}>
                JS Const
              </button>
              <button className="btn-secondary" onClick={() => copyColor(gradientColors.map(c => `--color-${gradientColors.indexOf(c)}: ${c};`).join('\n'))}>
                CSS Variables
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'mix' && (
        <div className="panel mix-details">
          <h3>Mix Details</h3>
          <div className="mix-info">
            <div className="info-row">
              <span>Color Space:</span>
              <strong>{colorSpace.toUpperCase()}</strong>
            </div>
            <div className="info-row">
              <span>Formula:</span>
              <code>{colorSpace === 'oklab' ? 'OKLab perceptual interpolation' : colorSpace === 'hsl' ? 'HSL hue-shortest-path interpolation' : 'sRGB linear interpolation'}</code>
            </div>
            <div className="info-row">
              <span>Result:</span>
              <code>{mixedColor}</code>
            </div>
          </div>
          
          <div className="color-space-comparison">
            <h4>Compare Color Spaces (50% mix)</h4>
            <div className="comparison-grid">
              {(['srgb', 'oklab', 'hsl'] as const).map(cs => {
                const tempSpace = colorSpace;
                setColorSpace(cs);
                const c = mixColors(color1, color2, 0.5);
                setColorSpace(tempSpace);
                return (
                  <div key={cs} className="comparison-item">
                    <div className="comparison-swatch" style={{ backgroundColor: c }}></div>
                    <span className="comparison-label">{cs.toUpperCase()}</span>
                    <code className="comparison-hex">{c}</code>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}