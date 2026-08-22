# json-to-go

## Description
json-to-go - Convert JSON to Go structs with JSON tags, pointer options, and nested types.

## Usage
```tsx
import JsonToGo from './tools/json-to-go';
```

## Features
- Convert JSON to Go structs with proper type inference
- Configurable package name and root struct name
- Optional JSON tags with omitempty for nullable fields
- Optional pointers for nullable fields
- Nested struct generation
- Array type handling (int, int64, float64, string, bool)
- Copy output to clipboard
- Load example JSON

## Development
```bash
npm run dev
```