# yaml-to-xml

## Description
Convert YAML documents to XML format with configurable output options. Supports custom root elements, pretty printing, headless mode, and XML declarations.

## Usage
```tsx
import YamlToXml from './tools/yaml-to-xml';
```

## Features
- Convert YAML to XML with one click
- Configurable output options (root name, pretty print, headless, XML declaration)
- Load example YAML to test
- Copy output to clipboard
- Real-time conversion
- Error handling with descriptive messages

## Options
- **Root Element Name**: Custom name for the root XML element
- **Pretty print**: Format output with indentation and newlines
- **Headless**: Output without a root wrapper element
- **Include XML declaration**: Add `<?xml version="1.0" encoding="UTF-8"?>` header

## Development
```bash
npm run dev
```