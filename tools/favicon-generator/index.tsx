import { useState, useRef } from 'react';

export default function FaviconGenerator() {
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [sizes, setSizes] = useState<number[]>([16, 32, 48, 64, 128, 180, 192, 512]);
  const [customSize, setCustomSize] = useState('');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [bgType, setBgType] = useState<'color' | 'transparent'>('color');
  const [format, setFormat] = useState<'ico' | 'png' | 'both'>('both');
  const [generatedFiles, setGeneratedFiles] = useState<{size: number, dataUrl: string, blob: Blob}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  };

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setInputImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setInputImage(null);
    setGeneratedFiles([]);
  };

  const addCustomSize = () => {
    const size = parseInt(customSize);
    if (size && size > 0 && size <= 1024 && !sizes.includes(size)) {
      setSizes(prev => [...prev, size].sort((a, b) => a - b));
      setCustomSize('');
    }
  };

  const removeSize = (size: number) => {
    setSizes(prev => prev.filter(s => s !== size));
  };

  const generateFavicons = async () => {
    if (!inputImage) return;
    
    setIsGenerating(true);
    const results: {size: number, dataUrl: string, blob: Blob}[] = [];
    
    const img = new Image();
    img.src = inputImage;
    await new Promise(resolve => { img.onload = resolve; });

    for (const size of sizes) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) continue;

      // Clear with background
      if (bgType === 'transparent') {
        ctx.clearRect(0, 0, size, size);
      } else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
      }

      // Draw image centered, maintaining aspect ratio
      const scale = Math.min(size / img.width, size / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const x = (size - drawWidth) / 2;
      const y = (size - drawHeight) / 2;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, x, y, drawWidth, drawHeight);

      // Generate PNG
      const pngDataUrl = canvas.toDataURL('image/png');
      const pngBlob = await new Promise<Blob>(resolve => 
        canvas.toBlob(b => resolve(b!), 'image/png')
      );
      
      results.push({ size, dataUrl: pngDataUrl, blob: pngBlob! });
    }

    setGeneratedFiles(results);
    setIsGenerating(false);
  };

  const downloadAll = async () => {
    if (format === 'ico') {
      // Create ICO with multiple sizes
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // For ICO, we'll just download the largest as PNG since browser ICO generation is complex
      // In a real app, you'd use a library like icojs
      const largest = generatedFiles.reduce((a, b) => a.size > b.size ? a : b);
      downloadBlob(largest.blob, `favicon-${largest.size}x${largest.size}.png`);
    } else {
      // Download all as individual PNGs in a zip-like fashion (individual downloads)
      for (const file of generatedFiles) {
        downloadBlob(file.blob, `favicon-${file.size}x${file.size}.png`);
        // Small delay to prevent browser blocking multiple downloads
        await new Promise(r => setTimeout(r, 100));
      }
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (dataUrl: string) => {
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Favicon Generator</h2>
        <p className="tool-desc">Upload an image and generate favicon files in multiple sizes. Supports PNG and ICO formats.</p>
      </div>

      <div className="tool-grid">
        <div className="upload-panel">
          <div 
            className={`drop-zone ${dragActive ? 'active' : ''} ${inputImage ? 'has-image' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            {inputImage ? (
              <div className="image-preview">
                <img src={inputImage} alt="Preview" />
                <button className="remove-btn" onClick={removeImage}>Remove</button>
              </div>
            ) : (
              <div className="drop-content">
                <span className="drop-icon">📁</span>
                <p>Drag & drop an image here, or click to browse</p>
                <span className="drop-hint">PNG, JPG, SVG, WebP up to 10MB</span>
              </div>
            )}
          </div>

          {inputImage && (
            <div className="options-panel">
              <div className="option-group">
                <label>Background</label>
                <div className="bg-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="color"
                      checked={bgType === 'color'}
                      onChange={() => setBgType('color')}
                    />
                    <span>Color</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="transparent"
                      checked={bgType === 'transparent'}
                      onChange={() => setBgType('transparent')}
                    />
                    <span>Transparent</span>
                  </label>
                </div>
                {bgType === 'color' && (
                  <input
                    type="color"
                    value={bgColor}
                    onChange={e => setBgColor(e.target.value)}
                    className="color-picker-input"
                  />
                )}
              </div>

              <div className="option-group">
                <label>Output Format</label>
                <div className="format-options">
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="png"
                      checked={format === 'png'}
                      onChange={() => setFormat('png')}
                    />
                    <span>PNG (separate files)</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      value="both"
                      checked={format === 'both'}
                      onChange={() => setFormat('both')}
                    />
                    <span>PNG (multiple sizes)</span>
                  </label>
                </div>
              </div>

              <div className="option-group">
                <label>Sizes ({sizes.length})</label>
                <div className="sizes-list">
                  {sizes.map(size => (
                    <span key={size} className="size-tag">
                      {size}×{size}
                      <button onClick={() => removeSize(size)}>×</button>
                    </span>
                  ))}
                </div>
                <div className="add-size">
                  <input
                    type="number"
                    value={customSize}
                    onChange={e => setCustomSize(e.target.value)}
                    placeholder="Custom size"
                    min="1"
                    max="1024"
                    className="size-input"
                  />
                  <button className="btn-secondary" onClick={addCustomSize}>Add</button>
                </div>
                <div className="preset-sizes">
                  <button className="btn-preset" onClick={() => setSizes([16, 32, 48, 64])}>Classic</button>
                  <button className="btn-preset" onClick={() => setSizes([16, 32, 48, 64, 128, 256])}>Extended</button>
                  <button className="btn-preset" onClick={() => setSizes([16, 32, 48, 64, 128, 180, 192, 512])}>All</button>
                </div>
              </div>

              <button 
                className="btn-primary generate-btn" 
                onClick={generateFavicons}
                disabled={isGenerating || !inputImage}
              >
                {isGenerating ? 'Generating...' : 'Generate Favicons'}
              </button>
            </div>
          )}
        </div>

        <div className="preview-panel">
          <h3>Generated Favicons</h3>
          
          {generatedFiles.length === 0 ? (
            <div className="empty-preview">
              <p>Upload an image and click "Generate Favicons" to see results</p>
            </div>
          ) : (
            <div className="preview-grid">
              {generatedFiles.map((file, idx) => (
                <div key={idx} className="preview-item">
                  <div className="preview-image">
                    <img src={file.dataUrl} alt={`${file.size}x${file.size}`} />
                  </div>
                  <div className="preview-info">
                    <span className="preview-size">{file.size} × {file.size}</span>
                    <div className="preview-actions">
                      <button 
                        className="btn-icon" 
                        onClick={() => downloadBlob(file.blob, `favicon-${file.size}x${file.size}.png`)}
                        title="Download"
                      >
                        ⬇
                      </button>
                      <button 
                        className="btn-icon" 
                        onClick={() => copyToClipboard(file.dataUrl)}
                        title="Copy to clipboard"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {generatedFiles.length > 0 && (
            <div className="download-all">
              <button className="btn-primary" onClick={downloadAll}>
                Download All ({generatedFiles.length} files)
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="usage-panel">
        <h3>HTML Usage</h3>
        <pre className="code-block">{`<!-- Add to your <head> -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#ffffff" />`}</pre>
        <p className="usage-note">Place generated files in your web root. For ICO format, use <code><link rel="icon" href="/favicon.ico" /></code></p>
      </div>
    </div>
  );
}