# Gradient Generator

A beautiful CSS gradient generator supporting linear, radial, and conic gradients with live preview and export.

## Features

- **Three Gradient Types** - Linear, Radial, and Conic gradients
- **Interactive Color Stops** - Add, remove, and position color stops with precision
- **Color Picker Integration** - Native browser color picker for each stop
- **Position Control** - Slider and numeric input for exact stop positioning (0-100%)
- **Angle Control** - Degree slider with preset angles for linear/conic gradients
- **Live Preview** - Real-time gradient preview with generated CSS code overlay
- **9 Built-in Presets** - Sunset, Ocean, Forest, Fire, Violet, Rainbow, Radial Sunset, Radial Neon, Conic Pie
- **Random Generator** - One-click random gradient generation
- **Export Options** - Copy CSS to clipboard or download as .css file
- **Color Palette** - Extracted palette showing all colors with hex values and positions

## Usage

1. Select gradient type: Linear, Radial, or Conic
2. For Linear/Conic: Adjust angle using slider or preset buttons
3. Add color stops using "+ Add Color Stop" (max 10)
4. For each stop: pick color, adjust position (0-100%)
5. Click presets for instant beautiful gradients
6. Click "Random" for surprise gradients
7. Copy CSS or download .css file

## Gradient Types

### Linear Gradient
- Direction controlled by angle (0-180°)
- Default: 90° (top to bottom)
- Common angles: 0° (left→right), 45°, 90°, 135°, 180° (right→left)

### Radial Gradient
- Circular gradient from center outward
- No angle control (radiates evenly)
- Great for vignettes, spotlights, backgrounds

### Conic Gradient
- Rotating color wheel around center
- Angle controls rotation offset (0-360°)
- Perfect for pie charts, color wheels, loading spinners

## Presets Included

| Preset | Type | Description |
|--------|------|-------------|
| Sunset | Linear | Warm coral to pink gradient |
| Ocean | Linear | Deep blue to bright cyan |
| Forest | Linear | Dark teal to mint green |
| Fire | Linear | Red to golden yellow |
| Violet | Linear | Purple to deep violet |
| Rainbow | Linear | Full spectrum 7-color rainbow |
| Radial Sunset | Radial | Coral center fading to peach |
| Radial Neon | Radial | Cyan center to electric blue |
| Conic Pie | Conic | 4-color pie chart segments |

## Output Format

Generated CSS includes:
```css
.gradient {
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
  /* Fallback for older browsers */
  background: #3b82f6;
}
```

Usage:
```html
<div class="gradient"></div>
```

## Technical Details

Built with React + TypeScript. Uses native CSS gradient syntax. No external dependencies. Compatible with all modern browsers (linear/radial: IE10+, conic: Chrome 69+, Firefox 83+, Safari 14+).