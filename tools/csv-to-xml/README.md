# csv-to-xml

## Description
Convert CSV data to XML format with configurable options. This tool parses CSV input (including quoted fields and commas within fields) and generates well-formed XML output.

## Usage
```tsx
import CsvToXml from './tools/csv-to-xml';
```

## Features
- Handles quoted CSV fields with embedded commas and newlines
- Configurable root and row element names
- Optional header row detection
- XML entity escaping
- Copy to clipboard and download functionality
- Sample data for quick testing

## Options
- **Root Element**: Name of the root XML element (default: "root")
- **Row Element**: Name of each row element (default: "row")
- **First row is header**: Whether to treat the first CSV row as column headers

## Development
```bash
npm run dev
```

## Example

Input CSV:
```csv
name,age,city,email
John Doe,30,New York,john@example.com
Jane Smith,25,Los Angeles,jane@example.com
```

Output XML:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <row>
    <name>John Doe</name>
    <age>30</age>
    <city>New York</city>
    <email>john@example.com</email>
  </row>
  <row>
    <name>Jane Smith</name>
    <age>25</age>
    <city>Los Angeles</city>
    <email>jane@example.com</email>
  </row>
</root>
```