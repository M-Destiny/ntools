# Color Blender

A tool for mixing colors, generating gradients, and creating color scales using perceptual color spaces.

## Features

- **Color Mixing**: Blend two colors at any ratio (default 50/50)
- **Gradient Generation**: Create smooth multi-stop gradients
- **Color Scales**: Generate stepped color scales (2-20 steps)
- **Multiple Color Spaces**: sRGB, OKLab (perceptual), and HSL
- **Export Formats**: CSS gradients, Tailwind classes, JSON, CSV, JS arrays, CSS variables
- **Random Colors**: Quick random color generation
- **Copy to Clipboard**: One-click copying of colors and code

## Color Spaces

| Space | Description | Best For |
|-------|-------------|----------|
| **OKLab** | Perceptually uniform color space | Smooth gradients, natural transitions |
| **sRGB** | Standard RGB linear interpolation | Web colors, direct channel mixing |
| **HSL** | Hue-Saturation-Lightness | Hue rotations, color harmony |

**OKLab is recommended** for most gradient work as it produces the most visually uniform transitions without the "muddy middle" problem of sRGB or hue shifts in HSL.

## Usage

1. Pick two colors using the color pickers or hex inputs
2. Choose a color space (OKLab recommended)
3. Select mode:
   - **Mix**: Single blended color at 50/50
   - **Gradient**: Continuous gradient bar with stops
   - **Steps**: Discrete color scale (2-20 steps)
4. Copy results in your preferred format

## Export Formats

- **CSS `linear-gradient()`** — Ready for `background-image`
- **Tailwind CSS** — `bg-gradient-to-r [color1% color2%...]` arbitrary value syntax
- **JSON Array** — `["#color1", "#color2", ...]`
- **CSV** — Comma-separated hex values
- **JS Const** — `const colors = ["#color1", "#color2", ...];`
- **CSS Variables** — `--color-0: #color1; --color-1: #color2; ...`

## Technical Details

### OKLab Conversion
Based on Björn Ottosson's OKLab color space (2020):
- sRGB → linear RGB → LMS cone space → OKLab
- Perceptually uniform: equal distances = equal perceived differences
- No hue shifts, no gray muddying in gradients

### HSL Interpolation
- Uses shortest-path hue interpolation (avoids going the long way around the color wheel)
- Linear interpolation of saturation and lightness

### sRGB Interpolation
- Simple linear interpolation of R, G, B channels
- Can produce desaturated midpoints for complementary colors

## Example Use Cases

- **UI Design**: Create consistent color scales for design systems
- **Data Visualization**: Generate sequential/diverging color palettes
- **CSS Gradients**: Quick gradient background generation
- **Theme Building**: Create light/dark mode color pairs
- **Color Theory**: Explore color relationships in different spaces