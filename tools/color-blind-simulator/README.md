# Color Blindness Simulator

## Description
A tool to simulate how colors appear to people with various types of color vision deficiency (color blindness). This helps designers and developers create more accessible color palettes by visualizing how their color choices look to users with different color vision conditions.

## Usage
```tsx
import ColorBlindSimulator from './tools/color-blind-simulator';
```

## Features
- Simulates 7 types of color vision deficiency:
  - Protanopia (Red-blind)
  - Deuteranopia (Green-blind)
  - Tritanopia (Blue-blind)
  - Achromatopsia (Monochromacy/Total color blindness)
  - Protanomaly (Red-weak)
  - Deuteranomaly (Green-weak - most common)
  - Tritanomaly (Blue-weak)
- Interactive color picker for base color selection
- Real-time palette generation with variations
- Side-by-side comparison of original vs simulated colors
- Prevalence statistics for each condition type
- Accessibility design tips

## Technical Details
Uses accurate color vision deficiency transformation matrices based on the Brettel-Viénot-Mollon model for dichromacy and modified matrices for anomalous trichromacy. Colors are converted to linear RGB space before applying transformations, then converted back to sRGB for display.

## Development
```bash
npm run dev
```

## Accessibility
This tool itself follows WCAG guidelines for contrast and keyboard navigation. Use it to verify your own designs meet accessibility standards.