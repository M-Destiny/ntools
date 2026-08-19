# Color Contrast Checker

Check WCAG 2.1 contrast ratios between foreground and background colors. Test AA and AAA compliance for normal and large text.

## Features

- **WCAG 2.1 compliance testing** — AA and AAA levels for normal and large text
- **UI components testing** — 3:1 ratio for borders, icons, form controls
- **Real-time preview** — See text, buttons, and inputs with your colors
- **Multiple color formats** — Hex, RGB, HSL, named colors
- **Preset combinations** — Quick access to common color pairs
- **Color suggestions** — Palettes for text and background colors
- **Export** — Copy report or CSS variables
- **Swap colors** — One-click foreground/background swap

## WCAG 2.1 Requirements

| Level | Text Type | Minimum Ratio |
|-------|-----------|---------------|
| AAA | Normal text | 7:1 |
| AAA | Large text (≥18pt or ≥14pt bold) | 4.5:1 |
| AA | Normal text | 4.5:1 |
| AA | Large text (≥18pt or ≥14pt bold) | 3:1 |
| AA | UI components, graphics | 3:1 |

**Large text** = ≥18pt (24px) regular or ≥14pt (18.5px) bold

## Supported Color Formats

- **Hex**: `#rgb`, `#rrggbb`, `#rrggbbaa`
- **RGB**: `rgb(255, 0, 0)`
- **HSL**: `hsl(0, 100%, 50%)`
- **Named**: `red`, `blue`, `transparent`, `black`, `white`, etc.

## Preset Combinations

- Default (`#1a1a1a` on `#ffffff`)
- Dark Mode (`#e4e4e7` on `#18181b`)
- High Contrast (`#000000` on `#ffffff`)
- Blue on White / White on Blue
- Green on White / Red on White
- Gray on White / Yellow on Black
- Subtle Gray

## Component

`/tools/color-contrast/index.tsx` — React + TypeScript component with live contrast calculation.

## Usage

```tsx
import ColorContrast from '../tools/color-contrast';
<ColorContrast />
```

## Development

```bash
npm run dev
# Visit /tools/color-contrast
```

## Algorithm

Uses WCAG 2.1 relative luminance formula:
```
L = 0.2126 * R + 0.7152 * G + 0.0722 * B
```
where R, G, B are sRGB values with gamma correction.

Contrast ratio = `(L1 + 0.05) / (L2 + 0.05)` where L1 is lighter, L2 is darker.