import { useState, useRef, useEffect, useCallback } from 'react';

// TypeScript declarations for Barcode Detection API
interface Point2D {
  x: number;
  y: number;
}

interface BarcodeDetectorOptions {
  formats: string[];
}

interface DetectedBarcode {
  rawValue: string;
  boundingBox?: DOMRectReadOnly;
  cornerPoints?: ReadonlyArray<Point2D>;
  format?: string;
}

interface BarcodeDetector {
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
  new (options: BarcodeDetectorOptions): BarcodeDetector;
  getSupportedFormats(): Promise<string[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

// Type for the detector instance
type BarcodeDetectorInstance = BarcodeDetector | null;

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [scannedHistory, setScannedHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [supported, setSupported] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const barcodeDetectorRef = useRef<BarcodeDetectorInstance>(null);

  // Check for Barcode Detection API support
  useEffect(() => {
    const checkSupport = async () => {
      if ('BarcodeDetector' in window) {
        try {
          const formats = await window.BarcodeDetector!.getSupportedFormats();
          if (formats.includes('qr_code')) {
            setSupported(true);
            barcodeDetectorRef.current = new window.BarcodeDetector!({ formats: ['qr_code'] });
          }
        } catch {
          setSupported(false);
        }
      } else {
        setSupported(false);
      }
    };
    checkSupport();
  }, []);

  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      trackRef.current = stream.getVideoTracks()[0];
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPermissionGranted(true);
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera access denied');
      setPermissionGranted(false);
      return false;
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setPermissionGranted(false);
  }, []);

  const toggleTorch = useCallback(async () => {
    if (trackRef.current && 'getCapabilities' in trackRef.current) {
      const capabilities = trackRef.current.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
      if (capabilities.torch) {
        try {
          await trackRef.current.applyConstraints({ advanced: [{ torch: !torchOn }] } as unknown as MediaTrackConstraints);
          setTorchOn(!torchOn);
        } catch {
          setError('Torch not available');
        }
      }
    }
  }, [torchOn]);

