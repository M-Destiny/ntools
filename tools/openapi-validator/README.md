# OpenAPI Validator

Validate OpenAPI 3.x and Swagger 2.0 specifications with detailed error reporting and best practice warnings.

## Features

- **Multi-format support**: Validate both JSON and YAML specifications
- **Comprehensive validation**: Checks OpenAPI version, info object, paths, operations, responses, parameters, components, servers, and security schemes
- **Error categorization**: Separates critical errors from best-practice warnings
- **Example loader**: Built-in sample specification for testing

## Validation Rules

### Required Fields
- `openapi` (3.x) or `swagger` (2.0) version field
- `info` object with `title` and `version`

### Paths & Operations
- At least one path defined
- Each operation (GET, POST, PUT, etc.) must have responses defined
- Parameters must have `name` and `in` fields

### Components
- Schema objects with `type: object` should have `properties` or `additionalProperties`
- Security schemes referenced in `security` must be defined in `components/securitySchemes`

### Best Practices (Warnings)
- Server definitions provided
- OpenAPI 3.x version (not 2.0/Swagger)
- Response content schemas defined

## Usage

1. Select input format (JSON or YAML)
2. Paste your OpenAPI/Swagger specification
3. Click **Validate**
4. Review errors and warnings
5. Copy results if needed

## Example

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "Sample API",
    "version": "1.0.0"
  },
  "servers": [{ "url": "https://api.example.com/v1" }],
  "paths": {
    "/users": {
      "get": {
        "summary": "List users",
        "responses": {
          "200": { "description": "Success" }
        }
      }
    }
  }
}
```

## Technical Details

- Built with React + TypeScript
- Runs entirely in-browser (no server calls)
- Uses custom YAML parser (for production, integrate `js-yaml`)
- Follows OpenAPI 3.0.3 specification structure