# CSS Shadow Generator

A visual tool to create complex CSS box-shadow effects with multiple layers. Build everything from subtle depth to neon glows and brutalist shadows.

## Features

- **Multi-layer shadows** - Stack multiple shadow layers for complex effects
- **Real-time preview** - See changes instantly on a live preview box
- **Preset library** - 10 built-in presets: Subtle, Medium, Elevated, Floating, Inner Shadow, Neon Glow, Brutalist, Soft Depth, Long Shadow
- **Full control** - Adjust X/Y offset, blur, spread, color, opacity, and inset per layer
- **Copy CSS** - One-click copy of generated `box-shadow` CSS
- **Layer management** - Add, remove, duplicate, and reorder layers

## Usage

1. Select a preset or start with "Custom"
2. Adjust shadow parameters using the sliders and color pickers
3. Add more layers with "+ Add Layer" for complex effects
4. Watch the live preview update in real-time
5. Click "Copy CSS" to copy the generated `box-shadow` property

## Technical Details

- Built with React + TypeScript
- Generates standard CSS `box-shadow` syntax
- Supports multiple comma-separated shadow layers
- Handles `inset` keyword for inner shadows
- Converts hex colors to rgba with opacity
- No external dependencies
- Client-side only

## Shadow Layer Properties

| Property | Range | Description |
|----------|-------|-------------|
| X Offset | -50 to 50px | Horizontal shadow offset |
| Y Offset | -50 to 50px | Vertical shadow offset |
| Blur | 0 to 100px | Blur radius |
| Spread | -20 to 20px | Spread distance (positive expands, negative contracts) |
| Color | Any hex | Shadow color |
| Opacity | 0% to 100% | Shadow transparency |
| Inset | Boolean | Inner shadow instead of outer |

## Example Output

```css
box-shadow: 
  0px 4px 6px 0px rgba(0, 0, 0, 0.1),
  0px 10px 15px -3px rgba(0, 0, 0, 0.1);
```