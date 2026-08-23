# xml-to-csv

## Description
Convert XML data to CSV format with configurable options. This tool parses XML input and extracts data from repeated row elements to generate CSV output.

## Usage
```tsx
import XmlToCsv from './tools/xml-to-csv';
```

## Features
- Parses XML using DOMParser
- Configurable row selector (CSS selector)
- Multiple delimiter options (comma, semicolon, tab, pipe)
- Optional header row
- CSV escaping for values containing delimiters, quotes, or newlines
- Copy to clipboard and download functionality
- Sample data for quick testing

## Options
- **Row Selector**: CSS selector for row elements (default: "row")
- **Delimiter**: Field separator - Comma, Semicolon, Tab, or Pipe
- **Include header row**: Whether to include column names as first row

## Development
```bash
npm run dev
```

## Example

Input XML:
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

Output CSV:
```csv
name,age,city,email
John Doe,30,New York,john@example.com
Jane Smith,25,Los Angeles,jane@example.com
```