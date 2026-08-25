import { useState, useRef } from 'react';

interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  percentage: number;
}

export default function ColorPaletteExtractor() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [numColors, setNumColors] = useState(8);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractColors = async (img: HTMLImageElement, count: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to image dimensions (max 300px for performance)
    const maxDim = 300;
    let width = img.width;
    let height = img.height;
    
    if (width > maxDim || height > maxDim) {
      const scale = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Count color frequencies
    const colorMap = new Map<string, number>();
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Skip transparent pixels
      if (a < 128) continue;
      
      // Quantize colors to reduce noise (group similar colors)
      const qr = Math.round(r / 8) * 8;
      const qg = Math.round(g / 8) * 8;
      const qb = Math.round(b / 8) * 8;
      const key = `${qr},${qg},${qb}`;
      
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }

    // Sort by frequency and take top N
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count);

    const totalPixels = width * height;
    const results: ColorInfo[] = sortedColors.map(([key, count]) => {
      const [r, g, b] = key.split(',').map(Number);
      return {
        hex: rgbToHex(r, g, b),
        rgb: { r, g, b },
        hsl: rgbToHsl(r, g, b),
        percentage: Math.round((count / totalPixels) * 10000) / 100
      };
    });

    setColors(results);
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    setError(null);
    setProcessing(true);
    
    const img = new Image();
    img.onload = () => {
      setImage(img);
      extractColors(img, numColors);
      setProcessing(false);
    };
    img.onerror = () => {
      setError('Failed to load image');
      setProcessing(false);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleNumColorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 50);
    setNumColors(count);
    if (image) {
      extractColors(image, count);
    }
  };

  const copyPalette = () => {
    const text = colors.map(c => `${c.hex} (${c.percentage}%)`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const copyCSS = () => {
    const css = colors.map(c => `  --color-${colors.indexOf(c) + 1}: ${c.hex};`).join('\n');
    const output = `:root {\n${css}\n}`;
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Color Palette Extractor</h2>
        <p className="tool-desc">Upload an image to extract its dominant color palette. Get hex, RGB, HSL values and CSS variables.</p>
      </div>

      <div className="tool-grid">
        <div className="upload-panel">
          <div className="drop-zone" onClick={() => fileInputRef.current?.click()}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {image ? (
              <img src={image.src} alt="Uploaded" className="preview-image" />
            ) : (
              <div className="drop-content">
                <span className="upload-icon">📷</span>
                <p>Click or drag to upload an image</p>
                <span className="upload-hint">PNG, JPG, WebP, GIF up to 10MB</span>
              </div>
            )}
          </div>

          {error && <p className="error-message">{error}</p>}

          {image && (
            <div className="controls">
              <label>
                Colors to extract:
                <input
                  type="number"
                  value={numColors}
                  onChange={handleNumColorsChange}
                  min={1}
                  max={50}
                  className="num-input"
                />
              </label>
              <div className="action-buttons">
                <button onClick={copyPalette} disabled={colors.length === 0} className="secondary-btn">
                  Copy Palette
                </button>
                <button onClick={copyCSS} disabled={colors.length === 0} className="secondary-btn">
                  Copy CSS Variables
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="palette-panel">
          {processing && <p className="processing">Extracting colors...</p>}
          
          {colors.length > 0 && (
            <div className="palette-grid">
              {colors.map((color, index) => (
                <div key={index} className="palette-item">
                  <div 
                    className="color-swatch" 
                    style={{ backgroundColor: color.hex }}
                    title={`${color.hex} - ${color.percentage}%`}
                  ></div>
                  <div className="color-info">
                    <div className="color-hex">{color.hex}</div>
                    <div className="color-rgb">rgb({color.rgb.r}, {color.rgb.g}, {color.rgb.b})</div>
                    <div className="color-hsl">hsl({color.hsl.h}, {color.hsl.s}%, {color.hsl.l}%)</div>
                    <div className="color-percentage">{color.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!image && !processing && colors.length === 0 && (
            <p className="empty-state">Upload an image to see its color palette</p>
          )}
        </div>
      </div>

      {image && (
        <div className="original-preview">
          <h3>Original Image</h3>
          <img src={image.src} alt="Original" className="original-image" />
        </div>
      )}
    </div>
  );
}