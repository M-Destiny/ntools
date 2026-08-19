import { useState, useRef } from 'react';

export default function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [format, setFormat] = useState<'auto' | 'jpeg' | 'png' | 'webp'>('auto');
  const [results, setResults] = useState<CompressedResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalOriginal, setTotalOriginal] = useState(0);
  const [totalCompressed, setTotalCompressed] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface CompressedResult {
    file: File;
    preview: string;
    compressedPreview: string;
    originalSize: number;
    compressedSize: number;
    savings: number;
    error?: string;
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getMimeType = (file: File, targetFormat: string): string => {
    if (targetFormat !== 'auto') {
      return `image/${targetFormat === 'jpeg' ? 'jpeg' : targetFormat}`;
    }
    return file.type || 'image/jpeg';
  };

  const getExtension = (mimeType: string): string => {
    switch (mimeType) {
      case 'image/jpeg': return 'jpg';
      case 'image/png': return 'png';
      case 'image/webp': return 'webp';
      case 'image/gif': return 'gif';
      case 'image/avif': return 'avif';
      default: return 'jpg';
    }
  };

  const compressImage = (file: File): Promise<CompressedResult> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            file,
            preview: objectUrl,
            compressedPreview: '',
            originalSize: file.size,
            compressedSize: 0,
            savings: 0,
            error: 'Canvas context not available'
          });
          return;
        }

        // Calculate new dimensions
        let { width, height } = img;
        const aspectRatio = width / height;

        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = getMimeType(file, format);
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        
        // Convert data URL to blob to get size
        const byteString = atob(compressedDataUrl.split(',')[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }
        const compressedBlob = new Blob([arrayBuffer], { type: mimeType });

        const originalSize = file.size;
        const compressedSize = compressedBlob.size;
        const savings = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;

        resolve({
          file,
          preview: objectUrl,
          compressedPreview: compressedDataUrl,
          originalSize,
          compressedSize,
          savings,
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          file,
          preview: '',
          compressedPreview: '',
          originalSize: file.size,
          compressedSize: 0,
          savings: 0,
          error: 'Failed to load image'
        });
      };

      img.src = objectUrl;
    });
  };

  const handleFiles = async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setFiles(fileArray);
    setIsProcessing(true);
    setResults([]);

    const compressedResults = await Promise.all(fileArray.map(compressImage));
    setResults(compressedResults);

    const totalOrig = compressedResults.reduce((sum, r) => sum + r.originalSize, 0);
    const totalComp = compressedResults.reduce((sum, r) => sum + r.compressedSize, 0);
    setTotalOriginal(totalOrig);
    setTotalCompressed(totalComp);

    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const downloadAll = () => {
    results.forEach((result, _index) => {
      if (result.compressedPreview) {
        const a = document.createElement('a');
        a.href = result.compressedPreview;
        const ext = getExtension(getMimeType(result.file, format));
        const name = result.file.name.replace(/\.[^.]+$/, '');
        a.download = `${name}-compressed.${ext}`;
        a.click();
      }
    });
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
    setTotalOriginal(0);
    setTotalCompressed(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const totalSavings = totalOriginal > 0 
    ? Math.round((1 - totalCompressed / totalOriginal) * 100) 
    : 0;

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>Image Compressor</h2>
        <p className="tool-desc">
          Compress JPEG, PNG, WebP, and other images in the browser. Reduce file size while maintaining visual quality.
        </p>
      </div>

      <div className="drop-zone" 
        onDrop={handleDrop} 
        onDragOver={handleDragOver}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          style={{ display: 'none' }}
        />
        
        {files.length === 0 ? (
          <div className="drop-content">
            <svg className="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p>Drag & drop images here, or click to browse</p>
            <span className="drop-hint">Supports JPEG, PNG, WebP, GIF, AVIF</span>
          </div>
        ) : (
          <div className="files-summary">
            <p>{files.length} image{files.length !== 1 ? 's' : ''} selected</p>
            <button className="btn-secondary" onClick={clearAll}>Clear All</button>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="settings-panel">
          <div className="setting-row">
            <label>
              <span>Quality</span>
              <div className="slider-container">
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                />
                <span className="slider-value">{Math.round(quality * 100)}%</span>
              </div>
            </label>
          </div>

          <div className="setting-row">
            <label>
              <span>Max Width</span>
              <input
                type="number"
                value={maxWidth}
                onChange={(e) => setMaxWidth(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="7680"
              />
              <span>px</span>
            </label>
          </div>

          <div className="setting-row">
            <label>
              <span>Max Height</span>
              <input
                type="number"
                value={maxHeight}
                onChange={(e) => setMaxHeight(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="4320"
              />
              <span>px</span>
            </label>
          </div>

          <div className="setting-row">
            <label>
              <span>Output Format</span>
              <select value={format} onChange={(e) => setFormat(e.target.value as any)}>
                <option value="auto">Auto (keep original)</option>
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </label>
          </div>

          <div className="action-buttons">
            <button 
              className="btn-primary" 
              onClick={downloadAll} 
              disabled={isProcessing || results.length === 0}
            >
              {isProcessing ? 'Compressing...' : 'Download All Compressed'}
            </button>
            <button className="btn-secondary" onClick={clearAll} disabled={isProcessing}>
              Clear
            </button>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h3>Results ({results.length} image{results.length !== 1 ? 's' : ''})</h3>
            <div className="total-stats">
              <span>Original: {formatBytes(totalOriginal)}</span>
              <span>Compressed: {formatBytes(totalCompressed)}</span>
              <span className="savings">Saved: {totalSavings}%</span>
            </div>
          </div>

          <div className="results-grid">
            {results.map((result, index) => (
              <div key={index} className="result-card">
                {result.error ? (
                  <div className="result-error">
                    <p>Error: {result.error}</p>
                    <p className="filename">{result.file.name}</p>
                  </div>
                ) : (
                  <>
                    <div className="image-comparison">
                      <div className="image-side">
                        <label>Original ({formatBytes(result.originalSize)})</label>
                        <img src={result.preview} alt={result.file.name} />
                      </div>
                      <div className="image-side">
                        <label>Compressed ({formatBytes(result.compressedSize)}, -{result.savings}%)</label>
                        <img src={result.compressedPreview} alt={`${result.file.name} compressed`} />
                      </div>
                    </div>
                    <div className="result-info">
                      <p className="filename">{result.file.name}</p>
                      <p className="dimensions">
                        {result.originalSize > 0 && result.compressedSize > 0 && 
                          `Reduced by ${formatBytes(result.originalSize - result.compressedSize)}`}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="info-section">
        <details>
          <summary>How Image Compression Works</summary>
          <div className="help-content">
            <h4>Compression Methods:</h4>
            <ul>
              <li><strong>Quality reduction:</strong> Lowers JPEG/WebP quality (0.1-1.0) to reduce file size</li>
              <li><strong>Dimension scaling:</strong> Resizes images to fit within max width/height while preserving aspect ratio</li>
              <li><strong>Format conversion:</strong> Converts to more efficient formats (WebP, JPEG) when beneficial</li>
            </ul>

            <h4>Quality Guidelines:</h4>
            <ul>
              <li><strong>0.8-0.9:</strong> High quality, minimal visible loss (recommended for photos)</li>
              <li><strong>0.6-0.7:</strong> Good balance, smaller files (good for web)</li>
              <li><strong>0.4-0.5:</strong> Noticeable compression, much smaller (thumbnails, previews)</li>
              <li><strong>Below 0.4:</strong> Heavy artifacts, maximum compression</li>
            </ul>

            <h4>Format Recommendations:</h4>
            <ul>
              <li><strong>WebP:</strong> Best compression for web, supports transparency</li>
              <li><strong>JPEG:</strong> Best for photos, no transparency</li>
              <li><strong>PNG:</strong> Lossless, supports transparency, larger files</li>
              <li><strong>Auto:</strong> Keeps original format</li>
            </ul>

            <h4>Privacy:</h4>
            <p>All processing happens in your browser. No images are uploaded to any server.</p>
          </div>
        </details>
      </div>
    </div>
  );
}