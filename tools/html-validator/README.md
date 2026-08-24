# html-validator

## Description
html-validator - Validate HTML5 markup for syntax errors, accessibility issues, and best practices. Check compliance with W3C standards.

## Usage
```tsx
import HtmlValidator from './tools/html-validator';
```

## Features
- Validates HTML5 syntax using browser's DOMParser
- Detects parser errors and malformed markup
- Checks for duplicate IDs
- Validates required attributes (alt on img, lang on html, etc.)
- Warns about deprecated/obsolete elements (font, center, strike, etc.)
- Accessibility checks (missing labels, missing alt text)
- Best practice warnings (viewport meta, charset, DOCTYPE)
- Statistics: element count, attribute count, max nesting depth
- Built-in example documents (valid, invalid, complex)
- Error and warning listings with copy to clipboard
- Real-time validation on demand

## Development
```bash
npm run dev
```