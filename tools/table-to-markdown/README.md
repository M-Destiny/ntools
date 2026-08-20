# table-to-markdown

## Description
table-to-markdown - Convert CSV, TSV, JSON arrays, HTML tables, or Excel data (CSV export) to Markdown tables.

## Usage
```tsx
import TableToMarkdown from './tools/table-to-markdown';
```

## Features
- CSV with custom delimiters (comma, semicolon, pipe, tab)
- TSV (Tab Separated Values)
- JSON arrays of objects
- HTML table extraction (first table found)
- Excel data via CSV export
- Handles quoted fields and escaped quotes in CSV
- Header row detection (toggleable)
- Copy to clipboard