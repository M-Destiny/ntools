# QR Code Generator

A feature-rich QR code generator with customization options and logo support.

## Features

- **Multiple Content Types**: URLs, text, email, phone, WiFi, vCard, location, Bitcoin, and custom data
- **Customizable Appearance**: Size (64-512px), margin, dark/light colors
- **Error Correction Levels**: L (7%), M (15%), Q (25%), H (30%)
- **Logo Support**: Upload custom logo/image with adjustable size (5-30%)
- **Export Options**: Copy as image, download PNG
- **Real-time Preview**: Instant updates as you change settings
- **Quick Examples**: Pre-loaded templates for common use cases
- **Info Panel**: Shows version, error correction, size, data length, logo status

## Error Correction Levels

| Level | Recovery | Best For |
|-------|----------|----------|
| **L** (Low) | ~7% | Clean environments, maximum data capacity |
| **M** (Medium) | ~15% | **Default** — good balance |
| **Q** (Quartile) | ~25% | Codes that may get slightly damaged |
| **H** (High) | ~30% | **With logos**, outdoor use, printing on rough surfaces |

> **Tip**: Use **H** (High) when adding a logo or if the code might be damaged/scratched.

## Quick Examples

| Example | Use Case |
|---------|----------|
| GitHub URL | `https://github.com` |
| Email | `mailto:test@example.com` |
| Phone | `tel:+1234567890` |
| WiFi Config | `WIFI:T:WPA;S:MyNetwork;P:password123;;` |
| vCard Contact | `BEGIN:VCARD...END:VCARD` |
| Location | `geo:37.7749,-122.4194` |
| UTM Link | `https://example.com?utm_source=qrcode` |
| Bitcoin URI | `bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.001` |

## Usage

1. **Enter Content**: Type or paste your data in the text area
2. **Choose Size**: Adjust slider (64-512px) or click presets
3. **Set Margin**: Quiet zone around the code (0-10 modules, default 4)
4. **Pick Colors**: Dark module color and light background color
5. **Select Error Correction**: L/M/Q/H based on your needs
6. **Add Logo (Optional)**: Upload an image, adjust size (5-30%)
7. **Copy/Download**: Copy as image to clipboard or download PNG

## Technical Details

- Built with React + TypeScript
- Canvas-based rendering
- Custom QR code encoder implementation (simplified)
- Supports UTF-8 text encoding
- Logo rendering with white background for contrast
- No external QR library dependency (self-contained)

## Best Practices

- **Test before printing**: Scan with multiple apps (iOS Camera, Google Lens, dedicated QR apps)
- **Minimum size**: 2×2 cm (≈76×76 px at 96 DPI) for reliable scanning
- **Contrast**: Dark on light works best; avoid light-on-dark
- **Margin**: Keep ≥4 modules for spec compliance
- **Error correction**: Use H when adding logos
- **URLs**: Use HTTPS, consider URL shorteners for cleaner codes
- **Logo size**: Keep ≤20% for good scannability

## Supported Data Formats

- **Plain text**: Any UTF-8 string
- **URLs**: `https://example.com`
- **Email**: `mailto:user@domain.com`
- **Phone**: `tel:+1234567890`
- **SMS**: `sms:+1234567890`
- **WiFi**: `WIFI:T:WPA;S:SSID;P:password;;`
- **vCard**: `BEGIN:VCARD...END:VCARD`
- **MeCard**: `MECARD:N:Name;TEL:Phone;EMAIL:Email;;`
- **Location**: `geo:lat,lon`
- **Calendar**: `BEGIN:VEVENT...END:VEVENT`
- **Bitcoin**: `bitcoin:address?amount=X`
- **Custom**: Any string data

## Limitations

- This implementation uses a simplified QR encoder for demonstration
- For production/critical use, consider a full-spec library (e.g., `qrcode`, `qrcode-generator`)
- Maximum data capacity depends on version and error correction level
- Very long texts may require larger QR versions (auto-selected)