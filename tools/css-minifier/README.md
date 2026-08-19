# CSS Minifier

A tool to minify CSS by removing comments, whitespace, and optimizing syntax to reduce file size for faster loading.

## Features

- Removes all comments (`/* ... */`)
- Removes unnecessary whitespace and newlines
- Removes trailing semicolons before `}`
- Shortens 6-digit hex colors to 3 digits when possible (`#ff0000` → `#f00`)
- Removes units for zero values (`0px` → `0`)
- Removes leading zeros from decimals (`0.5` → `.5`)
- Removes empty rules
- Preserves all functional CSS (selectors, properties, values)
- Preserves `@media`, `@keyframes`, `@supports` rules
- Preserves CSS custom properties (variables)
- Preserves `calc()` expressions
- Preserves URLs and font-face declarations

## Usage

1. Paste your CSS into the input textarea
2. The minified output appears automatically in the output panel
3. Click "Copy Minified" to copy the result to clipboard
4. Use "Load Example" to see a sample

## Best Practices

- Keep original CSS for development; use minified for production
- Use source maps in production for debugging
- Combine with gzip/brotli compression for best results
- Run minification as part of your build process

## Implementation

Built with React + TypeScript. The minification logic is implemented in pure JavaScript using regex transformations.