# JSON Validator & Formatter

A tool to validate, format, and prettify JSON data.

## Features

- **Real-time validation** - Validates JSON as you type
- **Syntax error detection** - Shows helpful error messages for invalid JSON
- **Pretty printing** - Formats JSON with 2-space indentation
- **Copy to clipboard** - One-click copy of formatted JSON
- **Example templates** - Built-in valid, invalid, and complex JSON examples

## Usage

1. Paste your JSON into the left panel
2. The tool automatically validates and shows results in the right panel
3. If valid, click "Copy Formatted" to copy the prettified JSON
4. Use example buttons to test with sample data

## Technical Details

- Built with React + TypeScript
- Uses native `JSON.parse()` and `JSON.stringify()` for validation/formatting
- No external dependencies
- Client-side only - your data never leaves the browser