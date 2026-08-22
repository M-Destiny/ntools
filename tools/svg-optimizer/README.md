# SVG Optimizer

## Description
A tool to optimize and minify SVG files by removing unnecessary data, minifying styles, optimizing paths, and applying various compression techniques. Helps reduce SVG file sizes while preserving visual fidelity.

## Usage
```tsx
import SVGOptimizer from './tools/svg-optimizer';
```

## Features
- **22 optimization options** covering:
  - Comment & metadata removal
  - Empty/hidden element cleanup
  - Style minification
  - Color conversion (named colors, rgb() to hex)
  - Path data optimization
  - Transform optimization
  - Numeric value rounding
  - Group collapsing
  - Shape to path conversion
  - ID cleanup & minification
  - Namespace cleanup
- Real-time preview of optimized SVG
- Statistics showing original vs optimized size and reduction percentage
- Copy to clipboard / Download optimized SVG
- Sample SVG for testing

## Optimization Options
| Option | Description |
|--------|-------------|
| removeComments | Strip all XML comments |
| removeMetadata | Remove <metadata>, <title>, <desc> |
| removeUselessDefs | Remove unreferenced <defs> elements |
| removeEmptyAttrs | Remove attributes with empty values |
| removeHiddenElems | Remove display="none" / visibility="hidden" elements |
| removeEmptyText | Remove empty text elements |
| removeEmptyContainers | Remove empty <g>, <svg> containers |
| minifyStyles | Minify CSS in <style> and style attributes |
| convertColors | Convert rgb(), named colors to hex |
| convertPathData | Optimize path data commands and coordinates |
| convertTransform | Optimize transform matrices |
| removeUnknownsAndDefaults | Remove unknown elements & default attributes |
| removeNonInheritableGroupAttrs | Remove non-inheritable group attributes |
| removeUselessStrokeAndFill | Remove ineffective stroke/fill |
| removeUnusedNS | Remove unused namespace declarations |
| cleanupIDs | Minify IDs, remove unused references |
| cleanupNumericValues | Round numeric values to 3 decimal places |
| moveElemsAttrsToGroup | Move common attributes to parent group |
| moveGroupAttrsToElems | Move group attributes to children |
| collapseGroups | Remove unnecessary wrapper groups |
| convertShapeToPath | Convert basic shapes to paths |
| convertEllipseToCircle | Convert equal-radius ellipses to circles |

## Development
```bash
npm run dev
```

## Technical Details
This is a client-side SVG optimizer implemented in TypeScript/React. It uses regex-based transformations to apply various optimization techniques. For production use, consider using SVGO (Node.js) which provides more comprehensive optimization.