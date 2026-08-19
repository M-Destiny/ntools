# JSON to CSV Converter

A developer tool for converting JSON arrays or objects to CSV format with support for nested object flattening.

## Features

- **Convert JSON to CSV** - Supports arrays and single objects
- **Flatten Nested Objects** - Automatically flattens nested objects using dot notation (e.g., `address.city`)
- **Custom Delimiters** - Comma, semicolon, tab, or pipe
- **Header Options** - Include or exclude header row
- **RFC 4180 Compliant** - Properly escapes fields with commas, quotes, newlines
- **Copy/Download** - Copy CSV output or download as `.csv` file
- **Load Example** - Quick start with sample JSON data

## Usage

1. Paste JSON in the input pane (array or single object)
2. Configure delimiter, headers, and flattening options
3. View CSV output in real-time
4. Copy or download the result

## Options

| Option | Description |
|--------|-------------|
| Delimiter | Field separator: comma, semicolon, tab, or pipe |
| Include Headers | Add column header row to output |
| Flatten Nested | Convert nested objects to dot-notation columns |

## Flattening Behavior

- Nested objects → dot notation keys (`address.street`, `address.city`)
- Arrays of primitives → semicolon-separated values
- Arrays of objects → JSON stringified
- Null/undefined → empty cells

## Example Input

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "zip": "94102"
    },
    "tags": ["developer", "designer"],
    "active": true
  }
]
```

## Example Output (flattened, comma-delimited)

```csv
id,name,email,address.street,address.city,address.zip,tags,active
1,John Doe,john@example.com,123 Main St,San Francisco,94102,"developer; designer",true
```