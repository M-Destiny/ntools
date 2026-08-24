# OpenAPI to TypeScript

## Description
OpenAPI to TypeScript - Convert OpenAPI 3.x specifications to TypeScript interfaces, type aliases, or Zod validation schemas with full support for complex schemas, enums, arrays, and nested objects.

## Usage
```tsx
import OpenApiToTypescript from './tools/openapi-to-typescript';
```

## Features
- Parse OpenAPI 3.x JSON specifications
- Generate TypeScript interfaces, type aliases, or Zod schemas
- Support for all OpenAPI data types and formats (uuid, email, date-time, uri, etc.)
- Handle complex schemas: allOf, anyOf, oneOf, nullable, arrays, nested objects
- Enum support: union types or TypeScript enums
- Optional property strategies: `?` or `| undefined`
- Readonly properties for required fields
- Zod schema generation with validation rules (min/max, pattern, etc.)
- Copy output to clipboard
- Download as .ts file
- Load example OpenAPI spec

## Development
```bash
npm run dev
```

## Dependencies
- React 19
- TypeScript
- Zod (optional, for Zod output format)