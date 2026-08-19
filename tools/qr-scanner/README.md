# qr-scanner

## Description
qr-scanner - A QR code scanner built with React + TypeScript. Uses the native Barcode Detection API for real-time camera scanning, with fallback to image file upload.

## Usage
```tsx
import QRScanner from './tools/qr-scanner';
```

## Features
- Real-time camera scanning using native Barcode Detection API (Chrome 88+, Edge 88+)
- Front/back camera switching
- Flashlight/torch support (where hardware supports it)
- Image file upload scanning (works in all browsers)
- Scan history (last 20 scans)
- Auto-detects URLs and offers to open them
- Copy result to clipboard
- Works on HTTPS or localhost (required for camera access)

## Browser Support
- **Full support:** Chrome 88+, Edge 88+, Opera 74+
- **Partial:** Safari 15.4+ (limited formats)
- **Not supported:** Firefox (behind flag), older browsers
- Requires HTTPS or localhost for camera access

## Development
```bash
npm run dev
```