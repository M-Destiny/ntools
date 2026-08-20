# Favicon Generator

Generate favicon files in multiple sizes from a single source image. Supports PNG output with optional background color or transparency.

## Features

- Drag & drop or click to upload an image (PNG, JPG, SVG, WebP)
- Generate multiple sizes at once (16×16 to 512×512)
- Custom size support (1-1024px)
- Preset size collections (Classic, Extended, All)
- Background color picker or transparent background
- High-quality image scaling with smoothing
- Individual file download or batch download
- Copy images to clipboard
- HTML usage snippet included

## Usage

1. **Upload an image** - Drag & drop or click the upload zone
2. **Configure options** - Choose background (color/transparent), output format, and sizes
3. **Generate** - Click "Generate Favicons" to create all sizes
4. **Download** - Download individual files or all at once

## Size Presets

| Preset | Sizes | Use Case |
|--------|-------|----------|
| Classic | 16, 32, 48, 64 | Basic browser favicons |
| Extended | 16, 32, 48, 64, 128, 256 | High-DPI displays |
| All | 16, 32, 48, 64, 128, 180, 192, 512 | Full coverage including Apple touch icons |

## Important Sizes

| Size | Purpose |
|------|---------|
| 16×16 | Browser tab icon |
| 32×32 | Standard favicon |
| 48×48 | Windows desktop shortcut |
| 64×64 | High-DPI favicon |
| 180×180 | Apple touch icon (iOS) |
| 192×192 | Android Chrome icon |
| 512×512 | Android splash screen / PWA |

## HTML Integration

```html
<!-- Add to your <head> -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/favicon-180x180.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#ffffff" />
```

Place generated files in your web root directory.

## Technical Details

- Client-side only (no server upload)
- Uses HTML5 Canvas for image processing
- `imageSmoothingQuality: 'high'` for best scaling quality
- Maintains aspect ratio, centers image with background fill
- Outputs PNG format (ICO generation requires additional libraries)