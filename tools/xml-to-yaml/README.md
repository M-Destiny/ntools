# xml-to-yaml

## Description
Convert XML documents to YAML format with configurable parsing options. Supports attribute handling, array detection, and whitespace trimming.

## Usage
```tsx
import XmlToYaml from './tools/xml-to-yaml';
```

## Features
- Convert XML to YAML with one click
- Configurable parsing options (trim, explicitArray, ignoreAttrs, mergeAttrs)
- Load example XML to test
- Copy output to clipboard
- Real-time conversion
- Error handling with descriptive messages

## Options
- **Trim whitespace**: Remove leading/trailing whitespace from text nodes
- **Explicit arrays**: Always wrap child elements in arrays
- **Include attributes**: Parse XML attributes as properties
- **Merge attributes**: Merge attributes into the parent object

## Development
```bash
npm run dev
```