# json-schema-validator

## Description
json-schema-validator - Validate JSON data against JSON Schema (Draft 7). Check compliance, find errors, and test schemas with examples.

## Usage
```tsx
import JsonSchemaValidator from './tools/json-schema-validator';
```

## Features
- Validates JSON against JSON Schema Draft 7
- Supports type, required, properties, patternProperties, additionalProperties validation
- Array validation (items, minItems, maxItems, uniqueItems, tuple validation)
- String validation (minLength, maxLength, pattern, format, enum)
- Number validation (minimum, maximum, exclusiveMinimum, exclusiveMaximum, integer)
- Format validation (email, date-time, date, time, uuid, uri, ipv4, ipv6)
- Enum and const validation
- Built-in example schemas (User, Product, API Response)
- Auto-generate example JSON from schema
- Error listing with path context
- Copy errors to clipboard

## Development
```bash
npm run dev
```