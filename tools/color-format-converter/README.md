# Color Format Converter

A versatile tool for converting colors between multiple formats including HEX, RGB, RGBA, HSL, HSLA, HSV, HSVA, CMYK, and CSS.

## Features

- **Multi-format support**: Convert between 9 different color formats
- **Real-time conversion**: Instant results as you type
- **Input flexibility**: Accepts hex, rgb, rgba, hsl, hsla, hsv, hsva, cmyk, and named colors
- **Visual preview**: Live color swatch shows the current color
- **All formats table**: View the color in all formats simultaneously
- **Copy to clipboard**: One-click copy of the formatted output

## Supported Input Formats

| Format | Example |
|--------|---------|
| HEX | `#3b82f6`, `#3b82f6ff` |
| RGB | `rgb(59, 130, 246)` |
| RGBA | `rgba(59, 130, 246, 0.5)` |
| HSL | `hsl(221, 89%, 60%)` |
| HSLA | `hsla(221, 89%, 60%, 0.5)` |
| HSV | `hsv(221, 76%, 96%)` |
| HSVA | `hsva(221, 76%, 96%, 0.5)` |
| CMYK | `cmyk(76%, 47%, 0%, 4%)` |
| Named | `blue`, `red`, `orange`, etc. |

## Supported Output Formats

- **HEX** - `#RRGGBB` or `#RRGGBBAA`
- **RGB** - `rgb(r, g, b)`
- **RGBA** - `rgba(r, g, b, a)`
- **HSL** - `hsl(h, s%, l%)`
- **HSLA** - `hsla(h, s%, l%, a)`
- **HSV** - `hsv(h, s%, v%)`
- **HSVA** - `hsva(h, s%, v%, a)`
- **CMYK** - `cmyk(c%, m%, y%, k%)`
- **CSS** - Auto-selects hex or rgba based on alpha

## Usage

1. Enter a color value in any supported format in the input field
2. Select the desired output format from the dropdown
3. The converted value appears instantly
4. Click "Copy" to copy the result to clipboard
5. View all formats at once in the "All Formats" table

## Technical Details

- Built with React 19 + TypeScript
- No external color libraries - pure math conversions
- Handles edge cases (clamping, invalid input, alpha channels)
- Responsive design for mobile and desktop

## Color Space Conversions

The tool implements standard color space mathematics:

- **RGB ↔ HSL**: Standard cylindrical transformation
- **RGB ↔ HSV**: Value-based cylindrical transformation  
- **RGB ↔ CMYK**: Subtractive color model conversion
- **HEX ↔ RGB**: Base-16 byte parsing/formatting
- All conversions preserve precision and handle alpha channels correctly