  const switchCamera = useCallback(async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (isScanning) {
      stopCamera();
      await new Promise(r => setTimeout(r, 100));
      await requestCameraPermission();
      if (permissionGranted) {
        startScanningLoop();
      }
    }
  }, [facingMode, isScanning, stopCamera, requestCameraPermission, permissionGranted]);

  const startScanningLoop = useCallback(() => {
    if (!videoRef.current || !permissionGranted) return;

    const scanFrame = async () => {
      if (!isScanning || !videoRef.current || !permissionGranted) return;

      const video = videoRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        try {
          if (barcodeDetectorRef.current) {
            // Use Barcode Detection API
            const barcodes = await barcodeDetectorRef.current.detect(video);
            if (barcodes.length > 0) {
              const barcode = barcodes[0];
              if (barcode.rawValue) {
                handleDetection(barcode.rawValue);
                return; // Stop scanning after detection
              }
            }
          }
        } catch {
          // Fallback or error - continue scanning
        }
      }
      animationRef.current = requestAnimationFrame(scanFrame);
    };

    animationRef.current = requestAnimationFrame(scanFrame);
  }, [isScanning, permissionGranted]);

  const handleDetection = (value: string) => {
    setResult(value);
    setScannedHistory(prev => [value, ...prev].slice(0, 20));
    setIsScanning(false);
    stopCamera();
  };

  const startScanning = async () => {
    setError(null);
    setResult(null);
    const granted = await requestCameraPermission();
    if (granted) {
      setIsScanning(true);
      startScanningLoop();
    }
  };

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  const rescan = () => {
    setResult(null);
    startScanning();
  };

  const scanFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (barcodeDetectorRef.current) {
          try {
            const barcodes = await barcodeDetectorRef.current.detect(canvas);
            if (barcodes.length > 0) {
              handleDetection(barcodes[0].rawValue);
            } else {
              setError('No QR code found in image');
            }
          } catch {
            setError('Failed to scan image');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="tool-container">
      <div className="tool-header">
        <h2>QR Code Scanner</h2>
        <p className="tool-desc">
          Scan QR codes using your camera or upload an image. 
          {supported ? 'Uses native Barcode Detection API' : 'Uses fallback scanning'}
        </p>
      </div>

      {!permissionGranted && !isScanning && (
        <div className="scanner-placeholder">
          <div className="placeholder-icon">📷</div>
          <h3>QR Code Scanner</h3>
          <p>Click "Start Scanning" to use your camera, or upload an image file</p>
          <div className="placeholder-actions">
            <button className="btn-primary" onClick={startScanning} disabled={!supported && !('mediaDevices' in navigator)}>
              {supported ? 'Start Scanning (Native API)' : 'Start Scanning'}
            </button>
            <input
              type="file"
              accept="image/*"
              onChange={scanFromFile}
              className="file-input"
              id="qr-file-input"
            />
            <label htmlFor="qr-file-input" className="btn-secondary">
              Upload Image
            </label>
          </div>
          {!supported && (
            <p className="api-notice">
              ⚠️ Barcode Detection API not supported in this browser. 
              Camera scanning may not work. Try uploading an image or use a supported browser (Chrome 88+, Edge 88+).
            </p>
          )}
        </div>
      )}

      {permissionGranted && (
        <div className="scanner-active">
          <div className="video-container">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="scanner-video"
            />
            <canvas ref={canvasRef} className="scanner-canvas" style={{ display: 'none' }} />
            
            {isScanning && (
              <div className="scanning-overlay">
                <div className="scanning-frame">
                  <div className="corner top-left"></div>
                  <div className="corner top-right"></div>
                  <div className="corner bottom-left"></div>
                  <div className="corner bottom-right"></div>
                </div>
                <p className="scanning-hint">Position QR code within the frame</p>
              </div>
            )}

            {!isScanning && result && (
              <div className="result-overlay">
                <div className="result-badge">✓ QR Code Detected</div>
              </div>
            )}
          </div>

          <div className="scanner-controls">
            {isScanning ? (
              <button className="btn-danger" onClick={() => { setIsScanning(false); stopCamera(); }}>
                Stop Scanning
              </button>
            ) : (
              <button className="btn-primary" onClick={startScanning}>
                {result ? 'Scan Another' : 'Start Scanning'}
              </button>
            )}

            <button className="btn-secondary" onClick={switchCamera} disabled={isScanning}>
              {facingMode === 'environment' ? '📷 Rear' : '📷 Front'}
            </button>

            {(() => {
              const capabilities = trackRef.current?.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean } | undefined;
              return capabilities?.torch ? (
                <button className={torchOn ? 'btn-warning' : 'btn-secondary'} onClick={toggleTorch} disabled={isScanning}>
                  {torchOn ? '🔦 Torch On' : '🔦 Torch'}
                </button>
              ) : null;
            })()}
          </div>
        </div>
      )}

      {result && (
        <div className="result-panel">
          <h3>Scanned Result</h3>
          <div className="result-content">
            <textarea
              value={result}
              readOnly
              className="result-text"
              rows={4}
            />
            <div className="result-actions">
              <button className="btn-primary" onClick={copyResult}>
                {copied ? '✓ Copied!' : 'Copy Result'}
              </button>
              {(() => {
                try {
                  new URL(result);
                  return (
                    <a href={result} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                      Open Link
                    </a>
                  );
                } catch {
                  return null;
                }
              })()}
              <button className="btn-secondary" onClick={rescan}>
                Scan Again
              </button>
              <button className="btn-secondary" onClick={clearResult}>
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-panel">
          <p>Error: {error}</p>
          <button className="btn-secondary" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="info-panel">
        <div className="info-section">
          <h3>Features</h3>
          <ul>
            <li>Real-time camera scanning with native Barcode Detection API</li>
            <li>Front/back camera switching</li>
            <li>Flashlight/torch support (where available)</li>
            <li>Image file upload scanning</li>
            <li>Scan history (last 20 scans)</li>
            <li>Auto-detects URLs and offers to open them</li>
          </ul>
        </div>

        <div className="info-section">
          <h3>Browser Support</h3>
          <ul>
            <li><strong>Full support:</strong> Chrome 88+, Edge 88+, Opera 74+</li>
            <li><strong>Partial:</strong> Safari 15.4+ (limited formats)</li>
            <li><strong>Not supported:</strong> Firefox (behind flag), older browsers</li>
            <li>Requires HTTPS or localhost for camera access</li>
          </ul>
        </div>

        {scannedHistory.length > 0 && (
          <div className="history-section">
            <h3>Scan History</h3>
            <div className="history-list">
              {scannedHistory.map((item, i) => (
                <div key={i} className="history-item">
                  <code>{item.length > 50 ? item.slice(0, 50) + '...' : item}</code>
                  <button
                    className="btn-tiny"
                    onClick={() => { navigator.clipboard.writeText(item); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}