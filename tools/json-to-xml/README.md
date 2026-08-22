# JSON to XML

## Description
Convert JSON to XML with configurable root element, attribute prefix, array item naming, and pretty printing. Supports JSON attributes via configurable prefix.

## Usage
```tsx
import JsonToXml from './tools/json-to-xml';
```

## Features
- [x] Convert JSON to well-formed XML
- [x] Configurable root element name
- [x] Configurable array item element name
- [x] Attribute support via configurable prefix (e.g., `@attr` becomes XML attribute)
- [x] Optional XML declaration
- [x] Pretty print with indentation
- [x] Automatic XML name sanitization
- [x] Proper XML escaping (&, <, >, ", ')
- [x] Handles null values with xsi:nil
- [x] Copy to clipboard functionality
- [x] Example data loading

## Development
```bash
npm run dev
```