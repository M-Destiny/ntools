# CSV to JSON Converter

Convert CSV data to JSON with automatic type detection, customizable delimiters, and multiple output formats.

## Features

- **Auto type detection** — Numbers, booleans (`true`/`false`), and `null` values are automatically converted
- **RFC 4180 compliant** — Properly handles quoted fields, escaped quotes, embedded delimiters, and newlines
- **Customizable delimiter** — Comma, semicolon, tab, or pipe
- **Header handling** — Option to treat first row as headers or generate column names
- **Multiple output formats** — Array of objects or JSON Lines (NDJSON)
- **Copy & download** — One-click copy to clipboard or download as `.json` file

## Usage

1. Paste CSV data into the input area
2. Configure options (delimiter, headers, output format)
3. View JSON output in real-time
4. Copy or download the result

## Example

**Input CSV:**
```csv
id,name,email,age,active,score
1,John Doe,john@example.com,30,true,95.5
2,Jane Smith,jane@example.com,25,false,87.2
```

**Output JSON:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30,
    "active": true,
    "score": 95.5
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "age": 25,
    "active": false,
    "score": 87.2
  }
]
```