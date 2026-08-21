# color-palette-generator

## Description
color-palette-generator - Generate harmonious color palettes from a base color using color theory algorithms. Supports 10 palette types: monochromatic, analogous, complementary, triadic, tetradic, split-complementary, square, shades, tints, and tones.

## Usage
```tsx
import ColorPaletteGenerator from './tools/color-palette-generator';
```

## Features
- 10 palette types based on color theory (monochromatic, analogous, complementary, triadic, tetradic, split-complementary, square, shades, tints, tones)
- Interactive base color picker (native color input + hex input)
- Real-time palette generation with color previews
- Copy individual colors to clipboard (hex, RGB, HSL values shown on hover)
- Export palettes in multiple formats: CSS variables, SCSS variables, JSON, Tailwind config
- UI preview showing palette applied to a sample card component
- Contrast-aware text colors for readability

## Development
```bash
npm run dev
```