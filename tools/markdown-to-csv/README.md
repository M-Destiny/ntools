# Markdown to CSV Converter

Convert Markdown table to CSV format with configurable options.

## Features

- Parse Markdown tables with proper alignment handling
- Configurable delimiter (comma, semicolon, tab, pipe)
- Option to treat first row as header
- Copy to clipboard or download as .csv file
- Sample data for quick testing

## Usage

1. Paste Markdown table into the input area
2. Configure options (header row, delimiter)
3. Click "Convert to CSV"
4. Copy or download the result

## Example

**Input:**
```markdown
| name       | age | city       | email                |
| :---       | :---: | ---:       | :---                 |
| John Doe   | 30  | New York   | john@example.com     |
| Jane Smith | 25  | Los Angeles| jane@example.com     |
```

**Output:**
```csv
name,age,city,email
John Doe,30,New York,john@example.com
Jane Smith,25,Los Angeles,jane@example.com
```