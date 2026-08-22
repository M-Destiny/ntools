# CSV to SQL

## Description
Convert CSV data to SQL INSERT statements with optional CREATE TABLE statement. Supports automatic type inference, custom delimiters, and proper SQL escaping.

## Usage
```tsx
import CsvToSql from './tools/csv-to-sql';
```

## Features
- [x] Convert CSV to SQL INSERT statements
- [x] Optional CREATE TABLE with inferred column types
- [x] Automatic type inference (INTEGER, REAL, BOOLEAN, TEXT)
- [x] Custom delimiters (comma, semicolon, tab, pipe)
- [x] Proper SQL escaping for single quotes
- [x] Handles quoted fields with embedded delimiters
- [x] NULL handling for empty values
- [x] Copy to clipboard functionality
- [x] Example data loading

## Development
```bash
npm run dev
```