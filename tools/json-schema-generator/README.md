# JSON Schema Generator

A visual builder for creating JSON Schema (Draft 7) documents with support for nested objects, arrays, enums, and validation rules.

## Features

- **Visual schema builder**: Drag-and-drop style interface for defining fields
- **Nested structures**: Support for objects and arrays with child fields
- **All JSON Schema types**: string, number, integer, boolean, array, object, null
- **Validation rules**: Required fields, min/max length, min/max values, regex patterns, enums
- **Default values**: Set default values for any field type
- **Live preview**: Real-time JSON/YAML output as you build
- **Export**: Copy to clipboard or download as .json or .yaml
- **Example templates**: Pre-built schemas to get started quickly

## Supported Field Types

| Type | Description | Constraints |
|------|-------------|-------------|
| string | Text values | minLength, maxLength, pattern (regex), enum, format |
| number | Floating point numbers | minimum, maximum, default |
| integer | Whole numbers | minimum, maximum, multipleOf: 1, default |
| boolean | true/false | default |
| array | Lists of values | minItems, maxItems, items schema |
| object | Nested objects | properties, required fields, additionalProperties |
| null | Null values | - |

## String Formats

- date, date-time, email, uuid, uri, ipv4, ipv6, hostname, json-pointer, regex

## Usage

1. **Add fields** using the "+ Add Root Field" button or "+" on object/array fields for nested children
2. **Configure each field**: name, type, required, description, and type-specific constraints
3. **Set schema metadata**: title, version, description
4. **View output**: Real-time JSON or YAML in the output panel
5. **Export**: Copy to clipboard or download as file

## Field Configuration

### String Fields
- **Enum values**: Comma-separated list (e.g., `light, dark, auto`)
- **Pattern**: Regular expression for validation
- **Min/Max length**: Character limits
- **Default**: Default string value

### Number/Integer Fields
- **Minimum/Maximum**: Numeric bounds
- **Default**: Default numeric value

### Boolean Fields
- **Default**: `true` or `false`

### Array Fields
- **Items**: Define the schema for array items (add child field)
- **Min/Max items**: Array length constraints

### Object Fields
- **Properties**: Add child fields for nested properties
- **Required**: Mark child fields as required

## Example: User Profile Schema

The built-in example creates a schema for:
- Basic user info (id, username, email, age, isActive)
- Tags array
- Nested address object
- Nested preferences object with enums

## Output Formats

- **JSON**: Standard JSON Schema format
- **YAML**: Human-readable YAML (useful for config files)

## Technical Details

- Built with React 19 + TypeScript
- Generates Draft 7 JSON Schema (`$schema: http://json-schema.org/draft-07/schema#`)
- No external schema libraries - pure implementation
- Handles circular references and deep nesting
- Validates generated schema before export

## Use Cases

- API request/response validation
- Configuration file schemas
- Form validation schemas
- Database document validation
- OpenAPI/Swagger component schemas
- Data interchange agreements