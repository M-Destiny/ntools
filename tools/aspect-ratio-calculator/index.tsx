import { useState, useEffect } from 'react';

export default function AspectRatioCalculator() {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [targetWidth, setTargetWidth] = useState('');
  const [targetHeight, setTargetHeight] = useState('');
  const [ratio, setRatio] = useState('16:9');
  const [lockRatio, setLockRatio] = useState(true);
  const [preset, setPreset] = useState<Preset | null>(null);

  const presets: Preset[] = [
    { name: '16:9 (HD)', width: 16, height: 9 },
    { name: '4:3 (Standard)', width: 4, height: 3 },
    { name: '3:2 (Photo)', width: 3, height: 2 },
    { name: '1:1 (Square)', width: 1, height: 1 },
    { name: '21:9 (Ultrawide)', width: 21, height: 9 },
    { name: '16:10 (Widescreen)', width: 16, height: 10 },
    { name: '5:4', width: 5, height: 4 },
    { name: '3:1', width: 3, height: 1 },
    { name: '2:1', width: 2, height: 1 },
    { name: '4:5 (Portrait)', width: 4, height: 5 },
    { name: '9:16 (Mobile)', width: 9, height: 16 },
    { name: '2:3 (Portrait Photo)', width: 2, height: 3 },
  ];

  const resolutions: Resolution[] = [
    { name: '4K UHD', width: 3840, height: 2160 },
    { name: 'QHD / 1440p', width: 2560, height: 1440 },
    { name: 'Full HD / 1080p', width: 1920, height: 1080 },
    { name: 'HD / 720p', width: 1280, height: 720 },
    { name: 'WXGA', width: 1366, height: 768 },
    { name: 'SVGA', width: 800, height: 600 },
    { name: 'XGA', width: 1024, height: 768 },
    { name: 'SXGA', width: 1280, height: 1024 },
    { name: 'UXGA', width: 1600, height: 1200 },
    { name: 'WQHD', width: 2560, height: 1440 },
    { name: 'WQXGA', width: 2560, height: 1600 },
    { name: '8K UHD', width: 7680, height: 4320 },
  ];

  type Preset = { name: string; width: number; height: number };
  type Resolution = { name: string; width: number; height: number };

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const simplifyRatio = (w: number, h: number): string => {
    const divisor = gcd(w, h);
    return `${w / divisor}:${h / divisor}`;
  };

  const calculateRatio = () => {
    if (width > 0 && height > 0) {
      setRatio(simplifyRatio(width, height));
    }
  };

  useEffect(() => {
    calculateRatio();
  }, [width, height]);

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (lockRatio && height > 0 && newWidth > 0) {
      const newHeight = Math.round((newWidth * height) / width);
      setHeight(newHeight);
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (lockRatio && width > 0 && newHeight > 0) {
      const newWidth = Math.round((newHeight * width) / height);
      setWidth(newWidth);
    }
  };

  const applyPreset = (p: Preset) => {
    setPreset(p);
    setRatio(`${p.width}:${p.height}`);
  };

  const applyResolution = (r: Resolution) => {
    setWidth(r.width);
    setHeight(r.height);
    setPreset(null);
  };

  const calculateTarget = (): { width: number; height: number } | null => {
    if (!targetWidth && !targetHeight) return null;
    
    const aspectRatio = width / height;
    
    if (targetWidth && !targetHeight) {
      return {
        width: parseInt(targetWidth),
        height: Math.round(parseInt(targetWidth) / aspectRatio)
      };
    }
    
    if (targetHeight && !targetWidth) {
      return {
        width: Math.round(parseInt(targetHeight) * aspectRatio),
        height: parseInt(targetHeight)
      };
    }
    
    return null;
  };

  const target = calculateTarget();

  const swapDimensions = () => {
    const temp = width;
    setWidth(height);
    setHeight(temp);
  };

  const copyRatio = () => {
    navigator.clipboard.writeText(ratio);
  };

  const copyDimensions = () => {
    navigator.clipboard.writeText(`${width} x ${height}`);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Aspect Ratio Calculator</h2>
        <p className="tool-desc">Calculate dimensions, convert ratios, and find matching resolutions</p>
      </div>

      <div className="tool-grid">
        <div className="panel">
          <h3>Current Dimensions</h3>
          
          <div className="dimension-inputs">
            <div className="input-group">
              <label>Width</label>
              <div className="input-with-btn">
                <input
                  type="number"
                  value={width}
                  onChange={e => handleWidthChange(parseInt(e.target.value) || 0)}
                  min={1}
                  max={100000}
                  className="dimension-input"
                />
                <button onClick={copyDimensions} className="btn-icon" title="Copy dimensions">📋</button>
              </div>
            </div>
            <div className="input-group">
              <label>Height</label>
              <div className="input-with-btn">
                <input
                  type="number"
                  value={height}
                  onChange={e => handleHeightChange(parseInt(e.target.value) || 0)}
                  min={1}
                  max={100000}
                  className="dimension-input"
                />
                <button onClick={copyDimensions} className="btn-icon" title="Copy dimensions">📋</button>
              </div>
            </div>
          </div>

          <div className="ratio-display">
            <span className="ratio-label">Aspect Ratio:</span>
            <div className="ratio-value">
              <span>{ratio}</span>
              <button onClick={copyRatio} className="btn-icon" title="Copy ratio">📋</button>
            </div>
            <span className="ratio-decimal">({(width / height).toFixed(4)})</span>
          </div>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={lockRatio}
              onChange={e => setLockRatio(e.target.checked)}
            />
            Lock aspect ratio
          </label>

          <button onClick={swapDimensions} className="btn-secondary swap-btn">
            ↕ Swap Width/Height
          </button>
        </div>

        <div className="panel">
          <h3>Target Dimension Calculator</h3>
          <p className="panel-hint">Enter one dimension to calculate the other</p>
          
          <div className="target-inputs">
            <div className="input-group">
              <label>Target Width</label>
              <input
                type="number"
                value={targetWidth}
                onChange={e => setTargetWidth(e.target.value)}
                placeholder="Enter width..."
                min={1}
                max={100000}
              />
            </div>
            <div className="input-group">
              <label>Target Height</label>
              <input
                type="number"
                value={targetHeight}
                onChange={e => setTargetHeight(e.target.value)}
                placeholder="Enter height..."
                min={1}
                max={100000}
              />
            </div>
          </div>

          {target && (
            <div className="calculated-result">
              <h4>Calculated Dimensions:</h4>
              <div className="result-dimensions">
                <span className="result-width">{target.width} px</span>
                <span className="result-divider">×</span>
                <span className="result-height">{target.height} px</span>
              </div>
              <p className="result-ratio">Ratio: {simplifyRatio(target.width, target.height)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="tool-grid">
        <div className="panel">
          <h3>Common Aspect Ratio Presets</h3>
          <div className="preset-grid">
            {presets.map(p => (
              <button
                key={p.name}
                className={`preset-btn ${preset?.width === p.width && preset?.height === p.height ? 'active' : ''}`}
                onClick={() => applyPreset(p)}
              >
                <span className="preset-name">{p.name}</span>
                <span className="preset-ratio">{p.width}:{p.height}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3>Standard Resolutions</h3>
          <div className="resolution-grid">
            {resolutions.map(r => (
              <button
                key={r.name}
                className="resolution-btn"
                onClick={() => applyResolution(r)}
              >
                <span className="resolution-name">{r.name}</span>
                <span className="resolution-dims">{r.width} × {r.height}</span>
                <span className="resolution-ratio">{simplifyRatio(r.width, r.height)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="info-panel">
        <h3>Formula Reference</h3>
        <div className="formula-grid">
          <div className="formula">
            <code>newHeight = (newWidth × height) / width</code>
            <span>Calculate height from width</span>
          </div>
          <div className="formula">
            <code>newWidth = (newHeight × width) / height</code>
            <span>Calculate width from height</span>
          </div>
          <div className="formula">
            <code>ratio = width : height (simplified by GCD)</code>
            <span>Simplify ratio to lowest terms</span>
          </div>
          <div className="formula">
            <code>decimal = width / height</code>
            <span>Aspect ratio as decimal</span>
          </div>
        </div>
      </div>
    </div>
  );
}