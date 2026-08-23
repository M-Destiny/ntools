# CSV to Markdown Converter

Convert CSV data to Markdown table format with configurable options.

## Features

- Parse CSV with proper quote handling
- Configurable alignment (left, center, right)
- Option to treat first row as header
- Copy to clipboard or download as .md file
- Sample data for quick testing

## Usage

1. Paste CSV data into the input area
2. Configure options (header row, alignment)
3. Click "Convert to Markdown"
4. Copy or download the result

## Example

**Input:**
```csv
name,age,city,email
John Doe,30,New York,john@example.com
Jane Smith,25,Los Angeles,jane@example.com
```

**Output:**
```markdown
| name       | age | city       | email                |
| :---       | :---: | ---:       | :---                 |
| John Doe   | 30  | New York   | john@example.com     |
| Jane Smith | 25  | Los Angeles| jane@example.com     |
```